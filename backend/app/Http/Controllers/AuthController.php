<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
private function resolveProfilePictureUrl(?string $profilePicture): ?string
{
    if (!$profilePicture) {
        return null;
    }

    if (str_starts_with($profilePicture, 'http://') || str_starts_with($profilePicture, 'https://')) {
        return $profilePicture;
    }

    return asset("storage/{$profilePicture}");
}

private function uploadProfilePicture($file): string
{
    $cloudName = env('CLOUDINARY_CLOUD_NAME');
    $apiKey = env('CLOUDINARY_API_KEY');
    $apiSecret = env('CLOUDINARY_API_SECRET');

    if (!$cloudName || !$apiKey || !$apiSecret) {
        throw new \RuntimeException('Cloudinary credentials are missing.');
    }

    try {
        $timestamp = time();
        $folder = 'cabinet_management/profiles';
        $signatureBase = "folder={$folder}&timestamp={$timestamp}{$apiSecret}";
        $signature = sha1($signatureBase);

        $endpoint = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";
        $postFields = [
            'file' => new \CURLFile($file->getRealPath()),
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'folder' => $folder,
            'signature' => $signature,
        ];

        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        // Temporary workaround for local Windows OpenSSL CA chain issues.
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $responseBody = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($responseBody === false || $curlError) {
            throw new \RuntimeException('Cloudinary cURL error: ' . $curlError);
        }

        $decoded = json_decode($responseBody, true);
        if ($httpCode >= 400 || !isset($decoded['secure_url'])) {
            $message = $decoded['error']['message'] ?? 'Unknown Cloudinary error';
            throw new \RuntimeException("Cloudinary upload failed ({$httpCode}): {$message}");
        }

        return $decoded['secure_url'];
    } catch (\Throwable $e) {
        Log::error('Cloudinary profile upload failed', [
            'message' => $e->getMessage(),
            'realPath_exists' => method_exists($file, 'getRealPath') ? (bool) $file->getRealPath() : null,
            'originalName' => method_exists($file, 'getClientOriginalName') ? $file->getClientOriginalName() : null,
        ]);

        throw new \RuntimeException('Failed to upload profile image to Cloudinary: ' . $e->getMessage(), 0, $e);
    }
}

private function getRoleData(User $user)
{
    return match($user->role) {
        'doctor'             => $user->doctor ? $user->doctor->load('privateCabinet') : null,
        'clinic'             => $user->clinic,
        'collective_cabinet' => $user->collectiveCabinet,
        'patient'            => $user->patient,
        'secretary'          => $user->secretary,   // ← includes doctor_id, private_cabinet_id, etc.
        default              => null,
    };
}
    public function register(Request $request)
{
    try {
        // 1. Validate common fields
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:patient,doctor,clinic,collective_cabinet',
            'gender' => 'required|in:male,female',
            'city' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'phone_number' => 'required|string|regex:/^\+?[0-9]{9,15}$/',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // 2. Role-specific validation
        if ($request->role === 'doctor') {
            $request->validate([
                'speciality' => 'required|string|max:255',
                'documents' => 'nullable|array',
                'documents.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120',
            ]);
        }

        if (in_array($request->role, ['clinic', 'collective_cabinet'])) {
            $request->validate([
                'clinic_name' => 'required_if:role,clinic|string|max:255',
                'cabinet_name' => 'required_if:role,collective_cabinet|string|max:255',
                'speciality' => 'required|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'medical_license' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'national_id' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',  
            ]);
        }

        // 3. Upload profile picture
        $profilePath = $request->hasFile('profile_picture')
            ? $this->uploadProfilePicture($request->file('profile_picture'))
            : null;

        // 4. Store documents
        $storeDocuments = function ($files) {
            $paths = [];
            if ($files && is_array($files)) {
                foreach ($files as $file) {
                    $paths[] = $file->store('documents', 'public');
                }
            }
            return $paths ?: null;
        };

        // 5. Transaction
        $user = DB::transaction(function () use ($request, $profilePath, $storeDocuments) {

            $user = User::create([
                'name' => trim($request->name),
                'email' => strtolower(trim($request->email)),
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'gender' => $request->gender,
                'city' => trim($request->city),
                'address' => trim($request->address),
                'date_of_birth' => $request->date_of_birth,
                'phone_number' => trim($request->phone_number),
                'profile_picture' => $profilePath,
            ]);

            switch ($request->role) {
                case 'patient':
                    $user->patient()->create([]);
                    break;

                case 'doctor':
                    $user->doctor()->create([
                        'speciality' => trim($request->speciality),
                        'is_verified' => false,
                        'is_active' => false,
                        'documents' => [
                        'medical_license' => $request->file('medical_license')?->store('documents', 'public'),
                        'national_id' => $request->file('national_id')?->store('documents', 'public'),
                    ],
                    ]);
                    break;

                case 'clinic':
                    $user->clinic()->create([
                        'name' => trim($request->clinic_name),
                        'speciality' => trim($request->speciality),
                        'city' => trim($request->clinic_city ?? $request->city),
                        'address' => trim($request->clinic_address ?? $request->address),
                        'latitude' => $request->latitude,
                        'longitude' => $request->longitude,
                        'is_verified' => false,
                        'is_active' => false,
                        'documents' => [
                            'medical_license' => $request->file('medical_license')?->store('documents', 'public'),
                            'national_id' => $request->file('national_id')?->store('documents', 'public'),
                        ],
                    ]);
                    break;

                case 'collective_cabinet':
                    $user->collectiveCabinet()->create([
                        'name' => trim($request->cabinet_name),
                        'speciality' => trim($request->speciality),
                        'city' => trim($request->cabinet_city ?? $request->city),
                        'address' => trim($request->cabinet_address ?? $request->address),
                        'latitude' => $request->latitude,
                        'longitude' => $request->longitude,
                        'is_verified' => false,
                        'is_active' => true,
                        'documents' => [
                            'medical_license' => $request->file('medical_license')?->store('documents', 'public'),
                            'national_id' => $request->file('national_id')?->store('documents', 'public'),
                        ],
                    ]);
                    break;
            }

            return $user;
        });

        // 6. Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Notify Admins about new registration if it's a professional
        if (in_array($user->role, ['doctor', 'clinic', 'collective_cabinet'])) {
            $roleLabel = match($user->role) {
                'doctor' => 'Médecin',
                'clinic' => 'Clinique',
                'collective_cabinet' => 'Cabinet Collectif',
            };
            \App\Services\NotificationService::notifyAdmins(
                'Nouvelle inscription',
                "Un nouveau compte ({$roleLabel}) a été créé par {$user->name} et nécessite votre vérification.",
                'system',
                ['user_id' => $user->id]
            );
        }

        // 7. Response with role_data
        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_picture' => $user->profile_picture
                    ? $this->resolveProfilePictureUrl($user->profile_picture)
                    : null,
                'role_data' => $this->getRoleData($user),
            ],
            'token' => $token,
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'error' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Registration failed',
            'message' => $e->getMessage(),
        ], 500);
    }
}

public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|string|min:8',
    ]);

    $user = User::where('email', strtolower(trim($request->email)))->first(); 
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    // Role-based active and verification check
    if (in_array($user->role, ['doctor', 'clinic', 'collective_cabinet'])) {
        $profile = match($user->role) {
            'doctor' => $user->doctor,
            'clinic' => $user->clinic,
            'collective_cabinet' => $user->collectiveCabinet,
        };

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profile not found.'
            ], 404);
        }

        if (!$profile->is_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is pending admin approval. You will be notified once verified.'
            ], 403);
        }
    }

    // Generate token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_picture' => $user->profile_picture
                ? $this->resolveProfilePictureUrl($user->profile_picture)
                : null,
            'role'=>$user->role,
            'role_data'=>$this->getRoleData($user),
        ],
        'token' => $token 
    ], 200);
}
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'success' => true,
        'message' => 'Logged out successfully'
    ], 200);
}

public function updateProfile(Request $request)
{
    $user = Auth::user();
    
    $request->validate([
        'name' => 'sometimes|string|max:255',
        'phone_number' => 'sometimes|string|max:20',
        'city' => 'sometimes|string|max:100',
        'address' => 'sometimes|string|max:255',
        'gender' => 'sometimes|in:male,female',
        'date_of_birth' => 'sometimes|date',
        'speciality' => 'sometimes|string|max:255',
        'profile_picture' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Handle Profile Picture
    if ($request->hasFile('profile_picture')) {
        $user->profile_picture = $this->uploadProfilePicture($request->file('profile_picture'));
    }

    $user->fill($request->only(['name', 'phone_number', 'city', 'address', 'gender', 'date_of_birth']));
    $user->save();

    // Handle Doctor Speciality
    if ($user->role === 'doctor' && $request->has('speciality')) {
        $user->doctor()->update(['speciality' => $request->speciality]);
    }

    return response()->json([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'city' => $user->city,
            'address' => $user->address,
            'gender' => $user->gender,
            'date_of_birth' => $user->date_of_birth,
            'role' => $user->role,
            'profile_picture' => $user->profile_picture
                ? $this->resolveProfilePictureUrl($user->profile_picture)
                : null,
            'role_data' => $this->getRoleData($user),
        ]
    ]);
}
}
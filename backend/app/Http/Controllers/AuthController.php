<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AuthController extends Controller
{


private function getRoleData(User $user)
{
    return match($user->role) {
        'doctor' => $user->doctor,
        'clinic' => $user->clinic,
        'collective_cabinet' => $user->collectiveCabinet,
        'patient' => $user->patient,
        default => null,
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
                'speciality' => 'required|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'medical_license' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'national_id' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',  
            ]);
        }

        // 3. Upload profile picture
        $profilePath = $request->hasFile('profile_picture')
            ? $request->file('profile_picture')->store('profile_pictures', 'public')
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
                        'is_active' => true,
                        'documents' => [
                        'medical_license' => $request->file('medical_license')?->store('documents', 'public'),
                        'national_id' => $request->file('national_id')?->store('documents', 'public'),
                    ],
                    ]);
                    break;

                case 'clinic':
                    $user->clinic()->create([
                        'speciality' => trim($request->speciality),
                        'city' => trim($request->clinic_city ?? $request->city),
                        'address' => trim($request->clinic_address ?? $request->address),
                        'latitude' => $request->latitude,
                        'longitude' => $request->longitude,
                        'is_verified' => false,
                        'is_active' => true,
                        'documents' => $storeDocuments($request->file('documents')),
                    ]);
                    break;

                case 'collective_cabinet':
                    $user->collectiveCabinet()->create([
                        'speciality' => trim($request->speciality),
                        'city' => trim($request->cabinet_city ?? $request->city),
                        'address' => trim($request->cabinet_address ?? $request->address),
                        'latitude' => $request->latitude,
                        'longitude' => $request->longitude,
                        'is_verified' => false,
                        'is_active' => true,
                        'documents' => $storeDocuments($request->file('documents')),
                    ]);
                    break;
            }

            return $user;
        });

        // 6. Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

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
                    ? asset("storage/{$user->profile_picture}") 
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

    // Role-based active check
    if (in_array($user->role, ['doctor', 'clinic', 'collective_cabinet'])) {
        $profile = match($user->role) {
            'doctor' => $user->doctor,
            'clinic' => $user->clinic,
            'collective_cabinet' => $user->collectiveCabinet,
        };

        if (!$profile || !$profile->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is not active. Please contact support.'
            ], 403);
        }

      /*  // Optional
        if ($profile->subscriptions()->where('status', 'active')->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Your subscription has expired. Please renew to login.'
            ], 403);
        }*/
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
                ? asset("storage/{$user->profile_picture}") 
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
}
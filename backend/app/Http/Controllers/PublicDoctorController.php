<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;

class PublicDoctorController extends Controller
{
    /**
     * Display a listing of doctors who have a private cabinet.
     */
    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        $favoriteIds = [];
        if ($user && $user->role === 'patient' && $user->patient) {
            $favoriteIds = \App\Models\FavoriteDoctor::where('patient_id', $user->patient->id)
                ->pluck('doctor_id')
                ->toArray();
        }

        $query = Doctor::with(['user', 'privateCabinet'])
            ->whereHas('privateCabinet')
            ->where('is_verified', true);

        // 🔹 Search Filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($u) use ($search) {
                    $u->where('name', 'LIKE', "%{$search}%");
                })
                ->orWhere('speciality', 'LIKE', "%{$search}%");
            });
        }

        // 🔹 Specialty Filter (for categories)
        if ($request->has('specialty')) {
            $query->where('speciality', 'LIKE', "%{$request->specialty}%");
        }

        $doctors = $query->get()
            ->map(function ($doctor) use ($favoriteIds) {
                return [
                    'id' => (string) $doctor->id,
                    'user_id' => (string) $doctor->user_id,
                    'name' => $doctor->user->name,
                    'email' => $doctor->user->email,
                    'specialty' => $doctor->speciality ?? 'General Doctor',
                    'gender' => $doctor->user->gender,
                    'city' => $doctor->user->city,
                    'address' => $doctor->user->address,
                    'date_of_birth' => $doctor->user->date_of_birth,
                    'phone_number' => $doctor->user->phone_number,
                    'profile_picture' => $doctor->user->profile_picture 
                        ? (str_starts_with($doctor->user->profile_picture, 'http') 
                            ? $doctor->user->profile_picture 
                            : asset('storage/' . $doctor->user->profile_picture))
                        : null,
                    'rating' => '4.9', // Hardcoded for now until review system is added
                    'reviews' => '12', // Hardcoded
                    'distance' => '2.5 km', // Hardcoded
                    'experience' => '10 years', // Hardcoded
                    'patients' => '500+', // Hardcoded
                    'fee' => $doctor->privateCabinet->consultation_price 
                        ? '$' . $doctor->privateCabinet->consultation_price 
                        : '$50',
                    'about' => $doctor->privateCabinet->bio ?? 'No bio available.',
                    'hospital' => $doctor->privateCabinet->name,
                    'cabinet_id' => (string) $doctor->privateCabinet->id,
                    'cabinet_type' => 'private',
                    'is_verified' => (bool) $doctor->is_verified,
                    'is_active' => (bool) $doctor->is_active,
                    'is_available' => $doctor->wallet_balance > 0,
                    'is_favorite' => in_array($doctor->id, $favoriteIds),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $doctors
        ]);
    }
}

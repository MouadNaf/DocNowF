<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\FavoriteDoctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Get list of favorite doctors for the logged-in patient.
     */
    public function index()
    {
        $user = Auth::user();
        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Only patients have favorites.'], 403);
        }

        $favorites = FavoriteDoctor::with(['doctor.user', 'doctor.privateCabinet'])
            ->where('patient_id', $user->patient->id)
            ->get()
            ->map(function ($f) {
                $doctor = $f->doctor;
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
                    'rating' => '4.9',
                    'reviews' => '12',
                    'distance' => '2.5 km',
                    'experience' => '10 years',
                    'patients' => '500+',
                    'fee' => $doctor->privateCabinet->consultation_price 
                        ? '$' . $doctor->privateCabinet->consultation_price 
                        : '$50',
                    'about' => $doctor->privateCabinet->bio ?? 'No bio available.',
                    'hospital' => $doctor->privateCabinet->name,
                    'cabinet_id' => (string) $doctor->privateCabinet->id,
                    'cabinet_type' => 'private',
                    'latitude' => $doctor->privateCabinet->latitude,
                    'longitude' => $doctor->privateCabinet->longitude,
                    'is_verified' => (bool) $doctor->is_verified,
                    'is_active' => (bool) $doctor->is_active,
                    'is_favorite' => true,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }

    /**
     * Toggle a doctor in/out of favorites.
     */
    public function toggle(Request $request)
    {
        $request->validate(['doctor_id' => 'required|exists:doctors,id']);
        
        $user = Auth::user();
        if ($user->role !== 'patient') {
            return response()->json(['message' => 'Only patients can like doctors.'], 403);
        }

        $patientId = $user->patient->id;
        $doctorId  = $request->doctor_id;

        $favorite = FavoriteDoctor::where('patient_id', $patientId)
            ->where('doctor_id', $doctorId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json([
                'success' => true,
                'message' => 'Doctor removed from favorites.',
                'is_favorite' => false
            ]);
        } else {
            FavoriteDoctor::create([
                'patient_id' => $patientId,
                'doctor_id'  => $doctorId
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Doctor added to favorites!',
                'is_favorite' => true
            ]);
        }
    }
}

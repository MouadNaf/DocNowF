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
            ->where('is_verified', true)
            ->where('wallet_balance', '>', 0);

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

        // 🔹 Wilaya (City) Filter — filter by cabinet city
        if ($request->filled('wilaya')) {
            $wilaya = $request->wilaya;
            $query->whereHas('privateCabinet', function ($q) use ($wilaya) {
                $q->where('city', $wilaya);
            });
        }

        $doctors = $query->get()
            ->map(function ($doctor) use ($favoriteIds) {
                $lat  = $doctor->privateCabinet->latitude;
                $lon  = $doctor->privateCabinet->longitude;

                return [
                    'id'              => (string) $doctor->id,
                    'user_id'         => (string) $doctor->user_id,
                    'name'            => $doctor->user->name,
                    'email'           => $doctor->user->email,
                    'specialty'       => $doctor->speciality ?? 'General Doctor',
                    'gender'          => $doctor->user->gender,
                    'city'            => $doctor->privateCabinet->city ?? $doctor->user->city,
                    'address'         => $doctor->user->address,
                    'date_of_birth'   => $doctor->user->date_of_birth,
                    'phone_number'    => $doctor->user->phone_number,
                    'profile_picture' => $doctor->user->profile_picture
                        ? (str_starts_with($doctor->user->profile_picture, 'http')
                            ? $doctor->user->profile_picture
                            : asset('storage/' . $doctor->user->profile_picture))
                        : null,
                    'rating'          => '4.9',
                    'reviews'         => '12',
                    'distance'        => '2.5 km',
                    'experience'      => '10 years',
                    'patients'        => '500+',
                    'fee'             => $doctor->privateCabinet->consultation_price
                        ? 'dz' . $doctor->privateCabinet->consultation_price
                        : 'dz50',
                    'about'           => $doctor->privateCabinet->bio ?? 'No bio available.',
                    'hospital'        => $doctor->privateCabinet->name,
                    'cabinet_id'      => (string) $doctor->privateCabinet->id,
                    'cabinet_type'    => 'private',
                    'latitude'        => $lat,
                    'longitude'       => $lon,
                    'is_verified'     => (bool) $doctor->is_verified,
                    'is_active'       => (bool) $doctor->is_active,
                    'is_available'    => $doctor->wallet_balance > 0,
                    'is_favorite'     => in_array($doctor->id, $favoriteIds),
                    '_lat'            => (float) $lat,
                    '_lon'            => (float) $lon,
                ];
            });

        // 🔹 Sort by distance to wilaya center (Haversine) when a wilaya is selected
        if ($request->filled('wilaya') && $request->filled('ref_lat') && $request->filled('ref_lon')) {
            $refLat = (float) $request->ref_lat;
            $refLon = (float) $request->ref_lon;

            $doctors = $doctors->sortBy(function ($d) use ($refLat, $refLon) {
                if (!$d['_lat'] || !$d['_lon']) return PHP_INT_MAX;
                return $this->haversine($refLat, $refLon, $d['_lat'], $d['_lon']);
            })->values();

            // Inject km distance string into each result
            $doctors = $doctors->map(function ($d) use ($refLat, $refLon) {
                if ($d['_lat'] && $d['_lon']) {
                    $km = $this->haversine($refLat, $refLon, $d['_lat'], $d['_lon']);
                    $d['distance'] = round($km, 1) . ' km';
                }
                unset($d['_lat'], $d['_lon']);
                return $d;
            });
        } else {
            // Remove internal sorting fields
            $doctors = $doctors->map(function ($d) {
                unset($d['_lat'], $d['_lon']);
                return $d;
            });
        }

        return response()->json([
            'success' => true,
            'data'    => $doctors->values(),
        ]);
    }

    /**
     * Return a distinct list of all wilaya (city) names that have a cabinet.
     */
    public function wilayas()
    {
        $cities = \App\Models\PrivateCabinet::select('city')
            ->distinct()
            ->whereNotNull('city')
            ->orderBy('city')
            ->pluck('city');

        return response()->json([
            'success' => true,
            'data'    => $cities,
        ]);
    }

    /**
     * Haversine formula — returns distance in km between two GPS coordinates.
     */
    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R = 6371; // Earth radius in km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}

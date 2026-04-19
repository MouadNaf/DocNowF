<?php

namespace App\Http\Controllers;

use App\Models\PrivateCabinet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\DoctorAvailability;
use App\Models\DoctorUnavailability;
use App\Models\Secretary;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PrivateCabinetController extends Controller
{
   public function show()
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) {
        return response()->json(['error' => 'Doctor not found'], 404);
      }


        $cabinet = PrivateCabinet::with(['appointments', 'doctorAvailabilities', 'doctorUnavailabilities', 'secretaries', 'subscriptions'])
            ->where('doctor_id', $doctor->id)
            ->first();

        if (!$cabinet) {
            return response()->json([
                'success' => false,
                'message' => 'Private cabinet not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'cabinet' => $cabinet
        ]);
    }

    public function store(Request $request){
        $request->validate([
            'name'=>'required|string|max:255',
            'city'=>'required|string|max:255',
            'address'=>'required|string|max:255',
            'latitude'=>'nullable|numeric|between:-90,90',
            'longitude'=>'nullable|numeric|between:-180,180',
            'documents'=>'nullable|array',
            'documents.*'=>'file|mimes:pdf,jpg,jpeg,png|max:5120',
            'slot_duration'=>'nullable|integer|min:5|max:120',
            'consultation_price'=>'nullable|numeric|min:0',
        ]);
        $doctor = Auth::user()->doctor;
        if($doctor->privateCabinet){
            return response()->json([
                'success'=>true,
                'message' =>'You already have a private cabinet.'   
             ],400);
        }
        $storeDocuments = function ($files) {
            $paths = [];
            if ($files && is_array($files)) {
                foreach ($files as $file) {
                    $paths[] = $file->store('documents', 'public');
                }
            }
            return $paths ?: null;
        };
        $cabinet = DB::transaction(function () use ($request, $doctor, $storeDocuments) {
            return PrivateCabinet::create([
                'doctor_id' => $doctor->id,
                'name' => $request->name,
                'city' => $request->city,
                'address' => $request->address,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'is_active' => true,
                'is_verified' => false,
                'documents' => $storeDocuments($request->file('documents')),
                'slot_duration' => $request->slot_duration ?? 30,
                'consultation_price' => $request->consultation_price ?? null,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Private cabinet created successfully.',
            'cabinet' => $cabinet
        ], 201);

    }

    public function update(Request $request, PrivateCabinet $privateCabinet)
{
    $request->validate([
        'name' => 'sometimes|string|max:255',
        'city' => 'sometimes|string|max:100',
        'address' => 'sometimes|string|max:255',
        'latitude' => 'sometimes|numeric|between:-90,90',
        'longitude' => 'sometimes|numeric|between:-180,180',
        'slot_duration' => 'sometimes|integer|min:5|max:120',
        'consultation_price' => 'sometimes|numeric|min:0',
    ]);

    $doctor = Auth::user()->doctor;
    if ($privateCabinet->doctor_id !== $doctor->id) {
    return response()->json(['error' => 'Unauthorized'], 403); 
}

    // Only update safe fields
    $privateCabinet->update($request->only([
        'name', 'city', 'address', 'latitude', 'longitude', 'slot_duration', 'consultation_price'
    ]));

    return response()->json([
        'success' => true,
        'message' => 'Private cabinet updated successfully',
        'data' => $privateCabinet
    ], 200);
}

 public function destroy()
    {
        $doctor = Auth::user()->doctor;
        $cabinet = $doctor->privateCabinet;

        if (!$cabinet) {
            return response()->json([
                'success' => false,
                'message' => 'Private cabinet not found.'
            ], 404);
        }

        $cabinet->delete();

        return response()->json([
            'success' => true,
            'message' => 'Private cabinet deleted successfully.'
        ]);
    }
    public function getAppointments()
    {
        $doctor = Auth::user()->doctor;
        $cabinet = $doctor->privateCabinet;

        if (!$cabinet) {
            return response()->json([
                'success' => false,
                'message' => 'Private cabinet not found.'
            ], 404);
        }

        $appointments = $cabinet->appointments()->with('patient', 'doctor')->get();
        return response()->json([
            'success' => true,
            'appointments' => $appointments
        ]);     
}
public function getAvailabilities()
    {
        $doctor = Auth::user()->doctor;
        $cabinet = $doctor->privateCabinet;

        if (!$cabinet) {
            return response()->json([
                'success' => false,
                'message' => 'Private cabinet not found.'
            ], 404);
        }

        $availabilities = $cabinet->doctorAvailabilities()->get();
        return response()->json([
            'success' => true,
            'availabilities' => $availabilities
        ]);

}
public function getSecretaries()
{
    $doctor = Auth::user()->doctor;
    $cabinet = $doctor->privateCabinet;

    if (!$cabinet) {
        return response()->json(['message' => 'Private cabinet not found'], 404);
    }

    $secretaries = $cabinet->secretaries()->with('user')->get();

    return response()->json([
        'success' => true,
        'secretaries' => $secretaries
    ]);
}
public function getUnavailabilities()
    {
        $doctor = Auth::user()->doctor;
        $cabinet = $doctor->privateCabinet;

        if (!$cabinet) {
            return response()->json([
                'success' => false,
                'message' => 'Private cabinet not found.'
            ], 404);
        }

        $unavailabilities = $cabinet->doctorUnavailabilities()->get();
        return response()->json([
            'success' => true,
            'unavailabilities' => $unavailabilities
        ]);
}



public function createAvailability(Request $request)
{
    $request->validate([
        'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
        'start_time' => 'required|date_format:H:i',
        'end_time' => 'required|date_format:H:i|after:start_time',
    ]);

    $user = Auth::user();

    // 🔹 Get doctor (doctor OR secretary)
    if ($user->role === 'doctor') {
        $doctor = $user->doctor;
    } elseif ($user->role === 'secretary') {
        $doctor = $user->secretary->doctor;
    } else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if (!$doctor) {
        return response()->json(['message' => 'Doctor not found'], 404);
    }

    // 🔹 Get private cabinet
    $cabinet = $doctor->privateCabinet;

    if (!$cabinet) {
        return response()->json([
            'success' => false,
            'message' => 'Private cabinet not found.'
        ], 404);
    }

    // 🔹 Create availability
    $availability = DoctorAvailability::create([
        'doctor_id' => $doctor->id,
        'clinic_id' => null,
        'collective_cabinet_id' => null,
        'private_cabinet_id' => $cabinet->id,
        'day_of_week' => strtolower($request->day_of_week),
        'start_time' => $request->start_time,
        'end_time' => $request->end_time,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Availability created successfully.',
        'availability' => $availability
    ], 201);
}
public function deleteAvailability($id)
{
    $user = Auth::user();

    // 🔹 Get doctor (doctor OR secretary)
    if ($user->role === 'doctor') {
        $doctor = $user->doctor;
    } elseif ($user->role === 'secretary') {
        $doctor = $user->secretary->doctor;
    } else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $availability = DoctorAvailability::find($id);

    if (!$availability) {
        return response()->json([
            'success' => false,
            'message' => 'Availability not found'
        ], 404);
    }

    // 🔒 Security check
    if ($availability->doctor_id !== $doctor->id) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 403);
    }

    $availability->delete();

    return response()->json([
        'success' => true,
        'message' => 'Availability deleted successfully'
    ]);
}
public function updateAvailability(Request $request, $id)
{
    $request->validate([
        'day_of_week' => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
        'start_time' => 'sometimes|date_format:H:i',
        'end_time' => 'sometimes|date_format:H:i|after:start_time',
    ]);

    $user = Auth::user();

    // 🔹 Get doctor (doctor OR secretary)
    if ($user->role === 'doctor') {
        $doctor = $user->doctor;
    } elseif ($user->role === 'secretary') {
        $doctor = $user->secretary->doctor;
    } else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $availability = DoctorAvailability::find($id);

    if (!$availability) {
        return response()->json([
            'success' => false,
            'message' => 'Availability not found'
        ], 404);
    }

    // 🔒 Security check
    if ($availability->doctor_id !== $doctor->id) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 403);
    }

    $availability->update($request->only([
        'day_of_week',
        'start_time',
        'end_time'
    ]));

    return response()->json([
        'success' => true,
        'message' => 'Availability updated successfully',
        'data' => $availability
    ]);
}
public function createUnavailability(Request $request)
{
    $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'start_time' => 'nullable|date_format:H:i',
        'end_time' => 'nullable|date_format:H:i|after:start_time',
        'reason' => 'nullable|string|max:255',
    ]);

    $user = Auth::user();

    // 🔹 Get doctor (doctor OR secretary)
    if ($user->role === 'doctor') {
        $doctor = $user->doctor;
    } elseif ($user->role === 'secretary') {
        $doctor = $user->secretary->doctor;
    } else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    if (!$doctor) {
        return response()->json(['message' => 'Doctor not found'], 404);
    }

    $cabinet = $doctor->privateCabinet;

    if (!$cabinet) {
        return response()->json([
            'success' => false,
            'message' => 'Private cabinet not found'
        ], 404);
    }

    $unavailability = DoctorUnavailability::create([
        'doctor_id' => $doctor->id,
        'private_cabinet_id' => $cabinet->id,
        'clinic_id' => null,
        'collective_cabinet_id' => null,
        'start_date' => $request->start_date,
        'end_date' => $request->end_date,
        'start_time' => $request->start_time,
        'end_time' => $request->end_time,
        'reason' => $request->reason,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Unavailability created successfully',
        'data' => $unavailability
    ], 201);
}

public function updateUnavailability(Request $request, $id)
{
    $request->validate([
        'start_date' => 'sometimes|date',
        'end_date' => 'sometimes|date|after_or_equal:start_date',
        'start_time' => 'nullable|date_format:H:i',
        'end_time' => 'nullable|date_format:H:i|after:start_time',
        'reason' => 'nullable|string|max:255',
    ]);

    $user = Auth::user();

    // 🔹 Get doctor (doctor OR secretary)
    if ($user->role === 'doctor') {
        $doctor = $user->doctor;
    } elseif ($user->role === 'secretary') {
        $doctor = $user->secretary->doctor;
    } else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $unavailability = DoctorUnavailability::find($id);

    if (!$unavailability || $unavailability->doctor_id !== $doctor->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $unavailability->update($request->only([
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'reason'
    ]));

    return response()->json([
        'success' => true,
        'data' => $unavailability
    ]);
}

public function deleteUnavailability($id)
{
    $user = Auth::user();

    // 🔹 Get doctor (doctor OR secretary)
    if ($user->role === 'doctor') {
        $doctor = $user->doctor;
    } elseif ($user->role === 'secretary') {
        $doctor = $user->secretary->doctor;
    } else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $unavailability = DoctorUnavailability::find($id);

    if (!$unavailability || $unavailability->doctor_id !== $doctor->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $unavailability->delete();

    return response()->json([
        'success' => true,
        'message' => 'Deleted successfully'
    ]);
}

public function createSecretary(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
        'gender' => 'required|in:male,female',
        'phone_number' => 'required|string|max:10',
    ]);

    // Get the doctor of the logged-in user
    $doctor = Auth::user()->doctor;

    if (!$doctor) {
        return response()->json([
            'success' => false,
            'message' => 'Doctor not found'
        ], 404);
    }

    // Create secretary inside a transaction
    $secretary = DB::transaction(function () use ($request, $doctor) {

        // 1. Create the user
        $user = User::create([
            'name' => trim($request->name),
            'email' => strtolower(trim($request->email)),
            'password' => Hash::make($request->password),
            'role' => 'secretary',
            'gender' => $request->gender,
            'phone_number' => trim($request->phone_number),
            'address' => $request->address,
            'city' => $request->city,
            'date_of_birth' => $request->date_of_birth,
        ]);

        // 2. Create secretary profile linked to the doctor
        return Secretary::create([
            'user_id' => $user->id,
            'doctor_id' => $doctor->id,
        ]);
    });

    return response()->json([
        'success' => true,
        'message' => 'Secretary created successfully',
        'data' => $secretary->load('user')
    ], 201);
}
public function deleteSecretary($id)
{
    $doctor = Auth::user()->doctor;

    if (!$doctor) {
        return response()->json([
            'success' => false,
            'message' => 'Doctor not found'
        ], 404);
    }

    $cabinet = $doctor->privateCabinet;

    $secretary = $cabinet->secretaries()->find($id);

    if (!$secretary) {
        return response()->json([
            'success' => false,
            'message' => 'Secretary not found'
        ], 404);
    }

    
    $secretary->delete();
    $secretary->user()->delete();

    return response()->json([
        'success' => true,
        'message' => 'Secretary deleted successfully'
    ]);
}

public function getSubscription()
{
    $doctor = Auth::user()->doctor;
    $cabinet = $doctor->privateCabinet;
    
    if (!$cabinet) {
        return response()->json(['message' => 'Cabinet not found'], 404);
    }
    
    $subscription = $cabinet->subscriptions()
        ->where('status', 'active')
        ->first();
    
    return response()->json([
        'success' => true,
        'subscription' => $subscription
    ]);
}


}
//scheduale 

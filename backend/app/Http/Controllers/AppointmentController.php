<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\DoctorAvailability;
use App\Models\DoctorUnavailability;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class AppointmentController extends Controller
{
    public function generateSlots($doctorId, $date, $cabinetType, $cabinetId)
{
    // 1. Fetch Doctor
    $doctor = Doctor::with(['user', 'clinics', 'collectiveCabinets', 'privateCabinet'])
        ->find($doctorId);

    if (!$doctor) {
        return response()->json(['success' => false, 'message' => 'Doctor not found'], 404);
    }

    // 2. Get slot duration + location filter
    $slotDuration = null;
    $locationFilter = [];

    switch ($cabinetType) {
        case 'private':
            $cabinet = $doctor->privateCabinet;
            if (!$cabinet || $cabinet->id != $cabinetId) {
                return response()->json(['message' => 'Private cabinet not found'], 404);
            }
            $slotDuration = $cabinet->slot_duration;
            $locationFilter = ['private_cabinet_id' => $cabinetId];
            break;

        case 'clinic':
            $pivot = $doctor->clinics()->where('clinic_id', $cabinetId)->first();
            if (!$pivot) {
                return response()->json(['message' => 'Doctor not assigned to this clinic'], 404);
            }
            $slotDuration = $pivot->pivot->slot_duration;
            $locationFilter = ['clinic_id' => $cabinetId];
            break;

        case 'collective':
            $pivot = $doctor->collectiveCabinets()->where('collective_cabinet_id', $cabinetId)->first();
            if (!$pivot) {
                return response()->json(['message' => 'Doctor not assigned to this collective cabinet'], 404);
            }
            $slotDuration = $pivot->pivot->slot_duration;
            $locationFilter = ['collective_cabinet_id' => $cabinetId];
            break;

        default:
            return response()->json(['message' => 'Invalid cabinet type'], 400);
    }

    if (!$slotDuration) {
        return response()->json(['message' => 'Slot duration not configured'], 400);
    }

    // 3. Get availabilities
    $dayOfWeek = strtolower(Carbon::parse($date)->format('l'));

    $availabilities = DoctorAvailability::where('doctor_id', $doctor->id)
        ->where('day_of_week', $dayOfWeek)
        ->get();

    if ($availabilities->isEmpty()) {
        return response()->json([
            'success' => true,
            'message' => 'No availability scheduled',
            'slots' => []
        ]);
    }

    // 4. Generate slots (FIXED - no duplicates)
$slots = [];

foreach ($availabilities as $availability) {

    $start = Carbon::parse($availability->start_time, 'Africa/Algiers');
    $end = Carbon::parse($availability->end_time, 'Africa/Algiers');

    $cursor = $start->copy();

    while ($cursor->lt($end)) {

        $nextSlot = $cursor->copy()->addMinutes($slotDuration);

        if ($nextSlot->lte($end)) {

            // 🔥 UNIQUE KEY to prevent duplicates
            $key = $cursor->format('H:i') . '-' . $nextSlot->format('H:i');

            $slots[$key] = [
                'start' => $cursor->format('H:i'),
                'end'   => $nextSlot->format('H:i'),
            ];
        }

        $cursor->addMinutes($slotDuration);
    }
}

// convert associative array → normal array
$slots = array_values($slots);

    // 5. Get booked slots
    $bookedStartTimes = Appointment::where('doctor_id', $doctor->id)
        ->whereDate('appointment_date', $date)
        ->where($locationFilter)
        ->whereIn('status', ['confirmed', 'completed'])
        ->pluck('start_time')
        ->map(fn($time) => Carbon::parse($time)->format('H:i'))
        ->toArray();

    // 6. Get unavailability
    $unavailabilities = DoctorUnavailability::where('doctor_id', $doctor->id)
        ->whereDate('start_date', '<=', $date)
        ->whereDate('end_date', '>=', $date)
        ->get();

    // 7. Filter slots
    $now = Carbon::now('Africa/Algiers');
    $isToday = Carbon::parse($date)->isToday();

    $availableSlots = array_filter($slots, function ($slot) use (
        $bookedStartTimes,
        $unavailabilities,
        $isToday,
        $now,
        $cabinetType,
        $cabinetId
    ) {
        $slotStart = Carbon::parse($slot['start'], 'Africa/Algiers');
        $slotEnd = Carbon::parse($slot['end'], 'Africa/Algiers');

        // A. Remove past slots
        if ($isToday && $slotStart->lte($now)) {
            return false;
        }

        // B. Remove booked slots
        if (in_array($slotStart->format('H:i'), $bookedStartTimes)) {
            return false;
        }

        // C. Remove unavailability overlap (FIXED)
        foreach ($unavailabilities as $u) {

            $isGlobal = !$u->private_cabinet_id && !$u->clinic_id && !$u->collective_cabinet_id;

            $matchesLocation = match ($cabinetType) {
                'private' => $u->private_cabinet_id == $cabinetId,
                'clinic' => $u->clinic_id == $cabinetId,
                'collective' => $u->collective_cabinet_id == $cabinetId,
                default => false
            };

            $unavailStart = Carbon::parse($u->start_time, 'Africa/Algiers');
            $unavailEnd   = Carbon::parse($u->end_time, 'Africa/Algiers');

            // 🔥 TRUE overlap only (NOT touching edges)
            if (
                $slotStart->lt($unavailEnd) &&
                $slotEnd->gt($unavailStart)
            ) {
                if (
                    !$slotStart->equalTo($unavailEnd) &&
                    !$slotEnd->equalTo($unavailStart)
                ) {
                    if ($isGlobal || $matchesLocation) {
                        return false;
                    }
                }
            }
        }

        return true;
    });

    return response()->json([
        'success' => true,
        'data' => [
            'doctor_name' => $doctor->user->name,
            'date' => $date,
            'location_type' => $cabinetType,
            'slots' => array_values($availableSlots),
        ]
    ]);
}


    public function store(Request $request)
{
    $request->validate([
        'doctor_id' => 'required|exists:doctors,id',
        'appointment_date' => 'required|date',
        'start_time' => 'required|date_format:H:i',
        'cabinet_type' => 'required|in:private,clinic,collective',
        'cabinet_id' => 'required|integer',
        'patient_id' => 'nullable|exists:patients,id',
    ]);

    $doctor = Doctor::find($request->doctor_id);
    if (!$doctor) {
        return response()->json(['message' => 'Doctor not found'], 404);
    }

    // 🔹 Identify patient
    if (Auth::user()->role === 'patient') {
        $patientId = Auth::user()->patient->id;
    } else {
        if (!$request->patient_id) {
            return response()->json(['message' => 'patient_id required'], 400);
        }
        $patientId = $request->patient_id;
    }

    // 🔹 Validate slot using your slot generator
    $slotsResponse = $this->generateSlots(
        $request->doctor_id,
        $request->appointment_date,
        $request->cabinet_type,
        $request->cabinet_id
    );

    $slotsData = $slotsResponse->getData(true);

    $validSlot = collect($slotsData['data']['slots'] ?? [])
        ->firstWhere('start', $request->start_time);

    if (!$validSlot) {
        return response()->json([
            'message' => 'Selected slot is not available'
        ], 400);
    }

    // 🔹 Location mapping
    $locationData = [
        'private_cabinet_id' => null,
        'clinic_id' => null,
        'collective_cabinet_id' => null,
    ];

    match ($request->cabinet_type) {
        'private' => $locationData['private_cabinet_id'] = $request->cabinet_id,
        'clinic' => $locationData['clinic_id'] = $request->cabinet_id,
        'collective' => $locationData['collective_cabinet_id'] = $request->cabinet_id,
    };

    // 🔥 🔥 IMPORTANT FIX: reuse cancelled appointment
    $cancelledAppointment = Appointment::where('doctor_id', $doctor->id)
        ->whereDate('appointment_date', $request->appointment_date)
        ->where('start_time', $request->start_time)
        ->where($locationData)
        ->where('status', 'cancelled')
        ->first();

    if ($cancelledAppointment) {
        $cancelledAppointment->update([
            'patient_id' => $patientId,
            'status' => 'confirmed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment reused successfully',
            'data' => $cancelledAppointment
        ], 200);
    }

    try {
        // 🔹 Create new appointment
        $appointment = DB::transaction(function () use ($doctor, $patientId, $request, $locationData) {
            return Appointment::create([
                'doctor_id' => $doctor->id,
                'patient_id' => $patientId,
                'appointment_date' => $request->appointment_date,
                'start_time' => $request->start_time,
                'status' => 'confirmed',
                ...$locationData
            ]);
        });

    } catch (\Illuminate\Database\QueryException $e) {
        return response()->json([
            'message' => 'This slot is already booked (race condition)'
        ], 400);
    }

    return response()->json([
        'success' => true,
        'message' => 'Appointment created successfully',
        'data' => $appointment
    ], 201);
}




public function cancel(Request $request, $appointmentId)
{
    $user = Auth::user();
    $appointment = Appointment::find($appointmentId);

    if (!$appointment) {
        return response()->json(['message' => 'Appointment not found'], 404);
    }

    // 🔹 Doctor can cancel his own appointments
    if ($user->role === 'doctor') {
        if ($appointment->doctor_id !== $user->doctor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    // 🔹 Patient can cancel his own appointments
    elseif ($user->role === 'patient') {
        if ($appointment->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    // 🔥 Secretary can cancel ONLY doctor’s appointments
    elseif ($user->role === 'secretary') {
        if ($appointment->doctor_id !== $user->secretary->doctor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    // 🔹 Prevent cancelling already cancelled
    if ($appointment->status === 'cancelled') {
        return response()->json([
            'message' => 'Appointment already cancelled'
        ], 400);
    }

    // 🔹 Update appointment
    $appointment->update([
        'status' => 'cancelled',
        'cancellation_reason' => $request->reason,
        'cancelled_at' => now(),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Appointment cancelled successfully'
    ]);
}


//show for appointment details with patient and doctor info
public function show($appointmentId)
{
    $user = Auth::user();

    $appointment = Appointment::with(['patient.user', 'doctor.user'])
        ->find($appointmentId);

    if (!$appointment) {
        return response()->json(['message' => 'Appointment not found'], 404);
    }

    // 🔹 Doctor
    if ($user->role === 'doctor') {
        if ($appointment->doctor_id !== $user->doctor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    // 🔹 Secretary
    elseif ($user->role === 'secretary') {
        if ($appointment->doctor_id !== $user->secretary->doctor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    // 🔹 Patient
    elseif ($user->role === 'patient') {
        if ($appointment->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }

    return response()->json([
        'success' => true,
        'data' => $appointment
    ]);
}




public function index(Request $request)
{
    $user = Auth::user();

    $query = Appointment::with(['patient.user', 'doctor.user']);

    // 🔹 Doctor
    if ($user->role === 'doctor') {
        $query->where('doctor_id', $user->doctor->id);
    }

    // 🔹 Secretary
    elseif ($user->role === 'secretary') {
        $query->where('doctor_id', $user->secretary->doctor_id);
    }

    // 🔹 Patient
    elseif ($user->role === 'patient') {
        $query->where('patient_id', $user->patient->id);
    }

    // 🔥 Optional filters

    // Filter by date
    if ($request->has('date')) {
        $query->whereDate('appointment_date', $request->date);
    }

    // Filter today
    if ($request->has('today') && $request->today == true) {
        $query->whereDate('appointment_date', now()->toDateString());
    }

    // 🔹 Order (important)
    $appointments = $query
        ->orderBy('appointment_date', 'asc')
        ->orderBy('start_time', 'asc')
        ->get();

    return response()->json([
        'success' => true,
        'count' => $appointments->count(),
        'data' => $appointments
    ]);
}

public function getDoctorDashboard(Request $request)
{
    $user = Auth::user();

    // 🔹 Get doctor id (doctor OR secretary)
    if ($user->role === 'doctor') {
        $doctorId = $user->doctor->id;
    } elseif ($user->role === 'secretary') {
        $doctorId = $user->secretary->doctor_id;
    } else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // 🔹 Validate input
    $request->validate([
        'date' => 'nullable|date'
    ]);

    $today = now()->toDateString();

    /*
    |--------------------------------------------------------------------------
    | FILTER BY SPECIFIC DATE
    |--------------------------------------------------------------------------
    */
    if ($request->filled('date')) {

        $appointments = Appointment::with(['patient.user'])
            ->where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $request->date)
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'mode' => 'date',
            'date' => $request->date,
            'count' => $appointments->count(),
            'data' => $appointments
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD VIEW
    |--------------------------------------------------------------------------
    */

    // 🔹 Today
    $todayAppointments = Appointment::with(['patient.user'])
        ->where('doctor_id', $doctorId)
        ->whereDate('appointment_date', $today)
        ->orderBy('start_time')
        ->get();

    // 🔹 Upcoming
    $upcomingAppointments = Appointment::with(['patient.user'])
        ->where('doctor_id', $doctorId)
        ->whereDate('appointment_date', '>', $today)
        ->orderBy('appointment_date')
        ->orderBy('start_time')
        ->limit(10)
        ->get();

    // 🔹 Past
    $pastAppointments = Appointment::with(['patient.user'])
        ->where('doctor_id', $doctorId)
        ->whereDate('appointment_date', '<', $today)
        ->orderByDesc('appointment_date')
        ->orderByDesc('start_time')
        ->limit(10)
        ->get();

    return response()->json([
        'success' => true,
        'mode' => 'dashboard',
        'data' => [

            'today_count' => $todayAppointments->count(),
            'today' => $todayAppointments,

            'upcoming_count' => $upcomingAppointments->count(),
            'upcoming' => $upcomingAppointments,

            'past_count' => $pastAppointments->count(),
            'past' => $pastAppointments,
        ]
    ]);
}


    }
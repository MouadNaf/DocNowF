<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
   public function store(Request $request, $appointmentId)
{
    $request->validate([
        'base_price' => 'required|numeric|min:0',
        'items' => 'nullable|array',
        'items.*.service_name' => 'required_with:items|string|max:255',
        'items.*.price' => 'required_with:items|numeric|min:0',
    ]);

    // 🔹 Auth doctor
    $doctor = Auth::user()->doctor;
    if (!$doctor) {
        return response()->json(['message' => 'Doctor not found'], 404);
    }

    // 🔹 Get appointment
    $appointment = Appointment::find($appointmentId);

    if (!$appointment || $appointment->doctor_id !== $doctor->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    //  Auto mark appointment as completed
    if ($appointment->status !== 'completed') {
        $appointment->update(['status' => 'completed']);
    }

    //  Prevent duplicate consultation
    if ($appointment->consultation) {
        return response()->json([
            'message' => 'Consultation already exists'
        ], 400);
    }

    // 🔹 Transaction
    $consultation = DB::transaction(function () use ($request, $appointment) {

        $extraFees = collect($request->items ?? [])->sum('price');
        $totalPrice = $request->base_price + $extraFees;

        // Create consultation
        $consultation = Consultation::create([
            'appointment_id' => $appointment->id,
            'base_price' => $request->base_price,
            'extra_fees' => $extraFees,
            'total_price' => $totalPrice,
        ]);

        // Add items
        foreach ($request->items ?? [] as $item) {
            $consultation->consultationItems()->create([
                'service_name' => $item['service_name'],
                'price' => $item['price'],
            ]);
        }

        return $consultation;
    });

    return response()->json([
        'success' => true,
        'message' => 'Consultation created and appointment completed',
        'data' => $consultation->load('consultationItems')
    ], 201);
}

    public function show($appointmentId)
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $appointment = Appointment::find($appointmentId);
        if (!$appointment || $appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // ✅ Use relationship
        $consultation = $appointment->consultation()->with('consultationItems')->first();

        if (!$consultation) {
            return response()->json(['message' => 'Consultation not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $consultation
        ]);
    }

    public function update(Request $request, $appointmentId)
{
    $request->validate([
        'base_price' => 'sometimes|numeric|min:0',
        'items' => 'nullable|array',
        'items.*.service_name' => 'required_with:items|string|max:255',
        'items.*.price' => 'required_with:items|numeric|min:0',
    ]);

    $doctor = Auth::user()->doctor;
    if (!$doctor) {
        return response()->json(['message' => 'Doctor not found'], 404);
    }

    $appointment = Appointment::find($appointmentId);
    if (!$appointment || $appointment->doctor_id !== $doctor->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $consultation = $appointment->consultation;
    if (!$consultation) {
        return response()->json(['message' => 'Consultation not found'], 404);
    }

    $consultation = DB::transaction(function () use ($request, $consultation) {
        
        // Update base price if provided
        if ($request->has('base_price')) {
            $consultation->base_price = $request->base_price;
        }

        // Delete old items if new items provided
        if ($request->has('items')) {
            $consultation->consultationItems()->delete();
            
            $extraFees = collect($request->items)->sum('price');
            
            // Add new items
            foreach ($request->items as $item) {
                $consultation->consultationItems()->create([
                    'service_name' => $item['service_name'],
                    'price' => $item['price'],
                ]);
            }
        } else {
            // If no new items, keep existing
            $extraFees = $consultation->consultationItems()->sum('price');
        }

        // Update totals
        $consultation->extra_fees = $extraFees;
        $consultation->total_price = $consultation->base_price + $extraFees;
        $consultation->save();

        return $consultation;
    });

    return response()->json([
        'success' => true,
        'message' => 'Consultation updated successfully',
        'data' => $consultation->load('consultationItems')
    ], 200);
}

    public function destroy($appointmentId)
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $appointment = Appointment::find($appointmentId);
        if (!$appointment || $appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // ✅ Use relationship
        $consultation = $appointment->consultation;
        if (!$consultation) {
            return response()->json(['message' => 'Consultation not found'], 404);
        }

        // ✅ Delete items first
        $consultation->consultationItems()->delete();
        $consultation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Consultation deleted successfully'
        ]);
    }


    //just for doc
    public function index()
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        // Get all consultations for this doctor
        $consultations = Consultation::whereHas('appointment', function ($query) use ($doctor) {
            $query->where('doctor_id', $doctor->id);
        })->with('consultationItems')->get();

        return response()->json([
            'success' => true,
            'data' => $consultations
        ]); 
}



public function getDoctorStats()
{
    $user = Auth::user();

    // 🔒 Only doctor allowed
    if ($user->role !== 'doctor') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $doctorId = $user->doctor->id;
    $today = now()->toDateString();

    // 🔹 Base consultation revenue
    $totalConsultationRevenue = Consultation::whereHas('appointment', function ($q) use ($doctorId) {
        $q->where('doctor_id', $doctorId);
    })->sum('base_price');

    // 🔹 Items (extra fees)
    $totalItemsRevenue = Consultation::whereHas('appointment', function ($q) use ($doctorId) {
        $q->where('doctor_id', $doctorId);
    })->sum('extra_fees');

    // 🔹 Total revenue (base + items)
    $totalRevenue = Consultation::whereHas('appointment', function ($q) use ($doctorId) {
        $q->where('doctor_id', $doctorId);
    })->sum('total_price');

    // 🔹 Today revenue
    $todayRevenue = Consultation::whereHas('appointment', function ($q) use ($doctorId, $today) {
        $q->where('doctor_id', $doctorId)
          ->whereDate('appointment_date', $today);
    })->sum('total_price');

    // 🔹 Total consultations
    $totalConsultations = Consultation::whereHas('appointment', function ($q) use ($doctorId) {
        $q->where('doctor_id', $doctorId);
    })->count();

    // 🔹 Unique patients
    $totalPatients = Appointment::where('doctor_id', $doctorId)
        ->distinct('patient_id')
        ->count('patient_id');

    return response()->json([
        'success' => true,
        'data' => [

            // 🔹 Counts
            'total_consultations' => $totalConsultations,
            'total_patients' => $totalPatients,

            // 🔹 Revenue breakdown
            'consultation_revenue' => $totalConsultationRevenue,
            'items_revenue' => $totalItemsRevenue,
            'total_revenue' => $totalRevenue,

            // 🔹 Today
            'today_revenue' => $todayRevenue,
        ]
    ]);
}
}
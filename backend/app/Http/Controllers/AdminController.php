<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Doctor;
use App\Models\Clinic;
use App\Models\CollectiveCabinet;
use App\Models\PrivateCabinet;
use App\Models\Patient;
use App\Models\Secretary;

class AdminController extends Controller
{
    /* DOCTORS */
    public function getAllDoctors()
    {
        $doctors = Doctor::with(['user', 'privateCabinet'])->get();
        return response()->json(['success' => true, 'data' => $doctors]);
    }

    public function getPendingDoctors()
    {
        $doctors = Doctor::with(['user', 'privateCabinet'])->where('is_verified', false)->get();
        return response()->json(['success' => true, 'data' => $doctors]);
    }

    public function approveDoctor($id)
    {
        $doctor = Doctor::find($id);
        if (!$doctor) return response()->json(['message' => 'Doctor not found'], 404);
        $doctor->update(['is_verified' => true]);
        return response()->json(['success' => true, 'message' => 'Doctor approved successfully']);
    }

    public function toggleDoctorStatus($id)
    {
        $doctor = Doctor::find($id);
        if (!$doctor) return response()->json(['message' => 'Doctor not found'], 404);
        
        $doctor->update([
            'is_active' => !$doctor->is_active
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Doctor status (premium) updated',
            'is_active' => $doctor->is_active
        ]);
    }

    public function rejectDoctor($id)
    {
        $doctor = Doctor::find($id);
        if (!$doctor) return response()->json(['message' => 'Doctor not found'], 404);
        $doctor->user->delete(); 
        return response()->json(['success' => true, 'message' => 'Doctor rejected']);
    }

    /* CLINICS */
    public function getAllClinics()
    {
        $clinics = Clinic::with('user')->get();
        return response()->json(['success' => true, 'data' => $clinics]);
    }

    public function getPendingClinics()
    {
        $clinics = Clinic::with('user')->where('is_verified', false)->get();
        return response()->json(['success' => true, 'data' => $clinics]);
    }

    public function approveClinic($id)
    {
        $clinic = Clinic::find($id);
        if (!$clinic) return response()->json(['message' => 'Clinic not found'], 404);
        $clinic->update(['is_verified' => true]);
        return response()->json(['success' => true, 'message' => 'Clinic approved successfully']);
    }

    public function toggleClinicStatus($id)
    {
        $clinic = Clinic::find($id);
        if (!$clinic) return response()->json(['message' => 'Clinic not found'], 404);
        $clinic->update(['is_active' => !$clinic->is_active]);
        return response()->json(['success' => true, 'is_active' => $clinic->is_active]);
    }

    public function rejectClinic($id)
    {
        $clinic = Clinic::find($id);
        if (!$clinic) return response()->json(['message' => 'Clinic not found'], 404);
        $clinic->user->delete();
        return response()->json(['success' => true]);
    }

    /* PRIVATE CABINETS */
    public function getAllPrivateCabinets()
    {
        $cabinets = PrivateCabinet::with('doctor.user')->get();
        return response()->json(['success' => true, 'data' => $cabinets]);
    }

    /* CABINETS */
    public function getAllCabinets()
    {
        $cabinets = CollectiveCabinet::with('user')->get();
        return response()->json(['success' => true, 'data' => $cabinets]);
    }

    public function getPendingCabinets()
    {
        $cabinets = CollectiveCabinet::with('user')->where('is_verified', false)->get();
        return response()->json(['success' => true, 'data' => $cabinets]);
    }

    public function approveCabinet($id)
    {
        $cabinet = CollectiveCabinet::find($id);
        if (!$cabinet) return response()->json(['message' => 'Cabinet not found'], 404);
        $cabinet->update(['is_verified' => true]);
        return response()->json(['success' => true, 'message' => 'Cabinet approved successfully']);
    }

    public function toggleCabinetStatus($id)
    {
        $cabinet = CollectiveCabinet::find($id);
        if (!$cabinet) return response()->json(['message' => 'Cabinet not found'], 404);
        $cabinet->update(['is_active' => !$cabinet->is_active]);
        return response()->json(['success' => true, 'is_active' => $cabinet->is_active]);
    }

    public function rejectCabinet($id)
    {
        $cabinet = CollectiveCabinet::find($id);
        if (!$cabinet) return response()->json(['message' => 'Cabinet not found'], 404);
        $cabinet->user->delete();
        return response()->json(['success' => true]);
    }

    /* SECRETARIES */
    public function getAllSecretaries()
    {
        $secretaries = Secretary::with('user')->get();
        return response()->json(['success' => true, 'data' => $secretaries]);
    }

    /* PATIENTS */
    public function getAllPatients()
    {
        $patients = Patient::with('user')->get();
        return response()->json(['success' => true, 'data' => $patients]);
    }
}

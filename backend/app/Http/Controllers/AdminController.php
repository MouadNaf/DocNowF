<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Doctor;

class AdminController extends Controller
{
    public function getpendingDoctors()
    {
        $doctors = Doctor::with('user')
            ->where('is_verified', false)
            ->get();
        return response()->json([
        'success' => true,
        'data' => $doctors
       ]);
    }


   public function approveDoctor($id)
{
    $doctor = Doctor::find($id);

    if (!$doctor) {
        return response()->json(['message' => 'Doctor not found'], 404);
    }

    $doctor->update([
        'is_verified' => true
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Doctor approved successfully'
    ]);
}

    public function rejectDoctor($id)
{
    $doctor = Doctor::find($id);

    if (!$doctor) {
        return response()->json(['message' => 'Doctor not found'], 404);
    }

    $doctor->delete(); 

    return response()->json([
        'success' => true,
        'message' => 'Doctor rejected'
    ]);
}

}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
 


class ApprovedDoctorMiddleware
{
   public function handle($request, Closure $next)
{
    $user = Auth::user();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // 🔹 Doctor
    if ($user->role === 'doctor') {

        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        if (!$doctor->is_verified) {
            return response()->json(['message' => 'Doctor not verified'], 403);
        }

        if (!$doctor->is_active) {
            return response()->json(['message' => 'Doctor not active'], 403);
        }

        return $next($request);
    }

    // 🔹 Secretary
    if ($user->role === 'secretary') {

        $secretary = $user->secretary;

        if (!$secretary || !$secretary->doctor_id) {
            return response()->json(['message' => 'Secretary not linked to doctor'], 403);
        }

        // 🔥 Check doctor of secretary
        $doctor = $secretary->doctor;

        if (!$doctor || !$doctor->is_verified || !$doctor->is_active) {
            return response()->json([
                'message' => 'Doctor not approved or inactive'
            ], 403);
        }

        return $next($request);
    }

    return response()->json(['message' => 'Unauthorized'], 403);
}
}

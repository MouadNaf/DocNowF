<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Doctor;
use App\Models\Clinic;
use App\Models\CollectiveCabinet;
use App\Models\PrivateCabinet;
use App\Models\Patient;
use App\Models\Secretary;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Transaction;
use Carbon\Carbon;

class AdminController extends Controller
{
    /* ─── STATS ─────────────────────────────────────────────────────────── */

    public function getStats()
    {
        $totalUsers        = User::count();
        $totalDoctors      = Doctor::count();
        $totalPatients     = Patient::count();
        $totalAppointments = Appointment::count();

        // Pending verifications: unverified doctors + unverified clinics + unverified cabinets
        $pendingVerifications = Doctor::where('is_verified', false)->count()
            + Clinic::where('is_verified', false)->count()
            + CollectiveCabinet::where('is_verified', false)->count();

        // Total revenue = sum of all paid appointments consultation_fee
        $totalRevenue = Appointment::where('payment_status', 'paid')->sum('consultation_fee');

        // Today's appointments
        $todayAppointments = Appointment::whereDate('appointment_date', today())->count();

        return response()->json([
            'total_users'          => $totalUsers,
            'total_doctors'        => $totalDoctors,
            'total_patients'       => $totalPatients,
            'total_appointments'   => $totalAppointments,
            'today_appointments'   => $todayAppointments,
            'pending_verifications'=> $pendingVerifications,
            'total_revenue'        => round($totalRevenue, 2),
        ]);
    }

    /* ─── RECENT ACTIVITY ───────────────────────────────────────────────── */

    public function getRecentActivity()
    {
        // Last 10 registered users
        $recentUsers = User::orderByDesc('created_at')
            ->take(10)
            ->get(['id', 'name', 'role', 'created_at']);

        $activity = $recentUsers->map(function ($u) {
            $roleLabel = match ($u->role) {
                'doctor'    => 'Nouveau médecin inscrit',
                'patient'   => 'Nouveau patient inscrit',
                'secretary' => 'Nouveau secrétaire inscrit',
                'clinic'    => 'Nouvelle clinique inscrite',
                default     => 'Nouvel utilisateur inscrit',
            };
            return [
                'id'   => $u->id,
                'type' => $u->role,
                'text' => $roleLabel,
                'user' => $u->name,
                'time' => $u->created_at->diffForHumans(),
            ];
        });

        return response()->json(['data' => $activity]);
    }

    /* ─── CHARTS ─────────────────────────────────────────────────────────── */

    public function getUserGrowth()
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = Carbon::now()->subMonths($i);
            $count = User::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $months[] = [
                'name'  => $date->format('M'),
                'users' => $count,
            ];
        }
        return response()->json(['data' => $months]);
    }

    public function getRevenueGrowth()
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date    = Carbon::now()->subMonths($i);
            $revenue = Appointment::where('payment_status', 'paid')
                ->whereYear('appointment_date', $date->year)
                ->whereMonth('appointment_date', $date->month)
                ->sum('consultation_fee');
            $months[] = [
                'name'    => $date->format('M'),
                'revenue' => round($revenue, 2),
            ];
        }
        return response()->json(['data' => $months]);
    }

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

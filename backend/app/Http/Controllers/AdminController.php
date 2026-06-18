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

    /* ─── PAGINATED USERS LIST ──────────────────────────────────────────── */

    public function getUsersPaginated(Request $request)
    {
        $perPage = min((int) $request->get('per_page', 15), 50);
        $search = $request->get('search');
        $entityType = $request->get('entity_type');

        $roleMap = [
            'doctor'          => 'doctor',
            'clinic'          => 'clinic',
            'cabinet'         => 'collective_cabinet',
            'secretary'       => 'secretary',
            'patient'         => 'patient',
        ];

        $roles = ['doctor', 'clinic', 'collective_cabinet', 'secretary', 'patient'];
        if ($entityType && isset($roleMap[$entityType])) {
            $roles = [$roleMap[$entityType]];
        }

        $query = User::query()
            ->whereIn('role', $roles)
            ->select('id', 'name', 'email', 'role', 'city', 'phone_number', 'created_at')
            ->with([
                'doctor' => fn ($q) => $q->select('id', 'user_id', 'speciality', 'is_verified', 'is_active'),
                'doctor.privateCabinet' => fn ($q) => $q->select('id', 'doctor_id', 'name', 'city', 'address', 'is_active', 'is_verified'),
                'clinic' => fn ($q) => $q->select('id', 'user_id', 'name', 'speciality', 'address', 'city', 'is_verified', 'is_active'),
                'collectiveCabinet' => fn ($q) => $q->select('id', 'user_id', 'name', 'speciality', 'address', 'city', 'is_verified', 'is_active'),
                'secretary' => fn ($q) => $q->select('id', 'user_id'),
                'patient' => fn ($q) => $q->select('id', 'user_id'),
            ])
            ->orderByDesc('created_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('doctor.privateCabinet', fn ($pc) => $pc->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('clinic', fn ($c) => $c->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('collectiveCabinet', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        $paginated = $query->paginate($perPage);

        $data = $paginated->getCollection()
            ->map(fn ($user) => $this->transformUserToEntity($user))
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
            'stats'   => $this->getUserListStats(),
        ]);
    }

    public function getUserDetail(string $entityType, $id)
    {
        $entity = match ($entityType) {
            'doctor' => Doctor::with(['user', 'privateCabinet'])->find($id),
            'clinic' => Clinic::with('user')->find($id),
            'cabinet' => CollectiveCabinet::with('user')->find($id),
            'secretary' => Secretary::with('user')->find($id),
            'patient' => Patient::with('user')->find($id),
            default => null,
        };

        if (!$entity) {
            return response()->json(['message' => 'Entity not found'], 404);
        }

        $mappedType = $entityType === 'cabinet' ? 'cabinet' : $entityType;
        $payload = match ($entityType) {
            'doctor' => [
                'id'              => $entity->id,
                'entity_type'     => 'doctor',
                'is_verified'     => $entity->is_verified,
                'is_active'       => $entity->is_active,
                'documents'       => $entity->documents,
                'user'            => $entity->user,
                'private_cabinet' => $entity->privateCabinet,
            ],
            'clinic', 'cabinet' => [
                'id'          => $entity->id,
                'entity_type' => $mappedType,
                'name'        => $entity->name,
                'address'     => $entity->address,
                'city'        => $entity->city,
                'is_verified' => $entity->is_verified,
                'is_active'   => $entity->is_active,
                'documents'   => $entity->documents,
                'user'        => $entity->user,
            ],
            'secretary', 'patient' => [
                'id'          => $entity->id,
                'entity_type' => $entityType,
                'user'        => $entity->user,
            ],
            default => null,
        };

        return response()->json(['success' => true, 'data' => $payload]);
    }

    private function transformUserToEntity(User $user): ?array
    {
        $userData = $user->only(['id', 'name', 'email', 'city', 'phone_number']);

        return match ($user->role) {
            'doctor' => $user->doctor ? [
                'id'              => $user->doctor->id,
                'entity_type'     => 'doctor',
                'is_verified'     => $user->doctor->is_verified,
                'is_active'       => $user->doctor->is_active,
                'user'            => $userData,
                'private_cabinet' => $user->doctor->privateCabinet,
            ] : null,
            'clinic' => $user->clinic ? [
                'id'          => $user->clinic->id,
                'entity_type' => 'clinic',
                'name'        => $user->clinic->name,
                'is_verified' => $user->clinic->is_verified,
                'is_active'   => $user->clinic->is_active,
                'user'        => $userData,
            ] : null,
            'collective_cabinet' => $user->collectiveCabinet ? [
                'id'          => $user->collectiveCabinet->id,
                'entity_type' => 'cabinet',
                'name'        => $user->collectiveCabinet->name,
                'is_verified' => $user->collectiveCabinet->is_verified,
                'is_active'   => $user->collectiveCabinet->is_active,
                'user'        => $userData,
            ] : null,
            'secretary' => $user->secretary ? [
                'id'          => $user->secretary->id,
                'entity_type' => 'secretary',
                'user'        => $userData,
            ] : null,
            'patient' => $user->patient ? [
                'id'          => $user->patient->id,
                'entity_type' => 'patient',
                'user'        => $userData,
            ] : null,
            default => null,
        };
    }

    private function getUserListStats(): array
    {
        $total = User::whereIn('role', ['doctor', 'clinic', 'collective_cabinet', 'secretary', 'patient'])->count();

        $pending = Doctor::where('is_verified', false)->count()
            + Clinic::where('is_verified', false)->count()
            + CollectiveCabinet::where('is_verified', false)->count();

        $premium = Doctor::where('is_active', true)->count()
            + Clinic::where('is_active', true)->count()
            + CollectiveCabinet::where('is_active', true)->count();

        return [
            'total'   => $total,
            'pending' => $pending,
            'premium' => $premium,
        ];
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

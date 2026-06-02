<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $doctorId = $this->resolveDoctorId($request);
        if (!$doctorId) return response()->json(['message' => 'Unauthorized'], 403);

        $today = now()->toDateString();
        $revenueToday = Appointment::where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $today)
            ->where('payment_status', 'paid')
            ->sum('consultation_fee');

        $doctor = Doctor::find($doctorId);

        return response()->json([
            'todayAppointments' => Appointment::where('doctor_id', $doctorId)->where('appointment_date', $today)->count(),
            'totalPatients'     => Patient::whereHas('appointments', fn($q) => $q->where('doctor_id', $doctorId))->count(),
            'noShows'           => Appointment::where('doctor_id', $doctorId)->where('status', 'no_show')->count(),
            'revenueToday'      => (float) $revenueToday,
            'wallet_balance'    => (float) ($doctor->wallet_balance ?? 0),
            'low_balance'       => ($doctor->wallet_balance ?? 0) <= ($doctor->low_balance_threshold ?? 100),
            'is_exhausted'      => ($doctor->wallet_balance ?? 0) <= 0,
        ]);
    }

    // -------------------------------------------------------------------------
    // 0.1 GET /api/appointments/{id}
    // -------------------------------------------------------------------------
    public function show($id)
    {
        $appointment = Appointment::with(['patient.user', 'patient.medicalRecords'])->findOrFail($id);
        
        return response()->json([
            'appointment' => $this->formatAppointment($appointment),
            'patient'     => [
                'id'          => $appointment->patient_id,
                'name'        => $appointment->patient?->user?->name,
                'phone'       => $appointment->patient?->user?->phone_number,
                'totalVisits' => $appointment->patient?->appointments()->count(),
                'lastVisit'   => $appointment->patient?->appointments()
                                    ->where('status', 'completed')
                                    ->where('id', '!=', $id)
                                    ->latest()
                                    ->first()?->appointment_date,
                'history'     => $appointment->patient?->medicalRecords()->latest()->get()
            ]
        ]);
    }

    // -------------------------------------------------------------------------
    // 0.2 POST /api/appointments/{id}/consultation
    // -------------------------------------------------------------------------
    public function saveConsultation(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $request->validate([
            'diagnosis'    => 'nullable|string',
            'prescription' => 'nullable|string',
        ]);

        // Create medical record
        MedicalRecord::updateOrCreate(
            ['appointment_id' => $id],
            [
                'patient_id'   => $appointment->patient_id,
                'doctor_id'    => $appointment->doctor_id,
                'record_date'  => now()->toDateString(),
                'diagnosis'    => $request->diagnosis,
                'prescription' => $request->prescription,
            ]
        );

        // Update appointment status
        $appointment->update(['status' => 'completed']);

        return response()->json(['message' => 'Consultation saved successfully']);
    }

    // -------------------------------------------------------------------------
    // 1. GET /api/calendar
    //    Query: doctor_id, date (YYYY-MM-DD)
    // -------------------------------------------------------------------------
    public function calendar(Request $request)
    {
        $request->validate([
            'doctor_id' => 'nullable|integer',
            'date'      => 'required|date_format:Y-m-d',
        ]);

        $doctorId = $this->resolveDoctorId($request);

        if (!$doctorId) {
            return response()->json(['message' => 'Doctor not found or unauthorized'], 403);
        }

        $appointments = Appointment::with(['patient.user'])
            ->where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $request->date)
            ->orderBy('start_time')
            ->get()
            ->map(fn($a) => $this->formatAppointment($a));

        return response()->json([
            'success' => true,
            'date'    => $request->date,
            'count'   => $appointments->count(),
            'data'    => $appointments,
        ]);
    }

    // -------------------------------------------------------------------------
    // 2. POST /api/appointments/walk-in
    //    Body: doctor_id, name, phone (optional: email, gender, city, address, date_of_birth)
    // -------------------------------------------------------------------------
    public function walkIn(Request $request)
    {
        $request->validate([
            'doctor_id' => 'nullable|integer',
            'name'      => 'required_without:patient_id|string|max:255',
            'phone'     => 'required_without:patient_id|string|max:20',
            'patient_id'=> 'nullable|integer',
            'email'     => 'nullable|email|max:255',
            'gender'    => 'nullable|string|in:male,female',
            'city'      => 'nullable|string|max:100',
            'address'   => 'nullable|string|max:255',
            'date_of_birth'    => 'nullable|date',
            'appointment_date' => 'nullable|date',
            'start_time'       => 'nullable|string',
        ]);

        $doctorId = $this->resolveDoctorId($request);

        if (!$doctorId) {
            return response()->json(['message' => 'Doctor not found or unauthorized'], 403);
        }

        $doctor = Doctor::find($doctorId);
        $walletService = app(\App\Services\WalletService::class);
        if (!$walletService->canBook($doctor)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance to create new appointments.'
            ], 403);
        }

        // Find or create Patient
        if ($request->filled('patient_id')) {
            $patient = Patient::findOrFail($request->patient_id);
        } else {
            $user = User::where('phone_number', $request->phone)
                ->where('role', 'patient')
                ->first();

            if (!$user) {
                $user = User::create([
                    'name'         => $request->name,
                    'phone_number' => $request->phone,
                    'email'        => $request->email ?? ($request->phone . '@walkin.local'),
                    'password'     => bcrypt(str()->random(16)),
                    'role'         => 'patient',
                    'gender'       => $request->gender ?? 'male',
                    'city'         => $request->city ?? '',
                    'address'      => $request->address ?? '',
                    'date_of_birth'=> $request->date_of_birth ?? '2000-01-01',
                ]);

                $patient = Patient::create(['user_id' => $user->id]);
            } else {
                $patient = $user->patient ?? Patient::create(['user_id' => $user->id]);
            }
        }

        $now = now();
        $auth = Auth::user();
        
        $location = [
            'private_cabinet_id'    => null,
            'clinic_id'             => null,
            'collective_cabinet_id' => null,
        ];

        if ($auth->role === 'secretary' && $auth->secretary) {
            $doctor = Doctor::find($doctorId);
            $location['private_cabinet_id'] = $doctor?->privateCabinet?->id;
        } elseif ($auth->role === 'doctor') {
            $location['private_cabinet_id'] = $auth->doctor?->privateCabinet?->id;
        }

        $fee = 0;
        if ($location['private_cabinet_id']) {
            $cabinet = \App\Models\PrivateCabinet::find($location['private_cabinet_id']);
            $fee = $cabinet ? $cabinet->consultation_price : 0;
        }

        $appointment = Appointment::create([
            'doctor_id'             => $doctorId,
            'patient_id'            => $patient->id,
            'appointment_date'      => $request->appointment_date ?? $now->toDateString(),
            'start_time'            => $request->start_time ?? $now->format('H:i'),
            'status'                => 'confirmed',
            'consultation_fee'      => $fee,
            'private_cabinet_id'    => $location['private_cabinet_id'],
            'clinic_id'             => $location['clinic_id'],
            'collective_cabinet_id' => $location['collective_cabinet_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Walk-in appointment created',
            'data'    => $this->formatAppointment($appointment),
        ], 201);
    }

    // -------------------------------------------------------------------------
    // 2.5 GET /api/appointments/walk-in-slots
    // -------------------------------------------------------------------------
    public function availableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'exclude_appointment_id' => 'nullable|integer|exists:appointments,id',
        ]);

        $doctorId = $this->resolveDoctorId($request);
        if (!$doctorId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $auth = Auth::user();
        $cabinetType = 'private';
        $cabinetId = null;

        if ($auth->role === 'secretary' && $auth->secretary) {
            $doctor = Doctor::find($doctorId);
            $cabinetId = $doctor?->privateCabinet?->id;
        } elseif ($auth->role === 'doctor') {
            $cabinetId = $auth->doctor?->privateCabinet?->id;
        }

        if (!$cabinetId) {
            return response()->json([
                'success' => true,
                'data' => [
                    'doctor_name'   => null,
                    'date'          => $request->date,
                    'location_type' => $cabinetType,
                    'slots'         => [],
                ],
                'message' => 'No cabinet configured for this doctor. Please set up a private cabinet first.',
            ]);
        }

        return app(\App\Http\Controllers\AppointmentController::class)
            ->generateSlots(
                $doctorId,
                $request->date,
                $cabinetType,
                $cabinetId,
                $request->exclude_appointment_id
            );
    }

    // -------------------------------------------------------------------------
    // 3. GET /api/appointments
    //    Query: doctor_id (optional), date?, patient?, status?
    //    Auto-detects doctor_id from auth (doctor/secretary) when not supplied
    // -------------------------------------------------------------------------
    public function appointments(Request $request)
    {
        $request->validate([
            'doctor_id' => 'nullable|integer',
            'date'      => 'nullable|date_format:Y-m-d',
            'status'    => 'nullable|in:confirmed,cancelled,pending,completed',
            'patient'   => 'nullable|string|max:100',
        ]);

        $doctorId = $this->resolveDoctorId($request);

        if (!$doctorId) {
            return response()->json(['message' => 'Doctor not found or unauthorized'], 403);
        }

        $query = Appointment::with(['patient.user'])
            ->where('doctor_id', $doctorId);

        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('patient')) {
            $search = '%' . $request->patient . '%';
            $query->whereHas('patient.user', function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('phone_number', 'like', $search);
            });
        }

        $appointments = $query
            ->orderBy('appointment_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(fn($a) => $this->formatAppointment($a));

        return response()->json([
            'success' => true,
            'count'   => $appointments->count(),
            'data'    => $appointments,
        ]);
    }

    // -------------------------------------------------------------------------
    // 4. GET /api/patients
    //    Query: doctor_id (optional), search?
    // -------------------------------------------------------------------------
    public function patients(Request $request)
    {
        $request->validate([
            'doctor_id' => 'nullable|integer',
            'search'    => 'nullable|string|max:100',
        ]);

        $doctorId = $this->resolveDoctorId($request);

        if (!$doctorId) {
            return response()->json(['message' => 'Doctor not found or unauthorized'], 403);
        }

        $query = Patient::with('user')
            ->whereHas('appointments', function ($q) use ($doctorId) {
                $q->where('doctor_id', $doctorId);
            })
            ->withCount(['appointments as visits' => function ($q) use ($doctorId) {
                $q->where('doctor_id', $doctorId);
            }]);

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('phone_number', 'like', $search);
            });
        }

        $patients = $query->get()->map(function ($p) use ($doctorId) {
            $lastApt = Appointment::where('patient_id', $p->id)
                ->where('doctor_id', $doctorId)
                ->where('status', 'completed')
                ->latest('appointment_date')
                ->first();

            return [
                'id'          => $p->id,
                'name'        => $p->user->name ?? null,
                'phone'       => $p->user->phone_number ?? null,
                'email'       => $p->user->email ?? null,
                'gender'      => $p->user->gender ?? null,
                'city'        => $p->user->city ?? null,
                'totalVisits' => $p->visits,
                'lastVisit'   => $lastApt?->appointment_date ?? 'N/A',
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $patients,
        ]);
    }

    // -------------------------------------------------------------------------
    // 5. GET /api/doctor/patients/{id}/history
    // -------------------------------------------------------------------------
    public function patientHistory(Request $request, $id)
    {
        $doctorId = $this->resolveDoctorId($request);
        if (!$doctorId) return response()->json(['message' => 'Unauthorized'], 403);

        $patient = Patient::with('user')->findOrFail($id);
        $history = MedicalRecord::where('patient_id', $id)
            ->where('doctor_id', $doctorId)
            ->with('appointment')
            ->latest('record_date')
            ->get();

        return response()->json([
            'patient' => [
                'name'  => $patient->user->name,
                'phone' => $patient->user->phone_number,
                'city'  => $patient->user->city,
                'gender'=> $patient->user->gender,
            ],
            'history' => $history
        ]);
    }

    public function searchByPhone(Request $request)
    {
        $request->validate(['phone' => 'required|string']);

        $user = User::where('phone_number', $request->phone)
            ->where('role', 'patient')
            ->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Patient not found']);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'id'    => $user->patient?->id,
                'name'  => $user->name,
                'email' => $user->email,
                'city'  => $user->city,
                'gender'=> $user->gender,
            ]
        ]);
    }

    // -------------------------------------------------------------------------
    // 0.3 PATCH /api/appointments/{id}/set-price
    // -------------------------------------------------------------------------
    public function setPrice(Request $request, $id)
    {
        $request->validate(['price' => 'required|numeric|min:0']);
        
        $appointment = Appointment::findOrFail($id);
        
        $doctorId = $this->resolveDoctorId($request);
        if ($appointment->doctor_id != $doctorId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $appointment->consultation_fee = $request->price;
        $appointment->save();

        return response()->json($this->formatAppointment($appointment));
    }

    // -------------------------------------------------------------------------
    // 0.4 PATCH /api/appointments/{id}/mark-paid
    // -------------------------------------------------------------------------
    public function markPaid(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $doctorId = $this->resolveDoctorId($request);
        if ($appointment->doctor_id != $doctorId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (is_null($appointment->consultation_fee)) {
            return response()->json(['message' => 'Price not set'], 400);
        }

        $appointment->payment_status = 'paid';
        $appointment->save();

        return response()->json($this->formatAppointment($appointment));
    }

    // -------------------------------------------------------------------------
    // 8. POST /api/patients
    // -------------------------------------------------------------------------
    public function storePatient(Request $request)
    {
        $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName'  => 'required|string|max:100',
            'phone'     => 'required|string|max:20',
            'email'     => 'nullable|email|max:100',
            'wilaya'    => 'nullable|string|max:100',
            'dob'       => 'nullable|date',
        ]);

        $user = User::where('phone_number', $request->phone)->first();

        if (!$user) {
            $user = User::create([
                'name'         => $request->firstName . ' ' . $request->lastName,
                'phone_number' => $request->phone,
                'email'        => $request->email ?? ($request->phone . '@patient.local'),
                'password'     => bcrypt(str()->random(16)),
                'role'         => 'patient',
                'gender'       => 'male', // Default as not provided in this form
                'city'         => $request->wilaya ?? '',
                'address'      => '', // Required field with no default
                'date_of_birth'=> $request->dob ?? '2000-01-01',
            ]);
        }

        $patient = Patient::firstOrCreate(['user_id' => $user->id]);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'    => $patient->id,
                'name'  => $user->name,
                'phone' => $user->phone_number,
            ]
        ], 201);
    }

    // -------------------------------------------------------------------------
    // 5. PATCH /api/appointments/{id}/status
    // -------------------------------------------------------------------------
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:arrived,no_show,completed,cancelled,confirmed',
            'reason' => 'nullable|string'
        ]);

        $appointment = Appointment::findOrFail($id);
        
        $updateData = ['status' => $request->status];
        if ($request->filled('reason')) {
            $updateData['cancellation_reason'] = $request->reason;
        }

        $appointment->update($updateData);

        return response()->json([
            'success' => true,
            'data'    => $this->formatAppointment($appointment)
        ]);
    }

    // -------------------------------------------------------------------------
    // 6. PATCH /api/appointments/{id}/note
    // -------------------------------------------------------------------------
    public function updateNote(Request $request, $id)
    {
        $request->validate(['note' => 'required|string']);

        $appointment = Appointment::findOrFail($id);
        
        if (Schema::hasColumn('appointments', 'reason')) {
            $appointment->update(['reason' => $request->note]);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->formatAppointment($appointment)
        ]);
    }

    // -------------------------------------------------------------------------
    // Internal helper — flat format for frontend table/calendar
    // -------------------------------------------------------------------------
    private function formatAppointment(Appointment $a): array
    {
        return [
            'id'               => $a->id,
            'appointment_date' => $a->appointment_date,
            'start_time'       => $a->start_time,
            'status'           => $a->status,
            'payment_status'   => $a->payment_status ?? 'unpaid',
            'consultation_fee' => $a->consultation_fee ?? 0,
            'patient_id'       => $a->patient_id,
            'patient'          => [
                'id'    => $a->patient_id,
                'name'  => $a->patient?->user?->name,
                'phone' => $a->patient?->user?->phone_number,
            ],
            'scheduled_at'     => $a->appointment_date . ' ' . $a->start_time,
        ];
    }

    // -------------------------------------------------------------------------
    // Internal helper — resolve doctor_id from request param OR auth context
    // Priority: explicit doctor_id param → doctor role → secretary role
    // -------------------------------------------------------------------------
    private function resolveDoctorId(Request $request): int|null
    {
        // 1. Explicit param provided (e.g. from frontend passing doctor_id=3)
        if ($request->filled('doctor_id')) {
            return (int) $request->doctor_id;
        }

        // 2. Auto-detect from auth user
        $user = Auth::user();

        if (!$user) return null;

        if ($user->role === 'doctor') {
            return $user->doctor?->id;
        }

        if ($user->role === 'secretary') {
            return $user->secretary?->doctor_id;
        }

        return null;
    }
}

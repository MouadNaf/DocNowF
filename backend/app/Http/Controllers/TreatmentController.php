<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTreatmentRequest;
use App\Http\Requests\StoreTreatmentStepRequest;
use App\Http\Requests\UpdateTreatmentRequest;
use App\Http\Requests\UpdateTreatmentStepRequest;
use App\Http\Resources\TreatmentResource;
use App\Http\Resources\TreatmentStepResource;
use App\Models\Appointment;
use App\Models\PrivateCabinet;
use App\Models\Treatment;
use App\Models\TreatmentStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TreatmentController extends Controller
{
    public function index(Request $request)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $query = Treatment::where('doctor_id', $doctor->id)
            ->with(['patient.user', 'doctor.user', 'steps'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('patient.user', function ($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = min((int) $request->get('per_page', 10), 50);
        $treatments = $query->paginate($perPage);

        return TreatmentResource::collection($treatments)->additional([
            'success' => true,
        ]);
    }

    public function show($id)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $treatment = Treatment::with(['patient.user', 'doctor.user', 'steps.appointment'])
            ->where('doctor_id', $doctor->id)
            ->find($id);

        if (!$treatment) {
            return response()->json(['message' => 'Treatment not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new TreatmentResource($treatment),
        ]);
    }

    public function store(StoreTreatmentRequest $request)
    {
        $this->rejectSecretaryMedicalWrite();
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $treatment = Treatment::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => $doctor->id,
            'title' => $request->title,
            'description' => $request->description,
            'diagnosis' => $request->diagnosis,
            'status' => 'planned',
            'total_cost' => $request->total_cost ?? 0,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        $treatment->load(['patient.user', 'doctor.user', 'steps']);

        return response()->json([
            'success' => true,
            'message' => 'Treatment created successfully',
            'data' => new TreatmentResource($treatment),
        ], 201);
    }

    public function update(UpdateTreatmentRequest $request, $id)
    {
        $this->rejectSecretaryMedicalWrite();
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $treatment = Treatment::where('doctor_id', $doctor->id)->find($id);
        if (!$treatment) {
            return response()->json(['message' => 'Treatment not found'], 404);
        }

        $treatment->update($request->validated());
        $treatment->load(['patient.user', 'doctor.user', 'steps']);

        return response()->json([
            'success' => true,
            'message' => 'Treatment updated successfully',
            'data' => new TreatmentResource($treatment),
        ]);
    }

    public function destroy($id)
    {
        $this->rejectSecretaryMedicalWrite();
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $treatment = Treatment::with('steps')->where('doctor_id', $doctor->id)->find($id);
        if (!$treatment) {
            return response()->json(['message' => 'Treatment not found'], 404);
        }

        foreach ($treatment->steps as $step) {
            $this->cancelStepAppointment($step->appointment_id);
        }

        $treatment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Treatment deleted successfully',
        ]);
    }

    public function storeStep(StoreTreatmentStepRequest $request, $id)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $treatment = Treatment::with('doctor.privateCabinet')->where('doctor_id', $doctor->id)->find($id);
        if (!$treatment) {
            return response()->json(['message' => 'Treatment not found'], 404);
        }

        try {
            $appointmentId = $this->resolveStepAppointment(
                $treatment,
                $request->scheduled_date,
                $request->scheduled_time
            );
        } catch (ValidationException $e) {
            throw $e;
        }

        $step = $treatment->steps()->create([
            'title' => $request->title,
            'description' => $request->description,
            'appointment_id' => $appointmentId ?? $request->appointment_id,
            'scheduled_date' => $request->scheduled_date,
            'scheduled_time' => $request->scheduled_time,
            'status' => 'pending',
        ]);

        $this->syncTreatmentStatus($treatment);

        $step->load('appointment');
        $treatment->load(['patient.user', 'doctor.user', 'steps.appointment']);

        return response()->json([
            'success' => true,
            'message' => 'Treatment step created successfully',
            'data' => new TreatmentStepResource($step),
            'treatment' => new TreatmentResource($treatment),
        ], 201);
    }

    public function updateStep(UpdateTreatmentStepRequest $request, $id)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $step = TreatmentStep::with(['treatment.doctor.privateCabinet', 'appointment'])
            ->whereHas('treatment', function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            })->find($id);

        if (!$step) {
            return response()->json(['message' => 'Treatment step not found'], 404);
        }

        $data = $request->validated();

        if (Auth::user()->role === 'secretary') {
            if (isset($data['status']) && $data['status'] === 'completed') {
                abort(403, 'Action réservée au médecin.');
            }
            unset($data['title'], $data['description']);
        }

        if (isset($data['status']) && $data['status'] === 'completed' && !isset($data['completed_at'])) {
            $data['completed_at'] = now();
        }

        if (isset($data['status']) && $data['status'] === 'pending') {
            $data['completed_at'] = null;
        }

        $schedulingChanged = array_key_exists('scheduled_date', $data) || array_key_exists('scheduled_time', $data);
        if ($schedulingChanged) {
            $newDate = $data['scheduled_date'] ?? $step->scheduled_date?->format('Y-m-d');
            $newTime = $data['scheduled_time'] ?? ($step->scheduled_time
                ? \Carbon\Carbon::parse($step->scheduled_time)->format('H:i')
                : null);

            if ($newDate && $newTime) {
                try {
                    $data['appointment_id'] = $this->resolveStepAppointment(
                        $step->treatment,
                        $newDate,
                        $newTime,
                        $step
                    );
                } catch (ValidationException $e) {
                    throw $e;
                }
            } elseif (!$newDate && !$newTime) {
                $this->cancelStepAppointment($step->appointment_id);
                $data['appointment_id'] = null;
            }
        }

        $step->update($data);
        $this->syncTreatmentStatus($step->treatment);

        $step->load('appointment');
        $step->treatment->load(['patient.user', 'doctor.user', 'steps.appointment']);

        return response()->json([
            'success' => true,
            'message' => 'Treatment step updated successfully',
            'data' => new TreatmentStepResource($step),
            'treatment' => new TreatmentResource($step->treatment),
        ]);
    }

    public function destroyStep($id)
    {
        $this->rejectSecretaryMedicalWrite();
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $step = TreatmentStep::whereHas('treatment', function ($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->find($id);

        if (!$step) {
            return response()->json(['message' => 'Treatment step not found'], 404);
        }

        $treatment = $step->treatment;
        $this->cancelStepAppointment($step->appointment_id);
        $step->delete();
        $this->syncTreatmentStatus($treatment);

        $treatment->load(['patient.user', 'doctor.user', 'steps.appointment']);

        return response()->json([
            'success' => true,
            'message' => 'Treatment step deleted successfully',
            'treatment' => new TreatmentResource($treatment),
        ]);
    }

    private function rejectSecretaryMedicalWrite(): void
    {
        if (Auth::user()->role === 'secretary') {
            abort(403, 'Action réservée au médecin.');
        }
    }

    private function resolveDoctor()
    {
        $user = Auth::user();

        if ($user->role === 'doctor') {
            return $user->doctor;
        }

        if ($user->role === 'secretary') {
            return $user->secretary?->doctor;
        }

        return null;
    }

    private function resolveStepAppointment(
        Treatment $treatment,
        ?string $date,
        ?string $time,
        ?TreatmentStep $existingStep = null
    ): ?int {
        if (!$date || !$time) {
            return null;
        }

        $doctor = $treatment->doctor;
        $cabinet = $doctor->privateCabinet;

        if (!$cabinet) {
            throw ValidationException::withMessages([
                'scheduled_date' => ['Aucun cabinet privé configuré pour ce médecin.'],
            ]);
        }

        $timeNormalized = substr($time, 0, 5);
        $excludeId = $existingStep?->appointment_id;

        if ($existingStep?->appointment) {
            $current = $existingStep->appointment;
            $currentDate = $current->appointment_date instanceof \Carbon\Carbon
                ? $current->appointment_date->format('Y-m-d')
                : $current->appointment_date;
            $currentTime = \Carbon\Carbon::parse($current->start_time)->format('H:i');

            if ($currentDate === $date && $currentTime === $timeNormalized) {
                return (int) $current->id;
            }
        }

        $this->cancelStepAppointment($excludeId);

        $appointmentController = app(AppointmentController::class);
        $slotsResponse = $appointmentController->generateSlots(
            $doctor->id,
            $date,
            'private',
            $cabinet->id,
            $excludeId
        );

        $slotsData = $slotsResponse->getData(true);
        $validSlot = collect($slotsData['data']['slots'] ?? [])
            ->first(fn ($slot) => $slot['start'] === $timeNormalized && ($slot['is_available'] ?? false));

        if (!$validSlot) {
            throw ValidationException::withMessages([
                'scheduled_time' => ['Ce créneau n\'est pas disponible. Veuillez en choisir un autre.'],
            ]);
        }

        $locationData = ['private_cabinet_id' => $cabinet->id, 'clinic_id' => null, 'collective_cabinet_id' => null];
        $fee = $cabinet->consultation_price ?? 0;

        $cancelledAppointment = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $date)
            ->where('start_time', 'like', $timeNormalized . '%')
            ->where($locationData)
            ->where('status', 'cancelled')
            ->first();

        if ($cancelledAppointment) {
            $cancelledAppointment->update([
                'patient_id' => $treatment->patient_id,
                'status' => 'confirmed',
                'consultation_fee' => $fee,
            ]);

            return (int) $cancelledAppointment->id;
        }

        try {
            $appointment = DB::transaction(function () use ($doctor, $treatment, $date, $timeNormalized, $locationData, $fee) {
                return Appointment::create([
                    'doctor_id' => $doctor->id,
                    'patient_id' => $treatment->patient_id,
                    'appointment_date' => $date,
                    'start_time' => $timeNormalized,
                    'status' => 'confirmed',
                    'consultation_fee' => $fee,
                    ...$locationData,
                ]);
            });

            return (int) $appointment->id;
        } catch (\Illuminate\Database\QueryException) {
            throw ValidationException::withMessages([
                'scheduled_time' => ['Ce créneau vient d\'être réservé par un autre patient.'],
            ]);
        }
    }

    private function cancelStepAppointment(?int $appointmentId): void
    {
        if (!$appointmentId) {
            return;
        }

        $appointment = Appointment::find($appointmentId);
        if (!$appointment || $appointment->status === 'cancelled') {
            return;
        }

        if (in_array($appointment->status, ['confirmed', 'arrived'])) {
            $appointment->update([
                'status' => 'cancelled',
                'cancellation_reason' => 'Treatment step removed or rescheduled',
            ]);
        }
    }

    private function syncTreatmentStatus(Treatment $treatment): void
    {
        $treatment->load('steps');
        $steps = $treatment->steps;

        if ($steps->isEmpty()) {
            return;
        }

        if ($steps->every(fn ($s) => $s->status === 'cancelled')) {
            $treatment->update(['status' => 'cancelled']);
            return;
        }

        if ($steps->every(fn ($s) => $s->status === 'completed')) {
            $treatment->update([
                'status' => 'completed',
                'end_date' => $treatment->end_date ?? now()->toDateString(),
            ]);
            return;
        }

        if ($steps->contains(fn ($s) => $s->status === 'completed')) {
            $treatment->update(['status' => 'in_progress']);
        }
    }
}

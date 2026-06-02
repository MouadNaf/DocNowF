<?php

namespace App\Http\Controllers;

use App\Http\Requests\ScheduleTreatmentVisitRequest;
use App\Http\Requests\StoreTreatmentPaymentRequest;
use App\Http\Requests\StoreTreatmentStepRequest;
use App\Http\Requests\UpdateTreatmentStepRequest;
use App\Http\Resources\TreatmentPaymentResource;
use App\Http\Resources\TreatmentResource;
use App\Http\Resources\TreatmentStepResource;
use App\Models\Treatment;
use App\Models\TreatmentPayment;
use App\Models\TreatmentStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SecretaryTreatmentController extends Controller
{
    public function stats()
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $active = Treatment::where('doctor_id', $doctor->id)
            ->whereIn('status', ['planned', 'in_progress']);

        $outstanding = (clone $active)
            ->selectRaw('COALESCE(SUM(GREATEST(total_cost - paid_amount, 0)), 0) as total')
            ->value('total');

        return response()->json([
            'success' => true,
            'data' => [
                'active_treatments' => (clone $active)->count(),
                'upcoming_visits' => TreatmentStep::whereHas('treatment', fn ($q) => $q->where('doctor_id', $doctor->id))
                    ->where('status', 'pending')
                    ->where(function ($q) {
                        $q->whereDate('scheduled_date', '>=', today())
                            ->orWhereHas('appointment', fn ($a) => $a->whereDate('appointment_date', '>=', today()));
                    })
                    ->count(),
                'completed_treatments' => Treatment::where('doctor_id', $doctor->id)
                    ->where('status', 'completed')
                    ->count(),
                'outstanding_balance' => (float) $outstanding,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Treatment::where('doctor_id', $doctor->id)
            ->with(['patient.user', 'doctor.user', 'steps.appointment'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('patient.user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        $perPage = min((int) $request->get('per_page', 10), 50);

        return TreatmentResource::collection($query->paginate($perPage))->additional([
            'success' => true,
        ]);
    }

    public function show($id)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $treatment = Treatment::with(['patient.user', 'doctor.user', 'steps.appointment', 'payments.recorder'])
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

    public function byPatient($patientId)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $treatments = Treatment::where('doctor_id', $doctor->id)
            ->where('patient_id', $patientId)
            ->with(['patient.user', 'doctor.user', 'steps.appointment'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => TreatmentResource::collection($treatments),
        ]);
    }

    public function scheduleVisit(ScheduleTreatmentVisitRequest $request, $id)
    {
        $storeRequest = StoreTreatmentStepRequest::createFrom($request);
        $storeRequest->merge([
            'title' => $request->title ?? 'Visite de suivi',
            'description' => $request->notes,
            'scheduled_date' => $request->date,
            'scheduled_time' => $request->time,
        ]);
        $storeRequest->setContainer(app());
        $storeRequest->validateResolved();

        return app(TreatmentController::class)->storeStep($storeRequest, $id);
    }

    public function rescheduleVisit(Request $request, $treatmentId, $stepId)
    {
        $request->validate([
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:1000',
        ]);

        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $step = TreatmentStep::where('treatment_id', $treatmentId)
            ->whereHas('treatment', fn ($q) => $q->where('doctor_id', $doctor->id))
            ->find($stepId);

        if (!$step) {
            return response()->json(['message' => 'Treatment step not found'], 404);
        }

        if ($step->status !== 'pending') {
            return response()->json(['message' => 'Seules les visites en attente peuvent être reprogrammées.'], 422);
        }

        $updateRequest = UpdateTreatmentStepRequest::createFrom($request);
        $updateRequest->merge([
            'scheduled_date' => $request->date,
            'scheduled_time' => $request->time,
            'description' => $request->notes ?? $step->description,
        ]);
        $updateRequest->setContainer(app());
        $updateRequest->validateResolved();

        return app(TreatmentController::class)->updateStep($updateRequest, $stepId);
    }

    public function cancelVisit($treatmentId, $stepId)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $step = TreatmentStep::with('appointment')
            ->where('treatment_id', $treatmentId)
            ->whereHas('treatment', fn ($q) => $q->where('doctor_id', $doctor->id))
            ->find($stepId);

        if (!$step) {
            return response()->json(['message' => 'Treatment step not found'], 404);
        }

        if ($step->appointment_id && $step->appointment) {
            $step->appointment->update(['status' => 'cancelled']);
        }

        $step->update([
            'status' => 'cancelled',
            'scheduled_date' => null,
            'scheduled_time' => null,
            'appointment_id' => null,
        ]);

        $step->load('appointment');
        $step->treatment->load(['patient.user', 'doctor.user', 'steps.appointment']);

        return response()->json([
            'success' => true,
            'message' => 'Visite annulée avec succès.',
            'data' => new TreatmentStepResource($step),
            'treatment' => new TreatmentResource($step->treatment),
        ]);
    }

    public function payments($id)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $treatment = Treatment::where('doctor_id', $doctor->id)->find($id);
        if (!$treatment) {
            return response()->json(['message' => 'Treatment not found'], 404);
        }

        $payments = $treatment->payments()->with('recorder')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => TreatmentPaymentResource::collection($payments),
        ]);
    }

    public function storePayment(StoreTreatmentPaymentRequest $request, $id)
    {
        $doctor = $this->resolveDoctor();
        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $treatment = Treatment::where('doctor_id', $doctor->id)->find($id);
        if (!$treatment) {
            return response()->json(['message' => 'Treatment not found'], 404);
        }

        $remaining = max(0, (float) $treatment->total_cost - (float) $treatment->paid_amount);
        if ($request->amount > $remaining && $treatment->total_cost > 0) {
            return response()->json([
                'message' => 'Le montant dépasse le solde restant.',
                'errors' => ['amount' => ['Le montant ne peut pas dépasser le solde restant.']],
            ], 422);
        }

        $payment = DB::transaction(function () use ($request, $treatment) {
            $payment = TreatmentPayment::create([
                'treatment_id' => $treatment->id,
                'recorded_by' => Auth::id(),
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
            ]);

            $treatment->increment('paid_amount', $request->amount);

            return $payment;
        });

        $payment->load('recorder');

        return response()->json([
            'success' => true,
            'message' => 'Paiement enregistré avec succès.',
            'data' => new TreatmentPaymentResource($payment),
        ], 201);
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
}

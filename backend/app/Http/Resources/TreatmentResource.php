<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TreatmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $steps = $this->relationLoaded('steps') ? $this->steps : collect();
        $totalSteps = $steps->count();
        $completedSteps = $steps->where('status', 'completed')->count();
        $progressPercent = $totalSteps > 0 ? round(($completedSteps / $totalSteps) * 100) : 0;

        $nextStep = $steps
            ->where('status', 'pending')
            ->sortBy(fn ($s) => $s->scheduled_date?->format('Y-m-d') ?? $s->appointment?->appointment_date ?? '9999-99-99')
            ->first();

        $isSecretary = $request->user()?->role === 'secretary';

        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'doctor_id' => $this->doctor_id,
            'title' => $this->title,
            'description' => $this->description,
            'diagnosis' => $isSecretary ? null : $this->diagnosis,
            'status' => $this->status,
            'total_cost' => (float) $this->total_cost,
            'paid_amount' => (float) ($this->paid_amount ?? 0),
            'remaining_balance' => max(0, (float) $this->total_cost - (float) ($this->paid_amount ?? 0)),
            'next_visit' => $nextStep ? [
                'step_id' => $nextStep->id,
                'title' => $nextStep->title,
                'date' => $nextStep->scheduled_date?->format('Y-m-d')
                    ?? ($nextStep->appointment?->appointment_date
                        ? (\Carbon\Carbon::parse($nextStep->appointment->appointment_date)->format('Y-m-d'))
                        : null),
                'time' => $nextStep->scheduled_time
                    ? \Carbon\Carbon::parse($nextStep->scheduled_time)->format('H:i')
                    : ($nextStep->appointment?->start_time
                        ? \Carbon\Carbon::parse($nextStep->appointment->start_time)->format('H:i')
                        : null),
            ] : null,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'patient' => $this->whenLoaded('patient', function () {
                return [
                    'id' => $this->patient->id,
                    'name' => $this->patient->user?->name,
                    'phone' => $this->patient->user?->phone_number,
                    'email' => $this->patient->user?->email,
                ];
            }),
            'doctor' => $this->whenLoaded('doctor', function () {
                return [
                    'id' => $this->doctor->id,
                    'name' => $this->doctor->user?->name,
                    'speciality' => $this->doctor->speciality,
                ];
            }),
            'steps' => TreatmentStepResource::collection($this->whenLoaded('steps')),
            'progress' => [
                'completed_steps' => $completedSteps,
                'total_steps' => $totalSteps,
                'percent' => $progressPercent,
            ],
            'payments' => $this->whenLoaded('payments', fn () =>
                TreatmentPaymentResource::collection($this->payments)
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

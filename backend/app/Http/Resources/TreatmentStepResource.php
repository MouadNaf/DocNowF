<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TreatmentStepResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'treatment_id' => $this->treatment_id,
            'title' => $this->title,
            'description' => $this->description,
            'appointment_id' => $this->appointment_id,
            'status' => $this->status,
            'scheduled_date' => $this->scheduled_date?->format('Y-m-d'),
            'scheduled_time' => $this->scheduled_time
                ? \Carbon\Carbon::parse($this->scheduled_time)->format('H:i')
                : ($this->appointment?->start_time
                    ? \Carbon\Carbon::parse($this->appointment->start_time)->format('H:i')
                    : null),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'appointment' => $this->whenLoaded('appointment', function () {
                return [
                    'id' => $this->appointment->id,
                    'appointment_date' => $this->appointment->appointment_date,
                    'start_time' => $this->appointment->start_time,
                    'status' => $this->appointment->status,
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTreatmentStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'appointment_id' => 'nullable|exists:appointments,id',
            'status' => 'sometimes|in:pending,completed,cancelled',
            'scheduled_date' => 'nullable|date',
            'scheduled_time' => 'nullable|date_format:H:i|required_with:scheduled_date',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTreatmentStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_date' => 'nullable|date',
            'scheduled_time' => 'nullable|date_format:H:i|required_with:scheduled_date',
            'appointment_id' => 'nullable|exists:appointments,id',
        ];
    }
}

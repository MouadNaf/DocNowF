<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleTreatmentVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}

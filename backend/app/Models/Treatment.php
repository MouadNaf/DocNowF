<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Treatment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'title',
        'description',
        'diagnosis',
        'status',
        'total_cost',
        'paid_amount',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'total_cost' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function steps()
    {
        return $this->hasMany(TreatmentStep::class)->orderBy('scheduled_date')->orderBy('id');
    }

    public function payments()
    {
        return $this->hasMany(TreatmentPayment::class)->latest();
    }

    public function getRemainingBalanceAttribute(): float
    {
        return max(0, (float) $this->total_cost - (float) $this->paid_amount);
    }
}

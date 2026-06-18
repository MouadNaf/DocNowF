<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'patient_id',
        'clinic_id',
        'collective_cabinet_id',
        'private_cabinet_id',
        'appointment_date',
        'start_time',
        'status',
        'cancellation_reason',
        'consultation_fee',
        'paid_amount',
        'payment_status',
    ];

    protected $casts = [
        'consultation_fee' => 'decimal:2',
        'paid_amount'      => 'decimal:2',
    ];

    public function getRemainingBalanceAttribute(): float
    {
        return max(0, (float) ($this->consultation_fee ?? 0) - (float) ($this->paid_amount ?? 0));
    }

    // Relationships
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
    public function medicalRecord(){
        return $this->hasOne(MedicalRecord::class);
    }
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }
    public function collectiveCabinet()
    {
        return $this->belongsTo(CollectiveCabinet::class);
    }
    public function privateCabinet()
    {
        return $this->belongsTo(PrivateCabinet::class);
    }
    public function consultation()
    {
        return $this->hasOne(Consultation::class);
    }


    
}
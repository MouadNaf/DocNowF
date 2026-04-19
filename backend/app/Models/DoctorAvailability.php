<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorAvailability extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'doctor_id',
        'clinic_id',
        'collective_cabinet_id',
        'private_cabinet_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    // Relationships
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
    public function clinic(){
        return $this->belongsTo(Clinic::class);
    }
    public function collectiveCabinet(){
        return $this->belongsTo(CollectiveCabinet::class);
    }
    public function privateCabinet(){
        return $this->belongsTo(PrivateCabinet::class);
    }
}

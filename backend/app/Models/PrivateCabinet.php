<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class PrivateCabinet extends Model
{
    use HasFactory;
    protected $fillable = [
        'doctor_id',
        'name',
        'city',
        'address',
        'latitude',
        'longitude',
        'is_active',
        'is_verified',
        'bio',
        'consultation_price',
        'slot_duration'
    ];

    // Cabinet belongs to a doctor
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
    public function doctorAvailabilities()
    {
        return $this->hasMany(DoctorAvailability::class);
    }
    public function doctorUnavailabilities()
    {
        return $this->hasMany(DoctorUnavailability::class);
    }

    // Cabinet can have a subscription
    public function subscriptions()
    {
        return $this->morphMany(Subscription::class, 'subscribable');
    }

    public function secretaries()
    {
        return $this->hasMany(Secretary::class);
    }

    
}
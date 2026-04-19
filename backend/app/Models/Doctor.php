<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'speciality',
        'is_verified',
        'is_active',
        'documents'
    ];
    protected $casts = [
        'documents' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function availabilities()
    {
        return $this->hasMany(DoctorAvailability::class);
    }

    public function unavailabilities()
    {
        return $this->hasMany(DoctorUnavailability::class);
    }
////////////////////////////
    public function secretaries()
    {
        return $this->hasMany(Secretary::class);
    }

    public function subscriptions()
    {
        return $this->morphMany(Subscription::class, 'subscribable');
    }

    // Optional: clinics or collective cabinets he works in (many-to-many)
    public function clinics()
    {
        return $this->belongsToMany(Clinic::class, 'clinic_doctor');
    }

    public function collectiveCabinets()
    {
        return $this->belongsToMany(CollectiveCabinet::class, 'collective_cabinet_doctor');
    }
    public function privateCabinet()
{
    return $this->hasOne(PrivateCabinet::class);
}
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clinic extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'speciality',
        'latitude',
        'longitude',
        'address',
        'city',
        'is_verified',
        'is_active',
        'documents'
    ];
     protected $casts = [
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'documents' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Link to the User account of the clinic
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Doctors working in this clinic (many-to-many)
    public function doctors()
    {
        return $this->belongsToMany(Doctor::class, 'clinic_doctor');
    }

    // Secretaries of the clinic
    public function secretaries()
    {
        return $this->hasMany(Secretary::class);
    }

    // Subscription for this clinic
    public function subscriptions()
    {
        return $this->morphMany(Subscription::class, 'subscribable');
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
    
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectiveCabinet extends Model
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
        'documents',
        'is_verified',
        'is_active'
    ];
     protected $casts = [
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'documents' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctors()
    {
        return $this->belongsToMany(Doctor::class, 'collective_cabinet_doctor');
    }

    public function secretaries()
    {
        return $this->hasMany(Secretary::class);
    }

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
    public function doctorUnavailabilities(){
        return $this->hasMany(DoctorUnavailability::class);
    }
}
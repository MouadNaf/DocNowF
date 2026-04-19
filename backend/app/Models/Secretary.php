<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Secretary extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'doctor_id',
        'clinic_id',
        'collective_cabinet_id',
        'private_cabinet_id'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /*public function clinic()
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
    }*/
}
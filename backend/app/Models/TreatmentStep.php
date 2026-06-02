<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TreatmentStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'treatment_id',
        'title',
        'description',
        'appointment_id',
        'status',
        'scheduled_date',
        'scheduled_time',
        'completed_at',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completed_at' => 'datetime',
    ];

    public function treatment()
    {
        return $this->belongsTo(Treatment::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}

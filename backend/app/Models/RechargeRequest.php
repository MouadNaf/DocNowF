<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RechargeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'amount',
        'payment_proof',
        'status',
        'notes',
        'approved_by',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}

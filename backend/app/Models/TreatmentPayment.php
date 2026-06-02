<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TreatmentPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'treatment_id',
        'recorded_by',
        'amount',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function treatment()
    {
        return $this->belongsTo(Treatment::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}

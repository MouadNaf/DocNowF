<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'appointment_id',
        'base_price',
        'extra_fees',
        'total_price'
    ];
    //relation
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function consultationItems()
    {
        return $this->hasMany(ConsultationItem::class);
    }
}

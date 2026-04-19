<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationItem extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'consultation_id',
        'service_name',
        'price'

    ];
    //relation
    public function consultation(){
        return $this->belongsTo(Consultation::class);
    }

}

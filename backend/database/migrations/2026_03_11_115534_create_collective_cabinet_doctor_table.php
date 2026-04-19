<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('collective_cabinet_doctor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collective_cabinet_id')
                  ->constrained('collective_cabinets')
                  ->onDelete('cascade');
            $table->foreignId('doctor_id')
                    ->constrained('doctors')
                    ->onDelete('cascade');
            $table->timestamps();
             $table->decimal('consultation_price',8,2)->nullable();
            $table->integer('slot_duration')->default(30);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collective_cabinet_doctor');
    }
};

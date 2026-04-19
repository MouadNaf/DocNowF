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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')
              ->constrained()
              ->onDelete('cascade');
            $table->foreignId('patient_id')
                ->constrained()
                ->onDelete('cascade');
            $table->foreignId('clinic_id')
                ->nullable()
                ->constrained()
                ->onDelete('set null');
            $table->foreignId('collective_cabinet_id')
                ->nullable()
                ->constrained()
                ->onDelete('set null');
            $table->foreignId('private_cabinet_id')
                ->nullable()
                ->constrained()
                ->onDelete('set null');
            $table->date('appointment_date');
            $table->time('start_time');
            $table->string('cancellation_reason')->nullable();
            $table->enum('status', [
                'confirmed',
                'cancelled',
                'completed'
    ])->default('confirmed');
            $table->string('reason')->nullable();

            $table->timestamps();
            $table->unique(['doctor_id', 'appointment_date', 'start_time']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};

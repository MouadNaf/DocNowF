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
        Schema::create('doctor_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
            $table->foreignId('clinic_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('collective_cabinet_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('private_cabinet_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('day_of_week',[
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday'
            ]);
            $table->time('start_time');
            $table->time('end_time');
            $table->unique(
                ['doctor_id', 'day_of_week', 'start_time', 'end_time'],
                'doctor_avail_uidx'
            );          
            $table->timestamps();
        });
        //8-12, 13-17 hundled
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::dropIfExists('doctor_availabilities');
}
};

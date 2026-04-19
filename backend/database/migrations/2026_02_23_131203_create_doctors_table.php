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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
              ->unique()
              ->constrained()
              ->onDelete('cascade');
              $table->string('speciality');
              //$table->text('bio')->nullable();
             // $table->decimal('consultation_price',8,2)->nullable();
              $table->boolean('is_verified')->default(false);
              $table->boolean('is_active')->default(true);
              $table->json('documents')->nullable();
              $table->decimal('latitude', 10, 7)->nullable();
              $table->decimal('longitude', 10, 7)->nullable();
             // $table->integer('slot_duration')->default(30);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};

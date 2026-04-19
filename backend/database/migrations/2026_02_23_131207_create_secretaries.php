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
        Schema::create('secretaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
             ->unique()
             ->constrained()
             ->onDelete('cascade');            
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');            
              //$table->foreignId('collective_cabinet_id')-> nullable()->constrained()->onDelete('cascade');
              //$table->foreignId('clinic_id')-> nullable()->constrained()->onDelete('cascade');
              //$table->foreignId('private_cabinet_id')-> nullable()->constrained()->onDelete('cascade');
              $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
   public function down(): void
    {
        Schema::dropIfExists('secretaries');  
    }
};

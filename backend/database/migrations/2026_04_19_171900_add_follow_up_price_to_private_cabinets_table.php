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
        Schema::table('private_cabinets', function (Blueprint $table) {
            if (!Schema::hasColumn('private_cabinets', 'follow_up_price')) {
                $table->decimal('follow_up_price', 8, 2)->nullable()->after('consultation_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('private_cabinets', function (Blueprint $table) {
            $table->dropColumn('follow_up_price');
        });
    }
};

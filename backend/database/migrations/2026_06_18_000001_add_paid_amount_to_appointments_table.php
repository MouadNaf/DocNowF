<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->decimal('paid_amount', 10, 2)->default(0)->after('consultation_fee');
        });

        // Sync existing fully paid appointments
        DB::table('appointments')
            ->where('payment_status', 'paid')
            ->update([
                'paid_amount' => DB::raw('COALESCE(consultation_fee, 0)'),
            ]);
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('paid_amount');
        });
    }
};

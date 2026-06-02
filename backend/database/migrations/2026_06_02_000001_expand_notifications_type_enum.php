<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Expand the ENUM to include all notification types used by NotificationService
        DB::statement("
            ALTER TABLE notifications
            MODIFY COLUMN type ENUM(
                'appointment',
                'new_appointment',
                'appointment_cancelled',
                'appointment_confirmed',
                'appointment_reminder',
                'subscription',
                'system'
            ) NOT NULL DEFAULT 'system'
        ");
    }

    public function down(): void
    {
        // Revert to original ENUM (data may be truncated if new types exist)
        DB::statement("
            ALTER TABLE notifications
            MODIFY COLUMN type ENUM('appointment','subscription','system')
            NOT NULL DEFAULT 'system'
        ");
    }
};

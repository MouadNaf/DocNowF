<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$secretaries = \App\Models\User::where('role', 'secretary')->get();
foreach ($secretaries as $sec) {
    echo "Secretary: " . $sec->name . " (User ID: " . $sec->id . ")\n";
    $secretaryRecord = $sec->secretary;
    if ($secretaryRecord) {
        $doctor = \App\Models\Doctor::with('user', 'privateCabinet')->find($secretaryRecord->doctor_id);
        if ($doctor) {
            echo "  Linked to Doctor: " . $doctor->user->name . " (ID: " . $doctor->id . ")\n";
            echo "  Private Cabinet ID: " . ($doctor->privateCabinet ? $doctor->privateCabinet->id : 'null') . "\n";
            
            $controller = app(\App\Http\Controllers\AppointmentController::class);
            $response = $controller->generateSlots($doctor->id, '2026-05-30', 'private', $doctor->privateCabinet?->id ?? 0);
            $data = $response->getData(true);
            $slots = $data['data']['slots'] ?? [];
            echo "  Slots generated for 2026-05-30: " . count($slots) . "\n";
        } else {
            echo "  Linked to Doctor ID: " . $secretaryRecord->doctor_id . " (NOT FOUND)\n";
        }
    } else {
        echo "  No secretary record\n";
    }
    echo "--------------------------\n";
}

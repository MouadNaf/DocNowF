<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('role', 'secretary')->first();
if (!$user) {
    echo "No secretary found\n";
    exit;
}

$secretary = $user->secretary;
if (!$secretary) {
    echo "User has no secretary record\n";
    exit;
}

$doctorId = $secretary->doctor_id;
$doctor = \App\Models\Doctor::find($doctorId);

if (!$doctor) {
    echo "Doctor not found\n";
    exit;
}

echo "Doctor Name: " . $doctor->user->name . "\n";
$cabinetId = $doctor->privateCabinet?->id;
echo "Cabinet ID: " . ($cabinetId ?? 'null') . "\n";

$controller = app(\App\Http\Controllers\AppointmentController::class);
$response = $controller->generateSlots($doctorId, '2026-05-30', 'private', $cabinetId);

echo json_encode($response->getData(true), JSON_PRETTY_PRINT);

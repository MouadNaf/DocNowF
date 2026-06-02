<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('name', 'like', '%Karim Amrani%')->first();
if (!$user) {
    echo "No doctor user found\n";
    exit;
}

$doctor = $user->doctor;
if (!$doctor) {
    echo "User has no doctor record\n";
    exit;
}

$doctorId = $doctor->id;
$cabinetId = $doctor->privateCabinet?->id;
echo "Doctor Name: " . $doctor->user->name . " (ID: $doctorId)\n";
echo "Cabinet ID: " . ($cabinetId ?? 'null') . "\n";

$controller = app(\App\Http\Controllers\AppointmentController::class);
$response = $controller->generateSlots($doctorId, '2026-05-30', 'private', $cabinetId);

echo json_encode($response->getData(true), JSON_PRETTY_PRINT);

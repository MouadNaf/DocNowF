<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$secretaryUser = \App\Models\User::where('role', 'secretary')->first();
if (!$secretaryUser) {
    echo "No secretary found\n";
    exit;
}

$secretary = $secretaryUser->secretary;
if (!$secretary) {
    echo "Secretary user has no secretary record\n";
    exit;
}

$doctorId = $secretary->doctor_id;
$doctor = \App\Models\Doctor::with(['user', 'privateCabinet', 'clinics', 'collectiveCabinets'])->find($doctorId);

if (!$doctor) {
    echo "Doctor not found\n";
    exit;
}

echo "Doctor ID: " . $doctor->id . "\n";
echo "Doctor Name: " . $doctor->user->name . "\n";
echo "Private Cabinet: " . ($doctor->privateCabinet ? $doctor->privateCabinet->id : 'None') . "\n";
echo "Clinics: " . count($doctor->clinics) . "\n";
echo "Collective Cabinets: " . count($doctor->collectiveCabinets) . "\n";


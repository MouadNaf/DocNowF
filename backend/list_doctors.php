<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$doctors = \App\Models\Doctor::with('user')->get();
foreach ($doctors as $d) {
    echo "Doctor ID: {$d->id}, Name: {$d->user->name}\n";
}

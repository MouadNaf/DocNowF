<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$secretaryUser = \App\Models\User::where('role', 'secretary')->first();

Auth::login($secretaryUser);
$request = \Illuminate\Http\Request::create('/api/appointments/walk-in-slots', 'GET', ['date' => '2026-05-30']);
$request->setUserResolver(function () use ($secretaryUser) {
    return $secretaryUser;
});

$controller = app(\App\Http\Controllers\DashboardController::class);
$response = $controller->availableSlots($request);

echo $response->getContent();

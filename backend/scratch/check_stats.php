<?php
use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\Patient;

$d = Doctor::first();
echo "Doctor ID: " . $d->id . "\n";
echo "Wallet Balance: " . $d->wallet_balance . "\n";

$today = "2026-05-11";
$todayAppointments = Appointment::where('doctor_id', $d->id)->whereDate('appointment_date', $today)->count();
echo "Today's Appointments: " . $todayAppointments . "\n";

$totalPatients = Patient::whereHas('appointments', fn($q) => $q->where('doctor_id', $d->id))->count();
echo "Total Patients: " . $totalPatients . "\n";

$revenueToday = Appointment::where('doctor_id', $d->id)
    ->whereDate('appointment_date', $today)
    ->where('payment_status', 'paid')
    ->sum('consultation_fee');
echo "Revenue Today: " . $revenueToday . "\n";

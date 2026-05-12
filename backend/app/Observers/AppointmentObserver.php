<?php

namespace App\Observers;

use App\Models\Appointment;
use App\Services\WalletService;

class AppointmentObserver
{
    protected $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Handle the Appointment "updated" event.
     */
    public function updated(Appointment $appointment): void
    {
        // Only deduct if status changed to 'completed'
        if ($appointment->isDirty('status') && $appointment->status === 'completed') {
            $this->walletService->deductAppointmentFee($appointment);
        }

        // Handle refund if status changed FROM 'completed' TO 'cancelled'
        if ($appointment->isDirty('status') && 
            $appointment->getOriginal('status') === 'completed' && 
            $appointment->status === 'cancelled') {
            $this->walletService->refundAppointmentFee($appointment);
        }
    }
}

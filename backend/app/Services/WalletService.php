<?php

namespace App\Services;

use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\Transaction;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class WalletService
{
    const APPOINTMENT_FEE = 50.00;

    /**
     * Deduct fee for a completed appointment.
     */
    public function deductAppointmentFee(Appointment $appointment)
    {
        return DB::transaction(function () use ($appointment) {
            $doctor = Doctor::where('id', $appointment->doctor_id)->lockForUpdate()->first();

            // Prevent double deduction
            if (Transaction::where('appointment_id', $appointment->id)->where('type', 'appointment_fee')->exists()) {
                return false;
            }

            $balanceBefore = $doctor->wallet_balance;
            $doctor->wallet_balance -= self::APPOINTMENT_FEE;
            $doctor->save();

            Transaction::create([
                'doctor_id' => $doctor->id,
                'amount' => -self::APPOINTMENT_FEE,
                'type' => 'appointment_fee',
                'description' => "Fee for appointment #{$appointment->id}",
                'appointment_id' => $appointment->id,
                'balance_before' => $balanceBefore,
                'balance_after' => $doctor->wallet_balance,
            ]);

            $this->checkLowBalance($doctor);

            return true;
        });
    }

    /**
     * Recharge doctor wallet.
     */
    public function recharge(Doctor $doctor, float $amount, string $description, ?int $createdBy = null)
    {
        return DB::transaction(function () use ($doctor, $amount, $description, $createdBy) {
            $doctor = Doctor::where('id', $doctor->id)->lockForUpdate()->first();
            $balanceBefore = $doctor->wallet_balance;
            $doctor->wallet_balance += $amount;
            $doctor->save();

            $transaction = Transaction::create([
                'doctor_id' => $doctor->id,
                'amount' => $amount,
                'type' => 'recharge',
                'description' => $description,
                'created_by' => $createdBy,
                'balance_before' => $balanceBefore,
                'balance_after' => $doctor->wallet_balance,
            ]);

            try {
                Notification::create([
                    'user_id' => $doctor->user_id,
                    'title' => 'Recharge Successful',
                    'message' => "Your wallet has been recharged with {$amount} DA. Your new balance is {$doctor->wallet_balance} DA.",
                    'type' => 'wallet_success',
                    'is_read' => false,
                ]);
            } catch (\Exception $e) {
                // Log notification failure but don't roll back recharge
                \Log::error("Failed to create recharge notification: " . $e->getMessage());
            }

            return $transaction;
        });
    }

    /**
     * Refund fee for a cancelled appointment (if it was already deducted).
     */
    public function refundAppointmentFee(Appointment $appointment)
    {
        return DB::transaction(function () use ($appointment) {
            $doctor = Doctor::where('id', $appointment->doctor_id)->lockForUpdate()->first();

            // Check if fee was actually deducted
            $originalTransaction = Transaction::where('appointment_id', $appointment->id)
                ->where('type', 'appointment_fee')
                ->first();

            if (!$originalTransaction) {
                return false;
            }

            // Prevent double refund
            if (Transaction::where('appointment_id', $appointment->id)->where('type', 'refund')->exists()) {
                return false;
            }

            $amountToRefund = abs($originalTransaction->amount);
            $balanceBefore = $doctor->wallet_balance;
            $doctor->wallet_balance += $amountToRefund;
            $doctor->save();

            Transaction::create([
                'doctor_id' => $doctor->id,
                'amount' => $amountToRefund,
                'type' => 'refund',
                'description' => "Refund for appointment #{$appointment->id}",
                'appointment_id' => $appointment->id,
                'balance_before' => $balanceBefore,
                'balance_after' => $doctor->wallet_balance,
            ]);

            return true;
        });
    }

    /**
     * Check if balance is low and send notification.
     */
    protected function checkLowBalance(Doctor $doctor)
    {
        if ($doctor->wallet_balance <= $doctor->low_balance_threshold && $doctor->wallet_balance > 0) {
            Notification::create([
                'user_id' => $doctor->user_id,
                'title' => 'Low Wallet Balance',
                'message' => "Your balance is low ({$doctor->wallet_balance} DA). Please recharge to continue receiving appointments.",
                'type' => 'wallet_warning',
                'is_read' => false,
            ]);
        } elseif ($doctor->wallet_balance <= 0) {
            Notification::create([
                'user_id' => $doctor->user_id,
                'title' => 'Wallet Exhausted',
                'message' => "Your balance has reached 0. You are now unavailable for new bookings until you recharge.",
                'type' => 'wallet_error',
                'is_read' => false,
            ]);
        }
    }

    /**
     * Check if doctor can receive new bookings.
     */
    public function canBook(Doctor $doctor)
    {
        return $doctor->wallet_balance > 0;
    }
    /**
     * Notify doctor about recharge rejection.
     */
    public function notifyRechargeRejected(Doctor $doctor, string $reason = '')
    {
        Notification::create([
            'user_id' => $doctor->user_id,
            'title' => 'Recharge Request Rejected',
            'message' => "Your recharge request was rejected. " . ($reason ? "Reason: {$reason}" : ""),
            'type' => 'wallet_error',
            'is_read' => false,
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Treatment;

class NotificationService
{
    /**
     * Send a notification to a specific user.
     */
    public static function send(int $userId, string $title, string $message, string $type, array $data = []): void
    {
        try {
            Notification::create([
                'user_id' => $userId,
                'title'   => $title,
                'message' => $message,
                'type'    => $type,
                'data'    => $data,
                'is_read' => false,
            ]);
        } catch (\Exception $e) {
            \Log::error("Failed to send notification to user {$userId}: " . $e->getMessage());
        }
    }

    /**
     * Notify all admin users.
     */
    public static function notifyAdmins(string $title, string $message, string $type = 'system', array $data = []): void
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            self::send($admin->id, $title, $message, $type, $data);
        }
    }

    /**
     * Notify all parties when a new appointment is booked.
     * Sends to: Doctor + Secretary (if any) + Patient
     */
    public static function appointmentBooked(Appointment $appointment): void
    {
        $appointment->load(['doctor.user', 'doctor.secretaries.user', 'patient.user']);

        $doctor  = $appointment->doctor;
        $patient = $appointment->patient;

        $dateFormatted = \Carbon\Carbon::parse($appointment->appointment_date)
            ->locale('fr')
            ->translatedFormat('l d F Y');
        $time = \Carbon\Carbon::parse($appointment->start_time)->format('H:i');

        // ── Notify Doctor ──────────────────────────────────────────────────
        if ($doctor?->user) {
            self::send(
                $doctor->user->id,
                'Nouveau rendez-vous',
                "Un nouveau rendez-vous a été pris le {$dateFormatted} à {$time}" .
                    ($patient?->user ? " avec {$patient->user->name}" : '') . '.',
                'appointment',
                ['appointment_id' => $appointment->id]
            );
        }

        // ── Notify Secretary (if any) ──────────────────────────────────────
        if ($doctor) {
            foreach ($doctor->secretaries as $secretary) {
                if ($secretary->user) {
                    self::send(
                        $secretary->user->id,
                        'Nouveau rendez-vous',
                        "Un rendez-vous a été ajouté le {$dateFormatted} à {$time}" .
                            ($patient?->user ? " pour {$patient->user->name}" : '') . '.',
                        'appointment',
                        ['appointment_id' => $appointment->id]
                    );
                }
            }
        }

        // ── Notify Patient ─────────────────────────────────────────────────
        if ($patient?->user) {
            self::send(
                $patient->user->id,
                'Rendez-vous confirmé',
                "Votre rendez-vous est confirmé le {$dateFormatted} à {$time}" .
                    ($doctor?->user ? " avec Dr. {$doctor->user->name}" : '') . '.',
                'appointment',
                ['appointment_id' => $appointment->id]
            );
        }
    }

    /**
     * Notify all parties when an appointment is cancelled.
     */
    public static function appointmentCancelled(Appointment $appointment, string $reason = ''): void
    {
        $appointment->load(['doctor.user', 'doctor.secretaries.user', 'patient.user']);

        $doctor  = $appointment->doctor;
        $patient = $appointment->patient;

        $dateFormatted = \Carbon\Carbon::parse($appointment->appointment_date)
            ->locale('fr')
            ->translatedFormat('l d F Y');
        $time = \Carbon\Carbon::parse($appointment->start_time)->format('H:i');
        $reasonText = $reason ? " Raison: {$reason}" : '';

        // ── Notify Doctor ──────────────────────────────────────────────────
        if ($doctor?->user) {
            self::send(
                $doctor->user->id,
                'Rendez-vous annulé',
                "Le rendez-vous du {$dateFormatted} à {$time}" .
                    ($patient?->user ? " avec {$patient->user->name}" : '') .
                    " a été annulé.{$reasonText}",
                'appointment',
                ['appointment_id' => $appointment->id]
            );
        }

        // ── Notify Secretary ───────────────────────────────────────────────
        if ($doctor) {
            foreach ($doctor->secretaries as $secretary) {
                if ($secretary->user) {
                    self::send(
                        $secretary->user->id,
                        'Rendez-vous annulé',
                        "Le rendez-vous du {$dateFormatted} à {$time}" .
                            ($patient?->user ? " pour {$patient->user->name}" : '') .
                            " a été annulé.{$reasonText}",
                        'appointment',
                        ['appointment_id' => $appointment->id]
                    );
                }
            }
        }

        // ── Notify Patient ─────────────────────────────────────────────────
        if ($patient?->user) {
            self::send(
                $patient->user->id,
                'Rendez-vous annulé',
                "Votre rendez-vous du {$dateFormatted} à {$time}" .
                    ($doctor?->user ? " avec Dr. {$doctor->user->name}" : '') .
                    " a été annulé.{$reasonText}",
                'appointment',
                ['appointment_id' => $appointment->id]
            );
        }
    }

    /**
     * Notify all parties when an appointment is rescheduled.
     */
    public static function appointmentRescheduled(Appointment $appointment, string $oldDate = '', string $oldTime = ''): void
    {
        $appointment->load(['doctor.user', 'doctor.secretaries.user', 'patient.user']);

        $doctor  = $appointment->doctor;
        $patient = $appointment->patient;

        $dateFormatted = \Carbon\Carbon::parse($appointment->appointment_date)
            ->locale('fr')
            ->translatedFormat('l d F Y');
        $time = \Carbon\Carbon::parse($appointment->start_time)->format('H:i');
        
        $oldDateFormatted = $oldDate ? \Carbon\Carbon::parse($oldDate)->locale('fr')->translatedFormat('l d F Y') : '';
        $oldText = ($oldDateFormatted && $oldTime) ? " (précédemment le {$oldDateFormatted} à {$oldTime})" : '';

        // ── Notify Doctor ──────────────────────────────────────────────────
        if ($doctor?->user) {
            self::send(
                $doctor->user->id,
                'Rendez-vous replanifié',
                "Le rendez-vous" . ($patient?->user ? " avec {$patient->user->name}" : '') . 
                    " a été replanifié pour le {$dateFormatted} à {$time}{$oldText}.",
                'appointment',
                ['appointment_id' => $appointment->id]
            );
        }

        // ── Notify Secretary ───────────────────────────────────────────────
        if ($doctor) {
            foreach ($doctor->secretaries as $secretary) {
                if ($secretary->user) {
                    self::send(
                        $secretary->user->id,
                        'Rendez-vous replanifié',
                        "Le rendez-vous" . ($patient?->user ? " pour {$patient->user->name}" : '') . 
                            " a été replanifié pour le {$dateFormatted} à {$time}{$oldText}.",
                        'appointment',
                        ['appointment_id' => $appointment->id]
                    );
                }
            }
        }

        // ── Notify Patient ─────────────────────────────────────────────────
        if ($patient?->user) {
            self::send(
                $patient->user->id,
                'Rendez-vous replanifié',
                "Votre rendez-vous" . ($doctor?->user ? " avec Dr. {$doctor->user->name}" : '') . 
                    " a été replanifié pour le {$dateFormatted} à {$time}{$oldText}.",
                'appointment',
                ['appointment_id' => $appointment->id]
            );
        }
    }

    /**
     * Notify patient when a new treatment is created.
     */
    public static function treatmentCreated(Treatment $treatment): void
    {
        $treatment->load(['patient.user', 'doctor.user']);
        $patient = $treatment->patient;
        $doctor = $treatment->doctor;

        if ($patient?->user && $doctor?->user) {
            self::send(
                $patient->user->id,
                'Nouveau traitement',
                "Dr. {$doctor->user->name} vous a assigné un nouveau traitement : {$treatment->title}.",
                'system',
                ['treatment_id' => $treatment->id]
            );
        }
    }
}

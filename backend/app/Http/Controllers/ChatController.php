<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Appointment;
use App\Services\GeminiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    // ─────────────────────────────────────────────────────────────
    // POST /api/chat
    // ─────────────────────────────────────────────────────────────
    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $today  = Carbon::now('Africa/Algiers')->toDateString();
        $intent = $this->gemini->getIntent($request->message, $today);

        $response = match ($intent['intent'] ?? 'faq') {
            'search_doctor'      => $this->handleSearchDoctor($intent),
            'check_availability' => $this->handleCheckAvailability($intent),
            'book_appointment'   => $this->handleBookAppointment($intent, $request),
            'view_appointments'  => $this->handleViewAppointments(),
            'cancel_appointment' => $this->handleCancelAppointment($intent),
            default              => $this->handleFaq($intent),
        };

        Log::info('Chatbot: Final API Response', [
            'status' => $response->getStatusCode(),
            'content' => $response->getContent()
        ]);

        return $response;
    }

    // ─────────────────────────────────────────────────────────────
    // 1. SEARCH DOCTOR
    // ─────────────────────────────────────────────────────────────
    private function handleSearchDoctor(array $intent)
    {
        $query = Doctor::with(['user', 'privateCabinet'])
            ->whereHas('privateCabinet')
            ->where('is_verified', true);

        if (!empty($intent['specialty'])) {
            $query->where('speciality', 'like', '%' . $intent['specialty'] . '%');
        }

        if (!empty($intent['city'])) {
            $query->whereHas('user', function ($q) use ($intent) {
                $q->where('city', 'like', '%' . $intent['city'] . '%');
            });
        }

        $doctors = $query->get()->map(fn($d) => $this->formatDoctor($d));

        if ($doctors->isEmpty()) {
            $msg = 'No doctors found';
            if (!empty($intent['specialty'])) $msg .= " for specialty \"{$intent['specialty']}\"";
            if (!empty($intent['city']))      $msg .= " in {$intent['city']}";
            $msg .= '. Try a different search.';
            return $this->respond($msg, 'text', []);
        }

        $specialty = $intent['specialty'] ?? 'the requested specialty';
        $city      = $intent['city']      ?? 'all cities';

        return $this->respond(
            "Found {$doctors->count()} doctor(s) for \"{$specialty}\" in {$city}:",
            'doctors',
            $doctors->values()->all()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CHECK AVAILABILITY
    // ─────────────────────────────────────────────────────────────
    private function handleCheckAvailability(array $intent)
    {
        $query = Doctor::with(['user', 'privateCabinet', 'availabilities'])
            ->whereHas('privateCabinet')
            ->where('is_verified', true);

        if (!empty($intent['doctor_name'])) {
            $query->whereHas('user', function ($q) use ($intent) {
                $q->where('name', 'like', '%' . $intent['doctor_name'] . '%');
            });
        }

        $doctors = $query->get();

        if ($doctors->isEmpty()) {
            return $this->respond('No matching doctors found to check availability.', 'text', []);
        }

        $date    = $intent['date'] ?? Carbon::now('Africa/Algiers')->toDateString();
        $dayName = strtolower(Carbon::parse($date)->format('l'));

        $available = $doctors->filter(function ($doctor) use ($dayName) {
            return $doctor->availabilities
                ->where('day_of_week', $dayName)
                ->isNotEmpty();
        });

        if ($available->isEmpty()) {
            return $this->respond(
                "No doctors are available on " . Carbon::parse($date)->format('l, M j Y') . ".",
                'doctors',
                []
            );
        }

        return $this->respond(
            "{$available->count()} doctor(s) available on " . Carbon::parse($date)->format('l, M j Y') . ':',
            'doctors',
            $available->map(fn($d) => $this->formatDoctor($d))->values()->all()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 3. BOOK APPOINTMENT
    // ─────────────────────────────────────────────────────────────
    private function handleBookAppointment(array $intent, Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'patient') {
            return $this->respond('Only patients can book appointments.', 'text', []);
        }

        if (empty($intent['doctor_name'])) {
            return $this->respond('Which doctor would you like to book with?', 'text', []);
        }

        $doctorName = trim($intent['doctor_name'] ?? '');
        // Remove "Dr" or "Dr." prefix if Gemini missed it
        $doctorName = preg_replace('/^(dr|doctor|pr)\.?\s+/i', '', $doctorName);

        $doctor = Doctor::with(['user', 'privateCabinet'])
            ->whereHas('privateCabinet')
            ->where('is_verified', true)
            ->whereHas('user', function ($q) use ($doctorName) {
                $q->where('name', 'like', '%' . $doctorName . '%');
            })
            ->first();

        if (!$doctor) {
            return $this->respond(
                "I couldn't find a doctor named \"{$intent['doctor_name']}\".",
                'text',
                []
            );
        }

        $date = $intent['date'] ?? Carbon::now('Africa/Algiers')->toDateString();
        $time = $intent['time'] ?? null;

        // If time is missing, we can't book yet. Show doctor and ask for time.
        if (!$time) {
            return $this->respond(
                "I found Dr. {$doctor->user->name}. What time would you like to book for on {$date}?",
                'doctors',
                [$this->formatDoctor($doctor)]
            );
        }

        // 🔹 Check if already booked
        $exists = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $date)
            ->where('start_time', 'like', $time . '%')
            ->where('status', 'confirmed')
            ->exists();

        if ($exists) {
            return $this->respond(
                "I'm sorry, Dr. {$doctor->user->name} already has an appointment at {$time} on {$date}. Please choose another time.",
                'doctors',
                [$this->formatDoctor($doctor)]
            );
        }

        // 🔹 Create the appointment
        try {
            $appointment = Appointment::create([
                'doctor_id'          => $doctor->id,
                'patient_id'         => $user->patient->id,
                'appointment_date'   => $date,
                'start_time'         => $time,
                'status'             => 'confirmed',
                'private_cabinet_id' => $doctor->privateCabinet->id,
            ]);

            return $this->respond(
                "✅ Appointment confirmed with Dr. {$doctor->user->name} on " . Carbon::parse($date)->format('M j, Y') . " at {$time}.",
                'appointments',
                [$this->formatAppointment($appointment)]
            );
        } catch (\Throwable $e) {
            Log::error('Chatbot booking failed: ' . $e->getMessage());
            return $this->respond(
                "I couldn't complete the booking. Please try booking directly from the doctor's profile.",
                'doctors',
                [$this->formatDoctor($doctor)]
            );
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. VIEW APPOINTMENTS
    // ─────────────────────────────────────────────────────────────
    private function handleViewAppointments()
    {
        $user = Auth::user();

        if ($user->role !== 'patient') {
            return $this->respond('Only patients can view their appointments.', 'text', []);
        }

        $appointments = Appointment::with(['doctor.user'])
            ->where('patient_id', $user->patient->id)
            ->orderBy('appointment_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(fn($a) => $this->formatAppointment($a));

        if ($appointments->isEmpty()) {
            return $this->respond('You have no appointments yet.', 'text', []);
        }

        return $this->respond(
            "You have {$appointments->count()} appointment(s):",
            'appointments',
            $appointments->values()->all()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 5. CANCEL APPOINTMENT
    // ─────────────────────────────────────────────────────────────
    private function handleCancelAppointment(array $intent)
    {
        $user = Auth::user();

        if ($user->role !== 'patient') {
            return $this->respond('Only patients can cancel their appointments.', 'text', []);
        }

        // If appointment_id is not known, show the list so user can pick
        if (empty($intent['appointment_id'])) {
            $upcoming = Appointment::with(['doctor.user'])
                ->where('patient_id', $user->patient->id)
                ->whereIn('status', ['confirmed'])
                ->whereDate('appointment_date', '>=', Carbon::now('Africa/Algiers')->toDateString())
                ->orderBy('appointment_date')
                ->get()
                ->map(fn($a) => $this->formatAppointment($a));

            if ($upcoming->isEmpty()) {
                return $this->respond('You have no upcoming appointments to cancel.', 'text', []);
            }

            return $this->respond(
                'Which appointment would you like to cancel? Here are your upcoming ones:',
                'appointments',
                $upcoming->values()->all()
            );
        }

        // Direct cancel by id
        $appointment = Appointment::where('patient_id', $user->patient->id)
            ->find($intent['appointment_id']);

        if (!$appointment) {
            return $this->respond('Appointment not found or does not belong to you.', 'text', []);
        }

        if ($appointment->status === 'cancelled') {
            return $this->respond('This appointment is already cancelled.', 'text', []);
        }

        $appointment->update([
            'status'              => 'cancelled',
            'cancellation_reason' => 'Cancelled via chatbot',
            'cancelled_at'        => now(),
        ]);

        return $this->respond(
            "Your appointment with Dr. {$appointment->doctor->user->name} on {$appointment->appointment_date} has been cancelled.",
            'text',
            []
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 6. FAQ
    // ─────────────────────────────────────────────────────────────
    private function handleFaq(array $intent)
    {
        // 🔹 Debugging: if we have a specific error from GeminiService, show it
        if (isset($intent['error'])) {
            return $this->respond(
                "Gemini API Error: {$intent['error']}. Check your laravel.log for details.",
                'text',
                []
            );
        }

        $question = $intent['question'] ?? $intent['raw'] ?? 'your question';

        $faqs = [
            'hours'       => 'Most clinics are open Monday–Saturday, 8:00 AM to 6:00 PM.',
            'price'       => 'Consultation fees vary by doctor. Check the doctor\'s profile for exact pricing.',
            'cancel'      => 'You can cancel an appointment up to 2 hours before the scheduled time.',
            'payment'     => 'Payment is collected at the clinic on the day of your appointment.',
            'emergency'   => 'For emergencies, please call 15 (SAMU) or go to the nearest emergency room.',
            'booking'     => 'You can book an appointment by searching for a doctor and selecting an available slot.',
        ];

        $q = strtolower($question);
        foreach ($faqs as $keyword => $answer) {
            if (str_contains($q, $keyword)) {
                return $this->respond($answer, 'text', []);
            }
        }

        return $this->respond(
            "I can help you search for doctors, check availability, book or cancel appointments. "
            . "What would you like to do?",
            'text',
            []
        );
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────
    private function formatDoctor(Doctor $doctor): array
    {
        $cabinet = $doctor->privateCabinet;
        return [
            'id'              => (string) $doctor->id,
            'name'            => $doctor->user->name,
            'specialty'       => $doctor->speciality ?? 'General Doctor',
            'city'            => $doctor->user->city,
            'address'         => $doctor->user->address,
            'phone_number'    => $doctor->user->phone_number,
            'profile_picture' => $this->resolveProfilePicture($doctor->user->profile_picture, $doctor->user->name),
            'fee'             => $cabinet ? ($cabinet->consultation_price ? 'DA ' . $cabinet->consultation_price : 'N/A') : 'N/A',
            'about'           => $cabinet?->bio ?? 'No bio available.',
            'hospital'        => $cabinet?->name ?? '',
            'cabinet_id'      => (string) ($cabinet?->id ?? ''),
            'cabinet_type'    => 'private',
            'is_verified'     => (bool) $doctor->is_verified,
        ];
    }

    private function formatAppointment(Appointment $appointment): array
    {
        $doctor     = $appointment->doctor;
        $doctorUser = $doctor?->user;

        $location = $appointment->private_cabinet_id
            ? 'Private Cabinet'
            : ($appointment->clinic_id
                ? 'Clinic'
                : ($appointment->collective_cabinet_id ? 'Collective Cabinet' : 'Medical Appointment'));

        return [
            'id'              => (string) $appointment->id,
            'doctor_name'     => $doctorUser?->name ?? 'Doctor',
            'doctor_specialty'=> $doctor?->speciality ?? 'Specialist',
            'doctor_image'    => $this->resolveProfilePicture($doctorUser?->profile_picture, $doctorUser?->name ?? 'Doctor'),
            'date'            => $appointment->appointment_date,
            'time'            => $appointment->start_time,
            'status'          => $appointment->status,
            'location'        => $location,
        ];
    }

    private function resolveProfilePicture(?string $picture, string $name): string
    {
        if (!$picture) {
            return 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=random';
        }
        if (str_starts_with($picture, 'http')) {
            return $picture;
        }
        return asset('storage/' . $picture);
    }

    private function respond(string $message, string $type, array $data): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'message' => $message,
            'type'    => $type,
            'data'    => $data,
        ]);
    }
}

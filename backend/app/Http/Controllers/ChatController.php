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
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array',
        ]);

        $history = $request->input('history', []);

        $today  = Carbon::now('Africa/Algiers')->toDateString();
        $intent = $this->gemini->getIntent($request->message, $today, $history);

        return match ($intent['intent'] ?? 'faq') {
            'search_doctor'        => $this->handleSearchDoctor($intent),
            'check_availability'   => $this->handleCheckAvailability($intent),
            'book_appointment'     => $this->handleBookAppointment($intent, $request),
            'view_appointments'    => $this->handleViewAppointments(),
            'cancel_appointment'   => $this->handleCancelAppointment($intent),
            'symptom_guidance'     => $this->handleSymptomGuidance($intent),
            'clarification_needed' => $this->handleClarification($intent),
            default                => $this->handleFaq($intent),
        };
    }

    // ─────────────────────────────────────────────────────────────
    // 0. CLARIFICATION NEEDED
    // ─────────────────────────────────────────────────────────────
    private function handleClarification(array $intent)
    {
        $question = $intent['question'] ?? "I didn't quite catch that. Could you clarify what you're looking for?";
        return $this->respond($question, 'text', [], true);
    }

    // ─────────────────────────────────────────────────────────────
    // 1. SEARCH DOCTOR
    // ─────────────────────────────────────────────────────────────
    private function handleSearchDoctor(array $intent)
    {
        $query = Doctor::with(['user', 'privateCabinet'])
            ->whereHas('privateCabinet')
            ->where('is_verified', true)
            ->where('wallet_balance', '>', 0);

        // 🔹 Priority 1: Search by name if provided (Precise)
        if (!empty($intent['doctor_name'])) {
            $name = trim($intent['doctor_name']);
            $query->whereHas('user', function ($q) use ($name) {
                $q->where('name', 'like', '%' . $name . '%');
            });
        } 
        // 🔹 Priority 2: Search by specialty, city, and gender
        else {
            if (!empty($intent['specialty'])) {
                $query->where('speciality', 'like', '%' . $intent['specialty'] . '%');
            }
            if (!empty($intent['city'])) {
                $query->whereHas('user', function ($q) use ($intent) {
                    $q->where('city', 'like', '%' . $intent['city'] . '%');
                });
            }
            if (!empty($intent['gender'])) {
                $gender = strtolower($intent['gender']);
                if (in_array($gender, ['male', 'female'])) {
                    $query->whereHas('user', function ($q) use ($gender) {
                        $q->where('gender', $gender);
                    });
                }
            }
            // Note: Experience is currently hardcoded to "10 years" in the return format
            // so we don't query it from DB unless there's an actual column.
        }

        $doctors = $query->limit(5)->get();

        if ($doctors->isEmpty()) {
            return $this->respond("I couldn't find any doctors matching your search.", 'text', []);
        }

        $count = $doctors->count();
        $msg = (!empty($intent['doctor_name']) && $count === 1)
            ? "I found Dr. {$doctors->first()->user->name} for you."
            : "I found $count doctor(s) for your search:";

        return $this->respond(
            $msg,
            'doctors',
            $doctors->map(fn($d) => $this->formatDoctor($d))->values()->all()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CHECK AVAILABILITY
    // ─────────────────────────────────────────────────────────────
    private function handleCheckAvailability(array $intent)
    {
        $query = Doctor::with(['user', 'privateCabinet', 'availabilities'])
            ->whereHas('privateCabinet')
            ->where('is_verified', true)
            ->where('wallet_balance', '>', 0);

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
            return $this->respond('Sure, I can help you book an appointment. Which specialty or doctor would you like?', 'text', []);
        }

        $doctorName = trim($intent['doctor_name'] ?? '');
        // Remove "Dr" or "Dr." prefix if Gemini missed it
        $doctorName = preg_replace('/^(dr|doctor|pr)\.?\s+/i', '', $doctorName);

        $doctor = Doctor::with(['user', 'privateCabinet'])
            ->whereHas('privateCabinet')
            ->where('is_verified', true)
            ->where('wallet_balance', '>', 0)
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
                'reason'             => 'Booked via DocNow AI Assistant',
                'payment_status'     => 'unpaid',
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
    // 7. SYMPTOM GUIDANCE
    // ─────────────────────────────────────────────────────────────
    private function handleSymptomGuidance(array $intent)
    {
        $specialty = $intent['recommended_specialty'] ?? 'a specialist';
        $symptoms  = $intent['symptoms'] ?? 'your symptoms';

        $msg = "Based on your symptoms ($symptoms), I recommend consulting $specialty. "
             . "Would you like me to find a doctor in this specialty for you?";

        return $this->respond($msg, 'text', [], true);
    }

    // ─────────────────────────────────────────────────────────────
    // 8. FAQ
    // ─────────────────────────────────────────────────────────────
    private function handleFaq(array $intent)
    {
        // 🔹 Debugging: if we have a specific error from GeminiService, show it
        if (isset($intent['error'])) {
            return $this->respond(
                "Gemini API Error: {$intent['error']}. Check your laravel.log for details.",
                'text',
                [],
                false
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
                return $this->respond($answer, 'text', [], true);
            }
        }

        return $this->respond(
            "I can help you search for doctors, check availability, book or cancel appointments. "
            . "What would you like to do?",
            'text',
            [],
            true
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

    /**
     * Smart NLP local fallback intent extractor.
     * Understands natural language without requiring exact phrases.
     */
    private function localFallbackIntent(string $message, string $today): array
    {
        $msg      = strtolower(trim($message));
        $original = trim($message);

        // ── Extract TIME ────────────────────────────────────────────────────
        $time = null;
        if (preg_match('/\b(\d{1,2}):(\d{2})\b/', $msg, $m)) {
            $time = sprintf('%02d:%02d', (int)$m[1], (int)$m[2]);
        } elseif (preg_match('/\b(\d{1,2})\s*h(\d{0,2})\b/', $msg, $m)) {
            $time = sprintf('%02d:%02d', (int)$m[1], (int)($m[2] ?: 0));
        } elseif (preg_match('/\bat\s+(\d{1,2})(?:am|pm)?\b/', $msg, $m)) {
            $h = (int)$m[1];
            if (str_contains($msg, 'pm') && $h < 12) $h += 12;
            $time = sprintf('%02d:00', $h);
        } elseif (preg_match('/\b(\d{1,2})\s*(?:am|pm)\b/', $msg, $m)) {
            $h = (int)$m[1];
            if (str_contains($msg, 'pm') && $h < 12) $h += 12;
            if (str_contains($msg, 'am') && $h == 12) $h = 0;
            $time = sprintf('%02d:00', $h);
        }

        // ── Extract DATE ─────────────────────────────────────────────────────
        $date = $today;
        if (str_contains($msg, 'tomorrow') || str_contains($msg, 'demain')) {
            $date = Carbon::parse($today)->addDay()->toDateString();
        } elseif (preg_match('/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/', $msg, $m)) {
            $date = Carbon::parse('next ' . $m[1])->toDateString();
        } elseif (preg_match('/\b(\d{4}-\d{2}-\d{2})\b/', $msg, $m)) {
            $date = $m[1];
        }

        // ── Extract DOCTOR NAME ──────────────────────────────────────────────
        $doctorName = null;
        // Explicit "dr" / "doctor" prefix
        if (preg_match('/\b(?:dr\.?|doctor|dre|docteur)\s+([a-z]+(?:\s+[a-z]+)?)/i', $original, $m)) {
            $doctorName = strtolower(trim($m[1]));
        }
        // "with/see/chez/book" pattern
        if (!$doctorName && preg_match('/\b(?:with|see|chez|avec|visit|book)\s+([a-z]{3,}(?:\s+[a-z]{3,})?)/i', $original, $m)) {
            $candidate = strtolower(trim($m[1]));
            if (!in_array($candidate, ['my', 'the', 'a', 'an', 'appointment', 'doctor', 'him', 'her'])) {
                $doctorName = $candidate;
            }
        }

        // ── Extract SPECIALTY ────────────────────────────────────────────────
        $specialtyMap = [
            'cardiolog' => 'cardiology',      'heart'        => 'cardiology',
            'dentist'   => 'dentistry',       'teeth'        => 'dentistry',    'tooth' => 'dentistry',
            'dermatol'  => 'dermatology',     'skin'         => 'dermatology',
            'pediatr'   => 'pediatrics',      'children'     => 'pediatrics',   'child' => 'pediatrics',
            'neurolog'  => 'neurology',       'brain'        => 'neurology',
            'orthoped'  => 'orthopedics',     'bone'         => 'orthopedics',  'joint' => 'orthopedics',
            'gynecolog' => 'gynecology',
            'ophthalm'  => 'ophthalmology',   'eye'          => 'ophthalmology',
            'psychiat'  => 'psychiatry',      'mental'       => 'psychiatry',
            'endocrin'  => 'endocrinology',   'diabetes'     => 'endocrinology',
            'gastrolog' => 'gastroenterology','stomach'      => 'gastroenterology',
            'urology'   => 'urology',         'kidney'       => 'urology',
            'pulmonol'  => 'pulmonology',     'lung'         => 'pulmonology',
            'general'   => 'general medicine','medecin'      => 'general medicine',
        ];
        $specialty = null;
        foreach ($specialtyMap as $keyword => $value) {
            if (str_contains($msg, $keyword)) { $specialty = $value; break; }
        }

        // ── Detect SYMPTOMS ──────────────────────────────────────────────────
        $symptomWords = ['pain','ache','fever','cough','sick','hurt','tired','dizzy',
                         'nausea','vomit','bleed','swollen','rash','allerg','infection',
                         'douleur','mal','fievre','toux','malade'];
        $hasSymptom = false;
        foreach ($symptomWords as $sym) {
            if (str_contains($msg, $sym)) { $hasSymptom = true; break; }
        }

        // ────────────────────────────────────────────────────────────────────
        // INTENT DETECTION (priority order)
        // ────────────────────────────────────────────────────────────────────

        // 1. VIEW APPOINTMENTS
        $viewPhrases = ['my appointment','show appointment','view appointment','list appointment',
                        'my visit','my booking','my schedule','upcoming appointment',
                        'show my','view my','see my appointment','all appointment','my rdv','mes rendez'];
        foreach ($viewPhrases as $phrase) {
            if (str_contains($msg, $phrase)) return ['intent' => 'view_appointments'];
        }

        // 2. CANCEL
        $cancelPhrases = ['cancel','annul','remove appointment','delete appointment',
                          "don't want",'dont want','no longer need','not going','stop appointment'];
        foreach ($cancelPhrases as $phrase) {
            if (str_contains($msg, $phrase)) return ['intent' => 'cancel_appointment', 'appointment_id' => null];
        }

        // 3. BOOK
        $bookPhrases = ['book','reserv','schedul','make appointment','set appointment',
                        'create appointment','want to see','want to visit','see a doctor',
                        'appointment with','rendez-vous','prendre rdv','take appointment',
                        'new appointment','fix appointment','want appointment','need appointment',
                        'need a doctor','passer chez'];
        $isBook = false;
        foreach ($bookPhrases as $phrase) {
            if (str_contains($msg, $phrase)) { $isBook = true; break; }
        }
        if ($isBook || ($doctorName && $time)) {
            return [
                'intent'      => 'book_appointment',
                'doctor_name' => $doctorName,
                'date'        => $date,
                'time'        => $time,
            ];
        }

        // 4. AVAILABILITY
        $availPhrases = ['available','availability','free slot','open slot','when is',
                         'schedule of','working today','working tomorrow','dispo','disponible'];
        foreach ($availPhrases as $phrase) {
            if (str_contains($msg, $phrase)) {
                return ['intent' => 'check_availability', 'doctor_name' => $doctorName, 'date' => $date];
            }
        }

        // 5. SYMPTOM GUIDANCE
        if ($hasSymptom) {
            return [
                'intent'                => 'symptom_guidance',
                'symptoms'              => $original,
                'recommended_specialty' => $specialty ?? 'a general practitioner',
            ];
        }

        // 6. SEARCH DOCTOR
        $searchPhrases = ['find','search','look for','show doctor','list doctor','find doctor',
                          'who is','get doctor','nearby doctor','doctor near','cherche','trouver'];
        $isSearch = false;
        foreach ($searchPhrases as $phrase) {
            if (str_contains($msg, $phrase)) { $isSearch = true; break; }
        }
        if ($isSearch || $specialty || $doctorName) {
            return [
                'intent'      => 'search_doctor',
                'specialty'   => $specialty,
                'doctor_name' => $doctorName,
                'city'        => str_contains($msg, 'alger') ? 'Alger' : (str_contains($msg, 'oran') ? 'Oran' : null),
            ];
        }

        // 7. FAQ / DEFAULT
        return ['intent' => 'faq', 'question' => $original];
    }

    private function respond(string $message, string $type, array $data, bool $success = true): \Illuminate\Http\JsonResponse
    {
        $res = [
            'success' => $success,
            'message' => $message,
            'type'    => $type,
            'data'    => $data,
        ];

        Log::info('Chatbot: Final API Response', $res);

        return response()->json($res);
    }
}

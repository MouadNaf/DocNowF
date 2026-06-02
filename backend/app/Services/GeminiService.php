<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;
    private string $endpoint;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    }

    /**
     * Send a user message to Gemini and get back a structured intent JSON.
     *
     * @param  string  $userMessage
     * @param  string  $today        ISO date "YYYY-MM-DD"
     * @return array   Decoded JSON intent array
     */
    public function getIntent(string $userMessage, string $today): array
    {
        Log::info('Chatbot: Incoming message', ['message' => $userMessage]);

        $systemPrompt = $this->buildSystemPrompt($today);

        $payload = [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $systemPrompt . "\n\nUser message: " . $userMessage],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature'     => 0.1,
                'maxOutputTokens' => 1024,
            ],
        ];

        try {
            $response = Http::timeout(20)
                ->withoutVerifying()
                ->post("{$this->endpoint}?key={$this->apiKey}", $payload);

            if ($response->failed()) {
                Log::error('Gemini API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return $this->localFallbackIntent($userMessage, $today);
            }

            $body = $response->json();
            $rawText = $body['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            Log::info('Gemini: Raw extracted text', ['text' => $rawText]);

            // Robust cleaning: Find the first '{' and last '}'
            $firstBrace = strpos($rawText, '{');
            $lastBrace = strrpos($rawText, '}');

            if ($firstBrace !== false && $lastBrace !== false) {
                $cleanJson = substr($rawText, $firstBrace, $lastBrace - $firstBrace + 1);
            } else {
                $cleanJson = trim($rawText);
            }

            $intent = json_decode($cleanJson, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Gemini: JSON parse error', [
                    'error' => json_last_error_msg(),
                    'raw_text' => $rawText,
                    'clean_text' => $cleanJson
                ]);
                return $this->localFallbackIntent($userMessage, $today);
            }

            if (!is_array($intent) || !isset($intent['intent'])) {
                Log::warning('Gemini: Missing intent field', ['parsed' => $intent]);
                return $this->localFallbackIntent($userMessage, $today);
            }

            Log::info('Chatbot: Parsed intent successfully', ['intent' => $intent]);
            return $intent;

        } catch (\Throwable $e) {
            Log::error('GeminiService exception: ' . $e->getMessage());
            return $this->localFallbackIntent($userMessage, $today);
        }
    }

    private function buildSystemPrompt(string $today): string
    {
        return <<<PROMPT
You are "DocNow AI Assistant". Your job is to extract medical intents from user messages.
Today's date is {$today}.

RULES:
1. Return ONLY raw JSON. NO markdown. NO explanation.
2. Understand natural language freely — users may say things in any way.
3. If the user mentions symptoms (e.g. "I have chest pain"), use "symptom_guidance".
4. NEVER diagnose a disease. NEVER prescribe medicine.
5. For symptoms, suggest a doctor specialty and recommend consultation.
6. Extract doctor names even if written informally (e.g. "dr aymen", "ayoub", "the doctor named aymen").
7. Extract times in any format: "at 10", "10am", "at 10:30", "half past 9" → HH:MM 24h.
8. Understand date expressions: "today", "tomorrow", "next monday", "this saturday", etc.
9. Understand cancellation even if user says "remove", "delete", "I don't want the appointment".
10. Understand booking even if user says "schedule", "reserve", "make an appointment", "I want to see a doctor".

SUPPORTED INTENTS:

- search_doctor:       {"intent": "search_doctor",       "specialty": "string|null", "doctor_name": "string|null", "city": "string|null"}
- check_availability:  {"intent": "check_availability",  "doctor_name": "string|null", "date": "YYYY-MM-DD|null"}
- book_appointment:    {"intent": "book_appointment",    "doctor_name": "string|null", "date": "YYYY-MM-DD|null", "time": "HH:MM|null"}
- view_appointments:   {"intent": "view_appointments"}
- cancel_appointment:  {"intent": "cancel_appointment",  "appointment_id": "integer|null"}
- symptom_guidance:    {"intent": "symptom_guidance",    "symptoms": "string", "recommended_specialty": "string"}
- faq:                 {"intent": "faq", "question": "string"}

EXAMPLES:
- "book with aymen tomorrow at 10" → book_appointment, doctor_name: "aymen", date: tomorrow, time: "10:00"
- "I wanna see a doctor" → search_doctor
- "cancel it" → cancel_appointment
- "show me my visits" → view_appointments
- "is dr ayoub free on friday?" → check_availability, doctor_name: "ayoub"
- "I have headache and fever" → symptom_guidance
PROMPT;
    }

    /**
     * Smart NLP local fallback - mirrors ChatController logic.
     * Called when Gemini API is unavailable.
     */
    private function localFallbackIntent(string $message, string $today): array
    {
        $msg      = strtolower(trim($message));
        $original = trim($message);

        // Extract TIME
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

        // Extract DATE
        $date = $today;
        if (str_contains($msg, 'tomorrow') || str_contains($msg, 'demain')) {
            $date = \Carbon\Carbon::parse($today)->addDay()->toDateString();
        } elseif (preg_match('/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/', $msg, $m)) {
            $date = \Carbon\Carbon::parse('next ' . $m[1])->toDateString();
        } elseif (preg_match('/\b(\d{4}-\d{2}-\d{2})\b/', $msg, $m)) {
            $date = $m[1];
        }

        // Extract DOCTOR NAME
        $doctorName = null;
        if (preg_match('/\b(?:dr\.?|doctor|dre|docteur)\s+([a-z]+(?:\s+[a-z]+)?)/i', $original, $m)) {
            $doctorName = strtolower(trim($m[1]));
        }
        if (!$doctorName && preg_match('/\b(?:with|see|chez|avec|visit|book)\s+([a-z]{3,}(?:\s+[a-z]{3,})?)/i', $original, $m)) {
            $candidate = strtolower(trim($m[1]));
            if (!in_array($candidate, ['my', 'the', 'a', 'an', 'appointment', 'doctor', 'him', 'her'])) {
                $doctorName = $candidate;
            }
        }

        // Extract SPECIALTY
        $specialtyMap = [
            'cardiolog' => 'cardiology', 'heart' => 'cardiology',
            'dentist' => 'dentistry', 'teeth' => 'dentistry',
            'dermatol' => 'dermatology', 'skin' => 'dermatology',
            'pediatr' => 'pediatrics', 'children' => 'pediatrics',
            'neurolog' => 'neurology', 'brain' => 'neurology',
            'orthoped' => 'orthopedics', 'bone' => 'orthopedics',
            'gynecolog' => 'gynecology', 'ophthalm' => 'ophthalmology',
            'psychiat' => 'psychiatry', 'mental' => 'psychiatry',
            'endocrin' => 'endocrinology', 'diabetes' => 'endocrinology',
            'gastrolog' => 'gastroenterology', 'stomach' => 'gastroenterology',
            'urology' => 'urology', 'kidney' => 'urology',
            'pulmonol' => 'pulmonology', 'lung' => 'pulmonology',
            'general' => 'general medicine',
        ];
        $specialty = null;
        foreach ($specialtyMap as $keyword => $value) {
            if (str_contains($msg, $keyword)) { $specialty = $value; break; }
        }

        // Symptoms
        $hasSymptom = false;
        foreach (['pain','ache','fever','cough','sick','hurt','tired','dizzy','nausea','vomit','bleed','swollen','rash','allerg','infection'] as $sym) {
            if (str_contains($msg, $sym)) { $hasSymptom = true; break; }
        }

        // VIEW
        foreach (['my appointment','show appointment','view appointment','list appointment','my visit','my booking','my schedule','upcoming appointment','show my','view my'] as $p) {
            if (str_contains($msg, $p)) return ['intent' => 'view_appointments'];
        }

        // CANCEL
        foreach (['cancel','annul','remove appointment','delete appointment',"don't want",'dont want'] as $p) {
            if (str_contains($msg, $p)) return ['intent' => 'cancel_appointment', 'appointment_id' => null];
        }

        // BOOK
        $isBook = false;
        foreach (['book','reserv','schedul','make appointment','set appointment','create appointment','want to see','want to visit','see a doctor','appointment with','need a doctor','need appointment','want appointment'] as $p) {
            if (str_contains($msg, $p)) { $isBook = true; break; }
        }
        if ($isBook || ($doctorName && $time)) {
            return ['intent' => 'book_appointment', 'doctor_name' => $doctorName, 'date' => $date, 'time' => $time];
        }

        // AVAILABILITY
        foreach (['available','availability','free slot','open slot','when is','schedule of','dispo'] as $p) {
            if (str_contains($msg, $p)) return ['intent' => 'check_availability', 'doctor_name' => $doctorName, 'date' => $date];
        }

        // SYMPTOM
        if ($hasSymptom) {
            return ['intent' => 'symptom_guidance', 'symptoms' => $original, 'recommended_specialty' => $specialty ?? 'a general practitioner'];
        }

        // SEARCH
        $isSearch = false;
        foreach (['find','search','look for','show doctor','list doctor','who is','get doctor'] as $p) {
            if (str_contains($msg, $p)) { $isSearch = true; break; }
        }
        if ($isSearch || $specialty || $doctorName) {
            return ['intent' => 'search_doctor', 'specialty' => $specialty, 'doctor_name' => $doctorName, 'city' => null];
        }

        return ['intent' => 'faq', 'question' => $original];
    }
}

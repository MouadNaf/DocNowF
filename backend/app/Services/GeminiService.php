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
     * @param  array   $history      Array of previous messages [{'role': 'user'|'model', 'text': '...'}]
     * @return array   Decoded JSON intent array
     */
    public function getIntent(string $userMessage, string $today, array $history = []): array
    {
        Log::info('Chatbot: Incoming message', ['message' => $userMessage]);

        $systemPrompt = $this->buildSystemPrompt($today);

        // Map history to Gemini's format
        $contents = [];
        foreach ($history as $msg) {
            $role = $msg['role'] === 'model' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg['text']]],
            ];
        }
        
        // Add current message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]],
        ];

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemPrompt]
                ]
            ],
            'contents' => $contents,
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
You are "DocNow AI Assistant", a medical receptionist chatbot for a patient application.
Today's date is {$today}.

CRITICAL RULES:
1. Return ONLY valid JSON. NO markdown format, NO conversational text outside JSON.
2. DATABASE-ONLY KNOWLEDGE: You MUST ONLY use information extracted from the conversation or the user's explicit request. NEVER invent doctors, specialties, locations, prices, availability, or appointments.
3. CONVERSATION CONTEXT: Use the chat history to resolve pronouns or ambiguous requests. For example, if the user previously asked for "cardiologists" and now says "is the second one free tomorrow?", you must infer they want to check availability for the second cardiologist from the previous list.
4. NATURAL LANGUAGE UNDERSTANDING: Understand various ways a user expresses a need (e.g., "I need a heart doctor", "Find me a cardiologist", "I have chest problems, who should I see?" all imply searching for a cardiologist).
5. MEDICAL LIMITATION: NEVER provide medical diagnosis or prescribe medicine. If they ask about symptoms, guide them to a specialty using the `symptom_guidance` intent. Do not replace a real doctor.
6. CLARIFICATION: If the user's request is too ambiguous, missing critical information, or impossible to parse into a clear intent, use the `clarification_needed` intent to ask a helpful follow-up question. (e.g. User: "I need help with my stomach" -> Bot: "Are you looking for a gastroenterologist? I can help you find one.")

SUPPORTED INTENTS & JSON SCHEMAS:

- search_doctor
  Use when the user wants to find, list, or search for doctors. Extract as many filters as possible.
  {"intent": "search_doctor", "specialty": "string|null", "doctor_name": "string|null", "city": "string|null", "gender": "male|female|null", "experience": "string|null"}

- check_availability
  Use when the user specifically asks if a doctor is free, available, or asks for their schedule.
  {"intent": "check_availability", "doctor_name": "string|null", "date": "YYYY-MM-DD|null"}

- book_appointment
  Use when the user explicitly wants to book, reserve, or schedule an appointment. Extract time in HH:MM format if mentioned.
  {"intent": "book_appointment", "doctor_name": "string|null", "date": "YYYY-MM-DD|null", "time": "HH:MM|null"}

- view_appointments
  Use when the user wants to see their existing/upcoming appointments.
  {"intent": "view_appointments"}

- cancel_appointment
  Use when the user wants to cancel, remove, or delete an appointment.
  {"intent": "cancel_appointment", "appointment_id": "integer|null"}

- symptom_guidance
  Use when the user describes symptoms but doesn't explicitly ask for a doctor search, to recommend a specialty.
  {"intent": "symptom_guidance", "symptoms": "string", "recommended_specialty": "string"}

- clarification_needed
  Use when the request is unclear, or you need more info to proceed. Provide a friendly, helpful question.
  {"intent": "clarification_needed", "question": "string"}

- faq
  Use for general questions about clinic hours, prices, policies.
  {"intent": "faq", "question": "string"}

EXAMPLES:
User: "book with aymen tomorrow at 10"
{"intent": "book_appointment", "doctor_name": "aymen", "date": "tomorrow's actual date", "time": "10:00"}

User: "Find me a female skin doctor in Oran with 5 years experience"
{"intent": "search_doctor", "specialty": "dermatology", "city": "Oran", "gender": "female", "experience": "5 years"}

User: "I have a headache"
{"intent": "clarification_needed", "question": "I'm sorry to hear that. Are you looking for a neurologist or general practitioner to help with your headache?"}
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

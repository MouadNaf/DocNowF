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
        $this->endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
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
                return ['intent' => 'faq', 'error' => 'API_REQUEST_FAILED'];
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
                return ['intent' => 'faq', 'error' => 'JSON_PARSE_ERROR'];
            }

            if (!is_array($intent) || !isset($intent['intent'])) {
                Log::warning('Gemini: Missing intent field', ['parsed' => $intent]);
                return ['intent' => 'faq'];
            }

            Log::info('Chatbot: Parsed intent successfully', ['intent' => $intent]);
            return $intent;

        } catch (\Throwable $e) {
            Log::error('GeminiService exception: ' . $e->getMessage());
            return ['intent' => 'faq', 'error' => 'EXCEPTION_OCCURRED'];
        }
    }

    private function buildSystemPrompt(string $today): string
    {
        return <<<PROMPT
You are "DocNow AI Assistant". Your job is to extract medical intents from user messages.
Today's date is {$today}.

RULES:
1. Return ONLY raw JSON. NO markdown. NO explanation.
2. If the user mentions symptoms (e.g. "I have chest pain"), use "symptom_guidance".
3. NEVER diagnose a disease. NEVER prescribe medicine.
4. For symptoms, suggest a doctor specialty and recommend consultation.

SUPPORTED INTENTS:

- search_doctor: {"intent": "search_doctor", "specialty": "string|null", "city": "string|null"}
- check_availability: {"intent": "check_availability", "doctor_name": "string|null", "date": "YYYY-MM-DD|null"}
- book_appointment: {"intent": "book_appointment", "doctor_name": "string|null", "date": "YYYY-MM-DD|null", "time": "HH:MM|null"}
- view_appointments: {"intent": "view_appointments"}
- cancel_appointment: {"intent": "cancel_appointment", "appointment_id": "string|null"}
- symptom_guidance: {"intent": "symptom_guidance", "symptoms": "string", "recommended_specialty": "string"}
- faq: {"intent": "faq", "question": "string"}

LOGIC:
- "tomorrow" from {$today} is next day.
- Normalize doctor names (remove "Dr.", "Doctor").
- If greeting ("hi"), use "faq".
PROMPT;
    }
}

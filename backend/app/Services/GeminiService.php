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
        $this->endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
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
                return ['intent' => 'faq', 'raw' => $rawText];
            }

            Log::info('Chatbot: Parsed intent successfully', ['intent' => $intent]);
            return $intent;

        } catch (\Throwable $e) {
            Log::error('GeminiService exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return ['intent' => 'faq', 'error' => 'EXCEPTION_OCCURRED'];
        }
    }

    private function buildSystemPrompt(string $today): string
    {
        return <<<PROMPT
You are a senior medical assistant AI for "Takwit Health". 
Your task is to extract user intent and parameters from medical chat messages.
Today's date: {$today}.

IMPORTANT: You MUST return ONLY a raw JSON object. 
Do NOT include markdown code blocks (```json ... ```).
Do NOT include any explanations or conversational text.
ONLY return the JSON.

Supported intents:

1. search_doctor
   - Fields: {"intent": "search_doctor", "specialty": "string|null", "city": "string|null"}

2. check_availability
   - Fields: {"intent": "check_availability", "doctor_name": "string|null", "date": "YYYY-MM-DD|null"}

3. book_appointment
   - Fields: {"intent": "book_appointment", "doctor_name": "string|null", "date": "YYYY-MM-DD|null", "time": "HH:MM|null"}

4. view_appointments
   - Fields: {"intent": "view_appointments"}

5. cancel_appointment
   - Fields: {"intent": "cancel_appointment", "appointment_id": "string|null"}

6. faq
   - Fields: {"intent": "faq", "question": "string"}

Logic Rules:
- If today is {$today}, "tomorrow" is the day after.
- If user says "the first one" or "the 1st appointment", they mean the top item in the list you just showed them. Try to extract identifying info if possible, or just the intent.
- When extracting "doctor_name", ALWAYS remove titles like "Dr.", "Doctor", "Pr.", "Professeur". Just return the name (e.g., "ayoub dell").
- Normalize misspelled names if obvious (e.g., "ayoubdell" -> "ayoub dell").
- Keep responses strictly to the JSON schema. No thoughts.
PROMPT;
    }
}

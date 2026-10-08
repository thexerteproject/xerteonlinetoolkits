<?php

require_once(dirname(__FILE__) . "/" . "BaseAiApi.php");

class geminiApi extends BaseAiApi
{
    protected function POST_request($prompt, $payload, $url, $type) {
        return $this->safeExecute(function () use ($prompt, $payload, $url, $type){

            global $xerte_toolkits_site;
            $authorization = "x-goog-api-key: " . $xerte_toolkits_site->gemini_key;

            /*
             * Replace the text in the final user_input step.
             *
             * Gemini payload structure:
             * input[n].content[0].text
             */
            $lastInput = max(sizeof($payload["input"]) - 1, 0);
            $payload["input"][$lastInput]["content"][0]["text"] = $prompt;

            $flags = JSON_UNESCAPED_UNICODE;

            if (defined('JSON_INVALID_UTF8_SUBSTITUTE')) {
                // PHP >= 7.2: use native flag
                $flags |= JSON_INVALID_UTF8_SUBSTITUTE;
                $new_payload = json_encode($payload, $flags);
            } else {
                // PHP 5.6: emulate SUBSTITUTE by cleaning strings first
                $cleanPayload = $this->json_utf8_substitute($payload);
                $new_payload  = json_encode($cleanPayload, $flags);
            }

            if ($new_payload === false) {
                throw new \Exception(
                    'Unable to encode Gemini request payload'
                );
            }

            $curl = curl_init();

            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_URL, $url);

            curl_setopt(
                $curl,
                CURLOPT_HTTPHEADER,
                [
                    $authorization,
                    "Content-Type: application/json"
                ]
            );

            curl_setopt(
                $curl,
                CURLOPT_POSTFIELDS,
                $new_payload
            );

            $result = curl_exec($curl);

            /*
             * These must be read before curl_close().
             */
            $curlError = curl_error($curl);
            $httpCode = curl_getinfo(
                $curl,
                CURLINFO_HTTP_CODE
            );

            curl_close($curl);

            log_ai_request(
                $result,
                'genai',
                'gemini'
            );

            if ($result === false) {
                throw new \Exception(
                    'cURL error: ' . $curlError
                );
            }

            $resultConform = $this->clean_result($result);
            $resultConform = json_decode($resultConform);

            if (
                $resultConform === null &&
                json_last_error() !== JSON_ERROR_NONE
            ) {
                throw new \Exception(
                    'Invalid JSON returned by Gemini API'
                );
            }

            /*
             * Gemini API errors use a top-level "error" property,
             * normally containing code, message and status.
             */
            if (isset($resultConform->error)) {
                $message = 'Unknown error';

                if (
                    is_object($resultConform->error) &&
                    isset($resultConform->error->message)
                ) {
                    $message =
                        $resultConform->error->message;
                } elseif (is_string($resultConform->error)) {
                    $message = $resultConform->error;
                }

                throw new \Exception(
                    'API error: ' . $message
                );
            }

            if ($httpCode >= 400) {
                throw new \Exception(
                    'Gemini API returned HTTP status '
                    . $httpCode
                );
            }

            /*
             * A successful synchronous request should normally have
             * status "completed". An "incomplete" response may still
             * contain usable partial text, so it is not rejected here.
             */
            if (
                isset($resultConform->status) &&
                in_array(
                    $resultConform->status,
                    ['failed', 'cancelled'],
                    true
                )
            ) {
                throw new \Exception(
                    'Gemini interaction ended with status: '
                    . $resultConform->status
                );
            }

            return $resultConform;
        });
    }

    protected function parseResponse($results)
    {
        $answer = "";

        /*
         * Support both:
         *
         * 1. A single Interaction object.
         * 2. An array of Interaction objects supplied by BaseAiApi.
         */
        if (
            is_object($results) &&
            isset($results->steps)
        ) {
            $results = [$results];
        }

        foreach ($results as $result) {
            /*
             * Gemini always returns a status. Therefore, the old
             * check:
             *
             *     if ($result->status)
             *
             * cannot be used because "completed" is truthy and would
             * prevent text extraction.
             */
            if (
                isset($result->status) &&
                !in_array(
                    $result->status,
                    ['completed', 'incomplete'],
                    true
                )
            ) {
                return $result;
            }

            if (
                !isset($result->steps) ||
                !is_array($result->steps)
            ) {
                continue;
            }

            foreach ($result->steps as $step) {
                if (
                    !isset($step->type) ||
                    $step->type !== 'model_output'
                ) {
                    continue;
                }

                if (
                    !isset($step->content) ||
                    !is_array($step->content)
                ) {
                    continue;
                }

                foreach ($step->content as $content) {
                    if (
                        isset($content->type) &&
                        $content->type === 'text' &&
                        isset($content->text)
                    ) {
                        $answer .= $content->text;
                    }
                }
            }
        }

        return $answer;
    }

    protected function extract_json_object($text)
    {
        // Find the first "{" and last "}"
        $start = strpos($text, '{');
        $end   = strrpos($text, '}');

        if (
            $start === false ||
            $end === false ||
            $end < $start
        ) {
            return null;
        }

        // Extract substring containing the JSON
        $json = substr(
            $text,
            $start,
            $end - $start + 1
        );

        return trim($json);
    }

    protected function buildQueries(array $inputs)
    {
        // todo remove
        return $this->safeExecute(function () use ($inputs) {
            global $xerte_toolkits_site;
            $apiKey = $xerte_toolkits_site->gemini_key;

            $payload = [
                'model' => 'gemini-3.6-flash',

                'generation_config' => [
                    'max_output_tokens' => 4096,
                ],

                /*
                 * Preserve the few-shot sequence:
                 *
                 * user      -> instructions
                 * assistant -> acknowledgement
                 * user      -> actual input
                 */
                'input' => [
                    [
                        'type' => 'user_input',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => <<<SYS
You are a query-builder assistant.
Given my inputs (as JSON), output strictly a JSON object with two fields:
  • "frequency_query": a single query string for TF-IDF matching
  • "vector_query":   a single query string for vector embedding similarity
Do not wrap your response in any extra text, and do not add any extra text outside the brackets.
SYS
                            ],
                        ],
                    ],
                    [
                        'type' => 'model_output',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'Understood. Which inputs would you like me to process first?',
                            ],
                        ],
                    ],
                    [
                        'type' => 'user_input',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => json_encode($inputs),
                            ],
                        ],
                    ],
                ],

                /*
                 * Gemini-native structured output. This makes the API
                 * return a JSON object matching the required structure.
                 */
                'response_format' => [
                    'type' => 'text',
                    'mime_type' => 'application/json',
                    'schema' => [
                        'type' => 'object',
                        'properties' => [
                            'frequency_query' => [
                                'type' => 'string',
                            ],
                            'vector_query' => [
                                'type' => 'string',
                            ],
                        ],
                        'required' => [
                            'frequency_query',
                            'vector_query',
                        ],
                    ],
                ],
            ];

            $ch = curl_init(
                'https://generativelanguage.googleapis.com/v1beta/interactions'
            );

            try {
                curl_setopt_array(
                    $ch,
                    [
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_POST => true,
                        CURLOPT_HTTPHEADER => [
                            'Content-Type: application/json',
                            'x-goog-api-key: ' . $apiKey,
                        ],
                        CURLOPT_POSTFIELDS =>
                            json_encode($payload),
                    ]
                );

                $resp = curl_exec($ch);

                $httpCode = curl_getinfo(
                    $ch,
                    CURLINFO_HTTP_CODE
                );

                log_ai_request(
                    $resp,
                    'genai',
                    'gemini'
                );

                if ($resp === false) {
                    throw new \Exception(
                        'cURL error: ' . curl_error($ch)
                    );
                }

                $decoded = json_decode(
                    $resp,
                    true,
                    512
                );

                if (
                    $decoded === null &&
                    json_last_error() !== JSON_ERROR_NONE
                ) {
                    throw new \Exception(
                        'Invalid JSON returned by Gemini API'
                    );
                }

                if (isset($decoded['error'])) {
                    $message =
                        isset($decoded['error']['message'])
                            ? $decoded['error']['message']
                            : 'Unknown error';

                    throw new \Exception(
                        'API error: ' . $message
                    );
                }

                if ($httpCode >= 400) {
                    throw new \Exception(
                        'Gemini API returned HTTP status '
                        . $httpCode
                    );
                }

                if (
                    isset($decoded['status']) &&
                    in_array(
                        $decoded['status'],
                        ['failed', 'cancelled'],
                        true
                    )
                ) {
                    throw new \Exception(
                        'Gemini interaction ended with status: '
                        . $decoded['status']
                    );
                }

                /*
                 * Collect every text block from every model_output
                 * step. Do not assume that the first step or first
                 * content block contains the complete answer.
                 */
                $text = '';

                if (
                    isset($decoded['steps']) &&
                    is_array($decoded['steps'])
                ) {
                    foreach ($decoded['steps'] as $step) {
                        if (
                            !isset($step['type']) ||
                            $step['type'] !== 'model_output'
                        ) {
                            continue;
                        }

                        if (
                            !isset($step['content']) ||
                            !is_array($step['content'])
                        ) {
                            continue;
                        }

                        foreach (
                            $step['content'] as $content
                        ) {
                            if (
                                isset($content['type']) &&
                                $content['type'] === 'text' &&
                                isset($content['text'])
                            ) {
                                $text .= $content['text'];
                            }
                        }
                    }
                }

                if ($text !== '') {
                    $json = $this->extract_json_object(
                        $this->total_clean_machine($text)
                    );

                    if ($json === null) {
                        throw new \Exception(
                            'Gemini response did not contain a JSON object'
                        );
                    }

                    $decoded = json_decode(
                        $json,
                        true,
                        512
                    );

                    if (
                        $decoded === null &&
                        json_last_error() !== JSON_ERROR_NONE
                    ) {
                        throw new \Exception(
                            'Gemini returned invalid query JSON'
                        );
                    }
                }

                return $decoded;
            } finally {
                curl_close($ch);
            }
        });
    }
}
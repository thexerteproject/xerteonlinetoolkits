<?php

require_once (str_replace('\\', '/', __DIR__) . "/../../../website_code/php/database_library.php");
require_once (str_replace('\\', '/', __DIR__) . "/ActorContext.php");

function log_ai_request($response, $category, $vendor, $details=null)
{
    global $xerte_toolkits_site;

    if((!isset($_SESSION['toolkits_logon_id'])) && (php_sapi_name() !== 'cli')) {
        die("Session ID not set");
    }

    if (php_sapi_name() == 'cli'){
        $actor = ActorContext::get();
    } else {
        $actor['user_id'] = isset($_SESSION['toolkits_logon_username']) ? $_SESSION['toolkits_logon_username'] : null;
        $actor['workspace_id'] = isset($_SESSION['XAPI_PROXY']) ? $_SESSION['XAPI_PROXY'] : null;
    }

    $category = strtolower($category);
    $vendor = strtolower($vendor);

    // ISO now (UTC) -> DATETIME (no microseconds for older mysql ver)
    $nowIso = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('c');
    $response = _to_assoc($response);

    // Base event
    $event = array(
        'schema_version' => '1.0',
        'occurred_at' => $nowIso,
        'category' => $category,
        'service' => $vendor,
        'model' => null,
        'request_id' => null,
        'status' => 'ok',
        'error_message' => null,

        // actor (flattened later)
        'actor' => array(
            'user_id' => $actor['user_id'],
            'workspace_id' => $actor['workspace_id'],
        ),

        // metrics & cost (will be flattened)
        'metrics' => array(),
        'cost' => array(
            'currency' => null,
            'pricing_version' => null,
            'total' => null
        ),
    );

    // Error/status mapping
    if (isset($response['error'])) {
        $event['status'] = 'error';
        $event['error_message'] = isset($response['error']['message']) ? $response['error']['message'] : null;
    } elseif (isset($response['status']) && $response['status'] === 'failed') {
        $event['status'] = 'error';
        if ($event['error_message'] === null && isset($response['last_error']['message'])) {
            $event['error_message'] = $response['last_error']['message'];
        }
    }

    // Vendor/type-specific extraction
    $event = response_mapping($category, $response, $event, $vendor, $details);

    // Prepare occurred_at for DATETIME (no fractional seconds, as those break older versions of mysql)
    $occurred = (new DateTimeImmutable($event['occurred_at']))->setTimezone(new DateTimeZone('UTC'));
    $occurredAt = $occurred->format('Y-m-d H:i:s');

    // Flatten helpers
    $first_nonnull = function (...$vals) {
        foreach ($vals as $v) {
            if (isset($v) && $v !== '') return $v;
        }
        return null;
    };
    $to_int_or_null = function ($v) {
        return (isset($v) && $v !== '' && is_numeric($v)) ? (int)$v : null;
    };
    $to_decimal_or_null = function ($v) {
        return (isset($v) && $v !== '' && is_numeric($v)) ? (string)$v : null; // keep scale as string
    };

    // Pull metrics from either top-level or metrics[]
    $input_tokens = $first_nonnull(@$event['input_tokens'], @$event['metrics']['input_tokens']);
    $output_tokens = $first_nonnull(@$event['output_tokens'], @$event['metrics']['output_tokens']);
    $total_tokens = $first_nonnull(@$event['total_tokens'], @$event['metrics']['total_tokens']);

    $audio_ms = $first_nonnull(@$event['audio_ms'], @$event['metrics']['audio_ms']);
    $audio_seconds = $first_nonnull(@$event['audio_seconds'], @$event['metrics']['audio_seconds']);

    $images_requested = $first_nonnull(@$event['images_requested'], @$event['metrics']['images_requested']);
    $images_received = $first_nonnull(@$event['images_received'], @$event['metrics']['images_received']);
    $image_dimensions = $first_nonnull(@$event['image_dimensions'], @$event['metrics']['image_dimensions']);
    $image_width = $first_nonnull(@$event['image_width'], @$event['metrics']['image_width']);
    $image_height = $first_nonnull(@$event['image_height'], @$event['metrics']['image_height']);

    // Compute fallbacks
    if ($total_tokens === null && is_numeric($input_tokens) && is_numeric($output_tokens)) {
        $total_tokens = (int)$input_tokens + (int)$output_tokens;
    }
    if ($audio_seconds === null && is_numeric($audio_ms)) {
        // keep 3 decimals like the schema
        $audio_seconds = number_format(((int)$audio_ms) / 1000, 3, '.', '');
    }
    if ($image_dimensions === null && is_numeric($image_width) && is_numeric($image_height)) {
        $image_dimensions = ((int)$image_width) . 'x' . ((int)$image_height);
    }

    // Cost fields
    $cost_currency = $first_nonnull(@$event['cost']['currency'], @$event['cost_currency']);
    $cost_pricing_version = $first_nonnull(@$event['cost']['pricing_version'], @$event['cost_pricing_version']);
    $cost_total = $first_nonnull(@$event['cost']['total'], @$event['cost_total']);

    // Build INSERT (no JSON, no event_id, no ON DUPLICATE KEY -- these break older mysql versions)
    $sql = "INSERT INTO `{$xerte_toolkits_site->database_table_prefix}ai_request_logs`
  (schema_version, occurred_at, category, service, model, request_id, status, error_message,
   actor_user_id, actor_workspace_id, input_tokens, output_tokens, total_tokens, audio_ms, audio_seconds,
   images_requested, images_received, image_dimensions, image_width, image_height,
   cost_currency, cost_pricing_version, cost_total)
VALUES
  (:schema_version, :occurred_at, :category, :service, :model, :request_id, :status, :error_message,
   :actor_user_id, :actor_workspace_id, :input_tokens, :output_tokens, :total_tokens, :audio_ms, :audio_seconds,
   :images_requested, :images_received, :image_dimensions, :image_width, :image_height,
   :cost_currency, :cost_pricing_version, :cost_total)";

// Execute with named params
    db_query($sql, array(
        ':schema_version' => $event['schema_version'],
        ':occurred_at' => $occurredAt,
        ':category' => $event['category'],
        ':service' => $event['service'],
        ':model' => isset($event['model']) ? $event['model'] : null,
        ':request_id' => isset($event['request_id']) ? $event['request_id'] : null,
        ':status' => $event['status'],
        ':error_message' => $event['error_message'],

        ':actor_user_id' => $event['actor']['user_id'],
        ':actor_workspace_id' => $event['actor']['workspace_id'],

        ':input_tokens' => $to_int_or_null($input_tokens),
        ':output_tokens' => $to_int_or_null($output_tokens),
        ':total_tokens' => $to_int_or_null($total_tokens),

        ':audio_ms' => $to_int_or_null($audio_ms),
        ':audio_seconds' => $to_decimal_or_null($audio_seconds),

        ':images_requested' => $to_int_or_null($images_requested),
        ':images_received' => $to_int_or_null($images_received),
        ':image_dimensions' => $image_dimensions,
        ':image_width' => $to_int_or_null($image_width),
        ':image_height' => $to_int_or_null($image_height),

        ':cost_currency' => $cost_currency,
        ':cost_pricing_version' => $cost_pricing_version,
        ':cost_total' => $to_decimal_or_null($cost_total),
    ));
}


    function response_mapping($category, $response, $event, $vendor, $details)
    {
        if ($category === 'genai') {
            if ($vendor === 'openai') return map_genai_openai($response, $event);
            elseif ($vendor === 'openaiassistant') return map_genai_openaiassistant($response, $event);
            elseif ($vendor === 'mistral') return map_genai_mistral($response, $event);
            elseif ($vendor === 'anthropic') return map_genai_anthropic($response, $event);
            else                           return map_genai_default($response, $event);
        } elseif ($category === 'encoding' || $category === 'embedding') {
            if ($vendor === 'openaienc') return map_encoding_openai($response, $event);
            elseif ($vendor === 'mistralenc') return map_encoding_mistral($response, $event);
            else                           return map_encoding_default($response, $event);
        } elseif ($category === 'transcription') {
            if ($vendor === 'openai') return map_transcription_openai($response, $event);  // Whisper
            elseif ($vendor === 'gladia') return map_transcription_gladia($response, $event);
            else                           return map_transcription_default($response, $event);
        } elseif ($category === 'imagegen') {
            return map_imagegen_openai($response, $event, $details);
        } else {
            map_generic_default($response, $event);
        }
    }

// uuid helper
function uuid_v4()
{
    $d = random_bytes(16);
    $d[6] = chr((ord($d[6]) & 0x0f) | 0x40);
    $d[8] = chr((ord($d[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
}

/* MAPPERS (vendor+type) */

function map_genai_openai($res, $ev)
{
    $ev['model']      = isset($res['model']) ? $res['model'] : null;
    $ev['request_id'] = isset($res['id']) ? $res['id'] : null;

    $u = isset($res['usage']) ? $res['usage'] : array();
    $in  = isset($u['prompt_tokens'])     ? $u['prompt_tokens']     : (isset($u['input_tokens']) ? $u['input_tokens'] : null);
    $out = isset($u['completion_tokens']) ? $u['completion_tokens'] : (isset($u['output_tokens']) ? $u['output_tokens'] : null);
    $tot = isset($u['total_tokens']) ? $u['total_tokens'] : null;
    if ($tot === null && ($in !== null || $out !== null)) $tot = (int)$in + (int)$out;

    $ev['metrics'] = array('input_tokens'=>$in, 'output_tokens'=>$out, 'total_tokens'=>$tot);
    return $ev;
}

function map_genai_openaiassistant($res, $ev)
{
    // Model & request id
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');

    // Status mapping (completed = ok; failed/cancelled = error; others keep whatever caller set)
    $runStatus = array_check($res, 'status');
    if ($runStatus === 'failed' || $runStatus === 'cancelled') {
        $ev['status'] = 'error';
    } elseif ($runStatus === 'completed') {
        $ev['status'] = 'ok';
    }

    // Error message if any (Assistants uses last_error)
    $lastErr = array_check($res, 'last_error');
    if (is_array($lastErr)) {
        $ev['error_message'] = array_check($lastErr, 'message', array_check($lastErr, 'code'));
    }

    // Tokens
    $u   = array_check($res, 'usage', array());
    $in  = array_check($u, 'prompt_tokens');
    $out = array_check($u, 'completion_tokens');
    $tot = array_check($u, 'total_tokens');
    if ($tot === null && ($in !== null || $out !== null)) {
        $tot = (int)$in + (int)$out;
    }
    // Optional: cached prompt tokens (relevant if we do more complex cost estimates)
    $ptd = array_check($u, 'prompt_token_details', array());
    $cached = array_check($ptd, 'cached_tokens');

    $ev['metrics'] = array(
        'input_tokens'        => $in,
        'output_tokens'       => $out,
        'total_tokens'        => $tot,
        'cached_prompt_tokens'=> $cached !== null ? (int)$cached : null
    );

    // Prefer provider timestamps for occurred_at if available
    $when =
        array_check($res, 'completed_at') !== null ? array_check($res, 'completed_at') :
            (array_check($res, 'failed_at') !== null ? array_check($res, 'failed_at') :
                (array_check($res, 'cancelled_at') !== null ? array_check($res, 'cancelled_at') :
                    (array_check($res, 'started_at') !== null ? array_check($res, 'started_at') :
                        array_check($res, 'created_at'))));

    if ($when !== null) {
        $iso = _epoch_to_iso($when);
        if ($iso !== null) {
            $ev['occurred_at'] = $iso; // override the default "now" set earlier
        }
    }
    return $ev;
}

function map_genai_mistral($res, $ev)
{
    // $res is an assoc array
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');

    $u   = array_check($res, 'usage', array());
    $in  = array_check($u, 'prompt_tokens');
    $out = array_check($u, 'completion_tokens');
    $tot = array_check($u, 'total_tokens');

    if ($tot === null && ($in !== null || $out !== null)) {
        $tot = (int)$in + (int)$out;
    }

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => $out,
        'total_tokens'  => $tot
    );
    return $ev;
}


function map_genai_anthropic($res, $ev)
{
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');

    $u   = array_check($res, 'usage', array());
    $in  = array_check($u, 'input_tokens');
    $out = array_check($u, 'output_tokens');
    $tot = array_check($u, 'total_tokens');

    if ($tot === null && ($in !== null || $out !== null)) {
        $tot = (int)$in + (int)$out;
    }

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => $out,
        'total_tokens'  => $tot
    );
    return $ev;
}

function map_genai_default($res, $ev)
{
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');

    $u   = array_check($res, 'usage', array());
    $in  = array_check($u, 'input_tokens',  array_check($u, 'prompt_tokens'));
    $out = array_check($u, 'output_tokens', array_check($u, 'completion_tokens'));
    $tot = array_check($u, 'total_tokens');

    if ($tot === null && ($in !== null || $out !== null)) {
        $tot = (int)$in + (int)$out;
    }

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => $out,
        'total_tokens'  => $tot
    );
    return $ev;
}

/* ENCODING AND EMBEDDING */
function map_encoding_openai($res, $ev)
{
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');

    $u   = array_check($res, 'usage', array());
    $in  = array_check($u, 'prompt_tokens', array_check($u, 'input_tokens'));
    $tot = array_check($u, 'total_tokens', $in);

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => null,
        'total_tokens'  => $tot
    );
    return $ev;
}

function map_encoding_mistral($res, $ev)
{
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');

    $u   = array_check($res, 'usage', array());
    $in  = array_check($u, 'prompt_tokens', array_check($u, 'input_tokens'));
    $tot = array_check($u, 'total_tokens', $in);

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => null,
        'total_tokens'  => $tot
    );
    return $ev;
}

function map_encoding_default($res, $ev)
{
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');

    $u   = array_check($res, 'usage', array());
    $in  = array_check($u, 'input_tokens', array_check($u, 'prompt_tokens'));
    $tot = array_check($u, 'total_tokens', $in);

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => null,
        'total_tokens'  => $tot
    );
    return $ev;
}

/* TRANSCRIPTION */
function map_transcription_openai($res, $ev)
{
    $ev['model']      = array_check($res, 'model', array_check($res, 'transcription_model'));
    $ev['request_id'] = array_check($res, 'id');

    $ms  = array_check($res, 'duration_ms', array_check($res, 'audio_ms'));
    $sec = null;

    if ($ms !== null) {
        $sec = round(((int)$ms) / 1000.0, 3);
    } else {
        $sec = array_check($res, 'duration', array_check($res, 'audio_seconds'));
        if ($sec !== null) $sec = (float)$sec;
    }

    if ($ms === null && $sec === null) {
        $vttCandidate = vtt_find_candidate($res);

        if ($vttCandidate !== null) {
            $sec = vtt_duration_seconds($vttCandidate);
            if ($sec !== null) {
                $ms = (int)round($sec * 1000);
            }
        }
    }

    $ev['metrics'] = array(
        'audio_ms'      => $ms !== null ? (int)$ms : null,
        'audio_seconds' => $sec
    );
    return $ev;
}

function map_transcription_gladia($res, $ev)
{
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'request_id', array_check($res, 'id'));

    $sec = array_check($res, 'audio_duration', array_check($res, 'duration'));
    $ms  = null;

    if ($sec !== null) {
        $sec = (float)$sec;
        $ms  = (int)round($sec * 1000);
    }

    if ($ms === null && $sec === null) {
        $vttCandidate = vtt_find_candidate($res);

        if ($vttCandidate !== null) {
            $sec = vtt_duration_seconds($vttCandidate);
            if ($sec !== null) {
                $ms = (int)round($sec * 1000);
            }
        }
    }

    $ev['metrics'] = array(
        'audio_ms'      => $ms,
        'audio_seconds' => $sec
    );
    return $ev;
}

function map_transcription_default($res, $ev)
{
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');

    $ms  = array_check($res, 'audio_ms', array_check($res, 'duration_ms'));
    $sec = null;

    if ($ms !== null) {
        $sec = round(((int)$ms) / 1000.0, 3);
    } else {
        $sec = array_check($res, 'audio_seconds', array_check($res, 'duration'));
        if ($sec !== null) $sec = (float)$sec;
    }

    $ev['metrics'] = array(
        'audio_ms'      => $ms !== null ? (int)$ms : null,
        'audio_seconds' => $sec
    );
    return $ev;
}

function map_imagegen_openai($res, $ev, $details)
{
    // Transport facts
    $ok   = isset($res['ok']) ? (bool)$res['ok'] : false;
    $code = isset($res['status']) ? (int)$res['status'] : null;

    // Prefer pre-decoded JSON payload inside $res['json'], else decode $res['raw']
    $json = [];
    if (isset($res['json']) && is_array($res['json'])) {
        $json = $res['json'];
    } elseif (!empty($res['raw']) && is_string($res['raw'])) {
        $tmp = json_decode($res['raw'], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($tmp)) $json = $tmp;
    }

    // Count images actually returned (only those with url or b64_json)
    $data = isset($json['data']) && is_array($json['data']) ? $json['data'] : [];
    $imagesReceived = 0;
    foreach ($data as $item) {
        if (!is_array($item)) continue;
        if (isset($item['url']) || isset($item['b64_json'])) $imagesReceived++;
    }

    // Request-time facts from $details
    $model           = isset($details['imagemodel'])      ? (string)$details['imagemodel']   : null;
    $imagesRequested = isset($details['imagesrequested']) ? (int)$details['imagesrequested'] : null;

    // Parse dimensions from $details['imagesize']
    list($w, $h, $dimStr) = _parse_image_dimensions_any(
        isset($details['imagesize']) ? $details['imagesize'] : null
    );

    // Event fields
    $ev['model']       = $model;
    $ev['ok']          = $ok;
    $ev['status_code'] = $code;

    if (!$ok || ($code !== null && $code >= 400)) {
        $msg = null;
        if (isset($json['error']['message']) && is_string($json['error']['message'])) {
            $msg = $json['error']['message'];
        }
        $ev['error'] = ['message' => $msg];
    }

    // Metrics JSON (exact keys your generated columns expect)
    $ev['metrics'] = [
        'images_requested' => $imagesRequested,
        'images_received'  => $imagesReceived,
        'image_dimensions' => $dimStr, // raw "WxH"
        'image_width'      => $w,
        'image_height'     => $h,
    ];
    return $ev;
}

/**
 * Accepts '1024x1024', '1024×1024', '1024 X 1024', '1024 by 1024',
 * ['1024','1024'], ['width'=>1024,'height'=>1024], or null.
 * Returns [width:int|null, height:int|null, dimStr:string|null]
 */
function _parse_image_dimensions_any($size)
{
    // Array forms
    if (is_array($size)) {
        // Named keys
        if (isset($size['width']) && isset($size['height'])) {
            $w = (int)$size['width']; $h = (int)$size['height'];
            return [$w, $h, "{$w}x{$h}"];
        }
        // Positional first two numeric values
        $nums = [];
        foreach ($size as $v) {
            if (is_numeric($v)) $nums[] = (int)$v;
            if (count($nums) === 2) break;
        }
        if (count($nums) === 2) return [$nums[0], $nums[1], "{$nums[0]}x{$nums[1]}"];
        return [null, null, null];
    }

    // String forms
    if (is_string($size) && $size !== '') {
        $norm = mb_strtolower(trim($size));
        $norm = preg_replace('/\s*by\s*/i', 'x', $norm);
        $norm = str_replace(['×','X','*',' '], ['x','x','x',''], $norm);
        if (preg_match('/^(\d+)\s*x\s*(\d+)$/', $norm, $m)) {
            $w = (int)$m[1]; $h = (int)$m[2];
            return [$w, $h, "{$w}x{$h}"];
        }
        if (preg_match_all('/\d+/', $norm, $nums) && count($nums[0]) >= 2) {
            $w = (int)$nums[0][0]; $h = (int)$nums[0][1];
            return [$w, $h, "{$w}x{$h}"];
        }
        // Couldn’t parse cleanly; pass through original
        return [null, null, $size];
    }

    return [null, null, null];
}

/* Fallback, just in case */
function map_generic_default($res, $ev)
{
    $ev['model']      = array_check($res, 'model');
    $ev['request_id'] = array_check($res, 'id');
    $ev['metrics']    = array();

    return $ev;
}

/**
 * Always turn $val into an associative array.
 * - JSON string -> assoc array
 * - stdClass/object -> assoc array
 * - array -> leave as-is
 * - PSR-7 response -> uses body string
 * - anything else -> empty array
 */
function _to_assoc($val)
{
    // Already array
    if (is_array($val)) return $val;

    // PSR-7 Response; pull body
    if (is_object($val) && interface_exists('\\Psr\\Http\\Message\\ResponseInterface') && $val instanceof \Psr\Http\Message\ResponseInterface) {
        $val = (string)$val->getBody();
    }

    // Generic object -> deep assoc via json roundtrip
    if (is_object($val)) {
        return json_decode(json_encode($val), true);
    }

    // JSON string
    if (is_string($val)) {
        $trim = trim($val);
        if ($trim === '') return array();
        $decoded = json_decode($trim, true); // assoc=true
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }
        // Not valid JSON; fall back to empty
        return array('_raw' => $trim);
    }

    // Fallback
    return array();
}

function _epoch_to_iso($sec)
{
    if ($sec === null || $sec === '') return null;
    try {
        $dt = new DateTimeImmutable('@' . (int)$sec);
        $dt = $dt->setTimezone(new DateTimeZone('UTC'));
        // Use full ISO8601; MySQL DATETIME(6) compatible ('Y-m-d H:i:s.u')
        return $dt->format('c');
    } catch (Exception $e) {
        return null;
    }
}

/** Safe get: returns $default if key missing or not array */
function array_check($arr, $key, $default = null)
{
    return (is_array($arr) && array_key_exists($key, $arr)) ? $arr[$key] : $default;
}

/**
 * Return total duration in SECONDS from a WebVTT/SRT string, or null if not parseable.
 * Works for:
 *   - "00:00:00.000 --> 00:00:07.080"
 *   - "00:00:00,000 --> 00:00:07,080"
 *   - "00:00.000 --> 07:08.900"
 *   - With extra cue settings after the end time (align:, position:, etc.)
 */
function vtt_duration_seconds($vtt)
{
    if (!is_string($vtt) || strpos($vtt, '-->') === false) {
        return null;
    }

    // Find every cue line's END timestamp (right side of -->)
    if (!preg_match_all('/-->\s*([0-9:.]+(?:[.,][0-9]+)?)/', $vtt, $matches)) {
        return null;
    }

    $max = null;
    foreach ($matches[1] as $ts) {
        $sec = vtt_parse_timestamp_to_seconds($ts);
        if ($sec !== null) {
            $max = $max === null ? $sec : max($max, $sec);
        }
    }

    return $max;
}

/**
 * Parse a VTT/SRT timestamp into seconds.
 * Accepts hh:mm:ss.mmm, mm:ss.mmm, or ss.mmm; comma or dot decimals.
 */
function vtt_parse_timestamp_to_seconds($ts)
{
    $ts = trim($ts);
    $ts = str_replace(',', '.', $ts);               // allow SRT-style commas
    $ts = preg_replace('/[^0-9:.]/', '', $ts);      // strip any stray chars

    if ($ts === '') return null;

    $parts = explode(':', $ts);
    // Allow ss(.mmm), mm:ss(.mmm), or hh:mm:ss(.mmm)
    if (count($parts) === 3) {
        list($h, $m, $s) = $parts;
        return (int)$h * 3600 + (int)$m * 60 + (float)$s;
    } elseif (count($parts) === 2) {
        list($m, $s) = $parts;
        return (int)$m * 60 + (float)$s;
    } elseif (count($parts) === 1) {
        return (float)$parts[0];
    }

    return null;
}

/**
 * Return a VTT/SRT candidate string found in $res, or null if none.
 * - Checks if $res itself is a VTT/SRT string
 * - Otherwise scans common fields (or all top-level string fields) for a match
 * - No heavy recursion to keep it lightweight
 */
function vtt_find_candidate($res, array $preferredFields = null)
{
    // quick helper to judge if a string looks like VTT/SRT
    $looksLike = function ($s) {
        if (!is_string($s)) return false;
        if (stripos($s, 'WEBVTT') === 0 && strpos($s, '-->') !== false) return true;
        if (strpos($s, '-->') === false) return false;
        // Timestamp pattern: ss, mm:ss(.mmm), or hh:mm:ss(.mmm), commas or dots for ms
        return (bool)preg_match(
            '/\b\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?\s*-->\s*\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d{1,3})?/m',
            $s
        );
    };

    // 1) If the whole response is a VTT/SRT-like string
    if (is_string($res) && $looksLike($res)) {
        return $res;
    }

    // Normalize to array to lightly inspect top-level fields
    $arr = null;
    if (is_array($res)) {
        $arr = $res;
    } elseif (is_object($res)) {
        // casting is shallow but cheap and usually enough
        $arr = (array)$res;
    }

    if (!is_array($arr)) {
        return null;
    }

    // Default list of likely fields to check first
    $preferredFields = isset($preferredFields) ? $preferredFields : [
        'vtt','webvtt','srt','captions','subtitles','subtitle','subtitle_vtt',
        'text','body','data','content','transcript'
    ];

    // 2) Try preferred fields (if present and stringy)
    foreach ($preferredFields as $k) {
        if (array_key_exists($k, $arr) && is_string($arr[$k]) && $looksLike($arr[$k])) {
            return $arr[$k];
        }
    }

    // 3) Scan all top-level string fields as a fallback
    foreach ($arr as $v) {
        if (is_string($v) && $looksLike($v)) {
            return $v;
        }
    }

    return null;
}
<?php

require_once (str_replace('\\', '/', __DIR__) . "/../../../website_code/php/database_library.php");

function log_ai_request($response, $category, $vendor, $actor = array(), $sessionId = null)
{
    global $xerte_toolkits_site;
    $table = $xerte_toolkits_site->database_table_prefix . 'ai_request_logs';

    $category = strtolower($category);
    $vendor = strtolower($vendor);
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
        'metrics' => array(),
        'actor' => array(
            'user_id' => isset($actor['user_id']) ? $actor['user_id'] : null,
            'workspace_id' => isset($actor['workspace_id']) ? $actor['workspace_id'] : null,
        ),
        'session_id' => $sessionId,
        'cost' => null,
        'event_id' => uuid_v4(),
    );

    // Generic error/status
    if (isset($response['error'])) {
        $event['status'] = 'error';
        $event['error_message'] = isset($response['error']['message']) ? $response['error']['message'] : null;
    } elseif (isset($response['status']) && $response['status'] === 'failed') {
        $event['status'] = 'error';
        if ($event['error_message'] === null && isset($response['last_error']['message'])) {
            $event['error_message'] = $response['last_error']['message'];
        }
    }

    // Vendor+type extraction
    if ($category === 'genai') {
        if ($vendor === 'openai') map_genai_openai($response, $event);
        elseif ($vendor === 'openaiassistant') map_genai_openaiassistant($response, $event);
        elseif ($vendor === 'mistral') map_genai_mistral($response, $event);
        elseif ($vendor === 'anthropic') map_genai_anthropic($response, $event);
        else                           map_genai_default($response, $event);
    } elseif ($category === 'encoding' || $category === 'embedding') {
        if ($vendor === 'openaienc') map_encoding_openai($response, $event);
        elseif ($vendor === 'mistralenc') map_encoding_mistral($response, $event);
        else                           map_encoding_default($response, $event);
    } elseif ($category === 'transcription') {
        if ($vendor === 'openai') map_transcription_openai($response, $event);  // Whisper
        elseif ($vendor === 'gladia') map_transcription_gladia($response, $event);
        else                           map_transcription_default($response, $event);
    } else {
        map_generic_default($response, $event);
    }

    // Prepare values for DB
    $occurred = (new DateTimeImmutable($event['occurred_at']))->setTimezone(new DateTimeZone('UTC'));
    $occurredAt = $occurred->format('Y-m-d H:i:s.u');

    $sql = "INSERT INTO `{$xerte_toolkits_site->database_table_prefix}ai_request_logs`
      (event_id, schema_version, occurred_at, category, service, model, request_id,
       status, error_message, actor, metrics, session_id, cost)
    VALUES
      (:event_id, :schema_version, :occurred_at, :category, :service, :model, :request_id,
       :status, :error_message, :actor, :metrics, :session_id, :cost)
    ON DUPLICATE KEY UPDATE
      status        = :status,
      error_message = :error_message,
      model         = :model,
      metrics       = :metrics,
      cost          = :cost";

    db_query($sql, array(
        ':event_id' => $event['event_id'],
        ':schema_version' => $event['schema_version'],
        ':occurred_at' => $occurredAt,
        ':category' => $event['category'],
        ':service' => $event['service'],
        ':model' => $event['model'],
        ':request_id' => $event['request_id'],
        ':status' => $event['status'],
        ':error_message' => $event['error_message'],
        ':actor' => json_encode($event['actor'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        ':metrics' => json_encode($event['metrics'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        ':session_id' => $event['session_id'],
        ':cost' => json_encode($event['cost'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    ));
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

function map_genai_openai($res, &$ev)
{
    $ev['model']      = isset($res['model']) ? $res['model'] : null;
    $ev['request_id'] = isset($res['id']) ? $res['id'] : null;

    $u = isset($res['usage']) ? $res['usage'] : array();
    $in  = isset($u['prompt_tokens'])     ? $u['prompt_tokens']     : (isset($u['input_tokens']) ? $u['input_tokens'] : null);
    $out = isset($u['completion_tokens']) ? $u['completion_tokens'] : (isset($u['output_tokens']) ? $u['output_tokens'] : null);
    $tot = isset($u['total_tokens']) ? $u['total_tokens'] : null;
    if ($tot === null && ($in !== null || $out !== null)) $tot = (int)$in + (int)$out;

    $ev['metrics'] = array('input_tokens'=>$in, 'output_tokens'=>$out, 'total_tokens'=>$tot);
}

function map_genai_openaiassistant($res, &$ev)
{
    // Model & request id
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');

    // Status mapping (completed = ok; failed/cancelled = error; others keep whatever caller set)
    $runStatus = _a($res, 'status');
    if ($runStatus === 'failed' || $runStatus === 'cancelled') {
        $ev['status'] = 'error';
    } elseif ($runStatus === 'completed') {
        $ev['status'] = 'ok';
    }

    // Error message if any (Assistants uses last_error)
    $lastErr = _a($res, 'last_error');
    if (is_array($lastErr)) {
        $ev['error_message'] = _a($lastErr, 'message', _a($lastErr, 'code'));
    }

    // Tokens
    $u   = _a($res, 'usage', array());
    $in  = _a($u, 'prompt_tokens');
    $out = _a($u, 'completion_tokens');
    $tot = _a($u, 'total_tokens');
    if ($tot === null && ($in !== null || $out !== null)) {
        $tot = (int)$in + (int)$out;
    }
    // Optional: cached prompt tokens (relevant if we do more complex cost estimates)
    $ptd = _a($u, 'prompt_token_details', array());
    $cached = _a($ptd, 'cached_tokens');

    $ev['metrics'] = array(
        'input_tokens'        => $in,
        'output_tokens'       => $out,
        'total_tokens'        => $tot,
        'cached_prompt_tokens'=> $cached !== null ? (int)$cached : null
    );

    // Prefer provider timestamps for occurred_at if available
    $when =
        _a($res, 'completed_at') !== null ? _a($res, 'completed_at') :
            (_a($res, 'failed_at') !== null ? _a($res, 'failed_at') :
                (_a($res, 'cancelled_at') !== null ? _a($res, 'cancelled_at') :
                    (_a($res, 'started_at') !== null ? _a($res, 'started_at') :
                        _a($res, 'created_at'))));

    if ($when !== null) {
        $iso = _epoch_to_iso($when);
        if ($iso !== null) {
            $ev['occurred_at'] = $iso; // override the default "now" set earlier
        }
    }
}

function map_genai_mistral($res, &$ev)
{
    // $res is an assoc array
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');

    $u   = _a($res, 'usage', array());
    $in  = _a($u, 'prompt_tokens');
    $out = _a($u, 'completion_tokens');
    $tot = _a($u, 'total_tokens');

    if ($tot === null && ($in !== null || $out !== null)) {
        $tot = (int)$in + (int)$out;
    }

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => $out,
        'total_tokens'  => $tot
    );
}


function map_genai_anthropic($res, &$ev)
{
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');

    $u   = _a($res, 'usage', array());
    $in  = _a($u, 'input_tokens');
    $out = _a($u, 'output_tokens');
    $tot = _a($u, 'total_tokens');

    if ($tot === null && ($in !== null || $out !== null)) {
        $tot = (int)$in + (int)$out;
    }

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => $out,
        'total_tokens'  => $tot
    );
}

function map_genai_default($res, &$ev)
{
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');

    $u   = _a($res, 'usage', array());
    $in  = _a($u, 'input_tokens',  _a($u, 'prompt_tokens'));
    $out = _a($u, 'output_tokens', _a($u, 'completion_tokens'));
    $tot = _a($u, 'total_tokens');

    if ($tot === null && ($in !== null || $out !== null)) {
        $tot = (int)$in + (int)$out;
    }

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => $out,
        'total_tokens'  => $tot
    );
}

/* ENCODING AND EMBEDDING */
function map_encoding_openai($res, &$ev)
{
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');

    $u   = _a($res, 'usage', array());
    $in  = _a($u, 'prompt_tokens', _a($u, 'input_tokens'));
    $tot = _a($u, 'total_tokens', $in);

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => null,
        'total_tokens'  => $tot
    );
}

function map_encoding_mistral($res, &$ev)
{
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');

    $u   = _a($res, 'usage', array());
    $in  = _a($u, 'prompt_tokens', _a($u, 'input_tokens'));
    $tot = _a($u, 'total_tokens', $in);

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => null,
        'total_tokens'  => $tot
    );
}

function map_encoding_default($res, &$ev)
{
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');

    $u   = _a($res, 'usage', array());
    $in  = _a($u, 'input_tokens', _a($u, 'prompt_tokens'));
    $tot = _a($u, 'total_tokens', $in);

    $ev['metrics'] = array(
        'input_tokens'  => $in,
        'output_tokens' => null,
        'total_tokens'  => $tot
    );
}

/* TRANSCRIPTION */
function map_transcription_openai($res, &$ev)
{
    $ev['model']      = _a($res, 'model', _a($res, 'transcription_model'));
    $ev['request_id'] = _a($res, 'id');

    $ms  = _a($res, 'duration_ms', _a($res, 'audio_ms'));
    $sec = null;

    if ($ms !== null) {
        $sec = round(((int)$ms) / 1000.0, 3);
    } else {
        $sec = _a($res, 'duration', _a($res, 'audio_seconds'));
        if ($sec !== null) $sec = (float)$sec;
    }

    $ev['metrics'] = array(
        'audio_ms'      => $ms !== null ? (int)$ms : null,
        'audio_seconds' => $sec
    );
}

function map_transcription_gladia($res, &$ev)
{
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'request_id', _a($res, 'id'));

    $sec = _a($res, 'audio_duration', _a($res, 'duration'));
    $ms  = null;

    if ($sec !== null) {
        $sec = (float)$sec;
        $ms  = (int)round($sec * 1000);
    }

    $ev['metrics'] = array(
        'audio_ms'      => $ms,
        'audio_seconds' => $sec
    );
}

function map_transcription_default($res, &$ev)
{
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');

    $ms  = _a($res, 'audio_ms', _a($res, 'duration_ms'));
    $sec = null;

    if ($ms !== null) {
        $sec = round(((int)$ms) / 1000.0, 3);
    } else {
        $sec = _a($res, 'audio_seconds', _a($res, 'duration'));
        if ($sec !== null) $sec = (float)$sec;
    }

    $ev['metrics'] = array(
        'audio_ms'      => $ms !== null ? (int)$ms : null,
        'audio_seconds' => $sec
    );
}

/* Fallback, just in case */
function map_generic_default($res, &$ev)
{
    $ev['model']      = _a($res, 'model');
    $ev['request_id'] = _a($res, 'id');
    $ev['metrics']    = array();
}

/* SQL helpers */

function sql_quote($str)
{
    if ($str === null) return "NULL";
    // escape single quotes by doubling
    $s = str_replace("'", "''", (string)$str);
    return "'" . $s . "'";
}

function sql_nullable($str)
{
    return $str !== null && $str !== '' ? sql_quote($str) : "NULL";
}

function sql_json($value)
{
    if ($value === null) return "NULL";
    // encode JSON and quote for SQL
    $json = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return sql_quote($json);
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
function _a($arr, $key, $default = null)
{
    return (is_array($arr) && array_key_exists($key, $arr)) ? $arr[$key] : $default;
}
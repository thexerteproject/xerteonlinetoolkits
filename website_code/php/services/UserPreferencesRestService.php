<?php
/**
 * REST handler for saving user preferences (JSON response via ApiResponse).
 */

function user_preferences_rest_save(array $params)
{
    global $xerte_toolkits_site;

    require_once $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->php_library_path . 'user_library.php';

    if (empty($_SESSION['toolkits_logon_id']) || empty($_SESSION['toolkits_logon_username'])) {
        return array('ok' => false, 'status' => 401, 'code' => 'auth_required', 'message' => 'Please login');
    }

    try {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
        if (!$authmech || !$authmech->hasUserPreferences()) {
            return array('ok' => false, 'status' => 400, 'code' => 'preferences_not_supported', 'message' => 'User preferences not supported');
        }
    } catch (Throwable $e) {
        return array('ok' => false, 'status' => 500, 'code' => 'auth_mechanism_error', 'message' => $e->getMessage());
    }

    $row = db_query_one(
        "SELECT preference FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE username = ?",
        array($_SESSION['toolkits_logon_username'])
    );

    $preferences = array();
    if (!empty($row) && isset($row['preference']) && !empty($row['preference'])) {
        $decoded = json_decode($row['preference'], true);
        if (is_array($decoded)) {
            $preferences = $decoded;
        }
    }

    if (isset($params['preferences']) && is_array($params['preferences'])) {
        foreach ($params['preferences'] as $k => $v) {
            $preferences[$k] = $v;
        }
    } elseif (isset($params['key']) && array_key_exists('value', $params)) {
        $preferences[(string) $params['key']] = $params['value'];
    } else {
        return array('ok' => false, 'status' => 400, 'code' => 'missing_preference_data', 'message' => 'No preference data provided');
    }

    $preferences_json = json_encode($preferences);
    if ($preferences_json === false) {
        return array('ok' => false, 'status' => 400, 'code' => 'invalid_preferences', 'message' => 'Could not encode preferences');
    }

    $query = "UPDATE {$xerte_toolkits_site->database_table_prefix}logindetails SET preference = ? WHERE username = ?";
    $result = db_query($query, array($preferences_json, $_SESSION['toolkits_logon_username']));
    if ($result === false) {
        return array('ok' => false, 'status' => 500, 'code' => 'save_failed', 'message' => 'Failed to save preferences to database');
    }

    $_SESSION['toolkits_preferences'] = $preferences;
    return array('ok' => true, 'data' => array('success' => true, 'message' => 'Preferences saved', 'preferences' => $preferences));
}


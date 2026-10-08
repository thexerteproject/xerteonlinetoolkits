<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Start output buffering to catch any errors
ob_start();

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once(dirname(__FILE__) . "/../../config.php");
// user_library.php lives in the PHP library path, not next to this file
require_once($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->php_library_path . "user_library.php");

// Set content type for JSON response
header('Content-Type: application/json');

if(empty($_SESSION['toolkits_logon_id'])) {
    error_log("save_user_preferences.php: User not logged in");
    echo json_encode(array("success" => false, "message" => "Please login"));
    exit;
}

// Check if user has preferences capability
try {
    $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    
    if (!$authmech || !$authmech->hasUserPreferences()) {
        echo json_encode(array("success" => false, "message" => "User preferences not supported"));
        exit;
    }
} catch (Exception $e) {
    echo json_encode(array("success" => false, "message" => "Error creating auth mechanism: " . $e->getMessage()));
    exit;
}

// Check if username is set
if (!isset($_SESSION['toolkits_logon_username']) || empty($_SESSION['toolkits_logon_username'])) {
    echo json_encode(array("success" => false, "message" => "Username not found in session"));
    exit;
}

// Get existing preferences from database (as TEXT/JSON string)
$row = db_query_one("SELECT preference FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE username = ?", array($_SESSION['toolkits_logon_username']));

// Initialize preferences array
$preferences = array();

// If preferences exist in database, parse JSON string to array
if (!empty($row) && isset($row['preference']) && !empty($row['preference'])) {
    $preferences = json_decode($row['preference'], true);
    // If JSON decode failed, start with empty array
    if ($preferences === null) {
        $preferences = array();
    }
}

// Update preferences with new values from POST
if (isset($_POST['preferences']) && is_array($_POST['preferences'])) {
    // Handle multiple preferences at once
    foreach ($_POST['preferences'] as $key => $value) {
        $preferences[$key] = $value;
    }
} else {
    // Handle single preference update (key/value format)
    if (isset($_POST['key']) && isset($_POST['value'])) {
        $preferences[$_POST['key']] = $_POST['value'];
    } else {
        echo json_encode(array("success" => false, "message" => "No preference data provided"));
        exit;
    }
}

// Convert preferences array back to JSON string (TEXT format for database)
$preferences_json = json_encode($preferences);

// Save preferences as JSON string in database
$query = "UPDATE {$xerte_toolkits_site->database_table_prefix}logindetails SET preference = ? WHERE username = ?";
$result = db_query($query, array($preferences_json, $_SESSION['toolkits_logon_username']));

if ($result !== false) {
    // Update session with parsed array (not JSON string)
    $_SESSION['toolkits_preferences'] = $preferences;
    ob_end_clean(); // Clear any output before sending JSON
    echo json_encode(array("success" => true, "message" => "Preferences saved"));
} else {
    ob_end_clean(); // Clear any output before sending JSON
    echo json_encode(array("success" => false, "message" => "Failed to save preferences to database"));
}


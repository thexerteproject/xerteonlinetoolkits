<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/**
 * Action and Filter Plugins for Xerte by John Smith @ Glasgow Caledonian University
 *
 * First define some constants that we need
 */
define('D_S', DIRECTORY_SEPARATOR);
define('PLUGINS_PATH', dirname(__FILE__) . D_S . 'plugins');

require_once(dirname(__FILE__) . D_S . 'library' . D_S . 'autoloader.php');

/**
 * We will be absorbing the Wordpress plugins.php code
 * Wordpress 'plugins.php' has been renamed 'wp_plugins.php' to identify Wordpress codebase
 */
require_once(dirname(__FILE__) . D_S . 'website_code' . D_S . 'php' . D_S . 'wp_plugins.php');


/**
 * Traverse the /plugins folder, if available and include any plugins that are found
 * Handles both single file plugins and also folder style plugins containing js/css/images etc
 * Only looks in PLUGINS_PATH and one dir underneath.
 * Only loads files ending in .php
 */
$files1 = glob(PLUGINS_PATH . D_S . '**' . D_S . '*.php');
$files2 = glob(PLUGINS_PATH . D_S . '*.php');
$files = array_merge($files1, $files2);

foreach ($files as $file) {
    require_once($file);
}

/**
 * After the plugins are all loaded, let's trigger an action, just in case we can use it later
 */
do_action("plugins_loaded");

/**
 * This function returns the name of the main script minus the .php extension in
 * order to help identify the current page
 *
 * @return array Filename of current script without .php and logged in status
 */
function plugins_get_context() {
    global $authmech;
    global $xerte_toolkits_site;
    if (!$authmech) {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    
    $basename = basename($_SERVER['SCRIPT_NAME'], '.php');
    $logged_in = !$authmech->needsLogin();
    return array($basename, $logged_in);
}

/**
 * This function returns true if we're on initial login page
 */
function is_login_page() {
    $context = plugins_get_context();
    //print_r($context);
    return ($context[0] == "index" && !$context[1]);
}

/**
 * This function returns true if we're on editor page
 */
function is_editor_page() {

    $context = plugins_get_context();
    return ($context[0] == "index" && $context[1]);
}

/**
 * Helper functions to trigger the appropriate action
 *
 * @return void
 */
function head_start() {
    do_action("head_start");
}

function head_end() {
    do_action("head_end");
}

function body_start() {
    do_action("body_start");
}

function body_end() {
    do_action("body_end");
}

function startup() {
    do_action("startup");
}

function shutdown() {
    do_action("shutdown");
}

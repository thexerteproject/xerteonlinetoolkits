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


$tsugi_disable_xerte_session = true;
require_once(dirname(__FILE__) . "/config.php");
require_once($xerte_toolkits_site->tsugi_dir . "/config.php");
require_once(dirname(__FILE__) . "/website_code/php/xAPI/xAPI_library.php");
require_once(dirname(__FILE__) . "/website_code/php/login_library.php");

ini_set('display_errors', 3);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);

use \Tsugi\Core\LTIX;
use \Tsugi\Core\Settings;
use \Tsugi\Util\Net;
use \Tsugi\Grades\GradeUtil;

global $tsugi_enabled;
global $xapi_enabled;
global $lti_enabled;
global $xerte_toolkits_site;
global $x_embed;
global $x_embed_activated;

_debug("SERVER: " . print_r($_SERVER, true));
_debug("LTI launch request: " . print_r($_POST, true));

$tsugi_enabled = true;
$lti_enabled = true;

_debug("Start launch");
$LAUNCH = LTIX::requireData(LTIX::USER);

$_SESSION['lti_enabled'] = $lti_enabled;


//todo overule confic authetication setting moodle => lti
//todo if no email bounce request?
//todo need username (not in edlib atm) to link in xerte
//email not given if email not verified?
$firstname = $USER->firstname ?? 'No name';
$lastname  = $USER->lastname ?? 'No last name';

$email = $USER->email ?? null;
if (!$email) {
    echo "Please verify your email";
}

login_processing2($firstname, $lastname, $email);
_debug("NEW-TEMPLATE SESSIE entry point: " . print_r($_SESSION , true));


$raw_post_array = $LAUNCH->ltiRawPostArray();
if (isset($raw_post_array["lti_message_type"])) {
    $cleaned_message_type = x_clean_input($raw_post_array["lti_message_type"]);
} else {
    die("lti request missing message type");
}

$id = '';

if (isset($_GET["template_id"])) {
    $id = x_clean_input($_GET["template_id"]);
}
else if(isset($_POST["template_id"]))
{
    $id = x_clean_input($_POST["template_id"]);
    // Hack for the rest of Xerte
    $_GET['template_id'] = $id;
} else if (isset($raw_post_array['template_id'])){
    $id = x_clean_input($raw_post_array["template_id"]);
    // Hack for the rest of Xerte
    $_GET['template_id'] = $id;
}

_debug("LTI launch: " . print_r($LAUNCH, true));
_debug("LTI user: " . print_r($USER, true));

if ($cleaned_message_type == "ContentItemSelectionRequest"){
    //item selection or edit
    require("tools/lti_edlib/content_item_selection_request.php");
} else if ($cleaned_message_type == "basic-lti-launch-request") {
    //play or copy
    require ("tools/lti_edlib/basic-lti-launch-request.php");
}


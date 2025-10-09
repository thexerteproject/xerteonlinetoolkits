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

function xerte_mail_mapping($USER)
{
    global $xerte_toolkits_site;

    //how to handle missing lastname as this is allowed by edlib
    $lti_email = $USER->email ?? null;
    $lti_name = $USER->firstname ?? "";
    $lti_last_name = $USER->lastname ?? "lti";

    if (!$lti_email) {
        echo "Please verify your email";
    }


    $qry = "SELECT username,firstname,surname FROM " . $xerte_toolkits_site->database_table_prefix . "user WHERE email = ?";
    $result = db_query_one($qry, [$lti_email]);

    if ($result === False) {
        die("connection to Xerte database failed");
    }

    $user_details = [];
    if ($result !== null) {
        return [
            "username" => $result['username'],
            "firstname" => $result['firstname'],
            "surname" => $result['surname']
        ];
    }

    create_new_user($lti_email, $lti_name, $lti_last_name);

    return [
        "username" => $lti_email,
        "firstname" => $lti_name,
        "surname" => $lti_last_name
    ];

    // make new users user with empty pw field

}

function create_new_user($username, $firstname, $lastname)
{
    global $authmech, $xerte_toolkits_site;

    $authmech_can_manage_users = false;
    $altauthmech_can_manage_users = false;

    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if ($authmech->check())
    {
        $authmech_can_manage_users = true;
    }

    if ($xerte_toolkits_site->altauthentication != "")
    {
        $altauthmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->altauthentication);
        if ($altauthmech->check())
        {
            $altauthmech_can_manage_users = true;
        }
    }

    $mesg = "";

    if (strlen($username) == 0 || strlen($firstname) == 0 ) {
        $mesg .= "missing email or name";
    }

    if ($authmech_can_manage_users) {
        $mesg .= $authmech->addUser($username, $firstname, $lastname, 'asdacascascascdfhdfh!$@@#@$', $username);
    } else if ($altauthmech_can_manage_users){
        $mesg .= $altauthmech->addUser($username, $firstname, $lastname, 'ascascascdfgdh2$%@^#^#', $username);
    }

    if (strlen($mesg) > 0) {
        die("creating user failed");
    }

    //make pw for these users empty to prevent manual login
    $qry = "UPDATE " . $xerte_toolkits_site->database_table_prefix . "user SET password = '' WHERE email = ?";
    $result = db_query_one($qry, [$username]);

    if ($result === False) {
        die("");
    }

}

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



$user_details = xerte_mail_mapping($USER);

login_processing2($user_details['firstname'], $user_details['surname'], $user_details['username']);

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


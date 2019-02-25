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
 *
 * Play page, displays the template to the end user
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */



require_once(dirname(__FILE__) . "/config.php");
require_once(dirname(__FILE__) . "/pedit_config.php");

_load_language_file("/play.inc");

require_once $xerte_toolkits_site->php_library_path . "display_library.php";
require_once $xerte_toolkits_site->php_library_path . "template_library.php";



//error_reporting(E_ALL);
//ini_set('display_errors',"ON");


global $tsugi_enabled, $pedit_enabled;


if (!isset($_GET['template_id']) || !is_numeric($_GET['template_id'])) {

    /*
     * Was not numeric, so display error message
     */
    echo file_get_contents($xerte_toolkits_site->website_code_path . "error_top") . " " . PLAY_RESOURCE_FAIL . " </div></div></body></html>";
    exit(0);
}

//Decrypt Function
function decrypt($decrypt) {
    global $pedit_config;
    $key_hex = $pedit_config->key;
    $key_bin = hex2bin($key_hex);

    $decoded = base64_decode($decrypt);
    $iv = str_repeat("\x00", openssl_cipher_iv_length ('des-cbc'));
    $decrypted = openssl_decrypt($decoded, 'des-cbc', $key_bin, OPENSSL_RAW_DATA, $iv);
    return $decrypted;
}

$id = $_GET['template_id'];
if (is_numeric($id))
{

    if (!isset($_REQUEST['param']))
    {
        $xerte_toolkits_site->lti_user->first_name = "Guest";
        $xerte_toolkits_site->lti_user->last_name = "User";
        $xerte_toolkits_site->lti_user->email = "info@cowsignals.com";
        $xerte_toolkits_site->lti_user->displayname = "Guest User";
    }
    else
    {
        $decoded = decrypt($_REQUEST['param']);

        $temp = explode('&', $decoded);
        $params['actor'] = explode('=', $temp[0])[1];
        $params['timestamp'] = explode('=', $temp[1])[1];


        $client = new SoapClient($pedit_config->soapUrl);

        $soapresult = $client->GetSystemUserByActorId(array(
            'sKey' => $pedit_config->soapKey,
            'iActorID' => $params['actor']
        ));

        $userxml = $soapresult->GetSystemUserByActorIdResult;
        $user = simplexml_load_string($userxml);
        $members = $user->xpath('//member');

        $attrs = $members[0]->attributes();

        $xerte_toolkits_site->lti_user->first_name = (string) $members[0]['firstName'];
        if (strlen($members[0]['middleName']) > 0)
        {
            $xerte_toolkits_site->lti_user->last_name = (string)$members[0]['middleName'] . ' ' . (string)$members[0]['lastName'];
        }
        else {
            $xerte_toolkits_site->lti_user->last_name = (string)$members[0]['lastName'];
        }
        $xerte_toolkits_site->lti_user->email = (string)$members[0]['emailAddressPrivate'];
        $xerte_toolkits_site->lti_user->displayname = $xerte_toolkits_site->lti_user->first_name . ' ' . $xerte_toolkits_site->lti_user->last_name;

    }
    $pedit_enabled = true;
    $tsugi_enabled = true;
    if (isset($_REQUEST['group']))
    {
        $xerte_toolkits_site->group = $_REQUEST{'group'};
    }
    if (isset($_REQUEST['course'])) {
        $xerte_toolkits_site->course = $_REQUEST['course'];
    }
    if (isset($_REQUEST['module'])) {
        $xerte_toolkits_site->module = $_REQUEST['module'];
    }

    // Get LRS endpoint and see if xAPI is enabled
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $q = "select * from {$prefix}templatedetails where template_id=?";
    $params = array($id);
    $row = db_query_one($q, $params);
    if ($row === false)
    {
        die("template_id not found");
    }
    if ($row['tsugi_xapi_useglobal'])
    {
        $q = "select LRS_Endpoint, LRS_Key, LRS_Secret from {$prefix}sitedetails where site_id=1";
        $globalrow = db_query_one($q);
        $lrs = array('lrsendpoint' => $globalrow['LRS_Endpoint'],
            'lrskey' => $globalrow['LRS_Key'],
            'lrssecret' => $globalrow['LRS_Secret'],
        );
    }
    else{
        $lrs = array('lrsendpoint' => $row['tsugi_xapi_endpoint'],
            'lrskey' => $row['tsugi_xapi_key'],
            'lrssecret' => $row['tsugi_xapi_secret'],
        );
    }


    $_SESSION['XAPI_PROXY'] = $lrs;

    require(dirname(__FILE__) . "/play.php");
}

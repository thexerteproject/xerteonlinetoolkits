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

require_once(dirname(__FILE__) . "/config.php");
require_once(dirname(__FILE__) . "/website_code/php/xAPI/xAPI_library.php");

global $tsugi_enabled;
global $xerte_toolkits_site;

$id = $_GET["template_id"];
if(is_numeric($id))
{
    if (!isset($_REQUEST['group']))
    {
        die('group parameter not supplied!');
    }
	$tsugi_enabled = true;
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

    $lrs = CheckLearningLocker($lrs);
    $_SESSION['XAPI_PROXY'] = $lrs;

    $xerte_toolkits_site->group = $_REQUEST['group'];
    if (isset($_REQUEST['actor'])) {
        $xapi_user = new stdClass();
        $xapi_user->email = $_REQUEST['actor'];
        $pos = strpos($xapi_user->email, '@');
        if ($pos === false)
        {
            $xapi_user->displayname = $xapi_user->email;
            $xapi_user->email .= "@example.com";
            $xapi_user->email = str_replace(' ', '', $xapi_user->email);
            $xapi_user->studentidmode = 2;
        }
        else{
            $xapi_user->displayname = substr($xapi_user->email, 0, $pos);
            $xapi_user->studentidmode = 0;
        }
        $xerte_toolkits_site->xapi_user = $xapi_user;
    }
    if (isset($_REQUEST['course'])) {
        $xerte_toolkits_site->course = $_REQUEST['course'];
    }
    if (isset($_REQUEST['module'])) {
        $xerte_toolkits_site->course = $_REQUEST['module'];
    }

	require("play.php");

}
?>
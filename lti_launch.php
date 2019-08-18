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

ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);

use \Tsugi\Core\LTIX;
use \Tsugi\Core\Settings;
use \Tsugi\Util\Net;
use \Tsugi\Grades\GradeUtil;

global $tsugi_enabled;
global $xerte_toolkits_site;

if (isset($_GET["template_id"])) {
    $id = $_GET["template_id"];
}
else if(isset($_POST["template_id"]))
{
    $id = $_POST["template_id"];
    // Hack for the rest of Xerte
    $_GET['template_id'] = $id;
}
if(is_numeric($id) || $id == null)
{
	$tsugi_enabled = true;
	$lti_enabled = true;
    $LAUNCH = LTIX::requireData();

    if ($id == null)
    {
        $id = $LAUNCH->ltiRawParameter('template_id');
        if (!is_numeric($id))
        {
            exit;
        }
        // Hack for the rest of Xerte
        $_GET['template_id'] = $id;
    }

    _debug("LTI user: " . print_r($USER, true));
    $xerte_toolkits_site->lti_user = $USER;

    $group = $LAUNCH->ltiRawParameter('group');
    if ($group === false)
    {
        $group = $LAUNCH->ltiCustomGet('group');
    }
    if ($group===false && isset($_REQUEST['group']))
    {
        $group = $_REQUEST{'group'};
    }
    if ($group !== false)
    {
        $xerte_toolkits_site->group = $group;
    }
    $course = $LAUNCH->ltiRawParameter('course');
    if ($course === false)
    {
        $course = $LAUNCH->ltiCustomGet('course');
    }
    if ($course===false && isset($_REQUEST['course']))
    {
        $course = $_REQUEST{'course'};
    }
    if ($course !== false)
    {
        $xerte_toolkits_site->course = $course;
    }
    $module = $LAUNCH->ltiRawParameter('module');
    if ($module === false)
    {
        $module = $LAUNCH->ltiCustomGet('module');
    }
    if ($module===false && isset($_REQUEST['module']))
    {
        $module = $_REQUEST{'module'};
    }
    if ($module !== false)
    {
        $xerte_toolkits_site->module = $module;
    }
    if (isset($_REQUEST['module'])) {
        $xerte_toolkits_site->course = $_REQUEST['module'];
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
    $lrs = CheckLearningLocker($lrs);

    $_SESSION['XAPI_PROXY'] = $lrs;

    require("play.php");

}
?>

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
global $xapi_enabled;
global $lti_enabled;
global $xerte_toolkits_site;
global $x_embed;
global $x_embed_activated;

_debug("SERVER: " . print_r($_SERVER, true));
_debug("LTI launch request: " . print_r($_POST, true));

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
    _debug("Start launch");
    $LAUNCH = LTIX::requireData(LTIX::USER);

    _debug("LTI launch: " . print_r($LAUNCH, true));

    if (method_exists($LAUNCH, 'isLTIAdvantage'))
    {
        $islti13 = $LAUNCH->isLTIAdvantage();
    }
    else{
        $islti13 = false;
    }
    if ($islti13) {
        $msg = array();
        $nrps = $LAUNCH->context->loadNamesAndRoles(false, $msg);
        //DONE: get all emails of current users add to array
        // https://gitlab.tor.nl/xerte-dashboard/dashboard/-/blob/master/index.php line 80
	    _debug('LTI 1.3 names and roles result: ' . print_r($nrps, true));
        $xerte_toolkits_site->lti_users = array();
        foreach ($nrps->members as $i => $member){
            if ($member->status == 'Active' && in_array('Learner', $member->roles))
            $xerte_toolkits_site->lti_users[] = sha1('mailto:'.$member->email);
        }
    }

    if ($id == null)
    {
        $id = $LAUNCH->ltiCustomGet('template_id');
        if (!is_numeric($id))
        {
            exit;
        }
        // Hack for the rest of Xerte
        $_GET['template_id'] = $id;
    }

    _debug("LTI user: " . print_r($USER, true));
    $xerte_toolkits_site->lti_user = $USER;
    if (!isset($xerte_toolkits_site->lti_user->email))
    {
        $xerte_toolkits_site->lti_user->email = $xerte_toolkits_site->lti_user->id . '@test.com';
    }

    $group = $LAUNCH->ltiParameter('group');
    if ($group === false)
    {
        $group = $LAUNCH->ltiCustomGet('group');
    }
    if ($group===false && isset($_REQUEST['group']))
    {
        $group = $_REQUEST['group'];
    }
    if ($group !== false)
    {
        $xerte_toolkits_site->group = $group;
    }
    $course = $LAUNCH->ltiParameter('course');
    if ($course === false)
    {
        $course = $LAUNCH->ltiCustomGet('course');
    }
    if ($course===false && isset($_REQUEST['course']))
    {
        $course = $_REQUEST['course'];
    }
    if ($course !== false)
    {
        $xerte_toolkits_site->course = $course;
    }
    $module = $LAUNCH->ltiParameter('module');
    if ($module === false)
    {
        $module = $LAUNCH->ltiCustomGet('module');
    }
    if ($module===false && isset($_REQUEST['module']))
    {
        $module = $_REQUEST['module'];
    }
    if ($module !== false)
    {
        $xerte_toolkits_site->module = $module;
    }
    if (isset($LAUNCH->context->context_id))
    {
        $lticontextid = $LAUNCH->context->context_id;
	    _debug('Context id set from context->context_id');
    }
    else {
        $lticontextid = $LAUNCH->ltiParameter('context_id');
        if ($lticontextid !== false) {
            _debug('Context id set from parameter');
        }
        if ($lticontextid === false) {
            $lticontextid = $LAUNCH->ltiCustomGet('context_id');
            _debug('Context id set from custom parameter');
        }
        if ($lticontextid === false && isset($_REQUEST['context_id'])) {
            $lticontextid = $_REQUEST['context_id'];
            _debug('Context id set from request');
        }
        if ($lticontextid === false) {
            $lticontextid = $LAUNCH->context->id;
            _debug('Context id set from context->id');
        }
    }
    if ($lticontextid !== false)
    {
        $xerte_toolkits_site->lti_context_id = $lticontextid;
    }
    $lticontextname = $LAUNCH->ltiParameter('context_title');
    if ($lticontextname === false)
    {
        $lticontextname = $LAUNCH->ltiCustomGet('context_title');
    }
    if ($lticontextname===false && isset($_REQUEST['context_title']))
    {
        $lticontextname = $_REQUEST['context_title'];
    }
    if ($lticontextname === false)
    {
        $lticontextname = $LAUNCH->context->title;
    }
    if ($lticontextname !== false)
    {
        $xerte_toolkits_site->lti_context_name = $lticontextname;
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
    if ($row['tsugi_xapi_enabled'] == '1') {
        $xapi_enabled = true;
        if ($row['tsugi_xapi_useglobal']) {
            $q = "select LRS_Endpoint, LRS_Key, LRS_Secret from {$prefix}sitedetails where site_id=1";
            $globalrow = db_query_one($q);
            $lrs = array('lrsendpoint' => $globalrow['LRS_Endpoint'],
                'lrskey' => $globalrow['LRS_Key'],
                'lrssecret' => $globalrow['LRS_Secret'],
            );
        } else {
            $lrs = array('lrsendpoint' => $row['tsugi_xapi_endpoint'],
                'lrskey' => $row['tsugi_xapi_key'],
                'lrssecret' => $row['tsugi_xapi_secret'],
            );
        }
        $lrs = CheckLearningLocker($lrs, true);

        $_SESSION['XAPI_PROXY'] = $lrs;
    }

    if (isset($_GET['x_embed']) && $_GET['x_embed'] === 'true') {
        $x_embed = true;
        if ($_GET['activated'] !== 'true') {
            $lti_enabled = false;
            $xapi_enabled = false;
            $x_embed_activated = false;
        } else {
            $x_embed_activated = true;
        }
    }
    require("play.php");
}


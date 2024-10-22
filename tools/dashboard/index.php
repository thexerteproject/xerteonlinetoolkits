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
require_once(dirname(__FILE__) . "/../../config.php");
require_once($xerte_toolkits_site->tsugi_dir . "/config.php");
require_once(dirname(__FILE__) . "/../../website_code/php/xAPI/xAPI_library.php");
require_once(dirname(__FILE__) . "/../../website_code/php/properties/properties_library.php");
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);

use \Tsugi\Core\LTIX;
use \Tsugi\Core\Settings;
use \Tsugi\Util\Net;
use \Tsugi\Grades\GradeUtil;

global $tsugi_enabled;
global $lti_enabled;
global $xerte_toolkits_site;

_load_language_file("/index.inc");


if (isset($_GET["template_id"])) {
    $id = $_GET["template_id"];
}
else if(isset($_POST["template_id"]))
{
    $id = $_POST["template_id"];
    // Hack for the rest of Xerte
    $_GET['template_id'] = $id;
}
if(is_numeric($id) || $id == null) {
    $tsugi_enabled = true;
    $lti_enabled = true;
    $LAUNCH = LTIX::requireData(LTIX::USER);

    $role = 'Student';
    if ($LAUNCH->user->instructor)
    {
        $role='Teacher';
    }

    $islti13 = $LAUNCH->isLTIAdvantage();
    if ($islti13) {
        $msg = array();
        $nrps = $LAUNCH->context->loadNamesAndRoles(false, $msg);

        _debug("Users found: " . print_r($nrps, true));
        $users = array();
        if ($role == 'Teacher')
        {
            // Convert list of students to array
            for ($i = 0; $i < count($nrps->members); $i++) {
                $u = new stdClass();
                if ($nrps->members[$i]->status == 'Active' && in_array('Learner', $nrps->members[$i]->roles))
                {
                    $u->name = $nrps->members[$i]->name;
                    $u->role = $nrps->members[$i]->roles[0];
                    $u->email = $nrps->members[$i]->email;
                    $u->sha1 = sha1("mailto:" . $u->email);
                    $users[] = $u;
                }
            }
        }
    }
    else
    {
        die('Access denied. This dashboard requires LTI 1.3 to be used as a Teacher.');
    }


    if ($id == null) {
        $id = $LAUNCH->ltiCustomGet('template_id');
        if (!is_numeric($id)) {
            exit;
        }
        // Hack for the rest of Xerte
        $_GET['template_id'] = $id;
    }

    _debug("LTI user: " . print_r($USER, true));
    $xerte_toolkits_site->lti_user = $USER;

    if (!isset($USER->email))
    {
        die('Access denied! Current user has no email');
    }

    $group = $LAUNCH->ltiParameter('group');
    if ($group === false) {
        $group = $LAUNCH->ltiCustomGet('group');
    }
    if ($group === false && isset($_REQUEST['group'])) {
        $group = $_REQUEST['group'];
    }
    if ($group !== false) {
        $xerte_toolkits_site->group = $group;
    }

    $course = $LAUNCH->ltiParameter('course');
    if ($course === false) {
        $course = $LAUNCH->ltiCustomGet('course');
    }
    if ($course === false && isset($_REQUEST['course'])) {
        $course = $_REQUEST['course'];
    }
    if ($course !== false) {
        $xerte_toolkits_site->course = $course;
    }
    $module = $LAUNCH->ltiParameter('module');
    if ($module === false) {
        $module = $LAUNCH->ltiCustomGet('module');
    }
    if ($module === false && isset($_REQUEST['module'])) {
        $module = $_REQUEST['module'];
    }
    if ($module !== false) {
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
    if ($row === false) {
        die("template_id not found");
    }
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
    $lrs = CheckLearningLocker($lrs);
    _debug("LRS: " . print_r($lrs, true));

    $_SESSION['XAPI_PROXY'] = $lrs;
    _debug("Session: " . print_r($_SESSION, true));
    _debug("Request: " . print_r($_REQUEST, true));

    $version = getVersion();

    $info = new stdClass();
    $info->template_id = $id;

    $statistics_available = statistics_prepare($id, true);

    if ($statistics_available->published) {
        $info->properties .= $statistics_available->linkinfo;
    }
    $info->properties .= $statistics_available->info;
    $info->fetch_statistics = $statistics_available->available;
    $info->lrs = $statistics_available->lrs;
    $info->dashboard = $statistics_available->dashboard;
    $info->role = $role;
    if ($role != "Student") {
        $info->users = $users;
    }
    $info->actor = $USER->email;
    $info->displayname = $USER->displayname;
    $info->firstname = $USER->firstname;
    $info->lastname = $USER->lastname;
    $info->unanonymous = 'true';
    $info->dashboard->enable_nonanonymous = 'true';

    // Fix lrsproxy and add php session if needed
    $info->lrs->lrsendpoint = $xerte_toolkits_site->site_url . (function_exists('addSession') ? addSession("xapi_proxy.php") . "&tsugisession=1" : "xapi_proxy.php");
    _debug("Dashboard setup: " . print_r($info, true));
    _debug("Dashboard setup, json " . json_encode($info));
}

/*
* Output the main page, including the user's and blank templates
*/
?>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <!--

    HTML to use to set up the template management page

    Version 1.0

    -->
    <title>Xerte Dashboard</title>
    <link rel="stylesheet" href="../../editor/css/jquery-ui.css">
    <link rel="stylesheet" href="../../editor/js/vendor/themes/default/style.css?version=<?php echo $version;?>" />
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="../../editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>
    <script type="text/javascript" src="../../editor/js/vendor/jquery.ui-1.10.4.js"></script>
    <script type="text/javascript" src="../../editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
    <script type="text/javascript" src="../../editor/js/vendor/jquery.ui.touch-punch.min.js"></script>
    <script type="text/javascript" src="../../editor/js/vendor/modernizr-latest.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script type="text/javascript" src="../../modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.gallery.min.js?version=<?php echo $version;?>"></script>
    <link rel="icon" href="../../favicon.ico" type="image/x-icon"/>
    <link rel="shortcut icon" href="../../favicon.ico" type="image/x-icon"/>
    <!-- link rel="stylesheet" type="text/css" href="../../modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css?version=<?php echo $version;?>"-->
    <!-- link rel="stylesheet" type="text/css" href="../../modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css"-->
    <link rel="stylesheet" type="text/css" href="../../modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="../../modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
    <link rel="stylesheet" type="text/css" href="../../modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v5-font-face.min.css">
    <link href="../../website_code/styles/bootstrap.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="../../website_code/styles/nv.d3.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="../../website_code/styles/xapi_dashboard.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href='https://fonts.googleapis.com/css?family=Cabin' rel='stylesheet' type='text/css'>
    <link href="../../website_code/styles/folder_popup.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="../../website_code/styles/jquery-ui-layout.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="../../website_code/styles/xerte_buttons.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="../../website_code/styles/frontpage.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="../../modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" href="../../modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.gallery.min.css?version=<?php echo $version;?>" />

    <?php
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
    {
        ?>
        <link href='branding/branding.css' rel='stylesheet' type='text/css'>
        <?php
    }
    if (isset($_SESSION['toolkits_language']))
    {
        $languagecodevar = "var language_code = \"" . $_SESSION['toolkits_language'] . "\"";
    }
    else
    {
        $languagecodevar = "var language_code = \"en-GB\"";
    }
    echo "
        <script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS
            var site_url = \"{$xerte_toolkits_site->site_url}\";
            var site_apache = \"{$xerte_toolkits_site->apache}\";
            var properties_ajax_php_path = \"website_code/php/properties/\";
            var management_ajax_php_path = \"website_code/php/management/\";
            var ajax_php_path = \"website_code/php/\";
            {$languagecodevar};
        </script>";
    ?>
    <script type="text/javascript" language="javascript" src="../../website_code/scripts/validation.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../website_code/scripts/tooltip.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../website_code/scripts/popper.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../website_code/scripts/bootstrap.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../modules/xerte/xAPI/xapicollection.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../modules/xerte/xAPI/xapidashboard.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../modules/xerte/xAPI/xapiwrapper.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../website_code/scripts/moment.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../website_code/scripts/jquery-ui-i18n.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="../../website_code/scripts/result.js?version=<?php echo $version;?>"></script>

    <?php
    _include_javascript_file("website_code/scripts/xapi_dashboard_data.js?version=" . $version);
    _include_javascript_file("website_code/scripts/xapi_dashboard.js?version=" . $version);

    ?>
    </head>

<!--

code to sort out the javascript which prevents the text selection of the templates (allowing drag and drop to look nicer

body_scroll handles the calculation of the documents actual height in IE.

-->

<body >

<div class="dashboard-wrapper" id="dashboard-wrapper">

    <div class="dashboard" id="dashboard">
        <div id="options-div">
            <div class="row dash-row">
                <div class="dash-col unanonymous-view" >
                    <label for="dp-unanonymous-view">
                        <?php echo INDEX_XAPI_DASHBOARD_SHOW_NAMES; ?>
                    </label>
                    <input type="checkbox" id="dp-unanonymous-view" >
                </div>

                <div class="dash-col">
                    <label for="dp-start">
                        <?php echo INDEX_XAPI_DASHBOARD_FROM; ?>
                    </label>
                    <input type="text" id="dp-start" value="2018/03/24 21:23" data-test="2018/03/24 21:23">
                </div>
                <div class="dash-col-1">
                    <label for="dp-end">
                        <?php echo INDEX_XAPI_DASHBOARD_UNTIL; ?>
                    </label>
                    <input type="text" id="dp-end">
                </div>
                <div class="dash-col-1">
                    <label for="dp-end">
                        <?php echo INDEX_XAPI_DASHBOARD_GROUP_SELECT; ?>
                    </label>
                    <select type="text" id="group-select">
                        <option value="all-groups"><?php echo INDEX_XAPI_DASHBOARD_GROUP_ALL; ?></option>
                    </select>
                </div>
                <div class="show-display-options-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_DISPLAY_OPTIONS; ?>
                    </button>
                </div>
                <div class="show-question-overview-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_QUESTION_OVERVIEW; ?>
                    </button>
                </div>
                <div class="dashboard-print-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_PRINT; ?>
                    </button>
                </div>
            </div>
        </div>
        <div id="dashboard-title"></div>
        <div class="jorneyData-container">
            <div id="journeyData" class="journeyData journey-container"></div>
        </div>
    </div>
</div>

<script>
    var info = <?php echo json_encode($info); ?>;
    var today = new Date();
    var start = new Date(today.getTime() - info.dashboard.default_period * 24 * 60 * 60 * 1000);
    var startstartofday = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
    var todayendofday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 0);
    var x_Dashboard = new xAPIDashboard(info);
    $(document).ready(function(){
        x_Dashboard.show_dashboard(startstartofday, todayendofday);
    });
</script>

</body>
</html>
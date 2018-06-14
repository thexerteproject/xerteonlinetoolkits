<?php
$tsugi_disable_xerte_session = true;
require_once(dirname(__FILE__) . "/config.php");
require_once($xerte_toolkits_site->tsugi_dir . "/config.php");

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


    require("play.php");

}
?>
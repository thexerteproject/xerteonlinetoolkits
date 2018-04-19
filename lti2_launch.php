<?php
$tsugi_disable_xerte_session = true;
require_once(dirname(__FILE__) . "/config.php");
require_once($xerte_toolkits_site->tsugi_dir . "/config.php");

use \Tsugi\Core\LTIX;
use \Tsugi\Core\Settings;
use \Tsugi\Util\Net;
use \Tsugi\Grades\GradeUtil;

global $tsugi_enabled;
global $xerte_toolkits_site;

$id = $_GET["template_id"];
if(is_numeric($id))
{
	$tsugi_enabled = true;
    $LAUNCH = LTIX::requireData();

    _debug("LTI user: " . print_r($USER, true));
    $xerte_toolkits_site->lti_user = $USER;

    if (isset($_REQUEST['group']))
    {
        $xerte_toolkits_site->group = $_REQUEST{'group'};
    }

	require("play.php");

}
?>
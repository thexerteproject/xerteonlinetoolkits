<?php

require_once("../../../config.php");
require_once "properties_library.php";
require_once("../template_status.php");
require_once "../user_library.php";


global $xerte_toolkits_site;

if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$tsugi_installed = false;
if (file_exists($xerte_toolkits_site->tsugi_dir)) {
    if ($xerte_toolkits_site->authentication_method == "Moodle") {
        define('XERTE_MOODLE_AUTHENTICATION', true);
    }
    define('COOKIE_SESSION', true);
    require_once($xerte_toolkits_site->tsugi_dir . "config.php");
    require_once($xerte_toolkits_site->tsugi_dir . "admin/admin_util.php");
    $tsugi_installed = true;

    ini_set('display_errors', 0);
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);
}

use \Tsugi\Core\LTIX;

if (!isset($_REQUEST['template_id'])) {
    tsugi_display_fail(false);
}

$template_id = x_clean_input($_REQUEST["template_id"], 'numeric');
if(is_user_creator_or_coauthor($template_id)||is_user_permitted("projectadmin")){
    if ($tsugi_installed) {
        $tsugi_publish = isset($_POST["tsugi_published"]) && x_clean_input($_POST["tsugi_published"]) == "true";
    }
    $lti_def = new stdClass();
    $lti_def->tsugi_installed = $tsugi_installed;
    $lti_def->secret = (isset($_POST["tsugi_secret"]) ? x_clean_input($_POST["tsugi_secret"]) : "");
    $lti_def->key = (isset($_POST["tsugi_key"]) ? x_clean_input($_POST["tsugi_key"]) : "");
    $lti_def->xapi_enabled = isset($_POST["tsugi_xapi"]) && x_clean_input($_POST["tsugi_xapi"]) == "true";
    $lti_def->published = isset($_POST["tsugi_published"]) && x_clean_input($_POST["tsugi_published"]) == "true";
    $lti_def->tsugi_useglobal = isset($_POST["tsugi_useglobal"]) && x_clean_input($_POST["tsugi_useglobal"]) == "true";
    $lti_def->tsugi_privateonly = isset($_POST["tsugi_useprivateonly"]) && x_clean_input($_POST["tsugi_useprivateonly"]) == "true";
    $lti_def->tsugi_url = $xerte_toolkits_site->site_url . "lti_launch.php?template_id=" . $template_id;
    $lti_def->tsugi13_url = $xerte_toolkits_site->site_url . "lti13_launch.php?template_id=" . $template_id;
    $lti_def->url = $xerte_toolkits_site->site_url . "lti_launch.php?template_id=" . $template_id;
    $lti_def->url13 = $xerte_toolkits_site->site_url . "lti13_launch.php?template_id=" . $template_id;
    $lti_def->xapionly_url = $xerte_toolkits_site->site_url . "xapi_launch.php?template_id=" . $template_id . "&group=groupname";
    $lti_def->xapi_useglobal = isset($_POST["tsugi_xapi_useglobal"]) && x_clean_input($_POST["tsugi_xapi_useglobal"]) == "true";
    $lti_def->xapi_endpoint = (isset($_POST["tsugi_xapi_endpoint"]) ? x_clean_input($_POST["tsugi_xapi_endpoint"]) : "");
    $lti_def->xapi_username = (isset($_POST["tsugi_xapi_username"]) ? x_clean_input($_POST["tsugi_xapi_username"]) : "");
    $lti_def->xapi_password = (isset($_POST["tsugi_xapi_password"]) ? x_clean_input($_POST["tsugi_xapi_password"]) : "");
    $lti_def->xapi_student_id_mode = (isset($_POST["tsugi_xapi_student_id_mode"]) ? x_clean_input($_POST["tsugi_xapi_student_id_mode"]) : "");
    $lti_def->tsugi_publish_in_store = isset($_POST["tsugi_publish_in_store"]) && x_clean_input($_POST["tsugi_publish_in_store"] == "true");
    $lti_def->tsugi_publish_dashboard_in_store = isset($_POST["tsugi_publish_dashboard_in_store"]) && x_clean_input($_POST["tsugi_publish_dashboard_in_store"] == "true");
    $lti_def->dashboard_urls = (isset($_POST["dashboard_urls"]) ? x_clean_input($_POST["dashboard_urls"]) : "");

// Force groupmode
    if (!$tsugi_installed) {
        $lti_def->xapi_student_id_mode = 3;
    }

    if ($lti_def->xapi_student_id_mode == 3) {
        $lti_def->url .= "&group=groupname";
        $lti_def->url13 .= "&group=groupname";
    }

    // Get current templatedetails record
    $row = db_query_one('select * from templatedetails where template_id=?', array($template_id));
    if ($tsugi_installed) {
        $PDOX = LTIX::getConnection();
        $p = $CFG->dbprefix;
        $xp = $xerte_toolkits_site->database_table_prefix;
        _debug("Data init " . print_r(x_clean_input($_POST), true));
        $url = $xerte_toolkits_site->site_url . "lti_launch.php?template_id=" . $template_id;
        _debug("Detele " . $url);


        /*
        if ($tsugi_publish) {

            $rows = $PDOX->allRowsDie("SELECT * FROM {$p}lti_key k, {$p}lti_context c, {$p}lti_link l WHERE k.key_sha256 = :KEY and c.key_id = k.key_id and l.context_id=c.context_id and l.path != :URL", array(
                ':KEY' => lti_sha256($lti_def->key),
                ':URL' => $lti_def->tsugi_url));
            if (count($rows) > 0) {
                $mesg = "Key already in use, use another key.";
                tsugi_display($template_id, $lti_def, $mesg);
                exit;
            }

        }
        */

        // Remove key from tsugi
        $rows = $PDOX->allRowsDie("SELECT * FROM {$p}lti_key k WHERE k.key_id = ?", array($row['tsugi_manage_key_id']));
        if (count($rows) > 0) {
            $sql = "delete from {$p}lti_key where key_id = ?";
            $params = array($rows[0]['key_id']);
            $res = $PDOX->queryDie($sql, $params);
        }

        if (!$tsugi_publish) {
            $sql = "UPDATE {$xp}templatedetails SET tsugi_published = 0  WHERE template_id = ?";
            db_query($sql, array($template_id));
            $mesg = "Object is no longer published.";
        }

        if ($tsugi_publish && (!$lti_def->tsugi_useglobal || $lti_def->tsugi_privateonly)) {
            $url = $xerte_toolkits_site->site_url . "lti_launch.php?template_id=" . $template_id;
            $PDOX = LTIX::getConnection();
            $p = $CFG->dbprefix;
            // $context_row = $PDOX->rowDie("SELECT MAX(context_id) FROM {$p}lti_context;");
            // $context_id = ($context_row["MAX(context_id)"]) + 1;
            // $key_row = $PDOX->rowDie("SELECT MAX(key_id) FROM {$p}lti_key;");
            // $key_id = ($key_row["MAX(key_id)"]) + 1;
            // $link_row = $PDOX->rowDie("SELECT MAX(link_id) FROM {$p}lti_link;");
            // $link_id = ($link_row["MAX(link_id)"]) + 1;
            $sql = "INSERT INTO {$p}lti_key
        ( key_sha256, key_key, secret) VALUES
            ( :key_sha256, :key_key, :secret);";

            $param = array(
                ':key_sha256' => lti_sha256($lti_def->key),
                ':key_key' => $lti_def->key,
                ':secret' => $lti_def->secret
            );
            $res = $PDOX->queryDie($sql, $param);
            // $res does NOT contains the inserted key_id
            $lti_def->tsugi_key_id = $PDOX->lastInsertId();
        }
        else{
            $lti_def->tsugi_key_id = -1;
        }
    }
    $sql = "UPDATE {$xp}templatedetails SET tsugi_published = ?, tsugi_usetsugikey = ?, tsugi_manage_key_id = ?, tsugi_privatekeyonly = ?, tsugi_xapi_enabled = ?, tsugi_xapi_useglobal = ?, tsugi_xapi_endpoint = ?, tsugi_xapi_key = ?, tsugi_xapi_secret = ?, tsugi_xapi_student_id_mode = ?, tsugi_publish_in_store = ?, tsugi_publish_dashboard_in_store = ?, dashboard_allowed_links = ? WHERE template_id = ?";
    db_query($sql,
        array(
            $lti_def->published ? "1" : "0",
            $lti_def->tsugi_useglobal ? "1" : "0",
            $lti_def->tsugi_key_id,
            $lti_def->tsugi_privateonly ? "1" : "0",
            $lti_def->xapi_enabled ? "1" : "0",
            $lti_def->xapi_enabled ? ($lti_def->xapi_useglobal ? "1" : "0") : "1",
            $lti_def->xapi_enabled ? $lti_def->xapi_endpoint : "",
            $lti_def->xapi_enabled ? $lti_def->xapi_username : "",
            $lti_def->xapi_enabled ? $lti_def->xapi_password : "",
            $lti_def->xapi_enabled ? $lti_def->xapi_student_id_mode : "0",
            $lti_def->published ? ($lti_def->tsugi_publish_in_store ? "1" : "0") : "1",
            $lti_def->published && $lti_def->xapi_enabled ? ($lti_def->tsugi_publish_dashboard_in_store ? '1' : '0') : "0",
            $lti_def->xapi_enabled ? $lti_def->dashboard_urls : "",
            $template_id
        )
    );
    tsugi_display($template_id, $lti_def, PROPERTIES_LIBRARY_TSUGI_UPDATED);

    _debug("Done");

} else {
	tsugi_display_fail(true);
}

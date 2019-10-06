<?php

	require_once("../../../config.php");
	global $xerte_toolkits_site;

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

    use \Tsugi\Util\LTI;
    use \Tsugi\Core\LTIX;
    use \Tsugi\Config\ConfigInfo;


	require_once("../../../functions.php");

	require_once "../template_status.php";

	require_once "../url_library.php";

	require_once "../user_library.php";

	require_once "properties_library.php";

    function generatePwd($length){
        $a = str_split("abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXY0123456789");
        shuffle($a);
        return substr( implode($a), 0, $length );
    }

	$id = $_REQUEST['template_id'];


	if(is_numeric($id)){
		if(is_user_creator_or_coauthor($id)||is_user_admin()){

            $database_id = database_connect("template database connect success","template change database connect failed");
            $template_id = $id;
            $safe_template_id = (int)$id;
            $query_for_preview_content = "select otd.template_name, ld.username, otd.template_framework, tr.user_id, tr.folder, tr.template_id, td.template_name as name, td.access_to_whom, td.extra_flags,";
            $query_for_preview_content .= "td.tsugi_published, td.tsugi_xapi_enabled, td.tsugi_xapi_useglobal, td.tsugi_xapi_endpoint, td.tsugi_xapi_key, td.tsugi_xapi_secret, td.tsugi_xapi_student_id_mode, td.dashboard_allowed_links";
            $query_for_preview_content .= " from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails otd, " . $xerte_toolkits_site->database_table_prefix . "templaterights tr, " . $xerte_toolkits_site->database_table_prefix . "templatedetails td, " . $xerte_toolkits_site->database_table_prefix . "logindetails ld";
            $query_for_preview_content .= " where td.template_type_id = otd.template_type_id and td.creator_id = ld.login_id and tr.template_id = td.template_id and tr.template_id=? and (role='creator' || role='co-author')";

            $params=array($safe_template_id);
            $row = db_query_one($query_for_preview_content, $params);

            $lti_def = new stdClass();
            $lti_def->tsugi_installed = $tsugi_installed;
            $lti_def->title = str_replace('_', ' ', $row['name']);
            $lti_def->xapi_enabled = $row["tsugi_xapi_enabled"];
            $lti_def->key = $row['name'] . "_" . $id;
            $lti_def->secret = generatePwd(16);
            $lti_def->published = $row["tsugi_published"];
            $lti_def->tsugi_url = $xerte_toolkits_site->site_url . "lti_launch.php?template_id=" . $row['template_id'];
            $lti_def->url = $xerte_toolkits_site->site_url . "lti_launch.php?template_id=" . $row['template_id'];
            $lti_def->xapionly_url = $xerte_toolkits_site->site_url . "xapi_launch.php?template_id=" . $row['template_id'] . "&group=groupname";
            $lti_def->xapi_useglobal = $row['tsugi_xapi_useglobal'];
            $lti_def->xapi_endpoint = $xerte_toolkits_site->LRS_Endpoint;
            $lti_def->xapi_username = $xerte_toolkits_site->LRS_Key;
            $lti_def->xapi_password = $xerte_toolkits_site->LRS_Secret;
            $lti_def->xapi_student_id_mode = 0; // e-mail address
            if ($tsugi_installed) {
                if ($lti_def->published == 1) {
                    $PDOX = LTIX::getConnection();
                    $tsugirow = $PDOX->rowDie(
                        "	SELECT l.title, k.key_key, k.secret
						FROM {$CFG->dbprefix}lti_key AS k, {$CFG->dbprefix}lti_context AS c, {$CFG->dbprefix}lti_link AS l
							WHERE k.key_id = c.key_id AND c.context_id = l.context_id AND l.path = :DPATH",
                        array(':DPATH' => $lti_def->tsugi_url));
                    if ($tsugirow !== false) {
                        $lti_def->key = $tsugirow["key_key"];
                        $lti_def->secret = $tsugirow["secret"];
                        $lti_def->title = $tsugirow["title"];
                    }
                }
            }
            if($lti_def->xapi_enabled == 1)
            {
                $lti_def->xapi_endpoint = $row["tsugi_xapi_endpoint"];
                $lti_def->xapi_username = $row["tsugi_xapi_key"];
                $lti_def->xapi_password = $row["tsugi_xapi_secret"];
                $lti_def->xapi_student_id_mode = $row["tsugi_xapi_student_id_mode"];
                $lti_def->dashboard_urls = $row["dashboard_allowed_links"];
                if ($lti_def->published != 1)
                {
                    // Force groupmode
                    $lti_def->xapi_student_id_mode = 3;
                }
            }
            if ($lti_def->xapi_student_id_mode == 3)
            {
                $lti_def->url  .= "&group=groupname";
            }
            tsugi_display($id, $lti_def,"");


		}
		else{
		    tsugi_display_fail();
        }

	}
    else
    {
        tsugi_display_fail();
    }

?>
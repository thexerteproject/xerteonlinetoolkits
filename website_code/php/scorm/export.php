<?php

/**
 *
 * export, allows the creation of zip and scorm packages
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */
require_once("../../../config.php");
include "../template_status.php";
$prefix = $xerte_toolkits_site->database_table_prefix;

ini_set('max_execution_time', 300);

if (is_numeric($_GET['template_id'])) {
    $_GET['template_id'] = (int) $_GET['template_id'];
    $proceed = false;
    if (is_template_exportable($_GET['template_id'])) {
        $proceed = true;
    } else {
        if (is_user_creator($_GET['template_id']) || is_user_admin()) {
            $proceed = true;
        }
    }

    if ($proceed) {

        $fullArchive = false;

        if (isset($_GET['full'])) {
            if ($_GET['full'] == "true") {
                $fullArchive = true;
            }
        }
        _debug("Full archive: " . $fullArchive);

        /*
         * Get the file path
         */
        $query = "select {$prefix}templatedetails.template_name as zipname, {$prefix}templaterights.template_id, "
                . "{$prefix}logindetails.username, {$prefix}originaltemplatesdetails.template_name,"
                . "{$prefix}originaltemplatesdetails.template_framework from {$prefix}templaterights, {$prefix}logindetails, "
                . "{$prefix}originaltemplatesdetails, {$prefix}templatedetails WHERE "
                . "{$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id and "
                . "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id and "
                . "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id and {$prefix}templaterights.template_id= ? AND role= ?";

        $params = array($_GET['template_id'], 'creator');
        $row = db_query_one($query, $params);
        if (file_exists($xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/export.php")) {
            require_once($xerte_toolkits_site->root_file_path . "modules/" . $row['template_framework'] . "/export.php");
        }
    }
}
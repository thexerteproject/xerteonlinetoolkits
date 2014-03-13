<?php
/**
 * 
 * properties template, shows the basic page on the properties window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "../user_library.php";
include "properties_library.php";

if(is_numeric($_POST['template_id'])){

    $template_id = (int) $_POST['template_id'];
    $engine = mysql_real_escape_string($_POST['engine']);

    if ($engine != 'flash' && $engine!='javascript')
    {
        $engine = 'javascript';
    }

    // Get extra flags
    $row = db_query_one("SELECT td.extra_flags  FROM {$xerte_toolkits_site->database_table_prefix}templatedetails td WHERE td.template_id = ?", array($template_id));

    $extra_flags = explode(";", $row['extra_flags']);
    $found = false;

    foreach($extra_flags as $i => $flag) {
        $bits = explode('=', $flag);
        if($bits[0] == 'engine') {
            $extra_flags[$i] = "engine={$engine}";
            $found = true;
            break;
        }
    }

    if (!$found)
    {
        $extra_flags[] = "engine=" . $engine;
    }

    $db_entry = str_replace(" ", "_", join(";", $extra_flags)); /* curious as to why we do a str_replace here, but don't seem to 'undo' it when reading above. */

    $query = "UPDATE {$xerte_toolkits_site->database_table_prefix}templatedetails SET extra_flags = ? WHERE template_id = ?";
    $params = array($db_entry, $template_id);
    $ok = db_query($query, $params);

    if($ok) { 
        if ($_REQUEST['page']=='properties')
        {
            properties_display($xerte_toolkits_site,$template_id,true,"engine");
        }
        else
        {
            publish_display($template_id);
        }

    }else{

    }
}

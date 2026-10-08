<?php

require_once(dirname(__FILE__) . "/../../../config.php");

_load_language_file("/properties.inc");

require_once(dirname(__FILE__) . "/../display_library.php");
require_once(dirname(__FILE__) . "/../user_library.php");
require_once(dirname(__FILE__) . "/../url_library.php");
require_once(dirname(__FILE__) . "/../properties/properties_library.php");
require_once(dirname(__FILE__) . "/../folder_status.php");

function folder_workspace_get_info($folder_id)
{
    $folder_id = (int) $folder_id;
    $_SESSION["XAPI_PROXY"] = $folder_id;

    // Minimal JSON payload for workspace sidebar (no HTML fragments).
    // Folder sharing UI remains in folder properties window.
    $prefix = $GLOBALS['xerte_toolkits_site']->database_table_prefix;
    $row = db_query_one("select folder_name, date_created, date_modified from {$prefix}folderdetails where folder_id=?", array($folder_id));

    return array(
        'folder_id' => $folder_id,
        'name' => ($row && isset($row['folder_name'])) ? str_replace('_', ' ', $row['folder_name']) : '',
        'date_created' => ($row && isset($row['date_created'])) ? $row['date_created'] : null,
        'date_modified' => ($row && isset($row['date_modified'])) ? $row['date_modified'] : null,
        'role' => get_user_access_rights_folder($folder_id),
    );
}

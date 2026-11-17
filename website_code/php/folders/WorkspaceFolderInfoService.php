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

    $prefix = $GLOBALS['xerte_toolkits_site']->database_table_prefix;
    $row = db_query_one("select folder_name, date_created from {$prefix}folderdetails where folder_id=?", array($folder_id));

    // Include sharing inherited from parent folders and keep the most permissive
    // role when the same user or group occurs more than once in the hierarchy.
    $folder_ids = array();
    $current_folder_id = $folder_id;
    while ($current_folder_id > 0 && !in_array($current_folder_id, $folder_ids, true)) {
        $folder_ids[] = $current_folder_id;
        $parent = db_query_one(
            "select folder_parent from {$prefix}folderdetails where folder_id = ?",
            array($current_folder_id)
        );
        $current_folder_id = ($parent && isset($parent['folder_parent'])) ? (int) $parent['folder_parent'] : 0;
    }

    $role_rank = array('read-only' => 1, 'editor' => 2, 'co-author' => 3, 'creator' => 4);
    $sharing_users_by_id = array();
    $sharing_groups_by_id = array();
    foreach ($folder_ids as $shared_folder_id) {
        $users = db_query(
            "select ld.login_id as user_id, ld.firstname, ld.surname, ld.username, fr.role "
            . "from {$prefix}folderrights fr join {$prefix}logindetails ld on ld.login_id = fr.login_id "
            . "where fr.folder_id = ? and fr.role != ? order by ld.firstname, ld.surname, ld.username",
            array($shared_folder_id, 'creator')
        );
        foreach ($users as $user) {
            $key = (int) $user['user_id'];
            $user['inherited'] = $shared_folder_id !== $folder_id;
            if (!isset($sharing_users_by_id[$key])
                || $role_rank[$user['role']] > $role_rank[$sharing_users_by_id[$key]['role']]) {
                $sharing_users_by_id[$key] = $user;
            }
        }

        $groups = db_query(
            "select ug.group_id, ug.group_name as name, fgr.role "
            . "from {$prefix}folder_group_rights fgr join {$prefix}user_groups ug on ug.group_id = fgr.group_id "
            . "where fgr.folder_id = ? order by ug.group_name",
            array($shared_folder_id)
        );
        foreach ($groups as $group) {
            $key = (int) $group['group_id'];
            $group['inherited'] = $shared_folder_id !== $folder_id;
            if (!isset($sharing_groups_by_id[$key])
                || $role_rank[$group['role']] > $role_rank[$sharing_groups_by_id[$key]['role']]) {
                $sharing_groups_by_id[$key] = $group;
            }
        }
    }
    $sharing_users = array_values($sharing_users_by_id);
    $sharing_groups = array_values($sharing_groups_by_id);

    return array(
        'folder_id' => $folder_id,
        'name' => ($row && isset($row['folder_name'])) ? str_replace('_', ' ', $row['folder_name']) : '',
        'date_created' => ($row && isset($row['date_created'])) ? $row['date_created'] : null,
        'role' => get_user_access_rights_folder($folder_id),
        'sharing' => array(
            'users' => $sharing_users,
            'groups' => $sharing_groups,
            'empty' => count($sharing_users) === 0 && count($sharing_groups) === 0,
        ),
    );
}

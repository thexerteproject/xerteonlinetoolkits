<?php

require_once(dirname(__FILE__) . "/../../../config.php");

function group_workspace_get_info($group_name, $group_id)
{
    // Minimal JSON payload for workspace sidebar (no HTML fragments).
    $prefix = $GLOBALS['xerte_toolkits_site']->database_table_prefix;
    $members = db_query("select ld.firstname, ld.surname, ld.username from {$prefix}logindetails ld join {$prefix}user_group_members ugm on ugm.login_id=ld.login_id where ugm.group_id=?", array($group_id));
    $member_list = array();
    foreach ($members as $m) {
        $member_list[] = array(
            'firstname' => $m['firstname'],
            'surname' => $m['surname'],
            'username' => $m['username'],
        );
    }
    return array(
        'group_name' => $group_name,
        'group_id' => (int) $group_id,
        'members' => $member_list,
    );
}

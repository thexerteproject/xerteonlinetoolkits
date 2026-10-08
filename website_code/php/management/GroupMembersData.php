<?php
/**
 * Structured group member list (no HTML) for REST API and shared queries.
 */

function management_get_group_members_data($group_id)
{
    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;

    if (is_null($group_id) || $group_id === "") {
        return null;
    }

    $query = "select * from {$prefix}logindetails ld, {$prefix}user_group_members ugm WHERE ld.login_id=ugm.login_id AND ugm.group_id=? ORDER BY ld.surname";
    $query_response = db_query($query, array($group_id));
    $group = db_query_one("SELECT * FROM {$prefix}user_groups WHERE group_id=?", array($group_id));
    if (empty($group)) {
        return null;
    }

    $members = array();
    foreach ($query_response as $row) {
        $members[] = array(
            'login_id' => $row['login_id'],
            'username' => $row['username'],
            'firstname' => $row['firstname'],
            'surname' => $row['surname'],
        );
    }

    return array(
        'group_name' => $group['group_name'],
        'member_count' => count($members),
        'members' => $members,
    );
}

<?php
/**
 * Properties REST route dispatcher and POST mutations.
 */

require_once dirname(__FILE__) . '/PropertiesRestService.php';
require_once dirname(__FILE__) . '/../template_status.php';

function properties_rest_route($method, $sub, array $params)
{
    global $xerte_toolkits_site;

    properties_rest_load_language_sets();

    $tid = properties_rest_template_id($params);

    try {
        switch ($sub) {
            case 'publish':
                if ($tid === null) {
                    ApiResponse::error(400, 'missing_template_id', 'template_id required');
                    exit;
                }
                if (!has_rights_to_this_template($tid, $_SESSION['toolkits_logon_id']) && !is_user_permitted('projectadmin')) {
                    ApiResponse::error(403, 'forbidden', 'No access');
                    exit;
                }
                ApiResponse::success(properties_rest_publish_payload($tid));
                exit;

            case 'project':
                if ($tid === null) {
                    ApiResponse::error(400, 'missing_template_id', 'template_id required');
                    exit;
                }
                if (!has_rights_to_this_template($tid, $_SESSION['toolkits_logon_id']) && !is_user_permitted('projectadmin')) {
                    ApiResponse::error(403, 'forbidden', 'No access');
                    exit;
                }
                $change = isset($params['change']) && properties_rest_truthy($params['change']);
                $msgtype = isset($params['msgtype']) ? x_clean_input($params['msgtype']) : '';
                ApiResponse::success(properties_rest_project_payload($tid, $change, $msgtype));
                exit;

            case 'default-engine':
                properties_rest_post_default_engine($params);
                exit;

            case 'rename':
                properties_rest_post_rename($params);
                exit;

            case 'notes':
                properties_rest_notes_route($method, $params);
                exit;

            case 'peer':
                properties_rest_peer_route($method, $params);
                exit;

            case 'syndication':
                properties_rest_syndication_route($method, $params);
                exit;

            case 'rss':
                properties_rest_rss_route($method, $params);
                exit;

            case 'xml':
                properties_rest_xml_route($method, $params);
                exit;

            case 'screen-size':
                properties_rest_screen_size($params);
                exit;

            case 'media-quota':
                if ($tid === null) {
                    ApiResponse::error(400, 'missing_template_id', 'template_id required');
                    exit;
                }
                if (!has_rights_to_this_template($tid, $_SESSION['toolkits_logon_id']) && !is_user_permitted('projectadmin')) {
                    ApiResponse::error(403, 'forbidden', 'No access');
                    exit;
                }
                ApiResponse::success(properties_rest_media_quota_payload($tid));
                exit;

            case 'delete-file':
                properties_rest_delete_file($params);
                exit;

            case 'delete-unused-files':
                properties_rest_delete_unused_files($params);
                exit;

            case 'access':
                properties_rest_access_route($method, $params);
                exit;

            case 'sharing-status':
                if ($tid === null) {
                    ApiResponse::error(400, 'missing_template_id', 'template_id required');
                    exit;
                }
                if (!has_rights_to_this_template($tid, $_SESSION['toolkits_logon_id']) && !is_user_permitted('projectadmin')) {
                    ApiResponse::error(403, 'forbidden', 'No access');
                    exit;
                }
                ApiResponse::success(properties_rest_sharing_status_payload($tid));
                exit;

            case 'group-sharing-status':
                if ($tid === null) {
                    ApiResponse::error(400, 'missing_template_id', 'template_id required');
                    exit;
                }
                if (!has_rights_to_this_template($tid, $_SESSION['toolkits_logon_id']) && !is_user_permitted('projectadmin')) {
                    ApiResponse::error(403, 'forbidden', 'No access');
                    exit;
                }
                ApiResponse::success(properties_rest_group_sharing_payload($tid));
                exit;

            case 'share-add':
                properties_rest_share_add($params);
                exit;

            case 'share-remove':
                properties_rest_share_remove($params);
                exit;

            case 'set-sharing-rights':
                properties_rest_set_sharing_rights($params);
                exit;

            case 'group-share-add':
                properties_rest_group_share_add($params);
                exit;

            case 'group-share-remove':
                properties_rest_group_share_remove($params);
                exit;

            case 'share-search':
                properties_rest_share_search($params);
                exit;

            case 'gift-search':
                properties_rest_gift_search($params);
                exit;

            case 'gift':
                if ($tid === null) {
                    ApiResponse::error(400, 'missing_template_id', 'template_id required');
                    exit;
                }
                if (!has_rights_to_this_template($tid, $_SESSION['toolkits_logon_id']) && !is_user_permitted('projectadmin')) {
                    ApiResponse::error(403, 'forbidden', 'No access');
                    exit;
                }
                ApiResponse::success(properties_rest_gift_payload($tid));
                exit;

            case 'gift-action':
                properties_rest_gift_action($params);
                exit;

            case 'export':
                if ($tid === null) {
                    ApiResponse::error(400, 'missing_template_id', 'template_id required');
                    exit;
                }
                if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
                    ApiResponse::error(403, 'forbidden', 'No access');
                    exit;
                }
                ApiResponse::success(properties_rest_export_payload($tid));
                exit;

            case 'tsugi':
                if ($tid === null) {
                    ApiResponse::error(400, 'missing_template_id', 'template_id required');
                    exit;
                }
                if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
                    ApiResponse::error(403, 'forbidden', 'No access');
                    exit;
                }
                ApiResponse::success(properties_rest_tsugi_payload($tid, ''));
                exit;

            case 'lti-update':
                properties_rest_lti_update($params);
                exit;

            default:
                ApiResponse::error(404, 'unknown_properties_route', 'Unknown properties route: ' . $sub);
                exit;
        }
    } catch (Throwable $e) {
        ApiResponse::error(500, 'properties_error', $e->getMessage());
        exit;
    }
}

function properties_rest_post_default_engine(array $params)
{
    global $xerte_toolkits_site;
    if (!isset($params['template_id']) || !is_numeric($params['template_id'])) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    $template_id = (int) $params['template_id'];
    if (!is_user_creator_or_coauthor($template_id) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $engine = isset($params['engine']) ? $params['engine'] : 'javascript';
    if ($engine !== 'flash' && $engine !== 'javascript') {
        $engine = 'javascript';
    }
    $row = db_query_one('SELECT td.extra_flags  FROM ' . $xerte_toolkits_site->database_table_prefix . 'templatedetails td WHERE td.template_id = ?', array($template_id));
    $extra_flags = explode(';', $row['extra_flags']);
    $data = array();
    foreach ($extra_flags as $flag) {
        if ($flag === '') {
            continue;
        }
        $bits = explode('=', $flag);
        if (count($bits) >= 2) {
            $data[$bits[0]] = $bits[1];
        }
    }
    $data['engine'] = $engine;
    $db_flags = http_build_query($data, '', ';');
    $db_flags = str_replace(' ', '_', $db_flags);
    $ok = db_query('UPDATE ' . $xerte_toolkits_site->database_table_prefix . 'templatedetails SET extra_flags = ? WHERE template_id = ?', array($db_flags, $template_id));
    if (!$ok) {
        ApiResponse::error(500, 'update_failed', 'Could not update engine');
        return;
    }
    $page = isset($params['page']) ? $params['page'] : 'properties';
    if ($page === 'properties') {
        ApiResponse::success(properties_rest_project_payload($template_id, true, 'engine'));
    } else {
        ApiResponse::success(properties_rest_publish_payload($template_id));
    }
}

function properties_rest_post_rename(array $params)
{
    global $xerte_toolkits_site;
    if (!isset($params['template_id']) || !isset($params['template_name'])) {
        ApiResponse::error(400, 'missing_params', 'template_id and template_name required');
        return;
    }
    $template_id = x_clean_input($params['template_id'], 'numeric');
    $template_name = x_clean_input($params['template_name']);
    if (!is_user_creator_or_coauthor($template_id) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query = "update {$prefix}templatedetails SET template_name = ? WHERE template_id = ?";
    $params_u = array(str_replace(' ', '_', $template_name), $template_id);
    $ok = db_query($query, $params_u);
    $change = (bool) $ok;
    ApiResponse::success(array(
        'renamedTo' => $template_name,
        'project' => properties_rest_project_payload($template_id, $change, 'name'),
    ));
}

function properties_rest_notes_route($method, array $params)
{
    $tid = properties_rest_template_id($params);
    if ($tid === null) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    if (!array_key_exists('notes', $params)) {
        if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
            ApiResponse::error(403, 'forbidden', 'No access');
            return;
        }
        ApiResponse::success(properties_rest_notes_payload($tid, false));
        return;
    }
    if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $notes = $params['notes'];
    $prefix = $GLOBALS['xerte_toolkits_site']->database_table_prefix;
    $ok = db_query("update {$prefix}templaterights SET notes = ?  WHERE template_id = ?", array($notes, $tid));
    ApiResponse::success(properties_rest_notes_payload($tid, (bool) $ok));
}

function properties_rest_peer_route($method, array $params)
{
    $tid = properties_rest_template_id($params);
    if ($tid === null) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    if (!array_key_exists('peer_status', $params)) {
        if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
            ApiResponse::error(403, 'forbidden', 'No access');
            return;
        }
        ApiResponse::success(properties_rest_peer_payload($tid, false));
        return;
    }
    if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $peeron = isset($params['peer_status']) ? $params['peer_status'] : 'off';
    if ($peeron === 'off') {
        db_query("DELETE FROM {$prefix}additional_sharing WHERE template_id= ? AND sharing_type = ?", array($tid, 'peer'));
    } else {
        $extra = isset($params['extra']) ? $params['extra'] : '';
        $query_response = db_query("select * from {$prefix}additional_sharing where sharing_type= ? AND template_id = ?", array('peer', $tid));
        if (is_array($query_response) && sizeof($query_response) === 1) {
            db_query("UPDATE {$prefix}additional_sharing set sharing_type='peer', extra= ? WHERE template_id = ?", array($extra, $tid));
        } else {
            db_query("INSERT INTO {$prefix}additional_sharing (template_id, sharing_type, extra) VALUES (?,?,?)", array($tid, 'peer', $extra));
        }
    }
    ApiResponse::success(properties_rest_peer_payload($tid, true));
}

function properties_rest_syndication_route($method, array $params)
{
    $tid = properties_rest_template_id($params);
    if ($tid === null) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    if (!array_key_exists('synd', $params)) {
        if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
            ApiResponse::error(403, 'forbidden', 'No access');
            return;
        }
        if (template_access_settings($tid) === 'Public') {
            ApiResponse::success(properties_rest_syndication_payload($tid, false));
        } else {
            global $xerte_toolkits_site;
            ApiResponse::success(array(
                'panel' => 'syndication',
                'templateId' => $tid,
                'isPublic' => false,
                'notPublic' => true,
                'rssSyndicateUrl' => $xerte_toolkits_site->site_url . url_return('RSS_syndicate', null),
            ));
        }
        return;
    }
    if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $synd = properties_rest_truthy(isset($params['synd']) ? $params['synd'] : false) ? 'true' : 'false';
    $keywords = isset($params['keywords']) ? x_clean_input($params['keywords']) : '';
    $description = isset($params['description']) ? x_clean_input($params['description']) : '';
    $category_value = isset($params['category_value']) ? x_clean_input($params['category_value']) : '';
    $license_value = isset($params['license_value']) ? x_clean_input($params['license_value']) : '';

    $query_for_syndication_response = db_query("select syndication from {$prefix}templatesyndication where template_id=?", array($tid));
    if (sizeof($query_for_syndication_response) === 0) {
        db_query("INSERT into {$prefix}templatesyndication(template_id,syndication,keywords,description,category,license) VALUES (?,?,?,?,?,?)", array($tid, $synd, $keywords, $description, $category_value, $license_value));
    } else {
        db_query("UPDATE {$prefix}templatesyndication SET syndication = ?, keywords = ?, description = ?, category = ?, license = ? WHERE template_id=?", array($synd, $keywords, $description, $category_value, $license_value, $tid));
    }
    $sql = "update {$prefix}templatedetails set date_modified=? where template_id=?";
    db_query_one($sql, array(date('Y-m-d H:i:s'), $tid));

    if (template_access_settings($tid) === 'Public') {
        ApiResponse::success(properties_rest_syndication_payload($tid, true));
    } else {
        ApiResponse::success(array(
            'panel' => 'syndication',
            'templateId' => $tid,
            'isPublic' => false,
            'notPublic' => true,
            'rssSyndicateUrl' => $xerte_toolkits_site->site_url . url_return('RSS_syndicate', null),
        ));
    }
}

function properties_rest_rss_route($method, array $params)
{
    $tid = properties_rest_template_id($params);
    if ($tid === null) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    if (!array_key_exists('rss', $params)) {
        if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
            ApiResponse::error(403, 'forbidden', 'No access');
            return;
        }
        if (template_access_settings($tid) === 'Public') {
            ApiResponse::success(properties_rest_rss_payload($tid, false));
        } else {
            ApiResponse::success(array('panel' => 'rss', 'templateId' => $tid, 'isPublic' => false, 'publicOnly' => true));
        }
        return;
    }
    if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $rss = properties_rest_truthy($params['rss']) ? 'true' : 'false';
    $export = properties_rest_truthy($params['export']) ? 'true' : 'false';
    $desc = isset($params['desc']) ? x_clean_input($params['desc']) : '';

    $rows = db_query("select rss from {$prefix}templatesyndication where template_id=?", array($tid));
    if (sizeof($rows) === 0) {
        db_query("Insert into {$prefix}templatesyndication (template_id,rss,export,description) VALUES (?,?,?,?)", array($tid, $rss, $export, $desc));
    } else {
        db_query("update {$prefix}templatesyndication set rss=?, export=?, description=? WHERE template_id = ?", array($rss, $export, $desc, $tid));
    }
    db_query_one("update {$prefix}templatedetails set date_modified=? where template_id=?", array(date('Y-m-d H:i:s'), $tid));

    if (template_access_settings($tid) === 'Public') {
        ApiResponse::success(properties_rest_rss_payload($tid, true));
    } else {
        ApiResponse::success(array('panel' => 'rss', 'templateId' => $tid, 'isPublic' => false, 'publicOnly' => true));
    }
}

function properties_rest_xml_route($method, array $params)
{
    $tid = properties_rest_template_id($params);
    if ($tid === null) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    if (!array_key_exists('xml_status', $params)) {
        if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
            ApiResponse::error(403, 'forbidden', 'No access');
            return;
        }
        ApiResponse::success(properties_rest_xml_payload($tid, false));
        return;
    }
    if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $xml_status = isset($params['xml_status']) ? $params['xml_status'] : 'off';
    if ($xml_status === 'off') {
        db_query("delete from {$prefix}additional_sharing where template_id= ? AND sharing_type = ?", array($tid, 'xml'));
    } else {
        $address = isset($params['address']) ? $params['address'] : 'null';
        $query_response = db_query("select * from {$prefix}additional_sharing where sharing_type= ? AND template_id = ?", array('xml', $tid));
        if (sizeof($query_response) === 0) {
            $extra = ($address === 'null') ? '' : x_clean_input($address);
            db_query("INSERT INTO {$prefix}additional_sharing (template_id, sharing_type, extra) VALUES (?,?,?)", array($tid, 'xml', $extra));
        } else {
            $extra = x_clean_input($address);
            db_query("UPDATE {$prefix}additional_sharing SET extra = ? where template_id = ?", array($extra, $tid));
        }
    }
    ApiResponse::success(properties_rest_xml_payload($tid, true));
}

function properties_rest_screen_size(array $params)
{
    global $xerte_toolkits_site;
    require_once dirname(__FILE__) . '/../screen_size_library.php';
    $tid = properties_rest_template_id($params);
    if ($tid === null) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $query_for_template_name = "select {$prefix}originaltemplatesdetails.template_name,"
        . "{$prefix}originaltemplatesdetails.template_framework from {$prefix}originaltemplatesdetails, {$prefix}templatedetails WHERE "
        . "{$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND template_id = ?";
    $row_name = db_query_one($query_for_template_name, array($tid));
    if ($row_name === false || $row_name === null) {
        ApiResponse::error(404, 'not_found', 'Template not found');
        return;
    }
    $size = get_template_screen_size($row_name['template_name'], $row_name['template_framework']);
    $parts = explode('~', $size);
    ApiResponse::success(array(
        'width' => isset($parts[0]) ? $parts[0] : '805',
        'height' => isset($parts[1]) ? $parts[1] : '635',
        'templateId' => $tid,
    ));
}

function properties_rest_delete_file(array $params)
{
    global $xerte_toolkits_site;
    require_once dirname(__FILE__) . '/../error_library.php';
    if (!isset($params['file'])) {
        ApiResponse::error(400, 'missing_file', 'file required');
        return;
    }
    $filename = x_clean_input($params['file']);
    $filename = urldecode($filename);
    x_check_path_traversal($filename, $xerte_toolkits_site->users_file_area_full, 'Invalid file specified');
    @unlink($filename);
    ApiResponse::success(array('deleted' => true));
}

function properties_rest_delete_unused_files(array $params)
{
    global $xerte_toolkits_site;
    require_once dirname(__FILE__) . '/../error_library.php';
    if (!isset($params['data'])) {
        ApiResponse::error(400, 'missing_data', 'data required');
        return;
    }
    $data = json_decode(base64_decode(x_clean_input($params['data'])));
    if (!is_array($data)) {
        ApiResponse::error(400, 'invalid_data', 'Invalid data');
        return;
    }
    foreach ($data as $d) {
        $file = urldecode($d);
        if (strpos($file, $xerte_toolkits_site->users_file_area_full) !== 0) {
            continue;
        }
        x_check_path_traversal($file, $xerte_toolkits_site->users_file_area_full, 'Invalid file specified');
        @unlink($file);
    }
    ApiResponse::success(array('deleted' => true));
}

function properties_rest_access_route($method, array $params)
{
    $tid = properties_rest_template_id($params);
    if ($tid === null) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    if (!array_key_exists('access', $params)) {
        if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
            ApiResponse::error(403, 'forbidden', 'No access');
            return;
        }
        ApiResponse::success(properties_rest_access_payload($tid, false));
        return;
    }
    if (!is_user_creator_or_coauthor($tid) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $access = isset($params['access']) ? x_clean_input($params['access']) : 'Private';
    if (isset($params['server_string'])) {
        $access_to_whom = $access . '-' . x_clean_input($params['server_string']);
    } elseif (isset($params['password'])) {
        $access_to_whom = $access . '-' . $params['password'];
    } else {
        $access_to_whom = $access;
    }
    $ok = db_query("UPDATE {$prefix}templatedetails SET access_to_whom = ? WHERE template_id = ?", array($access_to_whom, $tid));
    if ($ok === false) {
        ApiResponse::error(500, 'update_failed', 'Update failed');
        return;
    }
    properties_rest_update_oai_access_from_change($prefix, $xerte_toolkits_site->users_file_area_full, $tid, $access);
    ApiResponse::success(properties_rest_access_payload($tid, true));
}

function properties_rest_share_add(array $params)
{
    global $xerte_toolkits_site;
    _load_language_file('/website_code/php/properties/share_this_template.inc');
    $prefix = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['template_id']) || !isset($params['id'])) {
        ApiResponse::error(400, 'missing_params', 'template_id and id required');
        return;
    }
    $tutorial_id = (int) $params['template_id'];
    $id = $params['id'];
    $group = isset($params['group']) && properties_rest_truthy($params['group']);
    if (!is_user_creator_or_coauthor($tutorial_id) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $new_role = isset($params['role']) ? $params['role'] : 'editor';
    if (!$group) {
        $row_query_root = db_query_one("select folder_id from {$prefix}folderdetails where login_id = ? and folder_parent=? and folder_name!=?", array($id, '0', 'recyclebin'));
        db_query("INSERT INTO {$prefix}templaterights (template_id, user_id, role, folder) VALUES (?,?,?,?)", array($tutorial_id, $id, $new_role, $row_query_root['folder_id']));
        $row = db_query_one("select firstname, surname from {$prefix}logindetails WHERE login_id=?", array($id));
        ApiResponse::success(array(
            'panel' => 'shareFeedback',
            'message' => SHARING_THIS_FEEDBACK_SUCCESS . ' ' . $row['firstname'] . ' ' . $row['surname'],
        ));
    } else {
        db_query("INSERT INTO {$prefix}template_group_rights (template_id, group_id, role) VALUES (?,?,?)", array($tutorial_id, $id, $new_role));
        $row = db_query_one("select group_name from {$prefix}user_groups WHERE group_id=?", array($id));
        ApiResponse::success(array(
            'panel' => 'shareFeedback',
            'message' => SHARING_THIS_FEEDBACK_SUCCESS . ' ' . $row['group_name'],
        ));
    }
}

function properties_rest_share_remove(array $params)
{
    global $xerte_toolkits_site;
    if (!isset($params['template_id']) || !isset($params['id'])) {
        ApiResponse::error(400, 'missing_params', 'template_id and id required');
        return;
    }
    $template_id = (int) $params['template_id'];
    $id = $params['id'];
    $group = isset($params['group']) && properties_rest_truthy($params['group']);
    if (!is_user_creator_or_coauthor($template_id) && !is_user_permitted('projectadmin') && !(isset($params['user_deleting_self']) && properties_rest_truthy($params['user_deleting_self']))) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;
    if (!$group) {
        db_query("delete from {$prefix}templaterights where template_id = ? AND user_id = ?", array($template_id, $id));
    } else {
        db_query("delete from {$prefix}template_group_rights where template_id=? and group_id = ?", array($template_id, $id));
    }
    ApiResponse::success(array('removed' => true));
}

function properties_rest_set_sharing_rights(array $params)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['template_id']) || !isset($params['id']) || !isset($params['role'])) {
        ApiResponse::error(400, 'missing_params', 'template_id, id, role required');
        return;
    }
    $template_id = (int) $params['template_id'];
    $id = $params['id'];
    $new_role = $params['role'];
    $group = isset($params['group']) && properties_rest_truthy($params['group']);
    if (!is_user_creator_or_coauthor($template_id) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    if (!$group) {
        db_query("update {$prefix}templaterights set role = ? WHERE template_id = ? and user_id= ?", array($new_role, $template_id, $id));
    } else {
        db_query("update {$prefix}template_group_rights set role = ? WHERE template_id = ? and group_id = ?", array($new_role, $template_id, $id));
    }
    ApiResponse::success(array('updated' => true));
}

function properties_rest_group_share_add(array $params)
{
    global $xerte_toolkits_site;
    if (!isset($params['template_id']) || !isset($params['group_id'])) {
        ApiResponse::error(400, 'missing_params', 'template_id and group_id required');
        return;
    }
    $template_id = (int) $params['template_id'];
    $group_id = $params['group_id'];
    if (!is_user_creator_or_coauthor($template_id)) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;
    db_query("INSERT INTO {$prefix}template_group_rights (template_id, group_id, role) VALUES (?,?,?)", array($template_id, $group_id, 'editor'));
    ApiResponse::success(array('shared' => true));
}

function properties_rest_group_share_remove(array $params)
{
    properties_rest_share_remove($params);
}

function properties_rest_share_search(array $params)
{
    global $xerte_toolkits_site;
    _load_language_file('/website_code/php/properties/name_select_template.inc');
    $prefix = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['template_id']) || !isset($params['search_string'])) {
        ApiResponse::error(400, 'missing_params', 'template_id and search_string required');
        return;
    }
    $tutorial_id = (int) $params['template_id'];
    $search = $params['search_string'];
    if (!is_user_creator_or_coauthor($tutorial_id) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $groups = db_query("SELECT group_id, group_name from {$prefix}user_groups WHERE group_name like ? AND group_id NOT IN ( SELECT group_id from {$prefix}template_group_rights where template_id = ? ) ORDER BY group_name ASC", array('%' . $search . '%', $tutorial_id));
    $names = db_query("select login_id, firstname, surname, username from {$prefix}logindetails WHERE "
        . '((firstname like ?) or (surname like ?) or (username like ?)) AND disabled=0 AND login_id NOT IN ( SELECT user_id from {$prefix}templaterights where template_id = ? ) ORDER BY firstname ASC', array("$search%", "$search%", "$search%", $tutorial_id));

    $out_groups = array();
    foreach ($groups as $row) {
        $out_groups[] = array('groupId' => $row['group_id'], 'name' => $row['group_name']);
    }
    $out_users = array();
    foreach ($names as $row) {
        $out_users[] = array(
            'loginId' => $row['login_id'],
            'firstname' => $row['firstname'],
            'surname' => $row['surname'],
            'username' => $row['username'],
        );
    }
    ApiResponse::success(array('groups' => $out_groups, 'users' => $out_users, 'empty' => (sizeof($out_groups) === 0 && sizeof($out_users) === 0)));
}

function properties_rest_gift_search(array $params)
{
    global $xerte_toolkits_site;
    _load_language_file('/website_code/php/properties/name_select_gift_template.inc');
    $prefix = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['template_id']) || !isset($params['search_string'])) {
        ApiResponse::error(400, 'missing_params', 'template_id and search_string required');
        return;
    }
    $tutorial_id = (int) $params['template_id'];
    $search = $params['search_string'];
    if (!is_user_creator_or_coauthor($tutorial_id) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $rows = db_query(
        "SELECT login_id, firstname, surname, username from {$prefix}logindetails WHERE "
        . '((firstname like ? ) or (surname like ?) or (username like ?) ) '
        . 'AND disabled=0 AND login_id not in( SELECT creator_id from {$prefix}templatedetails where template_id= ? ) ORDER BY firstname ASC',
        array("$search%", "$search%", "$search%", $tutorial_id)
    );
    $users = array();
    foreach ($rows as $row) {
        $users[] = array(
            'loginId' => $row['login_id'],
            'firstname' => $row['firstname'],
            'surname' => $row['surname'],
            'username' => $row['username'],
        );
    }
    ApiResponse::success(array('users' => $users));
}

function properties_rest_gift_action(array $params)
{
    global $xerte_toolkits_site;
    require_once $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . 'xerte/duplicate_template.php';
    require_once $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . 'site/duplicate_template.php';
    require_once $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . 'decision/duplicate_template.php';
    _load_language_file('/website_code/php/properties/gift_this_template.inc');

    if (!isset($params['tutorial_id']) || !isset($params['user_id']) || !isset($params['action'])) {
        ApiResponse::error(400, 'missing_params', 'tutorial_id, user_id, action required');
        return;
    }
    $tutorial_id = x_clean_input($params['tutorial_id'], 'numeric');
    $user_id = x_clean_input($params['user_id'], 'numeric');
    $action = x_clean_input($params['action']);
    if (!is_user_creator_or_coauthor($tutorial_id) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;

    if ($action === 'give') {
        $row_rename = db_query_one("select * from {$prefix}logindetails, {$prefix}templatedetails, {$prefix}originaltemplatesdetails "
            . "where {$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id and"
            . ' template_id = ? and '
            . ' login_id = creator_id', array($tutorial_id));
        db_query("update {$prefix}templatedetails set creator_id = ? WHERE template_id = ?", array($user_id, $tutorial_id));
        $root_folder = get_user_root_folder_id_by_id($user_id);
        db_query("update {$prefix}templaterights set user_id =  ?, folder = ? WHERE template_id = ?", array($user_id, $root_folder, $tutorial_id));
        $row_new_login = db_query_one("select username from {$prefix}logindetails where login_id= ?", array($user_id));
        $base_path = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short;
        @rename($base_path . $tutorial_id . '-' . $row_rename['username'] . '-' . $row_rename['template_name'] . '/', $base_path . $tutorial_id . '-' . $row_new_login['username'] . '-' . $row_rename['template_name'] . '/');
        ApiResponse::success(array('action' => 'give', 'message' => GIFT_RESPONSE_FAIL));
        return;
    }

    $row_currentdetails = db_query_one(
        "select *, td.template_name AS actual_name, ld.firstname, ld.surname FROM "
        . "{$prefix}templatedetails td, {$prefix}originaltemplatesdetails otd, {$prefix}logindetails ld where "
        . 'td.template_id= ? AND otd.template_type_id = td.template_type_id and td.creator_id = ld.login_id',
        array($tutorial_id)
    );
    $new_name = $row_currentdetails['actual_name'] . '_' . $tutorial_id . '_' . $row_currentdetails['firstname'] . '_' . $row_currentdetails['surname'];
    $creation_query = "INSERT INTO {$prefix}templatedetails "
        . '(creator_id, template_type_id,template_name,date_created,date_modified,date_accessed,number_of_uses,access_to_whom,extra_flags) '
        . ' VALUES (?,?,?,?,?,?,?,?,?)';
    $params_ins = array($user_id, $row_currentdetails['template_type_id'], $new_name, date('Y-m-d'), date('Y-m-d'), date('Y-m-d'), 0, 'Private', $row_currentdetails['extra_flags']);
    $new_template_id = db_query($creation_query, $params_ins);
    if ($new_template_id === false) {
        ApiResponse::error(500, 'insert_failed', 'Could not create template copy');
        return;
    }
    $root_folder = get_user_root_folder_id_by_id($user_id);
    db_query("INSERT INTO {$prefix}templaterights (template_id, user_id, role,folder,notes) VALUES (?,?,?,?,?)", array($new_template_id, $user_id, 'creator', $root_folder, ''));
    $row_new_login = db_query_one("select firstname, surname, username from {$prefix}logindetails where login_id= ?", array($user_id));

    switch ($row_currentdetails['template_framework']) {
        case 'xerte':
            duplicate_template_xerte($new_template_id, $tutorial_id, $row_currentdetails['template_name']);
            break;
        case 'site':
            duplicate_template_site($new_template_id, $tutorial_id, $row_currentdetails['template_name']);
            break;
        case 'decision':
            duplicate_template_decision($new_template_id, $tutorial_id, $row_currentdetails['template_name']);
            break;
        default:
            break;
    }

    ApiResponse::success(array(
        'action' => 'copy',
        'message' => GIFT_RESPONSE_SUCCESS . ' ' . $row_new_login['firstname'] . ' ' . $row_new_login['surname'] . '  (' . $row_new_login['username'] . ')',
    ));
}

function properties_rest_lti_update(array $params)
{
    _load_language_file('/website_code/php/properties/properties_library.inc');
    if (!isset($params['template_id'])) {
        ApiResponse::error(400, 'missing_template_id', 'template_id required');
        return;
    }
    $template_id = x_clean_input($params['template_id'], 'numeric');
    if (!is_user_creator_or_coauthor($template_id) && !is_user_permitted('projectadmin')) {
        ApiResponse::error(403, 'forbidden', 'No access');
        return;
    }
    foreach ($params as $k => $v) {
        $_POST[$k] = $v;
        $_REQUEST[$k] = $v;
    }
    ob_start();
    include dirname(__FILE__) . '/../properties/lti_update.php';
    ob_end_clean();
    ApiResponse::success(properties_rest_tsugi_payload((int) $template_id, PROPERTIES_LIBRARY_TSUGI_UPDATED));
}

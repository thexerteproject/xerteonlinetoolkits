<?php
/**
 * JSON builders and handlers for Properties REST routes (no HTML output).
 *
 * @package Xerte
 */

require_once dirname(__FILE__) . '/../properties/properties_library.php';

function properties_rest_load_language_sets()
{
    _load_language_file('/website_code/php/properties/publish.inc');
    _load_language_file('/website_code/php/properties/properties_library.inc');
    _load_language_file('/website_code/php/properties/sharing_status_template.inc');
    _load_language_file('/website_code/php/properties/export_template.inc');
    _load_language_file('/website_code/php/properties/media_and_quota_template.inc');
    _load_language_file('/website_code/php/properties/gift_template.inc');
    _load_language_file('/website_code/php/properties/gift_this_template.inc');
    _load_language_file('/website_code/php/properties/name_select_template.inc');
    _load_language_file('/website_code/php/properties/name_select_gift_template.inc');
}

function properties_rest_template_id(array $params)
{
    if (isset($params['template_id']) && is_numeric($params['template_id'])) {
        return (int) $params['template_id'];
    }
    if (isset($params['tutorial_id']) && is_numeric($params['tutorial_id'])) {
        return (int) $params['tutorial_id'];
    }
    return null;
}

function properties_rest_truthy($v)
{
    return $v === true || $v === 'true' || $v === '1' || $v === 1;
}

function properties_rest_update_oai_access_from_change($prefix, $path_root, $template_id, $access)
{
    require_once dirname(__FILE__) . '/../XerteProjectDecoder.php';
    $q_get_oai = "select * from {$prefix}oai_publish where template_id=? ORDER BY audith_id DESC LIMIT 1";
    $oai = db_query_one($q_get_oai, array($template_id));
    if ($oai !== null && isset($oai['status']) && $oai['status'] === 'published' && $access !== 'Public') {
        $q_delete_oai = "insert into {$prefix}oai_publish set template_id=?, login_id=?, user_type='creator', status='deleted'";
        db_query_one($q_delete_oai, array($template_id, $_SESSION['toolkits_logon_id']));
    } elseif ($access === 'Public' && ($oai === null || ($oai !== null && ($oai['status'] === 'deleted' || $oai['status'] === 'incomplete')))) {
        $q = "select
          otd.template_name as template_type,
          ld.username as owner_username
          from {$prefix}templatedetails as td,
          {$prefix}originaltemplatesdetails otd,
          {$prefix}logindetails ld
          where td.template_type_id=otd.template_type_id and td.creator_id=ld.login_id and td.template_id=?";
        $template = db_query_one($q, array($template_id));
        if ($template === false || $template === null) {
            return;
        }
        $template_dir = $path_root . $template_id . '-' . $template['owner_username'] . '-' . $template['template_type'] . '/';
        $dataFilename = $template_dir . 'data.xml';
        $decoder = new XerteProjectDecoder($dataFilename);
        $info = $decoder->detailedTemplateDecode($template_id);
        $q_add_oai = "insert into {$prefix}oai_publish set template_id=?, login_id=?, user_type='creator', status='published'";
        $params_ins = array($template_id, $_SESSION['toolkits_logon_id']);
        if ($info !== null && $info->oaiPmhAgree === 'true' && $info->education !== 'unknown' && $info->category !== 'unknown') {
            if ($oai === null) {
                db_query_one($q_add_oai, $params_ins);
            } elseif ($oai !== null) {
                db_query_one($q_add_oai, $params_ins);
            }
        }
    }
}

function properties_rest_project_payload($template_id, $change, $msgtype)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query_for_names = "select {$prefix}templatedetails.template_name, template_framework, date_created, date_modified, extra_flags from "
        . "{$prefix}templatedetails, {$prefix}originaltemplatesdetails where template_id= ? and {$prefix}originaltemplatesdetails.template_type_id =  {$prefix}templatedetails.template_type_id ";
    $row = db_query_one($query_for_names, array($template_id));
    if ($row === false || $row === null) {
        return array('error' => 'not_found');
    }

    $row_template_name = db_query_one("select template_name from {$prefix}templatedetails where template_id= ?", array($template_id));

    $can_rename = is_user_creator_or_coauthor($template_id) || is_user_permitted('projectadmin');
    $display_name = str_replace('_', ' ', $row_template_name['template_name']);

    include $xerte_toolkits_site->root_file_path . 'modules/' . $row['template_framework'] . '/module_functions.php';

    $access = template_access_settings($template_id);
    $play_url = ($access !== 'Private') ? ($xerte_toolkits_site->site_url . url_return('play', $template_id)) : null;

    $embed_width = '100%';
    $embed_height = '100%';
    $iframe_snippet = null;
    if ($access !== 'Private') {
        $query_for_template_name = "select {$prefix}originaltemplatesdetails.template_name, "
            . "{$prefix}originaltemplatesdetails.template_framework from "
            . "{$prefix}originaltemplatesdetails, {$prefix}templatedetails where"
            . " {$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND template_id = ?";
        $row_name = db_query_one($query_for_template_name, array($template_id));

        $key = $row_name['template_framework'] . '_' . $row_name['template_name'];
        if (isset($xerte_toolkits_site->learning_objects->{$key}->preview_size) && $xerte_toolkits_site->learning_objects->{$key}->preview_size !== '*') {
            $temp_string = $xerte_toolkits_site->learning_objects->{$key}->preview_size;
        } else {
            $temp_string = '100%,100%';
        }
        $temp_array = explode(',', $temp_string);
        $embed_width = $temp_array[0];
        $embed_height = isset($temp_array[1]) ? $temp_array[1] : '100%';
        $iframe_snippet = '<iframe src="' . $xerte_toolkits_site->site_url . url_return('play', $template_id) . '" width="' . $embed_width . '" height="' . $embed_height . '" frameborder="0" style="position:relative; top:0px; left:0px; z-index:0;"></iframe>';
    }

    $template_type_lower = strtolower(get_template_type($template_id));
    $default_engine = get_default_engine($template_id);
    $engine_choice = array(
        'defaultEngine' => $default_engine,
        'showFlashOption' => ($template_type_lower !== 'xerte_rss'),
        'selectedEngine' => $default_engine,
    );

    return array(
        'panel' => 'project',
        'templateId' => $template_id,
        'displayName' => $display_name,
        'canRename' => $can_rename,
        'dateCreated' => $row['date_created'],
        'dateModified' => $row['date_modified'],
        'access' => $access,
        'playUrl' => $play_url,
        'embed' => array(
            'width' => $embed_width,
            'height' => $embed_height,
            'iframeSnippet' => $iframe_snippet,
        ),
        'engine' => $engine_choice,
        'showEngineFieldset' => ($can_rename && function_exists('display_property_engines')),
        'flashWarning' => PROPERTIES_LIBRARY_FLASH_WARNING,
        'change' => $change,
        'msgtype' => $msgtype,
    );
}

function properties_rest_publish_payload($template_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query_for_names = "select td.template_name, td.date_created, td.date_modified, otd.template_framework from {$prefix}templatedetails td, "
        . "{$prefix}originaltemplatesdetails otd where td.template_id= ? and td.template_type_id = otd.template_type_id";
    $row = db_query_one($query_for_names, array($template_id));
    if ($row === false || $row === null) {
        return array('error' => 'not_found');
    }

    include $xerte_toolkits_site->root_file_path . 'modules/' . $row['template_framework'] . '/module_functions.php';

    $template_access = template_access_settings($template_id);
    $row_template_name = db_query_one("select template_name from {$prefix}templatedetails where template_id= ?", array($template_id));
    $display_name = str_replace('_', ' ', $row_template_name['template_name']);

    $engine_label = (get_default_engine($template_id) == 'flash') ? PROPERTIES_LIBRARY_DEFAULT_FLASH : PROPERTIES_LIBRARY_DEFAULT_HTML5;

    return array(
        'panel' => 'publish',
        'templateId' => $template_id,
        'name' => $display_name,
        'engineLabel' => $engine_label,
        'access' => $template_access,
        'playUrl' => ($template_access !== 'Private') ? ($xerte_toolkits_site->site_url . url_return('play', $template_id)) : null,
        'rssIncluded' => is_template_rss($template_id),
        'syndicated' => is_template_syndicated($template_id),
        'canPublishButton' => ($template_access !== ''),
    );
}

function properties_rest_syndication_payload($template_id, $change)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query_for_syndication = "select syndication,description,keywords,category,license from {$prefix}templatesyndication where template_id=?";
    $row_syndication = db_query_one($query_for_syndication, array($template_id));

    $categories = db_query("select category_name from {$prefix}syndicationcategories");
    $licenses = db_query("select license_name from {$prefix}syndicationlicenses");

    $cat_list = array();
    foreach ($categories as $c) {
        $cat_list[] = $c['category_name'];
    }
    $lic_list = array();
    foreach ($licenses as $l) {
        $lic_list[] = $l['license_name'];
    }

    return array(
        'panel' => 'syndication',
        'templateId' => $template_id,
        'isPublic' => template_access_settings($template_id) === 'Public',
        'syndicationEnabled' => ($row_syndication !== false && $row_syndication !== null && isset($row_syndication['syndication']) && $row_syndication['syndication'] === 'true'),
        'description' => ($row_syndication !== false && $row_syndication !== null) ? $row_syndication['description'] : '',
        'keywords' => ($row_syndication !== false && $row_syndication !== null) ? $row_syndication['keywords'] : '',
        'category' => ($row_syndication !== false && $row_syndication !== null) ? $row_syndication['category'] : '',
        'license' => ($row_syndication !== false && $row_syndication !== null) ? $row_syndication['license'] : '',
        'categories' => $cat_list,
        'licenses' => $lic_list,
        'rssSyndicateUrl' => $xerte_toolkits_site->site_url . url_return('RSS_syndicate', null),
        'change' => $change,
    );
}

function properties_rest_peer_payload($template_id, $change)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query = "select * from {$prefix}additional_sharing where sharing_type=? AND template_id = ?";
    $row = db_query_one($query, array('peer', $template_id));

    $passwd = '';
    $retouremail = $_SESSION['toolkits_logon_username'];
    if (strlen($xerte_toolkits_site->email_to_add_to_username) > 0) {
        $retouremail .= '@' . $xerte_toolkits_site->email_to_add_to_username;
    }

    if (!empty($row)) {
        $extra = explode(',', $row['extra'], 2);
        $passwd = isset($extra[0]) ? $extra[0] : '';
        if (isset($extra[1])) {
            $retouremail = $extra[1];
        }
    }

    $peer_url = $xerte_toolkits_site->site_url . url_return('peerreview', $template_id);

    return array(
        'panel' => 'peer',
        'templateId' => $template_id,
        'peerEnabled' => !empty($row),
        'peerLink' => !empty($row) ? $peer_url : null,
        'password' => $passwd,
        'returnEmail' => $retouremail,
        'change' => $change,
    );
}

function properties_rest_xml_payload($template_id, $change)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query = "select * from {$prefix}additional_sharing where sharing_type= ? AND template_id = ?";
    $row = db_query_one($query, array('xml', $template_id));

    return array(
        'panel' => 'xml',
        'templateId' => $template_id,
        'xmlEnabled' => !empty($row),
        'siteRestriction' => (!empty($row) && isset($row['extra'])) ? $row['extra'] : '',
        'change' => $change,
    );
}

function properties_rest_rss_payload($template_id, $change)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $query_for_name = "select firstname,surname from {$prefix}logindetails where login_id= ?";
    $row_name = db_query_one($query_for_name, array($_SESSION['toolkits_logon_id']));

    $query_for_rss = "select rss,export,description from {$prefix}templatesyndication where template_id=?";
    $row_rss = db_query_one($query_for_rss, array($template_id));

    return array(
        'panel' => 'rss',
        'templateId' => $template_id,
        'rssEnabled' => ($row_rss !== false && $row_rss !== null && $row_rss['rss'] === 'true'),
        'exportEnabled' => ($row_rss !== false && $row_rss !== null && $row_rss['export'] === 'true'),
        'description' => ($row_rss !== false && $row_rss !== null) ? $row_rss['description'] : '',
        'isPublic' => template_access_settings($template_id) === 'Public',
        'rssGlobalUrl' => $xerte_toolkits_site->site_url . url_return('RSS', null),
        'rssUserUrl' => $xerte_toolkits_site->site_url . url_return('RSS_user', ($row_name['firstname'] . '_' . $row_name['surname'])),
        'change' => $change,
    );
}

function properties_rest_notes_payload($template_id, $change)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $row_notes = db_query_one("select notes from {$prefix}templaterights where template_id = ?", array($template_id));

    return array(
        'panel' => 'notes',
        'templateId' => $template_id,
        'notes' => isset($row_notes['notes']) ? $row_notes['notes'] : '',
        'language' => isset($_SESSION['toolkits_language']) ? $_SESSION['toolkits_language'] : 'en',
        'change' => $change,
    );
}

function properties_rest_access_option_enabled($row_access, $string)
{
    if ($row_access === false || $row_access === null || !isset($row_access['access_to_whom'])) {
        return false;
    }
    if ($row_access['access_to_whom'] === $string) {
        return true;
    }
    return strcmp(substr($row_access['access_to_whom'], 0, strlen($string)), $string) === 0;
}

function properties_rest_access_payload($template_id, $change)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $row_access = db_query_one("select access_to_whom from {$prefix}templatedetails where template_id= ?", array($template_id));

    $current = template_access_settings($template_id);
    $pwd_val = '';
    if (substr($current, 0, 12) === 'PasswordPlay' && $row_access !== false && $row_access !== null) {
        $pos = strpos($row_access['access_to_whom'], '-');
        if ($pos !== false) {
            $pwd_val = substr($row_access['access_to_whom'], $pos + 1);
        }
    }
    $other_val = '';
    if (substr($current, 0, 5) === 'Other' && $row_access !== false && $row_access !== null) {
        $pos = strpos($row_access['access_to_whom'], '-');
        if ($pos !== false) {
            $other_val = substr($row_access['access_to_whom'], $pos + 1);
        }
    }

    $rows = db_query("select * from {$prefix}play_security_details");
    $security_options = array();
    foreach ($rows as $row_security) {
        $security_options[] = array(
            'value' => $row_security['security_setting'],
            'label' => $row_security['security_setting'],
            'info' => $row_security['security_info'],
            'enabled' => properties_rest_access_option_enabled($row_access, $row_security['security_setting']),
        );
    }

    return array(
        'panel' => 'access',
        'templateId' => $template_id,
        'selected' => $current,
        'passwordPlayValue' => $pwd_val,
        'otherSiteValue' => $other_val,
        'securityOptions' => $security_options,
        'change' => $change,
    );
}

function properties_rest_media_quota_payload($template_id)
{
    global $xerte_toolkits_site;
    require_once dirname(__FILE__) . '/../xmlInspector.php';

    _load_language_file('/website_code/php/properties/media_and_quota_template.inc');

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $sql = "select {$prefix}originaltemplatesdetails.template_name, {$prefix}templaterights.folder, {$prefix}logindetails.username FROM "
        . "{$prefix}originaltemplatesdetails, {$prefix}templatedetails, {$prefix}templaterights, {$prefix}logindetails WHERE "
        . "{$prefix}originaltemplatesdetails.template_type_id = {$prefix}templatedetails.template_type_id AND "
        . "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id AND "
        . "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id AND "
        . "{$prefix}templatedetails.template_id = ? AND (role = ? OR role = ?)";

    $row_path = db_query_one($sql, array($template_id, 'creator', 'co-author'));
    if ($row_path === false || $row_path === null) {
        return array('panel' => 'media', 'error' => 'no_access');
    }

    $end_of_path = $template_id . '-' . $row_path['username'] . '-' . $row_path['template_name'];
    $dir_path = $xerte_toolkits_site->users_file_area_full . $end_of_path . '/media/';
    x_check_path_traversal($dir_path, $xerte_toolkits_site->users_file_area_full, 'Invalid file specified');

    $xmlpath = $xerte_toolkits_site->users_file_area_full . $end_of_path . '/data.xml';
    $previewpath = $xerte_toolkits_site->users_file_area_full . $end_of_path . '/preview.xml';

    $dataInspector = new XerteXMLInspector();
    $dataInspector->loadTemplateXML($xmlpath);

    $previewInspector = new XerteXMLInspector();
    $previewInspector->loadTemplateXML($previewpath);

    $quota = 0;
    if (file_exists($previewpath)) {
        $quota = filesize($xmlpath) + filesize($previewpath);
    }

    $result_string = array();
    $delete_string = array();

    $media_loop = function ($folder_name) use (&$media_loop, &$result_string, &$delete_string, &$quota, $dir_path, $end_of_path, $xerte_toolkits_site, $dataInspector, $previewInspector) {
        $d = @opendir($dir_path . $folder_name);
        if (!$d) {
            return;
        }
        while ($f = readdir($d)) {
            $full = $dir_path . $folder_name . $f;
            if (!is_dir($full)) {
                $path = $xerte_toolkits_site->site_url . $xerte_toolkits_site->users_file_area_short . $end_of_path . '/media/' . $folder_name . $f;
                $rel = $end_of_path . '/media/' . $folder_name . $f;
                $used = $dataInspector->fileIsUsed($folder_name . $f) || $previewInspector->fileIsUsed($folder_name . $f);
                $size_mb = substr((filesize($full) / 1000000), 0, 4);
                if (!$used) {
                    $delete_string[] = $folder_name . $f;
                }
                $quota += filesize($full);
                $result_string[] = array(
                    'filename' => $folder_name . $f,
                    'sizeMb' => $size_mb,
                    'inUse' => $used,
                    'downloadPath' => $path,
                    'getfileRelative' => $rel,
                    'fullPath' => $full,
                );
            } elseif (strlen($f) > 0 && $f[0] != '.') {
                $media_loop($folder_name . $f . '/');
            }
        }
        closedir($d);
    };

    $media_loop('');

    usort($result_string, function ($a, $b) {
        return strcmp($a['filename'], $b['filename']);
    });

    return array(
        'panel' => 'media',
        'templateId' => $template_id,
        'quotaMb' => substr(($quota / 1000000), 0, 4),
        'mediaPath' => $dir_path,
        'files' => $result_string,
        'unusedFiles' => $delete_string,
        'unusedFilesToken' => base64_encode(json_encode($delete_string)),
    );
}

function properties_rest_sharing_status_payload($template_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $sql = "SELECT template_id, user_id, firstname, surname, username, role FROM "
        . " {$prefix}templaterights, {$prefix}logindetails WHERE "
        . " {$prefix}logindetails.login_id = {$prefix}templaterights.user_id and template_id= ? AND user_id != ? ";

    $query_sharing_rows = db_query($sql, array($template_id, $_SESSION['toolkits_logon_id']));

    $sqlg = "SELECT ug.group_id, group_name, role FROM "
        . " {$prefix}template_group_rights tgr, {$prefix}user_groups ug WHERE "
        . 'tgr.group_id = ug.group_id and template_id= ?';

    $query_sharing_rows_group = db_query($sqlg, array($template_id));

    $can_manage = is_user_creator_or_coauthor($template_id) || is_user_permitted('projectadmin');
    $is_creator = is_user_creator($template_id);
    $show_self_remove = !$is_creator && !is_user_permitted('projectadmin');

    $groups = array();
    foreach ($query_sharing_rows_group as $row) {
        $groups[] = array(
            'groupId' => $row['group_id'],
            'name' => $row['group_name'],
            'role' => $row['role'],
        );
    }
    $users = array();
    foreach ($query_sharing_rows as $row) {
        $users[] = array(
            'userId' => $row['user_id'],
            'firstname' => $row['firstname'],
            'surname' => $row['surname'],
            'username' => $row['username'],
            'role' => $row['role'],
        );
    }

    return array(
        'panel' => 'sharing',
        'templateId' => $template_id,
        'canManage' => $can_manage,
        'showSelfRemove' => $show_self_remove,
        'currentUserId' => (int) $_SESSION['toolkits_logon_id'],
        'groups' => $groups,
        'users' => $users,
        'empty' => (sizeof($query_sharing_rows) === 0 && sizeof($query_sharing_rows_group) === 0),
    );
}

function properties_rest_group_sharing_payload($template_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $sql = "SELECT * FROM "
        . " {$prefix}user_groups WHERE group_id NOT IN ( "
        . "SELECT group_id from {$prefix}template_group_rights where template_id = ? ) order by group_name";

    $user_groups = db_query($sql, array($template_id));

    $sql2 = "SELECT ug.group_id, ug.group_name, tgr.role FROM "
        . "{$prefix}user_groups ug, {$prefix}template_group_rights tgr WHERE "
        . 'ug.group_id = tgr.group_id and tgr.template_id= ? ORDER BY ug.group_name';

    $shared = db_query($sql2, array($template_id));

    $available = array();
    foreach ($user_groups as $g) {
        $available[] = array('groupId' => $g['group_id'], 'name' => $g['group_name']);
    }
    $current = array();
    foreach ($shared as $row) {
        $current[] = array(
            'groupId' => $row['group_id'],
            'name' => $row['group_name'],
            'role' => $row['role'],
        );
    }

    return array(
        'panel' => 'groupSharing',
        'templateId' => $template_id,
        'canManage' => is_user_creator_or_coauthor((int) $template_id),
        'availableGroups' => $available,
        'sharedGroups' => $current,
        'empty' => (sizeof($shared) === 0),
    );
}

function properties_rest_gift_payload($template_id)
{
    $ok = is_user_creator_or_coauthor($template_id) || is_user_permitted('projectadmin');
    return array(
        'panel' => 'gift',
        'templateId' => $template_id,
        'canGift' => $ok,
    );
}

function properties_rest_export_payload($template_id)
{
    global $xerte_toolkits_site;
    require_once dirname(__FILE__) . '/../template_library.php';

    _load_language_file('/website_code/php/properties/export_template.inc');

    $query_for_play_content_strip = str_replace("\" . \$xerte_toolkits_site->database_table_prefix . \"", $xerte_toolkits_site->database_table_prefix, $xerte_toolkits_site->play_edit_preview_query);
    $query_for_play_content = str_replace('TEMPLATE_ID_TO_REPLACE', (int) $template_id, $query_for_play_content_strip);
    $row_play = db_query_one($query_for_play_content);

    $export_exists = false;
    if (!empty($row_play)) {
        $export_exists = file_exists($xerte_toolkits_site->root_file_path . 'modules/' . $row_play['template_framework'] . '/export_page.php');
    }

    ob_start();
    if ($export_exists) {
        require_once $xerte_toolkits_site->root_file_path . 'modules/' . $row_play['template_framework'] . '/export_page.php';
    } else {
        echo '<p>' . EXPORT_NOT_AVAILABLE . '</p>';
    }
    $inner = ob_get_clean();

    return array(
        'panel' => 'export',
        'templateId' => $template_id,
        'exportInnerHtml' => $inner,
        'hasExportModule' => $export_exists,
    );
}

function properties_rest_tsugi_build_lti_def($template_id)
{
    global $xerte_toolkits_site;

    $tsugi_installed = false;
    if (file_exists($xerte_toolkits_site->tsugi_dir)) {
        if ($xerte_toolkits_site->authentication_method == 'Moodle') {
            if (!defined('XERTE_MOODLE_AUTHENTICATION')) {
                define('XERTE_MOODLE_AUTHENTICATION', true);
            }
        }
        if (!defined('COOKIE_SESSION')) {
            define('COOKIE_SESSION', true);
        }
        require_once $xerte_toolkits_site->tsugi_dir . 'config.php';
        require_once $xerte_toolkits_site->tsugi_dir . 'admin/admin_util.php';
        $tsugi_installed = true;
        ini_set('display_errors', 0);
        error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);
    }

    require_once dirname(__FILE__) . '/../../../functions.php';

    global $CFG;
    $xp = $xerte_toolkits_site->database_table_prefix;
    $safe_template_id = (int) $template_id;
    $query_for_preview_content = "select otd.template_name, ld.username, otd.template_framework, tr.user_id, tr.folder, tr.template_id, td.template_name as name, td.access_to_whom, td.extra_flags,";
    $query_for_preview_content .= 'td.tsugi_published, td.tsugi_usetsugikey, td.tsugi_manage_key_id, td.tsugi_privatekeyonly, td.tsugi_xapi_enabled, td.tsugi_xapi_useglobal, td.tsugi_xapi_endpoint, td.tsugi_xapi_key, td.tsugi_xapi_secret, td.tsugi_xapi_student_id_mode, td.tsugi_publish_in_store, td.tsugi_publish_dashboard_in_store, td.dashboard_allowed_links';
    $query_for_preview_content .= ' from ' . $xp . 'originaltemplatesdetails otd, ' . $xp . 'templaterights tr, ' . $xp . 'templatedetails td, ' . $xp . 'logindetails ld';
    $query_for_preview_content .= " where td.template_type_id = otd.template_type_id and td.creator_id = ld.login_id and tr.template_id = td.template_id and tr.template_id=? and (role='creator' || role='co-author')";

    $row = db_query_one($query_for_preview_content, array($safe_template_id));
    if ($row === false || $row === null) {
        return null;
    }

    $generatePwd = function ($length) {
        $a = str_split('abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXY0123456789');
        shuffle($a);
        return substr(implode('', $a), 0, $length);
    };

    $lti_def = new stdClass();
    $lti_def->tsugi_installed = $tsugi_installed;
    $lti_def->xapi_enabled = (int) $row['tsugi_xapi_enabled'];
    $lti_def->key = $row['name'] . '_' . $template_id;
    $lti_def->secret = $generatePwd(16);
    $lti_def->published = (int) $row['tsugi_published'];
    $lti_def->tsugi_useglobal = (int) $row['tsugi_usetsugikey'];
    $lti_def->tsugi_privateonly = (int) $row['tsugi_privatekeyonly'];
    $lti_def->tsugi_url = $xerte_toolkits_site->site_url . 'lti_launch.php?template_id=' . $row['template_id'];
    $lti_def->url = $xerte_toolkits_site->site_url . 'lti_launch.php?template_id=' . $row['template_id'];
    $lti_def->url13 = $xerte_toolkits_site->site_url . 'lti13_launch.php?template_id=' . $row['template_id'];
    $lti_def->xapionly_url = $xerte_toolkits_site->site_url . 'xapi_launch.php?template_id=' . $row['template_id'] . '&group=groupname';
    $lti_def->xapi_useglobal = (int) $row['tsugi_xapi_useglobal'];
    $lti_def->xapi_endpoint = '';
    $lti_def->xapi_username = '';
    $lti_def->xapi_password = '';
    $lti_def->dashboard_urls = '';
    $lti_def->xapi_student_id_mode = 0;
    $lti_def->tsugi_publish_in_store = (int) $row['tsugi_publish_in_store'];
    $lti_def->tsugi_publish_dashboard_in_store = 0;

    if ($tsugi_installed) {
        if ($lti_def->published == 1) {
            $PDOX = \Tsugi\Core\LTIX::getConnection();
            $tsugirow = $PDOX->rowDie(
                "	SELECT k.key_key, k.secret
						FROM {$CFG->dbprefix}lti_key k WHERE k.key_id = :key_id",
                array(':key_id' => $row['tsugi_manage_key_id'])
            );
            if ($tsugirow !== false) {
                $lti_def->key = $tsugirow['key_key'];
                $lti_def->secret = $tsugirow['secret'];
            }
        }
    }
    if ($lti_def->xapi_enabled == 1) {
        $lti_def->xapi_endpoint = $row['tsugi_xapi_endpoint'];
        $lti_def->xapi_username = $row['tsugi_xapi_key'];
        $lti_def->xapi_password = $row['tsugi_xapi_secret'];
        $lti_def->xapi_student_id_mode = (int) $row['tsugi_xapi_student_id_mode'];
        $lti_def->tsugi_publish_dashboard_in_store = (int) $row['tsugi_publish_dashboard_in_store'];
        $lti_def->dashboard_urls = $row['dashboard_allowed_links'];
        if ($lti_def->published != 1) {
            $lti_def->xapi_student_id_mode = 3;
        }
    }
    if ($lti_def->xapi_student_id_mode == 3) {
        $lti_def->url .= '&group=groupname';
    }

    return $lti_def;
}

function properties_rest_tsugi_payload($template_id, $message = '')
{
    $lti_def = properties_rest_tsugi_build_lti_def($template_id);
    if ($lti_def === null) {
        return array('panel' => 'lti', 'error' => 'not_found', 'templateId' => (int) $template_id);
    }
    $a = json_decode(json_encode($lti_def), true);
    $a['panel'] = 'lti';
    $a['templateId'] = (int) $template_id;
    $a['message'] = $message;
    $a['xapiStudentModeLabels'] = properties_rest_xapi_mode_labels();
    return $a;
}

function properties_rest_xapi_mode_labels()
{
    global $xerte_toolkits_site;
    _load_language_file('/website_code/php/properties/properties_library.inc');
    $labels = array();
    for ($i = 0; $i < 4; $i++) {
        if (!$xerte_toolkits_site->tsugi_dir || !file_exists($xerte_toolkits_site->tsugi_dir)) {
            if ($i < 3) {
                continue;
            }
        }
        if (function_exists('true_or_false') && true_or_false($xerte_toolkits_site->xapi_force_anonymous_lrs) && ($i === 0 || $i === 2)) {
            continue;
        }
        switch ($i) {
            case 0:
                $labels[] = array('value' => $i, 'label' => PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE_0);
                break;
            case 1:
                $labels[] = array('value' => $i, 'label' => PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE_1);
                break;
            case 2:
                $labels[] = array('value' => $i, 'label' => PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE_2);
                break;
            case 3:
                $labels[] = array('value' => $i, 'label' => PROPERTIES_LIBRARY_TSUGI_XAPI_STUDENT_ID_MODE_3);
                break;
        }
    }
    return $labels;
}

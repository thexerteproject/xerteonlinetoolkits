<?php
/**
 * Admin/Management REST payload builders and mutations (no HTML fragments).
 *
 * NOTE: This service currently covers the management.js endpoints for:
 * feeds, licenses, categories, educationlevels, grouping, course, uploads.
 */

require_once dirname(__FILE__) . "/../../../../config.php";
require_once dirname(__FILE__) . "/../user_library.php";

function management_rest_load_language_sets()
{
    _load_language_file('/website_code/php/management/management_library.inc');
    _load_language_file('/management.inc');
    _load_language_file('/website_code/php/management/upload.inc');
    _load_language_file('/website_code/php/management/upload_theme.inc');
}

function management_rest_require_perm($perm)
{
    if (!is_user_permitted($perm)) {
        ApiResponse::error(403, 'forbidden', 'Management access required');
        exit;
    }
}

function management_rest_tree_from_rows($rows, $idKey, $nameKey)
{
    $tree = array();
    foreach ($rows as $data) {
        if ($data === null || $data === false) {
            continue;
        }
        $id = $data[$idKey];
        $child = array(
            'id' => (int) $id,
            'name' => $data[$nameKey],
            'children' => array(),
        );
        $pid = isset($data['parent_id']) ? $data['parent_id'] : null;
        if ($pid === null) {
            $tree[(string) $id] = $child;
            continue;
        }
        $pid = (string) $pid;
        if (isset($tree[$pid])) {
            $tree[$pid]['children'][(string) $id] = $child;
        } else {
            foreach ($tree as $i => $v) {
                if (isset($v['children'][$pid])) {
                    $tree[$i]['children'][$pid]['children'][(string) $id] = $child;
                }
            }
        }
    }
    return array_values($tree);
}

function management_rest_feeds_panel()
{
    management_rest_load_language_sets();
    management_rest_require_perm('system');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;

    $rows = db_query("select td.template_id, td.template_name, ts.rss, ts.export, ts.syndication, ts.category from {$p}templatedetails td join {$p}templatesyndication ts on td.template_id=ts.template_id where ts.rss='true' or ts.export='true' or ts.syndication='true' order by td.template_id desc");
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', ' ', $r['template_name']),
            'rss' => ($r['rss'] === 'true'),
            'export' => ($r['export'] === 'true'),
            'syndication' => ($r['syndication'] === 'true'),
            'category' => $r['category'],
        );
    }
    return array(
        'panel' => 'feeds',
        'title' => MANAGEMENT_MENUBAR_FEEDS,
        'items' => $items,
    );
}

function management_rest_remove_feed(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('system');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['template_id']) || !is_numeric($params['template_id'])) {
        return array('ok' => false, 'message' => 'template_id required');
    }
    $tid = (int) $params['template_id'];
    $fields = array();
    if (isset($params['rss'])) $fields['rss'] = 'false';
    if (isset($params['export'])) $fields['export'] = 'false';
    if (isset($params['synd'])) $fields['syndication'] = 'false';
    foreach ($fields as $k => $v) {
        db_query("update {$p}templatesyndication set {$k}=? where template_id=?", array($v, $tid));
    }
    return array('ok' => true, 'refetch' => 'feeds');
}

function management_rest_licenses_panel()
{
    management_rest_load_language_sets();
    management_rest_require_perm('system');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $rows = db_query("select license_id, license_name from {$p}syndicationlicenses order by license_name");
    $items = array();
    foreach ($rows as $r) {
        $items[] = array('id' => (int) $r['license_id'], 'name' => $r['license_name']);
    }
    return array('panel' => 'licenses', 'title' => MANAGEMENT_MENUBAR_LICENSES, 'items' => $items);
}

function management_rest_remove_license(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('system');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['remove']) || !is_numeric($params['remove'])) {
        return array('ok' => false, 'message' => 'remove required');
    }
    db_query("delete from {$p}syndicationlicenses where license_id=?", array((int) $params['remove']));
    return array('ok' => true, 'refetch' => 'licenses');
}

function management_rest_new_license(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('system');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $name = isset($params['newlicense']) ? trim((string) $params['newlicense']) : '';
    if ($name === '') {
        return array('ok' => false, 'message' => 'newlicense required');
    }
    db_query("insert into {$p}syndicationlicenses (license_name) values (?)", array($name));
    return array('ok' => true, 'refetch' => 'licenses');
}

function management_rest_categories_panel()
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $rows = db_query("select category_id, category_name, parent_id from {$p}syndicationcategories");
    $tree = management_rest_tree_from_rows($rows, 'category_id', 'category_name');
    return array('panel' => 'categories', 'title' => MANAGEMENT_MENUBAR_CATEGORIES, 'tree' => $tree);
}

function management_rest_remove_category(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['remove']) || !is_numeric($params['remove'])) {
        return array('ok' => false, 'message' => 'remove required');
    }
    db_query("delete from {$p}syndicationcategories where category_id=?", array((int) $params['remove']));
    return array('ok' => true, 'refetch' => 'categories');
}

function management_rest_new_category(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $name = isset($params['newcategory']) ? trim((string) $params['newcategory']) : '';
    if ($name === '') return array('ok' => false, 'message' => 'newcategory required');
    db_query("insert into {$p}syndicationcategories (category_name) values (?)", array($name));
    return array('ok' => true, 'refetch' => 'categories');
}

function management_rest_educationlevels_panel()
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $rows = db_query("select educationlevel_id, educationlevel_name, parent_id from {$p}educationlevel");
    $tree = management_rest_tree_from_rows($rows, 'educationlevel_id', 'educationlevel_name');
    return array('panel' => 'educationlevels', 'title' => MANAGEMENT_MENUBAR_EDUCATION, 'tree' => $tree);
}

function management_rest_remove_educationlevel(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['remove']) || !is_numeric($params['remove'])) return array('ok' => false, 'message' => 'remove required');
    db_query("delete from {$p}educationlevel where educationlevel_id=?", array((int) $params['remove']));
    return array('ok' => true, 'refetch' => 'educationlevels');
}

function management_rest_new_educationlevel(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $name = isset($params['neweducationlevel']) ? trim((string) $params['neweducationlevel']) : '';
    if ($name === '') return array('ok' => false, 'message' => 'neweducationlevel required');
    db_query("insert into {$p}educationlevel (educationlevel_name) values (?)", array($name));
    return array('ok' => true, 'refetch' => 'educationlevels');
}

function management_rest_grouping_panel()
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $rows = db_query("select grouping_id, grouping_name, parent_id from {$p}grouping");
    $tree = management_rest_tree_from_rows($rows, 'grouping_id', 'grouping_name');
    return array('panel' => 'grouping', 'title' => MANAGEMENT_MENUBAR_GROUPING, 'tree' => $tree);
}

function management_rest_remove_grouping(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['remove']) || !is_numeric($params['remove'])) return array('ok' => false, 'message' => 'remove required');
    db_query("delete from {$p}grouping where grouping_id=?", array((int) $params['remove']));
    return array('ok' => true, 'refetch' => 'grouping');
}

function management_rest_new_grouping(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $name = isset($params['newgrouping']) ? trim((string) $params['newgrouping']) : '';
    if ($name === '') return array('ok' => false, 'message' => 'newgrouping required');
    db_query("insert into {$p}grouping (grouping_name) values (?)", array($name));
    return array('ok' => true, 'refetch' => 'grouping');
}

function management_rest_course_panel()
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $rows = db_query("select course_id, course_name, parent_id from {$p}course");
    $tree = management_rest_tree_from_rows($rows, 'course_id', 'course_name');
    return array('panel' => 'course', 'title' => MANAGEMENT_MENUBAR_COURSE, 'tree' => $tree);
}

function management_rest_remove_course(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    if (!isset($params['remove']) || !is_numeric($params['remove'])) return array('ok' => false, 'message' => 'remove required');
    db_query("delete from {$p}course where course_id=?", array((int) $params['remove']));
    return array('ok' => true, 'refetch' => 'course');
}

function management_rest_new_course(array $params)
{
    management_rest_load_language_sets();
    management_rest_require_perm('metaadmin');
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $name = isset($params['newcourse']) ? trim((string) $params['newcourse']) : '';
    if ($name === '') return array('ok' => false, 'message' => 'newcourse required');
    db_query("insert into {$p}course (course_name) values (?)", array($name));
    return array('ok' => true, 'refetch' => 'course');
}

function management_rest_upload_template()
{
    management_rest_load_language_sets();
    management_rest_require_perm('templateadmin');
    global $xerte_toolkits_site;

    // Reuse legacy upload logic but wrap result as JSON message (no HTML fragments).
    ob_start();
    include $xerte_toolkits_site->root_file_path . 'website_code/php/management/upload.php';
    $out = trim((string) ob_get_clean());
    return array('ok' => true, 'message' => $out);
}

function management_rest_upload_theme()
{
    management_rest_load_language_sets();
    management_rest_require_perm('templateadmin');
    global $xerte_toolkits_site;

    ob_start();
    include $xerte_toolkits_site->root_file_path . 'website_code/php/management/upload_theme.php';
    $out = trim((string) ob_get_clean());
    return array('ok' => true, 'message' => $out);
}


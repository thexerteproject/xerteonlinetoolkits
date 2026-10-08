<?php
/**
 * Resolve wizard (.xwd) root path from template metadata and serve merged XML via REST.
 * Path rules mirror modules/{framework}/edithtml.php (Xerte: templates/ then parent_templates/).
 */

/**
 * @param int $template_id
 * @return array<string,mixed>|null Row with template_name, parent_template, template_framework
 */
function wizard_fetch_original_template_row($template_id)
{
    global $xerte_toolkits_site;
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "SELECT td.template_id, otd.template_name, otd.parent_template, otd.template_framework
            FROM {$p}templatedetails td
            INNER JOIN {$p}originaltemplatesdetails otd ON td.template_type_id = otd.template_type_id
            WHERE td.template_id = ?";
    return db_query_one($sql, array((int) $template_id));
}

/**
 * Absolute filesystem path to the folder that contains wizards/ (trailing slash).
 *
 * @param array<string,mixed> $row from wizard_fetch_original_template_row()
 */
function wizard_resolve_xwd_root_absolute_path(array $row)
{
    global $xerte_toolkits_site;

    $root = str_replace('\\', '/', $xerte_toolkits_site->root_file_path);
    $root = rtrim($root, '/') . '/';

    $fw = $row['template_framework'];
    $tplName = $row['template_name'];
    $parent = $row['parent_template'];
    $lang = isset($_SESSION['toolkits_language']) ? $_SESSION['toolkits_language'] : 'en-GB';

    if ($fw === 'xerte') {
        $xwd_path = $root . 'modules/' . $fw . '/templates/' . $tplName . '/';
        if (file_exists($xwd_path . 'wizards/' . $lang . '/data.xwd')
            || file_exists($xwd_path . 'wizards/en-GB/data.xwd')) {
            return $xwd_path;
        }

        return $root . 'modules/' . $fw . '/parent_templates/' . $parent . '/';
    }

    return $root . 'modules/' . $fw . '/parent_templates/' . $parent . '/';
}

/** @var list<string> */
function wizard_editor_overlay_request_keys()
{
    return array('simple_mode', 'disable_advanced', 'simple_lo_page', 'template_sub_pages', 'languagecode', 'theme');
}

/**
 * Temporarily merge editor query params into $_REQUEST for PHPEP plugin conditions.
 *
 * @param array<string,mixed> $params
 * @return array<string,mixed> snapshot to pass to wizard_restore_editor_request_overlay()
 */
function wizard_apply_editor_request_overlay(array $params)
{
    $keys = wizard_editor_overlay_request_keys();
    $snapshot = array('_wizard_keys' => $keys);

    foreach ($keys as $k) {
        if (!array_key_exists($k, $params)) {
            continue;
        }
        $v = $params[$k];
        if ($v === null || $v === '') {
            continue;
        }
        if (is_array($v)) {
            $v = implode(',', $v);
        }
        $snapshot[$k] = array_key_exists($k, $_REQUEST) ? $_REQUEST[$k] : null;
        $_REQUEST[$k] = $v;
    }

    return $snapshot;
}

/**
 * @param array<string,mixed> $snapshot from wizard_apply_editor_request_overlay()
 */
function wizard_restore_editor_request_overlay(array $snapshot)
{
    if (!isset($snapshot['_wizard_keys'])) {
        return;
    }
    foreach ($snapshot['_wizard_keys'] as $k) {
        if (!array_key_exists($k, $snapshot)) {
            continue;
        }
        $prev = $snapshot[$k];
        if ($prev === null) {
            unset($_REQUEST[$k]);
        } else {
            $_REQUEST[$k] = $prev;
        }
    }
}

/**
 * Merged wizard XWD XML for a template (same output as legacy getXwd.php).
 *
 * @param array<string,mixed> $params request params (template_id + optional overlay keys)
 * @return array{ok:true,xml:string}|array{ok:false,code:int,error:string,message:string}
 */
function wizard_get_merged_definition_for_rest(array $params)
{
    global $xerte_toolkits_site;

    require_once dirname(__FILE__) . '/WizardDefinitionService.php';
    require_once $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->php_library_path . 'user_library.php';
    require_once $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->php_library_path . 'template_status.php';

    if (empty($_SESSION['toolkits_logon_id'])) {
        return array('ok' => false, 'code' => 401, 'error' => 'auth_required', 'message' => 'Please login');
    }

    if (!isset($params['template_id']) || !is_numeric($params['template_id'])) {
        return array('ok' => false, 'code' => 400, 'error' => 'missing_template_id', 'message' => 'template_id required');
    }

    $tid = (int) $params['template_id'];
    if (!has_rights_to_this_template($tid, $_SESSION['toolkits_logon_id']) && !is_user_permitted('projectadmin')) {
        return array('ok' => false, 'code' => 403, 'error' => 'forbidden', 'message' => 'No access');
    }

    $row = wizard_fetch_original_template_row($tid);
    if ($row === false || $row === null) {
        return array('ok' => false, 'code' => 404, 'error' => 'template_not_found', 'message' => 'Template not found');
    }

    $path = wizard_resolve_xwd_root_absolute_path($row);
    if ($path === '' || !is_dir($path)) {
        return array('ok' => false, 'code' => 404, 'error' => 'wizard_path_not_found', 'message' => 'Wizard path not found');
    }

    $snapshot = wizard_apply_editor_request_overlay($params);
    try {
        $xml = wizard_get_merged_xwd_xml($path);
    } finally {
        wizard_restore_editor_request_overlay($snapshot);
    }

    if ($xml === '') {
        return array('ok' => false, 'code' => 404, 'error' => 'wizard_not_found', 'message' => 'Wizard definition not found');
    }

    return array('ok' => true, 'xml' => $xml);
}

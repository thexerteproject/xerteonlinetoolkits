<?php

require_once("config.php");
require_once("website_code/php/language_library.php");
require_once("website_code/php/user_library.php");

require_once(__DIR__ . "/management/vendor_option_component.php");

/**
 *
 * Function get_vendor_settings
 * This function returns the settings as declared in the management_helper table
 * @returns array
 * @version 1.0
 * @author Timo Boer
 */
function get_vendor_settings(): array
{
    global $xerte_toolkits_site;
    $query = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}management_helper WHERE enabled = 1 ORDER BY type ASC";
    $res = db_query($query);

    $blocks = array();
    if ($res !== false) {

        foreach ($res as $vendor) {
            $block = new vendor_option_component($vendor);
            $blocks[$block->type][$block->vendor] = $block;
        }

    }
    return $blocks;
}

function get_ai_base_settings_options(): array
{
    global $xerte_toolkits_site;

    $query = "SELECT setting_key, option_values
              FROM {$xerte_toolkits_site->database_table_prefix}ai_settings_options
              ORDER BY id ASC";
    $res = db_query($query);

    $settings = array();

    if ($res !== false) {
        foreach ($res as $row) {
            $values = array_filter(array_map('trim', explode(',', $row['option_values'])));
            $settings[$row['setting_key']] = $values;
        }
    }

    return $settings;
}

function get_ai_base_settings_defaults(): array
{
    global $xerte_toolkits_site;

    $query = "SELECT *
              FROM {$xerte_toolkits_site->database_table_prefix}ai_settings
              WHERE scope_type = ? AND scope_id = ?";
    $res = db_query_one($query, ['global', 0]);

    if ($res === false || empty($res)) {
        return array();
    }

    unset($res['id'], $res['scope_type'], $res['scope_id']);

    return $res;
}

/**
 * Created by PhpStorm.
 * User: tom
 * Date: 10-5-14
 * Time: 12:24
 */

function get_children ($parent_id, $lookup, $column, $type): array
{
    // children
    $children = array();
    //we are at a leaf level
    if (empty($lookup[$parent_id]['children'])){
        return $children;
    }
    foreach ($lookup[$parent_id]['children'] as $node) {
        $children[] = array('name' => $node[$column], 'value' => $node[$column], 'children' => get_children($node[$type], $lookup, $column, $type));
    }
    return $children;
}
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
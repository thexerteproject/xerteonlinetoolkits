<?php
/**
 * Load preview/template XML from user file area — shared by get_template_xml.php and REST API.
 *
 * @return array{ok:bool,xml?:string,message?:string,code?:string}
 */
function template_preview_xml_load($unsafe_file_path)
{
    global $xerte_toolkits_site;

    $full_unsafe_file_path = x_convert_user_area_url_to_path($unsafe_file_path);
    if (!x_check_path_traversal($full_unsafe_file_path, $xerte_toolkits_site->users_file_area_full, "Invalid file specified", 'file', true)) {
        return array('ok' => false, 'message' => 'Invalid file specified', 'code' => 'invalid_path');
    }
    if (strtolower(substr($full_unsafe_file_path, -4)) !== '.xml') {
        return array('ok' => false, 'message' => 'Not found', 'code' => 'not_xml');
    }
    return array('ok' => true, 'xml' => file_get_contents($full_unsafe_file_path));
}

<?php

/**
 * 
 * Drawing page, brings up the xerte drawing tool in another window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */
require_once(dirname(__FILE__) . '/config.php');

echo file_get_contents("modules/xerte/drawing_xerte_top");

$string_for_flash_xml = '';
$string_for_flash_media = '';
$string_for_flash_xwd = '';
$template_id = '';

// XOT never passes any parameters into this ... so it's a fairly pointless page.
// The drawing itself gets updated when you publish/exit the flash editor, at which point it 
// posts stuff back to /website_code/php/versioncontrol/update_file.php

if (isset($_GET['template_id'])) {
    $string_for_flash_xml = '';
    $string_for_flash_media = '';
    $string_for_flash_xwd = '';
    $template_id = (int) $_GET['template_id'];
}

echo "so.addVariable(\"xmlvariable\", \"$string_for_flash_xml\");";
echo "so.addVariable(\"rlovariable\", \"$string_for_flash_media\");";
echo "so.addVariable(\"originalpathvariable\", \"$string_for_flash_xwd\");";
echo "so.addVariable(\"template_id\", \"" . $template_id . "\");";
echo "so.write(\"flashcontent\");";
echo "</script>";
echo "</body></html>";

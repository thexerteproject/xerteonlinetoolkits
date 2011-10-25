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

echo "so.addVariable(\"xmlvariable\", \"$string_for_flash_xml\");";
echo "so.addVariable(\"rlovariable\", \"$string_for_flash_media\");";
echo "so.addVariable(\"originalpathvariable\", \"$string_for_flash_xwd\");";
echo "so.addVariable(\"template_id\", \"" . $row['template_id'] . "\");";

echo "so.write(\"flashcontent\");";
echo "</script>";

echo "</body></html>";

?>

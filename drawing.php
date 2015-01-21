<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/**
 * 
 * Drawing page, brings up the xerte drawing tool in another window
 *
 * @author Patrick Lockley
 * @version 1.0
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

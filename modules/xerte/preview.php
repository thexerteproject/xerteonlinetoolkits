<?PHP
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
* preview page, allows the site to make a preview page for a xerte module
*
* @author Patrick Lockley
* @version 1.0
* @params array row_play - The array from the last mysql query
* @package
*/

require_once(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');

/**
*
* Function show_preview_code
* This function creates folders needed when creating a template
* @param array $row - an array from a mysql query for the template
* @param array $row_username - an array from a mysql query for the username
* @version 1.0
* @author Patrick Lockley
*/

require_once(dirname(__FILE__) . "/play.php");

function show_preview_code($row)
{
    global $xerte_toolkits_site;

    $template_dir = $xerte_toolkits_site->users_file_area_full . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    if(!file_exists($template_dir .'/preview.xml')) {

        $buffer = file_get_contents($template_dir . '/data.xml');
        $fp = fopen($template_dir . '/preview.xml','x');
        fwrite($fp, $buffer);
        fclose($fp);

    }

    $preview_filename = "preview.xml";

	//************ TEMPORARY ****************

	//if (file_exists($template_dir . '/preview2.xml')) {
	//	$preview_filename = "preview2.xml";
	//}

	//***************************************

    echo show_template_page($row, $preview_filename);
}



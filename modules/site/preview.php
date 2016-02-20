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


require(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');

function show_preview_code($row)
{

    global $xerte_toolkits_site;

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    $xmlfile = $string_for_flash . "preview.xml";

    $xmlFixer = new XerteXMLInspector();
    $xmlFixer->loadTemplateXML($xmlfile);

    if (strlen($xmlFixer->getName()) > 0)
    {
        $title = $xmlFixer->getName();
    }
    else
    {
        $title = SITE_PREVIEW_TITLE;
    }

    $string_for_flash_xml = $xmlfile . "?time=" . time();

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    $template_path_string = "modules/site/parent_templates/" . $row['template_name'] . "/";

    require_once("config.php");

    _load_language_file("/modules/site/preview.inc");

    $version = file_get_contents(dirname(__FILE__) . "/../../version.txt");
    // $engine is assumed to be javascript if flash is NOT set
    $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player_html5/rloObject.htm");
    $page_content = str_replace("%VERSION%", $version , $page_content);
    $page_content = str_replace("%TITLE%", $title, $page_content);
    $page_content = str_replace("%TEMPLATEPATH%", $template_path_string, $page_content);
    $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
    $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);

    echo $page_content;
}
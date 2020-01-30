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
require_once("../../../config.php");

_load_language_file("/website_code/php/management/templates.inc");

require("../user_library.php");
require("management_library.php");
require("../xwdInspector.php");

if (is_user_admin()) {

    $database_id = database_connect("templates list connected", "template list failed");

    $xwdData = new XerteXWDInspector();
    // Get name of Nottingham data.wxd with the correct language
    // Later if there are more templates with subpages, consider to do this within the loop
    $xwd_path = $xerte_toolkits_site->root_file_path . "/modules/xerte/parent_templates/Nottingham/";
    if (file_exists($xwd_path . "wizards/" . $_SESSION['toolkits_language'] . "/data.xwd")) {
        $xwd_path = $xwd_path . "wizards/" . $_SESSION['toolkits_language'] . "/data.xwd";
    } else if (file_exists($xwd_path . "wizards/en-GB/data.xwd")) {
        $xwd_path = $xwd_path . "wizards/en-GB/data.xwd";
    } else if (file_exists($xwd_path . "data.xwd")) {
        $xwd_path = $xwd_path . "data.xwd";
    }
    $xwdData->loadTemplateXML($xwd_path);

    echo "<p style=\"margin:20px 0 0 5px;\">" . TEMPLATE_UPDATE_EXPLANATION . "<br /><br />
    <button type=\"button\" class=\"xerte_button\" onclick='javascript:template_sync()'><i class=\"fa fa-refresh\"></i> " . TEMPLATE_UPDATE . "</button></p>";

    echo "<p style=\"margin:20px 0 0 5px;\">" . TEMPLATE_ADD_EXPLANATION .
    "<br><br>" .
    "<form action='website_code/php/management/upload.php' method='post' enctype='multipart/form-data' onsubmit='return template_submit()' id='form-template-upload'>" .
        "<input type='file' value='Search File' name='fileToUpload' id='file-select'>" .
        "<p>
            <input class='management_input' type='text' name='templateName'>&NonBreakingSpace;" . TEMPLATE_UPLOAD_TEMPLATENAME . "<br>
            <input class='management_input' type='text' name='templateDisplayname'>&NonBreakingSpace;" . TEMPLATE_UPLOAD_TEMPLATEDISPLAYNAME . "<br>
            <input class='management_input' type='text' name='templateDescription'>&NonBreakingSpace;" . TEMPLATE_UPLOAD_TEMPLATEDESCRIPTION . "<br>
        </p><br>
        <button type='submit' id='upload-button' class='xerte_button'><i class=\"fa fa-upload\"></i> " . TEMPLATE_UPLOAD_BUTTON . "</button>" .
    "</form></p>";


    echo "<p style=\"margin:20px 0 0 5px\">" . TEMPLATE_MANAGE . "</p>";
    $last_template_type = "";

    $query = "select * from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where access_rights != 'deleted' order by template_framework, parent_template, template_name";
    $query_response = db_query($query);
    foreach ($query_response as $row) {


        if ($row['template_framework'] != $last_template_type) {

            echo "<h2 style='margin-left:5px'>" . ucfirst($row['template_framework']) . "</h2>";

            $last_template_type = $row['template_framework'];

        }

        echo "<div class=\"template\" id=\"" . $row['template_name'] . "\" savevalue=\"" . $row['template_type_id'] . "\"><p>" . str_replace('_', ' ', $row['template_name']) . " <button type=\"button\" class=\"xerte_button\" id=\"" . $row['template_name'] . "_btn\" onclick=\"javascript:templates_display('" . $row['template_name'] . "')\">" . TEMPLATE_VIEW . "</button></p></div><div class=\"template_details\" id=\"" . $row['template_name'] . "_child\">";
        echo "<p>" . TEMPLATE_TYPE . " " . $row['template_framework'] . "</p>";
        if ($row['template_name'] != $row['parent_template'])
        {
            echo "<p>" . TEMPLATE_SUB_TYPE . " "  . $row['parent_template'] . " <button type=\"button\" class=\"xerte_button\" id=\"" . $row['template_name'] . "_del_btn\" onclick=\"javascript:templates_delete_sub('" . $row['template_type_id'] . "')\">" . TEMPLATE_SUB_DELETE . "</button></p>";
        }
        if ($row['template_framework'] == "xerte") {

            $template_check = file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $row['template_name'] . "/" . $row['template_name'] . ".rlt");

            $folder = explode('"', substr($template_check, strpos($template_check, "targetFolder"), strpos($template_check, "version") - strpos($template_check, "targetFolder")));

            $start_point = strpos($template_check, "version");

            $version = explode('"', substr($template_check, $start_point, strpos($template_check, " ", $start_point) - $start_point));

            echo "<p>" . TEMPLATE_VERSION . " " . $version[1] . "</p>";

        }

        echo "<p>" . TEMPLATE_DESCRIPTION . " <form><textarea id=\"" . $row['template_type_id'] . "desc\">" . $row['description'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_UPLOAD_DATE . " " . $row['date_uploaded'] . "</p>";
        echo "<p>" . TEMPLATE_NAME . "<form><textarea id=\"" . $row['template_type_id'] . "display\">" . $row['display_name'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_EXAMPLE . "<form><textarea id=\"" . $row['template_type_id'] . "example\">" . $row['display_id'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_ACCESS . "<form><textarea id=\"" . $row['template_type_id'] . "access\">" . $row['access_rights'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_DATE_UPLOAD . " <form><textarea id=\"" . $row['template_type_id'] . "_date_uploaded\">" . $row['date_uploaded'] . "</textarea></form></p>";
        echo "<p>" . TEMPLATE_STATUS . " ";

        echo "<select ";

        if ($row['active'] == "0") {

            echo " SelectedItem=\"true\" name=\"type\" id=\"" . $row['template_type_id'] . "active\" ><option value=\"true\">" . TEMPLATE_ACTIVE . "</option><option value=\"false\" selected=\"selected\">" . TEMPLATE_INACTIVE . "</option></select></p>";

        } else {

            echo " SelectedItem=\"true\" name=\"type\" id=\"" . $row['template_type_id'] . "active\" ><option value=\"true\" selected=\"selected\">" . TEMPLATE_ACTIVE . "</option><option value=\"false\">" . TEMPLATE_INACTIVE . "</option></select></p>";

        }

        echo "<p>" . TEMPLATE_REPLACE . "<br><form method=\"post\" enctype=\"multipart/form-data\" id=\"importpopup\" name=\"importform\" target=\"upload_iframe\" action=\"website_code/php/import/import_template.php\" onsubmit=\"javascript:iframe_check_initialise();\"><input name=\"filenameuploaded\" type=\"file\" /><br /><input type=\"hidden\" name=\"replace\" value=\"" . $row['template_type_id'] . "\" /><input type=\"hidden\" name=\"folder\" value=\"" . $row['template_name'] . "\" /><input type=\"hidden\" name=\"version\" value=\"" . $version[1] . "\" /><br /><button type=\"submit\" class=\"xerte_button\" name=\"submitBtn\" onsubmit=\"javascript:iframe_check_initialise()\" >" . TEMPLATE_UPLOAD_BUTTON . "</button></form></p>";

        if ($row['template_framework'] == "xerte")
        {
            $subpages = array();
            if ($row['template_sub_pages'] != "")
            {
                $subpages = explode(",", $row['template_sub_pages']);
            }
            if (count($subpages) > 0)
            {
                $allselected = false;
            }
            else{
                $allselected = true;
            }
            echo "<p>" . TEMPLATE_SUB_PAGES . "<br><div class='sub_page_selection'>";
            echo "<input class='sub_page_selection_all' type='checkbox' " . ($allselected ? "checked" : "") . " id='sub_page_select_all_" . $row['template_type_id'] . "' name='select_all' onchange=\"sub_select_change_all(" . $row['template_type_id'] . ")\">" . TEMPLATE_SUB_PAGES_SELECT_ALL . "<br>";
            $menus = $xwdData->getMenus();
            foreach($menus as $menu) {
                echo "<span class='sub_page_selection_menuitem'>" . $menu->name . ":</span><br>";
                $models = $menu->models;
                foreach ($models as $model) {
                    if ($model->deprecated)
                        continue;
                    $selected = $allselected;
                    if (!$allselected) {
                        $selected = in_array($model->name, $subpages);
                    }
                    echo "<input class='sub_page_selection_model sub_page_selection_model_" . $row['template_type_id'] . "' type='checkbox' " . ($selected ? "checked" : "") . " id='sub_page_" . $row['template_type_id'] . "_" . $model->name . "' name='" . $model->name . "'>" . $model->displayname . "<br>";
                }
            }
            echo "</div>";
        }

        echo "</div>";

    }

} else {

    management_fail();

}

?>

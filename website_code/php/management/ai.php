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
require_once("../../../ai_config.php");

_load_language_file("/website_code/php/management/ai.inc");
_load_language_file("/ai.inc");

require("../user_library.php");
require("management_library.php");


if (is_user_admin()) {

    $database_id = database_connect("templates list connected", "template list failed");

    $query = "SELECT openai, anthropic FROM " . $xerte_toolkits_site->database_table_prefix . "sitedetails";
    $res = db_query_one($query);
    if ($res !== false) {
        $openai_settings = array();
        $settings = explode(',', $res['openai']);
        foreach ($settings as $value){
            $tmp = explode(':',$value);
            $openai_settings[$tmp[0]] = $tmp[1] == 'true' ? 'checked' : "";
        }

        $anthropic_settings = array();
        $settings = explode(',', $res['anthropic']);
        foreach ($settings as $value){
            $tmp = explode(':',$value);
            $anthropic_settings[$tmp[0]] = $tmp[1] == 'true' ? 'checked' : "";
        }

    } else {
        $use_openai_value = 'unknown';
        $use_anthropic_value = 'unknown';
    }

	echo "<h2>" . MANAGEMENT_MENUBAR_AI . "</h2>";

    echo "<div class=\"admin_block\">";

    echo "<h3>" . MANAGEMENT_OPENAI . "</h3>";
    if (isset($xerte_toolkits_site->openAI_key) and $xerte_toolkits_site->openAI_key != '') {
        echo "<p>" . MANAGEMENT_ENABLE_OPENAI . "<form><input type=\"checkbox\" id=\"allow_openai\" name=\"allow_openai\" " . $openai_settings['allow'] . "/></form></p>";

        echo "<p>" . MANAGEMENT_ENABLE_OPENAI_TYPES . "<form>";
        echo "<input type=\"checkbox\" id=\"openai_upload\" name=\"openai_upload\" " . $openai_settings['upload'] . "/><label for=\"openai_upload\">" . MANAGEMENT_UPLOAD . "</label>";
        echo "<input type=\"checkbox\" id=\"openai_whisper\" name=\"openai_whisper\" " . $openai_settings['whisper'] . "/><label for=\"openai_whisper\">" . MANAGEMENT_WHISPER . "</label>";
        echo "<input type=\"checkbox\" id=\"openai_dali\" name=\"openai_dali\" " . $openai_settings['dali'] . "/><label for=\"openai_dali\">" . MANAGEMENT_DALI . "</label>";
        echo "</form></p>";
    } else {
        echo "<p>" . MANAGEMENT_OPENAI_KEY_STATUS . "</p>";
    }
    echo "</div>";

    echo "<div class=\"admin_block\">";

    echo "<h3>" . MANAGEMENT_ANTHROPIC . "</h3>";

    if (isset($xerte_toolkits_site->anthropic_key) and $xerte_toolkits_site->anthropic_key != '') {
        echo "<p>" . MANAGEMENT_ENABLE_ANTHROPIC . "<form><input type=\"checkbox\" id=\"allow_anthropic\" name=\"allow_anthropic\" " . $anthropic_settings['allow'] . "/></form></p>";

        echo "<p>" . MANAGEMENT_ENABLE_ANTHROPIC_TYPES . "<form>";

        echo "<input type=\"checkbox\" id=\"anthropic_upload\" name=\"anthropic_upload\" " . $anthropic_settings['upload'] . "/><label for=\"anthropic_upload\">" . MANAGEMENT_ANTHROPIC_UPLOAD . "</label>";
        echo "<input type=\"checkbox\" id=\"anthropic_whisper\" name=\"anthropic_whisper\" " . $anthropic_settings['whisper'] . "/><label for=\"anthropic_whisper\">" . MANAGEMENT_ANTHROPIC_WHISPER . "</label>";
        echo "<input type=\"checkbox\" id=\"anthropic_dali\" name=\"anthropic_dali\" " . $anthropic_settings['dali'] . "/><label for=\"anthropic_dali\">" . MANAGEMENT_ANTHROPIC_DALI . "</label>";
        echo "</form></p>";
    } else {
        echo "<p>" . MANAGEMENT_ANTHROPIC_KEY_STATUS . "</p>";
    }
    echo "</div>";

} else {

    management_fail();

}
?>


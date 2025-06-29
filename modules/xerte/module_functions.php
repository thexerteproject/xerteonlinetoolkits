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
 
require_once(dirname(__FILE__) . '/../../config.php');
/**
 * 
 * module functions page, shared functions for this module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

function display_property_engines($change,$msgtype){

	echo "<fieldset id=\"engineFS\" class='plainFS'><legend>" . PROPERTIES_LIBRARY_DEFAULT_ENGINE  . "</legend>";
	
	$template = strtolower(get_template_type($_POST['template_id']));

    if (get_default_engine($_POST['template_id']) == 'flash')
    {
		if ($template != "xerte_rss") {
			echo "<div><input type=\"radio\" id=\"javascript\" name=\"engine\" value=\"javascript\" onclick=\"javascript:default_engine_toggle()\"><label for=\"javascript\">" . PROPERTIES_LIBRARY_DEFAULT_HTML5 . "</label></div>";
        	echo "<div><input checked type=\"radio\" id=\"flash\" name=\"engine\" value=\"flash\" onclick=\"javascript:default_engine_toggle()\"><label for=\"flash\">" . PROPERTIES_LIBRARY_DEFAULT_FLASH . "</label></div>";
		} else {
			echo "<div><input checked type=\"radio\" id=\"flash\" name=\"engine\" value=\"flash\" ><label for=\"flash\">" . PROPERTIES_LIBRARY_DEFAULT_FLASH . "</label></div>";
		}
    }
    else
    {
		echo "<div><input checked type=\"radio\" id=\"javascript\" name=\"engine\" value=\"javascript\" onclick=\"javascript:default_engine_toggle()\"><label for=\"javascript\">" . PROPERTIES_LIBRARY_DEFAULT_HTML5 . "</label></div>";
		echo "<div><input type=\"radio\" id=\"flash\" name=\"engine\" value=\"flash\" onclick=\"javascript:default_engine_toggle()\"><label for=\"flash\">" . PROPERTIES_LIBRARY_DEFAULT_FLASH . "</label></div>";
    }
	
	if($change && $msgtype=="engine"){
        echo "<p aria-live='polite' class=\"alert_msg\"><i class='fa fa-exclamation-circle' style='height: 14px; color:#f86718;'></i> " . PROPERTIES_LIBRARY_DEFAULT_ENGINE_CHANGED . "</p>";
    }
	
	echo "<p>" . PROPERTIES_LIBRARY_DEFAULT_ENGINE_WARNING  . "</p>";
	echo "</fieldset>";

}

function process_logos($LO_icon_path, $theme_path, $template_path, $page_content) {
    $extensions = array('svg',  'png', 'jpg', 'gif');

    // First the author logo
    if (strlen(trim($LO_icon_path)) > 0) {
        return str_replace("%LOGO%", '<img class="x_icon" src="' . trim($LO_icon_path) . '" alt="" />' , $page_content);
    }

    // Secondly check the theme logo
    foreach($extensions as $ext) {
        if (file_exists($theme_path . '/logo.' . $ext)) {
            return str_replace("%LOGO%", '<img class="x_icon" src="' . $theme_path . '/logo.'. $ext . '" alt="" />' , $page_content);
        }
    }

    // Lastly check the default location
    foreach($extensions as $ext) {
        if (file_exists($template_path . 'common_html5/logo.' . $ext)) {
            return str_replace("%LOGO%", '<img class="x_icon" src="%TEMPLATEPATH%common_html5/logo.'. $ext . '" alt="" />' , $page_content);
        }
    }

    return $page_content = str_replace("%LOGO%", '<img class="x_icon" src="" alt="" />' , $page_content);
}

function process_sidebar_logo($theme_path, $page_content) {
    $extensions = array('svg',  'png', 'jpg', 'gif');

    // check the theme logo
    foreach($extensions as $ext) {
        if (file_exists($theme_path . '/logo_sidebar.' . $ext)) {
            return str_replace("%SIDEBARLOGO%", $theme_path . '/logo_sidebar.'. $ext, $page_content);
        }
    }

    return $page_content = str_replace("%SIDEBARLOGO%", '' , $page_content);
}

function display_publish_engine(){
	
	echo "<p>" . PROPERTIES_LIBRARY_DEFAULT_ENGINE . " ";

    if (get_default_engine($_POST['template_id']) == 'flash')
    {
		echo PROPERTIES_LIBRARY_DEFAULT_FLASH;
    }
    else
    {
		echo PROPERTIES_LIBRARY_DEFAULT_HTML5;
    }
	
	echo "</p>";
}

function dont_show_template($optional=''){

    global $xerte_toolkits_site;

    _load_language_file("/modules/xerte/module_functions.inc");
    $edit_site_logo = $xerte_toolkits_site->site_logo;
    $pos = strrpos($edit_site_logo, '/') + 1;
    $edit_site_logo = substr($edit_site_logo,0,$pos) . "edit_" . substr($edit_site_logo,$pos);

    $edit_organisational_logo = $xerte_toolkits_site->organisational_logo;
    $pos = strrpos($edit_organisational_logo, '/') + 1;
    $edit_organisational_logo = substr($edit_organisational_logo,0,$pos) . "edit_" . substr($edit_organisational_logo,$pos);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <script src="modules/Xerte/js/swfobject.js"></script>
    <script src="website_code/scripts/opencloseedit.js"></script>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
    </head>

    <body>

    <div style="margin:0 auto; width:800px">
    <div class="edit_topbar" style="width:800px">
        <img src="<?php echo $edit_site_logo;?>" style="margin-left:10px; float:left" />
        <img src="<?php echo $edit_organisational_logo;?>" style="margin-right:10px; float:right" />
    </div>
    <div style="margin:0 auto">
<?PHP

    echo XERTE_DISPLAY_FAIL;
if($optional!=='') {
      echo '</div><div>' . $optional;
}
    ?></div></div></body></html><?PHP

        die();

}

?>

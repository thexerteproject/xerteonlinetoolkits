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
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

function display_property_engines($change,$msgtype){

	echo "<p>" . PROPERTIES_LIBRARY_DEFAULT_ENGINE  . "</p>";

    if (get_default_engine($_POST['template_id']) == 'flash')
    {
        echo "<p><img id=\"html5\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:default_engine_toggle('html5', 'javascript', 'flash')\" /> " . PROPERTIES_LIBRARY_DEFAULT_HTML5 . "<br>";
        echo "<img id=\"flash\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:default_engine_toggle('flash', 'flash', 'javascript')\"/> " . PROPERTIES_LIBRARY_DEFAULT_FLASH . "</p>";
    }
    else
    {
        echo "<p><img id=\"html5\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:default_engine_toggle('html5', 'javascript', 'flash')\" /> " . PROPERTIES_LIBRARY_DEFAULT_HTML5 . "<br>";
        echo "<img id=\"flash\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:default_engine_toggle('flash', 'flash', 'javascript')\" /> " . PROPERTIES_LIBRARY_DEFAULT_FLASH . "</p>";
    }
    if($change && $msgtype=="engine"){

        echo "<p>" . PROPERTIES_LIBRARY_DEFAULT_ENGINE_CHANGED . "</p>";

    }

}

function display_publish_engine(){
    echo "<p><b>" . PROPERTIES_LIBRARY_PUBLISH_ENGINE  . "</b><br>";
    echo PROPERTIES_LIBRARY_DEFAULT_ENGINE  . "</p>";

    if (get_default_engine($_POST['template_id']) == 'flash')
    {
        echo "<p><img id=\"html5\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:publish_engine_toggle('html5', 'javascript', 'flash')\" /> " . PROPERTIES_LIBRARY_DEFAULT_HTML5 . "<br>";
        echo "<img id=\"flash\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:publish_engine_toggle('flash', 'flash', 'javascript')\"/> " . PROPERTIES_LIBRARY_DEFAULT_FLASH . "</p>";
    }
    else
    {
        echo "<p><img id=\"html5\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:publish_engine_toggle('html5', 'javascript', 'flash')\" /> " . PROPERTIES_LIBRARY_DEFAULT_HTML5 . "<br>";
        echo "<img id=\"flash\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:publish_engine_toggle('flash', 'flash', 'javascript')\" /> " . PROPERTIES_LIBRARY_DEFAULT_FLASH . "</p>";
    }
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

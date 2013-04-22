<?php 
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

    _load_language_file("/modules/xerte/module_functions.inc");

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
        <img src="website_code/images/edit_xerteLogo.jpg" style="margin-left:10px; float:left" />
        <img src="website_code/images/edit_UofNLogo.jpg" style="margin-right:10px; float:right" />
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

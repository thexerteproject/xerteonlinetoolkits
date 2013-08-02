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

}

function display_publish_engine(){

}

function dont_show_template($optional=''){
    global $xerte_toolkits_site;

    _load_language_file("/modules/site/module_functions.inc");

    $edit_site_logo = $xerte_toolkits_site->site_logo;
    $pos = strrpos($edit_site_logo, '/') + 1;
    $edit_site_logo = substr($edit_site_logo,0,$pos) . "edit_" . substr($edit_site_logo,$pos);

    $edit_organisational_logo = $xerte_toolkits_site->organisational_logo;
    $pos = strrpos($edit_organisational_logo, '/') + 1;
    $edit_organisational_logo = substr($edit_organisational_logo,0,$pos) . "edit_" . substr($edit_organisational_logo,$pos);

?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
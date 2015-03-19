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
 * Created by PhpStorm.
 * User: tom
 * Date: 10-5-14
 * Time: 12:24
 */


/**
 *
 * Function output_editor_code
 * This function outputs the xerte editor code
 * @param array $row_edit - the mysql query for this folder
 * @param number $xerte_toolkits_site - a number to make sure that we enter and leave each folder correctly
 * @param bool $read_status - a read only flag for this template
 * @param number $version_control - a setting to handle the delettion of lock files when the window is closed
 * @version 1.0
 * @author Patrick Lockley
 */

function output_editor_code($row_edit, $xerte_toolkits_site, $read_status, $version_control){

    require_once("config.php");
    require_once("website_code/php/language_library.php");

    _load_language_file("/modules/decision/edit.inc");

    $row_username = db_query_one("select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?" , array($row_edit['user_id']));

    if(empty($row_username)) {
        die("Invalid user id ?");
    }

    /**
     * create the preview xml used for editing
     */

	$preview_filename = "preview.xml";

    $rlo_path = $xerte_toolkits_site->users_file_area_full . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'];
    $media_path = $rlo_path . "/media/";
    $preview = $rlo_path . "/preview.xml";
    $data    = $rlo_path . "/data.xml";

    if(!file_exists($preview) && file_exists($data)){
        copy($data, $preview);
        chmod($preview, 0777);
    }

    $preview_url = $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/" . $preview_filename;
    $data_url = $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/data.xml";
    $rlo_url = $xerte_toolkits_site->site_url .  $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'];
    $xwd_url = "modules/" . $row_edit['template_framework'] . "/parent_templates/" . $row_edit['template_name'] . "/";
    $xwd_path = $xerte_toolkits_site->root_file_path . "/modules/" . $row_edit['template_framework'] . "/parent_templates/" . $row_edit['template_name'] . "/";

    if (file_exists($xwd_path . "wizards/" . $_SESSION['toolkits_language'] . "/data.xwd" ))
    {
        $xwd_file_url = $xwd_url . "wizards/" . $_SESSION['toolkits_language'] . "/data.xwd";
    }
    else if (file_exists($xwd_path . "wizards/en-GB/data.xwd" ))
    {
        $xwd_file_url = $xwd_url . "wizards/en-GB/data.xwd";
    }
    else if (file_exists($xwd_path . "data.xwd"))
    {
        $xwd_file_url = $xwd_url . "data.xwd";
    }

    $module_url = "modules/" . $row_edit['template_framework'] . "/";

    $jqgridlangfile = "editor/js/vendor/jqgrid/js/i18n/grid.locale-en.js";

    $jqgridlangcode = strtolower($_SESSION['toolkits_language']);
    if (file_exists($xerte_toolkits_site->root_file_path . "editor/js/vendor/jqgrid/js/i18n/grid.locale-" . $jqgridlangcode . ".js"))
    {
        $jqgridlangfile = "editor/js/vendor/jqgrid/js/i18n/grid.locale-" . $jqgridlangcode . ".js";
    }
    else
    {
        $jqgridlangcode = substr($jqgridlangcode,0,2);
        if (file_exists($xerte_toolkits_site->root_file_path . "editor/js/vendor/jqgrid/js/i18n/grid.locale-" . $jqgridlangcode . ".js"))
        {
            $jqgridlangfile = "editor/js/vendor/jqgrid/js/i18n/grid.locale-" . $jqgridlangcode . ".js";
        }
    }

    /**
     * sort of the screen sies required for the preview window
     */

    $temp = explode("~",get_template_screen_size($row_edit['template_name'],$row_edit['template_framework']));

    //$edit_site_logo = $xerte_toolkits_site->site_logo;
    //$pos = strrpos($edit_site_logo, '/') + 1;
    //$edit_site_logo = substr($edit_site_logo,0,$pos) . "edit_" . substr($edit_site_logo,$pos);

    //$edit_organisational_logo = $xerte_toolkits_site->organisational_logo;
    //$pos = strrpos($edit_organisational_logo, '/') + 1;
    //$edit_organisational_logo = substr($edit_organisational_logo,0,$pos) . "edit_" . substr($edit_organisational_logo,$pos);

    /**
     * set up the onunload function used in version control
     */

?>
<!DOCTYPE html>
<html lang="<?php echo $_SESSION['toolkits_language'];?>">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <title><?php echo DECISION_EDIT_TITLE ?></title>

    <link rel="stylesheet" href="editor/css/jquery-ui.css">
    <link rel="stylesheet" href="editor/js/vendor/themes/default/style.css" />
    <link rel="stylesheet" type="text/css" href="editor/css/complex.css" />
    <link rel="stylesheet" type="text/css" href="website_code/styles/xerte_buttons.css" />
    <link rel="stylesheet" type="text/css" href="editor/js/vendor/featherlight/featherlight.min.css" />
    <link rel="stylesheet" type="text/css" href="editor/js/vendor/imgareaselect/imgareaselect-default.css" />
    <link rel="stylesheet" type="text/css" href="editor/js/vendor/jqgrid/css/ui.jqgrid.css" />
    <link rel="stylesheet" type="text/css" href="editor/js/vendor/ckeditor/plugins/codemirror/css/codemirror.min.css" />

    <script src="website_code/scripts/template_management.js"></script>
    <!--[if lte IE 7]>
    <style type="text/css"> body { font-size: 85%; } </style>
    <![endif]-->

    <style>
        .ui-menu { width: 200px; }
        #insert-info {width: 60%; display: block; float: right; }
		.hide {display: none;}
    </style>

</head>
<body>
<img id="loader" src="editor/img/loading16.gif" />
<div class="hide ui-layout-west">

    <div class="header"></div>

    <div class="content"></div>

    <div class="footer"></div>

</div>

<div class="hide ui-layout-east">

    <div class="header"><div id="optional_title">Optional parameters</div></div>

    <div id="optionalParams" class="content">
        <p>...</p>
    </div>

	<div class="footer"></div>
</div>


<div class="hide ui-layout-north">
    <div class="content" id="#header_images">
        <img src="<?php echo $xerte_toolkits_site->site_logo; ?>" style="float:left" />
        <img src="<?php echo $xerte_toolkits_site->organisational_logo; ?>" style="float:right" />
    </div>
</div>


<div class="hide ui-layout-south">
    <div class="header">Options</div>
    <div class="content"></div>
</div>


    <div id="mainContent" class="hide ui-layout-center pane pane-center ui-layout-pane ui-layout-pane-center">
        <div class="header"></div>
        <div id="content" class="content">
            <div id="mainPanel"></div>
            <div id="languagePanel" style="display:none">
                <hr>
            </div>
            <div id="insert_subnodes">

            </div>
            <div class="nodeInfo" id="info">

            </div>
        </div>
        <div id="main_footer" class="footer">
            <div id="checkbox_outer"><table><tr><td id="checkbox_holder"></td></tr></table></div>
        </div>
    </div>

<div id="insert_menu" class="hide"></div>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>
<script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/modernizr-latest.js"></script>
<script type="text/javascript" src="editor/js/vendor/jstree.js"></script>
<!-- <script type="text/javascript" src="https://c328740.ssl.cf1.rackcdn.com/mathjax/latest/MathJax.js?config=TeX-MML-AM_HTMLorMML-full"></script>  -->
<script type="text/javascript" src="editor/js/vendor/ckeditor/ckeditor.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/adapters/jquery.js"></script>
<script type="text/javascript" src="editor/js/vendor/jscolor.js"></script>
<script type="text/javascript" src="editor/js/vendor/xml2json.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/featherlight/featherlight.js"></script>
<script type="text/javascript" src="editor/js/vendor/imgareaselect/jquery.imgareaselect.js"></script>
<script type="text/javascript" src="editor/js/vendor/jqgrid/js/jquery-migrate-1.2.1.js"></script>
<script type="text/javascript" src="<?php echo $jqgridlangfile; ?>"></script>
<script type="text/javascript" src="editor/js/vendor/jqgrid/js/jquery.jqGrid.min.js"></script>

<!-- load exactly the same codemirror scripts as needed by ckeditor -->
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.addons.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.mode.htmlmixed.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.mode.javascript.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/beautify.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.addons.search.min.js"></script>

<script>
    <?php
    $_SESSION['elFinder']= array(
        'disabled' => false,
        'uploadURL' => $rlo_url,
        'uploadDir' => $rlo_path
    );

    echo "previewxmlurl=\"" . $preview_url . "\";\n";
    echo "dataxmlurl=\"" . $data_url . "\";\n";
    echo "mediavariable=\"" . $media_path . "\";\n";
    echo "rlourlvariable=\"" . $rlo_url . "/\";\n";
    echo "rlopathvariable=\"" . $rlo_path . "/\";\n";
    echo "languagecodevariable=\""  . $_SESSION['toolkits_language'] . "\";\n";
    echo "editorlanguagefile=\"" . getWizardfile($_SESSION['toolkits_language']) . "\";\n";
    echo "originalpathvariable=\"" . $xwd_url . "\";\n";
    echo "xwd_file_url=\"" . $xwd_file_url . "\";\n";
    echo "moduleurlvariable=\"" . $module_url . "\";\n";
    echo "template_id=\"" . $row_edit['template_id'] . "\";\n";
    echo "template_height=\"" . $temp[1] . "\";\n";
    echo "template_width=\"" . $temp[0] . "\";\n";
    echo "read_and_write=\"" . $read_status . "\";\n";
    echo "savepath=\"" . $xerte_toolkits_site->flash_save_path . "\";\n";
    echo "upload_path=\"" . $xerte_toolkits_site->flash_upload_path . "\";\n";
    echo "preview_path=\"" . $xerte_toolkits_site->flash_preview_check_path . "\";\n";
    echo "site_url=\"" . $xerte_toolkits_site->site_url . "\";\n";
    ?>

    function bunload(){

        path = "<?PHP echo $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/";?>";

        template = "<?PHP  echo $row_edit['template_id']; ?>";

        if(typeof window_reference==="undefined"){

            window.opener.edit_window_close(path,template);

        }else{

            window_reference.edit_window_close(path,template);

        }

    }
</script>
<script type="text/javascript" src="editor/js/data.js"></script>
<script type="text/javascript" src="editor/js/application.js"></script>
<script type="text/javascript" src="editor/js/toolbox.js"></script>
<script type="text/javascript" src="editor/js/language.js"></script>
<script type="text/javascript" src="editor/js/layout.js"></script>
<script type="text/javascript" src="editor/js/tree.js"></script>
</body>
</html>

<?php
}
?>


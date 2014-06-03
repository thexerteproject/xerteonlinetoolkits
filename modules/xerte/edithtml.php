<?php
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

    _load_language_file("/modules/xerte/edit.inc");

    $row_username = db_query_one("select username from {$xerte_toolkits_site->database_table_prefix}logindetails where login_id=?" , array($row_edit['user_id']));

    if(empty($row_username)) {
        die("Invalid user id ?");
    }

    /**
     * create the preview xml used for editing
     */

	$preview_filename = "preview.xml";

    $preview = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/preview.xml";

    $data    = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/data.xml";

    if(!file_exists($preview) && file_exists($data)){
        copy($data, $preview);
        chmod($preview, 0777);
    }

    //************ TEMPORARY ****************

    $preview2 = $xerte_toolkits_site->root_file_path . $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/preview2.xml";
    if(file_exists($preview2)) {
    	$preview_filename = "preview2.xml";
    }

    //***************************************

    $preview_url = $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/" . $preview_filename;

    $rlo_url = $media_url = $xerte_toolkits_site->site_url .  $xerte_toolkits_site->users_file_area_short . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'];

    $media_path = $xerte_toolkits_site->users_file_area_full . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'] . "/media/";

    $rlo_path = $xerte_toolkits_site->users_file_area_full . $row_edit['template_id'] . "-" . $row_username['username'] . "-" . $row_edit['template_name'];

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

    <title>Xerte Online Toolkits Editor</title>

    <link rel="stylesheet" href="//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
    <link rel="stylesheet" href="editor/js/vendor/themes/default/style.css" />
    <link rel="stylesheet" type="text/css" href="editor/css/complex.css" />
    <link rel="stylesheet" type="text/css" href="website_code/styles/xerte_buttons.css" />
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

    <div class="header">Optional parameters</div>

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
        <div class="content">
            <div id="mainPanel"></div>
            <div id="advancedPanel" style="display:none">
                <hr>
            </div>
            <div id="languagePanel" style="display:none">
                <hr>
            </div>
            <div id="insert_subnodes">

            </div>
        </div>
        <div id="main_footer" class="footer">
            <div id="checkbox_outer"><table><tr><td id="checkbox_holder"></td></tr></table></div>
        </div>
    </div>

<div id="insert-dialog" class="hide" title="Insert Page">
    <div id="insert-info">
        <img /><br />
        <span></span><br /><br />
        <div id="insert-buttons"><button>Insert Before</button>&nbsp;<button>Insert After</button>&nbsp;<button>Insert (at end)</button></div>
    </div>
    <div id="insert-menu"></div>
</div>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>
<script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/modernizr-latest.js"></script>
<script type="text/javascript" src="editor/js/vendor/jstree.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/ckeditor.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/adapters/jquery.js"></script>
<script type="text/javascript" src="editor/js/vendor/jscolor.js"></script>
<script type="text/javascript" src="editor/js/vendor/xml2json.min.js"></script>
<script>
    <?php
    $_SESSION['KCFINDER']= array(
        'disabled' => false,
        'uploadURL' => $rlo_url,
        'uploadDir' => $rlo_path
    );



    echo "xmlvariable=\"" . $preview_url . "\";\n";
    echo "mediavariable=\"" . $media_path . "\";\n";
    echo "mediaurlvariable=\"" . $media_url . "\";\n";
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


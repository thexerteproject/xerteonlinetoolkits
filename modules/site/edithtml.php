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

require_once (__DIR__ . "/../../website_code/php/themes_library.php");

/**
 * Created by PhpStorm.
 * User: tom
 * Date: 10-5-14
 * Time: 12:24
 */

function get_children ($parent_id, $lookup, $column, $type) {
    // children
    $children = array();
    //we are at a leaf level
    if (empty($lookup[$parent_id]['children'])){
        return $children;
    }
    foreach ($lookup[$parent_id]['children'] as $node) {
        $children[] = array('name' => $node[$column], 'value' => $node[$column], 'children' => get_children($node[$type], $lookup, $column, $type));
    }
    return $children;
}

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
    require_once("website_code/php/user_library.php");

    _load_language_file("/modules/xerte/edit.inc");

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
    $xwd_url = "modules/" . $row_edit['template_framework'] . "/parent_templates/" . $row_edit['parent_template'] . "/";
    $xwd_path = $xerte_toolkits_site->root_file_path . "/modules/" . $row_edit['template_framework'] . "/parent_templates/" . $row_edit['parent_template'] . "/";

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
     * Get sublist of pages (if any)
     */
    $template_sub_pages = array("page");
    $simple_lo_page = get_template_simple_lo_page($row_edit['template_id']);
    $disable_advanced = get_template_disable_advanced($row_edit['template_id']);
    $simple_mode = $simple_lo_page;

	/**
     * build an array of available themes for this template
     */
    $ThemeList = get_themes_list($row_edit['parent_template']);

    /**
     * Build CategoryList with hierarchy
     */
    $sql = "select category_id, category_name, parent_id from {$xerte_toolkits_site->database_table_prefix}syndicationcategories";
    $categories = db_query($sql);
    $lookup = array();
    foreach ($categories as $node){
        $node['children'] = array();
        $lookup = $lookup + array($node['category_id'] => $node);
    }
    foreach ($lookup as $node){
        if ($node['parent_id'] != null){
            $lookup[$node['parent_id']]['children'][] = $node;
        }
    }

    $parsed_categories = array();
    foreach ($lookup as $value){
        //find all tree origins
        if ($value['parent_id'] == null) {
            //add node and all its children recursively
            $node = array('name' => $value['category_name'], 'value' => $value['category_name'], 'children' => get_children($value['category_id'], $lookup, 'category_name', 'category_id'));
            $parsed_categories[] = $node;
        }
    }

    /**
     * Build EducationList
     */
    $sql = "select educationlevel_id, educationlevel_name, parent_id from {$xerte_toolkits_site->database_table_prefix}educationlevel order by parent_id asc";
    $educationlevels = db_query($sql);

    $lookup = array();
    foreach ($educationlevels as $node){
        $node['children'] = array();
        $lookup = $lookup + array($node['educationlevel_id'] => $node);
    }
    foreach ($lookup as $node){
        if ($node['parent_id'] != null){
            $lookup[$node['parent_id']]['children'][] = $node;
        }
    }

    $parsed_educationlevels = array();
    foreach ($lookup as $value){
        //find all tree origins
        if ($value['parent_id'] == null) {
            //add node and all its children recursively
            $node = array('name' => $value['educationlevel_name'], 'value' => $value['educationlevel_name'], 'children' => get_children($value['educationlevel_id'], $lookup, 'educationlevel_name', 'educationlevel_id'));
            $parsed_educationlevels[] = $node;
        }
    }

    /**
     * Build Grouping List
     */
    $sql = "select * from `{$xerte_toolkits_site->database_table_prefix}grouping` order by grouping_name asc";
    $grouping = db_query($sql);

    /**
     * Build Course List
     */
    $sql = "select * from {$xerte_toolkits_site->database_table_prefix}course order by course_name asc";
    $course = db_query($sql);

    /**
     * sort of the screen sies required for the preview window
     */

    $temp = explode("~",get_template_screen_size($row_edit['template_name'],$row_edit['template_framework']));

    $version = getVersion();


    /* Set flag of whther oai-pmh harvesting is configured and available */
    $oai_pmh = file_exists($xerte_toolkits_site->root_file_path . "oai-pmh/oai_config.php");
    $user_roles = getRolesFromUser($_SESSION['toolkits_logon_id']);
    if ($_SESSION['toolkits_logon_id'] === "site_administrator")
    {
        $user_roles = array("super");
    }

    $body_class = "";
    if ($xerte_toolkits_site->rights == 'elevated')
    {
        $body_class = ' class="elevated"';
    }
?>
<!DOCTYPE html>
<html lang="<?php echo $_SESSION['toolkits_language'];?>">
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Xerte Online Toolkits Editor</title>
    
		<link rel="icon" href="favicon_edit.ico" type="image/x-icon">
		<link rel="shortcut icon" href="favicon_edit.ico" type="image/x-icon">

    <link rel="stylesheet" href="editor/css/jquery-ui.css?version=<?php echo $version;?>">
    <link rel="stylesheet" href="editor/js/vendor/themes/default/style.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" type="text/css" href="website_code/styles/xerte_buttons.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" type="text/css" href="editor/css/complex.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" type="text/css" href="editor/css/fonts.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" type="text/css" href="editor/js/vendor/imgareaselect/imgareaselect-default.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" type="text/css" href="editor/js/vendor/jqgrid/css/ui.jqgrid.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" type="text/css" href="editor/js/vendor/ckeditor/plugins/codemirror/css/codemirror.min.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" href="editor/js/vendor/treeselect/treeselectjs.css" />
    <!--link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'-->
    <?php
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
    {
        ?>
        <link href='branding/branding.css' rel='stylesheet' type='text/css'>
        <?php
    }
    else {
        ?>
        <?php
    }
    ?>
    <script src="website_code/scripts/template_management.js?version=<?php echo $version;?>"></script>
    <!--[if lte IE 7]>
    <style type="text/css"> body { font-size: 85%; } </style>
    <![endif]-->

</head>
<body <?php echo $body_class; ?> >
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
        <?php
        if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_left.png"))
        {
            echo "<img src=\"branding/logo_left.png\" style=\"float:left\" />";
        }
        else {
            echo "<img src=\"website_code/images/logo.png\" style=\"float:left\" />";
        }
        if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_right.png"))
        {
            echo "<img src=\"branding/logo_right.png\" style=\"float:right\" />";
        }
        else {
            echo "<img src=\"website_code/images/apereoLogo.png\" style=\"float:right\" />";
        }
        ?>
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
            <div id="subPanels">
                <div id="languagePanel" style="display:none">
                    <hr>
                </div>
                <div id="insert_subnodes">

                </div>
                <div class="nodeInfo" id="info">

                </div>
            </div>
        </div>
        <div id="main_footer" class="footer">
            <div id="checkbox_outer"><table><tr><td id="checkbox_holder"></td></tr></table></div>
        </div>
    </div>

<div id="shadow" class="dark" class="hide"></div>
<div id="insert_menu" class="hide"></div>

<!--script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script-->
<!--script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script-->
<script src="editor/js/vendor/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/modernizr-latest.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/jstree.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/ckeditor.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/adapters/jquery.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/jscolor.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/xml2json.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/imgareaselect/jquery.imgareaselect.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/jqgrid/js/jquery-migrate-1.2.1.js"></script>
<script type="text/javascript" src="<?php echo $jqgridlangfile; ?>"></script>
<script type="text/javascript" src="editor/js/vendor/jqgrid/js/jquery.jqGrid.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/jsep.min.js?version=<?php echo $version;?>"></script>
<script type="module" src="editor/js/vendor/treeselect/treeselectjs.mjs.js"></script>
<!-- Load latest font awesome after ckeditor, other wise the latest fontawesome is overruled by the fontawsome plugin of ckeditor -->
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/all.min.css">
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v4-shims.min.css">
<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-6.6.0/css/v5-font-face.min.css">

<!-- load exactly the same codemirror scripts as needed by ckeditor -->
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.addons.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.mode.htmlmixed.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.mode.javascript.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/beautify.min.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.addons.search.min.js?version=<?php echo $version;?>"></script>

<script>
    <?php
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
    echo "category_list=" . json_encode($parsed_categories) . ";\n";
    echo "educationlevel_list=" . json_encode($parsed_educationlevels) . ";\n";
    echo "grouping_list=" . json_encode($grouping) . ";\n";
    echo "course_list=" . json_encode($course) . ";\n";
    echo "simple_mode=" . ($simple_mode ? "true" : "false") . ";\n";
    echo "template_sub_pages=" . json_encode($template_sub_pages) . ";\n";
    echo "simple_lo_page=" . ($simple_lo_page ? "true" : "false") . ";\n";
    echo "disable_advanced=" . ($disable_advanced ? "true" : "false") . ";\n";

    echo "oai_pmh_available=" . ($oai_pmh ? "true" : "false") . ";\n";
    echo "roles=" . json_encode($user_roles) . ";\n";

    // Some upgrade.php in teh past prevented the course_freetext_enabled column to be set correctly in the sitedetails table
    // If not present, set to true
    if (!isset($xerte_toolkits_site->course_freetext_enabled))
    {
        echo "course_freetext_enabled=true;\n";
    }
    else {
        echo "course_freetext_enabled=" . ($xerte_toolkits_site->course_freetext_enabled == 'true' ? 'true' : 'false') . ";\n";
    }
    echo "templateframework=\"" . $row_edit['template_framework'] . "\";\n";
    echo "theme_list=" . json_encode($ThemeList) . ";\n";
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

    let TreeSelect;
    (async()=>{
        const { Treeselect } = await import(site_url + "editor/js/vendor/treeselect/treeselectjs.mjs.js");
        TreeSelect = Treeselect;
    })();

</script>
<script type="text/javascript" src="editor/js/data.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/application.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/toolbox.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/language.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/layout.js?version=<?php echo $version;?>"></script>
<script type="text/javascript" src="editor/js/tree.js?version=<?php echo $version;?>"></script>

</body>
</html>

<?php
}
?>


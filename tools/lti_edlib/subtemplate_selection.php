<?php
require_once (dirname(__FILE__) . "/../../config.php");
require_once ('subtemplate.php');

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}

_debug("item_selection SESSIE : " . print_r($_SESSION , true));


if (isset($raw_post_array['content_item_return_url'])) {
    $content_item_return_url = x_clean_input($raw_post_array['content_item_return_url'], 'string');
} else {
    $content_item_return_url = "";
}
$_SESSION['content_item_return_url'] = $content_item_return_url;

$prefix = $xerte_toolkits_site->database_table_prefix;
//todo enable for subtemplates
//$q = "select * from {$prefix}originaltemplatesdetails where active=1 and template_name != parent_template";
$q = "select * from {$prefix}originaltemplatesdetails where active=1";
$result = db_query($q);

if ($result === false || count($result) == 0) {
    die("no active sub templates");
}

$subtemplate_list = [];
foreach ($result as $subtemplate_data){
    $subtemplate_list[] = new SubTemplate($subtemplate_data);
}

$template_url = $xerte_toolkits_site->site_url . (isset($lti_enabled) && $lti_enabled && function_exists('addSession') ? addSession("website_code/php/templates/new_template.php") . "&tsugisession=0" : "website_code/php/templates/new_template.php");
$edit_url = $xerte_toolkits_site->site_url . (isset($lti_enabled) && $lti_enabled && function_exists('addSession') ? addSession("edithtml.php") . "&tsugisession=0" : "edithtml.php");

//todo turn into propper ui element
?>
<!DOCTYPE html>
<html>
<head>
    <link href="/website_code/styles/edlib.css" type="text/css" rel="stylesheet" />
    <script src="/website_code/scripts/edlib_utilities.js"></script>
    <script src="/website_code/scripts/template_management.js"></script>
    <script src="/website_code/scripts/ajax_management.js"></script>
    <script src="/website_code/scripts/validation.js"></script>
    <script src="/modules/site/parent_templates/site/common/js/jquery.js"></script>
    <?php
    echo '<script> var template_url ="' . $template_url . '";</script>';
    echo '<script> var edit_url ="' . $edit_url . '";</script>';
    ?>

</head>
<body>
<div id="editor_space">
    <div id="ui_space"></div>
    <iframe id="editor_iframe"></iframe>
</div>

<div id="selector_space">
    <form>
        <label for="template_name_input_field" style="font-weight: bold;">Template name:</label>
        <input id="template_name_input_field" type="text" name="template_name">
    </form>

    <div class="border-wrapper">
        <table>
            <thead>
            <tr>
                <th>Image</th>
                <th>Template</th>
                <th>Description</th>
                <th>Action</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($subtemplate_list as $subtemplate): ?>
                <?php echo $subtemplate->ui_element(); ?>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>

</html>


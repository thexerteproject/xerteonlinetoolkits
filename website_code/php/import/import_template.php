<?php

require_once(dirname(__FILE__) . "/../../../config.php");

require_once(dirname(__FILE__) . "/../dUnzip2.inc.php");

/**
 * 
 * Import template, imports a new blank template for the site
 *
 * @author Patrick Lockley, Tom Reijnders
 * @version 1.1
 * @copyright Copyright (c) 2008,2009,2011 University of Nottingham
 * @package
 */
require_once(dirname(__FILE__) . '/util.php');

if (empty($_SESSION['toolkits_logon_id'])) {
    die("You need to be logged in");
}

if (empty($_FILES['filenameuploaded'])) {
    die("Invalid upload (1)");
}

if (($_FILES['filenameuploaded']['type'] != "application/x-zip-compressed") &&
        ($_FILES['filenameuploaded']['type'] != "application/zip")) {
    die("Invalid upload (2)");
}

// Make sure the file name doesn't contain any funky characters - e.g. / or perhaps unicode which will confuse things.
// This regexp probably rules out brackets e.g Copy of Foo (1).zip which is quite common.
if (preg_match('![^-a-z0-9_\.]!i', $_FILES['filenameuploaded']['name'])) {
    die("Supplied file name contains invalid characters, remove any non-alphanumerics and retry.");
}

_load_language_file("/website_code/php/import_template.inc");

// Clean uploaded file name. Remove non-(alphanumerics or - or . characters).
// as we use the user's provided file name later on in file paths etc.
$userProvidedFileName = $_FILES['filenameuploaded']['name'];

// Create a unique, random, temporary directory.
$temp_dir = tempdir();
$zip_file = $temp_dir . DIRECTORY_SEPARATOR . $userProvidedFileName;

// Copy the uploaded file into the tempdir, unzip it and then remove it.
if (@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $zip_file)) {
    $zip = new dUnzip2($zip_file);
    $zip->debug = false;
    $zip->getList();
    $zip->unzipAll($temp_dir);
    $zip->close();
    unlink($zip_file);
} else {
    _debug("Upload of template failed - " . print_r($_FILES, true));
    die("Upload failed - couldn't process uploaded file. ($new_file_name) ");
}

// XXX: What should $_POST['folder'] look like? Presumably something like 'Nottingham'.
if (!empty($_POST['folder'])) {
    /*
     * We are replacing, so delete files
     */
    $unsafe_folder = $_POST['folder'];
    // Security - make sure it's not $folder = "/../../../etc" or similar.
    $folder = preg_replace('/[^a-z0-9\-\_]/i', '', $unsafe_folder);
    _debug("replacing file(s) in {$folder} - initial clearup...");
    if (!empty($folder)) {
        recursive_delete($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/", true);
        recursive_delete($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/", true);
    } else {
        _debug("Can't delete empty \$folder - $folder ...");
    }
} else {
    // So we we don't have $_POST['folder'], look for a directory related to the uploaded zip file name.
    // i.e. FooBar.zip creates FooBar/
    $folder = basename(substr($zip_file, 0, -4));

    if (!dir_exists($temp_dir . DIRECTORY_SEPARATOR . $folder)) {
        _debug("Couldn't find folder name from the zip name - $temp_dir / $userProvidedFileName / $zip_file etc; aborting");
        recursive_delete($temp_dir, true);
        die(IMPORT_TEMPLATE_ZIP_FAIL . "****");
    }


    $rlt_found = false;
    $templateRlt = $temp_dir . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . 'template.rlt';
    if (file_exists($templateRlt)) {
        $xml = @simplexml_load_file($templateRlt);
        if ($xml) {
            $folder = $xml['targetFolder'];
            $name = $xml['name'];
            $desc = $xml['description'];
            _debug("Uploading template -- $folder / $name / $desc");
            $rlt_found = true;
        }
        // This looks like some weird XML parsing.
        /* $folder = substr(substr($string, strpos($string, "targetFolder=") + 14), 0, strpos(substr($string, strpos($string, "targetFolder=") + 14), "\""));
          $name = substr(substr($string, strpos($string, "name=") + 6), 0, strpos(substr($string, strpos($string, "name=") + 6), "\""));
          $desc = substr(substr($string, strpos($string, "description=") + 13), 0, strpos(substr($string, strpos($string, "description=") + 13), "\""));

         */
    }

    if (!$rlt_found) {
        recursive_delete($temp_dir, true);
        die(IMPORT_TEMPLATE_RLT_FAIL . "****");
    }
}


if ($_POST['folder'] == "" && strlen($folder) > 0) {

    /*
     * Make all the new folders
     */

    $parent = fileperms($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/");
    $templates = fileperms($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/");

    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/", 0777);
    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/", 0777);

    @mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/");
    @mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/common/");
    @mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/thumbs/");
    @mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/models/");
    @mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/");
    @mkdir($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/media/");

    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/", 0777);
    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/common/", 0777);
    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/thumbs/", 0777);
    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/" . $folder . "/models/", 0777);
    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/", 0777);
    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/" . $folder . "/media/", 0777);

    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/parent_templates/", $parent);
    @chmod($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->module_path . "xerte/templates/", $templates);
}


$xerte_module_path = $xerte_toolkits_site->root_file_path . DIRECTORY_SEPARATOR . $xerte_toolkits_site->module_path;

foreach (array('media', 'thumbs', 'common', 'models') as $toplevel) {
    // Get all files in the temp (exploded zip's) import $toplevel dir.
    $toplevel_src_path = $temp_dir . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $toplevel;
    $files_to_move = get_recursive_file_list($toplevel_src_path);

    // Move them to the xerte/templates/$folder/$toplevel dir.
    $destination = $xerte_module_path . "xerte/templates/" . $folder . "/$toplevel/";
    // 'media' is the odd one out in going to parent_templates, the rest just go to templates.
    if ($toplevel == "media") {
        $destination = $xerte_module_path . "xerte/parent_templates/" . $folder . "/$toplevel/";
    }

    foreach ($files_to_move as $file) {
        @rename($file, $destination . $file);
    }

    // Now remove all the (media|thumbs|common|models) files.
    recursive_delete($toplevel_src_path, true);
}

$template_src = $temp_dir . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR;

rename($template_src . "template.rlt", $xerte_module_path . "xerte/parent_templates/" . $folder . "/" . $folder . ".rlt");
rename($template_src . "template.xml", $xerte_module_path . "xerte/templates/" . $folder . "/data.xml");
rename($template_src . "template.xwd", $xerte_module_path . "xerte/parent_templates/" . $folder . "/data.xwd");

// Remove anything now left.
recursive_delete($temp_dir, true);


if($_POST['folder'] == "") {
    /*
     * No folder was posted, so add records to the database id.
     */
    _debug("Adding template to database ($folder/ $desc/ $name etc)");
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $sql = "INSERT INTO {$prefix}originaltemplatedetails 
            (template_framework, template_name, description, date_uploaded, display_name, display_id, access_rights, active)
            VALUES (?,?,?,?,?,?,?,?)";
  
    $parameters = array('xerte', $folder, $desc, date('Y-m-d'), $name, '0', '', 'false');
    $ok = db_query($sql, $parameters);

    if ($ok) {
        receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);
        echo IMPORT_TEMPLATE_FOLDER_CREATE . "****";
        _debug("template saved to db ok; import presumably ok.");
    } else {
        receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);
        echo IMPORT_TEMPLATE_FOLDER_FAIL . "****";
        _debug("template failed to save to db");
    }
}

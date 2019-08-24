<?php
/**
 * Created by PhpStorm.
 * User: Akshay
 * Date: 10/17/2018
 * Time: 3:12 PM
 */
include ('../xmlInspector.php');

require_once("../../../config.php");

//error_reporting(E_ALL);
//ini_set('display_errors', 1);

_load_language_file("/website_code/php/management/upload.inc");

global $xerte_toolkits_site;
$prefix = $xerte_toolkits_site->database_table_prefix;

if($_FILES['fileToUpload']['error'] == 4)
{
    exit(TEMPLATE_UPLOAD_NO_FILE_SELECTED);
}

if($_FILES["fileToUpload"]["name"])
{
    $filename =  $_FILES["fileToUpload"]["name"];
    $filename_parts = explode(".", $_FILES["fileToUpload"]["name"]);

    if (isset($_POST["templateName"]) && $_POST["templateName"] != "")
    {
        $name = $_POST['templateName'];
    }
    else
    {
        $name = $filename_parts[0];
    }
    // Replace spaces etc
    $name = preg_replace("/[^0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_]/u", "_", $name);

    if (isset($_POST["templateDisplayname"]) && $_POST["templateDisplayname"] != "")
    {
        $displayname = $_POST["templateDisplayname"];
    }
    else
    {
        $displayname = $name;
    }
    if (isset($_POST["templateDescription"]) && $_POST["templateDescription"] != "")
        {
        $description = $_POST["templateDescription"];
    }
    else
    {
        $description = "";
    }

    $source = $_FILES["fileToUpload"]["tmp_name"];
    $temp_loc = dirname($source);
    $type = $_FILES["fileToUpload"]["type"];
    $importpath = $xerte_toolkits_site->import_path . $name . "/";
    mkdir($importpath, 0755);

    $importfile = $importpath . $filename;

    $isZip = strtolower($filename_parts[1]) == 'zip' ? true : false;
    $success = true;

    if (!$isZip)
    {
        $success = false;
        unlink($source);
        exit(TEMPLATE_UPLOAD_INCORRECT_FILE_TYPE);
    }
    if ($success && move_uploaded_file($source, $importfile))
    {
        $zip = new ZipArchive();
        $x = $zip->open($importfile);

        $templateFound = false;
        $mediaFound = false;
        $templateXML = "";
        //Loop through all the files in the zip
        for ($i = 0; $i < $zip->numFiles; $i++)
        {
            //One file in the zip on index "i"
            $stat = $zip->statIndex($i);
            //check if the zip file contains a template.xml
            if ($stat["name"] === "template.xml")
            {
                $templateFound = true;
                //$templateXML = file_get_contents($temp_loc . DIRECTORY_SEPARATOR . "template.xml");
            }
            if (strpos($stat["name"], 'media/') !== false)
            {
                $mediaFound = true;
            }
        }

        if($templateFound === true && $mediaFound === true)
        {
            $zip->extractTo($importpath);
            $zip->close();

            $templateXML = file_get_contents($importpath . DIRECTORY_SEPARATOR . "template.xml");

            $targetFolder = returnTargetFolderName($templateXML);
            if ($targetFolder == "")
            {
                $zip->close();
                rrmdir($importpath);
                exit(TEMPLATE_UPLOAD_CANT_DETERMINE_PARENT_TEMPLATE);
            }
            $row = returnParentObject($targetFolder);
            $template_location = $xerte_toolkits_site->basic_template_path . $row['template_framework'] . DIRECTORY_SEPARATOR . 'templates'. DIRECTORY_SEPARATOR;
            $path = $template_location . $name;

            if (count($row) == 0)
            {
                $zip->close();
                rrmdir($importpath);
                $mesg = str_replace("{0}", $targetFolder, TEMPLATE_UPLOAD_INVALID_PARENT_TEMPLATE);
                exit($mesg);
            }
            if(checkParent($name) === true)
            {
                $zip->close();
                rrmdir($importpath);
                exit(TEMPLATE_UPLOAD_CANT_UPLOAD_PARENT);
            }

            if (!is_dir($template_location . $name))
            {
                mkdir($template_location . $name, 0755);
            }


            copy($importpath . "template.xml", $template_location . $name . DIRECTORY_SEPARATOR . "data.xml");

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($importpath . "media", \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::SELF_FIRST);

            if (!is_dir($template_location . $name . DIRECTORY_SEPARATOR . "media"))
            {
                mkdir($template_location . $name . DIRECTORY_SEPARATOR . "media", 0755);
            }

            foreach ($iterator as $item)
            {
                if (is_dir($item))
                {
                    if (!is_dir($template_location . $name . DIRECTORY_SEPARATOR . "media" . DIRECTORY_SEPARATOR . $iterator->getSubPathName()))
                    {
                        mkdir($template_location . $name . DIRECTORY_SEPARATOR . "media" . DIRECTORY_SEPARATOR . $iterator->getSubPathName(), 0755);
                    }
                }
                else
                {
                    copy($item, $template_location . $name . DIRECTORY_SEPARATOR . "media" . DIRECTORY_SEPARATOR . $iterator->getSubPathName());
                }
            }
            $success = true;
        }
        else if($templateFound === false || $mediaFound === false)
        {
            $zip->close();
            rrmdir($importpath);
            if($templateFound === false)
            {
                exit(TEMPLATE_UPLOAD_HAS_NO_TEMPLATE_XML);
            }
            if($mediaFound === false)
            {
                exit(TEMPLATE_UPLOAD_HAS_NO_MEDIA);
            }
        }
        if($success && $templateFound === true && $mediaFound === true)
        {
            // Check if already exists
            $q = "select * from {$prefix}originaltemplatesdetails where template_name=?";
            $param = array($name);

            $subtemplates = db_query($q, $param);
            if (count($subtemplates) == 0) {
                // Insert record
                $query = "INSERT INTO {$prefix}originaltemplatesdetails"
                    . "(template_framework, template_name, parent_template, description, date_uploaded, display_name, display_id, access_rights, active)"
                    . "VALUES(?,?,?,?,?,?,?,?,?)";
                $param = array($row['template_framework'], $name, $row['template_name'], $description, date("Y-m-d H:i:s"), $displayname, $row['display_id'], $row['access_rights'], $row['active']);

                $lastId = db_query($query, $param);
            }
            else{
                // Update record
                $query = "UPDATE {$prefix}originaltemplatesdetails"
                    . "set description=?, displayname=?, date_uploaded=?, access=? where template_name=?";
                $param = array($description, $displayname, date("Y-m-d H:i:s"), $row['access_rights'], $name);
                $db_query = db_query($query, $param);
            }

            $infoContents = returnInfoFile($row['template_framework'], $row['template_name']);

            $contents = editInfoFile($infoContents, $name, $description);

            createInfoFile($template_location, $name, $contents);
            rrmdir($importpath);

            exit(TEMPLATE_UPLOAD_FILE_UPLOAD_SUCCESS);
        }
    }
    else
    {
        exit(TEMPLATE_UPLOAD_FILE_CANT_BE_UPLOADED);
    }
}

function returnTargetFolderName($templateXML)
{
    if($templateXML == null)
    {
        return "";
    }

    $dom = new DOMDocument();
    $dom->loadXML($templateXML);

    $learningObject = $dom->getElementsByTagName('learningObject')->item(0);

    return (string)$learningObject->getAttribute('targetFolder');
}

function returnParentObject($targetFolder)
{
    if($targetFolder == null)
    {
        return 0;
    }

    $query = "SELECT * FROM `originaltemplatesdetails` WHERE template_name=?";
    $params = array($targetFolder);

    $row = db_query_one($query, $params);

    return $row;

}

function rrmdir($src) {
    if ($src != "") {
        $dir = opendir($src);
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                $full = $src . '/' . $file;
                if (is_dir($full)) {
                    rrmdir($full);
                } else {
                    unlink($full);
                }
            }
        }
        closedir($dir);
        rmdir($src);
    }
}

function returnInfoFile($parentTemplateFramework, $parentTemplateName)
{
    global $xerte_toolkits_site;

    $parentInfo = $parentTemplateName . ".info";

    $path = $xerte_toolkits_site->basic_template_path . $parentTemplateFramework . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . $parentTemplateName . DIRECTORY_SEPARATOR . $parentInfo;

    $file = file_get_contents($path);

    return $file;

}

function editInfoFile($infoContents, $displayName, $description)
{

    $contents = explode(PHP_EOL, $infoContents);
    $keyvaluepairs = array();
    foreach($contents as $content)
    {
        $keyvalue = explode(": ", $content, 2);
        $keyvaluepairs[$keyvalue[0]] = $keyvalue[1];
    }

    $keyvaluepairs["display name"] = $displayName;
    $keyvaluepairs["description"] = $description;

    $list = array();
    foreach($keyvaluepairs as $key => $value)
    {
        array_push($list, $key . ": " . $value);
    }
    $list = implode(PHP_EOL, $list);

    return $list;
}

function createInfoFile($dir, $templateName, $content)
{
    $file = fopen($dir . $templateName . DIRECTORY_SEPARATOR . $templateName . ".info" , 'w');
    fwrite($file, $content);
    fclose($file);
}

function deleteZip($dir, $templateName)
{
    $files = glob($dir . '*');

    foreach($files as $file)
    {
        if(strpos($file, $templateName . ".zip") !== false)
        {
            unlink($file);
        }
    }
}

function checkParent($templateName)
{
    if($templateName == null)
    {
        return 0;
    }

    $query = "SELECT * FROM `originaltemplatesdetails` WHERE template_name=?";
    $params = array($templateName);

    $row = db_query_one($query, $params);

    if(strcasecmp($templateName, $row['parent_template']) === 0)
    {
        return true;
    }

    return false;
}




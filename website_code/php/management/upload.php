<?php
/**
 * Created by PhpStorm.
 * User: Akshay
 * Date: 10/17/2018
 * Time: 3:12 PM
 */

include ('../xmlInspector.php');

require_once("../../../config.php");

error_reporting(E_ALL);
ini_set('display_errors', 1);



_load_language_file("/website_code/php/management/upload.inc");

global $xerte_toolkits_site;

if($_FILES["fileToUpload"]["name"]) {
    $name = explode(".", $_FILES["fileToUpload"]["name"]);

    if ($_POST["templateName"] == null) {
        $filename = $_FILES["fileToUpload"]["name"];
    } else {
        $filename = $_POST['templateName'];
        $filename .= "." . $name[1];
        $name = explode(".", $filename);
    }

    if($_POST["templateDescription"] != null)
    {
        $description = $_POST["templateDescription"];
    }


    $source = $_FILES["fileToUpload"]["tmp_name"];
    $temp_loc = dirname($source);
    $type = $_FILES["fileToUpload"]["type"];
    $template_location = "C:/Users/Akshay/Desktop/test/";
    $path = $template_location . $filename;

    $isZip = strtolower($name[1]) == 'zip' ? true : false;
    $success = true;

    if (!$isZip) {
        $message = UPLOAD_INCORRECT_FILE_TYPE;
        $success = false;
    }
    if ($success && move_uploaded_file($source, $path))
    {
        $zip = new ZipArchive();
        $x = $zip->open($path);

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
                $templateXML = file_get_contents($temp_loc . DIRECTORY_SEPARATOR . "template.xml");
            }
            if (strpos($stat["name"], 'media/') !== false)
            {
                $mediaFound = true;
            }

        }
        if($templateFound === true && $mediaFound === true)
        {
            if (!is_dir($template_location . $name[0]))
            {
                mkdir($template_location . $name[0], 0755);
            }
            $zip->extractTo($temp_loc);
            $zip->close();


            copy($temp_loc . DIRECTORY_SEPARATOR . "template.xml", $template_location . $name[0] . DIRECTORY_SEPARATOR . "template.xml");

            $xml = new XerteXMLInspector();
            //Is false als hij niet correct is, NULL is wel correct
            $exists = $xml->loadTemplateXML($template_location . $name[0] . "/" . $stat['name']);



            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($temp_loc . DIRECTORY_SEPARATOR . "media", \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::SELF_FIRST);

            if (!is_dir($template_location . $name[0] . DIRECTORY_SEPARATOR . "media"))
            {
                mkdir($template_location . $name[0]. DIRECTORY_SEPARATOR . "media", 0755);
            }

            foreach ($iterator as $item)
            {
                copy($item, $template_location . $name[0]. DIRECTORY_SEPARATOR . "media" . DIRECTORY_SEPARATOR . $iterator->getSubPathName());
            }

        }
        if($success && $templateFound === true && $mediaFound === true)
        {
            $row = returnParentObject(returnTargetFolderName($templateXML));

            $query = "INSERT INTO `originaltemplatesdetails`"
                      . "(template_framework, template_name, parent_template, description, date_uploaded, display_name, display_id, access_rights, active)"
                      . "VALUES(?,?,?,?,?,?,?,?,?)";
            $param = array($row['template_framework'], $name[0], $row['template_name'], $description, date("Y-m-d H:i:s"), $row['display_name'], $row['display_id'], $row['access_rights'], $row['active']);

            $lastId = db_query($query, $param);
            $infoContents = returnInfoFile($row['template_framework'], $row['template_name']);

            editInfoFile($infoContents, $name[0], $description);

        }
    }
}

function returnTargetFolderName($templateXML)
{
    if($templateXML == null)
    {
        return 0;
    }

    $dom = new DOMDocument();
    $dom->loadXML($templateXML);

    $learningObject = $dom->getElementsByTagName('learningObject')->item(0);

    return $learningObject->getAttribute('targetFolder');
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

?>



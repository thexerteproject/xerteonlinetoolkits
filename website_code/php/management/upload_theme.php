<?php

require_once("../../../config.php");
require_once("../user_library.php");
require_once("../folder_library.php");



error_reporting(E_ALL);
ini_set('display_errors', 1);

_load_language_file("/website_code/php/management/upload_theme.inc");

global $xerte_toolkits_site;
$prefix = $xerte_toolkits_site->database_table_prefix;

if (!is_user_permitted("templateadmin"))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

if (!function_exists('str_ends_with')) {
    function str_ends_with($str, $end) {
        return (@substr_compare($str, $end, -strlen($end))==0);
    }
}

if($_FILES['fileToUpload']['error'] == 4)
{
    exit(THEME_UPLOAD_NO_FILE_SELECTED);
}

if($_FILES["fileToUpload"])
{
    #extract zip


    #check for themename.info file
    #check for folder
    #place folder

    $source = $_FILES["fileToUpload"]["tmp_name"];
    x_check_path_traversal_newpath($source, null, "Invalid file specified");
    $temp_loc = dirname($source);
    $type = $_FILES["fileToUpload"]["type"];

    $importpath = $xerte_toolkits_site->root_file_path . "themes/";
    $theme_type = x_clean_input($_POST['themeType']);
    $filename_parts = explode(".", x_clean_input($_FILES["fileToUpload"]["name"]));
    $importpath = $importpath . $theme_type . '/';
    $importfile = $importpath . "tmp_theme_storage.zip";

    $isZip = strtolower($filename_parts[1]) == 'zip' ? true : false;
    $success = true;

    //keep
    if (!$isZip)
    {
        $success = false;
        unlink($source);
        exit(THEME_UPLOAD_INCORRECT_FILE_TYPE);
    }

    if ($success && move_uploaded_file($source, $importfile))
    {
        $zip = new ZipArchive();
        $x = $zip->open($importfile);
        x_check_zip($zip, 'theme_package');
        $infoFound = false;
        $folderFound = false;
        $otherFound = false;
        $themeName = '';
        //Loop through all the files in the zip
        for ($i = 0; $i < $zip->numFiles; $i++)
        {
            //One file in the zip on index "i"
            $stat = $zip->statIndex($i);
            //check if the zip file contains a .info file
            if (str_ends_with( $stat["name"] , ".info"))
            {
                $infoFound = true;
                $otherFound = true;
                $themeName = substr($stat["name"], 0, -5);
            }
            else if (!$stat["size"])
            {
                $folderFound = true;
            }
            else{
                $otherFound = true;
            }
        }
        ## check for folder struct
        $themeNameParts = explode('/', $themeName);
        if($infoFound === true)
        {
            #check if it already exists
            if (is_dir($importpath . end($themeNameParts))){
                #discard old theme
                rrmdir($importpath . end($themeNameParts));
            }
            if (count($themeNameParts) === 2 and $themeNameParts[0] === $themeNameParts[1]) {
                ##folder struct is correct
                $zip->extractTo($importpath);
            } else if (count($themeNameParts) === 1) {
                ##folder missing
                mkdir($importpath . $themeNameParts[0], 0755);
                $zip->extractTo($importpath . $themeNameParts[0]);
            } else if (count($themeNameParts) === 2 and $themeNameParts[0] !== $themeNameParts[1]) {
                ##folder has not the same name as info file
                $zip->extractTo($importpath);
                $old_dir_name = $importpath . $themeNameParts[0];
                $new_dir_name = $importpath . $themeNameParts[1];
                rename($old_dir_name, $new_dir_name);
            } else {
                ##the zip has a bad structure
                exit(THEME_UPLOAD_WRONG_STRUCT);
            }

            $zip->close();
            deleteZip($importpath, "tmp_theme_storage");

            exit(THEME_UPLOAD_FILE_UPLOAD_SUCCESS);
        }
        else if($infoFound === false )
        {
            $zip->close();
            exit(THEME_UPLOAD_HAS_NO_INFO);
        }
    }
    else
    {
        exit(THEME_UPLOAD_FILE_CANT_BE_UPLOADED);
    }
}


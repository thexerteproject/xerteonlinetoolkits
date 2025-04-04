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
 *
 * media and quota template, specifies which files in the media folder are in use so they can be deleted
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
require_once("../xmlInspector.php");

_load_language_file("/website_code/php/properties/media_and_quota_template.inc");
_load_language_file("/properties.inc");

include "../template_status.php";
include "../user_library.php";

$temp_dir_path="";
$temp_new_path="";

$quota=0;

/**
 *
 * Function in use
 * This function copies files from one folder to another (does not move - copies)
 * @param string $file_name - the file name we are checking for
 * @return bool - true or false if the file is found
 * @version 1.0
 * @author Patrick Lockley
 */


$result_string = array();

$delete_string = array();

/**
 *
 * Function media folder loop
 * This function copies files from one folder to another (does not move - copies)
 * @param string $folder_name - path to the media folder to loop through
 * @version 1.0
 * @author Patrick Lockley
 */

function media_folder_loop($folder_name){

    global $dir_path, $new_path, $temp_dir_path, $temp_new_path, $quota, $result_string, $delete_string, $xerte_toolkits_site, $end_of_path, $dataInspector, $previewInspector;

    $d = opendir($dir_path . $folder_name);

    while($f = readdir($d)){

        $full = $dir_path . $folder_name . $f;

        if(!is_dir($full)){

            /**
             * Create the string that the function will return
             */
            $path = $xerte_toolkits_site->site_url . $xerte_toolkits_site->users_file_area_short . $end_of_path . "/media/" . $folder_name . $f;
            $buttonlbl = MEDIA_AND_QUOTA_DOWNLOAD;
			
			$result = new stdClass();
            $result->filename = $folder_name . $f;
			
            if($dataInspector->fileIsUsed($folder_name . $f) || $previewInspector->fileIsUsed($folder_name . $f)){
                $result->html = "<tr><td class=\"filename found\"><button class=\"filenameBtn\" onclick=\"setup_download_link('" . $path . "', '" . $buttonlbl . "', '" . $end_of_path . "/media/" . $folder_name . $f . "')\">" . $folder_name . $f . "</button></td><td class=\"filesize found\">" . substr((filesize($full)/1000000),0,4) . " MB</td><td class=\"fileinuse found foundtextcolor\"><i class=\"fa fa-check\"></i><span class=\"sr-only\">" . MEDIA_AND_QUOTA_USE . "</span></td></tr>";

            }else{
                $result->html = "<tr><td class=\"filename notfound\"><button class=\"filenameBtn\" onclick=\"setup_download_link('" . $path . "', '" . $buttonlbl . "', '" . $end_of_path . "/media/" . $folder_name . $f . "')\">" . $folder_name . $f . "</button></td><td class=\"filesize notfound\">" . substr((filesize($full)/1000000),0,4) . " MB</td><td class=\"fileinuse notfound notfoundtextcolor\"><button class=\"deleteFile\" onclick=\"javascript:delete_file('" . str_replace("'", "\\'", $dir_path . $folder_name . $f) . "')\" title=\"" . MEDIA_AND_QUOTA_DELETE . "\"><i class=\"fa fa-times\"></i><span class=\"sr-only\">" . MEDIA_AND_QUOTA_NOT_IN_USE . ": " . MEDIA_AND_QUOTA_DELETE . " " . $folder_name . $f . "</span></button></td></tr>";

                /**
                 * add the files to the delete array that are not in use  so they can be listed for use in the delete function
                 */
				
				array_push($delete_string, $folder_name . $f);

            }
            $quota += filesize($full);

            array_push($result_string,$result);
        }
        else if (strlen($f) > 0 && $f[0] != '.')
        {
			media_folder_loop($folder_name . $f . '/');
        }

    }

}

$template_id = x_clean_input($_POST['template_id'], 'numeric');
if (has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) || is_user_permitted("projectadmin")) {

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $sql = "select {$prefix}originaltemplatesdetails.template_name, {$prefix}templaterights.folder, {$prefix}logindetails.username FROM " .
        "{$prefix}originaltemplatesdetails, {$prefix}templatedetails, {$prefix}templaterights, {$prefix}logindetails WHERE " .
        "{$prefix}originaltemplatesdetails.template_type_id = {$prefix}templatedetails.template_type_id AND " .
        "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id AND " .
        "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id AND " .
        "{$prefix}templatedetails.template_id = ? AND (role = ? OR role = ?)";

    $row_path = db_query_one($sql, array($template_id, 'creator', 'co-author'));

    $end_of_path = $template_id . "-" . $row_path['username'] . "-" . $row_path['template_name'];

    /**
     * Set the paths
     */

    $dir_path = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/media/";
    x_check_path_traversal($dir_path, $xerte_toolkits_site->users_file_area_full, "Invalid file specified");

    $xmlpath = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/data.xml";

    $previewpath = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml";

    $dataInspector = new XerteXMLInspector();
    $dataInspector->loadTemplateXML($xmlpath);

    $previewInspector = new XerteXMLInspector();
    $previewInspector->loadTemplateXML($previewpath);

    if(file_exists($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml")){

        $quota = filesize($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/data.xml") + filesize($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml");

    }

    media_folder_loop("");

    // Order the result on filename
    usort($result_string, function($a, $b) {return strcmp($a->filename, $b->filename);});

    echo "<h2 class=\"header\">" . PROPERTIES_TAB_MEDIA . "</h2>";
    echo "<div id=\"mainContent\">";

    echo "<p>" . MEDIA_AND_QUOTA_USAGE . " " . substr(($quota/1000000),0,4) . " MB</p>";

    echo "<p>" . MEDIA_AND_QUOTA_IMPORT_MEDIA . "</p>";
    echo "<form method=\"post\" enctype=\"multipart/form-data\" id=\"importpopup\" name=\"importform\" target=\"upload_iframe\" action=\"website_code/php/import/fileupload.php\" onsubmit=\"javascript:iframe_upload_check_initialise(1);\">";
    echo "<div id=\"filenameuploaded_container\"><input type=\"file\" id=\"filenameuploaded\" name=\"filenameuploaded\"/><input type=\"hidden\" name=\"mediapath\" value=\"" . $dir_path . "\" /></div>";
    echo "<button id=\"submitbutton\" type=\"submit\" class=\"xerte_button\" name=\"submitBtn\" onclick=\"javascript:load_button_spinner(this)\"><i class=\"fa fa-upload\"></i> " . MEDIA_AND_QUOTA_BUTTON_IMPORT . "</button></form>";


    echo "<p id=\"linktextLabel\" class=\"block indent\" for=\"linktext\">" . MEDIA_AND_QUOTA_CLICK_FILENAME . "</p>";

    echo "<p>" . MEDIA_AND_QUOTA_PUBLISH . "</p>";
    echo "<div class=\"template_file_area\">";
    echo "<table id=\"mediaTable\">";
    echo "<tr><th class=\"filename\">" . MEDIA_AND_QUOTA_FILE_NAME . "</th><th class=\"filesize\">" . MEDIA_AND_QUOTA_FILE_SIZE . "</th><th class=\"fileinuse\">" . MEDIA_AND_QUOTA_FILE_USED . "</th></tr>";

    /**
     * display the first string
     */

    foreach($result_string as $file){

        echo $file->html;

    }

    $delete_string_json = base64_encode(json_encode($delete_string));

    echo "</table>";

    echo "<button id=\"delete_unused_files\" type=\"submit\" class=\"xerte_button\" name=\"delete_unused_filesBTN\" onclick=\"javascript:delete_unused_files('" . $dir_path . "', '". $delete_string_json ."')\"><i class=\"fa fa-trash\"></i> " . MEDIA_AND_QUOTA_UNUSED_DELETE . "</button>";
    echo "</div>";

    echo "</div>";

}else {

    echo "<h2 class=\"header\">" . PROPERTIES_TAB_MEDIA . "</h2>";

    echo "<div id=\"mainContent\">";

    echo "<p>" . MEDIA_AND_QUOTA_FAIL . "</p>";

    echo "</div>";

}


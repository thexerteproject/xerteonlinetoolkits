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
require_once "../../../config.php";
require_once "../../../plugins.php";

_load_language_file("/website_code/php/import/fileupload.inc");

if(apply_filters('editor_upload_file', $_FILES)){

    if($_FILES['filenameuploaded']['type']=="text/html"){

        $php_check = file_get_contents($_FILES['filenameuploaded']['tmp_name']);

        if(!stripos($php_check,"<?PHP")){

            $new_file_name = $_POST['mediapath'] . $_FILES['filenameuploaded']['name'];

            if(@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $new_file_name)){

                echo FILE_UPLOAD_SUCCESS . "****";

            }else{

                echo FILE_UPLOAD_ZIP_FAIL . "****";

            }

        }else{

            echo FILE_UPLOAD_HTML_FAIL . "****";				

        }

    }else{

        $new_file_name = $_POST['mediapath'] . $_FILES['filenameuploaded']['name'];

        if(@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $new_file_name)){

            echo FILE_UPLOAD_SUCCESS . "****";

        }else{

            echo FILE_UPLOAD_ZIP_FAIL . "****";

        }

    }


}else{

    /* Show the last file check error if possible. */
    if (isset($last_file_check_error) && !empty($last_file_check_error)) {
        $err_string = implode("\n", $last_file_check_error);

        echo $err_string . "****";
    }
    else {
        echo FILE_UPLOAD_MIME_FAIL . " - " . $_FILES['filenameuploaded']['type'] . "****";
    }
}
?>

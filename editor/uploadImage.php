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

require_once(dirname(__FILE__) . "/../config.php");
_load_language_file("/editor/uploadImage.inc");

require (dirname(__FILE__) . "/../" . $xerte_toolkits_site->php_library_path . "user_library.php");

function sanitizeName($file, &$response)
{
    $filename = str_replace(' ', '_', $file);
    if ($filename != $file) {
        $mesg = RENAMED;
        $mesg = str_replace('{0}', $file, $mesg);
        $mesg = str_replace('{1}', $filename, $mesg);
        $response['error'] = $mesg;
    }

   return $filename;
}

// Not used, left as legacy
/*function return_bytes($val) {
    $val = trim($val);
    $last = strtolower($val[strlen($val)-1]);
    switch($last) {
        // The 'G' modifier is available since PHP 5.1.0
        case 'g':
            $val *= 1024;
        case 'm':
            $val *= 1024;
        case 'k':
            $val *= 1024;
    }

    return $val;
}*/

if (!isset($_SESSION['toolkits_logon_username']) && !is_user_permitted("projectadmin"))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$response = new StdClass();

//_debug("upload: " . print_r($_FILES, true));

// Check uploaded file. It has to be an image. otherwise we'll reject it
if (!isset($_FILES['upload']))
{
    $response->uploaded = 0;
    $response->error = IMAGEUPOLOAD_NOT_UPLOADED;

    echo json_encode($response);
    exit(-1);
}

$uploadpath = x_clean_input($_REQUEST['uploadPath']);
$uploadurl = x_clean_input($_REQUEST['uploadURL']);

x_check_path_traversal($uploadpath, $xerte_toolkits_site->users_file_area_full, IMAGEUPOLOAD_NOT_UPLOADED);
$url_path = x_convert_user_area_url_to_path($uploadurl);
x_check_path_traversal($url_path, $xerte_toolkits_site->users_file_area_full, IMAGEUPOLOAD_NOT_UPLOADED);

if (isset($_FILES['upload']['error']) && $_FILES['upload']['error'] != 0)
{
    switch($_FILES['upload']['error']) {
        case UPLOAD_ERR_INI_SIZE:
            $mesg = IMAGEUPLOAD_TOO_LARGE;
            $mesg = str_replace('{0}', $_FILES['upload']['size'], $mesg);
            $mesg = str_replace('{1}', min(ini_get('upload_max_filesize'), ini_get('post_max_size')), $mesg);
            $response->error = $mesg;
            break;
        case UPLOAD_ERR_FORM_SIZE:
            $response->error = IMAGEUPLOAD_ERROR . IMAGEUPLOAD_FORM_SIZE;
            break;
        case UPLOAD_ERR_PARTIAL:
            $response->error = IMAGEUPLOAD_ERROR . IMAGEUPLOAD_PARTIAL_FILE;
            break;
        case UPLOAD_ERR_NO_FILE:
            $response->error = IMAGEUPLOAD_ERROR . IMAGEUPLOAD_NO_FILE;
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            $response->error = IMAGEUPLOAD_ERROR . IMAGEUPLOAD_NO_TMP_DIR;
            break;
        case UPLOAD_ERR_CANT_WRITE:
            $response->error = IMAGEUPLOAD_ERROR . IMAGEUPLOAD_CANT_WRITE;
            break;
        case UPLOAD_ERR_EXTENSION:
            $response->error = IMAGEUPLOAD_ERROR . IMAGEUPLOAD_EXTENSION;
            break;
    }
    $response->uploaded = 0;
    echo json_encode($response);
    exit(-1);
}

switch($_FILES['upload']['type'])
{
    case "image/png":
        $paste_ext = ".png";
        break;
    case "image/jpg":
    case "image/jpeg":
        $paste_ext = ".jpg";
        break;
    case "image/gif":
        $paste_ext = ".gif";
        break;
    case "image/bmp":
        $paste_ext = ".bmp";
        break;
    default:
        $response->uploaded = 0;
        $response->error = INVALID_FORMAT;

        echo json_encode($response);
        exit(-1);
}

$filename = sanitizeName(x_clean_input($_FILES['upload']['name']), $response);

// Add path to the $filename
$paste = "image";
// Check if pasted filename already exists, if so add a count until we find a name that is available
if ($filename == $paste . $paste_ext) {
    $final = $paste . $paste_ext;
    $count = 1;
    while (file_exists($uploadpath . "media/" . $final)) {
        $final =  $paste . "(" . $count . ")" . $paste_ext;
        $count++;
    }
    $filename = $final;
}

x_check_blacklisted_extensions($filename);

$response->uploaded = 1;
$response->url = $uploadurl . "/media/" . $filename;
$response->fileName = $uploadpath . "media/" . $filename;

// Move file to the correct location
$res = move_uploaded_file($_FILES['upload']['tmp_name'], $response->fileName);
//_debug("upload: " . print_r($_POST, true));

// _debug("File uploaded: " . print_r($response, true|));
echo json_encode($response);

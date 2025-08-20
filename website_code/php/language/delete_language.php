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
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 22-3-13
 * Time: 10:21
 * To change this template use File | Settings | File Templates.
 */

require_once("../../../config.php");
require_once("../management/management_library.php");
require_once("../user_library.php");
_load_language_file("/website_code/php/language/delete_language.inc");


if(!is_user_permitted("system")){
    management_fail();
    die("Access denied!");
}

function folder_delete($path){

    $d = opendir($path);

    while($f = readdir($d)){

        if(is_dir($path . $f)){

            if(($f!=".")&&($f!="..")){

                $mesg = folder_delete($path . $f . "/");
                if ($mesg != "")
                    return $mesg;
            }

        }else{

            if (! unlink($path . $f))
                return $path . $f;
        }

    }

    closedir($d);
    if (! rmdir($path))
        return $path;
    return "";
}

if (isset($_POST['code'])) {
    $code = x_clean_input($_POST['code'], 'string');
    $langdir = $xerte_toolkits_site->root_file_path . "languages/" . $code;
    // Check for path traversal
    x_check_path_traversal($langdir, $xerte_toolkits_site->root_file_path, DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_INVALIDCODE);

    if (file_exists($langdir)) {

        if (!_is_writable($langdir)) {
            _debug("{$xerte_toolkits_site->root_file_path}languages/{$code} needs to be writeable. Cannot perform deletion");
            echo DELETE_LANGUAGE_FAILED . $xerte_toolkits_site->root_file_path . "languages/" . $code . DELETE_LANGUAGE_WRITABLE;
            exit(0);
        }

        $abort = false;
        if (file_exists($langdir)) {
            $p = folder_delete($langdir . "/");
            if ($p != "") {
                echo DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_UNABLE_TO_DELETE . $p;
                $abort = true;

            }
        }
        $xot_wizard_path = $xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . $code;
        x_check_path_traversal_newpath($xot_wizard_path, $xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/", DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_INVALIDCODE);
        if (file_exists($xot_wizard_path)) {
            $p = folder_delete($xot_wizard_path . "/");
            if ($p != "") {
                echo DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_UNABLE_TO_DELETE . $p;
                $abort = true;
            }
        }
        if (!$abort) {
            echo DELETE_LANGUAGE_SUCCEEDED . $code;
            echo "****";
            language_details(true);
        }
        $site_wizard_path = $xerte_toolkits_site->root_file_path . "modules/site/parent_templates/site/wizards/" . $code;
        x_check_path_traversal_newpath($site_wizard_path, $xerte_toolkits_site->root_file_path . "modules/site/parent_templates/site/wizards/", DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_INVALIDCODE);
        if (file_exists($site_wizard_path)) {
            $p = folder_delete($site_wizard_path . "/");
            if ($p != "") {
                echo DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_UNABLE_TO_DELETE . $p;
                $abort = true;
            }
        }
        if (!$abort) {
            echo DELETE_LANGUAGE_SUCCEEDED . $code;
            echo "****";
            language_details(true);
        }
    }
    else
    {
        echo DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_INVALIDCODE;
    }
}
else
{
    echo DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_INVALIDCODE;
}

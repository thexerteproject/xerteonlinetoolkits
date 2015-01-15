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


if(!is_user_admin()){
    management_fail();
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

if(isset($_POST['code']) && file_exists($xerte_toolkits_site->root_file_path . "languages/" . $_POST['code'])){

    $code = $_POST['code'];

    if(!_is_writable($xerte_toolkits_site->root_file_path . "languages/" . $code)) {
        _debug("{$xerte_toolkits_site->root_file_path}languages/{$code} needs to be writeable. Cannot perform import");
        echo DELETE_LANGUAGE_FAILED . $lang_dir . $xerte_toolkits_site->root_file_path . "languages/" . $code . DELETE_LANGUAGE_WRITABLE;
        exit(0);
    }

    $abort = false;
    if (file_exists($xerte_toolkits_site->root_file_path . "languages/" . $code))
    {
        $p = folder_delete($xerte_toolkits_site->root_file_path . "languages/" . $code . "/");
        if ($p != "")
        {
            echo DELETE_LANGUAGE_FAILED . $lang_dir . DELETE_LANGUAGE_UNABLE_TO_DELETE . $p;
            $abort = true;

        }
    }
    if (file_exists($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . $code))
    {
    $p = folder_delete($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . $code . "/");
        if ($p != "")
        {
            echo DELETE_LANGUAGE_FAILED . $lang_dir . DELETE_LANGUAGE_UNABLE_TO_DELETE . $p;
            $abort=true;
        }
    }
    if (!$abort)
    {
        echo DELETE_LANGUAGE_SUCCEEDED . $code;
        echo "****";
        language_details(true);
    }

}
else
{
    echo DELETE_LANGUAGE_FAILED . DELETE_LANGUAGE_INVALIDCODE;
}
?>
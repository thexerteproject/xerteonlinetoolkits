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
 * Date: 19-3-13
 * Time: 20:51
 * To change this template use File | Settings | File Templates.
 */
require_once("../../../config.php");
require_once("../management/management_library.php");
require_once("../user_library.php");
_load_language_file("/website_code/php/language/import_language.inc");


ini_set('memory_limit','64M');

if(!is_user_permitted("system")){
    management_fail();
    die("Access denied!");
}

if(($_FILES['filenameuploaded']['type']=="application/x-zip-compressed")||($_FILES['filenameuploaded']['type']=="application/zip")||($_FILES['filenameuploaded']['type']=="application/octet-stream")){


    $this_dir = rand() . "/";

    if(!_is_writable($xerte_toolkits_site->import_path)) {
        _debug("{$xerte_toolkits_site->import_path} needs to be writeable. Cannot perform import");
        echo IMPORT_LANGUAGE_FAILED . $xerte_toolkits_site->import_path . IMPORT_LANGUAGE_WRITABLE;
        exit(0);
    }
    if(!_is_writable($xerte_toolkits_site->root_file_path . "languages/")) {
        _debug("{$xerte_toolkits_site->root_file_path}  languages/ needs to be writeable. Cannot perform import");
        echo IMPORT_LANGUAGE_FAILED . $xerte_toolkits_site->root_file_path . "languages/" . IMPORT_LANGUAGE_WRITABLE;
        exit(0);
    }
    if(!_is_writable($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/")) {
        _debug("{$xerte_toolkits_site->root_file_path}  modules/xerte/parent_templates/Nottingham/wizards/ needs to be writeable. Cannot perform import");
        echo IMPORT_LANGUAGE_FAILED . $xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . IMPORT_LANGUAGE_WRITABLE;
        exit(0);
    }
    if(!_is_writable($xerte_toolkits_site->root_file_path . "modules/site/parent_templates/site/wizards/")) {
        _debug("{$xerte_toolkits_site->root_file_path}  modules/site/parent_templates/site/wizards/ needs to be writeable. Cannot perform import");
        echo IMPORT_LANGUAGE_FAILED . $xerte_toolkits_site->root_file_path . "modules/site/parent_templates/site/wizards/" . IMPORT_LANGUAGE_WRITABLE;
        exit(0);
    }

    $ok = mkdir($xerte_toolkits_site->import_path . $this_dir) && chmod($xerte_toolkits_site->import_path . $this_dir,0777);
    if(!$ok) {
        _debug("Warning: we had problems either creating the temp dir {$xerte_toolkits_site->import_path}$this_dir or chmod'ing it 0777.");
    }

    $filename = x_clean_input($_FILES['filenameuploaded']['name'], 'string');
    if (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $filename))
    {
        echo IMPORT_LANGUAGE_FAILED . IMPORT_LANGUAGE_NOVALIDZIP;
        exit(0);
    }

    $new_file_name = $xerte_toolkits_site->import_path . $this_dir . time() . $filename;
    x_check_path_traversal_newpath($_FILES['filenameuploaded']['tmp_name']);
    x_check_path_traversal_newpath($new_file_name);
    if(@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $new_file_name)){

        require_once dirname(__FILE__) . "/../dUnzip2.inc.php";


        // Quick fix to check zip file is valid
        $zip = new ZipArchive();
        $x = $zip->open($new_file_name);
        x_check_zip($zip, 'language_pack');
        $zip->close();

        $zip = new dUnzip2($new_file_name);

        $zip->debug = false;

        $zip->getList();

        $file_data = array();

        $template_data_equivalent = null;

        $lang_dir = null;
        /*
         * Look for the folders in the zip and move files accordingly
         */
        $nottingham_language_found = false;
        $site_language_found = false;
        $xot_language_found = false;

        foreach($zip->compressedList as $x){

             $y=$x['file_name'];
             if(!(strpos($y,"languages/")===false)){

                $string = $zip->unzip($y, false, 0777);

                $temp_array = array($y,$string,"languages");

                array_push($file_data,$temp_array);

                if ($lang_dir == null)
                {
                    $lang_dir = substr($y, 10, 5);
                }
                $xot_language_found = true;

            }

            if((strpos($y,"Nottingham/")===0)){

                $string = $zip->unzip($y, false, 0777);

                $temp_array = array(substr($y, 11),$string,"Nottingham");

                array_push($file_data,$temp_array);
                if ($lang_dir == null)
                {
                    $lang_dir = substr($y, 11, 5);
                }
                $nottingham_language_found = true;
            }
            elseif((strpos($y,"wizards/")!==false)){

                $string = $zip->unzip($y, false, 0777);

                $temp_array = array(substr($y,8),$string,"wizards");

                array_push($file_data,$temp_array);
                if ($lang_dir == null)
                {
                    $lang_dir = substr($y, 8, 5);
                }
                $nottingham_language_found = true;
            }
            if((strpos($y,"site/")===0)){

                $string = $zip->unzip($y, false, 0777);

                $temp_array = array(substr($y,5),$string,"site");

                array_push($file_data,$temp_array);
                if ($lang_dir == null)
                {
                    $lang_dir = substr($y, 5, 5);
                }
                $site_language_found = true;
            }
        }
        /*
         * Make some new folders
         */

        if ($xot_language_found && !file_exists($xerte_toolkits_site->root_file_path . "languages/" . $lang_dir))
        {
            mkdir($xerte_toolkits_site->root_file_path . "languages/" . $lang_dir, 0755, true);
        }

        if ($nottingham_language_found && !file_exists($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . $lang_dir))
        {
            mkdir($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . $lang_dir, 0755, true);
        }

        if ($site_language_found && !file_exists($xerte_toolkits_site->root_file_path . "modules/site/parent_templates/site/wizards/" . $lang_dir))
        {
            mkdir($xerte_toolkits_site->root_file_path . "modules/site/parent_templates/site/wizards/" . $lang_dir, 0755, true);
        }
        /*
         * Put the files into the right folders
         */

        while($file_to_create = array_pop($file_data)){

            if($file_to_create[2]=="languages"){

                $paths = array();
                $file = dirname($file_to_create[0]);

                while ($file != ".")
                {
                    $paths[] = $file;
                    $file = dirname($file);
                }
                for( $i=count($paths)-1; $i>=0; $i--)
                {
                    if (!file_exists($xerte_toolkits_site->root_file_path . $paths[$i]))
                    {
                        mkdir($xerte_toolkits_site->root_file_path . $paths[$i]);
                    }
                }
                $fp = fopen($xerte_toolkits_site->root_file_path . $file_to_create[0],"w");

                fwrite($fp,$file_to_create[1]);

                fclose($fp);

                chmod($xerte_toolkits_site->import_path . $this_dir . $file_to_create[0],0777);

            }else if($file_to_create[2]=="Nottingham"){

                $fp = fopen($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . $file_to_create[0],"w");

                fwrite($fp,$file_to_create[1]);

                fclose($fp);

            }else if($file_to_create[2]=="wizards"){

                $fp = fopen($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . $file_to_create[0],"w");

                fwrite($fp,$file_to_create[1]);

                fclose($fp);

            }else if($file_to_create[2]=="site"){

                $fp = fopen($xerte_toolkits_site->root_file_path . "modules/site/parent_templates/site/wizards/" . $file_to_create[0],"w");

                fwrite($fp,$file_to_create[1]);

                fclose($fp);

            }

        }

		//regex for getting "x.xx" where x are numbers
        $regex = '/[0-9]*\\.[0-9]+/i';
        $matches = "";
        $result = preg_match($regex, $_FILES['filenameuploaded']['name'], $matches);
        if($result != 0){
            $version = $matches[0];
			$fp = fopen($xerte_toolkits_site->root_file_path . "languages/" . $lang_dir . "/version", "w");
			fwrite($fp, $version);
			fclose($fp);
			
        }

        $zip->close();

        unlink($new_file_name);

        rmdir($xerte_toolkits_site->import_path . $this_dir);

        echo IMPORT_LANGUAGE_SUCCEEDED . $lang_dir;
        echo ".****";
    }
}
else
{

    echo IMPORT_LANGUAGE_FAILED . IMPORT_LANGUAGE_NOVALIDZIP;
}
?>

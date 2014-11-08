<?php
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

if(!is_user_admin()){
    management_fail();
}

if(($_FILES['filenameuploaded']['type']=="application/x-zip-compressed")||($_FILES['filenameuploaded']['type']=="application/zip")||($_FILES['filenameuploaded']['type']=="application/octet-stream")){


    $this_dir = rand() . "/";

    if(!_is_writable($xerte_toolkits_site->import_path)) {
        _debug("{$xerte_toolkits_site->import_path} needs to be writeable. Cannot perform import");
        echo IMPORT_LANGUAGE_FAILED . $lang_dir . $xerte_toolkits_site->import_path . IMPORT_LANGUAGE_WRITABLE;
        exit(0);
    }
    if(!_is_writable($xerte_toolkits_site->root_file_path . "languages/")) {
        _debug("{$xerte_toolkits_site->root_file_path}  languages/ needs to be writeable. Cannot perform import");
        echo IMPORT_LANGUAGE_FAILED . $lang_dir . $xerte_toolkits_site->root_file_path . "languages/" . IMPORT_LANGUAGE_WRITABLE;
        exit(0);
    }
    if(!_is_writable($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/")) {
        _debug("{$xerte_toolkits_site->root_file_path}  modules/xerte/parent_templates/Nottingham/wizards/ needs to be writeable. Cannot perform import");
        echo IMPORT_LANGUAGE_FAILED . $lang_dir . $xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . IMPORT_LANGUAGE_WRITABLE;
        exit(0);
    }

    $ok = mkdir($xerte_toolkits_site->import_path . $this_dir) && chmod($xerte_toolkits_site->import_path . $this_dir,0777);
    if(!$ok) {
        _debug("Warning: we had problems either creating the temp dir {$xerte_toolkits_site->import_path}$this_dir or chmod'ing it 0777.");
    }

    $new_file_name = $xerte_toolkits_site->import_path . $this_dir . time() . $_FILES['filenameuploaded']['name'];

    if(@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $new_file_name)){

        require_once dirname(__FILE__) . "/../dUnzip2.inc.php";

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

            if((strpos($y,"wizards/")!==false)){

                $string = $zip->unzip($y, false, 0777);

                $temp_array = array($y,$string,"wizards");

                array_push($file_data,$temp_array);
                if ($lang_dir == null)
                {
                    $lang_dir = substr($y, 8, 5);
                }
                $nottingham_language_found = true;
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
            mkdir($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/wizards/" . $lang_dir. 0755, true);
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

            }else if($file_to_create[2]=="wizards"){

                $fp = fopen($xerte_toolkits_site->root_file_path . "modules/xerte/parent_templates/Nottingham/" . $file_to_create[0],"w");

                fwrite($fp,$file_to_create[1]);

                fclose($fp);

            }

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

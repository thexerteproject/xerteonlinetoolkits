<?php

require_once(dirname(__FILE__) . "/config.php");

require $xerte_toolkits_site->php_library_path . "user_library.php";
require $xerte_toolkits_site->php_library_path . "template_library.php";
require $xerte_toolkits_site->php_library_path . "template_status.php";

/*
 * Check the template ID is numeric
 */

// for security, the file name should only contain alpha numeric chars or - _ .   
// We definitely do not want a file path to contain a directory separator like ../ else this could be open to abuse.
$safe_file_path = preg_replace('/[^a-z0-9\-_\.]/i', '', $_GET['file']);

$data_from_file_name = explode("-",$safe_file_path);

if(is_numeric($data_from_file_name[0])){

    if(has_rights_to_this_template($data_from_file_name[0],$_SESSION['toolkits_logon_id'])){	

        /*
         * Check if user is editor (could be read only)
         */

        if(is_user_an_editor($data_from_file_name[0],$_SESSION['toolkits_logon_id'])){

            if($data_from_file_name[1]==$_SESSION['toolkits_logon_username']){

                $file = $xerte_toolkits_site->users_file_area_full . $safe_file_path;

                header("Cache-Control: public");
                header("Content-Description: File Transfer");
                header("Content-Disposition: attachment; filename=$file");
                header("Content-Transfer-Encoding: binary");

                readfile($file);

            }

        }


    }

}else{

    /*
     * Was not numeric, so display error message
     */

    echo file_get_contents($xerte_toolkits_site->website_code_path . "error_top") . " Sorry this resource does not exist </div></div></body></html>";
    die();
}

<?php

require_once("../../../config.php");

if(in_array($_FILES['filenameuploaded']['type'],$xerte_toolkits_site->mimetypes)){

    if($_FILES['filenameuploaded']['type']=="text/html"){

        $php_check = file_get_contents($_FILES['filenameuploaded']['tmp_name']);

        if(!strpos($php_check,"<?PHP     ")){

            $new_file_name = $_POST['mediapath'] . $_FILES['filenameuploaded']['name'];

            if(@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $new_file_name)){

                echo "File successfully uploaded.****";

            }else{

                echo "File upload failed.****";

            }

        }else{

            echo "File upload failed as that HTML contained PHP code.****";				

        }

    }else{

        $new_file_name = $_POST['mediapath'] . $_FILES['filenameuploaded']['name'];

        if(@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $new_file_name)){

            echo "File successfully uploaded.****";

        }else{

            echo "File upload failed.****";

        }

    }


}else{

    echo "Invalid file type - " . $_FILES['filenameuploaded']['type'] . "****";

}

?>

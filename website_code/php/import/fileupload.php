<?PHP

	include "../../../config.php";

	require $xerte_toolkits_site->root_file_path . "languages/" . $_SESSION['toolkits_language'] . "/website_code/php/fileupload.inc";

	if(in_array($_FILES['filenameuploaded']['type'],$xerte_toolkits_site->mimetypes)){

		if($_FILES['filenameuploaded']['type']=="text/html"){

			$php_check = file_get_contents($_FILES['filenameuploaded']['tmp_name']);
	
			if(!strpos($php_check,"<?PHP")){

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

		echo FILE_UPLOAD_MIME_FAIL . " - " . $_FILES['filenameuploaded']['type'] . "****";

	}

?>
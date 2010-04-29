<?PHP /**
* 
* upload page, used by xerte to upload a file
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

require("../../../config.php");

$page_sought = explode("=",$_SERVER['REQUEST_URI']);

$new_file_name = $xerte_toolkits_site->root_file_path . $page_sought[1] . $_FILES['Filedata']['name'];

if(move_uploaded_file($_FILES['Filedata']['tmp_name'], $new_file_name)){
}else{
}

?>


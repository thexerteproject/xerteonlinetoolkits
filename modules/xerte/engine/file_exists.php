<?PHP     /**
* 
* file exists page, used by xerte to chec if a file is there before previewing it
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

require("../../../config.php");

if(file_exists($xerte_toolkits_site->root_file_path . $_POST['file_name'])){
	print("&return_value=true");
}else{
	print("&return_value=false");
}


?>
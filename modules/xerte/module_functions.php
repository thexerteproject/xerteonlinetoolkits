<?PHP     /**
* 
* module functions page, shared functions for this module
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/


/**
* 
* Function dont_show_template
* This function outputs the HTML for people have no rights to this template
* @version 1.0
* @author Patrick Lockley
*/

function dont_show_template(){

	require("config.php");	

	echo edit_xerte_page_format_top(file_get_contents($xerte_toolkits_site->website_code_path . "error_top")) . " Sorry, the author of this piece has yet to make it available.</div></div></body></html>";
	die();

}

?>
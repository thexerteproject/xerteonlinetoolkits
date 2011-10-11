<?PHP     /**
* 
* peer template, allows the user to set up a peer review page for their template
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

	require("../../../config.php");
	require("../../../session.php");

	include "../database_library.php";

	include "../template_status.php";

	include "../url_library.php";

	include "../user_library.php";
	
	include "properties_library.php";

	if(is_numeric($_POST['template_id'])){

		$database_id = database_connect("peer template database connect success","peer template change database connect failed");
	
		if(is_user_creator(mysql_real_escape_string($_POST['template_id']))||is_user_admin()){
	
			peer_display($xerte_toolkits_site,false);
			
		}else{
	
			peer_display_fail();
	
		}
	
		mysql_close($database_id);
	
	}

?>
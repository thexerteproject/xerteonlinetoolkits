<?PHP /**
	 * 
	 * logout page, user has logged out, wipe sessions
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */
		
	require("../../config.php");
	
	session_name($xerte_toolkits_site->site_session_name);
	
	session_start($xerte_toolkits_site->site_session_name);

	unset(session_id());

	session_destroy();

?>
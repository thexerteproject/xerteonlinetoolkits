<?PHP     
	
	/**
	 * 
	 * logout page, user has logged out, wipe sessions
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Copyright (c) 2008,2009 University of Nottingham
	 * @package
	 */
		
	require("../../config.php");

	unset(session_id());

	session_destroy();

?>
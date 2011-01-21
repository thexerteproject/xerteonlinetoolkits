<?PHP function get_ldap_array($host,$port,$bind_pwd,$basedn,$bind_dn,$toolkits_username,$password,$xerte_toolkits_site){

	$ldap_filter_attr = $xerte_toolkits_site->LDAP_preference;

	$ldap_search_attr = array('firstname' => 'givenname', 'lastname' => 'sn');

	$ldapbind = null;

	$ds = @ldap_connect($host, (int)$port);

	if($bind_pwd!=""){

		@ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);

		if ($ds) {
		
	       	  if ($bind_dn != '') {
              		
				  $ldapbind = @ldap_bind($ds, $bind_dn, $bind_pwd);
	
			         $sr = @ldap_search($ds, $basedn, $ldap_filter_attr ."=". $toolkits_username, array_values($ldap_search_attr));

		       	  if(!$sr){

					/*
					* login has failed
					*/

					ldap_close($ds);
				
					return false;
		
 			         }

		       	  $entry = ldap_get_entries($ds, $sr);

	  	        	  if(! $entry or ! $entry[0]) {

				  	ldap_close($ds);

					return false;

			  	  }else{
			     	  
						if(@ldap_bind($ds, $entry[0]['dn'], $password) ) {

							/*
							* valid login, so return true
							*/

							ldap_close($ds);			
					
							return $entry;

					  }
				  
				}

			}
			
		}else{
			
			/*
			* login failed (possibly for technical reasons with LDAP)
			*/
			
			ldap_close($ds);

			return false;

		}

	}else{

		$filter   = $xerte_toolkits_site->LDAP_filter . $toolkits_username;

		$ldapConnection = ldap_connect($host, (int)$port);
		
		$ldapSearchResult = @ldap_search($ldapConnection, $basedn, $filter );
	
		$ldapSearchArray = @ldap_get_entries($ldapConnection, $ldapSearchResult);
	
		$userBaseDn = $ldapSearchArray[0]["dn"];
	
		/*
		* Bind with password & baseDN
		*/

		if ($ldapConnection){
	
			if (@ldap_bind($ldapConnection, $userBaseDn, $password)){

				$entry = ldap_get_entries($ldapConnection, $ldapSearchResult);

				if(!$entry or !$entry[0]){

				  	ldap_close($ds);

					return false;

			  	}else{

					return $entry;

				}

			}else{
	
				return false;

			}
	
		}
		ldap_close($ldapConnection);
	

	}	

}




function authenticate_to_host($host,$port,$bind_pwd,$basedn,$bind_dn,$toolkits_username,$password,$xerte_toolkits_site){

	$ldap_filter_attr = $xerte_toolkits_site->LDAP_preference;

	$ldap_search_attr = array('firstname' => 'givenname', 'lastname' => 'sn');

	$ldapbind = null;

	$ds = @ldap_connect($host, (int)$port);

	if($bind_pwd!=""){

		@ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);

		if ($ds) {
		
	       	  if ($bind_dn != '') {
              		
				  $ldapbind = @ldap_bind($ds, $bind_dn, $bind_pwd);
	
			         $sr = @ldap_search($ds, $basedn, $ldap_filter_attr ."=". $toolkits_username, array_values($ldap_search_attr));

		       	  if(!$sr){

					/*
					* login has failed
					*/

					ldap_close($ds);
				
					return false;
		
 			         }

		       	  $entry = ldap_get_entries($ds, $sr);

	  	        	  if(! $entry or ! $entry[0]) {

				  	ldap_close($ds);

					return false;

			  	  }else{
  	  
						if(@ldap_bind($ds, $entry[0]['dn'], $password)) {

							/*
							* valid login, so return true
							*/

							ldap_close($ds);			
					
							return true;

					  }
				  
				}

			}
			
		}else{
			
			/*
			* login failed (possibly for technical reasons with LDAP)
			*/
			
			ldap_close($ds);

			return false;

		}

	}else{

		$filter   = $xerte_toolkits_site->LDAP_filter . $toolkits_username;

		$ldapConnection = ldap_connect($host, (int)$port);

		$ldapSearchResult = @ldap_search($ldapConnection, $basedn, $filter);

		$ldapSearchArray = @ldap_get_entries($ldapConnection, $ldapSearchResult);
	
		$userBaseDn = $ldapSearchArray[0]["dn"];
	
		/*
		* Bind with password & baseDN
		*/

		if ($ldapConnection){
	
			if (@ldap_bind($ldapConnection, $userBaseDn, $password)){

				$entry = ldap_get_entries($ldapConnection, $ldapSearchResult);

				if(!$entry or !$entry[0]){

				  	ldap_close($ds);

					return false;

			  	}else{

					return true;

				}

			}else{

				return false;

			}
	
		}

		ldap_close($ldapConnection);	

	}	

}

	/**
	 * 
	 * Function valid login
 	 * This function is used to authenticate users on index.php
 	 * @param string $username = username given
  	 * @param string $password = password given
	 * @return bool - True or false depending on authentication
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function valid_login($username,$password){

	require('config.php');

	require_once($xerte_toolkits_site->php_library_path . "error_library.php");

	if(strpos($xerte_toolkits_site->ldap_host,"$$$")){

		$login_check = false;

		$host = explode("$$$",$xerte_toolkits_site->ldap_host);
		$port = explode("$$$",$xerte_toolkits_site->ldap_port);
		$bind_pwd = explode("$$$",$xerte_toolkits_site->bind_pwd);
		$basedn = explode("$$$",$xerte_toolkits_site->basedn);
		$bind_dn = explode("$$$",$xerte_toolkits_site->bind_dn);

		for($x=0;$x<count($host);$x++){

			$login_check = authenticate_to_host($host[$x],$port[$x],$bind_pwd[$x],$basedn[$x],$bind_dn[$x],$username,$password,$xerte_toolkits_site);

			if($login_check){

				break;

			}

		}

		if($login_check){

			receive_message($username, "USER", "SUCCESS", "Logging in succeeded for " . $username, "Logging in succeeded for " . $username);

			return $login_check;

		}else{

			receive_message($username, "USER", "CRITICAL", "Login failed for " . $username, "Login failed for " . $username);

			return $login_check;

		}

	}else{

		$host = $xerte_toolkits_site->ldap_host;
		$port = $xerte_toolkits_site->ldap_port;
		$bind_pwd= $xerte_toolkits_site->bind_pwd;
		$basedn= $xerte_toolkits_site->basedn;
		$bind_dn = $xerte_toolkits_site->bind_dn;

		$result = authenticate_to_host($host,$port,$bind_pwd,$basedn,$bind_dn,$username,$password,$xerte_toolkits_site);

		if($result){

			receive_message($username, "USER", "SUCCESS", "Logging in succeeded for " . $username, "Logging in succeeded for " . $username);

			return $result;

		}else{

			receive_message($username, "USER", "CRITICAL", "Login failed for " . $username, "Login failed for " . $username);

			return $result;

		}

	}	

}

	/**
	 * 
	 * Function get user details
 	 * This function is used to get a users details from LDAP
 	 * @param string $username = username given
  	 * @param string $password = password given
	 * @return array $entry - the LDAP array returned
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function get_user_details($username,$password){

	require('config.php');

	require_once($xerte_toolkits_site->php_library_path . "error_library.php");

	if(strpos($xerte_toolkits_site->ldap_host,"$$$")){

		$login_check = false;

		$host = explode("$$$",$xerte_toolkits_site->ldap_host);
		$port = explode("$$$",$xerte_toolkits_site->ldap_port);
		$bind_pwd = explode("$$$",$xerte_toolkits_site->bind_pwd);
		$basedn = explode("$$$",$xerte_toolkits_site->basedn);
		$bind_dn = explode("$$$",$xerte_toolkits_site->bind_dn);

		for($x=0;$x<count($host);$x++){

			$login_check = get_ldap_array($host[$x],$port[$x],$bind_pwd[$x],$basedn[$x],$bind_dn[$x],$username,$password,$xerte_toolkits_site);

			if($login_check){

				break;

			}

		}

		if($login_check){

			receive_message($username, "USER", "SUCCESS", "Ldap Array succeeded for " . $username, "Ldap Array succeeded for " . $username);

			return $login_check;

		}else{

			receive_message($username, "USER", "CRITICAL", "Ldap Array failed for " . $username, "Ldap Array failed for " . $username);

			return $login_check;

		}

	}else{

		$host = $xerte_toolkits_site->ldap_host;
		$port = $xerte_toolkits_site->ldap_port;
		$bind_pwd= $xerte_toolkits_site->bind_pwd;
		$basedn= $xerte_toolkits_site->basedn;
		$bind_dn = $xerte_toolkits_site->bind_dn;

		$result = get_ldap_array($host,$port,$bind_pwd,$basedn,$bind_dn,$username,$password,$xerte_toolkits_site);

		if($result){

			receive_message($username, "USER", "SUCCESS", "Ldap Array succeeded for " . $username, "Ldap Array succeeded for " . $username);

			return $result;

		}else{

			receive_message($username, "USER", "CRITICAL", "Ldap Array for " . $username, "Ldap Array failed for " . $username);

			return $result;

		}

	}	


}

	/**
	 * 
	 * Function password username check
 	 * This function is used to authenticate on the password play page
 	 * @param string $login_details = username and passwird in an array
	 * @version 1.0
	 * @author Patrick Lockley
	 */
	 
function password_username_check($login_details){

	if(($login_details["login"]=="")&&($login_details["password"]=="")){
			
		$results_and_message = array ("false", "<p>Please enter your username and password</p>");

		return $results_and_message;
	
	}else if($login_details["login"]==""){

		$results_and_message = array ("false", "<p>Please enter your username</p>");

		return $results_and_message;
	
	}else if($login_details["password"]==""){
	
		$results_and_message = array ("false", "<p>Please enter your password</p>");

		return $results_and_message;

	}else if(($login_details["login"]!="")&&($login_details["password"]!="")){

		if(valid_login($login_details["login"],$login_details["password"])){		

			$results_and_message = array ("true", " ");

			return $results_and_message;

		}else{

			$results_and_message = array ("false", " ");

			return $results_and_message;

		}

	}

}

?>
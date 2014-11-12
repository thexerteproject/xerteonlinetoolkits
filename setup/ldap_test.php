<?PHP 
<!--
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 -->

	echo file_get_contents("page_top");


function get_user_details($username,$password){

	global $xerte_toolkits_site;

	$link = mysql_connect($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password);

	mysql_select_db($xerte_toolkits_site->database_name);

	$ldap_hosts = mysql_query("select * from " . $xerte_toolkits_site->database_table_prefix . "ldap");

	if($ldap_hosts){
	
		while($host = mysql_fetch_array($ldap_hosts)){
			
		$login_check = get_user_ldap($host['ldap_host'],$host['ldap_port'],$host['ldap_password'],$host['ldap_username'],$host['ldap_basedn'],$host['ldap_filter'],$host['ldap_filter_attr'],$username,$password,$xerte_toolkits_site);

			if($login_check[1]!=null){

				break;

			}

		}

	}else{

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

	return $login_check;

}

function get_user_ldap($host,$port,$bind_pwd,$bind_dn,$basedn,$ldap_filter,$ldap_filter_attr,$eureka_username,$password,$eureka_site){

	if($bind_pwd!=""){

		$ldap_search_attr = array('firstname' => 'givenname', 'lastname' => 'sn');

		$ldapbind = null;

		$ds = @ldap_connect($host, (int)$port);
		
		@ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);

		if ($ds) {

	       	  if ($bind_dn != '') {
      		
			      $ldapbind = @ldap_bind($ds, $bind_dn, $bind_pwd);

			      $sr = @ldap_search($ds, $basedn, $ldap_filter_attr ."=". $eureka_username, array_values($ldap_search_attr));
	
		       	if(!$sr){

					/*
					* login has failed
					*/

					ldap_close($ds);
			
					$result_array = array(false, null);
					
					return $result_array;
		
 			      }

    	       	  $entry = ldap_get_entries($ds, $sr);

	  	              if(! $entry or ! $entry[0]) {

				  	   ldap_close($ds);
	
					   $result_array = array(false, null);

					   return $result_array;


			  	  }else{
  	  
					ldap_close($ds);			
					
					$result_array = array(true, $entry);
				
					return $result_array;
								  
				}

			}
			
		}else{
			
			/*
			* login failed (possibly for technical reasons with LDAP)
			*/

	
			ldap_close($ds);

			$result_array = array(false, null);

			return $result_array;

		}

	}else{

		
		$filter   = $ldap_filter . $eureka_username;

		$ldapConnection = ldap_connect($host, (int)$port);

		$ldapSearchResult = ldap_search($ldapConnection, $basedn, $filter);

		if($ldapSearchResult){

			$ldapSearchArray = ldap_get_entries($ldapConnection, $ldapSearchResult);
	
			$userBaseDn = $ldapSearchArray[0]["dn"];
	
			/*
			* Bind with password & baseDN
			*/

			if ($ldapConnection){

				if (@ldap_bind($ldapConnection, $userBaseDn, $password)){

					$entry = @ldap_get_entries($ldapConnection, $ldapSearchResult);

					if(!$entry or !$entry[0]){

						$result_array = array(false, null);

						return $result_array;

					}else{

						$result_array = array(true, $entry);

						return $result_array;

					}

				}else{

					$result_array = array(false, null);
		
					return $result_array;

				}
	
			}

			ldap_close($ldapConnection);	

		}else{

			$result_array = array(false, null);
		
			return $result_array;		

		}

	}	

}


function authenticate_to_host($host,$port,$bind_pwd,$bind_dn,$basedn,$ldap_filter,$ldap_filter_attr,$eureka_username,$password,$eureka_site){

	if($bind_pwd!=""){

		$ldap_search_attr = array('firstname' => 'givenname', 'lastname' => 'sn');

		$ldapbind = null;

		echo "Attempting to connect <br>";

		$ds = @ldap_connect($host, (int)$port);

		@ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);

		if ($ds) {
				
   			  echo "Connected <br>";

	       	  if ($bind_dn != '') {

			      echo "Attempting to bind<br>";
              		
			      $ldapbind = @ldap_bind($ds, $bind_dn, $bind_pwd);

			      echo "LDAP bound<br>";	

			      echo "LDAP search attempt<br>";

			      $sr = @ldap_search($ds, $basedn, $ldap_filter_attr ."=". $eureka_username, array_values($ldap_search_attr));
	
		       	  if(!$sr){

				      echo "LDAP search failed<br>";

					/*
					* login has failed
					*/

					ldap_close($ds);
			
					$result_array = array(false, null);
					
					return $result_array;
		
 			      }

			      echo "LDAP search success<br>";

		       	  $entry = ldap_get_entries($ds, $sr);

	  	          if((!$entry) || (!isset($entry[0]))) {

			      		   echo "No LDAP entries for that user<br>";

				  	   ldap_close($ds);
	
					   $result_array = array(false, null);

					   return $result_array;


			  	  }else{

  					  echo "LDAP entries for that user<br>";
	  	  
						if(@ldap_bind($ds, $entry[0]['dn'], $password)) {

							 echo "Password correct for that user<br>";


							/*
							* valid login, so return true
							*/

							ldap_close($ds);			
					
							$result_array = array(true, $entry);
				
							return $result_array;

					  }else{

							 echo "Password incorrect for that user<br>";

					}
				  
				}

			}
			
		}else{
			
			/*
			* login failed (possibly for technical reasons with LDAP)
			*/

	
			ldap_close($ds);

			$result_array = array(false, null);

			return $result_array;

		}

	}else{
				
		echo "Attempting to connect <br>";

		$filter   = $ldap_filter . $eureka_username;

		$ldapConnection = ldap_connect($host, (int)$port);

		$ldapSearchResult = ldap_search($ldapConnection, $basedn, $filter);

		if($ldapSearchResult){

			echo "Attempting to search <br>";

			$ldapSearchArray = ldap_get_entries($ldapConnection, $ldapSearchResult);
	
			$userBaseDn = $ldapSearchArray[0]["dn"];
	
			/*
			* Bind with password & baseDN
			*/

			if ($ldapConnection){

				echo "LDAP connected <br>";

				if (@ldap_bind($ldapConnection, $userBaseDn, $password)){

					echo "LDAP bound <br>";

					$entry = @ldap_get_entries($ldapConnection, $ldapSearchResult);

					if(!$entry or !$entry[0]){

						echo "No LDAP entries for that username <br>";

						$result_array = array(false, null);

						return $result_array;

					}else{

						echo "LDAP entry for that username <br>";

						$result_array = array(true, $entry);

						return $result_array;

					}

				}else{

					echo "LDAP binding failed<br>";

					$result_array = array(false, null);
		
					return $result_array;

				}
	
			}

			ldap_close($ldapConnection);	

		}else{

			$result_array = array(false, null);
		
			return $result_array;		

		}

	}	

}

function valid_login($username,$password,$xerte_toolkits_site){

	$link = mysql_connect($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password);

	mysql_select_db($xerte_toolkits_site->database_name);

	$ldap_hosts = mysql_query("select * from " . $xerte_toolkits_site->database_table_prefix . "ldap");

	if(!$ldap_hosts){
	
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
	
	}else{

		while($host = mysql_fetch_array($ldap_hosts)){

			$result = authenticate_to_host($host['ldap_host'],$host['ldap_port'],$host['ldap_password'],$host['ldap_username'],$host['ldap_basedn'],$host['ldap_filter'],$host['ldap_filter_attr'],$username,$password,$xerte_toolkits_site);
		
			if($result[0]){

				return true;

			}
			
		}
	
	}

	return false;	
	
}

require("../config.php");

if(valid_login($_POST['username'],$_POST['password'],$xerte_toolkits_site)){

	echo "Logging in worked";

}else{

	echo "Logging in failed";

}

$data = get_user_details($_POST['username'],$_POST['password']);

echo "<p>Getting LDAP record for user - to work with Toolkits - [sn][0] should the surname and [givenname][0] should be the first name<pre>";

print_r($data[1][0]);

?>
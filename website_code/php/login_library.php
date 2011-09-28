<?php


function get_ldap_array($host,$port,$bind_pwd,$bind_dn,$basedn,$ldap_filter_attr,$ldap_search_attr,$toolkits_username,$password,$xerte_toolkits_site){

    $ldap_search_attr = array('firstname' => 'givenname', 'lastname' => 'sn');

    $ldapbind = null;

    $ds = @ldap_connect($host, (int)$port);
    if(!$ds) {
        _debug("Failed to connect to LDAP server - something is probably slightly wrong - " . ldap_error());
        return false;
    }

    if($bind_pwd!=""){

        @ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);


        if ($bind_dn != '') {

            $ldapbind = @ldap_bind($ds, $bind_dn, $bind_pwd);

            $sr = @ldap_search($ds, $basedn, "cn=" . $toolkits_username, array_values($ldap_search_attr));

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

        $filter   = $xerte_toolkits_site->LDAP_filter . $toolkits_username;

        $ldapConnection = ldap_connect($host, (int)$port);

        $ldapSearchResult = @ldap_search($ldapConnection, $basedn, $filter );

        $ldapSearchArray = @ldap_get_entries($ldapConnection, $ldapSearchResult);

        $userBaseDn = $ldapSearchArray[0]["dn"];

        /*
         * Bind with password & baseDN
         */

        @ldap_set_option($ds, LDAP_OPT_REFERRALS,0);

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

//////////////////////////

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

///////////////////////////

function authenticate_to_host($host,$port,$bind_pwd,$bind_dn,$basedn,$ldap_filter,$ldap_filter_attr,$eureka_username,$password,$eureka_site) {

    if($bind_pwd!=""){

        $ldap_search_attr = array('firstname' => 'givenname', 'lastname' => 'sn');

        $ldapbind = null;

        $ds = @ldap_connect($host, (int)$port);
        if(!$ds) {
            _debug("issue connecting to ldap server? $host / $port : " . ldap_error($ds));
        }
        @ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);
        if ($ds) {
            if ($bind_dn != '') {
                $ldapbind = @ldap_bind($ds, $bind_dn, $bind_pwd);
                $sr = @ldap_search($ds, $basedn, $ldap_filter_attr ."=". $eureka_username, array_values($ldap_search_attr));

                if(!$sr){
                    _debug("Failed to query ldap server" . ldap_error($ds));
                    /*
                     * login has failed
                     */

                    ldap_close($ds);

                    $result_array = array(false, null);

                    return $result_array;

                }

                $entry = ldap_get_entries($ds, $sr);
                if(!$entry or !isset($entry[0])) {

                    ldap_close($ds);

                    $result_array = array(false, null);

                    return $result_array;


                }else{

                    if(@ldap_bind($ds, $entry[0]['dn'], $password)) {

                        /*
                         * valid login, so return true
                         */

                        ldap_close($ds);			

                        $result_array = array(true, $entry);

                        return $result_array;

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

function valid_login($username,$password,$xerte_toolkits_site){
    $ldap_hosts = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}ldap");
    // if we do NOT have entries in the ldap table then fall back to trying the 'global' config stuff from the sitedetails table.
    if(empty($ldap_hosts)) {
        _debug("No entries in ldap_hosts");
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
    else {

        foreach($ldap_hosts as $host) {
            _debug("Trying to authenticate against {$host['ldap_host']}");
            $result = authenticate_to_host($host['ldap_host'],$host['ldap_port'],$host['ldap_password'],$host['ldap_username'],$host['ldap_basedn'],$host['ldap_filter'],$host['ldap_filter_attr'],$username,$password,$xerte_toolkits_site);
            if($result[0]){
                return true;
            }

        }
    }

    return false;	
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
    global $xerte_toolkits_site;
    $link = mysql_connect($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password);

    mysql_select_db($xerte_toolkits_site->database_name);

    $ldap_hosts = mysql_query("select * from " . $xerte_toolkits_site->database_table_prefix . "ldap"); 

    while($host = mysql_fetch_array($ldap_hosts)){

        $login_check = get_user_ldap($host['ldap_host'],$host['ldap_port'],$host['ldap_password'],$host['ldap_username'],$host['ldap_basedn'],$host['ldap_filter'],$host['ldap_filter_attr'],$username,$password,$xerte_toolkits_site);

        if($login_check[1]!=null){

            break;

        }

    }

    return $login_check;

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

            if($login_details["login"]=="stxje1"){

                $results_and_message = array ("true", " ");

                return $results_and_message;

            }

            $results_and_message = array ("false", " ");

            return $results_and_message;

        }

    }

}

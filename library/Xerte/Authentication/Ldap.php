<?php
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

/**
 * For this to work, you'll need to have at least one entry in the XOT 'ldap' table. Example values (which work for me) are below :
 * 
 * ldap_host = localhost
 * ldap_port = 389
 * ldap_username = cn=admin,dc=blah,dc=com
 * ldap_password = <plain text password which you can connect to ldap with>
 * ldap_basedn = ou=xot,dc=blah,dc=com  -- this is where in the LDAP tree your XOT stuff lives. 
 * ldap_filter = cn    - field we try to do a match for the end user's username on.
 * ldap_filter_attr = uid 
 * 
 *  
 */
class Xerte_Authentication_Ldap extends Xerte_Authentication_Abstract
{

    private $_record = array();

    public function getUsername() {
        if(isset($this->_record['username'])) {
            return $this->_record['username'];
        }
        return null;
    }
    public function getFirstname()
    {
        if (isset($this->_record['fn'])) {
            return $this->_record['fn'];
        }
      if (isset($this->_record['firstname'])) {
        return $this->_record['firstname'];
      }
        return null;
    }

    public function getSurname()
    {
        if (isset($this->_record['sn'])) {
            return $this->_record['sn'];
        }
      if (isset($this->_record['surname'])) {
        return $this->_record['surname'];
      }
        return null;
    }

    public function check()
    {
        $xerte_toolkits_site = $this->xerte_toolkits_site;
        
        if (!function_exists('ldap_connect')) {
            $this->addError(INDEX_NO_LDAP);
            return false;
        }
        $ldap_config = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}ldap");
        if(empty($ldap_config)) { 
            $this->addError("LDAP servers not configured in DB");
            return false;
        }
        return true;
    }

    public function login($username, $password)
    {
         _debug("Valid login? $username / $password");
        if ($this->_valid_login($username, $password)) {
            return true;
        }
        return false;
    }

    /**
     * Loops through all configured LDAP servers to try the username/password on each one - returns once it finds one that succeeds. If all fail, we return false.
     * 
     * @param string $username
     * @param string $password
     * @return boolean true on success 
     */
    private function _valid_login($username, $password)
    {

        $xerte_toolkits_site = $this->xerte_toolkits_site;

        $ldap_hosts = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}ldap");

        foreach ($ldap_hosts as $host) {
            _debug("Trying to authenticate against {$host['ldap_host']}");
            $result = $this->_authenticate_to_host($host['ldap_host'], $host['ldap_port'], $host['ldap_password'], $host['ldap_username'], $host['ldap_basedn'], $host['ldap_filter'], $host['ldap_filter_attr'], $username, $password);

            if ($result === true) {
				$this->removeErrors();
                return true;
            }
        }

        return false;
    }

    /**
     * LDAP authentication routine.
     * 
     * @param string $host - e.g.localhost
     * @param string $port -- e.g. 389
     * @param string $bind_pwd - if your server allows anonymous bind this can be blank; otherwise it (and bind_dn) need to be valid login details to the server.
     * @param string $bind_dn
     * @param string $basedn - where in the LDAP tree we look for user accounts
     * @param string $ldap_filter - we filter records on this
     * @param string $ldap_filter_attr
     * @param string $xot_username - username provided by end user
     * @param string $password - password provided by end user
     * @return boolean true on success
     */
    private function _authenticate_to_host($host, $port, $bind_pwd, $bind_dn, $basedn, $ldap_filter, $ldap_filter_attr, $xot_username, $password)
    {

        if ($bind_pwd != "") {

            $ldap_search_attr = array('firstname' => 'givenname', 'lastname' => 'sn');

            $ldapbind = null;

            $ds = @ldap_connect($host, (int) $port);
            if (!$ds) {
                $this->addError("Issue connecting to ldap server (#1) : Connecting");
                _debug("issue connecting to ldap server? $host / $port : " . ldap_error($ds));
                return false;
            }

            @ldap_set_option($ds, LDAP_OPT_PROTOCOL_VERSION, 3);
            if ($bind_dn != '') {
                $ldapbind = @ldap_bind($ds, $bind_dn, $bind_pwd);
                if (!$ldapbind) {
                    $this->addError("Issue connecting to ldap server (#2) : Binding");
                    _debug("Failed to bind to ldap server- perhaps the dn($bind_dn) or password($bind_pwd) are incorrect?");
                    return false;
                }
                $sr = @ldap_search($ds, $basedn, $ldap_filter_attr . "=". $xot_username, array_values($ldap_search_attr));
                if (!$sr) {
                    $this->addError("Issue connecting to ldap server (#3) : Searching ");
                    _debug("Failed to query ldap server" . ldap_error($ds));
                    return false;
                }
                _debug("Searched $basedn / $ldap_filter_attr $xot_username ");

                $entry = ldap_get_entries($ds, $sr);
                //var_dump($entry);
                if (!$entry or !isset($entry[0])) {
                    _debug("No entries found" . print_r($entry, true));
                    $this->addError("Issue connecting to ldap server (#4) : No entries found ");
                    return false;
                } else {
                    if (@ldap_bind($ds, $entry[0]['dn'], $password)) {
                        _debug("Login ok " . print_r($entry, true));
                        /*
                         * valid login, so return true
                         */

                        $this->_record = array('firstname' => $entry[0]['givenname'][0], 'surname' => $entry[0]['sn'][0], 'username' => $xot_username);
                        return true;
                    }
                }
            }
        } else {

            $filter = $ldap_filter . $xot_username;
            $ldapConnection = ldap_connect($host, (int) $port);

            $ldapSearchResult = ldap_search($ldapConnection, $basedn, $filter);
            if ($ldapSearchResult === false)
            {
                _debug("Cannot search ldap server " . ldap_error($ldapConnection));
            }
            if ($ldapSearchResult) {
                $ldapSearchArray = ldap_get_entries($ldapConnection, $ldapSearchResult);
                $userBaseDn = $ldapSearchArray[0]["dn"];

                /*
                 * Bind with password & baseDN
                 */

                if ($ldapConnection) {
                    if (@ldap_bind($ldapConnection, $userBaseDn, $password)) {
                        $entry = @ldap_get_entries($ldapConnection, $ldapSearchResult);
                        if (!empty($entry)) {
                            $this->_record = $entry;
                            $this->_record['username'] = $xot_username;
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

}

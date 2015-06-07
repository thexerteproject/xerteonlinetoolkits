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
abstract class Xerte_Authentication_Abstract
{

    /**
     * List of strings (error messages thrown up somehow... for display to the end user
     * @var array  
     */
    protected $_errors = array();

    /**
     * @var StdClass - see config.php.
     */
    protected $xerte_toolkits_site = null;

    /**
     * @param string $username
     * @param string $password
     * @return boolean true on success; on failure, return false. You'll need to then call getErrors().
     */
    abstract public function login($username, $password);

    /**
     * @return array of error messages (Strings); empty if there are none
     */
    public function getErrors()
    {
        return array_unique($this->_errors);
    }

    public function addError($string)
    {
        $this->_errors[] = $string;
    }
	
	public function removeErrors()
    {
        $this->_errors = array();
    }

    /**
     * @return string user's firstname
     */
    abstract public function getFirstname();

    /**
     * @return string user's surname
     */
    abstract public function getSurname();

    /**
     * @param StdClass $xerte_toolkits_site
     */
    public function __construct($xerte_toolkits_site)
    {
        $this->xerte_toolkits_site = $xerte_toolkits_site;
    }

    /**
     *@return string $username provided by the end user or the auth mechanism (e.g. Moodle session contents etc) 
     */
    abstract public function getUsername();
    /**
     * Perform some sort of check to ensure stuff is configured correctly.... e.g. for LDAP make sure the user has the 'ldap_connect' function available etc
     * If any errors are found; retrieve via getErrors();
     * @return boolean true
     */
    abstract public function check();
    
    /**
     *Change this to return FALSE in one of the other authenticators, and the end user shouldn't be shown the login box/dialogue - presumably
     * because there's some sort of single sign on in place which we can test immediately without them needing to fill in a login box.
     * 
     * @return boolean true if they need to login.
     */
    public function needsLogin() {
        return true;
    }

    public function hasLogout() {
        return false;
    }

    public function logout()
    {
        return true;
    }

    /**
     * canManageUser
     *
     * Change this to return true if the four AJAX functions getUserList(), addUser(), delUser() and changePassword() are implemented.
     * Using these four functions the users can be fully managed in the management page
     */
    public function canManageUser(&$jsscript)
    {
        $jsscript="";
        return false;
    }

    /**
     * getUserList
     *
     * Create a form that contains a list, or selection box with all users, and the capability to change password, delete user, and add a new user
     * @param $changed, indicates whether this function is called after an update. It should mention that the list has been updated and displays $mesg below the form,
     *                  see Db.php for an example
     * @param $mesg, message to display if $changed is true
     * @return string, contains the form code to manage users. It will be placed dynamically in the Users management page
     */
    public function getUserList($changed, $mesg)
    {
        echo "";
    }

    public function addUser($username, $firstname, $surname, $passwd, $email)
    {
        $this->getUserList(true, "");
    }

    public function delUser($username)
    {
        $this->getUserList(true, "");
    }

    public function changePassword($username, $newpassword)
    {
        $this->getUserList(true, "");
    }

}

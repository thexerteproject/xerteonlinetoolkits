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
 * Always returns true; ideal for demonstration so someone can just click the 'login' button.
 *  
 */
class Xerte_Authentication_Moodle extends Xerte_Authentication_Abstract
{
    /* @var $_record array - contains the current user's details - expects keys like firstname, surname */

    private $_record = null;

    public function getUsername()
    {
        return $this->_record->username;
    }

    public function getFirstname()
    {
        return $this->_record->firstname;
    }

    public function getSurname()
    {
        return $this->_record->lastname;
    }

    public function getEmail()
    {
        if (isset($this->_record->email)) {
            return $this->_record->email;
        }
        return null;
    }

    public function check()
    {
        if (!isset($_SESSION['integrate_with_moodle'])) {
            $this->addError("Moodle integration not enabled");
        }
    }

    /** Moodle integration should result in us having some funky stuff enabled magically ... */
    public function needsLogin()
    {
        global $USER;
        if (empty($USER)) {
            return true;
        }
        $this->_record = $USER;
        require_login(); /// moodle function - should shunt the user over to a login page for Moodle if it's needed. Hopefully there are no scope issues from calling it here in a function.
        return false;
    }

    public function login($username, $password)
    {
        return true;
    }

}


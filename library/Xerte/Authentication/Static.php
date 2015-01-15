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
 * This containts a hard coded list of username/passwords. 
 * Ideally the configuration of this hard coded list should be moved outside of this file,... but for now it isn't.
 *  
 */
class Xerte_Authentication_Static extends Xerte_Authentication_Abstract
{
    /* @var $_record array - contains the current user's details - expects keys like firstname, surname*/
    private $_record = array();

    /** Edit this list to your hearts content ... */
    private $_users = array(
        'pat' => array("username" => "pat", "password" => "patpassword", "firstname" => "Pat", "surname" => "West"),
        'john' => array("username" => "john", "password" => "johnpassword", "firstname" => "David", "surname" => "george"),
        'bob' => array("username" => "bob", "password" => "bobpassword", "firstname" => "Robert", "surname" => "jones"),
        'sarah' => array("username" => "sarah", "password" => "sarahpassword", "firstname" => "Sarah", "surname" => "smith"),
    );

    public function getUsername() {
        return $this->_record['username'];
    }
    public function getFirstname()
    {
        return $this->_record['firstname'];
    }

    public function getSurname()
    {
        return $this->_record['surname'];
    }

    public function check()
    {
        return true;
    }

    public function login($username, $password)
    {
        foreach ($this->_users as $user) {
            if ($user['username'] == $username && $user['password'] == $password) {
                $this->_record = $user;
                return true;
            }
        }
        return false;
    }

}

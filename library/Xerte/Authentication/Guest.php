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
class Xerte_Authentication_Guest extends Xerte_Authentication_Abstract
{
    /* @var $_record array - contains the current user's details - expects keys like firstname, surname*/
    private $_record = array();


    public function getUsername() {
        return 'guest2';
    }
    
    public function getFirstname()
    {
        return "Guest";
    }

    public function getSurname()
    {
        return "User"; 
    }

    public function getEmail()
    {
        return "";
    }

    public function check()
    {
        return true;
    }

    public function login($username, $password)
    {
       return true;
    }
    public function needsLogin() {
        return false;
    }

}

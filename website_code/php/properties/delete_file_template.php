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
 * 
 * delete file template, allows the site to delete files from the media folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

include "../error_library.php";

/** XXX/ TODO SECURITY HOLE - NEED TO CHECK $_POST['file'] IS VALID */

session_start();

if(!isset($_SESSION['toolkits_logon_username'])) {
    die("Sorry; you can't delete this without being logged in.");
}

if(unlink(urldecode($_POST['file']))){
    receive_message($_SESSION['toolkits_logon_username'], "FILE", "SUCCESS", "The file " . $_POST['file'] . "has been deleted", "User " . $_SESSION['toolkits_logon_username'] . " has deleted " . $_POST['file']);
}else{
    receive_message($_SESSION['toolkits_logon_username'], "FILE", "MAJOR", "The file " . $_POST['file'] . "hasn't been deleted", "User " . $_SESSION['toolkits_logon_username'] . " was not deleted " . $_POST['file']);
}

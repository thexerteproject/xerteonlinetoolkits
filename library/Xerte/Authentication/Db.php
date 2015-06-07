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
 * Requires a db table called user which contains fields called firstname, surname, password and username.
 *
 * CREATE TABLE user ( id int(11) primary key auto_increment, username varchar(50) not null, password varchar(50) not null, firstname varchar(50) not null, surname varchar(50) not null) ;
 *
 * Pass attention to the _hashAndSalt() method below - if you add any users into the above database, you will need to either use the same salt as defined below, or modify this code.
 * Furthermore you will need to ensure your passwords in the DB are hashed using the same mechanism (currently sha1).
 *
 * @see Xerte_Authentication_Abstract
 */

_load_language_file("/library/Xerte/Authentication/Db.inc");

class Xerte_Authentication_Db extends Xerte_Authentication_Abstract
{

    private $_record = array();

    public function getFirstname()
    {
        if (isset($this->_record['firstname'])) {
            return $this->_record['firstname'];
        }
        return null;
    }
    public function getUsername()
    {
        if (isset($this->_record['username'])) {
            return $this->_record['username'];
        }
        return null;
    }


    public function getSurname()
    {
        if (isset($this->_record['surname'])) {
            return $this->_record['surname'];
        }
        return null;
    }

    public function check()
    {
        global $xerte_toolkits_site;
        _debug("Calling check");
        // check for existence of the 'user' db table?
        $x = db_query("select 1 from {$xerte_toolkits_site->database_table_prefix}user");
        if ($x === false) {
            // Create the user table
            $x = db_query("create table {$xerte_toolkits_site->database_table_prefix}user  ( `iduser` INT NOT NULL AUTO_INCREMENT, `username` VARCHAR(45) NULL ,  `password` VARCHAR(45) NULL ,  `firstname` VARCHAR(45) NULL ,  `surname` VARCHAR(45) NULL ,  `email` VARCHAR(45) NULL, PRIMARY KEY (`iduser`) )");
            if (empty($x))
            {
                _debug("Failed: Does the user table exist?");
                $this->addError("Does the user table exist?");
                return false;
            }
            else
            {
                _debug("Succeeded!");
                return true;
            }
        }
        _debug("Succeeded!");
	    return true;
    }

    public function login($username, $password)
    {
        global $xerte_toolkits_site;
        $spassword = $this->_hashAndSalt($username, $password);
        $row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}user WHERE username = ? AND password = ?", array($username, $spassword));
        if (!empty($row)) {
            $this->_record = $row;
            return true;
        }
        return false;
    }

    /**
     * Return salted value of the user's password - this is what we'll store in the DB.
     * @param type $username (you might change this to store a unique salt against each user!).
     * @param type $password
     * @return type string sha1'ed password.
     */
    private function _hashAndSalt($username, $password)
    {
        // well, it's better than no salt!
        return sha1("stablehorseboltapple" . $username . $password);
    }

    public function canManageUser(&$jsscript)
    {
        $jsscript = "library/Xerte/Authentication/Db.js";
        return true;
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
        global $xerte_toolkits_site;
        $result = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}user order by surname,firstname,username");

        //_include_javascript_file("library/Xerte/Authentication/Db.js");

        echo "<div style=\"margin-left:20px\" >";
        echo "<form name=\"user_authDb_list\" margin-left=\"20px\">";

	$username = '';
	$firstname = '';
	$surname = '';
	$email = '';

	if ($result) {
            echo "<select onchange=\"changeUserSelection_authDb_user()\" id=\"authDb_list_user\">";

            $first = true;
            foreach($result as $row_users){
                if ($first) {
                    echo "<p><option selected=\"selected\" value=\"" . $row_users['username'] . "\">" . $row_users['firstname'] . " " . $row_users['surname'] . " (" . $row_users['username'] . ")</option>";
                    $username = $row_users['username'];
                    $firstname = $row_users['firstname'];
                    $surname = $row_users['surname'];
                    $email = $row_users['email'];
                    $first = false;
            	}
                else {
                    echo "<p><option value=\"" . $row_users['username'] . "\">" . $row_users['firstname'] . " " . $row_users['surname'] . " (" . $row_users['username'] . ")</option>";
                }
            }

            echo "</select>";
            echo "<button type=\"button\" class=\"xerte_button\" onclick=\"delete_authDb_user()\">" . AUTH_DB_DELETEUSER . "</button>";
	}

        echo "<br /><table>";
        echo "<tr><td><label for=\"authDb_username\">"  . AUTH_DB_USERNAME . "</label></td><td><input type=\"text\" id=\"authDb_username\" value=\"" . $username . "\" /></tr>";
        echo "<tr><td><label for=\"authDb_firstname\">" . AUTH_DB_FIRSTNAME . "</label></td><td><input type=\"text\" id=\"authDb_firstname\" value=\"" . $firstname . "\" /></tr>";
        echo "<tr><td><label for=\"authDb_surname\">" . AUTH_DB_SURNAME . "</label></td><td><input type=\"text\" id=\"authDb_surname\" value=\"" . $surname . "\" /></tr>";
        echo "<tr><td><label for=\"authDb_password\">" . AUTH_DB_PASSWORD . "</label></td><td><input type=\"password\" id=\"authDb_password\" value=\"\" /></tr>";
        echo "<tr><td><label for=\"authDb_email\">" . AUTH_DB_EMAIL . "</label></td><td><input type=\"text\" id=\"authDb_email\" value=\"" . $email . "\" /></tr>";
        echo "</table>";
        echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"add_authDb_user()\">" . AUTH_DB_ADDUSER . "</button>";
        echo "<button type=\"button\" class=\"xerte_button\" onclick=\"mod_authDb_user()\">" . AUTH_DB_MODUSER . "</button>";
        echo "<button type=\"button\" class=\"xerte_button\" onclick=\"changepassword_authDb_user()\">" . AUTH_DB_CHANGEPASSWD . "</button></p>";
        echo "</form></div>";
        if ($changed)
        {
            echo $mesg;
        }
    }

    public function changeUserSelection($username)
    {
        global $xerte_toolkits_site;
        $result = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}user order by surname,firstname,username");

        //_include_javascript_file("library/Xerte/Authentication/Db.js");

        echo "<div style=\"margin-left:20px\" >";
        echo "<form name=\"user_authDb_list\" margin-left=\"20px\"><select onchange=\"changeUserSelection_authDb_user()\" id=\"authDb_list_user\">";

        foreach($result as $row_users){
            if ($row_users['username'] == $username)
            {
                echo "<p><option selected=\"selected\" value=\"" . $row_users['username'] . "\">" . $row_users['firstname'] . " " . $row_users['surname'] . " (" . $row_users['username'] . ")</option>";
                $firstname = $row_users['firstname'];
                $surname = $row_users['surname'];
                $email = $row_users['email'];
            }
            else
            {
                echo "<p><option value=\"" . $row_users['username'] . "\">" . $row_users['firstname'] . " " . $row_users['surname'] . " (" . $row_users['username'] . ")</option>";
            }
        }

        echo "</select>";
        echo "<button type=\"button\" class=\"xerte_button\" onclick=\"delete_authDb_user()\">" . AUTH_DB_DELETEUSER . "</button>";
        echo "<br /><table>";
        echo "<tr><td><label for=\"authDb_username\">"  . AUTH_DB_USERNAME . "</label></td><td><input type=\"text\" id=\"authDb_username\" value=\"" . $username . "\" /></tr>";
        echo "<tr><td><label for=\"authDb_firstname\">" . AUTH_DB_FIRSTNAME . "</label></td><td><input type=\"text\" id=\"authDb_firstname\" value=\"" . $firstname . "\" /></tr>";
        echo "<tr><td><label for=\"authDb_surname\">" . AUTH_DB_SURNAME . "</label></td><td><input type=\"text\" id=\"authDb_surname\" value=\"" . $surname . "\" /></tr>";
        echo "<tr><td><label for=\"authDb_password\">" . AUTH_DB_PASSWORD . "</label></td><td><input type=\"password\" id=\"authDb_password\" value=\"\" /></tr>";
        echo "<tr><td><label for=\"authDb_email\">" . AUTH_DB_EMAIL . "</label></td><td><input type=\"text\" id=\"authDb_email\" value=\"" . $email . "\" /></tr>";
        echo "</table>";
        echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"add_authDb_user()\">" . AUTH_DB_ADDUSER . "</button>";
        echo "<button type=\"button\" class=\"xerte_button\" onclick=\"mod_authDb_user()\">" . AUTH_DB_MODUSER . "</button>";
        echo "<button type=\"button\" class=\"xerte_button\" onclick=\"changepassword_authDb_user()\">" . AUTH_DB_CHANGEPASSWD . "</button></p>";
        echo "</form></div>";
    }

    public function addUser($username, $firstname, $surname, $passwd, $email)
    {
        global $xerte_toolkits_site;
        // Check if user exists
        $row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}user WHERE username = ?", array($username));
        if (!empty($row))
        {
            return "<li>" . AUTH_DB_USEREXISTS . "</li>";
        }
        // Insert user
        $spassword = $this->_hashAndSalt($username, $passwd);

        $query="insert into {$xerte_toolkits_site->database_table_prefix}user set firstname=?, surname=?, username=?, password=?, email=?";
        $params = array($firstname, $surname, $username, $spassword, $email);
        $res = db_query($query, $params);
        if ($res !== false)
            return "";
        else
            return "<li>" . AUTH_DB_USERADDFAILED . "</li>";
    }

    public function modUser($username, $firstname, $surname, $passwd, $email)
    {
        global $xerte_toolkits_site;
        // Check if user exists
        $row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}user WHERE username = ?", array($username));
        if (empty($row))
        {
            return "<li>" . AUTH_DB_USERDOESNOTEXIST . "</li>";
        }
        // Modify user
        $set = "";
        $params = array();
        if (strlen($firstname)>0)
        {
            $set .= "firstname=?";
            $params[] = $firstname;
        }
        if (strlen($surname))
        {
            if (strlen($set) > 0)
                $set .= ", ";
            $set .= "surname=?";
            $params[] = $surname;
        }
        if (strlen($passwd) > 0)
        {
            $spassword = $this->_hashAndSalt($username, $passwd);
            if (strlen($set) > 0)
                $set .= ", ";
            $set .= "password=?";
            $params[] = $password;
        }
        if (strlen($email))
        {
            if (strlen($set) > 0)
                $set .= ", ";
            $set .= "email=?";
            $params[] = $email;
        }

        $query="update {$xerte_toolkits_site->database_table_prefix}user set " . $set . " where iduser=" . $row['iduser'];
        $res = db_query($query, $params);
        if ($res !== false)
            return "";
        else
            return "<li>" . AUTH_DB_USERMODFAILED . "</li>";
    }

    public function delUser($username)
    {
        global $xerte_toolkits_site;
        $query="delete from {$xerte_toolkits_site->database_table_prefix}user where username=?";
        $params = array($username);
        $res = db_query($query, $params);
        if ($res !== false)
            return "";
        else
            return "<li>" . AUTH_DB_USERDELFAILED . "</li>";

    }

    public function changePassword($username, $newpassword)
    {
        global $xerte_toolkits_site;
        $spassword = $this->_hashAndSalt($username, $newpassword);
        $query="update {$xerte_toolkits_site->database_table_prefix}user set password=? where username=?";
        $params = array($spassword, $username);
        $res = db_query($query, $params);
        if ($res !== false)
            return "";
        else
            return "<li>" . AUTH_DB_CHANGEPASSWORDFAILED . "</li>";
    }

}

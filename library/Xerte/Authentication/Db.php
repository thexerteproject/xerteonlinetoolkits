<?php
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
        if (!function_exists('mysql_query')) {
            $this->addError("MySQL not available?");
            return false;
        }
        // check for existence of the 'user' db table?
        $x = db_query("SHOW CREATE TABLE {$xerte_toolkits_site->database_table_prefix}user");
        if (empty($x)) {
            // Create the user table
            $x = db_query("create table {$xerte_toolkits_site->database_table_prefix}user  ( 'iduser' INT NOT NULL, 'username' VARCHAR(45) NULL ,  'password' VARCHAR(45) NULL ,  'firstname' VARCHAR(45) NULL ,  'surname' VARCHAR(45) NULL ,  PRIMARY KEY ('iduser') )");
            if (empty($x))
            {
                $this->addError("Does the user table exist?");
                return false;
            }
            else
                return true;
        }
	    return true;
    }

    public function login($username, $password)
    {
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
        $result = db_query("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}user order by surname,firstname,username");

        //_include_javascript_file("library/Xerte/Authentication/Db.js");

        echo "<form name=\"user_authDb_list\" ><select id=\"authDb_list_user\">";

        foreach($result as $row_users){
            echo "<p><option value=\"" . $row_users['username'] . "\">" . $row_users['firstname'] . " " . $row_users['surname'] . " (" . $row_users['username'] . ")</option>";
        }

        echo "</select>";
        echo "<button type=\"button\" class=\"xerte_button\" onclick=\"delete_authDb_user()\">" . AUTH_DB_DELETEUSER . "</button>";
        echo "<input type=\"password\" id=\"authDb_changepassword\" value=\"\" />";
        echo "<button type=\"button\" class=\"xerte_button\" onclick=\"changepassword_authDb_user()\">" . AUTH_DB_CHANGEPASSWD . "</button></p>";
        echo "<br />";
        echo "<p>" . AUTH_DB_USERNAME . "<input type=\"text\" id=\"authDb_username\" value=\"\" /></p>";
        echo "<p>" . AUTH_DB_FIRSTNAME . "<input type=\"text\" id=\"authDb_firstname\" value=\"\" /></p>";
        echo "<p>" . AUTH_DB_SURNAME . "<input type=\"text\" id=\"authDb_surname\" value=\"\" /></p>";
        echo "<p>" . AUTH_DB_PASSWORD . "<input type=\"password\" id=\"authDb_password\" value=\"\" /></p>";
        echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"add_authDb_user()\">" . AUTH_DB_ADDUSER . "</button></p>";
        echo "</form>";
        if ($changed)
        {
            echo $mesg;
        }
    }

    public function addUser($username, $firstname, $surname, $passwd)
    {
        // Check if user exists
        $row = db_query_one("SELECT * FROM {$xerte_toolkits_site->database_table_prefix}user WHERE username = ?", array($username));
        if (!empty($row))
        {
            return "<li>" . AUTH_DB_USEREXISTS . "</li>";
        }
        // Insert user
        $spassword = $this->_hashAndSalt($username, $passwd);

        $query="insert into {$xerte_toolkits_site->database_table_prefix}user set firstname=?, surname=?, username=?, password=?";
        $params = array($firstname, $surname, $username, $spassword);
        $res = db_query($query, $params);
        if ($res)
            return "";
        else
            return "<li>" . AUTH_DB_USERADDFAILED . "</li>";
    }

    public function delUser($username)
    {
        $query="delete from {$xerte_toolkits_site->database_table_prefix}user where username=?";
        $params = array($username);
        $res = db_query($query, $params);
        if ($res)
            return "";
        else
            return "<li>" . AUTH_DB_USERDELFAILED . "</li>";

    }

    public function changePassword($username, $newpassword)
    {
        $spassword = $this->_hashAndSalt($username, $newpassword);
        $query="update {$xerte_toolkits_site->database_table_prefix}user set password=? where username=?";
        $params = array($spassword, $username);
        $res = db_query($query, $params);
        if ($res)
            return "";
        else
            return "<li>" . AUTH_DB_CHANGEPASSWORDFAILED . "</li>";
    }

}

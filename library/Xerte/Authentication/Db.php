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
class Xerte_Authetication_Db extends Xerte_Authentication_Abstract
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
        // TODO - add query here to check for existance of the 'user' db table?
        $x = db_query("SHOW CREATE TABLE user");
        if (empty($x)) {
            $this->addError("Does the user table exist?");
            return false;
        }
    }

    public function login($username, $password)
    {
        $password = $this->_hashAndSalt($username, $password);
        $row = db_query_one("SELECT * FROM user WHERE username = ? AND password = ?", array($username, $password));
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

}

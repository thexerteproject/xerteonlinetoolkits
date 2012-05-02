<?php

/* Moodle User object */
global $USER;

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


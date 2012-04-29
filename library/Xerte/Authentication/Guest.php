<?php

/**
 * Always returns true; ideal for demonstration so someone can just click the 'login' button.
 *  
 */
class Xerte_Authentication_Guest extends Xerte_Authentication_Abstract
{
    /* @var $_record array - contains the current user's details - expects keys like firstname, surname*/
    private $_record = array();


    public function getUsername() {
        return 'guest';
    }
    
    public function getFirstname()
    {
        return "Guest";
    }

    public function getSurname()
    {
        return "User"; 
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

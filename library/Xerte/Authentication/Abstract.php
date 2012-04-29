<?php

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
     * Perform some sort of check to ensure stuff is configured correctly.... e.g. for LDAP make sure the user has the 'ldap_connect' function available etc
     * If any errors are found; retrieve via getErrors();
     * @return boolean true
     */
    abstract public function check();
}

<?php

/**
 *Responsible for creating the appropriate instance of the authentication adaptor.... 
 * 
 * @see config.php
 * @see Xerte_Autethentication_Db
 * @see Xerte_Authentication_Abstract
 * @see Xerte_Authentication_Ldap 
 * etc.
 * 
 */
class Xerte_Authentication_Factory
{

    /**
     * @global StdClass $xerte_toolkits_site
     * @param string $method
     * @return Xerte_Authentication_Abstract  subclass (class which extends this).
     * @throws InvalidArgumentException 
     */
    public static function create($method)
    {
        global $xerte_toolkits_site;

        $method = ucfirst(strtolower($method));
        if (is_file(dirname(__FILE__) . DIRECTORY_SEPARATOR . $method . ".php")) {
            $class_name = "Xerte_Authentication_$method";

            $auth_mech = new $class_name($xerte_toolkits_site);
            return $auth_mech;
        }
        //throw new InvalidArgumentException("Authentication mechanism defined in xerte_site_details is not valid");
    }
}
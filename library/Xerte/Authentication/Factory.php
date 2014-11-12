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
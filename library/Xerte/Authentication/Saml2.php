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


class Xerte_Authentication_Saml2 extends Xerte_Authentication_Abstract
{

    private $_record = array();

    private $_saml2config = array(
        'ssourl' => 'https://sso.12change.eu/xertesso.php',
        // 'slourl' => 'https://sso.12change.eu/xerteslo.php',
        'slourl' => 'https://engine.surfconext.nl/logout',
    );

    public function getUsername() {
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
        return true;
    }

    public function login($username, $password)
    {
        return true;
    }

    /** Saml2 integration */
    public function needsLogin()
    {
        // Redirect to sso site with xertelogin.php RelayState
        // sso site should do a saml sso, and the RelayState xertelogin.php, should POST all required data to
        // <this website>/library/Xerte/Authentication/Saml2/xertelogin.php
        //
        // The latter xertelogin.php should set the SESSION as required and the _record
        //
        // This implementation is based on One_Logins Saml2 php implementation

        if (!isset($_SESSION['saml2session'])) {
            $_SESSION['saml2reqid'] = base64_encode(openssl_random_pseudo_bytes(10));
            $url = $this->_saml2config['ssourl'] . "?site=" . $this->xerte_toolkits_site->site_url . "&returnurl=library/Xerte/Authentication/Saml2/saml2login.php&request=" . $_SESSION['saml2reqid'];
            header("Location: " . $url);
            exit;
        }
        else
        {
            $this->_record = json_decode($_SESSION['saml2session']);
            return false;
        }
    }

    public function hasLogout() {
        return true;
    }

    public function logout()
    {
        if (isset($_SESSION['saml2session'])) {
            session_destroy();

            $_SESSION['saml2reqid'] = base64_encode(openssl_random_pseudo_bytes(10));
            $url = $this->_saml2config['slourl'] . "?site=" . $this->xerte_toolkits_site->site_url . "&returnurl=library/Xerte/Authentication/Saml2/saml2login.php&request=" . $_SESSION['saml2reqid'];
            header("Location: " . $url);
            exit;
        }
        else
        {
            return true;
        }
    }

}

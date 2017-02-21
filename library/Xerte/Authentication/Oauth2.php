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

/*
require('OAuth2/Client.php');
require('OAuth2/GrantType/IGrantType.php');
require('OAuth2/GrantType/AuthorizationCode.php');
*/

require_once('OAuth2/Provider.php');
require_once('OAuth2/RandomInterface.php');
require_once('OAuth2/lib/random.php');
require_once('OAuth2/Random.php');
require_once('OAuth2/OAuth2Client.php');
require_once('OAuth2/AccessToken.php');
require_once('OAuth2/HttpClientInterface.php');
require_once('OAuth2/CurlHttpClient.php');

require('Oauth2_config.php');

class Xerte_Authentication_OAuth2 extends Xerte_Authentication_Abstract
{

    private $_record = array();

    private $_oauth2config;

    public function __construct()
    {
        global $oauth2config;
        $this->_oauth2config = $oauth2config;
    }

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

    public function getEmail()
    {
        if (isset($this->_record->email))
        {
            return $this->_record->email;
        }
        return null;
    }

    public function check()
    {
        return true;
    }

    public function login($username, $password)
    {
        return true;
    }

    /** OAuth2 integration */
    public function needsLogin()
    {
        global $xerte_toolkits_site;

        $provider = new \fkooman\OAuth\Client\Provider(
            $this->_oauth2config['CLIENT_ID'],
            $this->_oauth2config['CLIENT_SECRET'],
            $this->_oauth2config['AUTHORIZATION_ENDPOINT'],
            $this->_oauth2config['TOKEN_ENDPOINT']
        );
        $client = new \fkooman\OAuth\Client\OAuth2Client(
            $provider,
            new \fkooman\OAuth\Client\CurlHttpClient()
        );

        if (!isset($_SESSION['oauth2session'])) {
            $authUrl = $client->getAuthorizationRequestUri(
                'name email',                # the requested OAuth scope
                $xerte_toolkits_site->site_url . $this->_oauth2config['REDIRECT_URI'] # the redirect URI the OAuth service
            # redirects you back to, must usually
            # be registered at the OAuth provider
            );
            $_SESSION['oauth2_uri'] = $authUrl;
            header("Location: " . $authUrl);
            exit;
        }
        else
        {
            if (!isset($_SESSION['oauth2authorized']))
            {
                $accessTokenResult = json_decode($_SESSION['oauth2session']);
                //$client->setAccessToken($accessTokenResult->access_token);
                //$client->setAccessTokenType($this->_oauth2config['ACCESS_TOKENTYPE']);

                // API call to get user name etc.
                $channel = curl_init("<url>?access_token=" . $accessTokenResult->access_token)$channel = curl_init("<url>?access_token=" . $accessTokenResult->access_token);

                $optionsSet = curl_setopt_array(
                    $channel,
                    [
                        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
                        CURLOPT_SSL_VERIFYPEER => true,
                        CURLOPT_SSL_VERIFYHOST => 2,
                        CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
                        CURLOPT_USERPWD => sprintf('%s:%s', $provider->getId(), $provider->getSecret()),
                        CURLOPT_POST => false,
                        CURLOPT_RETURNTRANSFER => true,
                    ]
                );
                $result = curl_exec($channel);
                $http_code = curl_getinfo($channel, CURLINFO_HTTP_CODE);
                $content_type = curl_getinfo($channel, CURLINFO_CONTENT_TYPE);
                if ($curl_error = curl_error($channel)) {
                    // Restart
                    session_unset();
                    session_destroy();
                    header("Location: " . $xerte_toolkits_site->site_url);
                } else {
                    $json_decode = json_decode($result, true);
                }
                curl_close($channel);
                // Rbuild structure compatible with previous LGPL library
                $result = array(
                    'result' => (null === $json_decode) ? $result : $json_decode,
                    'code' => $http_code,
                    'content_type' => $content_type
                );

                if ($result['code'] != 200)
                {
                    // Restart
                    session_unset();
                    session_destroy();
                    header("Location: " . $xerte_toolkits_site->site_url);
                }
                $this->_record = new stdClass();
                $this->_record->result = $result;
                $this->_record->username = $result['result']['content']['objects'][0]['id'];
                $this->_record->firstname = $result['result']['content']['objects'][0]['first_name'];
                $this->_record->lastname = $result['result']['content']['objects'][0]['surname'];
                $this->_record->email = $result['result']['content']['objects'][0]['email'];
                $_SESSION['oauth2authorized'] = json_encode($this->_record);
            }
            else
            {
                $this->_record = json_decode($_SESSION['oauth2authorized']);
            }
            return false;
        }
    }

    public function hasLogout() {
        return true;
    }

    public function logout()
    {
        if (isset($_SESSION['oauth2authorized'])) {
            session_unset();
            session_destroy();
        }

        return true;

    }

}

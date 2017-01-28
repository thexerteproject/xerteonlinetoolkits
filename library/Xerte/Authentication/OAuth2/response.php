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
require('../../../../config.php');
//require('Client.php');
//require('GrantType/IGrantType.php');
//require('GrantType/AuthorizationCode.php');

require_once('Provider.php');
require_once('RandomInterface.php');
require_once('lib/random.php');
require_once('Random.php');
require_once('OAuth2Client.php');
require_once('AccessToken.php');
require_once('HttpClientInterface.php');
require_once('CurlHttpClient.php');

require('../Oauth2_config.php');


if (!isset($_GET['code'])) {
    die("Access denied!");
}
else {
    //$client = new OAuth2\Client($oauth2config['CLIENT_ID'], $oauth2config['CLIENT_SECRET'], OAuth2\Client::AUTH_TYPE_AUTHORIZATION_BASIC);
    //$params = array("code" => $_GET["code"], "redirect_uri" => $xerte_toolkits_site->site_url . $oauth2config['REDIRECT_URI']);
    //$response = $client->getAccessToken($oauth2config['TOKEN_ENDPOINT'], "authorization_code", $params);

    //$accessTokenResult = $response["result"];

    $provider = new \fkooman\OAuth\Client\Provider(
        $oauth2config['CLIENT_ID'],
        $oauth2config['CLIENT_SECRET'],
        $oauth2config['AUTHORIZATION_ENDPOINT'],
        $oauth2config['TOKEN_ENDPOINT']
    );
    $client = new \fkooman\OAuth\Client\OAuth2Client(
        $provider,
        new \fkooman\OAuth\Client\CurlHttpClient()
    );

    $accessTokenResult = $client->getAccessToken(
        $_SESSION['oauth2_uri'], # URI from session
        $_GET['code'],               # the code value (12345)
        $_GET['state']               # the state value (abcde)
    );

    $_SESSION['oauth2session'] = json_encode($accessTokenResult);

    header("Location: " . $xerte_toolkits_site->site_url);
}
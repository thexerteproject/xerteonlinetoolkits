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
session_start();

require_once '_toolkit_loader.php';

if (!isset($_SESSION['samlUserdata'])) {
    $settings = new OneLogin_Saml2_Settings();
    
    $authRequest = new OneLogin_Saml2_AuthnRequest($settings);
    $samlRequest = $authRequest->getRequest();

    $parameters = array('SAMLRequest' => $samlRequest);
    $parameters['RelayState'] = OneLogin_Saml2_Utils::getSelfURL();
    
    //echo str_replace("\n", "<BR>", str_replace(" ", "&nbsp;", print_r($settings, true)));
    //echo str_replace("\n", "<BR>", str_replace(" ", "&nbsp;", print_r($parameters, true)));

    $idpData = $settings->getIdPData();
    $ssoUrl = $idpData['singleSignOnService']['url'];
    $url = OneLogin_Saml2_Utils::redirect($ssoUrl, $parameters, true);

    header("Location: $url");
} else {
    if (!empty($_SESSION['samlUserdata'])) {
	$xertedata = array();

        // echo str_replace("\n", "<BR>", str_replace(" ", "&nbsp;", print_r($_SESSION['samlUserdata'], true)));
        // echo str_replace("\n", "<BR>", str_replace(" ", "&nbsp;", print_r($_REQUEST, true)));
	$xertedata['IdPSessionIndex'] = $_SESSION['IdPSessionIndex'];
	$xertedata['username'] = $_SESSION['samlUserdata']['urn:oid:0.9.2342.19200300.100.1.1'][0];  // uid
	$xertedata['firstname'] = $_SESSION['samlUserdata']['urn:oid:2.5.4.42'][0]; // givenName
	$xertedata['lastname'] = $_SESSION['samlUserdata']['urn:oid:2.5.4.4'][0];  // sn
	//$xertedata['name'] = $_SESSION['samlUserdata']['urn:oid:2.5.4.3'][0];   // cn
	//$xertedata['email'] = $_SESSION['samlUserdata']['urn:oid:0.9.2342.19200300.100.1.3'][0];  // mail
	$xertedata['saml2data'] = $_SESSION['samlUserdata'];
	$xertedata['saml2reqid'] = $_REQUEST['request'];
        $sertedata['site'] = $_REQUEST['site'];

	header("Location: " . $_GET['site'] . $_REQUEST['returnurl'] . "?response=" . urlencode(json_encode($xertedata)) . "&site=" . $_REQUEST['site']);

    } else {
        echo "<p>You don't have any attribute</p>";
    }
}

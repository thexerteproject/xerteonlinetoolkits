<?php
/**
 * SAMPLE Code to demonstrate how to initiate a SAML Authorization request
 *
 * When the user visits this URL, the browser will be redirected to the SSO
 * IdP with an authorization request. If successful, it will then be
 * redirected to the consume URL (specified in settings) with the auth
 * details.
 */

session_start();

require_once dirname(__FILE__).'/vendor/autoload.php';
require_once dirname(__FILE__).'/log.php';
require_once dirname(__FILE__).'/settings.php';

use OneLogin\Saml2\IdPMetadataParser;

if (!isset($_SESSION['samlUserdata'])) {
    $parseIdp = new IdPMetadataParser();
    $idpSettings = $parseIdp->parseRemoteXML($idpMetadataUrl);
    $settingsInfoArray = $parseIdp->injectIntoSettings($settingsInfoArray, $idpSettings);

    $settings = new OneLogin\Saml2\Settings($settingsInfoArray);
    $authRequest = new OneLogin\Saml2\AuthnRequest($settings);
    $samlRequest = $authRequest->getRequest();

    $parameters = array('SAMLRequest' => $samlRequest);
    $parameters['RelayState'] = OneLogin\Saml2\Utils::getSelfURL();

    //echo str_replace("\n", "<BR>", str_replace(" ", "&nbsp;", print_r($settings, true)));
    //echo str_replace("\n", "<BR>", str_replace(" ", "&nbsp;", print_r($parameters, true)));

    $idpData = $settings->getIdPData();
    $ssoUrl = $idpData['singleSignOnService']['url'];
    if (!empty($_REQUEST['sso_id']))
    {
        $ssoUrl .= '/' . $_REQUEST['sso_id'];
    }
    $url = OneLogin\Saml2\Utils::redirect($ssoUrl, $parameters, true);

    logToFile("Redirecting sso request to " . $url);
    header("Location: $url");
} else {
    if (!empty($_SESSION['samlUserdata'])) {
        logToFile("samlUserdata    : " . print_r($_SESSION['samlUserdata'], true));
        //logToFile("IdPSessionIndex : " . $_SESSION['IdPSessionIndex']);
        //logToFile("Recieved reply  : " . print_r($_REQUEST, true));
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
        if (isset($_SESSION['samlUserdata']['urn:oid:1.3.6.1.4.1.25178.1.2.9'])) {
            $xertedata['organisation'] = $_SESSION['samlUserdata']['urn:oid:1.3.6.1.4.1.25178.1.2.9'];
        }
        else{
            $xertedata['organisation'] = "unknown";
        }
        logToFile("xertedata: " . print_r($xertedata, true));
        logToFile('$_GET    : ' . print_r($_GET, true));
        logToFile('$_POST   : ' . print_r($_POST, true));
        logToFile("Permission granted, redirecting to " . $_GET['site'] . $_REQUEST['returnurl'] . "&site=" . $_REQUEST['site']);
        header("Location: " . $_GET['site'] . $_REQUEST['returnurl'] . "?response=" . rawurlencode(json_encode($xertedata)) . "&site=" . $_REQUEST['site']);
    } else {
        echo "<p>You don't have any attribute</p>";
    }
}


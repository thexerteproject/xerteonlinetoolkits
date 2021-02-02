<?php
/**
 * SAMPLE Code to demonstrate how to initiate a SAML Single Log Out request
 *
 * When the user visits this URL, the browser will be redirected to the SLO
 * IdP with an SLO request.
 */

session_start();

require_once dirname(__FILE__).'/vendor/autoload.php';
require_once dirname(__FILE__).'/settings.php';

use OneLogin\Saml2\IdPMetadataParser;

$parseIdp = new IdPMetadataParser();
$idpSettings = $parseIdp->parseRemoteXML($idpMetadataUrl);
$settingsInfoArray = $parseIdp->injectIntoSettings($settingsInfoArray, $idpSettings);

$samlSettings = new OneLogin\Saml2\Settings($settingsInfoArray);

$idpData = $samlSettings->getIdPData();
if (isset($idpData['singleLogoutService']) && isset($idpData['singleLogoutService']['url'])) {
    $sloUrl = $idpData['singleLogoutService']['url'];
} else {
    throw new Exception("The IdP does not support Single Log Out");
}

if (isset($_SESSION['IdPSessionIndex']) && !empty($_SESSION['IdPSessionIndex'])) {
    $logoutRequest = new OneLogin\Saml2\LogoutRequest($samlSettings, null, $_SESSION['IdPSessionIndex']);
} else {
    $logoutRequest = new OneLogin\Saml2\LogoutRequest($samlSettings);
}

$samlRequest = $logoutRequest->getRequest();

$parameters = array('SAMLRequest' => $samlRequest);

$url = OneLogin\Saml2\Utils::redirect($sloUrl, $parameters, true);

header("Location: $url");

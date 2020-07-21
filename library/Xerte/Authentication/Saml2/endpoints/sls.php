<?php
 
/**
 *  SP Single Logout Service Endpoint
 */

session_start();

require_once dirname(__FILE__).'/../vendor/autoload.php';
require_once dirname(__FILE__).'/../settings.php';


use OneLogin\Saml2\Auth;
use OneLogin\Saml2\IdPMetadataParser;

$parseIdp = new IdPMetadataParser();

$idpSettings = $parseIdp->parseRemoteXML($idpMetadataUrl);
$settingsInfoArray = $parseIdp->injectIntoSettings($settingsInfoArray, $idpSettings);

$auth = new Auth($settingsInfoArray);

$auth->processSLO();

$errors = $auth->getErrors();

if (empty($errors)) {
    echo 'Sucessfully logged out';
} else {
    echo implode(', ', $errors);
}

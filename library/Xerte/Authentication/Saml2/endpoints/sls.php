<?php
 
/**
 *  SP Single Logout Service Endpoint
 */

require_once dirname(__FILE__).'/../../../../../config.php';


require_once dirname(__FILE__).'/../vendor/autoload.php';
require_once dirname(__FILE__).'/../settings.php';


use OneLogin\Saml2\Auth;
use OneLogin\Saml2\IdPMetadataParser;

$parseIdp = new IdPMetadataParser();

$idpSettings = $parseIdp->parseRemoteXML($idpMetadataUrl);
$settingsInfoArray = $parseIdp->injectIntoSettings($settingsInfoArray, $idpSettings);

if (!isset($settingsInfoArray['sp']['x509cert']) || !isset($settingsInfoArray['sp']['privateKey'])) {
    if (file_exists(__DIR__) . '/../certs/sp.crt') {
        $settingsInfoArray['sp']['x509cert'] = file_get_contents(__DIR__ . '/../certs/sp.crt');
    }
    if (file_exists(__DIR__) . '/../certs/sp.key') {
        $settingsInfoArray['sp']['privateKey'] = file_get_contents(__DIR__ . '/../certs/sp.key');
    }
}

$auth = new Auth($settingsInfoArray);

$auth->processSLO();

$errors = $auth->getErrors();

if (empty($errors)) {
    echo 'Sucessfully logged out';
} else {
    echo implode(', ', $errors);
}

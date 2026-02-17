<?php
 
/**
 *  SP Metadata Endpoint
 */

require_once dirname(__FILE__).'/../vendor/autoload.php';
require_once dirname(__FILE__).'/../settings.php';

use OneLogin\Saml2\Auth;
use OneLogin\Saml2\Error;
use OneLogin\Saml2\IdPMetadataParser;

try {
    $parseIdp = new IdPMetadataParser();
    $idpSettings = $parseIdp->parseRemoteXML($idpMetadataUrl);
    $settingsInfoArray = $parseIdp->injectIntoSettings($settingsInfoArray, $idpSettings);

    $auth = new Auth($settingsInfoArray);
    $settings = $auth->getSettings();
    $metadata = $settings->getSPMetadata();
    $errors = $settings->validateMetadata($metadata);
    if (empty($errors)) {
        header('Content-Type: text/xml');
        echo $metadata;
    } else {
        throw new Error(
            'Invalid SP metadata: '.implode(', ', $errors),
            Error::METADATA_SP_INVALID
        );
    }
} catch (Exception $e) {
    echo $e->getMessage();
}

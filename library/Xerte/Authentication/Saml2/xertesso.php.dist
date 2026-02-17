<?php
/**
 * SAMPLE Code to demonstrate how to initiate a SAML Authorization request
 *
 * When the user visits this URL, the browser will be redirected to the SSO
 * IdP with an authorization request. If successful, it will then be
 * redirected to the consume URL (specified in settings) with the auth
 * details.
 */

require_once dirname(__FILE__).'/../../../../config.php';

require_once dirname(__FILE__).'/vendor/autoload.php';
require_once dirname(__FILE__).'/log.php';
require_once dirname(__FILE__).'/settings.php';

use OneLogin\Saml2\IdPMetadataParser;

$parseIdp = new IdPMetadataParser();
$idpSettings = $parseIdp->parseRemoteXML($idpMetadataUrl);
$settingsInfoArray = $parseIdp->injectIntoSettings($settingsInfoArray, $idpSettings);

if (!isset($settingsInfoArray['sp']['x509cert']) || !isset($settingsInfoArray['sp']['privateKey'])) {
    if (file_exists(__DIR__) . '/../certs/sp.crt') {
        $settingsInfoArray['sp']['x509cert'] = file_get_contents(__DIR__ . '/certs/sp.crt');
    }
    if (file_exists(__DIR__) . '/../certs/sp.key') {
        $settingsInfoArray['sp']['privateKey'] = file_get_contents(__DIR__ . '/certs/sp.key');
    }
}

$settings = new OneLogin\Saml2\Settings($settingsInfoArray);
try {
    $auth = new OneLogin\Saml2\Auth($settingsInfoArray);
} catch (\OneLogin\Saml2\Error $e) {
    logToFile("Error creating SAML Auth object: " . $e->getMessage());
}


$auth->login($xerte_toolkits_site->site_url);



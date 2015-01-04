<?php

    $spBaseUrl = 'https://xot.12change.eu/php-saml'; //or http://<your_domain>

    $settingsInfo = array (
        'sp' => array (
            'entityId' => $spBaseUrl.'/demo1/metadata.php',
            'assertionConsumerService' => array (
                'url' => $spBaseUrl.'/demo1/index.php?acs',
            ),
            'singleLogoutService' => array (
                'url' => $spBaseUrl.'/demo1/index.php?sls',
            ),
            'NameIDFormat' => 'urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified',
            'name' => array(
                'en' => '"Xerte Online Toolkits | 12Change"',
            ),

            'description' => array(
                'en' => 'Xerte Online Toolkits',
            ),

            // We would like to get the mail and displayName attributes
            'attributes' => array(
                'urn:oid:2.5.4.10', // Organisation
                'urn:oid:2.5.4.42', // Given name
                'urn:oid:2.5.4.4',  // surname
                'urn:oid:0.9.2342.19200300.100.1.3', // mail
                //'urn:oid:2.16.840.1.113730.3.1.241', // displayName
            ),

            // But only the mail attribute is strictly required
            'attributes.required' => array(
                'urn:oid:2.5.4.42', // Given name
                'urn:oid:2.5.4.4',  // surname
                'urn:oid:0.9.2342.19200300.100.1.3',
            ),

            // Only expose HTTP-POST binding
            'acs.Bindings' => array (
                'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
            ),
        ),
        'idp' => array (
            'entityId' => '://openidp.feide.no',
            'singleSignOnService' => array (
                'url' => 'https://openidp.feide.no/simplesaml/saml2/idp/SSOService.php',
            ),
            'singleLogoutService' => array (
                'url' => 'https://openidp.feide.no/simplesaml/saml2/idp/SingleLogoutService.php',
            ),
            'x509cert' => 'MIICizCCAfQCCQCY8tKaMc0BMjANBgkqhkiG9w0BAQUFADCBiTELMAkGA1UEBhMCTk8xEjAQBgNVBAgTCVRyb25kaGVpbTEQMA4GA1UEChMHVU5JTkVUVDEOMAwGA1UECxMFRmVpZGUxGTAXBgNVBAMTEG9wZW5pZHAuZmVpZGUubm8xKTAnBgkqhkiG9w0BCQEWGmFuZHJlYXMuc29sYmVyZ0B1bmluZXR0Lm5vMB4XDTA4MDUwODA5MjI0OFoXDTM1MDkyMzA5MjI0OFowgYkxCzAJBgNVBAYTAk5PMRIwEAYDVQQIEwlUcm9uZGhlaW0xEDAOBgNVBAoTB1VOSU5FVFQxDjAMBgNVBAsTBUZlaWRlMRkwFwYDVQQDExBvcGVuaWRwLmZlaWRlLm5vMSkwJwYJKoZIhvcNAQkBFhphbmRyZWFzLnNvbGJlcmdAdW5pbmV0dC5ubzCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAt8jLoqI1VTlxAZ2axiDIThWcAOXdu8KkVUWaN/SooO9O0QQ7KRUjSGKN9JK65AFRDXQkWPAu4HlnO4noYlFSLnYyDxI66LCr71x4lgFJjqLeAvB/GqBqFfIZ3YK/NrhnUqFwZu63nLrZjcUZxNaPjOOSRSDaXpv1kb5k3jOiSGECAwEAATANBgkqhkiG9w0BAQUFAAOBgQBQYj4cAafWaYfjBU2zi1ElwStIaJ5nyp/s/8B8SAPK2T79McMyccP3wSW13LHkmM1jwKe3ACFXBvqGQN0IbcH49hu0FKhYFM/GPDJcIHFBsiyMBXChpye9vBaTNEBCtU3KjjyG0hRT2mAQ9h+bkPmOvlEo/aH0xR68Z9hw4PF13w==',
        ),
    );

<?php
/**
 * Copyright 2016 François Kooman <fkooman@tuxed.net>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
namespace fkooman\OAuth\Client;

use fkooman\OAuth\Client\Exception\OAuthException;
use InvalidArgumentException;
use DomainException;

/**
 * OAuth 2.0 Client. Helper class to make it easy to obtain an access token
 * from an OAuth 2.0 provider.
 */
class OAuth2Client
{
    /** @var Provider */
    private $provider;

    /** @var HttpClientInterface */
    private $httpClient;

    /** @var RandomInterface */
    private $random;

    /**
     * Instantiate an OAuth 2.0 Client.
     *
     * @param Provider            $provider   the OAuth 2.0 provider configuration
     * @param HttpClientInterface $httpClient the HTTP client implementation
     * @param RandomInterface     $random     the random implementation
     */
    public function __construct(Provider $provider, HttpClientInterface $httpClient, RandomInterface $random = null)
    {
        $this->provider = $provider;
        $this->httpClient = $httpClient;
        if (is_null($random)) {
            $random = new Random();
        }
        $this->random = $random;
    }

    /**
     * Obtain an authorization request URL to start the authorization process
     * at the OAuth provider.
     *
     * @param string $scope       the space separated scope tokens
     * @param string $redirectUri the URL to redirect back to after coming back
     *                            from the OAuth provider (callback URL)
     *
     * @return string the authorization request URL
     *
     * @see https://tools.ietf.org/html/rfc6749#section-3.3
     * @see https://tools.ietf.org/html/rfc6749#section-3.1.2
     */
    public function getAuthorizationRequestUri($scope, $redirectUri)
    {
        $state = $this->random->get();

        $queryParams = http_build_query(
            [
                'client_id' => $this->provider->getId(),
                'redirect_uri' => $redirectUri,
                'scope' => $scope,
                'state' => $state,
                'response_type' => 'code',
            ],
            'n',
            '&'
        );

        return sprintf(
            '%s%s%s',
            $this->provider->getAuthorizationEndpoint(),
            false === strpos($this->provider->getAuthorizationEndpoint(), '?') ? '?' : '&',
            $queryParams
        );
    }

    /**
     * Obtain the access token from the OAuth provider after returning from the
     * OAuth provider on the redirectUri (callback URL).
     *
     * @param string $authorizationRequestUri    the original authorization
     *                                           request URL as obtained by getAuthorzationRequestUri
     * @param string $authorizationResponseCode  the code passed to the 'code'
     *                                           query parameter on the callback URL
     * @param string $authorizationResponseState the state passed to the 'state'
     *                                           query parameter on the callback URL
     *
     * @return AccessToken
     */
    public function getAccessToken($authorizationRequestUri, $authorizationResponseCode, $authorizationResponseState)
    {
        self::requireNonEmptyStrings(func_get_args());

        // parse our authorizationRequestUri to extract the state
        if (false === strpos($authorizationRequestUri, '?')) {
            throw new OAuthException('invalid authorizationRequestUri');
        }

        parse_str(explode('?', $authorizationRequestUri)[1], $queryParams);

        if (!isset($queryParams['state'])) {
            throw new OAuthException('state missing from authorizationRequestUri');
        }

        if (!isset($queryParams['redirect_uri'])) {
            throw new OAuthException('redirect_uri missing from authorizationRequestUri');
        }

        if ($authorizationResponseState !== $queryParams['state']) {
            throw new OAuthException('state from authorizationRequestUri does not equal authorizationResponseState');
        }

        // prepare access_token request
        $tokenRequestData = [
            'client_id' => $this->provider->getId(),
            'client_secret' => $this->provider->getSecret(),
            'grant_type' => 'authorization_code',
            'code' => $authorizationResponseCode,
            'redirect_uri' => $queryParams['redirect_uri'],
        ];

        $responseData = self::validateTokenResponse(
            $this->httpClient->post(
                $this->provider,
                $tokenRequestData
            )
        );
        return $responseData;
    }

    private static function validateTokenResponse($jsonString)
    {
        $responseData = json_decode($jsonString, true);
        if (JSON_ERROR_NONE !== json_last_error()) {
            throw new OAuthException('non-JSON data received from token endpoint');
        }

        if (!is_array($responseData)) {
            throw new OAuthException('invalid data received from token endpoint');
        }

        if (!isset($responseData['access_token'])) {
            throw new OAuthException('no access_token received from token endpoint');
        }

        if (!isset($responseData['token_type'])) {
            throw new OAuthException('no token_type received from token endpoint');
        }

        if (!isset($responseData['scope'])) {
            $responseData['scope'] = null;
        }

        if (!isset($responseData['expires_in'])) {
            $responseData['expires_in'] = null;
        }

        return $responseData;
    }

    private static function requireNonEmptyStrings(array $strs)
    {
        foreach ($strs as $no => $str) {
            if (!is_string($str)) {
                throw new InvalidArgumentException(sprintf('parameter %d must be string', $no));
            }
            if (0 >= strlen($str)) {
                throw new DomainException(sprintf('parameter %d must be non-empty', $no));
            }
        }
    }
}

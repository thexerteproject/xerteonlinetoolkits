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

/**
 * OAuth 2.0 provider definition.
 */
class Provider
{
    /** @var string */
    private $id;

    /** @var string */
    private $secret;

    /** @var string */
    private $authorizationEndpoint;

    /** @var string */
    private $tokenEndpoint;

    /**
     * Instantiate an OAuth 2.0 provider.
     *
     * @param string $id                    client id
     * @param string $secret                the client secret
     * @param string $authorizationEndpoint the authorization endpoint
     * @param string $tokenEndpoint         the token endpoint
     */
    public function __construct($id, $secret, $authorizationEndpoint, $tokenEndpoint)
    {
        $this->id = $id;
        $this->secret = $secret;
        $this->authorizationEndpoint = $authorizationEndpoint;
        $this->tokenEndpoint = $tokenEndpoint;
    }

    /**
     * Get the client id.
     *
     * @return string the client id
     *
     * @see https://tools.ietf.org/html/rfc6749#section-2.2
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get the client secret.
     *
     * @return string the client secret
     *
     * @see https://tools.ietf.org/html/rfc6749#section-2.3.1
     */
    public function getSecret()
    {
        return $this->secret;
    }

    /**
     * Get the authorization endpoint.
     *
     * @return string the authorization endpoint
     *
     * @see https://tools.ietf.org/html/rfc6749#section-3.1
     */
    public function getAuthorizationEndpoint()
    {
        return $this->authorizationEndpoint;
    }

    /**
     * Get the token endpoint.
     *
     * @return string the token endpoint
     *
     * @see https://tools.ietf.org/html/rfc6749#section-3.2
     */
    public function getTokenEndpoint()
    {
        return $this->tokenEndpoint;
    }
}

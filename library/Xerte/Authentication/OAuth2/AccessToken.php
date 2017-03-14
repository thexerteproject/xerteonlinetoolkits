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
 * AccessToken object containing the response from the OAuth 2.0 provider's
 * token response.
 */
class AccessToken
{
    /** @var string */
    private $token;

    /** @var string */
    private $tokenType;

    /** @var string */
    private $scope;

    /** @var int */
    private $expiresIn;

    /** @var string */
    private $userId;

    /** @var string */
    private $refreshToken;

    public function __construct($token, $tokenType, $scope, $expiresIn, $userId, $refreshToken)
    {
        $this->token = $token;
        $this->tokenType = $tokenType;
        $this->scope = $scope;
        $this->expiresIn = $expiresIn;
        $this->userId = $userId;
        $this->refreshToken = $refreshToken;
    }

    /**
     * Get the access token.
     *
     * @return string the access token
     *
     * @see https://tools.ietf.org/html/rfc6749#section-5.1
     */
    public function getToken()
    {
        return $this->token;
    }

    /**
     * Get the token type.
     *
     * @return string the token type
     *
     * @see https://tools.ietf.org/html/rfc6749#section-7.1
     */
    public function getTokenType()
    {
        return $this->tokenType;
    }

    /**
     * Get the scope.
     *
     * @return string the scope
     *
     * @see https://tools.ietf.org/html/rfc6749#section-3.3
     */
    public function getScope()
    {
        return $this->scope;
    }

    /**
     * Get the expires in time.
     *
     * @return int the time in seconds in which the access token will expire
     *
     * @see https://tools.ietf.org/html/rfc6749#section-5.1
     */
    public function getExpiresIn()
    {
        return $this->expiresIn;
    }

    /**
     * Get the optional userid.
     *
     * @return string the userid
     *
     * @see https://tools.ietf.org/html/rfc6749#section-4.1.4
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * Get the optional refreshtoken.
     *
     * @return string the refreshtoken
     *
     * @see https://tools.ietf.org/html/rfc6749#section-5.1
     */
    public function getRefreshToken()
    {
        return $this->refreshToken;
    }

    /**
     * Get the access token as string.
     *
     * @return string the access token
     */
    public function __toString()
    {
        return $this->getToken();
    }
}

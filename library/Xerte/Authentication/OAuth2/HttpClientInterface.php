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

interface HttpClientInterface
{
    /**
     * Obtain an access token through a HTTP POST request.
     *
     * @param Provider $provider the OAuth provider information
     * @param array    $postData the HTTP POST body that has to be part of the
     *                           OAuth token request
     *
     * @return string JSON formatted response from HTTP POST request
     *
     * @throws \RuntimeException if there was an error with the request
     */
    public function post(Provider $provider, array $postData);
}

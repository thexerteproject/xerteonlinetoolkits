<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function addSession($url) {
    if ( ini_get('session.use_cookies') != '0' ) return $url;
    if ( stripos($url, '&'.session_name().'=') > 0 ||
        stripos($url, '?'.session_name().'=') > 0 ) return $url;
    $session_id = session_id();

    // Don't add more than once...
    $parameter = session_name().'=';
    if ( strpos($url, $parameter) !== false ) return $url;

    $url = add_url_parm($url, session_name(), $session_id);
    return $url;
}

function add_url_parm($url, $key, $val) {
    $url .= strpos($url,'?') === false ? '?' : '&';
    $url .= urlencode($key) . '=' . urlencode($val);
    return $url;
}

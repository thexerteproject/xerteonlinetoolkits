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

if (isset($_GET['tsugisession']))
{
    $tsugi_disable_xerte_session = true;
    require_once(__DIR__ . "/../../config.php");
    if ($_GET['tsugisession'] == "1") {
        $contents = "";

        _debug("TSUGI session");
        if (file_exists($xerte_toolkits_site->tsugi_dir)) {
            require_once($xerte_toolkits_site->tsugi_dir . "/config.php");
        }
        session_start();
    }
    else
    {
        ini_set('session.use_cookies', 0);
        ini_set('session.use_only_cookies', 0);
        ini_set('session.use_trans_sid', 1);
        session_start();
    }
}
else
{
    require_once (__DIR__ . "/../../config.php");
}

if(isset($_SESSION['toolkits_logon_id'])) {
    _debug("Session refreshed for " . $_SESSION['toolkits_logon_username'] . " @ " . date('y-M-d H:i:s'));
}
else if (isset($_SESSION['XAPI_PROXY']))
{
    _debug("Session refreshed for XAPI Proxy @ " . date('y-M-d H:i:s'));
}
else
{
    _debug("Session refreshed for anonymous user @ " . date('y-M-d H:i:s'));
}

echo '{"refreshed": "true"}';
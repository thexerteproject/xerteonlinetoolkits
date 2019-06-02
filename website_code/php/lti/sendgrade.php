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

$tsugi_disable_xerte_session = true;
require_once(dirname(__FILE__) . "/../../../config.php");
require_once($xerte_toolkits_site->tsugi_dir . "/config.php");

ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);

use \Tsugi\Core\LTIX;
use \Tsugi\Core\Settings;
use \Tsugi\Core\Result;
use \Tsugi\Util\Net;
use \Tsugi\Grades\GradeUtil;

$LAUNCH = LTIX::requireData();

if (isset($_POST['grade']))
{
    $gradetosend = $_POST['grade'];
    $res = $LAUNCH->result->gradeSend($gradetosend);
    _debug("Sending grade: " . $gradetosend . ": " . $res);
}
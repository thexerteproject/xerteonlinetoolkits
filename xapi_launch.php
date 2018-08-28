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
require_once(dirname(__FILE__) . "/config.php");

global $tsugi_enabled;
global $xerte_toolkits_site;

$id = $_GET["template_id"];
if(is_numeric($id))
{
    if (!isset($_REQUEST['group']))
    {
        die('group parameter not supplied!');
    }
	$tsugi_enabled = true;

    $xerte_toolkits_site->group = $_REQUEST{'group'};
    if (isset($_REQUEST['course'])) {
        $xerte_toolkits_site->course = $_REQUEST['course'];
    }
    if (isset($_REQUEST['module'])) {
        $xerte_toolkits_site->course = $_REQUEST['module'];
    }

	require("play.php");

}
?>
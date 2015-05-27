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

// RSS proxy
//
// For the RSS reader page for the xerte template
//

include 'Snoopy.class.php';
require_once(dirname(__FILE__) . "/config.php");

$snoopy = new Snoopy;

$url = $_GET['rss'];

if (isset($xerte_toolkits_site->proxy1)) $snoopy->proxy_host1=$xerte_toolkits_site->proxy1;				
if (isset($xerte_toolkits_site->proxy2)) $snoopy->proxy_host2=$xerte_toolkits_site->proxy2;				
if (isset($xerte_toolkits_site->proxy3)) $snoopy->proxy_host3=$xerte_toolkits_site->proxy3;				
if (isset($xerte_toolkits_site->proxy4)) $snoopy->proxy_host4=$xerte_toolkits_site->proxy4;		
if (isset($xerte_toolkits_site->port1)) $snoopy->proxy_port1=$xerte_toolkits_site->port1;
if (isset($xerte_toolkits_site->port2)) $snoopy->proxy_port2=$xerte_toolkits_site->port2;
if (isset($xerte_toolkits_site->port3)) $snoopy->proxy_port3=$xerte_toolkits_site->port3;
if (isset($xerte_toolkits_site->port4)) $snoopy->proxy_port4=$xerte_toolkits_site->port4;

/** XXX TODO SECURITY ? Someone can fetch any arbitrary remote URL using this script. Should re require users are logged in or something ? */
$content = $snoopy->fetch($url);

echo $snoopy->results;

?>

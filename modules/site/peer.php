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
 
/**
 * 
 * peer page, allows the site to make a peer review page for a xerte module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

/**
 * 
 * Function show template
 * This function creates folders needed when creating a template
 * @param array $row_play - an array from the last mysql query
 * @version 1.0
 * @author Patrick Lockley
 */

require_once(dirname(__FILE__) . "/play.php");

function show_peer_template($row)
{
    global $xerte_toolkits_site;


    $peer_template = show_template($row, "data.xml");

    echo $peer_template;
}

?>
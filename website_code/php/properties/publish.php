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
 * publish template, shows the publish options
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
_load_language_file("/website_code/php/properties/publish.inc");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "../user_library.php";
include "properties_library.php";

if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
	
	publish_display_fail();
	
    die();
}


if (!isset($_POST['template_id']))
{
    die('Invalid template_id');
}
$template_id = x_clean_input($_POST['template_id'], 'numeric');

if(has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id'])||is_user_permitted("projectadmin")) {

    publish_display($template_id);

} else {

    publish_display_fail();

}

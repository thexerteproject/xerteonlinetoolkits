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
 * syndication template, shows the syndication status for this template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */


require_once("../../../config.php");

include "../template_status.php";

include "../user_library.php";
include "../url_library.php";
include "properties_library.php";

if(!is_numeric($_POST['tutorial_id'])){
    syndication_display_fail();
    exit(0);
}
if(!is_user_creator((int) $_POST['tutorial_id']) && !is_user_admin()){
    syndication_display_fail();
    exit(0);
}

/**
 * Check template is public
 */
if(template_access_settings((int) $_POST['tutorial_id']) == "Public") {
    syndication_display($xerte_toolkits_site,false);
}
else{
    syndication_not_public($xerte_toolkits_site);
}

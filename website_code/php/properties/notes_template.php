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
 * notes template, displays notes on a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";

include "../user_library.php";

include "properties_library.php";

if(is_numeric($_POST['template_id'])){
    if(is_user_creator($_POST['template_id'])||is_user_admin()){
       $query_for_template_notes = "select notes from {$xerte_toolkits_site->database_table_prefix}templaterights where template_id = ?";
       $row_notes = db_query_one($query_for_template_notes, array($_POST['template_id']));
       notes_display($row_notes['notes'],false, $_POST['template_id']);
       exit(0);
    }
}
notes_display_fail();

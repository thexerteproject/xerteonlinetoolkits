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
require_once("../../../config.php");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

    $query = false;

    if($_POST['rss']!=""){
       $query="update {$xerte_toolkits_site->database_table_prefix}templatesyndication set rss='false' where template_id=?";
       $params = array($_POST['template_id']);
    }

    if($_POST['export']!=""){
        $query="update {$xerte_toolkits_site->database_table_prefix}templatesyndication set export='false' where template_id =?";
        $params = array($_POST['template_id']);
    }

    if($_POST['synd']!=""){
        $query="update {$xerte_toolkits_site->database_table_prefix}templatesyndication set syndication='false' where template_id =?";
        $params = array($_POST['template_id']);
    }
    if($query) {
        db_query($query, $params);
    }

    $query="select * from {$xerte_toolkits_site->database_table_prefix}templatesyndication, {$xerte_toolkits_site->database_table_prefix}templatedetails 
                where {$xerte_toolkits_site->database_table_prefix}templatesyndication.template_id = "
                . "{$xerte_toolkits_site->database_table_prefix}templatedetails.template_id "
                . "and ( rss = ? or export = ? or syndication = ? )";
                
    $params = array('true', 'true', 'true'); 

    $query_response = db_query($query, $params);
    
    syndication_list();

}else{
    management_fail();
}

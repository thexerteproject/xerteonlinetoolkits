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
 * peer change template, alters the peer review status of a template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";

include "../url_library.php";

include "../user_library.php";

include "properties_library.php";

$database_id = database_connect("peer template database connect success","peer template change database connect failed");

$prefix = $xerte_toolkits_site->database_table_prefix;

if(is_numeric($_POST['template_id'])){

    if(is_user_creator($_POST['template_id'])||is_user_admin()){

        if($_POST['peer_status']=="off"){

            $query = "DELETE FROM {$prefix}additional_sharing WHERE template_id= ? AND sharing_type = ?";
            $params = array($_POST['template_id'], 'peer'); 

            db_query($query, $params);

        }else{

            $query = "select * from {$prefix}additional_sharing where sharing_type= ? AND template_id = ?";
            $params = array("peer", $_POST['template_id']);

            $query_response = db_query($query, $params);

            if(sizeof($query_response)==1)
            {
                // Update record
                $query = "UPDATE {$prefix}additional_sharing set sharing_type='peer', extra= ? WHERE template_id = ?";
                $params = array($_POST['extra'], $_POST['template_id']);    
            }
            else
            {
                $query = "INSERT INTO {$prefix}additional_sharing (template_id, sharing_type, extra) VALUES (?,?,?)";
                $params = array($_POST['template_id'], "peer", $_POST['extra']);
            }
            db_query($query, $params);

        }		

        /**
         * Update the screen
         */

        peer_display($xerte_toolkits_site,true, $_POST['template_id']);

    }else{

        peer_display_fail();

    }

}

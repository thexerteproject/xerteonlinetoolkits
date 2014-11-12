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
 

class toolkits_session_handler {

    var $database_connect;

    function toolkits_session_handler() {
        
    }

    function xerte_session_open() {

        global $xerte_toolkits_site;

        $this->database_connect = mysql_connect($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password);

        mysql_select_db($xerte_toolkits_site->database_name);

        return TRUE;
    }

    function xerte_session_close() {

    }

    function xerte_session_read($id) {

        global $xerte_toolkits_site;

        $response = db_query_one("select data from user_sessions where session_id = ?", array($id));

        if (isset($response['data'])) {
            return $response['data'];
        } else {
            return false;
        }
    }

    function xerte_session_write($id, $data) {

        global $xerte_toolkits_site;

        $access = time();
        $response = db_query_one('SELECT * FROM user_sessions WHERE id = ?', array($id));
        if (empty($response)) {
            db_query_one("INSERT INTO user_sessions VALUES(?,?,?)", array($id, $access, $data));
        } else {
            db_query("UPDATE user_sessions SET data = ?, access = ? WHERE id = ?", array($data, $access, $id));
        }
    }

    function xerte_session_destroy($id) {

        global $xerte_toolkits_site;

        db_query("delete from user_sessions where session_id = ?", array($id));
    }

    function xerte_session_clean($max) {

        global $xerte_toolkits_site;

        $old = time() - $max;

        db_query("DELETE FROM user_sessions WHERE access < ? ", array($old));
    }

}

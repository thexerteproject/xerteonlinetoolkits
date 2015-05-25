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
require_once(dirname(__FILE__) . "/../../config.php");

if ($_SESSION['toolkits_logon_id'] == "site_administrator")
{
    // Check for registration table
    $x = db_query("select 1 from {$xerte_toolkits_site->database_table_prefix}registration");
    if ($x===false) {
        // Create the user table
        $x = db_query("create table {$xerte_toolkits_site->database_table_prefix}registration  ( `uuid` VARCHAR(45) NOT NULL )");
        if (empty($x))
        {
            _debug("Failed: Does the registration table exist?");
            die("Failed to create registration table");
        }
        else
        {
            _debug("Succeeded to create registration record!");
        }
    }

    $res = db_query_one("select * from {$xerte_toolkits_site->database_table_prefix}registration");
    if ($res == null)
    {
        $uuid = uid();
        $params = array($uuid);
        $res = db_query("insert {$xerte_toolkits_site->database_table_prefix}registration set uuid=?", $params);
        if ($res === false)
        {
            die("Can't create uid record!");
        }
    }
    else
    {
        $uuid = $res['uuid'];
    }
    $version=file($xerte_toolkits_site->root_file_path . "version.txt");
    header("Location: http://www.xerte.org.uk/index.php?option=com_chronoforms5&chronoform=XerteRegistrationForm&xot_uid=" . $uuid . "&version=" . urlencode($version[0]) . "&site=" . $xerte_toolkits_site->site_url . "&name=" . $xerte_toolkits_site->site_name);
}
else
{
    die("Permission denied!");
}
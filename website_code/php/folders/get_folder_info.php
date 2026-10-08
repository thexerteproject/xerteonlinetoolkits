<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 */

require_once("../../../config.php");
require_once(dirname(__FILE__) . "/WorkspaceFolderInfoService.php");

if (empty($_SESSION['toolkits_logon_id'])) {
    die("Please login");
}

echo json_encode(folder_workspace_get_info($_POST['folder_id']));

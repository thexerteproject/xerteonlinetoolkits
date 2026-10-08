<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 */

require_once("../../../config.php");
require_once(dirname(__FILE__) . "/WorkspaceGroupInfoService.php");

if (empty($_SESSION['toolkits_logon_id'])) {
    die("Please login");
}

echo json_encode(group_workspace_get_info($_POST['group_name'], $_POST['group_id']));

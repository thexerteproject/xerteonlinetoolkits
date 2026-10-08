<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 */

require_once("../../../config.php");
require_once(dirname(__FILE__) . "/TemplateWorkspaceInfoService.php");

if (empty($_SESSION['toolkits_logon_id'])) {
    die("Please login");
}
if (!isset($_POST['template_id'])) {
    die("No template id");
}

$template_id = x_clean_input($_POST['template_id'], 'numeric');
if (has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) || is_user_permitted("projectadmin")) {
    echo json_encode(template_workspace_get_info($template_id));
}

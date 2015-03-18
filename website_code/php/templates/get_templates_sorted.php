<?php

//
// Version 1.0 University of Nottingham
// 
// Calls the function from the display library

require_once("../../../config.php");
require_once("../display_library.php");
require_once("../user_library.php");

if(empty($_SESSION['toolkits_logon_id'])) {
            die("Please login");
}

$_SESSION['sort_type'] = $_POST['sort_type'];

$workspace = get_users_projects($_SESSION['sort_type']);
echo $workspace;


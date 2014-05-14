<?php

//
// Version 1.0 University of Nottingham
// 
// Calls the function from the display library

require_once("../../../config.php");
require_once("../display_library.php");
require_once("../user_library.php");

$database_connect_id = database_connect("your templates database connect success", "your templates database connect failed");

$_SESSION['sort_type'] = $_POST['sort_type'];

list_users_projects($_SESSION['sort_type']);


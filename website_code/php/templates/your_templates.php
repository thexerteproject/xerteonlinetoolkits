<?php

//
// Version 1.0 University of Nottingham
// 
// Calls the function from the display library

require_once("../../../config.php");

require_once("../display_library.php");

database_connect("your template connect","your template fail");

require_once("../user_library.php");

$_SESSION['sort_type'] = "date_down";

list_users_projects($_SESSION['sort_type']);		


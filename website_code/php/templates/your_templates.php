<?php  
// Code to list a user's templates
//
// Version 1.0 University of Nottingham
// 
// Calls the function from the display library

include "../display_library.php";
include "../database_library.php";
require_once("../../../config.php");
include "../user_library.php";

$_SESSION['sort_type'] = "date_down";

list_users_projects($_SESSION['sort_type']);		


<?php
require_once("../../../config.php");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

	
    $query="delete from {$xerte_toolkits_site->database_table_prefix}syndicationcategories where category_id=?";
    $res = db_query($query, array($_POST['remove'] ));

	category_list();
			
}else{
	management_fail();

}

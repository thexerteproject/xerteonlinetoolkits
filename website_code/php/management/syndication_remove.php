<?php

require_once("../../../config.php");

require("../user_library.php");
require("management_library.php");

if(is_user_admin()){

    $query = false;

    if($_POST['rss']!=""){
       $query="update {$xerte_toolkits_site->database_table_prefix}templatesyndication set rss='false' where template_id=?";
       $params = array($_POST['template_id']);
    }

    if($_POST['export']!=""){
        $query="update {$xerte_toolkits_site->database_table_prefix}templatesyndication set export='false' where template_id =?";
        $params = array($_POST['template_id']);
    }

    if($_POST['synd']!=""){
        $query="update {$xerte_toolkits_site->database_table_prefix}templatesyndication set syndication='false' where template_id =?";
        $params = array($_POST['template_id']);
    }
    if($query) {
        db_query($query, $params);
    }

    $query="select * from {$xerte_toolkits_site->database_table_prefix}templatesyndication, {$xerte_toolkits_site->database_table_prefix}templatedetails 
                where {$xerte_toolkits_site->database_table_prefix}templatesyndication.template_id = {$xerte_toolkits_site->database_table_prefix}templatedetails.template_id and(rss=\"true\" or export=\"true\" or syndication=\"true\")";

    $query_response = mysql_query($query);

    syndication_list();

}else{

    management_fail();

}

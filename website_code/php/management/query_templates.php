<?php

require_once("../../../config.php");

$queryData = filter_input(INPUT_GET, 'queryData');
if ($queryData == 'modal')
{
    $query = "select * from " . $xerte_toolkits_site->database_table_prefix . "originaltemplatesdetails where parent_template='Nottingham'";
    $query_response = db_query($query);
    echo json_encode($query_response);
}


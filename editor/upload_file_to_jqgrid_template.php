<?php
/**
 *
 * upload file to jqgrid template, allows the site to add a csv to a local jqgrid
 *
 * @author Timo Boer
 * @version 1.0
 * @package
 */

require_once(dirname(__FILE__) . "/../config.php");

// Check for a valid logged in user
if (!isset($_SESSION['toolkits_logon_username']) && !is_user_admin()) {
    _debug("Session is invalid or expired");
    die('{"status": "error", "message": "Session is invalid or expired"}');
}

if ($_FILES["file"]["error"] > 0) {
    echo "Return Code: " . $_FILES["file"]["error"] . "<br />";
} else {
    $merge = isset($_POST['merge']);
    $file = $_FILES['fileToUpload'];
    $file_content = file_get_contents($file['tmp_name']);
    $csv = array_map('str_getcsv', file($file['tmp_name']));
    $result = '';
    $nr_columns = $_POST['colNum'];

    //if $merge is set then we want to keep the old grid
    if ($merge){
        $old_grid = json_decode($_POST['old_data'], true);
        //drop row indicator
        foreach ($old_grid as $key => $row){
            array_shift($old_grid[$key]);
        }
        $result = parse_data($result, $old_grid, $nr_columns);

    }
    $result = parse_data($result, $csv, $nr_columns);
    $result = substr($result, 0 , -2);
}
echo json_encode(array('type' => $_POST["type"], 'csv' => $result, 'gridId' => $_POST["gridId"] ));

function parse_data($csv_parsed, $input, $nr_columns)
{
    //check if supplied file has correct size, if not drop or add cells and add to csv_parced
    foreach ($input as $key => $row) {
        if (count($row) < $nr_columns) {
            for ($i = 0; $i < $nr_columns - count($row); $i++) {
                $input[$key][] = " ";
            }
            $row = $input[$key];
        } elseif (count($row) > $nr_columns) {
            for ($i = 0; $i < count($row) - $nr_columns; $i++) {
                array_pop($input[$key]);
            }
            $row = $input[$key];
        }
        foreach ($row as $value) {
            if ($value === "") {
                $value = " ";
            }
            $csv_parsed .= $value . "|";
        }
        $csv_parsed .= "|";
    }
    return $csv_parsed;
}

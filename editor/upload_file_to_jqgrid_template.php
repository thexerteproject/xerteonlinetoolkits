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
//TODO test for file
if ($_FILES["file"]["error"] > 0) {
    echo "Return Code: " . $_FILES["file"]["error"] . "<br />";
} else {
    $file = $_FILES['fileToUpload'];
    $file_content = file_get_contents($file['tmp_name']);
    $csv = array_map('str_getcsv', file($file['tmp_name']));
    $csv_parsed = '';
    $nr_columns = $_POST['colNum'];

    //check if supplied file has correct size, if not drop or add cells and add to csv_parced
    foreach ($csv as $key => $row) {
        if(count($row) < $nr_columns){
            for ($i = 0; $i < $nr_columns - count($row); $i++) {
                $csv[$key][] = " ";
            }
            $row = $csv[$key];
        }
        elseif(count($row) > $nr_columns) {
            for ($i = 0; $i < count($row) - $nr_columns; $i++) {
                array_pop($csv[$key]);
            }
            $row = $csv[$key];
        }
        foreach ($row as $value){
            if ($value === ""){$value = " ";}
            $csv_parsed .= $value. "|";
        }
        $csv_parsed .= "|";
    }
    $csv_parsed = substr($csv_parsed, 0 , -2);
}
echo json_encode(array('type' => $_POST["type"], 'csv' => $csv_parsed, 'gridId' => $_POST["gridId"] ));

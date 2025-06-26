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
if (!isset($_SESSION['toolkits_logon_username']) && !is_user_permitted("projectadmin")) {
    _debug("Session is invalid or expired");
    die('{"status": "error", "message": "Session is invalid or expired"}');
}

if ($_FILES["file"]["error"] > 0) {
    echo "Return Code: " . $_FILES["file"]["error"] . "<br />";
} else {
    $merge = isset($_POST['merge']);
    $file = file($_FILES['fileToUpload']['tmp_name']);
    $result = '';
    $nr_columns = x_clean_input($_POST['colNum'], 'numeric');

    //determine separator
    $separator = get_delimiter($file, $nr_columns);
    $csv = array_map(function($data) use ($separator) { return str_getcsv($data, $separator);}, $file);

    //if $merge is set then we want to keep the old grid
    if ($merge){
        $old_grid = json_decode(x_clean_input_json($_POST['old_data']), true);
        //drop row indicator
        foreach ($old_grid as $key => $row){
            array_shift($old_grid[$key]);
        }
        $result = parse_data($result, $old_grid, $nr_columns);

    }
    $result = parse_data($result, $csv, $nr_columns);
    $result = substr($result, 0 , -2);
}
echo json_encode(array('type' => $_POST["type"], 'csv' => $result, 'gridId' => x_clean_input($_POST["gridId"]) ));

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

function get_delimiter($file ,$nr_columns): string
{
    $top10 = array_slice($file, 0, 10);
    //test for comma
    $comma_scv = array_map(function($data){ return str_getcsv($data,",");}, $top10);
    $comma_row_longer = $comma_row_smaller = 0;
    foreach ($comma_scv as $row){
        if(sizeof($row) > $nr_columns) {$comma_row_longer += 1;}
        elseif (sizeof($row) < $nr_columns) {$comma_row_smaller += 1;}
    }
    //test for semicolon
    $semi_scv = array_map(function($data){ return str_getcsv($data,";");}, $top10);
    $semi_longer = $semi_smaller = 0;
    foreach ($semi_scv as $row){
        if(sizeof($row) > $nr_columns) {$semi_longer += 1;}
        elseif (sizeof($row) < $nr_columns) {$semi_smaller += 1;}
    }
    //one of the deliminators gives perfect results.
    if ($comma_row_longer + $comma_row_smaller == 0 and $semi_longer + $semi_smaller != 0){return ',';}
    elseif ($semi_longer + $semi_smaller == 0 and $comma_row_longer + $comma_row_smaller != 0) {return ';';}
    //take the deliminator that is right most often
    elseif ($comma_row_smaller + $comma_row_longer < $semi_smaller + $semi_longer) {return ',' ;}
    elseif ($comma_row_smaller + $comma_row_longer > $semi_smaller + $semi_longer) {return ';' ;}

    //guess
    return ";";
}
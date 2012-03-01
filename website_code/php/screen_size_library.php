<?php
/**
 * 
 * get_template_screen_size, opens an RLT to get the sizes for the preview window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 & @return string with the size in separated by a ~
 * @package
 */

function get_template_screen_size($filename, $type){

    global $xerte_toolkits_site;

    $filename = $xerte_toolkits_site->basic_template_path . $type . "/parent_templates/" . $filename . "/" . $filename . ".rlt";

    $data = file_get_contents($filename);

    $place = strpos($data, 'stageSize="')+11;

    if($place==11){

        return "800~600";

    }else{

        $secondplace = strpos($data, '"', $place);

        $temp = substr($data, $place, ($secondplace-$place));

        $temp = split(",",$temp);

        return $temp[0] . "~" . $temp[1];
    }	

}


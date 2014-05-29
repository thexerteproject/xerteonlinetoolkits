<?php

// Check for Preview/Publish
$fileupdate = $_POST["fileupdate"];
$mode = $fileupdate ? "publish" : "preview";

$json = array(
    "attributes" => $_POST["attributes"],
    "children" => $_POST["children"],
);

$data = process($json);

file_put_contents("processed_$mode.txt", $data->asXML());

echo true;

function process($json, $xml = null) {
        if (array_key_exists("attributes", $json)) {
                foreach ($json["attributes"] as $key => $val) {
                        $name = $val['name']; //echo $name;
                        $value = $val['value']; //echo $value;

                        if (is_null($xml)) {
                                if ($name == 'nodeName') {
                                        $xml = new SimpleXMLElement('<'.$value.'/>');
                                }
                                else {
                                        $xml->addAttribute($name, $value);
                                }
                        }
                        else {
                                if ($name == 'nodeName') {
                                        $xml = $xml->addChild($value);
                                }
                                else {
                                        $xml->addAttribute($name, $value);
                                }
                        }
                }
        }

        // Do the same for all child nodes
        if (array_key_exists("children", $json)) {
                foreach ($json["children"] as $key => $val) {
                        process($val, $xml);
                }
        }

        return $xml;
}

function is_ajax_request() {
	return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}
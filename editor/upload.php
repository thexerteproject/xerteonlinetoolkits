<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require_once(dirname(__FILE__) . "/../config.php");

if (!isset($_SESSION['toolkits_logon_username']))
{
    die("Session is invalid or expired");
}

_debug("upload: " . print_r($_POST, true));

// Check for Preview/Publish
$fileupdate = $_POST["fileupdate"];
$filename = $_POST["filename"];

$mode = $fileupdate ? "publish" : "preview";
if ($mode == 'publish')
{
    $preview = dirname(dirname(__FILE__)) . '/' . $_POST["preview"];
}
$filename = dirname(dirname(__FILE__)) . '/' . $filename;
$filenamejson = substr($filename, 0, strlen($filename)-3) . "json";

// This code miserably fails if get_magic_quotes_gpc is turned on
// decoding the json doesn't work anymore
$lo_data = $_POST["lo_data"];
if (function_exists('get_magic_quotes_gpc'))
{
    if (get_magic_quotes_gpc())
    {
        $lo_data=stripslashes($_POST["lo_data"]);
    }
}

_debug("upload (lo_data): " . $lo_data);

$relreffedjsonstr = make_refs_local(urldecode($lo_data), $_POST['absmedia']);

_debug("upload (lo_data, local_refs): " . $relreffedjsonstr);

file_put_contents($filenamejson, print_r($relreffedjsonstr, true));

$relreffedjson = json_decode($relreffedjsonstr);

_debug("upload: decoded json");

$data = process($relreffedjson);

_debug("upload: converted to xml");

// save round-robin queue of 10 xml's
for ($i=10; $i>1; $i--)
{
    $j = $i-1;
    if (file_exists($filename . "." . $j)) {
        rename($filename . "." . $j, $filename . "." . $i);
    }
}
rename($filename, $filename . ".1");

// save round-robin queue of 10 json's
for ($i=10; $i>1; $i--)
{
    $j = $i-1;
    if (file_exists($filenamejson . "." . $j)) {
        rename($filenamejson . "." . $j, $filenamejson . "." . $i);
    }
}
rename($filenamejson, $filenamejson . ".1");

file_put_contents($filename, $data->asXML());

_debug("upload: saved as xml");

if ($mode == "publish")
{
    file_put_contents($preview, $data->asXML());
    // Update templatedetails modify date
    $sql = "update {$xerte_toolkits_site->database_table_prefix}templatedetails set date_modified=? where template_id=?";
    $params = array(date("Y-m-d"), $_POST['template_id']);
    db_query_one($sql, $params);
    _debug("upload: updated table");
}

echo true;

/**
 *
 * Extension for SimpleXMLElement
 * @author Alexandre FERAUD
 *
 */
class ExSimpleXMLElement extends SimpleXMLElement
{
    /**
     * Add CDATA text in a node
     * @param string $cdata_text The CDATA value  to add
     */
    public function addCData($cdata_text)
    {
        $node= dom_import_simplexml($this);
        $no = $node->ownerDocument;
        $node->appendChild($no->createCDATASection($cdata_text));
    }

    /**
     * Create a child with CDATA value
     * @param string $name The name of the child element to add.
     * @param string $cdata_text The CDATA value of the child element.
     */
    public function addChildCData($name,$cdata_text)
    {
        $child = $this->addChild($name);
        $child->addCData($cdata_text);
    }

    /**
     * Add SimpleXMLElement code into a SimpleXMLElement
     * @param SimpleXMLElement $append
     */
    public function appendXML($append)
    {
        if ($append) {
            if (strlen(trim((string) $append))==0) {
                $xml = $this->addChild($append->getName());
                foreach($append->children() as $child) {
                    $xml->appendXML($child);
                }
            } else {
                $xml = $this->addChild($append->getName(), (string) $append);
            }
            foreach($append->attributes() as $n => $v) {
                $xml->addAttribute($n, $v);
            }
        }
    }
}

function make_refs_local($json, $media)
{
    // replace instances of $media by FileLocation + '

    $temp = $json;
    //file_put_contents("step0_$mode.txt", print_r($temp, true));

    //1a. \" followed by media
    $pos = strpos($temp, '\"' . $media);
    while ($pos !== false)
    {
        $pos2 = strpos($temp, '\"', $pos+1);
        $temp = substr($temp, 0, $pos) . '\"FileLocation + \'' . substr($temp, $pos + strlen($media) + 2, $pos2 - $pos - strlen($media)-2) . '\'\"' . substr($temp, $pos2+2);
        $pos = strpos($temp, '\"' . $media);
    }
    //file_put_contents("step3a_$mode.txt", print_r($temp, true));
    //1b. " followed by media
    $pos = strpos($temp, '"' . $media);
    while ($pos !== false)
    {
        $pos2 = strpos($temp, '"', $pos+1);
        $temp = substr($temp, 0, $pos) . '"FileLocation + \'' . substr($temp, $pos + strlen($media) + 1, $pos2 - $pos - strlen($media) -1) . '\'"' . substr($temp, $pos2+1);
        $pos = strpos($temp, '"' . $media);
    }

    //1c. FIX '/media'
    $temp = str_replace("'/media", "'media", $temp);
    return $temp;
}

function process($json, $xml = null) {

    _debug("upload: " . print_r($json, true));

    if (isset($json->attributes)) {
            foreach ($json->attributes as $key => $val) {
                    $name = $key; //echo $name;
                    $value = $val; //echo $value;
                    _debug("upload: " . $name . " ->"  . $value);
                    if (is_null($xml)) {
                            if ($name == 'nodeName') {
                                _debug("upload: before new");
                                    $xml = new ExSimpleXMLElement('<'.$value.'/>');
                                _debug("upload: after new");
                            }
                            else {
                                _debug("upload: addAttribute (1)");
                                    $xml->addAttribute($name, $value);
                            }
                    }
                    else {
                            if ($name == 'nodeName') {
                                _debug("upload: addChild");
                                    $xml = $xml->addChild($value);
                            }
                            else {
                                _debug("upload: addAttribute (2)");
                                    $xml->addAttribute($name, $value);
                            }
                    }
            }
    }
    if (isset($json->data)) {
        _debug("upload: Add CDATA step 1");
        if (! is_null($xml))
        {
            _debug("upload: Add CDATA step 2");
            $xml = $xml->addCData($json->data);
        }
    }

    // Do the same for all child nodes
    _debug("upload: processing children");
    if (isset($json->children)) {
            foreach ($json->children as $key => $val) {
                _debug("upload: process " . $key . " -> " . $val);
                    process($val, $xml);
            }
    }

    return $xml;
}

function is_ajax_request() {
	return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}
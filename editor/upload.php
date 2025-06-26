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

require (dirname(__FILE__) . "/../" . $xerte_toolkits_site->php_library_path . "user_library.php");
require (dirname(__FILE__) . "/../" . $xerte_toolkits_site->php_library_path . "template_status.php");

function check_abs_media_path($absmedia)
{
    global $xerte_toolkits_site;
    if (strpos($absmedia, $xerte_toolkits_site->site_url . $xerte_toolkits_site->users_file_area_short) !== 0)
    {
        die("Invalid media path specified");
    }
}

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

if (!isset($_SESSION['toolkits_logon_username']) && !is_user_admin())
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

//_debug("upload: " . print_r($_POST, true));

// Check for Preview/Publish
$fileupdate = x_clean_input($_POST["fileupdate"]);
$filename = x_clean_input($_POST["filename"]);

$mode = $fileupdate ? "publish" : "preview";
if ($mode == 'publish')
{
    $previewxml = x_clean_input($_POST["preview"]);
    $preview = x_convert_user_area_url_to_path($previewxml);
    // Check whether the file does not have path traversal
    x_check_path_traversal($preview, $xerte_toolkits_site->users_file_area_full, 'Invalid preview path specified');
}
$filename = x_convert_user_area_url_to_path($filename);
// Check whether the file does not have path traversal
x_check_path_traversal($filename, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

$filenamejson = substr($filename, 0, strlen($filename)-3) . "json";

// This code miserably fails if get_magic_quotes_gpc is turned on
// decoding the json doesn't work anymore
$lo_data = $_POST["lo_data"];
if (function_exists('get_magic_quotes_gpc'))
{
    if (get_magic_quotes_gpc())
    {
        $lo_data=stripslashes($lo_data);
    }
}

//_debug("upload (lo_data): " . $lo_data);
$absmedia = x_clean_input($_POST['absmedia']);
check_abs_media_path($absmedia);

$template_id = x_clean_input($_POST['template_id'], 'numeric');

// Check whether the folder is correct based on template_id and user name
$folder_path_part = $xerte_toolkits_site->users_file_area_full . $template_id . '-';
if (strpos($filename, $folder_path_part) !== 0)
{
    die("Invalid upload location");
}

// Check whether the user has rights to edit this template
if (!is_user_an_editor($template_id, $_SESSION['toolkits_logon_id']) && !is_user_admin())
{
    die("No rights to edit this template");
}

$relreffedjsonstr = make_refs_local(urldecode($lo_data), $absmedia);

//_debug("upload (lo_data, local_refs): " . $relreffedjsonstr);

file_put_contents($filenamejson, print_r($relreffedjsonstr, true));

// Remove illegeal characters that we regurarly detect in the content because of copy and paste from other platforms
// At this point only ASCII character STX (soft hyphen) is replaced by a hyphen
$relreffedjsonstr = str_replace("\x02", "-", $relreffedjsonstr);

$relreffedjson = json_decode($relreffedjsonstr);

//_debug("upload: decoded json");

$data = process($relreffedjson);

//_debug("upload: converted to xml");

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

//_debug("upload: saved as xml");

if ($mode == "publish")
{
    file_put_contents($preview, $data->asXML());
    // Update templatedetails modify date
    $sql = "update {$xerte_toolkits_site->database_table_prefix}templatedetails set date_modified=? where template_id=?";
    $params = array(date("Y-m-d H:i:s"), $template_id);
    db_query_one($sql, $params);

    update_oai($data, $template_id);
    //_debug("upload: updated table");
}

echo true;

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

    //_debug("upload: " . print_r($json, true));

    if (isset($json->attributes)) {
            foreach ($json->attributes as $key => $val) {
                    $name = $key; //echo $name;
                    $value = $val; //echo $value;
                    //_debug("upload: " . $name . " ->"  . $value);
                    if (is_null($xml)) {
                            if ($name == 'nodeName') {
                                //_debug("upload: before new");
                                $xml = new ExSimpleXMLElement('<'.$value.'/>');
                                //_debug("upload: after new");
                            }
                            else {
                                //_debug("upload: addAttribute (1)");
                                $xml->addAttribute($name, $value);
                            }
                    }
                    else {
                            if ($name == 'nodeName') {
                                //_debug("upload: addChild");
                                $xml = $xml->addChild($value);
                            }
                            else {
                                //_debug("upload: addAttribute (2)");
                                $xml->addAttribute($name, $value);
                            }
                    }
            }
    }
    if (isset($json->data)) {
        //_debug("upload: Add CDATA step 1");
        if (! is_null($xml))
        {
            //_debug("upload: Add CDATA step 2");
            $xml = $xml->addCData($json->data);
        }
    }

    // Do the same for all child nodes
    //_debug("upload: processing children");
    if (isset($json->children)) {
            foreach ($json->children as $key => $val) {
                //_debug("upload: process " . $key . " -> " . print_r($val, true));
                process($val, $xml);
            }
    }

    return $xml;
}

function is_ajax_request() {
	return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

function update_oai($data, $template_id){
    global $xerte_toolkits_site;
    $oaiPmhAgree = (string)$data->attributes()->oaiPmhAgree;
    if ((string)$data->attributes()->targetFolder != "site") {
        $category = (string)$data->attributes()->category;
    }
    else {
        $category = (string)$data->attributes()->metaCategory;
    }
    $level = (string)$data->attributes()->metaEducation;
    $user_type = '';
    //get access status
    $sql = "select access_to_whom from {$xerte_toolkits_site->database_table_prefix}templatedetails where template_id=?";
    $rec = db_query_one($sql, array($template_id));
    $status = $rec["access_to_whom"];

    if ($oaiPmhAgree !== "") {
        $sql = "select status from {$xerte_toolkits_site->database_table_prefix}oai_publish where template_id=? ORDER BY audith_id DESC LIMIT 1";
        $params = array($template_id);
        $rec = db_query_one($sql, $params);
        $last_oaiTable_status = $rec["status"];

        //find user type
        if (is_user_admin()){
            $user_type = "admin";
        } else {
            $sql = "select role from {$xerte_toolkits_site->database_table_prefix}templaterights where template_id=? AND user_id=?";
            $params = array($template_id, $_SESSION['toolkits_logon_id']);
            $rec = db_query_one($sql, $params);
            $user_type = $rec["role"];
        }

        $query = "insert into {$xerte_toolkits_site->database_table_prefix}oai_publish set template_id=?, login_id=?, user_type=?, status=?";
        $params = array($template_id, $_SESSION["toolkits_logon_id"], $user_type);

        if ($oaiPmhAgree == 'true' and $category !== "" and $level !== "" and $status === "Public") {
            //add new row to oai_published to indicate current oai-pmh status
            if (is_null($last_oaiTable_status) || $last_oaiTable_status != "published") {
                db_query_one($query, array_merge($params, array("published")));
            }
        } elseif ($oaiPmhAgree == 'true' and ($category == "" or $level == "") and $status === "Public") {
            //if the project has never been oai published we don't add it here
            if ($last_oaiTable_status != "incomplete" AND !is_null($last_oaiTable_status)){
                db_query_one($query, array_merge($params, array("incomplete")));
            }
        } else {
            //if the project has never been oai published we don't add it here
            if ($last_oaiTable_status != "deleted" AND !is_null($last_oaiTable_status)){
                db_query_one($query, array_merge($params, array("deleted")));
            }
        }
    }
}
<?php
/**
 * Shared save logic for learning object preview/publish (editor upload).
 * Used by editor/upload.php and REST API.
 */

require_once(dirname(__FILE__) . '/../template_status.php');

/**
 * Extension for SimpleXMLElement
 * @author Alexandre FERAUD
 */
class ExSimpleXMLElement extends SimpleXMLElement
{
    public function addCData($cdata_text)
    {
        $node = dom_import_simplexml($this);
        $no = $node->ownerDocument;
        $node->appendChild($no->createCDATASection($cdata_text));
    }

    public function addChildCData($name, $cdata_text)
    {
        $child = $this->addChild($name);
        $child->addCData($cdata_text);
    }

    public function appendXML($append)
    {
        if ($append) {
            if (strlen(trim((string) $append)) == 0) {
                $xml = $this->addChild($append->getName());
                foreach ($append->children() as $child) {
                    $xml->appendXML($child);
                }
            } else {
                $xml = $this->addChild($append->getName(), (string) $append);
            }
            foreach ($append->attributes() as $n => $v) {
                $xml->addAttribute($n, $v);
            }
        }
    }
}

function learning_object_check_abs_media_path($absmedia)
{
    global $xerte_toolkits_site;
    if (strpos($absmedia, $xerte_toolkits_site->site_url . $xerte_toolkits_site->users_file_area_short) !== 0) {
        return array('ok' => false, 'message' => 'Invalid media path specified', 'code' => 'invalid_media_path');
    }
    return array('ok' => true);
}

function learning_object_make_refs_local($json, $media)
{
    $temp = $json;
    $pos = strpos($temp, '\"' . $media);
    while ($pos !== false) {
        $pos2 = strpos($temp, '\"', $pos + 1);
        $temp = substr($temp, 0, $pos) . '\"FileLocation + \'' . substr($temp, $pos + strlen($media) + 2, $pos2 - $pos - strlen($media) - 2) . '\'\"' . substr($temp, $pos2 + 2);
        $pos = strpos($temp, '\"' . $media);
    }
    $pos = strpos($temp, '"' . $media);
    while ($pos !== false) {
        $pos2 = strpos($temp, '"', $pos + 1);
        $temp = substr($temp, 0, $pos) . '"FileLocation + \'' . substr($temp, $pos + strlen($media) + 1, $pos2 - $pos - strlen($media) - 1) . '\'"' . substr($temp, $pos2 + 1);
        $pos = strpos($temp, '"' . $media);
    }
    $temp = str_replace("'/media", "'media", $temp);
    return $temp;
}

function learning_object_process($json, $xml = null)
{
    if (isset($json->attributes)) {
        foreach ($json->attributes as $key => $val) {
            $name = $key;
            $value = $val;
            if (is_null($xml)) {
                if ($name == 'nodeName') {
                    $xml = new ExSimpleXMLElement('<' . $value . '/>');
                } else {
                    $xml->addAttribute($name, $value);
                }
            } else {
                if ($name == 'nodeName') {
                    $xml = $xml->addChild($value);
                } else {
                    $xml->addAttribute($name, $value);
                }
            }
        }
    }
    if (isset($json->data)) {
        if (!is_null($xml)) {
            $xml = $xml->addCData($json->data);
        }
    }
    if (isset($json->children)) {
        foreach ($json->children as $key => $val) {
            learning_object_process($val, $xml);
        }
    }
    return $xml;
}

function learning_object_update_oai($data, $template_id)
{
    global $xerte_toolkits_site;
    $oaiPmhAgree = (string) $data->attributes()->oaiPmhAgree;
    if ((string) $data->attributes()->targetFolder != "site") {
        $category = (string) $data->attributes()->category;
    } else {
        $category = (string) $data->attributes()->metaCategory;
    }
    $level = (string) $data->attributes()->metaEducation;
    $user_type = '';
    $sql = "select access_to_whom from {$xerte_toolkits_site->database_table_prefix}templatedetails where template_id=?";
    $rec = db_query_one($sql, array($template_id));
    $status = $rec["access_to_whom"];

    if ($oaiPmhAgree !== "") {
        $sql = "select status from {$xerte_toolkits_site->database_table_prefix}oai_publish where template_id=? ORDER BY audith_id DESC LIMIT 1";
        $rec = db_query_one($sql, array($template_id));
        $last_oaiTable_status = $rec["status"];

        if (is_user_admin()) {
            $user_type = "admin";
        } else {
            $sql = "select role from {$xerte_toolkits_site->database_table_prefix}templaterights where template_id=? AND user_id=?";
            $rec = db_query_one($sql, array($template_id, $_SESSION['toolkits_logon_id']));
            $user_type = $rec["role"];
        }

        $query = "insert into {$xerte_toolkits_site->database_table_prefix}oai_publish set template_id=?, login_id=?, user_type=?, status=?";
        $params = array($template_id, $_SESSION["toolkits_logon_id"], $user_type);

        if ($oaiPmhAgree == 'true' and $category !== "" and $level !== "" and $status === "Public") {
            if (is_null($last_oaiTable_status) || $last_oaiTable_status != "published") {
                db_query_one($query, array_merge($params, array("published")));
            }
        } elseif ($oaiPmhAgree == 'true' and ($category == "" or $level == "") and $status === "Public") {
            if ($last_oaiTable_status != "incomplete" AND !is_null($last_oaiTable_status)) {
                db_query_one($query, array_merge($params, array("incomplete")));
            }
        } else {
            if ($last_oaiTable_status != "deleted" AND !is_null($last_oaiTable_status)) {
                db_query_one($query, array_merge($params, array("deleted")));
            }
        }
    }
}

/**
 * @param array $post fileupdate, filename, lo_data, absmedia, template_id, optional preview for publish
 * @return array{ok:bool,message?:string,code?:string,mode?:string}
 */
function learning_object_save_from_request(array $post)
{
    global $xerte_toolkits_site;

    require_once($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->php_library_path . 'user_library.php');

    $fileupdate = isset($post['fileupdate']) ? x_clean_input($post['fileupdate']) : '';
    $filename = isset($post['filename']) ? x_clean_input($post['filename']) : '';
    $mode = $fileupdate ? "publish" : "preview";
    $preview = null;

    if ($mode == 'publish') {
        if (empty($post['preview'])) {
            return array('ok' => false, 'message' => 'No preview path for publish', 'code' => 'missing_preview');
        }
        $previewxml = x_clean_input($post['preview']);
        $preview = x_convert_user_area_url_to_path($previewxml);
        if (!x_check_path_traversal($preview, $xerte_toolkits_site->users_file_area_full, 'Invalid preview path specified', 'file', true)) {
            return array('ok' => false, 'message' => 'Invalid preview path specified', 'code' => 'invalid_path');
        }
    }

    $filenamePath = x_convert_user_area_url_to_path($filename);
    if (!x_check_path_traversal($filenamePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified', 'file', true)) {
        return array('ok' => false, 'message' => 'Invalid file path specified', 'code' => 'invalid_path');
    }

    $filenamejson = substr($filenamePath, 0, strlen($filenamePath) - 3) . "json";

    $lo_data = isset($post['lo_data']) ? $post['lo_data'] : '';
    if (function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) {
        $lo_data = stripslashes($lo_data);
    }

    $absmedia = x_clean_input($post['absmedia']);
    $check = learning_object_check_abs_media_path($absmedia);
    if (!$check['ok']) {
        return $check;
    }

    $template_id = x_clean_input($post['template_id'], 'numeric');

    $folder_path_part = $xerte_toolkits_site->users_file_area_full . $template_id . '-';
    if (strpos($filenamePath, $folder_path_part) !== 0) {
        return array('ok' => false, 'message' => 'Invalid upload location', 'code' => 'invalid_folder');
    }

    if (!is_user_an_editor($template_id, $_SESSION['toolkits_logon_id']) && !is_user_admin()) {
        return array('ok' => false, 'message' => 'No rights to edit this template', 'code' => 'forbidden');
    }

    $relreffedjsonstr = learning_object_make_refs_local(urldecode($lo_data), $absmedia);
    file_put_contents($filenamejson, print_r($relreffedjsonstr, true));
    $relreffedjsonstr = str_replace("\x02", "-", $relreffedjsonstr);
    $relreffedjson = json_decode($relreffedjsonstr);

    $data = learning_object_process($relreffedjson);

    for ($i = 10; $i > 1; $i--) {
        $j = $i - 1;
        if (file_exists($filenamePath . "." . $j)) {
            rename($filenamePath . "." . $j, $filenamePath . "." . $i);
        }
    }
    rename($filenamePath, $filenamePath . ".1");

    for ($i = 10; $i > 1; $i--) {
        $j = $i - 1;
        if (file_exists($filenamejson . "." . $j)) {
            rename($filenamejson . "." . $j, $filenamejson . "." . $i);
        }
    }
    rename($filenamejson, $filenamejson . ".1");

    file_put_contents($filenamePath, $data->asXML());

    if ($mode == "publish" && $preview !== null) {
        file_put_contents($preview, $data->asXML());
        $sql = "update {$xerte_toolkits_site->database_table_prefix}templatedetails set date_modified=? where template_id=?";
        db_query_one($sql, array(date("Y-m-d H:i:s"), $template_id));
        learning_object_update_oai($data, $template_id);
    }

    return array('ok' => true, 'mode' => $mode);
}

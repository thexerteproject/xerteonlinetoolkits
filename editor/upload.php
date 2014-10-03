<?php

// Check for Preview/Publish
$tst = file_get_contents("php://stdin");
$fileupdate = $_POST["fileupdate"];
$filename = $_POST["filename"];
$mode = $fileupdate ? "publish" : "preview";
if ($mode == 'publish')
{
    $preview = dirname(dirname(__FILE__)) . '/' . $_POST["preview"];
}
$filename = dirname(dirname(__FILE__)) . '/' . $filename;

$absjson = make_refs_local(urldecode($_POST["lo_data"]), $_POST['absmedia']);

//file_put_contents("unprocessed_$mode.txt", print_r(urldecode($_POST["lo_data"]), true));
//file_put_contents("local_refs_$mode.txt", print_r($absjson, true));

$relreffedjson = json_decode($absjson);

$json = json_decode(urldecode($_POST["lo_data"]));


$data = process($relreffedjson);
//file_put_contents("decoded_unprocessed_$mode.txt", print_r($json, true));
//file_put_contents("decoded_local_refs_$mode.txt", print_r($relreffedjson, true));
//file_put_contents("processed_$mode.xml", $data->asXML());
file_put_contents($filename, $data->asXML());
if ($mode == "publish")
{
    file_put_contents($preview, $data->asXML());
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
    // Handle .thumbs first
    $thumbs = $media . ".thumbs/";
    //1a. \" followed by .thumbs/media/
    $pos = strpos($temp, '\"' . $thumbs);
    while ($pos !== false)
    {
        $pos2 = strpos($temp, '\"', $pos+1);
        $temp = substr($temp, 0, $pos) . '\"FileLocation + \'' . substr($temp, $pos + strlen($thumbs) + 2, $pos2 - $pos - strlen($thumbs)-2) . '\'\"' . substr($temp, $pos2+2);
        $pos = strpos($temp, '\"' . $thumbs);
    }
    //file_put_contents("step1a_$mode.txt", print_r($temp, true));
    //1b. " followed by .thumbs/media/
    $pos = strpos($temp, '"' . $thumbs);
    while ($pos !== false)
    {
        $pos2 = strpos($temp, '"', $pos+1);
        $temp = substr($temp, 0, $pos) . '"FileLocation + \'' . substr($temp, $pos + strlen($thumbs) + 1, $pos2 - $pos - strlen($thumbs)-1) . '\'"' . substr($temp, $pos2+1);
        $pos = strpos($temp, '"' . $thumbs);
    }
    //file_put_contents("step1b_$mode.txt", print_r($temp, true));
    //2. ' followed by .thumbs/media/
    $pos = strpos($temp, "'" . $thumbs);
    while ($pos !== false)
    {
        $temp = substr($temp, 0, $pos) . '"FileLocation + \'' . substr($temp, $pos + strlen($thumbs)) . '\'"';
        $pos = strpos($temp, '"' . $thumbs);
    }
    //file_put_contents("step2_$mode.txt", print_r($temp, true));

    //3a. \" followed by media
    $pos = strpos($temp, '\"' . $media);
    while ($pos !== false)
    {
        $pos2 = strpos($temp, '\"', $pos+1);
        $temp = substr($temp, 0, $pos) . '\"FileLocation + \'' . substr($temp, $pos + strlen($media) + 2, $pos2 - $pos - strlen($media)-2) . '\'\"' . substr($temp, $pos2+2);
        $pos = strpos($temp, '\"' . $media);
    }
    //file_put_contents("step3a_$mode.txt", print_r($temp, true));
    //3b. " followed by media
    $pos = strpos($temp, '"' . $media);
    while ($pos !== false)
    {
        $pos2 = strpos($temp, '"', $pos+1);
        $temp = substr($temp, 0, $pos) . '"FileLocation + \'' . substr($temp, $pos + strlen($media) + 1, $pos2 - $pos - strlen($media) -1) . '\'"' . substr($temp, $pos2+1);
        $pos = strpos($temp, '"' . $media);
    }
    //file_put_contents("step3b_$mode.txt", print_r($temp, true));
    //4. ' followed by media
    $pos = strpos($temp, "'" . $media);
    while ($pos !== false)
    {
        $temp = substr($temp, 0, $pos) . '"FileLocation + \'' . substr($temp, $pos + strlen($media) . '\'"');
        $pos = strpos($temp, '"' . $media);
    }
    //file_put_contents("step4_$mode.txt", print_r($temp, true));
    return $temp;
}

function process($json, $xml = null) {

    if (isset($json->attributes)) {
            foreach ($json->attributes as $key => $val) {
                    $name = $key; //echo $name;
                    $value = $val; //echo $value;

                    if (is_null($xml)) {
                            if ($name == 'nodeName') {
                                    $xml = new ExSimpleXMLElement('<'.$value.'/>');
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
    if (isset($json->data)) {
        if (! is_null($xml))
        {
            $xml = $xml->addCData($json->data);
        }
    }

    // Do the same for all child nodes
    if (isset($json->children)) {
            foreach ($json->children as $key => $val) {
                    process($val, $xml);
            }
    }

    return $xml;
}

function is_ajax_request() {
	return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}
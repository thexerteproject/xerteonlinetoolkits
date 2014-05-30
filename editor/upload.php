<?php

// Check for Preview/Publish
$tst = file_get_contents("php://stdin");
$fileupdate = $_POST["fileupdate"];
$mode = $fileupdate ? "publish" : "preview";

//$json = array(
//    "attributes" => json_decode(urldecode($_POST["attributes"])),
//    "children" => json_decode(urldecode($_POST["children"])),
//);

$json = json_decode(urldecode($_POST["lo_data"]));

$data = process($json);
file_put_contents("unprocessed_$mode.txt", print_r($json, true));
file_put_contents("processed_$mode.xml", $data->asXML());

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


function process($json, $xml = null) {
        if (isset($json->attributes)) {
                foreach ($json->attributes as $key => $val) {
                        $name = $val->name; //echo $name;
                        $value = $val->value; //echo $value;

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
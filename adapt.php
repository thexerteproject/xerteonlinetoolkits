<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 16-10-2018
 * Time: 19:48
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

function addChildNode(SimpleXMLElement $target, SimpleXMLElement $insert)
{
    $target_dom = dom_import_simplexml($target);
    $insert_dom = $target_dom->ownerDocument->importNode(dom_import_simplexml($insert),true);
    return $target_dom->appendChild($insert_dom);
}

function replaceChildNode(SimpleXMLElement $target, SimpleXMLElement $replacement)
{
    $target_dom = dom_import_simplexml($target);
    $replacement_dom = $target_dom->ownerDocument->importNode(dom_import_simplexml($replacement), true);
    $p = $target_dom->parentNode;
    return $p->replaceChild($replacement_dom, $target_dom);
}


function folder_loop($dir, &$results = array()){
    $files = scandir($dir);

    foreach($files as $key => $value){
        $path = realpath($dir.DIRECTORY_SEPARATOR.$value);
        if(!is_dir($path)) {
            if ($value =="data.xml" || $value == "preview.xml") {
                $results[] = $path;
            }
        } else if($value != "." && $value != "..") {
            folder_loop($path, $results);
        }
    }

    return $results;
}

if ($argc != 2)
{
    print("Usage: adapt <xerte USER-FILES folder> \n");
}
else
{
    $xmlfiles = folder_loop($argv[1]);
    print(count($xmlfiles) . " files found");
    foreach($xmlfiles as $xmlfile) {
        print("Processing " . $xmlfile . "\n");
        $xml = simplexml_load_file($xmlfile);

        if ($xml->getName() != 'learningObject') {
            print("The file is not a proper xerte .xml file. Root node of the XML should be 'learningObject'\n");
            continue;
        }
        print("    - Creating copy " . $xmlfile . ".org\n");
        $xml->asXML($xmlfile . ".org");
        print("    - setting tracking mode to Full Last\n");
        $xml['trackingMode'] = "full";
        print("    - setting force tracking mode to true\n");
        $xml['forceTrackingMode'] = 'true';
        print("    - setting tracking score to 75%\n");
        $xml['trackingPassed'] = '75%';

        print("    - setting all Accordeon Navigators to fit content ");
        $accNavs = $xml->xpath('/learningObject/accNav');

        foreach ($accNavs as $accNav) {
            print("*");
            $accNav['panelHeight'] = 'fit';
        }
        print("\n");

        $xml->asXML($xmlfile);

        $endScreens = $xml->xpath('/learningObject/endScreen');
        {
            if(count($endScreens) > 0)
            {
                print("    - replacing endScreen with stopTracking page ");
                // Do this by text manipulation
                // Read xml text
                $xmlStr = file_get_contents($xmlfile);
                $stopTracking = "<stopTracking linkID=\"PG1540237882594\" name=\"Well done\" size=\"36\" textIntro=\"Instruction\" buttonLbl=\"Finish\" textAfter=\"&lt;p&gt;We&amp;#39;ve recorded your results.&#10;&lt;/p&gt;&#10;&lt;p&gt;You can now exit or close this session.&#10;&lt;/p&gt;\" bgImageVAlign=\"middle\" bgImageHAlign=\"centre\" bgImageVConstrain=\"\" bgImageHConstrain=\"\" bgImage=\"FileLocation + 'media/title_end.jpg'\" bgImageAlpha=\"30\" bgImageDark=\"0\" bgImageGrey=\"false\" titleVAlign=\"200\" titleHAlign=\"center\"><![CDATA[Well done for completing this lesson]]></stopTracking>";
                $pos = strpos($xmlStr, "<endScreen");
                if ($pos !== false && $pos > 0) {
                    print(" - done!\n");
                    $xmlStr = substr($xmlStr, 0, $pos) . $stopTracking . "</learningObject>\n";
                }
                file_put_contents($xmlfile, $xmlStr);
            }
        }


    }
}
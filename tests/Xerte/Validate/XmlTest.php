<?php
/**
 * @see modules/versioncontrol/template_close.php
 * @see modules/versioncontrol/update_file.php
 * @see plugins/xml_parsing_check.php
 * @see Xerte_Validate_Xml
 */

class Xerte_Validate_XmlTest extends PHPUnit_Framework_TestCase
{

    public function testXmlParsing() {
        $notXml = "string hello world blah fish | £ </strong>";
        $isXml = "<fish>\n<beans id='4'>\nblahblah | £ \n</beans>\n</fish>";
        $validator = new Xerte_Validate_Xml();

        $this->assertFalse($validator->isValid($notXml));
        $this->assertTrue($validator->isValid($isXml), print_r($validator->getMessages(), true));

    }
        
}


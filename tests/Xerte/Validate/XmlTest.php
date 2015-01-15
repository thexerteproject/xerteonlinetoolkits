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


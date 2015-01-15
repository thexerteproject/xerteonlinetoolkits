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
class Xerte_Zip_NativeTest extends PHPUnit_Framework_TestCase {


    public function setUp() {

    }

    public function testCreation() {
        $output_test = tempnam(sys_get_temp_dir(), 'ziptest');
        $this->assertEquals(filesize($output_test), 0);
        $zipper = new Xerte_Zip_Native($output_test, array());
        /* should probably create some files, rather than relying on Linux ones */
        $zipper->add_files(array('/etc/passwd', '/etc/profile')); 
        $zipper->create_archive();
        $this->assertNotEquals(filesize($output_test), 0);
        unlink($output_test);
    }
}

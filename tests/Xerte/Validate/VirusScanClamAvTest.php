<?php

class Xerte_Validate_VirusScanClamAvTest extends PHPUnit_Framework_TestCase {

    public function setUp() {
    }

    public function testRunability() {
        $this->assertTrue(Xerte_Validate_VirusScanClamAv::canRun());
    }

    public function testBasicScan() {
        $validator = new Xerte_Validate_VirusScanClamAv();

        $this->assertTrue($validator->isValid('/etc/passwd'));

        $this->assertFalse($validator->isValid('/file/does/not/exist'));
        $this->assertTrue(sizeof($validator->getMessages()) > 0 );
    }

}


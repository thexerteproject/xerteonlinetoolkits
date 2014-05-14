<?php

class Xerte_Validate_FileMimeTypeTest extends PHPUnit_Framework_TestCase {

    public function setUp() {
        Xerte_Validate_FileMimeType::$allowableMimeTypeList = array('text/plain');
    }

    public function testMimeList() {
        $this->assertTrue(sizeof(Xerte_Validate_FileMimeType::$allowableMimeTypeList) > 0);
    }

    public function testValidateWorks() {
        $validate = new Xerte_Validate_FileMimeType();
        $this->assertTrue($validate->isValid('/etc/passwd'));
    }

    public function testValidateFails() {
        $validate = new Xerte_Validate_FileMimeType();
        $this->assertFalse($validate->isValid('/usr/bin/php'));
    }
}

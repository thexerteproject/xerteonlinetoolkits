<?php

class Xerte_Validate_FileExtensionTest extends PHPUnit_Framework_TestCase {

    public function setUp() {
        Xerte_Validate_FileExtension::$BLACKLIST = 'fish,beans';
    }

    public function testBlacklist() {
        $validator = new Xerte_Validate_FileExtension();
        $this->assertTrue($validator->isValid('test.blah'));

        $this->assertFalse($validator->isValid('test.fish'));

        $messages = $validator->getMessages();
        $this->assertTrue(Sizeof($messages) > 0);
    }
}

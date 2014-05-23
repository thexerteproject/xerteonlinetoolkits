<?php

class Xerte_Zip_FactoryTest extends PHPUnit_Framework_TestCase {

    public function testCreation() {

        $zipper = Xerte_Zip_Factory::factory('test.zip', array());

        $this->assertTrue(is_object($zipper));
        $this->assertTrue(method_exists($zipper, 'add_files'));
    }
}

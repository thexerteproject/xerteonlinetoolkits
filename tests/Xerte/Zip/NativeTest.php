<?php

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

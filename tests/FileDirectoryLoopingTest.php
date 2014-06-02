<?php

require_once(dirname(__FILE__) . '/../website_code/php/import/util.php');

class TestDirectoryFileRecursion extends PHPUnit_Framework_TestCase {

    protected $path = null;

    public function setUp() {
        $this->path = dirname(__FILE__) . '/test';
        // SetUp()
        if(is_dir($this->path)) {
            system('rm -Rf test');
        }

        mkdir('test');
        mkdir('test/a');
        mkdir('test/b');
        mkdir('test/b/c');
        mkdir('test/b/c/d');
        touch('test/a/file1.txt');
        touch('test/a/file2.txt');
        touch('test/a/file3.txt');
        touch('test/a/file4.txt');

    }

    public function testDeleteLoop() {
        $path = $this->path;

        global $delete_file_array;
        delete_loop($path);

        $files = get_recursive_file_list($path);

        $this->assertEquals(sizeof($delete_file_array), sizeof($files));

        $this->assertEquals(array_slice($delete_file_array, 0, 5), array_slice($files, 0, 5)); 

    }

    public function testGetRecursiveDirectoryList() {
        $path = $this->path;

        $initialCount = sizeof(get_recursive_directory_list($path));

        $this->assertTrue($initialCount > 0);

        // up one dir. should have more. 
        $path =  dirname($path);
        $newCount = sizeof(get_recursive_directory_list($path));
        $this->assertTrue($newCount > $initialCount);
    }

    
    public function testRecursiveDelete() { 

        $path = $this->path;
        recursive_delete($path);

        if(!is_dir('test/a/')) {
            $this->skip("WARN: dir not present, shouldn't have been removed yet");
        }

        recursive_delete($path, true);

        $this->assertFalse(file_exists($path));
        $this->assertFalse(file_exists($path . '/a'));
    }
}




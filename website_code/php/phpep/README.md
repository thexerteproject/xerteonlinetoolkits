
## phpep: A Tiny PHP Expression Parser - Ported from jsep
[phpep](http://jsep.from.so/) is a simple expression parser written in PHP, ported from JavaScript. It can parse expressions but not operations. The difference between expressions and operations is akin to the difference between a cell in an Excel spreadsheet vs. a proper JavaScript program.

### Why phpep?
I wanted a lightweight, tiny parser to be included in one of my other libraries. jsep provided this functionality. I also wanted to be able to parse these expressions in my PHP projects, which led me to porting jsep.

### Usage
#### PHP
    require('phpep.php');
    $expr = new PHPEP("1 + 1");
    $stack = $expr->exec();
    var_dump($stack);

#### Custom Operators
    // Not yet implemented.

### Install dependencies
Dependencies are managed using composer. To install the dependencies, run the following command:
`php composer.phar install`

### PHPUnit Tests
This library is using php unit testing framework. In order to test the library, run the following command:
`/vendor/bin/phpunit`

### License
phpep is under the MIT license. See LICENSE file.

### Thanks
Thanks to Stephen Oney for the original jsep project
Some parts of the latest version of jsep were adapted from the esprima parser.

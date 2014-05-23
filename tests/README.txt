Download phpunit.phar using e.g. :

wget https://phar.phpunit.de/phpunit.phar

Then run like :

php phpunit.phar TestName.php

or

php phpunit.phar

or 

chmod 755 phpunit.phar

./phpunit.phar 



You'll then see something like :

orange:~/src/xerteonlinetoolkits/tests $ ./phpunit.phar 
PHPUnit 4.1.0 by Sebastian Bergmann.

Configuration read from /home/david/src/xerteonlinetoolkits/tests/phpunit.xml

...

Time: 36 ms, Memory: 3.50Mb

OK (3 tests, 6 assertions)



assuming everything works.


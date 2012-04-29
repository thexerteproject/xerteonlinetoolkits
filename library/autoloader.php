<?php

// Some ZF stuff has explicit require_once's in it... meh.
ini_set('include_path', ini_get('include_path') . ':' . dirname(__FILE__) );

function _xerte_autoloader($class) {
    
    $class = str_replace("_", DIRECTORY_SEPARATOR , $class);
    $full_file_name = dirname(__FILE__) . DIRECTORY_SEPARATOR . $class . '.php';

    //echo "Looking for $class <br/>";
    if(file_exists($full_file_name)) {
        require_once($full_file_name); 
        return true;
    }

    // hmm, pass onto someone else?
    return false;

    
}

spl_autoload_register("_xerte_autoloader");

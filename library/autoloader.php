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
 
// Some ZF stuff has explicit require_once's in it... meh.
ini_set('include_path', ini_get('include_path') . PATH_SEPARATOR . dirname(__FILE__) );


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

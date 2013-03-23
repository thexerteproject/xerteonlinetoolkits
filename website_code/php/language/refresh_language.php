<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tom
 * Date: 22-3-13
 * Time: 23:44
 * To change this template use File | Settings | File Templates.
 */

require_once("../../../config.php");
require_once("../management/management_library.php");
require_once("../user_library.php");
_load_language_file("/website_code/php/language/delete_language.inc");


if(!is_user_admin()){
    management_fail();
}

echo "****";
language_details(true);
?>
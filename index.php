<?php

require("config.php");

/**
 * 
 * Login page, self posts to become management page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

include $xerte_toolkits_site->php_library_path . "login_library.php";

include $xerte_toolkits_site->php_library_path . "display_library.php";

// list of error messages to display to the end user
$errors = array();

/*
 * Some data has been posted, interpret as attempt to login
 */

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // both empty?
    if(empty($_POST['login']) && empty($_POST['password'])) { 
        $errors[] = "<p>Please enter your username and password</p>";
    }
    elseif(empty($_POST["login"])) { // empty login
        $errors[] = "<p>Please enter your username</p>";
    }
    elseif(empty($_POST["password"])) { // empty password
        $errors[] = "<p>Please enter your password</p>";
    } 
    elseif(!empty($_POST["login"]) && !empty($_POST["password"])) {
        // try and authenticate the user
        if( ($_POST["login"] != $xerte_toolkits_site->admin_username) && (stripslashes($_POST["password"]) != $xerte_toolkits_site->admin_password) ) {
            if(!function_exists("ldap_connect")){
                $errors[] = "<p>PHP's LDAP library needs to be installed to use LDAP authentication. If you read the install guide other options are available</p>";
            }
        }

        if(valid_login($_POST["login"],$_POST["password"], $xerte_toolkits_site)){

            /*
             * Get some user details back from LDAP
             */

            $entry = get_user_details($_POST["login"],$_POST["password"]);

            $entry = $entry[1];

            $_SESSION['toolkits_firstname'] = $entry[0]['givenname'][0];

            $_SESSION['toolkits_surname'] = $entry[0]['sn'][0];

            require_once $xerte_toolkits_site->php_library_path . "database_library.php";

            require_once $xerte_toolkits_site->php_library_path . "user_library.php";

            $mysql_id=database_connect("index.php database connect success","index.php database connect fail");	

            $_SESSION['toolkits_logon_username'] = $_POST["login"];

            /*
             * Check to see if this is a users' first time on the site
             */

            if(check_if_first_time($_SESSION['toolkits_logon_username'])){

                /*
                 *	create the user a new id			
                 */

                $_SESSION['toolkits_logon_id'] = create_user_id();

                /*
                 *   create a virtual root folder for this user
                 */

                create_a_virtual_root_folder();			

            }else{

                /*
                 * User exists so update the user settings
                 */

                $_SESSION['toolkits_logon_id'] = get_user_id();

                update_user_logon_time();

            }

            recycle_bin();		

            /*
             * Output the main page, including the user's and blank templates
             */

            echo file_get_contents($xerte_toolkits_site->website_code_path . "management_headers");

            echo "
                <script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS
                var site_url = \"{$xerte_toolkits_site->site_url}\";
                var site_apache = \"{$xerte_toolkits_site->apache}\";
                var properties_ajax_php_path = \"website_code/php/properties/\";
                var management_ajax_php_path = \"website_code/php/management/\";
                var ajax_php_path = \"website_code/php/\";";

            echo logged_in_page_format_top(file_get_contents($xerte_toolkits_site->website_code_path . "management_top"));

            list_users_projects("data_down");

            echo logged_in_page_format_middle(file_get_contents($xerte_toolkits_site->website_code_path . "management_middle"));

            list_blank_templates();

            echo file_get_contents($xerte_toolkits_site->website_code_path . "management_bottom");

            exit(0);
        }else{

            if(($_POST["login"]==$xerte_toolkits_site->admin_username)&&(stripslashes($_POST["password"])==$xerte_toolkits_site->admin_password)){
                $errors[] = "<p>Site admins should log on on the <a href='management.php'>manangement</a> page</p>";
            }else{
                $errors[] = "<p>Sorry that password combination was not correct</p>";
            }

        }

    }

}


$buffer = login_page_format_top(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_top"));
foreach($errors as $error) {
    $buffer .= $error;
}
$buffer .= login_page_format_bottom(file_get_contents($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->website_code_path . "login_bottom"));

echo $buffer;
?>
</body>
</html>

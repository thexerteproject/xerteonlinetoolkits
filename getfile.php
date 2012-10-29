<?php
require_once(dirname(__FILE__) . "/config.php");
require $xerte_toolkits_site->php_library_path . "user_library.php";
require $xerte_toolkits_site->php_library_path . "template_library.php";
require $xerte_toolkits_site->php_library_path . "template_status.php";

// be slightly paranoid over the path the user is requesting to download.
$unsafe_file_path = $_GET['file'];
if(!preg_match('/^([0-9]+)-([a-z0-9]+)-/', $unsafe_file_path, $matches)) {
    die("path must start with a number, and then a username - e.g. 20-foobar-");
}

$template_id = $matches[1];
$username = $matches[2];

$has_perms = is_user_admin() || has_rights_to_this_template($template_id,$_SESSION['toolkits_logon_id']);

if($has_perms) { 
    if(is_user_an_editor($template_id,$_SESSION['toolkits_logon_id'])){
        if($username == $_SESSION['toolkits_logon_username']) { 
            // they're logged in, and hopefully have access to the media contents.
            $file = dirname(__FILE__) . '/USER-FILES/' . $unsafe_file_path;
            if(!is_file($file)) { 
                die("Fail: file not found on disk"); 
            }
            $filename = addslashes(basename($file));

            header("Cache-Control: public");
            header("Content-Length: " . filesize($file));
            header("Content-Description: File Transfer");
            header("Content-Type: application/force-download"); 
            header("Content-Disposition: attachment; filename=\"$filename\"");
            header("Content-Transfer-Encoding: binary");
            flush();
            readfile($file);
            exit(0);
        }
    }
}

echo "You do not appear to have permission to view this resource.";

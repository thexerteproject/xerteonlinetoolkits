<?php 
require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");

if(!isset($_SESSION['toolkits_logon_id'])) {
    die("Session ID not set");
}

if (isset($_SESSION["paths_img_search"])) {
    $images = $_SESSION["paths_img_search"];
    if ($_POST["indices_to_delete"] !== null) {
        $indices_to_delete = x_clean_input($_POST["indices_to_delete"]);
        for ($i = 0; $i < count($indices_to_delete); $i++) {
            $index = $indices_to_delete[$i];
            if ($index > count($images) && $index < 0) {
                continue;
            }
            $image = $images[$index];
            $ext = pathinfo($image, PATHINFO_EXTENSION);
            $credits = str_replace($ext, "txt", $image);
            unlink($image);
            //TODO: This doesn't work for credits of hosted/hotlinked images. To do so, use either the creditPaths which should be added to session the same as paths_img_search OR when calling imgSelection.php specify the api as well, then filter; if it's a hot-linked api skip the above $ext step and instead 'find' the credits by hashing the URL with the same algo as before (the URL = paths_img_search in this case) then look for it in media/attributions
            unlink($credits);
        }
    }
    unset($_SESSION["paths_img_search"]);
    echo "OK";
}


<?php 
require_once (str_replace('\\', '/', __DIR__) . "/../../config.php");
if(isset($_SESSION["paths_img_search"])){
	$images = $_SESSION["paths_img_search"];
	for($i = 0; $i < count($_POST["indices_to_delete"]); $i++){
		$index = $_POST["indices_to_delete"][$i];
		if($index > count($images) && $index < 0) {
			continue;
		}
		$image = $images[$index];
		$ext = pathinfo($image, PATHINFO_EXTENSION);
		$credits = str_replace($ext, "txt", $image);
		//echo $image . "<br>";
		//x_check_path_traversal($image);
		unlink($image);
		unlink($credits);
	}
	unset($_SESSION["paths_img_search"]);
	echo "OK";
}

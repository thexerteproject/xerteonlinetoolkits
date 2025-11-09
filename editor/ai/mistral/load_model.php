<?php 
require_once(str_replace('\\', '/', __DIR__) . "/mistral_model.php");

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}

foreach(glob(str_replace('\\', '/', __DIR__) . "/model_*.php") as $file){
	require_once($file);
}

function load_model($type, $api, $model = null, $context = "standard", $sub_type = null){
	$name = $api . "_model_" . $type;
	if($context == null){
		$context = "standard";
	}
	if(class_exists($name)) {
		return new $name($type, $model, $context, $sub_type);
	}else {
		return new mistral_model($type, $model, $context, $sub_type);
	}
}

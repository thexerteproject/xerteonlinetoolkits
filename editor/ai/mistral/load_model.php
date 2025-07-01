<?php 
require_once(str_replace('\\', '/', __DIR__) . "/model.php");
foreach(glob(str_replace('\\', '/', __DIR__) . "/model_*.php") as $file){
	require_once($file);
}

function load_model_mi($type, $model = null, $context = "standard", $sub_type = null){
	$name = "mistral_ai_" . $type;
	if($context == null){
		$context = "standard";
	}
	if(class_exists($name)) {
		return new $name($type, $model, $context, $sub_type);
	}else {
		return new mistral_ai($type, $model, $context, $sub_type);
	}
}

<?php 
require_once(str_replace('\\', '/', __DIR__) . "/model.php");
foreach(glob(str_replace('\\', '/', __DIR__) . "/model_*.php") as $file){
	require_once($file);
}

function load_model($type, $model = null, $context = "standard", $sub_type = null){
	$name = "anthropic_ai_" . $type;
	if(class_exists($name)) {
		return new $name($type, $model, $context, $sub_type);
	}else {
		return new anthropic_ai($type, $model, $context, $sub_type);
	}
}

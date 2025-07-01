<?php 
require_once(str_replace('\\', '/', __DIR__) . "/model.php");
foreach(glob(str_replace('\\', '/', __DIR__) . "/model_*.php") as $file){
	require_once($file);
}

function load_model_op($type, $model = null, $context = "standard", $sub_type = null, $model_template = null, $assistantOn = false, $assistantId = null){
	$name = "openai_ai_" . $type;

	if($context == null){
		$context = "standard";
	}
	if($assistantOn == null) {
		$assistantOn = false;
	}
	if(class_exists($name)) {
		return new $name($type, $model, $context, $sub_type, $model_template, $assistantOn, $assistantId);
	}else {
		return new openai_ai($type, $model, $context, $sub_type, $model_template, $assistantOn, $assistantId);
	}
}

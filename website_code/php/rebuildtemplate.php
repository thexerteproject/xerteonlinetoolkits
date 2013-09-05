<?php

require 'xwdBuilder.php';

function folder_loop($path){
	$xwds = array();
	$d = opendir($path);
	while($f = readdir($d)){
		if(!is_dir($path . $f)){
			if(strpos($f, ".xwd")>0){
				$string = $path . '/' . $f;
				array_push($xwds, $string);
			}
		}
	}

	closedir($d);
	return $xwds;
}


if ($argc != 2)
{
	print("Usage: rebuildmodel <model xwd folder>\n");
}
else
{
	$xwd = new XerteXWDBuilder();
	if ($xwd->loadTemplateXWD($argv[1] . '/basic.xwd') != -1)
	{
		$skipTemplate = $argv[1] . '/template.xwd';
		$skipBasic = $argv[1] . '/basic.xwd';
		$xwds = folder_loop($argv[1]);
        sort($xwds);
		foreach($xwds as $model)
		{
			if ($model != $skipTemplate && $model != $skipBasic)
			{
				$xwd->addXwd($model, 'true', 'false');
			}
		}
		$xwd->xml->asXML($argv[1] . '/template.xwd');
	}
}


?>
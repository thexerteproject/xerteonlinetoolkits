<?php

require 'xwdBuilder.php';

if ($argc != 3)
{
	print("Usage: addmodel <template xwd> <model xwd>\n");
}
else
{
	$xwd = new XerteXWDBuilder();
	if ($xwd->loadTemplateXWD($argv[1]) != -1)
	{
		if ($xwd->addXwd($argv[2], 'true', 'false') != -1)
		{
			$xwd->xml->asXML($argv[1]);
		}
	}
}


?>

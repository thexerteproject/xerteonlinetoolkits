<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
	if ($xwd->loadTemplateXWD($argv[1] . '/basic.xwd', $argv[1] . '/basicPages.xwd') != -1)
	{
		$skipTemplate = $argv[1] . '/template.xwd';
		$skipBasic = $argv[1] . '/basic.xwd';
		$skipPageBasic = $argv[1] . '/basicPages.xwd';
		$xwds = folder_loop($argv[1]);
        sort($xwds);
		foreach($xwds as $model)
		{
			if ($model != $skipTemplate && $model != $skipBasic && $model != $skipPageBasic)
			{
				$xwd->addXwd($model, 'true', 'false');
			}
		}
		$xwd->xml->asXML($argv[1] . '/template.xwd');
	}
}


?>
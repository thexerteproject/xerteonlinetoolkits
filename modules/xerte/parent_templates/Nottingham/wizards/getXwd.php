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

require_once ("../../../../../config.php");

// Get the parent folder of the given path
function getParentPath($path)
{

}

$xwd_path = dirname(__DIR__) .'/';

if (file_exists($xwd_path . "wizards/" . $_SESSION['toolkits_language'] . "/data.xwd" ))
{
    $xwd_file_path = $xwd_path . "wizards/" . $_SESSION['toolkits_language'] . "/data.xwd";
}
else if (file_exists($xwd_path . "wizards/en-GB/data.xwd" ))
{
    $xwd_file_path = $xwd_path . "wizards/en-GB/data.xwd";
}
else if (file_exists($xwd_path . "data.xwd"))
{
    $xwd_file_path = $xwd_path . "data.xwd";
}

// Check if there are any custom files and merge those in.
$plugin_path = "";
if (file_exists($xwd_path . "wizards/plugins/" . $_SESSION['toolkits_language']))
{
    $plugin_path = $xwd_path . "wizards/plugins/" . $_SESSION['toolkits_language'];
}
else if (file_exists($xwd_path . "wizards/plugins/en-Gb"))
{
    $plugin_path = $xwd_path . "wizards/plugins/en-GB";
}

if ($plugin_path != "")
{
    require_once ("../../../../../website_code/php/mergexml.php");
    $merged = new MergeXML();
    $merged->addFile($xwd_file_path);
    $plugin_files = scandir($plugin_path);
    foreach ($plugin_files as $plugin_file)
    {
        if (substr($plugin_file, -4) == ".xwd")
        {
            // Merge the custom file into the main file.
            $merged->addFile($plugin_path . "/" . $plugin_file);
        }
    }
    echo $merged->get(1);

}
else
{
    echo file_get_contents($xwd_file_path);
}


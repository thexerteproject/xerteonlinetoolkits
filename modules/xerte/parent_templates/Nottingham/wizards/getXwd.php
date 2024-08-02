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

function evaluateConditionExpression($ctree)
{
    switch ($ctree['type']) {
        case "Literal":
            return $ctree['value'];
        case "LogicalExpression":
            if ($ctree['operator'] == "&&") {
                return evaluateConditionExpression($ctree['left']) && evaluateConditionExpression($ctree['right']);
            } else {
                return evaluateConditionExpression($ctree['left']) || evaluateConditionExpression($ctree['right']);
            }
        case "BinaryExpression":
            switch ($ctree['operator']) {
                case "==":
                    return evaluateConditionExpression($ctree['left']) == evaluateConditionExpression($ctree['right']);
                case "!=":
                    return evaluateConditionExpression($ctree['left']) != evaluateConditionExpression($ctree['right']);
                case "<":
                    return evaluateConditionExpression($ctree['left']) < evaluateConditionExpression($ctree['right']);
                case "<=":
                    return evaluateConditionExpression($ctree['left']) <= evaluateConditionExpression($ctree['right']);
                case ">":
                    return evaluateConditionExpression($ctree['left']) > evaluateConditionExpression($ctree['right']);
                case ">=":
                    return evaluateConditionExpression($ctree['left']) >= evaluateConditionExpression($ctree['right']);
                default:
                    return null;
            }
        case "MemberExpression":
            break;
        case "Identifier":
            if (isset($_REQUEST[$ctree['name']])) {
                return $_REQUEST[$ctree['name']];
            } else if (isset($_SESSION[$ctree['name']])) {
                return $_SESSION[$ctree['name']];
            } else {
                try {
                    $value = eval($ctree['name']);
                    return $value;
                }
                catch (Exception $e){};
                return null;
            }
            break;
        default:
            // Unexpected node parsed
            return null;
    }
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
else if (file_exists($xwd_path . "wizards/plugins/en-GB"))
{
    $plugin_path = $xwd_path . "wizards/plugins/en-GB";
}

if ($plugin_path != "")
{
    require_once (__DIR__ . "/../../../../../website_code/php/mergexml.php");
    $merged = new MergeXML();
    $merged->addFile($xwd_file_path);
    $plugin_files = scandir($plugin_path);
    foreach ($plugin_files as $plugin_file)
    {
        if (substr($plugin_file, -4) == ".xwd")
        {
            // Check condition for this file, currently only theme
            $xml = simplexml_load_file($plugin_path . "/" . $plugin_file);
            $condition = (string)$xml['cond'];
            _debug("Condition: " . $condition);
            if ($condition != null && $condition != "")
            {
                require_once (__DIR__ . "/../../../../../website_code/php/phpep/PHPEP.php");
                $phpep = new PHPEP($condition);
                $ctree = $phpep->exec();
                $result = evaluateConditionExpression($ctree);
                _debug("Result of evalutaion of condition: " . ($result === true ? 'true' : ($result === false ? 'false' : $result)));
                if ($result !== true)
                {
                    continue;
                }
            }
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


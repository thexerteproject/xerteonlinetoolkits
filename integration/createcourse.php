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

/**
 * Created by PhpStorm.
 * User: tom
 * Date: 10-10-2015
 * Time: 12:58
 */

require_once(dirname(__FILE__) . "/../config.php");
require_once(dirname(__FILE__) . "/integration.class.php");

// Read in CSV file
$csv = file("data.csv");

$data = array();

$i=0;
foreach($csv as $line)
{
    if ($i!=0)  // skip first line
    {
        $data[] = explode(",", $line);
    }
    $i++;
}

// Collect teachers, i.e.  role1(column 8)=4
$teachers = array();

foreach ($data as $line)
{
    if ($line[8] == '4')
    {
        $teachers[] = $line;
    }
}

// Collect groups, i.e. set of unique group1 column 9
$groups = array();

foreach ($data as $line)
{
    if ($line[9] != "")
    {
        if (array_search($line[9], $groups) === false)
        {
            $groups[] = $line[9];
        }
    }
}
sort($groups);

?>

<!DOCTYPE html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf" />
    <title>Create group</title>
    <meta name="generator" content="Amaya, see http://www.w3.org/Amaya/" />
    <style>
        .label {
            width: 120px;
            float: left;
        }
    </style>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <link href="../website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet"/>

    <script>
        doCreate = function()
        {
            $.ajax(
                {
                    method: "POST",
                    url: "docreate.php",
                    data: { teacher: $("#teacher").val(),
                        group: $("#group").val(),
                        template: $("#template").val()}
                })
                .done(function( msg ) {
                    $("#result").html(msg);
                });
        }
    </script>
</head>

<body>

<form action="">
    <p>Create a group of students.</p>

    <p>Please indicate the template to use as a master and the group from the csv
        file.</p>

    <p><div class="label">
        <label for="teacher">Teacher name</label></div>
        <select name="teacher" id="teacher" >
            <?php
            foreach($teachers as $teacher)
            {
                echo "<option value=\"" . $teacher[0] . "\">" . $teacher[0]. " - " . $teacher[2] . " " . $teacher[3] . "</option>\n";
            }
            ?>
        </select>
    </p>
    <p><div class="label">
        <label for="group">Group name</label></div>
        <select name="group" id="group">
            <?php
            foreach($groups as $group)
            {
                echo "<option value=\"" . $group . "\">" . $group . "</option>\n";
            }
            ?>
        </select>
    </p>
    <p><div class="label"><label for="template">Template id</label></div><input name="template" type="text" id="template" /></p>

    <input name="Create" type="button" onClick="doCreate();" value="Create">

</form>

<div id="result"></div>

</body>
</html>


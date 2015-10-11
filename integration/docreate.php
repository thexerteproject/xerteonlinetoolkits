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
$teacher_usernames = array();

foreach ($data as $line)
{
    if ($line[8] == '4')
    {
        $teachers[] = $line;
        $teacher_usernames[] = $line[0];
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
    sort($groups);
}

if (!empty($_POST['teacher']) && !empty($_POST['group']) && !empty($_POST['template'])) {
    $teacher = array_search($_POST['teacher'], $teacher_usernames);
    if ($teacher === false)
    {
        echo "Invalid teacher " .  $_POST['teacher'];
        exit;
    }
    $group = array_search($_POST['group'], $groups);
    if ($group === false)
    {
        echo "Invalid group " .  $_POST['group'];
        exit;
    }

    $i = new Integrate();
    $i->setTeacher($teachers[$teacher][0], $teachers[$teacher][2], $teachers[$teacher][3]);
    if ($i->getStatus() === false)
    {
        echo $i->getMesgHTML();
        exit;
    }
    $i->setGroupFolder($groups[$group]);
    if ($i->getStatus() === false)
    {
        echo $i->getMesgHTML();
        exit;
    }

    $i->setOriginalTemplateId($_POST['template']);
    if ($i->getStatus() === false)
    {
        echo $i->getMesgHTML();
        exit;
    }

    foreach($data as $line)
    {
        if ($line[8] == '5' and $line[9] == $groups[$group]) // student of this group
        {
            $i->addStudent($line[0], $line[2], $line[3]);
            if ($i->getStatus() === false)
            {
                echo $i->getMesgHTML();
                exit;
            }
        }
    }
    echo $i->getMesgHTML();
    exit;

}
echo "Empty teacher, group or template";


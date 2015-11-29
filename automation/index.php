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
require_once(dirname(__FILE__) . "/automation.class.php");
$auto = new Automate();

$courses = $auto->allowedCourses();
$templates = $auto->availableTemplates();

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
    <script src="js/automation.js"></script>
    <link href="../website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet"/>
    <link href="automation.css" media="screen" type="text/css" rel="stylesheet"/>

    <script>
        var courses=<?php echo json_encode($courses);?>

            $(document).ready(function () {
                updateGroupList();
            });
    </script>
</head>

<body>


<form action="">
    <h2>Duplicate and share projects with groups of students.</h2>

    <p>Please carefully select the template to use as a master and the group to share with.</p>
    <p><div class="label">
        <label for="teacher">Teacher:</label>
    </div>
    <input type="text" value="<?php echo $auto->getTeacherUserName() . " - " . $auto->getTeacherName();?>",  readonly>
    </p>
    <p><div id="courseDiv" class="label">
        <label for="group">Course:</label>
    </div>
    <select name="course" id="course" onchange="updateGroupList">
        <?php
        foreach($courses as $course)
        {
            echo "<option value=\"" . $course['courseid'] . "\">" . $course['coursename'] . "</option>\n";
        }
        ?>
    </select>
    </p>
    <p><div class="label">
        <label for="group">Group:</label></div>
        <div id="groupDiv">
        <select name="group" id="group">
            <?php
            foreach($groups as $group)
            {
                echo "<option value=\"" . $group . "\">" . $group . "</option>\n";
            }
            ?>
        </select>
        </div>
    </p>
<!--    <p><div class="label"><label for="template">Template id</label></div><input name="template" type="text" id="template" /></p>-->
    
    <p><div class="label">
            <label for="template">Template:</label>
        </div>
        <select name="template" id="template">
            <?php
            foreach($templates as $template)
            {
                echo "<option value=\"" . $template['id'] . "\">" . $template['id'] . " - " . $template['name'] . "</option>\n";
            }
            ?>
        </select>
    </p>

    <p><div class="label"><label for="template">Readonly</label></div><input name="readonly" type="checkbox" id="readonly" /></p>
    <input name="Share" type="button" onClick="doShare();" value="Share now" id="shareButton">
    <input name="UnShare" type="button" onClick="doUnshare();" value="Unshare now" id="unShareButton">

</form>

<div id="result"></div>

</body>
</html>


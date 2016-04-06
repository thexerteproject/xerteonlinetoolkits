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
require_once(dirname(__FILE__) . "/../functions.php");

_load_language_file("/automation/index.inc");

$auto = new Automate();

$courses = $auto->allowedCourses();
$templates = $auto->availableTemplates();

?><!DOCTYPE html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf" />
    <title>Create group</title>
    <meta name="generator" content="Amaya, see http://www.w3.org/Amaya/" />
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

<?php
if (count($courses) > 0) {
    ?>
    <form action="">
        <?php echo AUTOMATION_INTRO; ?>
        <p>
        <div class="label">
            <label for="teacher"><?php echo AUTOMATION_LABEL_TEACHER ?></label>
        </div>
        <input type="text" value="<?php echo $auto->getTeacherUserName() . " - " . $auto->getTeacherName(); ?>" ,
               readonly>
        </p>
        <p>
        <div id="courseDiv" class="label">
            <label for="group"><?php echo AUTOMATION_LABEL_COURSE; ?></label>
        </div>
        <select name="course" id="course" onchange="updateGroupList();">
            <?php
            foreach ($courses as $course) {
                echo "<option value=\"" . $course['courseid'] . "\">" . $course['coursename'] . "</option>\n";
            }
            ?>
        </select>
        </p>
        <p>
        <div class="label">
            <label for="group"><?php echo AUTOMATION_LABEL_GROUP; ?></label></div>
        <div id="groupDiv">
            <select name="group" id="group" onchange="clearResult();">
                <?php
                foreach ($groups as $group) {
                    echo "<option value=\"" . $group . "\">" . $group . "</option>\n";
                }
                ?>
            </select>
        </div>
        </p>

        <p>
        <div class="label">
            <label for="template"><?php echo AUTOMATION_LABEL_TEMPLATE; ?></label>
        </div>
        <select name="template" id="template" onchange="clearResult();">
            <?php
            foreach ($templates as $template) {
                echo "<option value=\"" . $template['id'] . "\">" . $template['id'] . " - " . $template['name'] . "</option>\n";
            }
            ?>
        </select>
        </p>

        <p>
        <div class="label"><label for="readonly"><?php echo AUTOMATION_LABEL_READONLY; ?></label></div>
        <input name="readonly" type="checkbox" id="readonly"/></p>
        <p>
        <div class="label"><label for="unshare_teachers"><?php echo AUTOMATION_LABEL_UNSHARE_TEACHERS; ?></label></div>
        <input name="unshare_teachers" type="checkbox" id="unshare_teachers"/></p>
        <p>
        <div class="practicelabel"><label for="practice"><?php echo AUTOMATION_LABEL_PRACTICE; ?></label></div>
        <input name="practice" type="checkbox" id="practice" onchange="changePractice();"/>
        <label for="attempt"><?php echo AUTOMATION_LABEL_ATTEMPT; ?></label><input name="attempt" id="attempt"
                                                                                   type="text" value="1" disabled> </p>
        <br>
		<input name="Share" type="button" onClick="doShare();" value="<?php echo AUTOMATION_BUTTON_SHARE; ?>"
               id="shareButton">
        <input name="UnShare" type="button" onClick="doUnshare();" value="<?php echo AUTOMATION_BUTTON_UNSHARE; ?>"
               id="unShareButton">


    </form>
    <p>
    <div id="result"></div>
    </p>
<?php
}
else
{
?>
    <div>
        <?php echo AUTOMATION_ACCESS_DENIED_OR_NO_COURSES;?>
    </div>
<?php
}
?>
<br>
<form class="backtoworkspace" action="../index.php" method="POST">
    <input name="Go to workspace" type="submit" value="<?php echo AUTOMATION_BUTTON_GOTO_WORKSPACE;?>" id="workspace">
</form>
</body>
</html>


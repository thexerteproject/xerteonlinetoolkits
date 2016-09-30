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

_load_language_file("/automation/ownership.inc");

$auto = new Automate();

$courses = $auto->allowedCourses(true);
$templates = $auto->availableTemplates();

?><!DOCTYPE html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf" />
    <title>Change ownership</title>
    <meta name="generator" content="Amaya, see http://www.w3.org/Amaya/" />
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script src="js/ownership.js"></script>
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
        <?php echo AUTOMATION_OWNERSHIP_INTRO; ?>
        <p>
        <div class="label">
            <label for="teacher"><?php echo AUTOMATION_LABEL_TEACHER ?></label>
        </div>
        <input id="teacher" type="text" value="<?php echo $auto->getTeacherUserName() . " - " . $auto->getTeacherName(); ?>" ,
               readonly>
        </p>
        <p>
        <div id="courseDiv" class="label">
            <label for="group"><?php echo AUTOMATION_LABEL_COURSE; ?></label>
        </div>
        <select name="course" id="course" onchange="updateGroupList(true);">
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
            <select name="group" id="group" onchange="changeSelection(true);">
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
        <select name="template" id="template" onchange="changeSelection(true);">
            <?php
            foreach ($templates as $template) {
                echo "<option value=\"" . $template['id'] . "\">" . $template['id'] . " - " . $template['name'] . "</option>\n";
            }
            ?>
        </select>
        </p>

        <p>
        <div class="label">
            <label for="shared_templatefolders"><?php echo AUTOMATION_LABEL_SHARED_TEMPLATES; ?></label>
        </div>
        <select class="folder_list" size="8" name="shared_templatefolders[]" id="shared_templatefolders">
            <?php
            //foreach ($shared_templates as $shared_template) {
            //    echo "<option value=\"" . $shared_template['id'] . "\">" . $shared_template['teacher_name'] . ' - ' . $shared_template['id'] . " - " . $shared_template['name'] . "</option>\n";
            //}
            ?>

        </select>
        </p>

        <p>
        <div class="label">
            <label for="new_owner"><?php echo AUTOMATION_LABEL_NEW_OWNER; ?></label>
        </div>
        <select name="new_owner" id="new_owner" >
            <?php
            //foreach ($teachers as $teacher) {
            //    echo "<option value=\"" . $teacher['id'] . "\">" . $teacher['id'] . " - " . $teacher['name'] . "</option>\n";
            //}
            ?>
        </select>
        </p>
        <p>
        <input name="change_owner" type="button" onClick="doChangeOwner();" id="change_owner" value="<?php echo AUTOMATION_BUTTON_CHANGE_OWNER; ?>"></p>

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
<form class="tosharing" action="index.php" method="POST">
    <input name="Back to sharing" type="submit" value="<?php echo AUTOMATION_BUTTON_GOTO_SHARING;?>" id="sharing">
</form>
<br>
<form class="backtoworkspace" action="../index.php" method="POST">
    <input name="Go to workspace" type="submit" value="<?php echo AUTOMATION_BUTTON_GOTO_WORKSPACE;?>" id="workspace">
</form>
</body>
</html>


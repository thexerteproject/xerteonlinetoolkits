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
$groups = $auto->allowedGroups();
$templates = $auto->availableTemplates();


if (!empty($_POST['action']) && !empty($_POST['group']) && !empty($_POST['template']) && !empty($_POST['readonly'])) {
    $action = $_POST['action'];
    $group = $_POST['group'];
    $template_id = $_POST['template'];
    $readonly = $_POST['readonly'];

    $auto->setOriginalTemplateId($template_id);
    if ($auto->getStatus() === false)
    {
        echo $auto->getMesgHTML();
        exit;
    }

    $auto->setGroupFolder($groups[$group]['name']);
    if ($auto->getStatus() === false)
    {
        echo $auto->getMesgHTML();
        exit;
    }

    // TODO
    // Get all the people in a group
    $persons = $auto->getGroupMembersAndRoles($group);
    $role = 'editor';
    if ($readonly == "true")
    {
        $role = 'read-only';
    }
    // First get list of persons with teacherAccessRole and build a list of teachers that need read-only access
    $teachers = array();
    foreach ($persons as $person)
    {
        if ($person['username'] != $auto->getOwnerUsername()) {
            if ($auto->isGroupTeacherAccessRole($person['roleid'])) {
                $teachers[] = $person;
            }
        }
    }
    $nrpersons = 0;
    foreach($persons as $person) {
        if ($person['username'] != $auto->getOwnerUsername()) {
            if ($action == "Share") {
                if ($auto->isGroupStudentAccessRole($person['roleid'])) {
                    if ($auto->addAccessToLO($person['username'], $person['firstname'], $person['lastname'], $role, $teachers) === false) {
                        echo $auto->getMesgHTML();
                        exit;
                    }
                    $nrpersons++;
                }
            } else {
                if ($auto->isGroupStudentAccessRole($person['roleid'])) {
                    if ($auto->removeAccessFromLO($person['username'], $person['firstname'], $person['lastname'], $template_id) === false) {
                        echo $auto->getMesgHTML();
                        exit;
                    }
                    $nrpersons++;
                }
            }
        }
    }

    $auto->recordSharing($action,  $template_id, $group, $readonly, $auto->getMesg());
    if ($auto->getStatus() === false)
    {
        echo $auto->getMesgHTML();
        exit;
    }

    echo "<br>";
    echo "Action is successfully completed for " . $nrpersons . " students.";
    exit;

}
echo "Empty action, group, template or readonly parameter";


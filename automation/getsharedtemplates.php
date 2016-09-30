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

_load_language_file("/automation/getsharedtemplates.inc");

$auto = new Automate();

$courses = $auto->allowedCourses();
$groups = $auto->allowedGroups();
$templates = $auto->availableTemplates();

$prefix = $xerte_toolkits_site->database_table_prefix;

if ( !empty($_POST['group']) && !empty($_POST['course']) && !empty($_POST['template'])) {
    $group = $_POST['group'];
    $course = $_POST['course'];
    $template_id = $_POST['template'];

    $response = new stdClass();
    $response->status = false;

    $auto->setOriginalTemplateId($template_id);
    if ($auto->getStatus() === false)
    {
        echo $auto->getMesgHTML();
        $auto->recordSharing($action,  $template_id, $group, $readonly, $unshare_teachers, $practice, $attempt, $auto->getMesg());
        echo json_encode($response);
        exit;
    }

    // Get all the shared folders for this group
    $shared_templatefolders = $auto->getSharedTemplatesFolders($groups[$group]['name']);
    if ($auto->getStatus() === false)
    {
        echo $auto->getMesgHTML();
        $auto->recordSharing($action,  $template_id, $group, $readonly, $unshare_teachers, $practice, $attempt, $auto->getMesg());
        echo json_encode($response);
        exit;
    }

    // Get all the shared templates for this group
    //$shared_templates = $auto->getSharedTemplates($groups[$group]['name']);
    //if ($auto->getStatus() === false)
    //{
    //    echo $auto->getMesgHTML();
    //    $auto->recordSharing($action,  $template_id, $group, $readonly, $unshare_teachers, $practice, $attempt, $auto->getMesg());
    //    echo json_encode($response);
    //    exit;
    //}

    // Get all the people in a group
    $persons = $auto->getGroupMembersAndRoles($course, $group);
    $role = 'editor';

    // Get list of persons with teacherAccessRole and build a list of teachers that need read-only access
    $teachers = array();
    foreach ($persons as $person)
    {
        if ($auto->isGroupTeacherAccessRole($person['roleid'])) {
            $teachers[] = $person;
        }
    }

    $response->status = true;
    $response->teachers = $teachers;
    $response->shared_templatefolders = $shared_templatefolders;

    echo json_encode($response);

    exit;
}

echo AUTOMATION_DO_SHARE_FAILED;


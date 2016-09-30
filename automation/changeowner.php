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

_load_language_file("/automation/changeowner.inc");


$auto = new Automate();

$courses = $auto->allowedCourses();
$groups = $auto->allowedGroups();
$templates = $auto->availableTemplates();


if (!empty($_POST['group']) && !empty($_POST['course']) && !empty($_POST['orgtemplate']) && !empty($_POST['templatefolders']) && !empty($_POST['newowner'])) {
    $group = $_POST['group'];
    $course = $_POST['course'];
    $orgtemplate_id = $_POST['orgtemplate'];
    // templatefolders is single select now, and it used to be multiple select
    // In stead of changing the code, create an array with 1 item
    $templatefolders = array($_POST['templatefolders']);
    $newowner_username = $_POST['newowner'];

    $auto->setOriginalTemplateId($orgtemplate_id);


    foreach($templatefolders as $folder_id) {

        $auto->changeOwnerOfGroup($folder_id, $newowner_username, $course, $group);
        if ($auto->getStatus() === false)
        {
            echo $auto->getMesgHTML();

            $auto->recordSharing('ChangeOwner',  $orgtemplate_id, $group, "false", "false", "false", 0, $auto->getMesg());
            exit;
        }
        $auto->recordSharing('ChangeOwner',  $orgtemplate_id, $group, "false", "false", "false", 0, $auto->getMesg());
    }

    echo "<br>";
    echo $auto->getMesgHTML();
    exit;
}

echo AUTOMATION_DO_CHANGEOWNER_FAILED;


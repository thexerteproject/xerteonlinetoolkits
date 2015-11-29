<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 24-11-2015
 * Time: 19:59
 */

global $automation_config;

class automationConfig
{
    public $groupMemberSharingRole =  [12, 5];  // non-editing teacher
    public $groupMemberTeacherAccessRole = [12, 5];
    public $groupMemberStudentAccessRole = [4];
    public $sharingRole = [1]; // course leader
    public $teacherAccessRole = [];
    public $studentAcessRole = [];
    public $availableTemplates = []; // template_ids of available project templates
    public $moodleServer = "localhost";
    public $moodleDB = "moodle";
    public $moodleDBUser = "";
    public $moodleDBPassword = '';
};

$automation_config = new automationConfig();
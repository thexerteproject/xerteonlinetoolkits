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
    public $groupMemberSharingRole =  [];               // group members allowed to share LO's
    public $groupMemberTeacherAccessRole = [];          // group members that should get read-only access (teacher access)
    public $groupMemberStudentAccessRole = [];          // group members that should get full access (student access)
    public $sharingRole = [];                           // non-group members allowed to share LO's (doesn't do anything yet)
    public $teacherAccessRole = [];                     // group members that should get read-only access (teacher access) when shared by non-group members
    public $studentAcessRole = [];                      // group members that should get full access (student access) when shared by non-group members
    public $availableTemplates = [];                    // template_ids of available project templates
    public $moodleServer = "localhost";
    public $moodleDB = "moodle";
    public $moodleDBUser = "";
    public $moodleDBPassword = '';
};

$automation_config = new automationConfig();
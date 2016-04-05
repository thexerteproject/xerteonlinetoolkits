<?PHP

/**
 *
 * automation/index page template language file
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Pat Lockley
 * @package
 */

define("AUTOMATION_FOLDERPERMS_FAILED", "Failed to set permissions on folder: Failed to set correct rights on ");

define("AUTOMATION_FOLDER_CREATE_FAILED", "Failed to create folder: Failed to create folder ");

define("AUTOMATION_COPY_PERMS_FAILED", "Failed to copy file: Failed to set rights on file ");

define("AUTOMATION_COPY_FAILED", "Failed to copy file ");

define("AUTOMATION_DUPLICATE_MESG", " - Copy template contents\n");

define("AUTOMATION_DUPLICATE_USER_NOT_FOUND", "Cannot find user of template ");

define("AUTOMATION_DUPLCATE_CREATE_FOLDER_PERMS_FAILED", "Failed to create parent folder for template: Failed to set rights on parent folder ");

define("AUTOMATION_DUPLICATE_CREATE_FOLDER_FAILED", "Failed to create parent folder for template: Failed to create parent folder ");

define("AUTOMATION_CHECK_USER_MESG1", "Check login ");

define("AUTOMATION_CHECK_USER_MESG2", "   - Check if user %s exists.\n");

define("AUTOMATION_CREATE_USER_LOGIN", "   - Create user login for ");

define("AUTOMATION_CREATE_USER_LOGIN_RECYCLEBIN_FAILED", "   - Failed to create recyclebin for user ");

define("AUTOMATION_CREATE_USER_LOGIN_ROOTFOLDER_FAILED", "   - Cannot find/create root folder for user ");

define("AUTMATION_CHECK_ROOTFOLDER_MESG", "   - Check root folder for user ");

define("AUTOMATION_CHECK_ROOTFOLDER_CREATE_MESG", "   - Create root folder for user ");

define("AUTOMATION_CHECK_OWNERFOLDER_MESG", "Folder %f exists: owner=");

define("AUTOMATION_CHECK_OWNERFOLDER_INCONISTENT", "Inconsistent data detected! Aborting!\n");

define("AUTOMATION_CHECK_OWNERFOLDER_QUERY_FAILED", "Failed to query group folder, Aborting!\n");

define("AUTOMATION_CHECK_OWNERFOLDER_CREATE", "Created new group folder '%f' for template ");

define("AUTOMATION_CHECK_OWNERFOLDER_CREATE_RECORD_FAILED", "Failed to create auto_template_group_folders record, Aborting!\n");

define("AUTOMATION_CHECK_OWNERFOLDER_CREATE_FAILED", "Failed to create group folder, Aborting!\n");

define("AUTOMATION_CHECK_OWNERFOLDER_CREATE_RECORD_MESG", "Created new auto_template_group_folders record for group '%f' and template ");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_QUERY_FAILED", "Error querying auto_copied_templates table.\n");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_EXISTS", "This template (%t) is already copied to %l. Skip!\n");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_SHARED_WRONG_FOLDER", "This template (%t) was shared before, but is now in a different folder (or recyclebin). Share new copy.\n");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_SHARED_DELETED", "This teplate (%t) was shared before, but has been deleted. Share new copy.\n");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_GETID_FAILED", "Failed to get the maximum template number.\n");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_RECORD_CREATED", " - Created new template record for the database.\n");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_CREATE_REGISTRATIONRECORD_FAILED", "Failed to insert registration into copied_template.\n");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_DUPLICATION_FAILED", "Failed to duplicate contents to new template.\n");

define("AUTOMATION_COPY_TEMPLATE_TO_USER_CREATE_RECORD_FAILED", "Failed to create new template record for the database.\n");

define("AUTOMATION_PRACTICE_PREFIX", "Practice: ");

define("AUTOMATION_ATTEMPT_PREFIX", "Attempt ");

define("AUTOMATION_NOT_LOGGED_IN", "You're not logged in to Xerte Online Toolkits");

define("AUTOMATION_CREATE_TABLE_AUTO_COPIED_TEMPLATES_FAILED", "Failed to create auto_copied_templates table!");

define("AUTOMATION_CREATE_TABLE_AUTO_SHARING_LOG_FAILED", "Failed to create auto_sharing_log table!");

define("AUTOMATION_CERATE_TABLE_TEMPATE_GROUP_FOLDERS_FAILED", "Failed to create auto_template_group_folders table!");

define("AUTOMATION_SET_ORGINAL_TEMPLATE_MESG", "Set original template to ");

define("AUTOMATION_SET_READONLY_MESG", "Set readonly flag to ");

define("AUTOMATION_SET_UNSHARE_TEACHER_MESG", "Set unshare teacher flag to ");

define("AUTOMATION_SET_PRACTICE_MESG", "Set practice flag to ");

define("AUTOMATION_SET_ATTEMPT_MESG", "Set attempt to ");

define("AUTOMATION_LOG_SHARING_FAILED", "Falied to log sharing attempt");

define("AUTOMATION_GET_GROUPMEMBERS_FAILED", "Failed to get members of group ");

define("AUTOMATION_ADD_ACCESS_TO_MESG", "Add access to %n (%r)\n");

define("AUTOMATION_ADD_ACCESS_TO_PLACE_IN_TEACHER_FOLDER", " - Place template in teachers folder.\n");

define("AUTOMATION_ADD_ACCESS_TO_LO_SHARE_MESG", " - Share template with student.\n");

define("AUTOMATION_ADD_ACCESS_TO_LO_TEACHER_MESG", " - Share template with teacher (%t).\n");

define("AUTOMATION_ADD_ACCESS_TO_LO_TEACHER_FAILED", "Failed to share template with teacher ");

define("AUTOMATION_ADD_ACCESS_TO_LO_CREATE_TEACHER_GROUPFOLDER_FAILED", "Failed to create group folder for teacher\n");

define("AUTOMATION_ADD_ACCESS_TO_LO_CHECK_TEACHER_LOGIN_FAILED", "Failed to create/find teacher login for ");

define("AUTOMATION_ADD_ACCESS_TO_LO_STUDENT_FAILED", "Failed to share template with student\n");

define("AUTOMATION_ADD_ACCESS_TO_LO_CREATE_STUDENT_GROUPFOLDER_FAILED", "Failed to create group folder for student\n");

define("AUTOMATION_ADD_ACCESS_TO_LO_COPY_TO_OWNER_GROUPFOLDER_FAILED", "Failed to copy template to owner folder\n");

define("AUTOMATION_ADD_ACCESS_TO_LO_CHECK_LOGIN_FAILED", "Failed to create/find login for ");

define("AUTOMATION_UNSHARE_MESG", "Remove access for ");

define("AUTOMATION_UNSHARE_TEACHER_MESG", "Remove access for teacher ");

define("AUTOMATION_UNSHARE_MESG2", " - Unshare template\n");

define("AUTOMATION_UNSHARE_FAILED_MESG", "Failed to remove access!\n");

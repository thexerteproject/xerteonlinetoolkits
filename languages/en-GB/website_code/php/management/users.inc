<?PHP     

	/**
	 * 
	 * management users english language file
	 *
	 * @author Patrick Lockley
	 * @version 1.0
	 * @copyright Pat Lockley
	 * @package
	 */
	 

	define("USERS_TOGGLE", "Show");



    define("USERS_SHOW_ACTIVE", "Show active users");
    define("USERS_SHOW_INACTIVE", "Show inactive users");
    define("USERS_SHOW_ALL", "Show all users");
    define("USERS_DISABLE_SELECTED", "Disable selected users");
    define("USERS_ENABLE_SELECTED", "Enable selected users");

    define("USERS_UPDATE_ACTIVE", "Update user active status");
    define("USERS_UPDATE_ACTIVE_SUCCESS", "Update succeeded");
    define("USERS_UPDATE_ACTIVE_FAILED", "Update failed");
    define("USERS_RETRIEVE_USERS_LASTLOGIN_SUCCESS", "Do you want to disable the {0} users who have not logged in since the specified date?");
    define("USERS_DISABLE_USERS_LASTLOGIN_SUCCESS", "{0} users who have not logged in since the specified date have been disabled");

	define("USERS_ID", "The user's ID is ");

	define("USERS_FIRST", "The user's first name is ");

	define("USERS_KNOWN", "The user's surname is ");
	
	define("USERS_USERNAME", "The user's username is");

    define("USER_DISABLED", "Disabled");

    define("USERS_MANAGE_AUTH", "Manage Db auth users");

    define("USERS_MANAGE_USERS", "Manage users");
    define("USERS_MANAGE_ACTIVE", "Active users");
    define("USERS_MANAGE_INACTIVE", "Inactive users");
    define("USERS_MANAGE_ALL", "All users");

	define("USERS_ROLES_SUCCESS", "Success");
	
	define("USERS_FAILED_REMOVE_ROLES", "Failed to remove roles");
	
	define("USERS_FAILED_ADD_ROLES", "Failed to add roles");
	
	define("USERS_MODIFY_ROLES", "Modify user roles");

    define("USERS_MANAGE_ROLES_SELECT_USER", "Select a user to modify their roles");

    define("USERS_MANAGE_SELECT_USER", "Select a user to view their details");

    define("USERS_MANAGE_ROLES", "Manage user roles");
    define("USERS_SHOW_ROLES", "Show user roles");
    define("USERS_MANAGE_ROLES_ASSIGN_ROLES", "Assign and edit user roles");
    define("USERS_MANAGE_ROLES_OVERVIEW", "Currently assigned roles");
    define("USERS_MANAGE_ROLES_OVERVIEW_USERNAME", "User");
    define("USERS_MANAGE_ROLES_OVERVIEW_ASSIGNED_ROLES", "Assigned roles");
    define("USERS_MANAGE_ROLES_OVERVIEW_SELECT_USER", "Select this user to modify their roles");
    define("USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN", "Disable users based on last login date");
    define("USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN_TEXT", "This will disable users who have not logged in since the specified date.");
    define("USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN_DATE", "Last login date:");
    define("USERS_MANAGE_DISABLE_USERS_BASED_ON_LASTLOGIN_BUTTON", "Disable users based on last login date");


//  admin roles human names -------------------------------------------
    define("USERS_ROLE_SUPER", "Super Admin");

    define("USERS_ROLE_SYSTEM", "System Admin");
    
    define("USERS_ROLE_TEMPLATEADMIN", "Template Admin");
    
    define("USERS_ROLE_METAADMIN", "Meta Admin");
    
    define("USERS_ROLE_USERADMIN", "User Admin");
    
    define("USERS_ROLE_PROJECTADMIN", "Project Admin");

    define("USERS_ROLE_HARVESTADMIN", "Harvest Admin");

    define("USERS_ROLE_AIUSER", "AI User");
//  admin roles info -------------------------------------------

    define("USERS_ROLE_SUPER_INFO", "This role gives access to the whole management page. It is the highest level of access.");

    define("USERS_ROLE_SYSTEM_INFO", "This role gives access to the Site, Log Files, Play security, Licenses and Feeds tabs in the management page.");
    
    define("USERS_ROLE_TEMPLATEADMIN_INFO", "This role gives access to the Templates and Themes tabs in the management page.");
    
    define("USERS_ROLE_METAADMIN_INFO", "This role gives access to the Categories, Educations, Groupings and Courses tabs in the management page.");
    
    define("USERS_ROLE_USERADMIN_INFO", "This role gives access to the Users and User Groups tabs in the management page.");
    
    define("USERS_ROLE_PROJECTADMIN_INFO", "This role gives access to the User Projects tab in the management page.");

    define("USERS_ROLE_HARVESTADMIN_INFO", "This role allows you to enable a project to be harvested using OAI-PMH (if configured).");

    define("USERS_ROLE_AIUSER_INFO", "This role allows you to use generative AI to create content (if configured).");


<?PHP

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

	define("USERS_MANAGEMENT_TEMPLATE_VIEW", "Show");

	define("USERS_MANAGEMENT_TEMPLATE_SEARCH", "Search");

	define("USERS_MANAGEMENT_TEMPLATE_TRANSFER", "View transfer ownership options");

	define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_EXPLANATION", "<p>Here you can transfer all (non private) projects owned by the selected user to the new owner selected below. The projects will be placed in a new folder in the workspace of the new owner. Sharing settings will not change. The new folder will be called '{user}'. This folder will also contain sub-folders if the transferred projects were in sub-folders in the original owner's workspace.</p><p>If the user's private projects are included in the transfer and their access to other user's projects are removed, as specified with the checkboxes below, the user's Xerte account will also be removed and the user will not appear on the list of users with whom projects can be shared. Note: depending on the the authentication method in use, the user may still be able to login again.</p>");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_PRIVATE", "Include private projects in the transfer.");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_SHARED_FOLDERS", "Include shared folders in the transfer.");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_DELETEUSER", "Remove user's access from projects that are owned by other users. Also delete the user account if private projects and shared folders are transferred as well.");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_BUTTON", "Do bulk transfer");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_CLOSE_PANEL", "Clear Report");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACKLINE", "Placed template with id {template_id} ('{template_name}') in folder '{folder}' of user {newuser} and renamed {oldfolder} to {newfolder}");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_DELETED", "Deleted template found in recyclebin of user {user} (folder {folder})");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_REMOVEDFROMRIGHTS", "User {user} has been removed from {count} templates.");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_REMOVEDFROMLOGINDETAILS", "User {user} has been removed from Xerte.");

    define("USERS_MANAGEMENT_TEMPLATE_TRANSFER_FEEDBACK_USERISNOTREMOVED", "Access of user {user} to other templates is not removed.");

	define("USERS_MANAGEMENT_TEMPLATE_ID", "The template id is");

	define("USERS_MANAGEMENT_TEMPLATE_CREATED", "The date created was"); 

	define("USERS_MANAGEMENT_TEMPLATE_MODIFIED", "The date modified was"); 

	define("USERS_MANAGEMENT_TEMPLATE_ACCESSED", "The date accessed was");

	define("USERS_MANAGEMENT_TEMPLATE_PLAYS", "The number of plays is"); 

	define("USERS_MANAGEMENT_TEMPLATE_ACCESS", "Access for this is set as"); 	

	define("USERS_MANAGEMENT_TEMPLATE_EDIT", "Edit");

    define("USERS_MANAGEMENT_TEMPLATE_PREVIEW", "Preview");

	define("USERS_MANAGEMENT_TEMPLATE_PROPERTIES", "Properties");				

	define("USERS_MANAGEMENT_TEMPLATE_GIVE", "Change the owner/creator of this project to the selected user:");

	define("USERS_MANAGEMENT_TEMPLATE_GIVE_BUTTON", "Change ownership");

	define("USERS_MANAGEMENT_TEMPLATE_NONE", "This user has no templates at present");

    define("USERS_MANAGEMENT_TEMPLATE_OWNER", "Owner");

    define("USERS_MANAGEMENT_TEMPLATE_ROLE", "Role");

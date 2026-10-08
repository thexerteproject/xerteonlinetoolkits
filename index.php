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

// Load the plugin files and fire a startup action
require_once(dirname(__FILE__) . "/plugins.php");

startup();

require_once(dirname(__FILE__) . "/config.php");
// Switch off elevated permissions
unset($_SESSION['elevated']);
unset($xerte_toolkits_site->rights);

_load_language_file("/index.inc");

/**
 *
 * Login page, self posts to become management page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */
include $xerte_toolkits_site->php_library_path . "display_library.php";


require_once(dirname(__FILE__) . "/website_code/php/login_library.php");

if ($xerte_toolkits_site->altauthentication != "" && (isset($_GET['altauth']) || (isset($_SESSION['altauth']) && $xerte_toolkits_site->altauthentication == $_SESSION['altauth'])))
{
    $xerte_toolkits_site->authentication_method = $xerte_toolkits_site->altauthentication;
    $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    $_SESSION['altauth'] = $xerte_toolkits_site->altauthentication;
}
$adminlogin = false;
if (isset($_GET['login']))
{
    if (x_clean_input($_GET['login']) == "admin")
    {
        if ($_SESSION['toolkits_logon_id'] !== 'site_administrator')
        {
            $adminlogin = true;
            $xerte_toolkits_site->authentication_method = "Db";
            $authmech = Xerte_Authentication_Factory::create('Db');
            unset($_SESSION['toolkits_logon_id']);
            unset($_SESSION['toolkits_logon_username']);
        }
    }
}
login_processing();
login_processing2();

if(isset($_SESSION["toManagement"]) || $_SESSION['toolkits_logon_id'] === 'site_administrator' || $adminlogin){
	unset($_SESSION["toManagement"]);
	header("location: management.php");
	exit();
}
if(isset($_SESSION["adminTo"]) || $_SESSION['toolkits_logon_id'] === 'site_administrator' || $adminlogin){
    $url = $_SESSION["adminTo"];
    unset($_SESSION["adminTo"]);
    header("location: {$url}");
    exit();
}

// Check if any redirection needs to take place for Password protected files...
if (isset($_SESSION['pwprotected_url']))
{
    _debug(" Redirection found: " . $_SESSION['pwprotected_url']);
    $redirect=$_SESSION['pwprotected_url'];
    unset($_SESSION['pwprotected_url']);
    header("Location: " . $redirect);
}


/*If the authentication method isn't set to Moodle
* the code in the required file below is simply skipped
*/
require_once(dirname(__FILE__) . "/moodle_restrictions.php");

recycle_bin();

$version = getVersion();

/*
 * Output the main page, including the user's and blank templates
 */
?><!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <?php head_start(); ?>
    <!--

    HTML to use to set up the template management page

    Version 1.0

    -->
    <title><?PHP echo apply_filters("head_title", $xerte_toolkits_site->site_title); ?></title>
    <link rel="stylesheet" href="editor/css/jquery-ui.css">
    <link rel="stylesheet" href="editor/js/vendor/themes/default/style.css?version=<?php echo $version;?>" />
    <!-- <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script> -->
    <!-- <script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script> -->
    <script src="editor/js/vendor/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/modernizr-latest.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jstree.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/plotly-latest.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/common/js/featherlight/featherlight.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/common/js/featherlight/featherlight.gallery.min.js?version=<?php echo $version;?>"></script>
    <link rel="icon" href="favicon.ico" type="image/x-icon"/>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
    <!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common/font-awesome/css/font-awesome.min.css?version=<?php echo $version;?>" -->
    <link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/v4-shims.min.css">
    <link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/v5-font-face.min.css">

    <link href="website_code/styles/bootstrap.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/nv.d3.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/xapi_dashboard.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/folder_popup.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/jquery-ui-layout.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/xerte_buttons.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/frontpage.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link rel="stylesheet" href="modules/common/js/featherlight/featherlight.min.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" href="modules/common/js/featherlight/featherlight.gallery.min.css?version=<?php echo $version;?>" />

    <?php
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
    {
        ?>
        <link href='branding/branding.css' rel='stylesheet' type='text/css'>
        <?php
    }
    if (isset($_SESSION['toolkits_language']))
    {
        $languagecodevar = "var language_code = \"" . $_SESSION['toolkits_language'] . "\"";
    }
    else
    {
        $languagecodevar = "var language_code = \"en-GB\"";
    }
    // Check if authmech exists, if not create it
    if (!isset($authmech)) {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    
    // Prepare user preferences for JavaScript (always reload from DB when supported)
    $user_preferences_json = "{}";
    $user_has_preferences = "false";

    if ($authmech->hasUserPreferences() && !empty($_SESSION['toolkits_logon_id']) && isset($_SESSION['toolkits_logon_username'])) {
        $user_has_preferences = "true";
        $pref_row = db_query_one(
            "SELECT preference FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE username = ?",
            array($_SESSION['toolkits_logon_username'])
        );
        if (!empty($pref_row) && isset($pref_row['preference']) && $pref_row['preference'] !== '') {
            $preferences = json_decode($pref_row['preference'], true);
            $_SESSION['toolkits_preferences'] = is_array($preferences) ? $preferences : array();
        } else {
            $_SESSION['toolkits_preferences'] = array();
        }
        $user_preferences_json = json_encode($_SESSION['toolkits_preferences']);
    } elseif (isset($_SESSION['toolkits_preferences']) && is_array($_SESSION['toolkits_preferences'])) {
        $user_preferences_json = json_encode($_SESSION['toolkits_preferences']);
    }
    
    echo "
        <script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS
            var site_url = \"{$xerte_toolkits_site->site_url}\";
            var rest_api_url = \"{$xerte_toolkits_site->site_url}website_code/api/v1/index.php\";
            var site_apache = \"{$xerte_toolkits_site->apache}\";
            var properties_ajax_php_path = \"website_code/php/properties/\";
            var management_ajax_php_path = \"website_code/php/management/\";
            var ajax_php_path = \"website_code/php/\";
            {$languagecodevar};
            var user_preferences = {$user_preferences_json};
            var user_has_preferences = {$user_has_preferences};
            var INDEX_CHANGE_PASSWORD = " . json_encode(INDEX_CHANGE_PASSWORD) . ";
            var INDEX_MY_PREFERENCES = " . json_encode(INDEX_MY_PREFERENCES) . ";
        </script>";
    ?>
    <script type="text/javascript" language="javascript" src="website_code/scripts/validation.js?version=<?php echo $version;?>"></script>
    <?php
    _include_javascript_file("website_code/scripts/file_system.js?version=" . $version);
    _include_javascript_file("website_code/scripts/screen_display.js?version=" . $version);
    _include_javascript_file("website_code/scripts/ajax_management.js?version=" . $version);
    _include_javascript_file("website_code/scripts/folders.js?version=" . $version);
    _include_javascript_file("website_code/scripts/template_management.js?version=" . $version);
    _include_javascript_file("website_code/scripts/logout.js?version=" . $version);
    _include_javascript_file("website_code/scripts/import.js?version=" . $version);
    _include_javascript_file("website_code/scripts/functions.js?version=" . $version);
    ?>
    <script type="text/javascript" src="website_code/scripts/tooltip.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/popper.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/bootstrap.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/xAPI/xapicollection.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/xAPI/xapidashboard.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/xAPI/xapiwrapper.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/moment.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/jquery-ui-i18n.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/result.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/user_settings.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/dashboard-graphs.main.js?version=<?php echo $version;?>"></script>

    <?php
    _include_javascript_file("website_code/scripts/xapi_dashboard_data.js?version=" . $version);
    _include_javascript_file("website_code/scripts/xapi_dashboard.js?version=" . $version);

    ?>
    <?php head_end(); ?></head>

<!--

code to sort out the javascript which prevents the text selection of the templates (allowing drag and drop to look nicer

body_scroll handles the calculation of the documents actual height in IE.

-->

<body >
<?php body_start(); ?>
<!--

Folder popup is the div that appears when creating a new folder

-->

<div class="folder_popup" id="message_box">
    <div class="main_area" id="dynamic_section">
        <p style="color:white"><?PHP echo INDEX_FOLDER_PROMPT; ?></p>

        <form id="foldernamepopup" action="javascript:create_folder()" method="post" enctype="text/plain">
			<label for="foldername" class="sr-only"><?php echo INDEX_FOLDER_NAME ?></label>
            <input type="text" width="200" id="foldername" name="foldername"
                   style="margin:0px; margin-right:5px; padding:3px"/>
            <button type="submit" class="xerte_button_c">
                <?php echo INDEX_BUTTON_NEWFOLDER_CREATE; ?>
            </button>
            <button type="button" class="xerte_button_c" style="margin-top:0.5em;"
                    onclick="javascript:popup_close()"><?php echo INDEX_BUTTON_CANCEL; ?>
            </button>
        </form>
        <p><span id="folder_feedback"></span></p>
    </div>
</div>

<div class="dashboard-wrapper" id="dashboard-wrapper">

    <div class="dashboard" id="dashboard">
        <div id="options-div">
            <div class="row dash-row">
                <div class="dash-col unanonymous-view" >
                    <label for="dp-unanonymous-view">
                        <?php echo INDEX_XAPI_DASHBOARD_SHOW_NAMES; ?>
                    </label>
                    <input type="checkbox" id="dp-unanonymous-view" >
                </div>

                <div class="dash-col">
                    <label for="dp-start">
                        <?php echo INDEX_XAPI_DASHBOARD_FROM; ?>
                    </label>
                    <input type="text" id="dp-start" value="2018/03/24 21:23" data-test="2018/03/24 21:23">
                </div>
                <div class="dash-col-1">
                    <label for="dp-end">
                        <?php echo INDEX_XAPI_DASHBOARD_UNTIL; ?>
                    </label>
                    <input type="text" id="dp-end">
                </div>
                <div class="dash-col-1">
                    <label for="group-select">
                        <?php echo INDEX_XAPI_DASHBOARD_GROUP_SELECT; ?>
                    </label>
                    <select type="text" id="group-select">
                        <option value="all-groups"><?php echo INDEX_XAPI_DASHBOARD_GROUP_ALL; ?></option>
                    </select>
                </div>
                <div class="close-button">
                    <button type="button" class="xerte_button_c_no_width"
                            onclick="javascript:close_dashboard()"><?php echo INDEX_XAPI_DASHBOARD_CLOSE; ?>
                    </button>
                </div>
                <div class="show-display-options-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_DISPLAY_OPTIONS; ?>
                    </button>
                </div>
                <div class="show-question-overview-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_QUESTION_OVERVIEW; ?>
                    </button>
                </div>
                <div class="dashboard-print-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_PRINT; ?>
                    </button>
                </div>
            </div>
        </div>
        <div id="dashboard-title"></div>
        <div class="jorneyData-container">
            <div id="journeyData" class="journeyData journey-container"></div>
        </div>
    </div>
</div>

<div class="ui-layout-north">
<header>
    <div class="content" id="mainHeader">

        <div class="topbar">
            <?php
            if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_right.png"))
            {
            ?>
                <div
                    style="width:50%; height:100%; float:right; position:relative; background-image:url(branding/logo_right.png); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                </div>
            <?php
            }
            else {
            ?>
                <div
                    style="width:50%; height:100%; float:right; position:relative; background-image:url(website_code/images/apereoLogo.png); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                </div>
            <?php
            }
            if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_left.png"))
            {
            ?>
                <img src="branding/logo_left.png" style="margin-left:10px; float:left" alt="<?php echo INDEX_LOGO_ALT; ?>"/>
            <?php
            }
            else {
            ?>
                <img src="website_code/images/logo.png" style="margin-left:10px; float:left" alt="<?php echo INDEX_LOGO_ALT; ?>"/>
            <?php
            }
            ?>
        </div>

        <div class="buttonbar">
            <div class="file_mgt_area_top">


            </div>

           <div class="userbar">
                <?php display_language_userbar(); ?>

                <div class="userbar-item userbar-user">
                    <div class="userbar-dropdown user-dropdown">
                        <button type="button" class="userbar-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                            <span class="userbar-dropdown-label"><?php echo htmlspecialchars($_SESSION['toolkits_firstname']); ?></span>
                            <i class="fa fa-chevron-down userbar-chevron" aria-hidden="true"></i>
                        </button>
                        <div class="userbar-dropdown-menu userbar-user-menu" id="user-menu" role="menu">
                            <ul class="userbar-dropdown-list" id="user-menu-items">
                                <?php if ($authmech->canManageUser($jsscript)) { ?>
                                <li role="none">
                                    <button type="button" role="menuitem" class="userbar-dropdown-item userbar-user-item" onclick="changepasswordPopup('details')">
                                        <i class="fa-solid fa-key userbar-user-item-icon" aria-hidden="true"></i>
                                        <span class="userbar-user-item-label"><?php echo INDEX_CHANGE_PASSWORD; ?></span>
                                    </button>
                                </li>
                                <?php } ?>
                                <li role="none">
                                    <button type="button" role="menuitem" class="userbar-dropdown-item userbar-user-item" onclick="changepasswordPopup('preferences')">
                                        <i class="fa-solid fa-sliders userbar-user-item-icon" aria-hidden="true"></i>
                                        <span class="userbar-user-item-label"><?php echo INDEX_MY_PREFERENCES; ?></span>
                                    </button>
                                </li>
                                <?php if (userHasAdminRights()) { ?>
                                <li role="none">
                                    <button type="button" role="menuitem" class="userbar-dropdown-item userbar-user-item" onclick="javascript:elevate('management.php')">
                                        <i class="fa-solid fa-screwdriver-wrench userbar-user-item-icon" aria-hidden="true"></i>
                                        <span class="userbar-user-item-label"><?php echo INDEX_TO_MANAGEMENT; ?></span>
                                    </button>
                                </li>
                                <?php } ?>
                                <?php if ($xerte_toolkits_site->authentication_method != "Guest") { ?>
                                <li role="none">
                                    <button type="button" role="menuitem" class="userbar-dropdown-item userbar-user-item userbar-user-item--logout"
                                            onclick="javascript:logout(<?php echo($xerte_toolkits_site->authentication_method == "Saml2" ? "true" : "false"); ?>)">
                                        <i class="fa-solid fa-right-from-bracket userbar-user-item-icon" aria-hidden="true"></i>
                                        <span class="userbar-user-item-label"><?php echo INDEX_BUTTON_LOGOUT; ?></span>
                                    </button>
                                </li>
                                <?php } ?>
                            </ul>
                        </div>
                    </div>

                    <button type="button"
                            class="userbar-profile-btn"
                            title="<?php echo htmlspecialchars(INDEX_LOGGED_IN_AS . ' ' . $_SESSION['toolkits_firstname']); ?>"
                            aria-haspopup="true"
                            aria-expanded="false"
                            aria-controls="user-menu">
                        <i class="fa fa-user" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div style="clear:both;"></div>
            <div class="separator"></div>
        </div>

    </div>
	</header>
</div>
<!--

    Main part of the page

-->
<div class="ui-layout-center" id="pagecontainer" role="main">

    <div class="ui-layout-west" id="workspace_layout" >
        <div class="header" id="inner_left_header">
			<h1 class="heading sr-only"><?PHP echo INDEX_DETAILS; ?></h1>
			<div class="file_mgt_area_buttons">
				<!--Workspace buttons-->

				<div class="file_mgt_area_middle_button_left">
					<button title="<?php echo INDEX_BUTTON_EDIT; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
							id="edit"><i class="fa fa-pencil-square-o xerte-icon"></i></button>
					<button title="<?php echo INDEX_BUTTON_PROPERTIES; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
							id="properties"><i class="fa fa-info xerte-icon"></i></button>
					<button title="<?php echo INDEX_BUTTON_PREVIEW; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
							id="preview"><i class="fa fa-play xerte-icon"></i></button>
				</div>

				<div class="file_mgt_area_middle_button_left">
					<button title="<?php echo INDEX_BUTTON_NEWFOLDER; ?>" type="button" class="xerte_workspace_button" id="newfolder" onClick="javascript:make_new_folder()">
						<i class="fa fa-folder xerte-icon"></i>
					</button>
				</div>

				<div class="file_mgt_area_middle_button_right">
					<button title="<?php echo INDEX_BUTTON_DELETE; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
							id="delete"><i class="fa  fa-trash xerte-icon"></i></button>
					<button title="<?php echo INDEX_BUTTON_DUPLICATE; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
							id="duplicate"><i class="fa fa-copy xerte-icon"></i></button>
					<button title="<?php echo INDEX_BUTTON_PUBLISH; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
							id="publish"><i class="fa  fa-share xerte-icon"></i></button>
				</div>
			</div>
        </div>
        <div class="content">
            <div id="workspace"></div>
        </div>
        <div class="footer" id="sortContainer">
            <div class="file_mgt_area_bottom">
				<div class="sorter">
					<form name="sorting" style="float:left;margin:7px 5px 5px 10px;">
						<i class="fa  fa-sort xerte-icon"></i>&nbsp;<label for="sort-selector"><?PHP echo INDEX_SORT; ?></label>
						<select id="sort-selector" name="type" onChange="refresh_workspace(); save_user_preference('sort_type', this.value);">
							<option value="alpha_up"><?PHP echo INDEX_SORT_A; ?></option>
							<option value="alpha_down"><?PHP echo INDEX_SORT_Z; ?></option>
							<option value="date_down" selected><?PHP echo INDEX_SORT_NEW; ?></option>
							<option value="date_up"><?PHP echo INDEX_SORT_OLD; ?></option>
						</select>
					</form>
				</div>
				<div class="workspace_search_outer">
					<div class="workspace_search">
						<i class="fa  fa-search"></i>&nbsp;<label for="workspace_search"><?PHP echo INDEX_SEARCH; ?></label>
						<input type="text" id="workspace_search" placeholder="<?php echo INDEX_SEARCH_PLACEHOLDER?>">
					</div>
				</div>
			</div>
        </div>
    </div>

    <div class="ui-layout-center">
        <div class="header" id="inner_center_header">
			<h1 class="heading"><i class="fa icon-info-sign xerte-icon"></i>&nbsp;<?PHP echo INDEX_DETAILS; ?></h1>
        </div>
        <div class="content">
            <div class="projectInformationContainer" id="project_information">

            </div>
        </div>
        <div class="footer" id="inner_center_footer"></div>
    </div>

    <div class="ui-layout-east">

        <div class="header" id="inner_right_header">
            <h1 class="heading"><i class="fa icon-wrench xerte-icon"></i>&nbsp;<?PHP echo INDEX_CREATE; ?></h1>
        </div>

        <div class="content">
            <div class="new_template_area_middle">
                <div id="new_template_area_middle_ajax" class="new_template_area_middle_scroll"><?PHP
                    list_blank_templates();
                    ?>
                </div>
            </div>
        </div>
        <div class="footer" id="inner_right_footer"></div>
    </div>
</div>


<div class="ui-layout-south">
    <div class="content">
        <!-- <div class="border" style="margin:10px"></div>  -->

        <section class="help" style="width:31%;float:left;">
            <?PHP echo apply_filters('editor_pod_one', $xerte_toolkits_site->pod_one); ?>
        </section>

        <section class="help" style="width:31%;float:left;">
            <?PHP echo apply_filters('editor_pod_two', $xerte_toolkits_site->pod_two); ?>
        </section>
        <section class="highlightbox" style="width:31%;float:right;">
            <?PHP
            //echo $xerte_toolkits_site->demonstration_page;
            echo $xerte_toolkits_site->news_text;
            //echo $xerte_toolkits_site->tutorial_text;
            //echo $xerte_toolkits_site->site_text;
            ?>
        </section>

        <div class="border"></div>
		<footer>
			<p class="copyright">
				<?php echo $xerte_toolkits_site->copyright; ?> <i class="fa fa-info-circle" aria-hidden="true" style="color:#f86718; cursor: help;" title="<?PHP $vtext = "version.txt";$lines = file($vtext);echo $lines[0];?>"></i>
			</p>
			<div class="footerlogos">
                <a href="https://xot.xerte.org.uk/play_653" target="_blank" title="Xerte AI Ethical Use and Transparency Statement https://xot.xerte.org.uk/play_653"><img src="website_code/images/XerteFooterAILogo.png" border="0" alt="<?php echo INDEX_XERTE_AI_LOGO_ALT; ?>"></a><a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.2AA-blue.png" border="0" alt="<?php echo INDEX_WCAG_LOGO_ALT; ?>"></a><a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0" alt="<?php echo INDEX_OSI_LOGO_ALT; ?>"></a><a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0" alt="<?php echo INDEX_APEREO_LOGO_ALT; ?>"></a><a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/xerteFooterLogo.png" border="0" alt="<?php echo INDEX_XERTE_LOGO_ALT; ?>"></a>
			</div>
		</footer>
        <div style="clear:both;"></div>
    </div>
</div>

<script>
    $(document).ready(function () {
        setupMainLayout();
        if (typeof load_user_preferences === 'function') {
            load_user_preferences(); // Load preferences before refreshing workspace
        }
        refresh_workspace();
    });
</script>
<?php body_end(); ?></body>
</html>
<?php shutdown(); ?>

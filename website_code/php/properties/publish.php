<?php
/**
 * 
 * publish template, shows the publish options
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";
include "../screen_size_library.php";
include "../url_library.php";
include "../user_library.php";

$tutorial_id = mysql_real_escape_string($_POST['template_id']);

$database_id=database_connect("Properties template database connect success","Properties template database connect failed");

// User has to have some rights to do this

if(has_rights_to_this_template(mysql_real_escape_string($_POST['template_id']), $_SESSION['toolkits_logon_id'])||is_user_admin()){

    echo "<p class=\"header\"><span>Project</span></p>";

    $query_for_names = "select template_name, date_created, date_modified from " . $xerte_toolkits_site->database_table_prefix . "templatedetails where template_id=\"". $tutorial_id . "\"";

    $query_names_response = mysql_query($query_for_names);

    $row = mysql_fetch_array($query_names_response);

    echo "<p>This panel contains all the settings you need to publish your project.</p>";

    $template_access = template_access_settings(mysql_real_escape_string($_POST['template_id']));

    echo "<p><b>Access</b><br>If you have not published this project before, you must select the appropriate option in the 'Access' tab. This controls how your users can access your content. To set the access options, select the 'Access' tab and follow the instructions.</p>";

    if($template_access=="Private"){

        echo "<p><img src=\"website_code/images/bullet_error.gif\" align=\"absmiddle\" /><b>Your project is currently private. Click on 'Access' to change this.</b></p>";

    }else{

        echo "<p>Your project is currently set as " . $template_access . ".</p>";

    }

    echo "<p><b>RSS</b><br>RSS feeds provide a convenient way for your users to keep up to date with your content. If you'd like to add this project to your RSS feeds, select the 'RSS' tab and follow the instructions.</p>";

    if(!is_template_rss(mysql_real_escape_string($_POST['template_id']))){

        echo "<p><b>Your project is not in any RSS feeds.</b></p>";

    }else{

        echo "<p>Your project is available in the RSS Feeds.</p>";

    }

    echo "<p><b>Syndication</b><br>Syndicating your content makes it available to the widest possible audience by making it available for harvesting by open-access repositories of content. To syndicate your project, select the 'Syndication' tab and follow the instructions.</p>";

    if(!is_template_syndicated(mysql_real_escape_string($_POST['template_id']))){

        echo "<p><b>Your project is not currently syndicated.</b></p>";

    }else{

        echo "<p>Your project is currently syndicated.</p>";

    }

    if($template_access=="Public"){

        /**
         * 
         * This section using $_SESSION['webct'] is for people using the integration option for webct. If you integration option has the ability to post back a URL then you would modify this code to allow for your systems working methods.		
         *
         **/

        if(isset($_SESSION['webct'])){

            if($_SESSION['webct']=="true"){	

                $url = urlencode($xerte_toolkits_site->site_url . url_return("play",$tutorial_id));

                echo "<p>" . str_replace("~~~URL~~~", $url,str_replace("~~~NAME~~~", str_replace("_", " " ,$row['template_name']),$_SESSION['toolkits_webct_url'])) . "</p>";

            }else{

                echo "<p><img src=\"website_code/images/Bttn_PublishOff.gif\" onmouseover=\"this.src='website_code/images/Bttn_PublishOn.gif'\" onmouseout=\"this.src='website_code/images/Bttn_PublishOff.gif'\" onmousedown=\"this.src='website_code/images/Bttn_PublishClick.gif'\" onclick=\"publish_project(window.name);\" /></p>";

                echo "<p>The web address for this resource is " . $xerte_toolkits_site->site_url . url_return("play",mysql_real_escape_string($_POST['template_id'])) . "</p>";

            }

        }

    }else{

        echo "<p><img src=\"website_code/images/Bttn_PublishDis.gif\" /></p>";

    }

}else{

    echo "<p>Sorry you do not have rights to this template</p>";

}

?>

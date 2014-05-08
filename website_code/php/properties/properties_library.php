<?PHP

//PROPERTIES LIBRARY

require_once("../../../config.php");
require_once("../template_library.php");

_load_language_file("/website_code/php/properties/publish.inc");
_load_language_file("/website_code/php/properties/properties_library.inc");
_load_language_file("/properties.inc");

function xml_template_display($xerte_toolkits_site,$change){

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    echo "<p class=\"header\"><span>" . PROPERTIES_LIBRARY_XML_TITLE . "</span></p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_XML_DESCRIPTION . "</p>";

    $query = "select * from {$prefix}additional_sharing where sharing_type= ? AND template_id = ?";
    $params = array("xml", $_POST['template_id']);

    $query_response = db_query($query, $params);

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_XML_SHARING . " </p>";

    if(sizeof($query_response)==1){

        echo "<p class=\"share_status_paragraph\"><img id=\"xmlon\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:xml_tick_toggle('xmlon')\" /> " . PROPERTIES_LIBRARY_ON . "</p>";
        echo "<p class=\"share_status_paragraph\"><img id=\"xmloff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:xml_tick_toggle('xmloff')\" /> " . PROPERTIES_LIBRARY_OFF . "</p>";
        echo "<p class=\"share_status_paragraph\">The link for xml sharing is " . $xerte_toolkits_site->site_url . url_return("xml",$_POST['template_id']) . "</p>";

    }else{

        echo "<p class=\"share_status_paragraph\"><img id=\"xmlon\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:xml_tick_toggle('xmlon')\" /> " . PROPERTIES_LIBRARY_ON . "</p>";
        echo "<p class=\"share_status_paragraph\"><img id=\"xmloff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:xml_tick_toggle('xmloff')\" /> " . PROPERTIES_LIBRARY_OFF . "</p>";

    }

    $row = $query_response[0];

    echo "<p class=\"share_status_paragraph\"><form action=\"javascript:xml_change_template()\" name=\"xmlshare\">" . PROPERTIES_LIBRARY_XML_RESTRICT . " <br><br><input type=\"text\" size=\"30\" name=\"sitename\" style=\"margin:0px; padding:0px\" value=\"" . $row['extra'] . "\" /><br><br><button type=\"submit\" class=\"xerte_button\" >" . PROPERTIES_LIBRARY_SAVE . "</button></p></form>";

    if($change){

        echo "<p>" . PROPERTIES_LIBRARY_XML_SAVE . "</p>";

    }

}

function xml_template_display_fail(){

    echo "<p>" . PROPERTIES_LIBRARY_XML_ERROR . "</p>";

}

function properties_display($xerte_toolkits_site,$tutorial_id,$change,$msgtype){

    echo "<p class=\"header\"><span>" . PROPERTIES_LIBRARY_PROJECT . "</span></p>";
    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query_for_names = "select {$prefix}templatedetails.template_name, template_framework, date_created, date_modified, extra_flags from "
    . "{$prefix}templatedetails, {$prefix}originaltemplatesdetails where template_id= ? and {$prefix}originaltemplatesdetails.template_type_id =  {$prefix}templatedetails.template_type_id ";

    $params = array($tutorial_id);
    $query_names_response = db_query($query_for_names, $params);

    $_POST['template_id'] = (int) $_POST['template_id'];
    
    if(is_user_creator($_POST['template_id'])){

        $query_for_template_name = "select template_name from {$prefix}templatedetails where template_id= ?";
        $params = array($_POST['template_id']);

        $row_template_name = db_query_one($query_for_template_name, $params);

        echo "<p>" . PROPERTIES_LIBRARY_PROJECT_NAME . "</p>";

        echo "<form id=\"rename_form\" action=\"javascript:rename_template('" . $_POST['template_id'] ."', 'rename_form')\"><input type=\"text\" value=\"" . str_replace("_", " ", $row_template_name['template_name']) . "\" name=\"newfilename\" /><button type=\"submit\" class=\"xerte_button\" style=\"padding-left:5px;\" align=\"top\" >" . PROPERTIES_LIBRARY_RENAME . "</button></form>";

        if($change && $msgtype=="name"){

            echo "<p>" . PROPERTIES_LIBRARY_PROJECT_CHANGED . "</p>";

        }

    }

    echo "<br><br><br><p>" . PROPERTIES_LIBRARY_PROJECT_CREATE . " " . $row['date_created'] . "</p>";

    echo "<p>" . PROPERTIES_LIBRARY_PROJECT_MODIFY . " " . $row['date_modified'] . "</p>";

	include "../../../modules/" . $row['template_framework'] . "/module_functions.php";

	if(function_exists("display_property_engines")){

		display_property_engines($change,$msgtype);

	}

    if(template_access_settings($_POST['template_id'])!='Private'){

        echo "<p>" . PROPERTIES_LIBRARY_PROJECT_LINK . "</p>";

        echo "<p><a target=\"new\" href='" . $xerte_toolkits_site->site_url . 
                url_return("play", $_POST['template_id']) . "'>" .
                $xerte_toolkits_site->site_url . url_return("play", $_POST['template_id']) . "</a></p>";

		$template = explode("_", get_template_type($_POST['template_id']));


        if(file_exists($xerte_toolkits_site->root_file_path . "/modules/" . $template[0] . "/play_links.php")){

			require_once($xerte_toolkits_site->root_file_path . "/modules/" . $template[0] . "/play_links.php");

			show_play_links($template[1]);

		}

        // Get the template screen size

        $query_for_template_name = "select {$prefix}originaltemplatesdetails.template_name, "
        . "{$prefix}originaltemplatesdetails.template_framework from "
        . "{$prefix}originaltemplatesdetails, {$prefix}templatedetails where"
        . " {$prefix}templatedetails.template_type_id = {$prefix}originaltemplatesdetails.template_type_id AND template_id = ?";

        $params = array($tutorial_id);
        
        $row_name = db_query_one($query_for_template_name, $params);
        

		if(isset($xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size)){

			if($xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size!="*"){

				$temp_string = $xerte_toolkits_site->learning_objects->{$row_name['template_framework'] . "_" . $row_name['template_name']}->preview_size;

			}else{

				$temp_string = "100%,100%";

			}

		}else{

			$temp_string = "100%,100%";

		}

        $temp_array = explode(",",$temp_string);

        echo "<br><br><p>" . PROPERTIES_LIBRARY_PROJECT_IFRAME . "</p><form><textarea rows='3' cols='40' onfocus='this.select()'><iframe src=\""  . $xerte_toolkits_site->site_url .  url_return("play", $_POST['template_id']) .  "\" width=\"" . $temp_array[0] . "\" height=\"" . $temp_array[1] . "\" frameborder=\"0\" style=\"float:left; position:relative; top:0px; left:0px; z-index:0;\"></iframe></textarea></form>";

    }

}

function properties_display_fail(){

    echo "<p>" . PROPERTIES_LIBRARY_PROJECT_FAIL . "</p>";

}

function publish_display($template_id)
{
    global $xerte_toolkits_site;

    $prefix = $xerte_toolkits_site->database_table_prefix;
    $database_id=database_connect("Properties template database connect success","Properties template database connect failed");

    // User has to have some rights to do this

    if( has_rights_to_this_template($_POST['template_id'], $_SESSION['toolkits_logon_id']) || is_user_admin() ){

        echo "<p class=\"header\"><span>" . PUBLISH_TITLE . "</span></p>";

        $query_for_names = "select td.template_name, td.date_created, td.date_modified, otd.template_framework from {$prefix}templatedetails td, "
        . "{$prefix}originaltemplatesdetails otd where td.template_id= ? and td.template_type_id = otd.template_type_id";

        $params = array($template_id);
        
      

        $row = db_query_one($query_for_names, $params); 

        echo "<p>" . PUBLISH_DESCRIPTION . "</p>";

        $template_access = template_access_settings($template_id);

        echo "<p><b>" . PUBLISH_ACCESS . "</b><br>" . PUBLISH_ACCESS_DESCRIPTION . "</p>";

        if($template_access=="Private"){

            echo "<p><img src=\"website_code/images/bullet_error.gif\" align=\"absmiddle\" /><b>" . PUBLISH_ACCESS_STATUS . "</b></p>";

        }else{

            echo "<p>" . PUBLISH_ACCESS_IS . " " . $template_access . ".</p>";

        }

        echo "<p><b>" . PUBLISH_RSS . "</b><br>" . PUBLISH_RSS_DESCRIPTION . "</p>";

        if(!is_template_rss($_POST['template_id'])){

            echo "<p><b>" . PUBLISH_RSS_NOT_INCLUDE . "</b></p>";

        }else{

            echo "<p>" . PUBLISH_RSS_INCLUDE . "</p>";

        }

        include "../../../modules/" . $row['template_framework'] . "/module_functions.php";

        display_publish_engine();

        echo "<p><b>" . PUBLISH_SYNDICATION . "</b><br>" . PUBLISH_SYNDICATION_DESCRIPTION . "</p>";

        if(!is_template_syndicated($template_id)){

            echo "<p><b>" . PUBLISH_SYNDICATION_STATUS_OFF . "</b></p>";

        }else{

            echo "<p>" . PUBLISH_SYNDICATION_STATUS_ON . "</p>";

        }

        if($template_access!=""){

            /**
             *
             * This section using $_SESSION['webct'] is for people using the integration option for webct. If you integration option has the ability to post back a URL then you would modify this code to allow for your systems working methods.
             *
             **/

            echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"publish_project(window.name);\">" . PUBLISH_BUTTON_LABEL . "</button></p>";

            echo "<p>" . PUBLISH_WEB_ADDRESS . " <a target='_blank' href='" . $xerte_toolkits_site->site_url . url_return("play",$template_id) . "'>" . $xerte_toolkits_site->site_url . url_return("play",$template_id) . "</a></p>";


        }

    }else{

        echo "<p><img src=\"website_code/images/Bttn_PublishDis.gif\" /></p>";

    }

}

function notes_display($notes, $change, $template_id){
    $template_id = (int) $template_id;
    $notes = htmlentities($notes, ENT_QUOTES, 'UTF-8', false);
    echo "<p class=\"header\"><span>" . PROPERTIES_TAB_NOTES . "</span></p>";

    echo "<p>" . PROPERTIES_LIBRARY_NOTES_EXPLAINED . "<br/><form id=\"notes_form\" action=\"javascript:change_notes('" . $template_id ."', 'notes_form')\"><textarea style=\"width:90%; height:330px\">" . $notes . "</textarea><button type=\"submit\" class=\"xerte_button\">" . PROPERTIES_LIBRARY_SAVE . " </button></form></p>";

    if($change){

        echo "<p>" . PROPERTIES_LIBRARY_NOTES_SAVED . "</p>";

    }

}

function notes_display_fail(){

    echo "<p>" . PROPERTIES_LIBRARY_NOTES_FAIL . "</p>";

}

function peer_display($xerte_toolkits_site,$change, $template_id){
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $template_id = (int) $template_id;
    
    echo "<p class=\"header\"><span>" . PROPERTIES_LIBRARY_PEER . "</span></p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_PEER_EXPLAINED . "</p>";

    $query = "select * from {$prefix}additional_sharing where sharing_type=? AND template_id = ?";

    $params = array('peer', $template_id);
    
    $query_response = db_query($query, $params);

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_PEER_STATUS . " </p>";

    if(sizeof($query_response)==1){

        echo "<p class=\"share_status_paragraph\"><img id=\"peeron\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:peer_tick_toggle('peeron')\" /> " . PROPERTIES_LIBRARY_ON . "</p>";
        echo "<p class=\"share_status_paragraph\"><img id=\"peeroff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:peer_tick_toggle('peeroff')\" /> " . PROPERTIES_LIBRARY_OFF . "</p>";
        echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_PEER_LINK . "<a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("peerreview", $template_id) . "\">" .  $xerte_toolkits_site->site_url . url_return("peerreview", $template_id)  . "</a></p>";

    }else{

        echo "<p class=\"share_status_paragraph\"><img id=\"peeron\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:peer_tick_toggle('peeron')\" /> " . PROPERTIES_LIBRARY_ON . "</p>";
        echo "<p class=\"share_status_paragraph\"><img id=\"peeroff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:peer_tick_toggle('peeroff')\" />  " . PROPERTIES_LIBRARY_OFF . "</p>";

    }

    $row = $query_response[0];
    $extra = explode("," , $row['extra'],2);

    $passwd = $extra[0];
    if (count($extra) > 1)
    {
        $retouremail = $extra[1];
    }
    else
    {
        $retouremail = $_SESSION['toolkits_logon_username'];
        $retouremail .= '@';
        if (strlen($xerte_toolkits_site->email_to_add_to_username)>0)
        {
            $retouremail .= $xerte_toolkits_site->email_to_add_to_username;
        }

    }
    echo "<p class=\"share_status_paragraph\">";
    echo "<form action=\"javascript:peer_change_template()\" name=\"peer\" >";
    echo PROPERTIES_LIBRARY_PEER_PASSWORD_PROMPT . " <input type=\"text\" size=\"15\" name=\"password\" style=\"margin:0px; padding:0px\" value=\"" . $passwd . "\" /><br /><br />";
    echo PROPERTIES_LIBRARY_PEER_RETOUREMAIL_PROMPT . "<br /> <input type=\"text\" size=\"50\" name=\"retouremail\" style=\"margin:0px; padding:0px\" value=\"" . $retouremail . "\" />";
    echo "<br><br><button type=\"submit\" class=\"xerte_button\">" . PROPERTIES_LIBRARY_SAVE . "</button>";
    echo "</p>";
    echo "</form>";

    if($change){

        echo "<p>" . PROPERTIES_LIBRARY_PEER_SAVED . "</p>";

    }

}

function peer_display_fail(){

    echo "<p>" . PROPERTIES_LIBRARY_PEER_FAIL . "</p>";

}

function syndication_display($xerte_toolkits_site, $change){

    echo "<p class=\"header\"><span>" . PROPERTIES_LIBRARY_SYNDICATION . "</span></p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_SYNDICATION_EXPLAINED . " <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "\">" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "</a></p>";

    $prefix =  $xerte_toolkits_site->database_table_prefix;
    
    $query_for_syndication = "select syndication,description,keywords,category,license from {$prefix}templatesyndication where template_id=?";

    $params = array($_POST['tutorial_id']);
    
    $row_syndication = db_query_one($query_for_syndication, $params);


    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_SYNDICATION_PROMPT . " ";

    if($row_syndication['syndication']=="true"){

        echo "<img id=\"syndon\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('syndon')\" /> " . PROPERTIES_LIBRARY_YES . "  <img id=\"syndoff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('syndoff')\" /> " . PROPERTIES_LIBRARY_NO . " </p>";

    }else{

        echo "<img id=\"syndon\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('syndon')\" /> " . PROPERTIES_LIBRARY_YES . " <img id=\"syndoff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('syndoff')\" /> " . PROPERTIES_LIBRARY_NO . " </p>";

    }

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_SYNDICATION_CATEGORY . "<br><select SelectedItem=\"" . $row_syndication['category'] . "\" name=\"type\" id=\"category_list\" style=\"margin:5px 0 0 0; padding:0px;\">";

    $query_for_categories = "select category_name from {$prefix}syndicationcategories";

    $query_categories_response = db_query($query_for_categories);

    foreach($query_categories_response as $row) {

        echo "<option value=\"" . $row_categories['category_name'] . "\"";

        if($row_categories['category_name']==$row_syndication['category']){

            echo " selected=\"selected\" ";

        }

        echo ">" . $row_categories['category_name'] . "</option>";

    }

    echo "</select></p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_SYNDICATION_LICENCE . "<br><select ";

    if(isset($row_syndication['license_name'])){

        echo " SelectedItem=\"" . $row_syndication['license_name'] . "\"";

    }

    echo " name=\"type\" id=\"license_list\" style=\"margin:5px 0 0 0; padding:0px;\">";

    $query_for_licenses = "select license_name from {$prefix}syndicationlicenses";

    $query_licenses_response = db_query($query_for_licenses);
    
    foreach($query_licenses_response as $row_licenses){

        echo "<option value=\"" . $row_licenses['license_name'] . "\"";

        if($row_licenses['license_name']==$row_syndication['license']){

            echo " selected=\"selected\" ";

        }

        echo ">" . $row_licenses['license_name'] . "</option>";

    }

    echo "</select></p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_SYNDICATION_DESCRIPTION . "<form action=\"javascript:syndication_change_template()\" name=\"syndshare\" ><textarea id=\"description\" style=\"width:95%; height:100px\">" . $row_syndication['description'] . "</textarea>";
    echo PROPERTIES_LIBRARY_SYNDICATION_KEYWORDS . "<textarea id=\"keywords\" style=\"width:95%; height:40px\">" . $row_syndication['keywords'] . "</textarea><button type=\"submit\" class=\"xerte_button\" style=\"padding-top:5px\" >" . PROPERTIES_LIBRARY_SAVE . "</button></p></form>";

    if($change){

        echo "<p>" . PROPERTIES_LIBRARY_SYNDICATION_SAVED . "</p>";

    }

}

function syndication_not_public($xerte_toolkits_site){

    echo "<p>" . PROPERTIES_LIBRARY_SYNDICATION_PUBLIC . "</p>";

    echo "<p>" . PROPERTIES_LIBRARY_SYNDICATION_URL . " <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "\">" . $xerte_toolkits_site->site_url . url_return("RSS_syndicate",null) . "</a></p>";

}

function syndication_display_fail(){

    echo "<p>" . PROPERTIES_LIBRARY_SYNDICATION_FAIL . "</p>";

}

function access_display($xerte_toolkits_site, $change){

    $prefix =  $xerte_toolkits_site->database_table_prefix ;
    $query_for_template_access = "select access_to_whom from {$prefix}templatedetails where template_id= ? ";
    $params = array($_POST['template_id']);

    $query_access_response = db_query_one($query_for_template_access, $params);
    $row_access = db_query_one($query_access_response, $params);

    echo "<p class=\"header\"><span>" . PROPERTIES_TAB_ACCESS . " " . str_replace("-", " - ", $row_access['access_to_whom']) . "</span></p>";
    echo "<p><span>" . PROPERTIES_LIBRARY_ACCESS . " " . str_replace("-", " - ", $row_access['access_to_whom']) . "</span></p>";

    echo "<div id=\"security_list\">";

    if(template_access_settings($_POST['template_id']) == "Public"){

        echo "<p id=\"Public\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\" />";

    }else{

        echo "<p id=\"Public\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

    }

    echo " " . PROPERTIES_LIBRARY_ACCESS_PUBLIC . "</p><p class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_PUBLIC_EXPLAINED . "</p>";

    if(template_access_settings($_POST['template_id']) == "Password"){

        echo "<p id=\"Password\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\"  onclick=\"javascript:access_tick_toggle(this)\" />";

    }else{

        echo "<p id=\"Password\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

    }

    echo " " . PROPERTIES_LIBRARY_ACCESS_PASSWORD . "</p><p class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_PASSWORD_EXPLAINED . "</p>";

    if(substr(template_access_settings($_POST['template_id']),0,5) == "Other"){

        echo "<p id=\"Other\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

    }else{

        echo "<p id=\"Other\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

    }

    echo " " . PROPERTIES_LIBRARY_ACCESS_OTHER . "</p><p class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_OTHER_EXPLAINED . "<form id=\"other_site_address\"><textarea id=\"url\" style=\"width:90%; height:20px;\">";

    if(isset($_POST['server_string'])){

        echo $_POST['server_string'];

    }else{

        $temp = explode("-", $row_access['access_to_whom']);

        if(isset($temp[1])){

            echo $temp[1];

        }

    }

    echo "</textarea></form></p>";

    if(template_access_settings($_POST['template_id']) == "Private"){

        echo "<p id=\"Private\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

    }else{

        echo "<p id=\"Private\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";
    }

    echo " " . PROPERTIES_LIBRARY_ACCESS_PRIVATE . "</p><p class=\"share_explain_paragraph\">" . PROPERTIES_LIBRARY_ACCESS_PRIVATE_EXPLAINED . "</p>";

    $query_for_security_content = "select * from {$prefix}play_security_details";

    $rows = db_query($query_for_security_content);
    
    foreach($rows as $row_security) {

            if(template_share_status($row_security['security_setting'])){

                echo "<p id=\"" . $row_security['security_setting'] . "\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

            }else{

                echo "<p id=\"" . $row_security['security_setting'] . "\" class=\"share_status_paragraph\"><img src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:access_tick_toggle(this)\"  />";

            }

            echo " " . $row_security['security_setting'] . "</p><p class=\"share_explain_paragraph\">" . $row_security['security_info'] . "</p>";
    

    }

    echo "</div>";

    echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:access_change_template(" . $_POST['template_id'] . ")\">" . PROPERTIES_LIBRARY_ACCESS_BUTTON_CHANGE . "</button> </p>";

    if($change){

        echo "<p>" . PROPERTIES_LIBRARY_ACCESS_CHANGED . "</p>";

    }
}

function access_display_fail(){

    echo "<p>" . PROPERTIES_LIBRARY_ACCESS_FAIL . "</p>";

}

function rss_display($xerte_toolkits_site,$tutorial_id,$change){

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query_for_name = "select firstname,surname from {$prefix}logindetails where login_id= ?";
    $row_name = db_query_one($query_for_name, array($_SESSION['toolkits_logon_id']));


    $query_for_rss = "select rss,export,description from {$prefix}templatesyndication where template_id=?";
    $row_rss = db_query_one($query_for_rss, array($tutorial_id));

    echo "<p class=\"header\"><span>" . PROPERTIES_LIBRARY_RSS . "</span></p>";

    if($row_rss['rss']=="true"){

        echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_INCLUDE . " <img id=\"rsson\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('rsson')\" /> " . PROPERTIES_LIBRARY_YES . "  <img id=\"rssoff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('rssoff')\" /> " . PROPERTIES_LIBRARY_NO . " </p>";

    }else{

        echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_INCLUDE . " <img id=\"rsson\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('rsson')\" /> " . PROPERTIES_LIBRARY_YES . "  <img id=\"rssoff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('rssoff')\" /> " . PROPERTIES_LIBRARY_NO . " </p>";

    }

    if($row_rss['export']=="true"){

        echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_EXPORT . "<img id=\"exporton\" src=\"website_code/images/TickBoxOn.gif\"  onclick=\"javascript:rss_tick_toggle('exporton')\" /> " . PROPERTIES_LIBRARY_YES . "  <img id=\"exportoff\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('exportoff')\" /> " . PROPERTIES_LIBRARY_NO . " </p>";

    }else{

        echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_EXPORT . "<img id=\"exporton\" src=\"website_code/images/TickBoxOff.gif\" onclick=\"javascript:rss_tick_toggle('exporton')\" /> " . PROPERTIES_LIBRARY_YES . "  <img id=\"exportoff\" src=\"website_code/images/TickBoxOn.gif\" onclick=\"javascript:rss_tick_toggle('exportoff')\"  /> " . PROPERTIES_LIBRARY_NO . " </p>";

    }

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_DESCRIPTION . "<form action=\"javascript:rss_change_template()\" name=\"xmlshare\" ><textarea id=\"desc\" style=\"width:90%; height:120px;\">" . $row_rss['description'] . "</textarea><br><br><button type=\"submit\" class=\"xerte_button\" >" . PROPERTIES_LIBRARY_SAVE . "</button></form></p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_SITE . "</p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_SITE_LINK . " <a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS",null)  . "\">" . $xerte_toolkits_site->site_url . url_return("RSS",null) . "</a>. " . PROPERTIES_LIBRARY_RSS_PERSONAL . "<a target=\"new\" href=\"" . $xerte_toolkits_site->site_url . url_return("RSS_user", ($row_name['firstname'] . "_" . $row_name['surname'])) . "\">" . $xerte_toolkits_site->site_url . url_return("RSS_user", $row_name['firstname'] . "_" . $row_name['surname']) . "</a>. " . PROPERTIES_LIBRARY_RSS_MINE . "</p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_FOLDER . "</p>";

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_EXPORT . "</p>";

    if($change){

        echo "<p>" . PROPERTIES_LIBRARY_RSS_SAVED . "</p>";

    }

}

function rss_display_public(){

    echo "<p class=\"share_status_paragraph\">" . PROPERTIES_LIBRARY_RSS_PUBLIC . "</p>";

}

function rss_display_fail(){

    echo "<p>" . PROPERTIES_LIBRARY_RSS_FAIL . "</p>";

}
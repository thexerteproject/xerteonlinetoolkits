<?php
global $xerte_toolkits_site;
global $development;
$xerte_toolkits_site = new StdClass();

require_once(dirname(__FILE__) . "/../database.php");
require_once(dirname(__FILE__) . '/../website_code/php/database_library.php');

$success_string = '';
$fail_string = '';
$magic_quotes = get_magic_quotes_gpc();
$development = true;

function _debug($string) {
    // pass, for now.
}

ini_set('error_reporting', E_ALL);


echo file_get_contents("page_top");

$res = db_query("DELETE FROM {$xerte_toolkits_site->database_table_prefix}sitedetails");
if(!$res) {
    die("Error running SQL query " . mysql_error());
}

$res = db_query("insert  into {$xerte_toolkits_site->database_table_prefix}sitedetails(site_id) VALUES (1)");
if(!$res) {
    die("Error running SQL query " . mysql_error());
}

if(!empty($_POST['site_url'])) {
    if(!preg_match('/^http/', $_POST['site_url'])) {
        $_POST['site_url'] = 'http://' . $_POST['site_url'];
    }
}
foreach(array('news_text', 'pod_one', 'pod_two', 'form_string', 'peer_form_string', 'play_edit_preview_query') as $key) {
    $_POST[$key] = base64_encode(stripcslashes($_POST[$key])); 
}
    
foreach(array('site_url', 'apache', 'mimetypes', 'LDAP_preference', 'LDAP_filter', 'integration_config_path', 'admin_username', 'admin_password', 'site_session_name', 
    'site_title', 'site_name', 'site_logo', 'organisational_logo','welcome_message', 'site_text', 'news_text', 'pod_one', 'pod_two', 'copyright', 'rss_title',
    'synd_publisher', 'synd_rights', 'synd_license', 'demonstration_page', 'form_string', 'peer_form_string', 'module_path', 'website_code_path', 'users_file_area_short', 
    'php_library_path', 'error_log_path', 'email_error_list', 'error_log_message', 'max_error_size', 'error_email_message', 'max_error_size', 'error_email_message',
    'ldap_host', 'ldap_port', 'bind_pwd', 'basedn', 'bind_dn', 'flash_save_path', 'flash_upload_path', 'flash_preview_check_path', 'flash_flv_skin',
    'site_email_account', 'headers', 'email_to_add_to_username', 'proxy1', 'port1', 'feedback_list', 'play_edit_preview_query' ) as $field) {

    $res = db_query("UPDATE {$xerte_toolkits_site->database_table_prefix}sitedetails SET $field = ? WHERE site_id = ?", array($_POST[$field], '1'));
    if(!$res) {
        $fail_string .= "<div style='color: red;'>The sitedetails {$field} query has failed, with MySQL saying: " . mysql_error() . "</div><br/>";
    }
    else {
        $success_string .= "The sitedetails {$field} query succeeded<br/>";
    }
}

$ldap_fields = array('ldap_filter' => 'LDAP_filter', 'ldap_filter_attr' => 'LDAP_preference', 'ldap_host' => 'ldap_host', 'ldap_port' => 'ldap_port', 
                     'ldap_password' => 'bind_pwd', 'ldap_basedn' => 'basedn', 'ldap_username' => 'bind_dn');
$comma = '';
$query = "INSERT INTO {$xerte_toolkits_site->database_table_prefix}ldap (" . implode(',', array_keys($ldap_fields)) . ") VALUES (";
$values = array();
foreach($ldap_fields as $post_key) {
    $query .= $comma;
    $query .= "?";
    $comma = ",";
    $values[] = $_POST[$post_key];
}
$query .= ")";

$res = db_query($query, $values);
if(!$res) {
    $fail_string .= "The ldap query has failed (query: {{{$query}}}) due to " . mysql_error() . "<br/>";
}
else {
    $success_string .= "The 'ldap' insert query has succeeded<br/>";
}


if(!$magic_quotes){
    $import_path = addslashes($_POST['import_path']);
}else{
    $import_path = $_POST['import_path'];
}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set import_path=\"" . str_replace("\\\\","/",$import_path) . "\" where site_id=\"1\"";	

$query_response = mysql_query($query);

if(!$query_response){
    $fail_string .= "The sitedetails import_path query " . $query . " has failed due to " . mysql_error() . "<br>";
}else{
    $success_string .= "The sitedetails import_path query succeeded <br>";
}

if(!$magic_quotes){
    $root_path = addslashes($_POST['root_file_path']);
}else{
    $root_path = $_POST['root_file_path'];

}

$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set root_file_path='" . str_replace("\\\\","/",$root_path) . "' where site_id=\"1\"";	
$query_response = mysql_query($query);

if(!$query_response){
    $fail_string .= "The sitedetails root_file_path query " . $query . " has failed due to " . mysql_error() . "<br>";
}else{
    $success_string .= "The sitedetails root_file_path query succeeded <br>";

}


// Setup .htaccess file if we can...
if($_POST['apache']=="true"){
    $replace = substr($_SERVER['PHP_SELF'],0,strpos($_SERVER['PHP_SELF'],"/",1));
    $buffer = file_get_contents("htaccess.conf");
    $buffer = str_replace("*",$replace,$buffer);
    $file_handle = fopen(".htaccess",'w');
    fwrite($file_handle,$buffer,strlen($buffer));
    fclose($file_handle);
    if(chmod(".htaccess",0744) && rename(".htaccess","../.htaccess") && chmod("../.htaccess",0744)) {
        $success_string .= "<p>.htaccess setup succeeded</p>";
    }
}

?>

<h2 style="margin-top:15px">
    Install complete
</h2>
<?PHP

if($fail_string!=""){

    echo "<p><b?The following queries failed</b> - <br /> " . $fail_string . "</p>";
    echo "<p>These failures may affect your site, please see if they can be rectified using the management tools or altering the database directly.</p>";

}

if($success_string!=""){

    echo "<p>The following queries suceeded - <br /> " . $success_string . "</p>";

}

?>
<p> Your site URL is  <a href="http://<?PHP echo $_SERVER['HTTP_HOST'] . substr($_SERVER['PHP_SELF'],0,strlen($_SERVER['PHP_SELF'])-15); ?>"><?php echo $_SERVER['HTTP_HOST'] . substr($_SERVER['PHP_SELF'],0,strlen($_SERVER['PHP_SELF'])-15); ?></a> </p>

<h2>Security Warning</h2>
<p><strong><u>If you have installed this on a public facing server, ensure you delete the following:<br/>
<ul>
    <li>/setup (this installer; it can be used to overwrite files on your webserver)</li>
</ul>
<p>You should also delete all of the following you are not planning to use:</p>
<ul>
    <li>webctlink,php (allows anyone to specify whatever username they wish)</li>
</ul>
</u>
</strong>
</p>

<h2>Need more help?</h2>
<p>Please see the Xerte site at <a href="http://www.nottingham.ac.uk/xerte" target="new">http://www.nottingham.ac.uk/xerte</a> and please consider joining the mailing list.</p>

</body>
</html>

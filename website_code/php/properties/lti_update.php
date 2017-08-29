<?php

require_once("../../../config.php");

global $xerte_toolkits_site;

require_once($xerte_toolkits_site->tsugi_dir . "config.php");
require_once($xerte_toolkits_site->tsugi_dir . "admin/admin_util.php");

use \Tsugi\Util\LTI;
use \Tsugi\Core\LTIX;
use \Tsugi\Config\ConfigInfo;

$tsugi = false;
$xAPI = false;

_debug("lti update");

if (isset($_REQUEST['tsugi_xapi']) && $_REQUEST['tsugi_xapi'] == "on")
{
    $xAPI = true;
}

if (isset($_REQUEST['tsugi']) && $_REQUEST['tsugi'] == "true")
{
    $tsugi = true;
}

$tsugi_project_dir = $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'];
$tsugi_dir = $xerte_toolkits_site->tsugi_dir . "mod/$tsugi_project_dir/";

if($tsugi && ( ( !isset($_REQUEST["tsugi_published"]) || $_REQUEST["tsugi_published"] != "on" ) || file_exists($tsugi_dir) ))
{
    $PDOX = LTIX::getConnection();
    $url = $xerte_toolkits_site->site_url . "lti2_launch.php?template_id=" . $row['template_id'];
    $p = $CFG->dbprefix;
    //link -> context -> key
    $sql = "SELECT * FROM {$p}lti_link WHERE path = :PATH";
    $link_row = $PDOX->rowDie($sql, array(
        ':PATH' => $url
    ));
    $sql = "DELETE FROM {$p}lti_link WHERE link_id = :LINK_ID";
    $PDOX->queryDie($sql, array(
        ':LINK_ID' => $link_row["link_id"]
    ));
    $sql = "SELECT context_id FROM {$p}lti_context WHERE link_id = :LINK_ID";
    $context_id = $link_row["context_id"];
    $sql = "SELECT COUNT(*) AS count FROM {$p}lti_link WHERE context_id = :CONTEXT_ID";
    $context_count = $PDOX->rowDie($sql, array(
        ':CONTEXT_ID' => $context_id
    ))["count"];
    if($context_count == 0)
    {
        $context_row = $PDOX->rowDie("SELECT * FROM {$p}lti_context WHERE context_id = :CONTEXT_ID", array(
            ':CONTEXT_ID' => $context_id));
        $PDOX->queryDie("DELETE FROM {$p}lti_context WHERE context_id = :CONTEXT_ID", array(
            ':CONTEXT_ID' => $context_id));
        $sql = "SELECT COUNT(*) AS count FROM {$p}lti_context WHERE key_id = :KEY_ID";
        $key_count = $PDOX->rowDie($sql, array(
            ':KEY_ID' => $context_row["key_id"]
        ))["count"];

        if($key_count == 0)
        {
            $PDOX->queryDie("DELETE FROM {$p}lti_key WHERE key_id = :KEY_ID;", array(
                ':KEY_ID' => $context_row["key_id"]));
        }
    }
    $it = new RecursiveDirectoryIterator($tsugi_dir, RecursiveDirectoryIterator::SKIP_DOTS);
    $files = new RecursiveIteratorIterator($it,
        RecursiveIteratorIterator::CHILD_FIRST);
    foreach($files as $file) {
        if ($file->isDir()){
            rmdir($file->getRealPath());
        } else {
            unlink($file->getRealPath());
        }
    }
    unset($it);
    unset($files);
    rmdir($tsugi_dir);
    if(!isset($_REQUEST["tsugi_published"]) || $_REQUEST["tsugi_published"] != "on")
    {
        exit();
    }
}

if($tsugi)
{
    //creates the register.php that tsugi uses
    $name = "";
    $shortname = "";
    $description = "";

    $endpoint = "";
    $username = "";
    $password = "";

    //Fill Register_LTI2
    if(isset($_POST["tsugi_name"])) {
        $name = htmlspecialchars($_POST["tsugi_name"]);
    }
    if(isset($_POST["tsugi_shortname"])) {
        $shortname = htmlspecialchars($_POST["tsugi_shortname"]);
    }
    if(isset($_POST["tsugi_description"])) {
        $description = htmlspecialchars($_POST["tsugi_description"]);
    }

    //Fill xApi_Config
    if(isset($_POST["tsugi_xapi_endpoint"])) {
        $endpoint = htmlspecialchars($_POST["tsugi_xapi_endpoint"]);
    }
    if(isset($_POST["tsugi_xapi_username"])) {
        $username = htmlspecialchars($_POST["tsugi_xapi_username"]);
    }
    if(isset($_POST["tsugi_xapi_password"])) {
        $password = htmlspecialchars($_POST["tsugi_xapi_password"]);
    }


    $register_page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/../../../modules/xerte/player_html5/register.php");
    $register_page_content = str_replace("%NAME%", $name , $register_page_content);
    $register_page_content = str_replace("%SHORT_NAME%", $shortname , $register_page_content);
    $register_page_content = str_replace("%DESCRIPTION%", $description , $register_page_content);

    $register_page_content = str_replace("%END%", $endpoint, $register_page_content);
    $register_page_content = str_replace("%USER%", $username, $register_page_content);
    $register_page_content = str_replace("%PASSWORD%", $password, $register_page_content);

    $file_handle = fopen($dir_path . "register.php", 'w');
    fwrite($file_handle,$register_page_content, strlen($register_page_content));
    fclose($file_handle);

    $zipfile->add_files("register.php");


    array_push($delete_file_array,  $dir_path . "register.php");

}

if($tsugi)
{
    $tsugi_key = $_REQUEST["tsugi_key"];
    $tsugi_secret = $_REQUEST["tsugi_secret"];
    $url = $xerte_toolkits_site->site_url . "lti2_launch.php?template_id=" . $row['template_id'];
    $PDOX = LTIX::getConnection();
    $p = $CFG->dbprefix;
    $context_row = $PDOX->rowDie("SELECT MAX(context_id) FROM {$p}lti_context;");
    $context_id = ($context_row["MAX(context_id)"]) + 1;
    $key_row = $PDOX->rowDie("SELECT MAX(key_id) FROM {$p}lti_key;");
    $key_id = ($key_row["MAX(key_id)"]) + 1;
    $link_row = $PDOX->rowDie("SELECT MAX(link_id) FROM {$p}lti_link;");
    $link_id = ($link_row["MAX(link_id)"]) + 1;
    $sql = "INSERT INTO {$p}lti_key
			( key_id, key_sha256, key_key, secret) VALUES
				( :key_id, :key_sha256, :key_key, :secret);";

    $param = array(
        ':key_id' => $key_id,
        ':key_sha256' => lti_sha256($tsugi_key),
        ':key_key' => $tsugi_key,
        ':secret' => $tsugi_secret
    );
    $res = $PDOX->queryDie($sql, $param);


    $sql = "INSERT INTO {$p}lti_context
                ( context_id, context_sha256, title, key_id, created_at, updated_at ) VALUES
                ( :context_id, :context_sha256, :title, :key_id, NOW(), NOW() );";
    $PDOX->queryDie($sql, array(
        ':context_id' => $context_id,
        ':context_sha256' => lti_sha256($context_id),
        ':title' => $name,
        ':key_id' => $key_id));
    $sql = "INSERT INTO {$p}lti_link
                ( link_id, link_sha256, title, context_id, path, created_at, updated_at ) VALUES
                    ( :link_id, :link_sha256, :title, :context_id, :path, NOW(), NOW() );";

    $params = array(
        ':link_id' => $link_id,
        ':link_sha256' => lti_sha256($link_id),
        ':title' => $name,
        ':context_id' => $context_id,
        ':path' => $url
    );
    $link = $PDOX->queryDie($sql, $params);
}

if($tsugi)
{
    $PDOX = LTIX::getConnection();
    $tsugi_project_dir = $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'];
    $tsugi_dir = $xerte_toolkits_site->tsugi_dir . "mod/$tsugi_project_dir/";
    if (!file_exists($tsugi_dir)) {
        mkdir($tsugi_dir, 0777, true);
        _debug("Folder created at " . $tsugi_dir);
    }

    $zipdir = $zipfile->GetFilename();

    copy($zipdir, $tsugi_dir . "archive.zip");
    $zipArchive = new ZipArchive();
    $result = $zipArchive->open($tsugi_dir. "archive.zip");

    if ($result === TRUE) {
        $zipArchive ->extractTo($tsugi_dir);
        $zipArchive ->close();

    }else{
        _debug("Error opening zip file");
    }
}else{
    // This outputs http headers etc.
    $zipfile->download_file($row['zipname']);
}

?>
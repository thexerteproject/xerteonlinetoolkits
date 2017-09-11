<?php

require_once("../../../config.php");

global $xerte_toolkits_site;

require_once($xerte_toolkits_site->tsugi_dir . "config.php");
require_once($xerte_toolkits_site->tsugi_dir . "admin/admin_util.php");

use \Tsugi\Core\LTIX;

$template_id = $_GET["template_id"];
if(!is_numeric($template_id))
{
    _debug("Invalid id");
    exit();
}
$tsugi_publish = isset($_POST["tsugi_published"]) && $_POST["tsugi_published"] == "on";
if($tsugi_publish) {
    $title = htmlspecialchars($_POST["tsugi_title"]);
    $tsugi_key = htmlspecialchars($_POST["tsugi_key"]);
    $tsugi_secret = htmlspecialchars($_POST["tsugi_secret"]);
    $xapi_enabled = isset($_POST["tsugi_xapi"]) && $_POST["tsugi_xapi"] == "on";
    if ($xapi_enabled)
    {
        $xapi_endpoint = htmlspecialchars($_POST["tsugi_xapi_endpoint"]);
        $xapi_username = htmlspecialchars($_POST["tsugi_xapi_username"]);
        $xapi_password = htmlspecialchars($_POST["tsugi_xapi_password"]);
    }
}



$PDOX = LTIX::getConnection();
$p = $CFG->dbprefix;
_debug("Data init " . print_r($_POST, true));
$url = $xerte_toolkits_site->site_url . "lti2_launch.php?template_id=" . $template_id;
_debug("Detele " . $url);


if($tsugi_publish) {

    $key_count = $PDOX->rowDie("SELECT COUNT(*) as count FROM {$p}lti_key k, {$p}lti_context c, {$p}lti_link l WHERE k.key_key = :KEY and c.key_id = k.key_key and l.context_id=c.context_id and l.path != :URL", array(
        ':KEY' => $tsugi_key,
        ':URL' => $url
))
    ["count"];
    if($key_count > 0)
    {
        header('HTTP/1.0 403 Forbidden');
        //echo '<div class="error">Key already in use, use another key.</div>';
        alert("Key already in use, use another key.");
        exit(1);
    }
}



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
if(!$tsugi_publish)
{
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "UPDATE {$p}templatedetails SET tsugi_published = 0, tsugi_xapi_enabled = 0, tsugi_xapi_endpoint = '', tsugi_xapi_key = '', tsugi_xapi_secret = '' WHERE template_id = ?";
    db_query($sql, array($template_id));
    exit();
}

$url = $xerte_toolkits_site->site_url . "lti2_launch.php?template_id=" .$template_id;
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
    ':title' => $title,
    ':key_id' => $key_id));
$sql = "INSERT INTO {$p}lti_link
            ( link_id, link_sha256, title, context_id, path, created_at, updated_at ) VALUES
                ( :link_id, :link_sha256, :title, :context_id, :path, NOW(), NOW() );";

$params = array(
    ':link_id' => $link_id,
    ':link_sha256' => lti_sha256($link_id),
    ':title' => $title,
    ':context_id' => $context_id,
    ':path' => $url
);
$link = $PDOX->queryDie($sql, $params);
$sql = "UPDATE {$p}templatedetails SET tsugi_published = ?, tsugi_xapi_enabled = ?, tsugi_xapi_endpoint = ?, tsugi_xapi_key = ?, tsugi_xapi_secret = ? WHERE template_id = ?";
db_query($sql,
    array(
        $tsugi_publish ? "1" : "0",
        $xapi_enabled ? "1" : "0",
        $xapi_enabled ? $xapi_endpoint : "",
        $xapi_enabled ? $xapi_username : "",
        $xapi_enabled ? $xapi_password : "",
        $template_id
    )
);
_debug("Done");


?>
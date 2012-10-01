<html>
<head>
  <title>Unpublished Extensions Best Practice</title>
</head>
<body style="font-family:sans-serif; background-color: pink">
<p><b>Setting Service (unpublished spec)</b></p>
<p>This exercises the Tool Setting Service.
This service is defined in an unpublished best-practice 
document that some members used to extend LTI 1.0 (Basic).
IMS does not provide any compliance mark for this service
as it is not based on a released specification.
</p>
<?php 
// Load up the Basic LTI Support code
require_once '../util/lti_util.php';

error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", 1);
$oauth_consumer_secret = $_REQUEST['secret'];
if (strlen($oauth_consumer_secret) < 1 ) $oauth_consumer_secret = 'secret';
?>
<p>
<form method="POST">
Service URL: <input type="text" name="url" size="80" disabled="true" value="<?php echo($_REQUEST['url']);?>"/></br>
lis_result_sourcedid: <input type="text" name="id" disabled="true" size="100" value="<?php echo($_REQUEST['id']);?>"/></br>
OAuth Consumer Key: <input type="text" name="key" disabled="true" size="80" value="<?php echo($_REQUEST['key']);?>"/></br>
OAuth Consumer Secret: <input type="text" name="secret" size="80" value="<?php echo($oauth_consumer_secret);?>"/></br>
</p><p>
Settings to Send to LMS: <br/>
<textarea name="setting" cols="60" rows="10">
</textarea><br/>
<input type='submit' name='submit' value="Send Setting">
<input type='submit' name='submit' value="Delete Setting">
<input type='submit' name='submit' value="Read Setting"></br>
</form>
<?php
$url = $_REQUEST['url'];
if(!in_array($_SERVER['HTTP_HOST'],array('localhost','127.0.0.1')) && strpos($url,'localhost') > 0){ ?>
<p>
<b>Note</b> This service call may not work.  It appears as though you are
calling a service running on <b>localhost</b> from a tool that
is not running on localhost.
Because these services are server-to-server calls if you are
running your LMS on "localhost", you must also run this script
on localhost as well.  If your LMS has a real Internet
address you should be OK.  You can download a copy of the test
tools to run locally at
to test your LMS instance running on localhost.
(<a href="../lti.zip" target="_new">Download</a>)
</p>
<?php
}

if ( $_REQUEST['submit'] == "Send Setting" && isset($_REQUEST['setting'] ) ) {
    $message = 'basic-lti-savesetting';
} else if ( $_REQUEST['submit'] == "Read Setting" ) {
    $message = 'basic-lti-loadsetting';
} else if ( $_REQUEST['submit'] == "Delete Setting" ) {
    $message = 'basic-lti-deletesetting';
} else {
    exit();
}

if ( ! isset($_REQUEST['setting']) ) exit;

$url = 'http://localhost:8080/imsblis/service/';
$url = $_REQUEST['url'];

$data = array(
  'lti_message_type' => $message,
  'id' => $_REQUEST['id'],
  'setting' => $_REQUEST['setting']);

$oauth_consumer_key = $_REQUEST['key'];

$newdata = signParameters($data, $url, 'POST', $oauth_consumer_key, $oauth_consumer_secret);

$retval = do_post_request($url, http_build_query($newdata));

echo " \n";
$retval = str_replace("<","&lt;",$retval);
$retval = str_replace(">","&gt;",$retval);
echo "<pre>\n";
echo "Response from server\n";
echo $retval;

?>

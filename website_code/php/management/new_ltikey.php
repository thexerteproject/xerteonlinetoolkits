<?php


require_once("../../../config.php");

require("../user_library.php");
require("management_library.php");

if (is_user_admin()) {


  if(!isset($mysqli)) {

    $mysqli = new mysqli($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password, $xerte_toolkits_site->database_name);
    if ($mysqli->error) {
      try {
        throw new Exception("0MySQL error $mysqli->error <br> Query:<br> $query", $mysqli->errno);
      }
      catch (Exception $e) {
        echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
        echo nl2br($e->getTraceAsString());
      }
    }
  }
  if(!isset($lti)) {
    require_once('../../../LTI/ims-lti/UoN_LTI.php');
    $lti = new UoN_LTI($mysqli);
  }


$lti->add_lti_key($_REQUEST['lti_keys_name'],$_REQUEST['lti_keys_key'],$_REQUEST['lti_keys_secret'],$_REQUEST['lti_keys_context_id']);

  include('site.php');
} else {

  management_fail();

}
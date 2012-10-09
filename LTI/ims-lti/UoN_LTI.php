<?php
/**
 * Created by JetBrains PhpStorm.
 * User: cczsa1
 * Date: 25/07/12
 * Time: 09:59
 *  * Version 1.2 (2012-10-04)
 * To change this template use File | Settings | File Templates.
 */

require_once 'lti_util.php';
/**
 * Class to support LTI extends upon base LTI from IMS sample implimentation
 */
class UoN_LTI extends BLTI {

  private $db;
  /**
   * @var array|bool
   */
  private $parm = array('dbtype' => 'mysqli', 'table_prefix' => '');

  function __construct($db, $parm = false) {
    $this->db = $db;
    if (is_array($parm) or is_string($parm)) $this->parm = $parm;
  }

  /**
   * Function to get context title
   * @return lti context title
   */
  public function get_context_title() {
    $title = $this->info['context_title'];
    return $title;
  }

  /**
   * Function to initilise the lti class
   * @param bool $usesession
   * @param bool $doredirect
   * @return
   */
  public function init_lti($usesession = true, $doredirect = false) {

    if (!isset($_REQUEST["lti_message_type"])) $_REQUEST["lti_message_type"] = '';
    if (!isset($_REQUEST["lti_version"])) $_REQUEST["lti_version"] = '';
    if (!isset($_REQUEST["resource_link_id"])) $_REQUEST["resource_link_id"] = '';

    // If this request is not an LTI Launch, either
    // give up or try to retrieve the context from session
    if (!is_lti_request()) {
      if ($usesession === false) return;

      if(session_status()==PHP_SESSION_NONE) {
        session_start();
      }

      if (strlen(session_id()) > 0) {
        if (isset($_SESSION['_lti_row'])) $row = $_SESSION['_lti_row'];
        if (isset($row)) $this->row = $row;
        if (isset($_SESSION['_lti_context_id'])) $context_id = $_SESSION['_lti_context_id'];
        if (isset($context_id)) $this->context_id = $context_id;
        if (isset($_SESSION['_lti_context'])) $info = $_SESSION['_lti_context'];
        if (isset($info)) {
          $this->info = $info;
          $this->valid = true;
          return;
        }
        $this->message = "Could not find context in session";
        return;
      }
      $this->message = "Session not available";
      return;
    }

    // Insure we have a valid launch
    if (empty($_REQUEST["oauth_consumer_key"])) {
      $this->message = "Missing oauth_consumer_key in request";
      return;
    }
    $oauth_consumer_key = $_REQUEST["oauth_consumer_key"];

    // Find the secret - either form the parameter as a string or
    // look it up in a database from parameters we are given
    $secret = false;
    $row = false;
    if (is_string($this->parm)) {
      $secret = $this->parm;
    } else if (!is_array($this->parm)) {
      $this->message = "Constructor requires a secret or database information.";
      return;
    } else {
      if ($this->parm['dbtype'] == 'mysql') {
        $sql = 'SELECT * FROM ' . ($this->parm['table'] ?  $this->parm['table'] : 'lti_keys' ) . ' WHERE ' .
          ($this->parm['key_column'] ? $this->parm['key_column'] : 'oauth_consumer_key') .
          '=' .
          "'" . mysql_real_escape_string($oauth_consumer_key) . "'";
        $result = mysql_query($sql);
        $num_rows = mysql_num_rows($result);
        if ($num_rows != 1) {
          $this->message = "Your consumer is not authorized oauth_consumer_key=" . $oauth_consumer_key;
          return;
        } else {
          while ($row = mysql_fetch_assoc($result)) {
            $secret = $row[$this->parms['secret_column'] ? $this->parms['secret_column'] : 'secret'];
            $context_id = $row[$this->parms['context_column'] ? $this->parms['context_column'] : 'context_id'];
            if ($context_id) $this->context_id = $context_id;
            $this->row = $row;
            break;
          }
          if (!is_string($secret)) {
            $this->message = "Could not retrieve secret oauth_consumer_key=" . $oauth_consumer_key;
            return;
          }
        }
      }
      elseif ($this->parm['dbtype'] == 'mysqli')
      {
        if ($this->db->error) {
          try {
            throw new Exception("0MySQL error $mysqli->error <br> Query:<br> $query", $msqli->errno);
          } catch (Exception $e) {
            echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br >";
            echo nl2br($e->getTraceAsString());
          }
        }


        $stmt = $this->db->prepare("SELECT secret,context_id,name FROM " . $this->parm['table_prefix'] . "lti_keys WHERE oauth_consumer_key=? AND `deleted` IS NULL");
        $db=$this->db;
        if ($db->error) {
          try {
            throw new Exception("0MySQL error $db->error <br> Query:<br> ", $db->errno);
          } catch (Exception $e) {
            echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br >";
            echo nl2br($e->getTraceAsString());
            exit();
          }
        }
        $stmt->bind_param('s', $oauth_consumer_key);
        $stmt->execute();
        $stmt->store_result();
        $stmt->bind_result($rsecret, $rcontext_id, $rname);
        $stmt->fetch();

        $secret = $rsecret;
        $name = $rname;
        if (isset($rcontext_id)) {
          $this->context_id = $rcontext_id;
        }

        $stmt->close();
        if (!is_string($secret)) {
          $this->message = "Could not retrieve secret oauth_consumer_key=" . $oauth_consumer_key;
          return;
        }
      }
    }

    // Verify the message signature
    $store = new TrivialOAuthDataStore();
    $store->add_consumer($oauth_consumer_key, $secret);

    $server = new OAuthServer($store);

    $method = new OAuthSignatureMethod_HMAC_SHA1();
    $server->add_signature_method($method);
    $request = OAuthRequest::from_request();

    $this->basestring = $request->get_signature_base_string();

    try {
      $server->verify_request($request);
      $this->valid = true;
    } catch (Exception $e) {
      $this->message = $e->getMessage();
      return;
    }

    // Store the launch information in the session for later
    $newinfo = array();
    foreach ($_POST as $key => $value) {
      if ($key == "basiclti_submit") continue;
      if (strpos($key, "oauth_") === false) {
        $newinfo[$key] = $value;
        continue;
      }
      if ($key == "oauth_consumer_key") {
        $newinfo[$key] = $value;
        continue;
      }
    }
    $newinfo['oauth_consumer_secret']=$secret;

    $this->info = $newinfo;
    if ($usesession == true and strlen(session_id()) > 0) {
      $_SESSION['_lti_context'] = $this->info;
      unset($_SESSION['_lti_row']);
      unset($_SESSION['_lti_context_id']);
      if ($this->row) $_SESSION['_lti_row'] = $this->row;
      if ($this->context_id) $_SESSION['_lti_context_id'] = $this->context_id;
    }

    if ($this->valid && $doredirect) {
      $this->redirect();
      $this->complete = true;
    }
  }


  function get_lti_keys($deleted=false) {
    $dataret = array();
    if ($this->parm['dbtype'] == 'mysqli') {
      $db = $this->db;
      if ($db->error) {
        try {
          throw new Exception("0MySQL error $db->error <br> Query:<br> $query", $db->errno);
        } catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
          echo nl2br($e->getTraceAsString());
        }
      }
      $extra='';
      if(!$deleted) {
        $extra=' WHERE deleted IS NULL ';
      }
      $stmt = $this->db->prepare("SELECT * FROM " . $this->parm['table_prefix'] . "lti_keys $extra");
      if ($db->error) {
        try {
          throw new Exception("0MySQL error $db->error <br> Query:<br> $query", $db->errno);
        }
        catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
          echo nl2br($e->getTraceAsString());
        }
      }
      $stmt->execute();
      $stmt->store_result();
      $stmt->bind_result($lti_keys_id, $lti_keys_key, $lti_keys_secret, $lti_keys_name, $lti_keys_context_id, $lti_keys_deleted, $lti_keys_updated_on);


      $rows = $stmt->num_rows;
      while ($stmt->fetch()) {
        $dataret[$lti_keys_id]=array('lti_keys_id'=>$lti_keys_id, 'lti_keys_key'=>$lti_keys_key, 'lti_keys_secret'=>$lti_keys_secret, 'lti_keys_name'=>$lti_keys_name, 'lti_keys_context_id'=>$lti_keys_context_id, 'lti_keys_deleted'=>$lti_keys_deleted, 'lti_keys_updated_on'=>$lti_keys_updated_on);
      }

      return $dataret;
    }


  }



  /**
   * Function to update lti key
   * @param int $ltiid unique id of lti key
   * @param string $ltiname name field of lti key
   * @param string $ltikey key field of lti key
   * @param string $ltisec secret field of lti key
   * @param string optional lticontext override field of lti key
   */
  function update_lti_key($ltiid, $ltiname, $ltikey, $ltisec, $lticontext = '') {
    if ($this->parm['dbtype'] == 'mysqli') {
      $db = $this->db;
      if ($db->error) {
        try {
          throw new Exception("0MySQL error $db->error <br> Query:<br> $query", $db->errno);
        }
        catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
          echo nl2br($e->getTraceAsString());
        }
      }
      $stmt = $this->db->prepare("UPDATE " . $this->parm['table_prefix'] . "lti_keys set oauth_consumer_key=?, secret=?, context_id=? , `name`=? WHERE id=?");
      $stmt->bind_param('ssssi', $ltikey, $ltisec, $lticontext, $ltiname, $ltiid);
      $stmt->execute();
      $stmt->close();

    }


  }

  /**
   * Function to delete lti key
   * @param int $ltiid the unique id of lti key to delete
   */
  function delete_lti_key($ltiid) {
    if ($this->parm['dbtype'] == 'mysqli') {
      $db = $this->db;
      if ($db->error) {
        try {
          throw new Exception("0MySQL error $db->error <br> Query:<br> $query", $db->errno);
        }
        catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
          echo nl2br($e->getTraceAsString());
        }
      }
      //  $result = $this->db->prepare("DELETE FROM " . $this->parm['table_prefix'] . "lti_keys WHERE id=?");
      $stmt = $this->db->prepare("UPDATE " . $this->parm['table_prefix'] . "lti_keys set deleted=NOW() WHERE id=?");
      $stmt->bind_param('i', $ltiid);
      $stmt->execute();
      $stmt->close();

    }


  }


  /**
   * Function to add new lti key
   * @param string $ltiname name field of lti key
   * @param string $ltikey key field of lti key
   * @param string $ltisec secret field of lti key
   * @param string $lticontext
   * @internal param int $ltiid unique id of lti key
   * @internal param \optional $string lticontext override field of lti key
   */
  function add_lti_key($ltiname, $ltikey, $ltisec, $lticontext = '') {
    if ($this->parm['dbtype'] == 'mysqli') {
      $db = $this->db;
      if ($db->error) {
        try {
          throw new Exception("0MySQL error $db->error <br /> Query:<br /> $query", $db->errno);
        }
        catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
          echo nl2br($e->getTraceAsString());
        }
      }
      $stmt = $this->db->prepare("INSERT INTO " . $this->parm['table_prefix'] . "lti_keys (oauth_consumer_key, secret,context_id, `name`) VALUES (?, ?, ?, ?)");
      $stmt->bind_param('ssss', $ltikey, $ltisec, $lticontext, $ltiname);
      $stmt->execute();
      $stmt->close();
    }
  }

  /**
   * Function to lookup lti user association
   * @param bool|string $lti_user_key optional lti user key
   * @return false if not found else array containing the associated id and last update time
   */
  function lookup_lti_user($lti_user_key = false) {
    if ($lti_user_key === false) $lti_user_key = $this->getUserKey();
    if ($this->parm['dbtype'] == 'mysqli') {
      $stmt = $this->db->prepare("SELECT lti_user_equ, updated_on FROM " . $this->parm['table_prefix'] . "lti_user WHERE  lti_user_key=?");
      if ($this->db->error) {
        try {
          $a = $this->db->error;
          $b = $this->db->errno;
          throw new Exception("0MySQL error $a <br /> Query:<br /> $query", $b);
        }
        catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
          echo nl2br($e->getTraceAsString());
        }
      }
      $stmt->bind_param('s', $lti_user_key);
      $stmt->execute();
      $stmt->store_result();
      $rows = $stmt->num_rows;
      if ($rows < 1) {
        return false;
      }
      $stmt->bind_result($rogo_id, $updated);
      $stmt->fetch();
      $stmt->close();
    }
    return (array($rogo_id, $updated));
  }

  /**
   * Function to add lti user association
   * @param string $lti_user_equ the associated id to link to
   * @param bool|string $lti_user_key optional the lti key to lookup against
   * @return int of insert id
   */
  function add_lti_user($lti_user_equ, $lti_user_key = false) {
    if ($lti_user_key === false) $lti_user_key = $this->getUserKey();
    if ($this->parm['dbtype'] == 'mysqli') {
      $result = $this->db->prepare("INSERT INTO " . $this->parm['table_prefix'] . "lti_user (lti_user_key, lti_user_equ,updated_on) VALUES (?,?,NOW()) ");
      $result->bind_param('ss', $lti_user_key, $lti_user_equ);
      $result->execute();
      $ret = $this->db->insert_id;
      $result->close();
    }
    return $ret;
  }

  /**
   * Function to update lti user association date
   * @param bool|string $lti_user_key optional key to update
   * @return
   */
  function update_lti_user($lti_user_key = false) {
    if ($lti_user_key === false) $lti_user_key = $this->getUserKey();
    if ($this->parm['dbtype'] == 'mysqli') {
      $result = $this->db->prepare("UPDATE " . $this->parm['table_prefix'] . "lti_user set updated_on=NOW() WHERE lti_user_key=? ");
      if ($this->db->error) {
        try {
          $a = $this->db->error;
          $b = $this->db->errno;
          throw new Exception("0MySQL error $a <br /> Query:<br /> $query", $b);
        }
        catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
          echo nl2br($e->getTraceAsString());
        }
      }
      $result->bind_param('s', $lti_user_key);
      $result->execute();
      $result->close();
    }
    return;
  }

  /**
   * Function to lookup lti resource association
   * @param bool|string $lti_resource_key optional resource key
   * @return false if missing else array of the internal_id, and the internal type plus when it was updated.
   */
  function lookup_lti_resource($lti_resource_key = false) {
    if ($lti_resource_key === false) $lti_resource_key = $this->getResourceKey();
    if ($this->parm['dbtype'] == 'mysqli') {
      $stmt = $this->db->prepare("SELECT internal_id, internal_type, updated_on FROM " . $this->parm['table_prefix'] . "lti_resource WHERE lti_resource_key=?");
      $stmt->bind_param('s', $lti_resource_key);
      $stmt->execute();
      $stmt->store_result();
      $rows = $stmt->num_rows;
      if ($rows < 1) {
        return false;
      }
      $stmt->bind_result($paperret, $otherret, $updated_on);
      $stmt->fetch();
      $stmt->close();
    }
    
    return (array($paperret, $otherret, $updated_on));
  }

  /**
   * Function to add a new lti resource association
   * @param string $internal_id is the internal id
   * @param string $internal_type is the internal type
   * @param bool|string $lti_resource_key optional is the lti resource key
   * @return record id
   */
  function add_lti_resource($internal_id, $internal_type, $lti_resource_key = false) {
    if ($lti_resource_key === false) $lti_resource_key = $this->getResourceKey();
    if ($this->parm['dbtype'] == 'mysqli') {
      $result = $this->db->prepare("INSERT INTO " . $this->parm['table_prefix'] . "lti_resource (lti_resource_key, internal_id, internal_type,updated_on) VALUES (?, ?, ?, NOW()) ");
      $result->bind_param('sss', $lti_resource_key, $internal_id, $internal_type);
      $result->execute();
      $ret = $this->db->insert_id;
      $result->close();
    }
    return $ret;
  }

  /**
   * Function to update lti resource association
   * @param string $internal_id is the internal id
   * @param string $internal_type is the internal type
   * @param bool|string $lti_resource_key optional is the lti resource key
   * @return false if not found else number of rows
   */
  function update_lti_resource($internal_id, $internal_type, $lti_resource_key = false) {
    if ($lti_resource_key === false) $lti_resource_key = $this->getResourceKey();
    if ($this->parm['dbtype'] == 'mysqli') {
      $stmt = $this->db->prepare("UPDATE " . $this->parm['table_prefix'] . "lti_resource SET internal_id=?, internal_type=? WHERE lti_resource_key=?");
      $stmt->bind_param('sss', $internal_id, $internal_type, $lti_resource_key);
      $stmt->execute();
      $rows = $stmt->affected_rows;
      $stmt->close();
      if ($rows > 0) {
        return $rows;
      }
    }
    return false;
  }

  /**
   * Function to add lti context association
   * @param string $c_internal_id is the internal context id
   * @param bool|string $lti_context_key optional is the lti context key
   * @return new row id
   */
  function add_lti_context($c_internal_id, $lti_context_key = false) {
    if ($lti_context_key === false) $lti_context_key = $this->getCourseKey();
    if ($this->parm['dbtype'] == 'mysqli') {
      $result = $this->db->prepare("INSERT INTO " . $this->parm['table_prefix'] . "lti_context (lti_context_key, c_internal_id, updated_on) VALUES (?, ?, NOW()) ");
      $db=$this->db;
      if ($db->error) {
        try {
          throw new Exception("0MySQL error $db->error <br> Query:<br> ", $db->errno);
        } catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br >";
          echo nl2br($e->getTraceAsString());
          exit();
        }
      }
      $result->bind_param('ss', $lti_context_key, $c_internal_id);
      $result->execute();
      $ret = $this->db->insert_id;
      $result->close();
      //   }
    }
    return $ret;
  }


  /**
   * Function to lookup lti context
   * @param bool|string $lti_context_key optional the lti context key
   * @return array|bool if false else array with context id and last updated time
   */
  function lookup_lti_context($lti_context_key = false) {
    if ($lti_context_key === false) $lti_context_key = $this->getCourseKey();
    if ($this->parm['dbtype'] == 'mysqli') {
      $sql = "SELECT c_internal_id,updated_on FROM " . $this->parm['table_prefix'] . "lti_context WHERE lti_context_key=?";
      $stmt = $this->db->prepare($sql);
      $db=$this->db;
      if ($db->error) {
        try {
          throw new Exception("0MySQL error $db->error <br> Query:<br> ", $db->errno);
        } catch (Exception $e) {
          echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br >";
          echo nl2br($e->getTraceAsString());
          exit();
        }
      }
      $stmt->bind_param('s', $lti_context_key);
      $stmt->execute();
      $stmt->store_result();
      $rows = $stmt->num_rows;
      if ($rows < 1) {
        return false;
      }
      $stmt->bind_result($c_internal_id, $updated_on);
      $stmt->fetch();
      $stmt->close();
    }
    return (array($c_internal_id, $updated_on));
  }


  function get_consumer_secret() {
    if (isset($this->info['oauth_consumer_secret'])) {
      return $this->info['oauth_consumer_secret'];
    }
    return false;
  }

  function send_grade($grade) {

    $oauth_consumer_key = $this->getConsumerKey();
    $oauth_consumer_secret = $this->get_consumer_secret();
    $endpoint = $this->getOutcomeService();
    $sourcedid = $this->getOutcomeSourceDID();

    $response = replaceResultRequest($grade, $sourcedid, $endpoint, $oauth_consumer_key, $oauth_consumer_secret);
    return $response;
  }
}

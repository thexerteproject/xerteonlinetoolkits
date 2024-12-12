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

// RSS proxy
//
// For the RSS reader page for the xerte template
//

include 'Snoopy.class.php';
require_once(dirname(__FILE__) . "/config.php");

class SimpleXmlToObject {
    public $xml;
    public $object;

    public function __construct( $xml ) {
        $this->xml=$xml;
        $this->object = new stdClass();
        $this->object->rss = $this->recursive_parse( $this->xml );
    }
    private function recursive_parse( $data ) {
        $output = new stdClass();
        $objectmode = true;
        if (is_array($data)){
            settype($output, 'array');
            $objectmode = false;
        }
        if ($objectmode) {
            $output->attributes = array();
            foreach ($data->attributes() as $key => $value) {
                if ($key) {
                    $output->attributes[$key] = (string)$value;
                }
            }
        }
        if (is_object($data)){
            settype($data, 'array');
        }
        $index = 0;
        foreach ($data as $key => $value){
            if ($key == 'comment' || $key == '@attributes')
                unset($key);
            if (isset($key) || !$objectmode) {
                if (is_array($value) || (is_object($value) && count($value->children()) > 0)) {
                    if ($objectmode) {
                        $output->$key = $this->recursive_parse($value);
                    }
                    else {
                        $output[$index] = $this->recursive_parse($value);
                        $index++;
                    }
                } else {
                    if ($objectmode) {
                        $output->$key = (string)$value;
                    }
                    else {
                        $output[$index] = (string)$value;
                        $index++;
                    }
                }
            }
        }
        return $output;
    }
}

$snoopy = new Snoopy;


/** XXX TODO SECURITY ? Someone can fetch any arbitrary remote URL using this script. Should re require users are logged in or something ? */

// TOR 2024-07-03 - Added check on Ajax call and session key to prevent arbitrary access to this script
// Session key is not required/checked if the rss feed is using the same domain that rss_proxy.php is on
//
// So either rss_proxy.php can be called to retrieve an rss feed from the same domain, or it can be called using Ajax from the same domain

// Only allow to be called using Ajax
/* AJAX check  */
if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {

    $url = x_clean_input($_GET['rss']);
    // Check whether the domain of the rss feed is the same as the domain of the rss_proxy.php
    $rss_domain = parse_url($url, PHP_URL_HOST);
    $rss_proxy_domain = parse_url($xerte_toolkits_site->site_url, PHP_URL_HOST);
    if ($rss_domain != $rss_proxy_domain) {

        // Check sessionkey
        // The session id is sent with the request, check the session id

        if (isset($_GET['sesskey']) && isset($_SESSION) && isset($_SESSION['token'])) {
            $sesskey = x_clean_input($_GET['sesskey']);
            if (strlen($sesskey) == 0 || $sesskey != $_SESSION['token']) {
                echo "Invalid session key";
                exit;
            }
        }
        else
        {
            echo "No session key";
            exit;
        }
    }


    if (isset($xerte_toolkits_site->proxy1)) $snoopy->proxy_host1 = $xerte_toolkits_site->proxy1;
    if (isset($xerte_toolkits_site->proxy2)) $snoopy->proxy_host2 = $xerte_toolkits_site->proxy2;
    if (isset($xerte_toolkits_site->proxy3)) $snoopy->proxy_host3 = $xerte_toolkits_site->proxy3;
    if (isset($xerte_toolkits_site->proxy4)) $snoopy->proxy_host4 = $xerte_toolkits_site->proxy4;
    if (isset($xerte_toolkits_site->port1)) $snoopy->proxy_port1 = $xerte_toolkits_site->port1;
    if (isset($xerte_toolkits_site->port2)) $snoopy->proxy_port2 = $xerte_toolkits_site->port2;
    if (isset($xerte_toolkits_site->port3)) $snoopy->proxy_port3 = $xerte_toolkits_site->port3;
    if (isset($xerte_toolkits_site->port4)) $snoopy->proxy_port4 = $xerte_toolkits_site->port4;


    _debug("RSS: raw url    :" . $url);
    /// html decode the URL Step 1
    $url = urldecode($url);
    _debug("RSS: decoded url(1):" . $url);
    /// html decode the URL Step 1
    $url = htmlspecialchars_decode($url);
    _debug("RSS: decoded url(2):" . $url);
    // Replace spaces by %20
    $url = str_replace(" ", "%20", $url);
    _debug("RSS: encoded url:" . $url);
    $content = $snoopy->fetch($url);
    if ($snoopy->status != 200) {
        _debug("RSS: complete dump of return: " . print_r($snoopy, true));
    }
    _debug("RSS: raw result:" . $snoopy->results);


    //Namespace handling in simplexml is no fun....
    // Gets rid of all namespace definitions
    $xml_string = preg_replace('/xmlns[^=]*="[^"]*"/i', '', $snoopy->results);

    // Gets rid of all namespace references
    $xml_string = preg_replace('/(<\/|<)[a-zA-Z]+:([a-zA-Z0-9]+[ =>])/', '$1$2', $xml_string);

    // Make sure this is rss content
    //_debug("RSS XML: " . print_r($xml_string, true));
    $xml = simplexml_load_string($xml_string);
    if ($xml === false) {
        $xml_string = str_replace("& ", "&amp; ", $xml_string);
        $xml = simplexml_load_string($xml_string);
        if ($xml === false) {
            echo "Not valid RSS data";
            exit;
        }
    }

    // Toplevel item needs to be rss
    if (strtolower($xml->getName()) == 'rss') {
        if ($_GET['format'] == 'json') {


            $rssparse = new SimpleXmlToObject($xml, null, LIBXML_NOCDATA);
            _debug("RSS: rss object: " . print_r($rssparse, true));
            if (!is_array($rssparse->object->rss->channel->item)) {
                $rssparse->object->rss->channel->item = array($rssparse->object->rss->channel->item);
            }
            $json = json_encode($rssparse->object);
            echo $json;
        } else {
            echo $snoopy->results;
        }
    } else {
        echo "Not RSS data";
    }
}

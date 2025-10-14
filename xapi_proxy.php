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

// This script is an adaptation of ba-simple-proxy.php (See below)
// It doesn't accept an url, but retrieves the needed url from the xerte database
// Also it will add a basic auth header from the database
// To prevent unauthorized usage, the $_SESSION['XAPI_PROXY'] needs to be valid

// Script: Simple PHP Proxy: Get external HTML, JSON and more!
//
// *Version: 1.6, Last updated: 1/24/2009*
//
// Project Home - http://benalman.com/projects/php-simple-proxy/
// GitHub       - http://github.com/cowboy/php-simple-proxy/
// Source       - http://github.com/cowboy/php-simple-proxy/raw/master/ba-simple-proxy.php
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// This working example, complete with fully commented code, illustrates one way
// in which this PHP script can be used.
//
// Simple - http://benalman.com/code/projects/php-simple-proxy/examples/simple/
//
// About: Release History
//
// 1.6 - (1/24/2009) Now defaults to JSON mode, which can now be changed to
//       native mode by specifying ?mode=native. Native and JSONP modes are
//       disabled by default because of possible XSS vulnerability issues, but
//       are configurable in the PHP script along with a url validation regex.
// 1.5 - (12/27/2009) Initial release
//
// Topic: GET Parameters
//
// Certain GET (query string) parameters may be passed into ba-simple-proxy.php
// to control its behavior, this is a list of these parameters.
//
//   url - The remote URL resource to fetch. Any GET parameters to be passed
//     through to the remote URL resource must be urlencoded in this parameter.
//   mode - If mode=native, the response will be sent using the same content
//     type and headers that the remote URL resource returned. If omitted, the
//     response will be JSON (or JSONP). <Native requests> and <JSONP requests>
//     are disabled by default, see <Configuration Options> for more information.
//   callback - If specified, the response JSON will be wrapped in this named
//     function call. This parameter and <JSONP requests> are disabled by
//     default, see <Configuration Options> for more information.
//   user_agent - This value will be sent to the remote URL request as the
//     `User-Agent:` HTTP request header. If omitted, the browser user agent
//     will be passed through.
//   send_cookies - If send_cookies=1, all cookies will be forwarded through to
//     the remote URL request.
//   send_session - If send_session=1 and send_cookies=1, the SID cookie will be
//     forwarded through to the remote URL request.
//   full_headers - If a JSON request and full_headers=1, the JSON response will
//     contain detailed header information.
//   full_status - If a JSON request and full_status=1, the JSON response will
//     contain detailed cURL status information, otherwise it will just contain
//     the `http_code` property.
//
// Topic: POST Parameters
//
// All POST parameters are automatically passed through to the remote URL
// request.
//
// Topic: JSON requests
//
// This request will return the contents of the specified url in JSON format.
//
// Request:
//
// > ba-simple-proxy.php?url=http://example.com/
//
// Response:
//
// > { "contents": "<html>...</html>", "headers": {...}, "status": {...} }
//
// JSON object properties:
//
//   contents - (String) The contents of the remote URL resource.
//   headers - (Object) A hash of HTTP headers returned by the remote URL
//     resource.
//   status - (Object) A hash of status codes returned by cURL.
//
// Topic: JSONP requests
//
// This request will return the contents of the specified url in JSONP format
// (but only if $enable_jsonp is enabled in the PHP script).
//
// Request:
//
// > ba-simple-proxy.php?url=http://example.com/&callback=foo
//
// Response:
//
// > foo({ "contents": "<html>...</html>", "headers": {...}, "status": {...} })
//
// JSON object properties:
//
//   contents - (String) The contents of the remote URL resource.
//   headers - (Object) A hash of HTTP headers returned by the remote URL
//     resource.
//   status - (Object) A hash of status codes returned by cURL.
//
// Topic: Native requests
//
// This request will return the contents of the specified url in the format it
// was received in, including the same content-type and other headers (but only
// if $enable_native is enabled in the PHP script).
//
// Request:
//
// > ba-simple-proxy.php?url=http://example.com/&mode=native
//
// Response:
//
// > <html>...</html>
//
// Topic: Notes
//
// * Assumes magic_quotes_gpc = Off in php.ini
//
// Topic: Configuration Options
//
// These variables can be manually edited in the PHP file if necessary.
//
//   $enable_jsonp - Only enable <JSONP requests> if you really need to. If you
//     install this script on the same server as the page you're calling it
//     from, plain JSON will work. Defaults to false.
//   $enable_native - You can enable <Native requests>, but you should only do
//     this if you also whitelist specific URLs using $valid_url_regex, to avoid
//     possible XSS vulnerabilities. Defaults to false.
//   $valid_url_regex - This regex is matched against the url parameter to
//     ensure that it is valid. This setting only needs to be used if either
//     $enable_jsonp or $enable_native are enabled. Defaults to '/.*/' which
//     validates all URLs.
// Check whether $_GET['tsuggisession'] starts with "1"
if (isset($_GET['tsugisession']) && substr($_GET['tsugisession'], 0, 1)  == 1) {
    $tsugi_disable_xerte_session = true;
    require_once("config.php");

    $contents = "";

    // _debug("xapi_proxy: TSUGI session");
    if (file_exists($xerte_toolkits_site->tsugi_dir)) {
        require_once($xerte_toolkits_site->tsugi_dir . "/config.php");
    }
    session_start();
}
else
{
    require_once ("config.php");
    // _debug("xapi_proxy: setting xerte session");
}
require_once("website_code/php/xAPI/xAPI_library.php");

if (!function_exists('getallheaders')) {
    /**
     * Get all HTTP header key/values as an associative array for the current request.
     *
     * @return string[string] The HTTP header key/value pairs.
     */
    function getallheaders()
    {
        $headers = array();
        $copy_server = array(
            'CONTENT_TYPE'   => 'Content-Type',
            'CONTENT_LENGTH' => 'Content-Length',
            'CONTENT_MD5'    => 'Content-Md5',
        );
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) === 'HTTP_') {
                $key = substr($key, 5);
                if (!isset($copy_server[$key]) || !isset($_SERVER[$key])) {
                    $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', $key))));
                    $headers[$key] = $value;
                }
            } elseif (isset($copy_server[$key])) {
                $headers[$copy_server[$key]] = $value;
            }
        }
        if (!isset($headers['Authorization'])) {
            if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $headers['Authorization'] = x_clean_input($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
            } elseif (isset($_SERVER['PHP_AUTH_USER'])) {
                $basic_pass = isset($_SERVER['PHP_AUTH_PW']) ? x_clean_input($_SERVER['PHP_AUTH_PW']) : '';
                $headers['Authorization'] = 'Basic ' . base64_encode(x_clean_input($_SERVER['PHP_AUTH_USER']) . ':' . $basic_pass);
            } elseif (isset($_SERVER['PHP_AUTH_DIGEST'])) {
                $headers['Authorization'] = x_clean_input($_SERVER['PHP_AUTH_DIGEST']);
            }
        }
        return $headers;
    }
}

function convertToCurl($headers)
{
    $cHeaders = array();
    foreach($headers as $key => $value)
    {
        if ($key != "Authorization" && $key != "Cookie") {
            $cHeaders[] = $key . ': ' . $value;
        }
    }
    return $cHeaders;
}

_debug("xapiproxy: SESSION=" . print_r($_SESSION, true));
if (!isset($_SESSION['XAPI_PROXY']))
{
    $contents = 'ERROR: permission denied or template_id not set';
    $status = array( 'http_code' => 'ERROR' );
} else {
    if (is_array($_SESSION['XAPI_PROXY']))
    {
        $lrs = $_SESSION['XAPI_PROXY'];
        if (!isset($lrs['aggregate']))
        {
            $lrs = CheckLearningLocker($lrs, true);
            $_SESSION['XAPI_PROXY'] = $lrs;
        }
    }
    else {
        $template_id = $_SESSION['XAPI_PROXY'];
        // Get LRS endpoint and see if xAPI is enabled
        $prefix = $xerte_toolkits_site->database_table_prefix;
        $q = "select * from {$prefix}templatedetails where template_id=?";
        $params = array($template_id);

        $row = db_query_one($q, $params);
        if ($row !== false)
        {
            if ($row['tsugi_xapi_useglobal']) {
                $q = "select LRS_Endpoint, LRS_Key, LRS_Secret from {$prefix}sitedetails where site_id=1";
                $globalrow = db_query_one($q);
                $lrs = array('lrsendpoint' => $globalrow['LRS_Endpoint'],
                    'lrskey' => $globalrow['LRS_Key'],
                    'lrssecret' => $globalrow['LRS_Secret'],
                );
            }
            else {
                $lrs['lrsendpoint'] = $row['tsugi_xapi_endpoint'];
                $lrs['lrskey'] = $row['tsugi_xapi_key'];
                $lrs['lrssecret'] = $row['tsugi_xapi_secret'];
            }
            $lrs = CheckLearningLocker($lrs, true);
            $_SESSION['XAPI_PROXY'] = $lrs;
        }
        else
        {
            $lrs = false;
        }
    }
    if ($lrs === false) {

        $contents = 'ERROR: template id not found';
        $status = array('http_code' => 'ERROR');

    } else {
        $headers = getallheaders();
        // Create a copy of headers with all lowercase keys
        $lcheaders = array_change_key_case($headers);
	    _debug("xapi_proxy: headers" . print_r($headers, true));
	    _debug("xapi_proxy: lcheaders" . print_r($lcheaders, true));
        if (isset($lcheaders['x-xerte-usedb']) && $lrs['db']) {
            $usedb = true;
        }
        else {
            $usedb = false;
        }
	    _debug("xapi_proxy: Use lrsdb = " . ($usedb?'true':'false') . " (defined by x-xerte-usedb=" . (isset($lcheaders['x-xerte-usedb'])?'true':'false') . " and lrs[db]=" . ($lrs['db']?'true':'false') . ")");

        $request_uri = x_clean_input($_SERVER["REQUEST_URI"]);
        _debug("xapi_proxy: Request uri:  " . $request_uri);

        $pos = strpos($request_uri, "xapi_proxy.php");
	    // Skip the possible php session paramaters
        $slashpos = strpos($request_uri, "tsugisession=");

        if ($slashpos !== false)
        {
            $pos = $slashpos + 14;
        }
        else if ($pos !== false)
        {
            $pos += 14;
        }
        if ($pos !== false) {
            $proxy_url = substr($request_uri, 0, $pos);
            $api_call = substr($request_uri, $pos);
            $api_call = htmlspecialchars_decode($api_call);
            $pos = strpos($api_call, '?');
            if ($pos !== false) {
                $api_call_path = substr($api_call, 0, $pos+1);
            }
            else{
                $api_call_path = "?";
            }
            if ($usedb) {
                $url = $lrs['dblrsendpoint'] . $api_call;
                $lrs_key = $lrs['dblrskey'];
                $lrs_secret = $lrs['dblrssecret'];
            }
            else {
                if ($lrs['aggregate'] && strpos($api_call, "pipeline") !== false) {
                    $url = $lrs['aggregateendpoint'] . $api_call;
                } else {
                    $url = $lrs['lrsendpoint'] . $api_call;
                }
                $lrs_key = $lrs['lrskey'];
                $lrs_secret = $lrs['lrssecret'];
            }
        }


// ############################################################################
// Change these configuration options if needed, see above descriptions for info.
        $enable_jsonp = false;
        $enable_native = true;
        $force_native = true;
        $valid_url_regex = '/.*/';
// ############################################################################
        _debug("xapi_proxy: URL=" . $url);
        if (!$url) {

            // Passed url not specified.
            $contents = 'ERROR: url not specified';
            $status = array('http_code' => 'ERROR');

        } else if (!preg_match($valid_url_regex, $url)) {

            // Passed url doesn't match $valid_url_regex.
            $contents = 'ERROR: invalid url';
            $status = array('http_code' => 'ERROR');

        } else {
            $cHeader = convertToCurl($headers);

            //_debug("Headers: " . print_r($headers, true));

            $sendHeaders = array();

            $ch = curl_init($url);

            if (strtolower(x_clean_input($_SERVER['REQUEST_METHOD'])) == 'post') {

                if (count($_POST) > 0) {
                    $post = $_POST;
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
                }
                else{
                    $data = file_get_contents('php://input');
                    //$data = x_clean_input($data);
                    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

                    $sendHeaders[] = 'Content-Type: application/json';
                    $sendHeaders[] = 'Content-Length: ' . strlen($data);
                }

            }

            if (isset($_GET['send_cookies']) && x_clean_input($_GET['send_cookies'])) {
                $cookie = array();
                foreach ($_COOKIE as $key => $value) {
                    $cookie[] = x_clean_input($key) . '=' . x_clean_input($value);
                }
                if ($_GET['send_session']) {
                    $cookie[] = SID;
                }
                $cookie = implode('; ', $cookie);

                curl_setopt($ch, CURLOPT_COOKIE, $cookie);
            }

            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            curl_setopt($ch, CURLOPT_USERAGENT, isset($_GET['user_agent']) && $_GET['user_agent'] ? x_clean_input($_GET['user_agent']) : x_clean_input($_SERVER['HTTP_USER_AGENT']));
            curl_setopt($ch, CURLINFO_HEADER_OUT, true);
            //curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

            if (isset($lcheaders['x-experience-api-version']))
            {
                $sendHeaders[] = 'X-Experience-API-Version: ' . $lcheaders['x-experience-api-version'];
            }
            curl_setopt($ch, CURLOPT_HTTPHEADER, $sendHeaders);

            // Add Basic Auth
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            curl_setopt($ch, CURLOPT_USERPWD, $lrs_key . ':' . $lrs_secret);

            // Disable SSL peer verification
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $headers = array();
            // this function is called by curl for each header received
            curl_setopt($ch, CURLOPT_HEADERFUNCTION,
                function($curl, $header) use (&$headers)
                {
                    $len = strlen($header);
                    $header = explode(':', $header, 2);
                    if (count($header) < 2) // ignore invalid headers
                        return $len;

                    $headers[strtolower(trim($header[0]))][] = trim($header[1]);

                    return $len;
                }
            );

            $contents = curl_exec($ch);
            if ($contents === false)
            {
                 _debug("Error: ", curl_error($ch));
            }

            $status = curl_getinfo($ch);
            $info = curl_getinfo($ch, CURLINFO_HEADER_OUT);
            _debug("xapi_proxy: status=" . print_r($status, true));
            //_debug("xapi_proxy: info==" . print_r($info, true));
            //_debug("xapi_proxy: header=" . print_r($header, true));
            //_debug("xapi_proxy: contents=" . print_r($contents, true));

            if(isset($status['http_code'])){
                http_response_code($status['http_code']);
            }

            // Rebuild xapi_proxy.php path in "more", if "more" is present
            $pos = strpos($contents, "\"more\"");
            if ($pos !== false)
            {
                // Find $api_call_path
                $path_pos = strpos($contents, $api_call_path, $pos);
                if ($path_pos !== false) {
                    $first_quote = strpos($contents, "\"", $pos + 6);
                    // Replace
                    $contents = substr($contents, 0, $first_quote + 1) . $proxy_url . substr($contents, $path_pos);
                }
            }
            curl_close($ch);
        }
    }
}
// Split header text into an array.
$header_text = array();
if (isset($header))
{
    $header_text = preg_split( '/[\r\n]+/', $header );
}
if ( (isset($_GET['mode'] ) && $_GET['mode'] == 'native') || (isset($force_native) && $force_native)) {
    if ( !$enable_native ) {
        $contents = 'ERROR: invalid mode';
        $status = array( 'http_code' => 'ERROR' );
    }

    // Propagate headers to response.
    foreach ( $header_text as $header ) {
        if ( preg_match( '/^(?:Content-Type|Content-Language|Set-Cookie):/i', $header ) ) {
            header( $header );
        }
    }

    // TOR 2025-02-03: There is a bug in the javascript JSON.parse function that does not handle escaped " characters
    // inside a nested escaped string (as can happen with the trackingstate field in xAPI statements).
    // So, replace \\\" with ' in the JSON string
    // This is a workaround until the bug is fixed in the JSON.parse function.
    // We could also consider to base64 encode the trackingstate in the xAPI statement

    // This workaround can FAIL if the string contains a ' character
    $contents = str_replace("\\\\\\\"", "'", $contents);
    print $contents;

} else {

    // $data will be serialized into JSON data.
    $data = array();

    // Propagate all HTTP headers into the JSON data object.
    if (isset($_GET['full_headers']) && $_GET['full_headers']) {
        $data['headers'] = array();

        foreach ( $header_text as $header ) {
            preg_match( '/^(.+?):\s+(.*)$/', $header, $matches );
            if ( $matches ) {
                $data['headers'][ $matches[1] ] = $matches[2];
            }
        }
    }

    // Propagate all cURL request / response info to the JSON data object.
    if (isset($_GET['full_status']) && $_GET['full_status'] ) {
        $data['status'] = $status;
    } else {
        $data['status'] = array();
        $data['status']['http_code'] = $status['http_code'];
    }

    // Set the JSON data object contents, decoding it from JSON if possible.
    $decoded_json = json_decode( $contents );
    $data['contents'] = $decoded_json ? $decoded_json : $contents;

    // Generate appropriate content-type header.
    $is_xhr = false;
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
        $is_xhr = strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }
    header( 'Content-type: application/' . ( $is_xhr ? 'json' : 'x-javascript' ) );

    // Get JSONP callback.
    $jsonp_callback = isset($enable_jsonp) && $enable_jsonp && isset($_GET['callback']) ? x_clean_input($_GET['callback']) : null;

    // Generate JSON/JSONP string
    $json = json_encode( $data );

    print $jsonp_callback ? "$jsonp_callback($json)" : $json;

}




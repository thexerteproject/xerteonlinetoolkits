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
 
/**
 * @see modules/site/engine/upload.php
 */

/**
 * Wordpress filter (see add_filter), designed to hook in on the action/event 'TODO'.
 *
 * Check that a file is free of viruses.
 * Return FALSE if it fails AV checking.
 * @param string $filename (as in $_FILES['xxx']['tmp_name'])
 * @return string filename (as in $_FILES['xxx']['tmp_name']) or boolean false if we can't upload it.
 */

require_once(dirname(__FILE__) . '/../config.php');

function lti_info_callback($name, $xerte_id, $url) {
    global $xerte_toolkits_site;

    if (isset($_SESSION['content_item_return_url']) && $_SESSION['content_item_return_url'] !== ""){
        $content_item_return_url = $_SESSION['content_item_return_url'];
    } else {
        return False;
    }

    if ($xerte_toolkits_site->edlib_key_name === "") {
        return False;
    }


    $name = str_replace('_', ' ', $name);
    //todo get langiage nld/nld-fl/eng?
    //add icon?
    //licence stuff?

    $contentItem = [
        '@context' => ['http://purl.imsglobal.org/ctx/lti/v1/ContentItem'],
        '@graph' => [
            [
                '@type' => 'LtiLinkItem',
                "mediaType" => "application/vnd.ims.lti.v1.ltilink",
                'title' => $name,
                'url' => $url . "lti_index.php?template_id=" . $xerte_id,
                'icon' => null,
                'languageIso639_3' => "nld",
                'license' => "CC-BY",
                'published' => true,
                'shared' => false,
                'tag' => "Xerte"
            ]
        ]
    ];

    $contentItemsJson = json_encode($contentItem, JSON_UNESCAPED_SLASHES);

    $qry = "SELECT key_key,secret FROM {$xerte_toolkits_site->database_table_prefix}tsugi_lti_key WHERE key_title = '" . $xerte_toolkits_site->edlib_key_name . "'";
    $result = db_query_one($qry);

    if ($result === false) {
        exit();
    }
    $consumerKey = $result['key_key'];
    $consumerSecret = $result['secret'];

    $params = [
        'lti_message_type' => 'ContentItemSelection',
        'lti_version'      => 'LTI-1p0',
        'content_items'    => $contentItemsJson,
        'oauth_consumer_key'     => $consumerKey,
        'oauth_version'          => '1.0',
        'oauth_nonce'            => bin2hex(random_bytes(16)),
        'oauth_timestamp'        => time(),
        'oauth_signature_method' => 'HMAC-SHA1',
    ];

    // 3. Create the signature base string (params sorted alphabetically)
    $encodedParams = [];
    foreach ($params as $key => $value) {
        $encodedParams[rawurlencode($key)] = rawurlencode($value);
    }
    ksort($encodedParams);
    $paramString = [];
    foreach ($encodedParams as $k => $v) {
        $paramString[] = $k . '=' . $v;
    }
    $paramString = implode('&', $paramString);

    $baseString = 'POST&' . rawurlencode($content_item_return_url) . '&' . rawurlencode($paramString);

    // 4. Sign
    $signingKey = rawurlencode($consumerSecret) . '&';
    $signature = base64_encode(hash_hmac('sha1', $baseString, $signingKey, true));
    $params['oauth_signature'] = $signature;

    // 5. Output auto-submitting form
    echo '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Returning to LMS</title>
  </head>
  <body>
    <form action="' . htmlspecialchars($content_item_return_url) . '" method="POST" id="lti_return" target="_top">';

    foreach ($params as $key => $value) {
        echo '<input type="hidden" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($value) . '" />' . PHP_EOL;
    }

    echo '  </form>
    <script>
      document.getElementById("lti_return").submit();
    </script>
    <noscript>
      <button type="submit" form="lti_return">Return to LMS</button>
    </noscript>
  </body>
</html>';

    return true;
}


//add check ?
add_filter('lti_callback', 'lti_info_callback', 10, 3);


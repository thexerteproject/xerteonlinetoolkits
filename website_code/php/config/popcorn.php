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

function popcorn_config($template_common_path, $version, $include_path="") {

    // Check popcorn mediasite and peertube config files
    $popcorn_config = "";
    $mediasite_config_js = $template_common_path . "js/popcorn/config/mediasite_urls.js";
    if (file_exists($mediasite_config_js))
    {
        if ($include_path != "")
        {
            $mediasite_config_js = $include_path . "js/popcorn/config/mediasite_urls.js";
        }
        $popcorn_config .= "<script type=\"text/javascript\" src=\"$mediasite_config_js?version=" . $version . "\"></script>\n";
    }
    $peertube_config_js = $template_common_path . "js/popcorn/config/peertube_urls.js";
    if (file_exists($peertube_config_js))
    {
        if ($include_path != "")
        {
            $peertube_config_js = $include_path . "js/popcorn/config/peertube_urls.js";
        }
        $popcorn_config .= "<script type=\"text/javascript\" src=\"$peertube_config_js?version=" . $version . "\"></script>\n";
    }

    return $popcorn_config;
}
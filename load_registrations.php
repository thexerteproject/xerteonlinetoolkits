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
 *
 * data page, allows other sites to consume the xml of a toolkit
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */
$tsugi_disable_xerte_session = true;
require_once(dirname(__FILE__) . "/config.php");

require_once(dirname(__FILE__) . "/website_code/php/template_library.php");
require_once(dirname(__FILE__) . "/website_code/php/user_library.php");

_load_language_file('/load_registrations.inc');

// Retrieve all projects from templatedetails and put them in tsugi_lti_external
// Only do this if LTI is enabled in this installation
// Enter an lti_launch.php entry for each project that has lti enabled
// Enter an additional dashboard.php entry for each project that has also xAPI enabled
function loadRegistrations()
{
    global $xerte_toolkits_site;

    if (file_exists($xerte_toolkits_site->tsugi_dir)) {
        $prefix = $xerte_toolkits_site->database_table_prefix;
        $site_url = $xerte_toolkits_site->site_url;

        $sql = "SELECT td.*, ld.username as creator_user_name, otd.template_name as template_type_name FROM {$prefix}templatedetails td, {$prefix}logindetails ld, {$prefix}originaltemplatesdetails otd WHERE td.tsugi_published = 1 and ld.login_id = td.creator_id and td.template_type_id = otd.template_type_id";
        $templates = db_query($sql);
        $tools = array();
        if ($templates !== false) {
            foreach ($templates as $template) {
                if ($template['tsugi_publish_in_store'] == 1 || ($template['tsugi_xapi_enabled'] && $template['tsugi_publish_dashboard_in_store'] == 1)) {
                    // Get all the details of a template
                    $metadata = get_meta_data($template['template_id'], $template['template_name'], $template['creator_user_name'], $template['template_type_name']);
                    if ($metadata === false) {
                        continue;
                    }
                    // Create the External Tool definition
                    $tool = array();
                    $tool['url'] = $site_url . "lti13_launch.php?template_id=" . $template['template_id'];
                    $tool['name'] = $metadata->name;
                    $tool['short_name'] = $metadata->name;
                    $tool['description'] = $template['template_id'] . ":\n";

                    if (isset($metadata->description) && $metadata->description != "") {
                        $tool['description'] .= $metadata->description;
                    } else {
                        $tool['description'] .= $tool['name'];
                    }
                    if (isset($metadata->course) && $metadata->course != "") {
                        $tool['description'] .= ",\n " . LTI_DEEPLINK_COURSE . $metadata->course;
                    }
                    if (isset($metadata->author)) {
                        $tool['description'] .= ",\n " . LTI_DEEPLINK_AUTHORS . $metadata->author;
                    }
                    $tool['FontAwesome'] = "fa-graduation-cap";
                    if (isset($metadata->thumbnail)) {
                        $tool['screenshots'] = array($metadata->thumbnail);
                    }

                    if ($template['tsugi_publish_in_store'] == 1) {
                        // Create entry for the tool
                        $tools["id_" . $template["template_id"]] = $tool;
                    }

                    // Create the dashboard entry
                    if ($template['tsugi_xapi_enabled'] && $template['tsugi_publish_dashboard_in_store'] == 1) {
                        $dtool = array();
                        $dtool['url'] = $site_url . "tools/dashboard/index.php?template_id=" . $template['template_id'];
                        $name = str_replace("{0}", $metadata->name, LTI_DEEPLINK_DASHBOARD_PREFIX);
                        $dtool['name'] = $name;
                        $short_name = str_replace("{0}", $tool['short_name'], LTI_DEEPLINK_DASHBOARD_PREFIX);
                        $dtool['short_name'] = $short_name;
                        $description = str_replace("{0}", $tool['description'], LTI_DEEPLINK_DASHBOARD_PREFIX);
                        $dtool['description'] = $description;
                        $dtool['FontAwesome'] = "fa-chart-bar";
                        $tools["id_" . $template["template_id"] . "_db"] = $dtool;
                    }
                }
            }
            $others = findAllRegistrationsInternal();
            $tools = array_merge($tools, $others);


            return $tools;
        }
    }
}

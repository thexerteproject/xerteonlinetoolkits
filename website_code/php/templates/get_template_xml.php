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

require_once("../../../config.php");
require_once(dirname(__FILE__) . "/../services/TemplatePreviewXmlService.php");

// Check that xml file is stored beneath root of project
// be VERY paranoid over the path the user is requesting to download.
// Even if the file starts with a correct pattern (old implementation) the user could travers path
// like 542-tom-Notingham/../database.php or like 542-tom-Notingham/../../../../etc/passwd
$unsafe_file_path = x_clean_input($_GET['file']);

$result = template_preview_xml_load($unsafe_file_path);
if (!$result['ok']) {
    echo $result['message'] === 'Not found' ? 'Not found!' : $result['message'];
    exit;
}
echo $result['xml'];

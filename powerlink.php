<?PHP 

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
 
echo "The post array is <br>";

print_r($_POST);

echo "<br>The get array is <br>";

print_r($_GET);

echo "<br><br>";

echo "<a href=\"https://webctdev.nottingham.ac.uk/webct/urw/sslogin2.sn" . $_GET['sectionsource'] . ".si" . $_GET['sourcedid_id'] . "/cobaltMainFrame.dowebct?appforward=/webct/viewMyWebCT.dowebct&proxyToolCallbackGUID=" . $_GET['proxyToolCallbackGUID'] . "&ac_userid=" . $_GET['username'] . "&weblink_url=http://ltdev.nottingham.ac.uk/version1/play_1\">Click me</a>";


?>
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
echo file_get_contents("page_top");



?>
<h2 style="margin-top:15px">
Toolkits testing page
</h2>
<h4>Root file path testing</h4>
<p>Test to see whether the install set all variables ok, the box below should have the root file path you specified. It is empty you'll need to use the management function (<a href="../management.php" target="_blank">management.php</a>) to set it.</p>
<p style="height:20px; width:700px; border:2px solid black; padding:10px;">
<?PHP

	require("../config.php");

	echo $xerte_toolkits_site->root_file_path;

?>
</p>
<h4>Mimetype testing</h4>
<p>Test to see whether the RLO, RLT and RLM mimetypes will work from your server</p>
<a target="_blank" href="xertecbeck.html">Run mimetype test</a>
<p>Three green dots means everything should work ok</p>
<h4>FLV testing</h4>
<p>Test to see whether the FLV mimetypes will work from your server</p>
<a target="_blank" href="video_pod_finished.html">Run mimetype test</a>
<p>You should see the video playing</p>
<h4>LDAP testing</h4>
<p>Test to see whether your LDAP has been setup OK</p>
<form action="ldap_test.php" target="_blank" method="POST">
Username <input type="text" name="username" /><br/>
Password <input type="password" name="password" /><br/>
<input type="submit" value="Try logging in" />
</form>

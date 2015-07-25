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
Welcome to the Xerte Online Toolkits Installer
</h2>
<?PHP

	if(file_exists("../database.php")){

		die("<p>You appear to have already installed toolkits</p><p>Please go to <a href='http://" . $_SERVER['HTTP_HOST'] . str_replace("setup/", "", $_SERVER['PHP_SELF']) . "'>Xerte Online Toolkits Install</a></p>");

	}

?>
<p>
Xerte Online Toolkits is a suite of web based tools designed and developed by a wonderful community of <a href="http://www.xerte.org.uk" target="_blank">open source developers.</a></p>
<p>Xerte Online Toolkits is a powerful suite of browser-based tools that allow anyone with a web browser to log on and create interactive learning materials simply and effectively, and to collaborate with other users in developing content. Xerte Online Toolkits provides a number of project templates for creating online presentations and interactive content. Content is assembled using an intuitive interface, and multiple users can collaborate on shared projects. Xerte Toolkits is free software, released under the GNU Public License apart from three files:
</p>
<p>
<p>
	<form action="xampp.php"><button type="submit">Press here for XAMPP People</button></form>
</p>
<p>
	<form action="config_setup.php"><button type="submit">Press here for a full install</button></form>
</p>
<p><b>Please note:</b> If you install locally and use XAMPP it may not run if you are using Skype. Please disable Skype if you intend to use XAMPP locally.</p>
</body>
</html>

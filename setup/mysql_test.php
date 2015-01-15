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
Xerte Online Toolkits MySQL checks
</h2>
<p>
<ol>
<li>A MYSQL Install (Xerte Online Toolkits was developed on ver 14.12 Distrib 5.05.51a for Win32. We haven't tested this with other versions, or on other database systems)</li>
<li><b>The PHP "MySQL" Settings</b> - Please see <a href="http://uk3.php.net/manual/en/mysql.installation.php">PHP's own guide</a> for more details. Xampp installs should come with MySQL installed. Different versions of PHP however may or may not have MySQL installed by default. If on the PHP Info page you can find a section headed  "MySQL", then you should find it is installed.</li>
</ol>	
</p>
<p>
You will need
<ol>
<li><b>A User account</b> - with select, insert, update and delete priviledges.</li>
<li><b>An Admin account</b> - which can create the database, AND / OR create tables in a database.</li>
<li><b>A database</b> - This can be a new one which is created, or an existing one into which Toolkits can be installed .</li>
</ol>
</p>
<iframe width="900" height="300" src="iframe_mysql.php"></iframe><br>
	If no errors are listed above, please start the <a href="page1.php">installation process</a>.
</body>
</html>

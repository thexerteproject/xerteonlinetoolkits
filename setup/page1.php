<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
require_once('page_header.php'); ?>

<?php if ( extension_loaded('pdo')  && extension_loaded('pdo_mysql') ): ?>

		<h2>MySQL Database Creation page</h2>
		
		<p>The installer will now try to create a database for Xerte Online Toolkits to use.</p>

		<h3>Note to Xampp Users</h3>

		<p>The default database host for Xampp is <kbd>localhost</kbd>, the master MySQL user name is <kbd>root</kbd> and <strong>no password is set</strong> (i.e it is empty). If you have not changed those settings you can skip to the end of this page and click next. The installer will create a database for you called <kbd>toolkits_data</kbd>.</p> 

		<form action="page2.php" method="post" enctype="multipart/form-data"  
			onSubmit="javascript:
                if (document.getElementById('host').value == ''
                		|| document.getElementById('username').value == '') {
                    alert('Please enter a Database Host AND Username');
                    return false;
                }
                return true;">

		<div class="form_field">
			<label>Database Host</label>
			<input type="text" size="100" name="host" id="host" value="<?php if ( isset($_POST['host']) ) { echo $_POST['host']; } else { echo 'localhost'; }?>" />
			<span class="form_help">Enter the name of the host for the database.</span>
		</div>

		<div class="form_field">
			<label>Database Username</label>
			<input type="text" size="100" name="username"  id="username" value="<?php if ( isset($_POST['username']) ) { echo $_POST['username'];} else { echo 'root'; } ?>" />
			<span class="form_help">Enter the username for a MySQL account that has Create and Insert rights on this host from this location.</span>
		</div>

		<div class="form_field">
			<label>Database Name</label>
			<input type="text" size="100" name="database_name" value="<?php if ( isset($_POST['database_name']) ) { echo $_POST['database_name']; } else { echo 'toolkits_data'; } ?>" placeholder="" />
			<span class="form_help">Enter the name of the database if it already exists, or enter the name for a new database that you would like to be created by the installer.</span>
		</div>

		<div class="form_field">
			<label>Database Password</label>
			<input type="password" size="100" name="password" value="<?php if ( isset($_POST['password']) ) { echo $_POST['password']; }?>" />
			<span class="form_help">Enter the MySQL password for the MySQL username used above.</span>
		</div>

		<div class="form_field">
			<label>Database Prefix</label>
			<input type="text" size="100" name="database_prefix" value="<?php if ( isset($_POST['database_prefix']) ) { echo $_POST['database_prefix']; }?>" />
			<span class="form_help">Optional - If you would like to prefix the tables installed with a word (to help house keeping), enter that word here.</span>
		</div>

		<div class="form_field">
			<button type="submit">Next &raquo;</button>
		</div>
		</form>

<?php else: ?>

	<p>Sorry your PHP install lacks the extension PDO, and without these this installer cannot create the database.</p>
	die();

<?php endif; ?>

<?php require_once('page_footer.php'); ?>
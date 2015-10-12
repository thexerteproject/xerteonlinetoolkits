<?PHP 
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
require_once('page_header.php'); 

if ( file_exists( '../database.php' ) ):

    require_once('software_installed.php');

else: ?>

			<h2>About</h2>

			<p>Xerte Online Toolkits is a suite of web based tools which have been designed, and continue to be developed, by a wonderful community of <a href="http://www.xerte.org.uk" target="_blank">open source developers.</a> The suite enables users to log on and create interactive learning materials simply and effectively using a web browser.</p>

			<p>A number of project templates are provided for creating online presentations and interactive content which can be assembled using an intuitive interface. The suite also enables multiple users to collaborate on shared projects.</p>

			<h3>License</h3>

			<p>Xerte Online Toolkits is free software, released under the <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" title="Apache License v2.0">Apache License v2.0</a>.</p>

			<h2>Notes</h2>

			<ul>
	    	<li>Xerte Online Toolkits supports multiple authentication types (Database, Moodle, LDAP or a Static list). </li>
				
				<li>Although not critical, Xerte Online Toolkits uses PHP mail functions for parts of its code. You can remove these manually from the code should you so wish.</li>

	    	<li>At present, with files positioned as they are:
	    		<ul>
	    			<li>your system will be installed at <code><?php echo $xot_setup->getRootPath(); ?></code></li>
	    			<li>the web address for your system will be: <code><?php echo $xot_setup->getXotUrl(); ?></code></li>
	    		</ul>
	    	</li>

				<li><strong>Please note:</strong> If you install locally and use XAMPP, the software may not run if you are using Skype. Please disable Skype if you intend to use XAMPP locally.</li>
    	</ul>

			<h2>Begin Installation</h2>

    	<p>The next pages will help you verify and solve system issues. You will not be able to continue until all requirements are fulfilled.</p>

			<a href="requirements.php"><button>Press here to install</button></a>

<?php require_once('page_footer.php'); ?>

<?php endif; ?>
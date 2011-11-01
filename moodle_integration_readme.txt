moodle patch for Xerte toolkits updated for use with 1.7+
updated 1/11/11
Author: Ron Mitchell
Use at your own risk - no responsibility accepted etc etc

This patch has been tested with the latest versions of XOT and enables authentication integration with the moodle installation on the same server. Specifically it enables integration with the moodle authentication system allowing seamless login from moodle to toolkits. This is achieved by using the moodle session data so at the moment this will not work if moodle and toolkits are installed on separate servers. 

/////////////////////////////////////////////////////
How this works
Once applied and configured this patch works in the following ways:

1. A user logs in to moodle and then follows a link from that moodle to an installation of toolkits on the same server. The user is automatically logged in to their own workspace in toolkits seeing any previous LO's they have created. If this is their first visit to the toolkits installation their firstname, lastname and username are added to the xerte toolkits database. (This then also allows other users to share learning objects with the new toolkits user via properties > shared settings or to give learning objects via properties > give this project ) This also means that any existing moodle user, or new users registering on moodle, also has access to the linked toolkits installation.

2. A user visits the toolkits installation without first logging in to moodle. They are automatically redirected to login to moodle. 

If the toolkits installation is installed as a subdirectory of the moodle directory the user is then automatically redirected back to their own workspace in toolkits. 

If the toolkits installation is installed in a separate directory to the moodle directory the user will not be automatically directed back to toolkits but can follow a link to toolkits from the moodle installation or revisit the toolkits url with the same browser to be automatically logged in.

/////////////////////////////////////////////////////
Installation
Please follow these steps carefully.

Step 1. 
Test your XOT installation before trying to use the moodle integration e.g. install toolkits and use demo.txt or switch.txt to make sure everything is working - creating, viewing, exporting an LO etc

Step 2. Although there are minimal changes to the files included in this patch and no changes to the xerte toolkits database, as always you should still backup your original files and database first.
Specifically backup or keep a copy of the following toolkits files:
index.php
config.php
or simply rename these to backup_index.php and backup_config.php or something similar.

Step 3. Edit moodle_integration.txt and moodle_config.txt and add the path to your moodle config file so that it points to the config.php in your moodle directory
This needs to be the path from root rather than something like ../../moodle/config.php
e.g. this might be something like the following: 
require("/home/youraccountname/public_html/config.php");
For a xampp/maxos install this should be something like: 
require("/xampp/htdocs/moodle/config.php");

Step 4 rename moodle_integration.txt to index.php and moodle_config.txt to config.php

Step 5. view http://yourmoodle/yourxot/index.php and ensure everything still works. You should be forced to login to Moodle and then returned back to XOT if installed inside the moodle directory. (see how this works above)

Step 6. If everything is working rename or remove demo.php or switch.php used in step 1

/////////////////////////////////////////////////////
After installation/configuration
You can verify you have configured the moodle path correctly by visiting your toolkits installation which should redirect you to login to moodle. (see the 'how this works' info above)

Notes: 

index.php in this patch replaces the original ldap enabled index.php. To restore ldap access replace index.php with your original index.php

/////////////////////////////////////////////////////

Bugs/feedback
Please send reports of bugs, success or any other feedback to the Xerte mailing list: xerte@lists.nottingham.ac.uk
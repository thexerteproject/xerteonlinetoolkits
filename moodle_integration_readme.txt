moodle authentication integration for Xerte toolkits updated for use with 1.8+
updated May 2012

This method of authentication integration has been tested with XOT 1.8 and enables authentication integration with the moodle installation on the same server. Specifically it enables integration with the moodle authentication system allowing seamless login from moodle to toolkits. This is achieved by using the moodle session data so at the moment this will not work if moodle and toolkits are installed on separate servers. 

Note: this latest integration will only work with XOT 1.8 and above and is not backwards compatible with previous XOT versions. It should however work with any version of Moodle e.g. 1.9x as well as 2.x.

/////////////////////////////////////////////////////
How this works
Once applied and configured this patch works in the following ways:

1. A user logs in to moodle and then follows a link from that moodle to an installation of toolkits on the same server. The user is automatically logged in to their own workspace in toolkits seeing any previous LO's they have created. If this is their first visit to the toolkits installation their firstname, lastname and username are added to the xerte toolkits database. (This then also allows other users to share learning objects with the new toolkits user via properties > shared settings or to give learning objects via properties > give this project ) This also means that any existing moodle user, or new users registering on moodle, also has access to the linked toolkits installation.

2. A user visits the toolkits installation without first logging in to moodle. They are automatically redirected to login to moodle. 

If the toolkits installation is installed as a subdirectory of the moodle directory the user is then automatically redirected back to their own workspace in toolkits. 

If the toolkits installation is installed in a separate directory to the moodle directory the user will not be automatically directed back to toolkits but can follow a link to toolkits from the moodle installation or revisit the toolkits url with the same browser to be automatically logged in.

/////////////////////////////////////////////////////
Installation/Configuration
Please follow these steps carefully.

Step 1. 
Test your XOT installation before trying to use the moodle integration e.g. install toolkits and use the guest authentication to make sure everything is working - creating, viewing, exporting an LO etc

Note: the different authentication options are enabled/disabled at the bottom of auth_config.php e.g. uncomment //$xerte_toolkits_site->authentication_method = 'Guest'; to test with guest authentication.

Step 2. 
Either by using the management page or by editing sitedetails in the database add the path to your moodle installation to the integration config path field
e.g. this might be something like the following: 
require("/home/youraccountname/public_html/config.php");
For a xampp/maxos install this should be something like: 
require("/xampp/htdocs/moodle/config.php");

Step 3.
In the XOT auth_config.php comment out //$xerte_toolkits_site->authentication_method = 'Guest'; and uncomment //$xerte_toolkits_site->authentication_method = 'Moodle';

Step 4.
View http://yourmoodle/yourxot/ and ensure everything still works. You should be forced to login to Moodle and then returned back to XOT if installed inside the moodle directory. (see how this works above)

Step 5 (optional): If you wish to restrict authoring access to XOT e.g. not allow all moodle users to author you can easily do so by creating a custom profile field in moodle - see the commented our code at the bottom of auth_config.php


/////////////////////////////////////////////////////
After installation/configuration
You can verify you have configured the moodle path correctly by visiting your toolkits installation which should redirect you to login to moodle. (see the 'how this works' info above)

/////////////////////////////////////////////////////

Bugs/feedback
Please send reports of bugs, success or any other feedback to the Xerte mailing list: xerte@lists.nottingham.ac.uk
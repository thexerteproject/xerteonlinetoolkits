Xerte Online Toolkits
=====================

Latest release : v3.2 (released on April 11, 2016)

Installation Instructions (Stable release, .zip)
------------------------------------------------


Here's a quick guide to installing toolkits on your local computer:

 1. Download and install XAMPP from http://www.apachefriends.org/download.php?xampp-win32-1.7.0-installer.exe accepting the default settings;
 2. Download Xerte Online Toolkits from http://www.nottingham.ac.uk/xerte/downloads/xertetoolkits.zip
 3. Unzip the folder 'xertetoolkits' to c:\xampp\htdocs\, giving you c:\xampp\htdocs\xertetoolkits
 4. Start Apache and MySQL in XAMPP control panel
 5. Visit http://localhost/xertetoolkits/setup
 6. Click the XAMPP button.

There's a quick capture of the process here:

http://www.nottingham.ac.uk/xerte/manual/installingToolkits.swf


Server administrators should choose the 'full install' option and step through the wizard. When copying the files to a server, you can use the setup utility at http://yourserver.com/yourtololkitsfolder/setup


Installation Instructions (unstable release, github)
--------------------------------------------------

```
cd /path/to/apache/document/root
git clone https://github.com/thexerteproject/xerteonlinetoolkits.git .
```

Requires :

 1. PHP v5.1.2+ with either sqlite or mysql extensions available.
 2. Apache or some other web server that is setup to execute PHP.
 3. Write permission to USER-FILES

Optional additions :

 1. ClamAV - if /usr/bin/clamscan exists, uploads will be checked for viruses. Requires appropriate AV definitions are in place.
 2. XML parsing - if PHP has the 'xml' module installed, then we'll validate the Learning Object's XML before saving on the server.
 3. Transcoding support for video files - see/read cron/transcoding.php - when run it will attempt to convert .flv files to .mp4 files to improve template viewing on Adobe-flash-free devices.


If you do not go through /setup (and stick with using Sqlite) then the Sqlite database will be somewhere in /tmp. 
Edit config.php to change this.

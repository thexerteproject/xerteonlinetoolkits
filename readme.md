Xerte Online Toolkits
=====================

Latest release : v3.13 (released on October 31, 2024)

Installation Instructions (Stable release, .zip)
------------------------------------------------


Here's a quick guide to installing toolkits on your local computer:

 1. Download and install XAMPP from http://www.apachefriends.org accepting the default settings;
 2. Download Xerte Online Toolkits from http://xerte.org.uk
 3. Unzip the folder 'xertetoolkits' to c:\xampp\htdocs\, giving you c:\xampp\htdocs\xertetoolkits
 4. Start Apache and MySQL in XAMPP control panel
 5. Visit http://localhost/xertetoolkits/setup
 6. Follow the steps through the setup wizard

Installation Instructions (unstable release, github)
--------------------------------------------------

```
cd /path/to/apache/document/root
git clone https://github.com/thexerteproject/xerteonlinetoolkits.git .
```

Requires :

 1. PHP v7.x with either mysql, xml, curl, mbstring and zip extensions available.
 2. Apache or some other web server that is setup to execute PHP.
 3. Write permission to USER-FILES

Optional additions :

 1. ClamAV - if /usr/bin/clamscan exists, uploads will be checked for viruses. Requires appropriate AV definitions are in place.
 2. XML parsing - if PHP has the 'xml' module installed, then we'll validate the Learning Object's XML before saving on the server.
 3. Transcoding support for video files - see/read cron/transcoding.php - when run it will attempt to convert .flv files to .mp4 files to improve template viewing on Adobe-flash-free devices.


For full installation instructions please see the documentation/ToolkitsInstallationGuide.pdf
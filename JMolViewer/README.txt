If you want to install support for JMOL:

1. Backup the file \modules\xerte\parent_templates\Nottingham\wizards\en-GB\data.xwd. You will rebuild this file in step 4.

2. Download and unzip JMolViewer.zip from the downloads section at http://xerte.org.uk and unzip it directly into this folder.

3. Enable support for JMOL: edit \src\Nottingham\wizards\en-GB\jmol.xwd and remove the parameter deprecated="We cannot redistribute GPL components. You must install JMOL manually. See instructions in the JMOL folder" from line 9. 

4. Goto /build and run rebuildNottingham.bat (Windows) or rebuildNottingham.sh (Mac / Linux)

5. Users should now be able to add new JMOL page types from the media menu.
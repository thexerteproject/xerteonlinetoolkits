<?PHP echo file_get_contents("page_top");



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

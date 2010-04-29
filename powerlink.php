<?PHP echo "The post array is <br>";

print_r($_POST);

echo "<br>The get array is <br>";

print_r($_GET);

echo "<br><br>";

echo "<a href=\"https://webctdev.nottingham.ac.uk/webct/urw/sslogin2.sn" . $_GET['sectionsource'] . ".si" . $_GET['sourcedid_id'] . "/cobaltMainFrame.dowebct?appforward=/webct/viewMyWebCT.dowebct&proxyToolCallbackGUID=" . $_GET['proxyToolCallbackGUID'] . "&ac_userid=" . $_GET['username'] . "&weblink_url=http://ltdev.nottingham.ac.uk/version1/play_1\">Click me</a>";


?>
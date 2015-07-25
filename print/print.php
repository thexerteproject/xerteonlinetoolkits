<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Print your LO results</title>
<style type="text/css">
<!--
body {
	font: 100% Verdana, Arial, Helvetica, sans-serif;
	background: #666666;
	margin: 0; /* it's good practice to zero the margin and padding of the body element to account for differing browser defaults */
	padding: 0;
	text-align: center; /* this centers the container in IE 5* browsers. The text is then set to the left aligned default in the #container selector */
	color: #000000;
}
.oneColElsCtr #container {
	width: 900px;
	background: #FFFFFF;
	margin: 0 auto; /* the auto margins (in conjunction with a width) center the page */
	border: 1px solid #000000;
	text-align: left; /* this overrides the text-align: center on the body element. */
}
.oneColElsCtr #mainContent {
	padding: 0 20px; /* remember that padding is the space inside the div box and margin is the space outside the div box */
}
-->
</style></head>

<body class="oneColElsCtr">

<div id="container">
  <div id="mainContent">
    <h1><?php 
	$hide=$_GET["hide"];
	$link=$_GET["link"];
	$from=$_GET["from"];
	$to=$_GET["to"];
	
	#echo $link."<br>";
while($from <= $to)
  {
	   echo "<iframe src='".$link."&display=fill&hide=bottom&page=$from&hide=$hide' width=810 height=610 frameBorder=0></iframe><br /><br />";
	  $from++;
 
  
  }
?></p>
	<!-- end #mainContent --></div>
<!-- end #container --></div>
</body>
</html>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Xerte Print option</title>
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
	width: 46em;
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
    <h1> Print your Xerte LO</h1>
    <p>Note: This is just a test and demo of how we could enable printing of Xerte LO's without major changes to the existing code. Longer term we would ideally add a more elegant solution and perhaps saving as pdf and epub too. Your LO must be public for this to work.</p>
    <form id="form1" name="form1" method="get" action="print.php">
      <p>To see how this works use the example below or paste the full link to your own LO.</p>
      <p>
        <label>Link to LO:
          <input name="link" type="text" id="link" value="http://training.mitchellmedia.co.uk/xerte/play.php?template_id=96" size="100" />
        </label>
      </p>
      <p>Print LO pages: 
        <label>from
          <input name="from" type="text" id="from" value="1" size="8" />
        </label>
      to 
      <input name="to" type="text" id="to" value="5" size="8" />
      Do not exceed total e.g. if your LO has 20 pages the [to] value should be no greater than 20.</p>
      <p>
        <label>Optional: Hide
          <select name="hide" id="hide">
            <option value="bottom" selected="selected">Footer</option>
            <option value="top">Header</option>
            <option value="both">Both</option>
            <option value="none">Neither</option>
          </select>
        </label>
      Note: this is a new development and will only work with latest codebase. Generally you would want to hide the footer e.g. the navigation buttons but not the header e.g. page title.</p>
      <p>
        <label>
          Click 
          <input type="submit" name="Print" id="Print" value="View" />
        </label>
      and on the resulting page you should see the separate pages you've selected. If these are as expected select File &gt; Print in your browser or click the printer icon.</p>
    </form>
    <p>&nbsp;</p>
    <h2>&nbsp;</h2>
	<!-- end #mainContent --></div>
<!-- end #container --></div>
</body>
</html>

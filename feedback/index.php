<?PHP     /**
* 
* feedback page, allows users to send feedback to site admins
*
* @author Patrick Lockley
* @version 1.0
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

	include "../config.php";

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>Welcome to Xerte Web Toolkits</title>

<link href="../website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />

</head>

<body>

	<div class="topbar">
		<img src="../website_code/images/xerteLogo.jpg" style="margin-left:10px; float:left" />
		<img src="../website_code/images/UofNLogo.jpg" style="margin-right:10px; float:right" />
	</div>
	<div class="mainbody">
		
		<?PHP     /**
		*	If something is posted, send this feedback
		*/
			
			if(isset($_POST['feedback'])){

				echo "<p>Thank you for your feedback</p></div></body></html>";

				mail($xerte_toolkits_site->feedback_list, "Xerte Online Feedback", "Name " . mysql_real_escape_string($_POST['name']) . "<br>Message<br>" . mysql_real_escape_string($_POST['feedback']), $xerte_toolkits_site->headers); 

			}else{
			
		/**
		*	Else display the page
		*/

				echo "<div class=\"title\"><p>Welcome to Xerte on-line Toolkits Feedback page</p></div><div style=\"width:45%; float:left; position:relative; margin-right:20px;\">Please leave your feedback here. All feedback is anonymous, unless you would like a response, and if you do, please leave your name opposite and some contact details in the box below. Thank you, the IS Learning Team.</div><div style=\"width:50%; float:left; position:relative;\">";

				echo "<form action=\"\" method=\"post\">Name<textarea name=\"name\" style=\"width:100%;\" rows=\"1\"></textarea>Feedback<textarea name=\"feedback\" style=\"width:100%;\" rows=\"25\"></textarea><input type=\"submit\" value=\"Send Feedback\"></form>";

				echo "</div></div></body></html>";

			}

		?>
	</div>
</body>
</html>
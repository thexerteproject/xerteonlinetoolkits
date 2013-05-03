<?php

echo file_get_contents("page_top");

$buffer = file_get_contents("database.txt");

session_start();

$buffer = str_replace("DATABASE_HOST", $_SESSION['DATABASE_HOST'],$buffer);
$buffer = str_replace("DATABASE_NAME", $_SESSION['DATABASE_NAME'],$buffer);
$buffer = str_replace("DATABASE_PREFIX", $_SESSION['DATABASE_PREFIX'],$buffer);
$buffer = str_replace("DATABASE_USERNAME",$_POST['account'],$buffer);
$buffer = str_replace("DATABASE_PASSWORD",$_POST['password'],$buffer);
$file_handle = fopen("../database.php",'w');

if($file_handle){
    if(fwrite($file_handle,$buffer,strlen($buffer))){
        fclose($file_handle);
    }else{
        die("database.php could not be written to");
    }
}else{
    die("database.php could not be created");
}

?>

<h2 style="margin-top:15px">
Admin Password Setup Page
</h2>
<p>
Your Xerte Online Toolkits database has been successfully created. 
</p>
<p>
Now please create an admin username and password for the site
</p>
<p>
<form action="page3.php" method="post" onSubmit="javascript:
			if(document.getElementById('account').value==''||document.getElementById('password').value==''){
				alert('Please set a username and password');
				return false;
			}
			return true;" enctype="multipart/form-data">
    <label for="account">Admin account name</label><br /><br /><input type="text" width="100" name="account" id="account" /><br /><br />
    <label for="password">Admin account password</label><br /><br /><input type="password" width="100" name="password" id="password"/><br /><br />
    <input type="image" src="next.gif" />
</form>
</p>
</div>
</body>
</html>

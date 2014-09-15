<?php

/**
 * 
 * Drawing page, brings up the xerte drawing tool in another window
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */
require_once(dirname(__FILE__) . '/config.php');


$edit_site_logo = $xerte_toolkits_site->site_logo;
$pos = strrpos($edit_site_logo, '/') + 1;
$edit_site_logo = substr($edit_site_logo,0,$pos) . "edit_" . substr($edit_site_logo,$pos);

$edit_organisational_logo = $xerte_toolkits_site->organisational_logo;
$pos = strrpos($edit_organisational_logo, '/') + 1;
$edit_organisational_logo = substr($edit_organisational_logo,0,$pos) . "edit_" . substr($edit_organisational_logo,$pos);

$xmlData = "";

if (!isset($_POST['rlofile']))
{
    die("Invalid call to drawingjs.php");
}

$rlofile = $_POST['rlofile'];

if (isset($_POST['data']))
{
    $xmlData = $_POST['data'];
}

?>
<!--

University of Nottingham Xerte Online Toolkits

Version 2.2

-->

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <script src="modules/xerte/js/swfobject.js"></script>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Xerte Online Editor Window</title>
        <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
        <script>
            var saveDrawingCallBack = (window.parent && window.parent.XOT)
                ? window.parent.XOT.callBack
                : ((window.opener && window.opener.XOT)
                ? window.opener.XOT.callBack
                : false);
            var closeDrawEditorCallBack = (window.parent && window.parent.XOT)
                ? window.parent.XOT.close
                : ((window.opener && window.opener.XOT)
                ? window.opener.XOT.close
                : false);
            var key="<?php echo $_POST['key'];?>";
            var name="<?php echo $_POST['name'];?>";
            var saveDrawing = function(xmlData)
            {
                if (saveDrawingCallBack)
                {
                    saveDrawingCallBack(key, name, xmlData);
                }
            }
            var closeDrawingEditor = function()
            {
                if (closeDrawEditorCallBack)
                {
                    closeDrawEditorCallBack();
                }
            }
        </script>

    </head>

    <body onunload="closeDrawingEditor();" onbeforeunload="closeDrawingEditor();">
        <div>
            <div class="topbar" style="width:800px">
                <img src="<?php echo $edit_site_logo;?>" style="margin-left:10px; float:left" />
                <img src="<?php echo $edit_organisational_logo;?>" style="margin-right:10px; float:right" />
            </div>
        </div>

        <div id="flashcontent">
            This text is replaced by the Flash movie.
        </div>


        <script type="text/javascript">
            var so = new SWFObject("modules/xerte/engine/drawEditJS.swf", "mymovie", "800", "600", "8,0,0,0", "#e0e0e0");
            so.addParam("quality", "high");
        <?php
            echo "so.addVariable(\"xmldata\", \"" . urlencode($xmlData) . "\");";
            echo "so.addVariable(\"rlovariable\", \"$rlofile\");";
            echo "so.write(\"flashcontent\");";
        ?>
        </script>
    </body>
</html>

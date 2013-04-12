<?php
require_once(dirname(__FILE__) . "/config.php");

global $xerte_toolkits_site;

$extraparams = "";
if (isset($_REQUEST['LinkID']))
{
    $extraparams .= "&LinkID=" . $_REQUEST['LinkID'];
}

if (isset($_REQUEST['Page']))
{
    $extraparams .= "&Page=" . $_REQUEST['Page'];
}


header("Location: " . $xerte_toolkits_site->site_url . "preview.php?engine=html5&template_id=" . $_REQUEST['template_id'] . $extraflags);
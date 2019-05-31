<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 26-3-2019
 * Time: 18:11
 */

require_once(dirname(__FILE__) . "/config.php");
if (isset($_SESSION['toolkits_logon_id']) &&  $_SESSION['toolkits_logon_id'] == "site_administrator")
{
    $q = "select site_url from sitedetails";
    $rows = db_query($q);
    if ($rows !== false && count($rows) > 0)
    {
        $url = $rows[0]["site_url"];
        if (strpos($url, "http://") == 0)
        {
            $url = "https://" . substr($url, 7);
            $q = "update sitedetails set site_url=?";
            $params=array($url);
            $ok = db_query($q, $params);
            echo "Done " . $rows[0]["site_url"]. " --> " . $url;
        }
    }
}
else{
    echo "Permission denied!";
}
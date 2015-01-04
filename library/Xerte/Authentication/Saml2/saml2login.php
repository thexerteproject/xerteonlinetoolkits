<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 31-12-2014
 * Time: 16:30
 */
session_start();
if (isset($_GET['response']))
{
    $response = urldecode($_GET['response']);
    $_SESSION['saml2session'] = $response;
    $decoded = json_decode($response);
    if ($decoded->saml2reqid == $_SESSION['saml2reqid']) {
        header("Location: " . $_GET['site']);
    }
    else
    {
        die("Invalid login request");
    }
}
else
{
    die("Invalid login request");
}
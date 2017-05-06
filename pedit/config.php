<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 24-11-2015
 * Time: 19:59
 */

global $pedit_config;

class PedITConfig
{
    public $key = "ff86982042d4136c";                                        // Key of secure link
    public $soapKey = "3bba469a-5f06-45cc-ac8f-afd3217f50aa";                // Key of Soap services
    public $soapUrl = "http://12change.pedit.no/web/Integration.asmx?WSDL";  // Url of SoapServices
};

$pedit_config = new PedITConfig();

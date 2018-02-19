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
    public $key = "fc907a346070db6b";                                        // Key of secure link
    public $soapKey = "c2d41bb3-37f5-4944-8dfb-33af691441f4";                // Key of Soap services
    public $soapUrl = "https://www.futureteacher.eu/web/Integration.asmx?WSDL";  // Url of SoapServices
};

$pedit_config = new PedITConfig();

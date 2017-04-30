<?php
/**
 * Created by PhpStorm.
 * User: tom
 * Date: 17-1-14
 * Time: 15:09
 */

require_once('config.php');

function objectToArray($d)
{
    if (is_object($d))
    {
        $d = get_object_vars($d);
    }
    if (is_array($d))
    {
        return array_map(__FUNCTION__, $d);
    }
    else
    {
        return $d;
    }
} // See more at: http://4rapiddev.com/php/call-web-service-wsdl-example/#sthash.Ia2H1clR.dpuf

global $config;

$mysqli = new mysqli($dbconfig['host'], $dbconfig['dbuser'], $dbconfig['dbpasswd'], $dbconfig['database']);

if ($mysqli->connect_errno) {
    $error[] = "Kan geen verbinding met de database maken: " . $mysqli->connect_error;
}
else
{

    // Get config data
    $config = array();
    $sql = 'select * from config';
    $result = $mysqli->query($sql);
    while ($row = $result->fetch_assoc())
    {
        $config[$row['key']] = $row['value'];
    }

    $client = new SoapClient("http://kopi-mbovelp.pedit.no/web/Integration.asmx?WSDL");

    $soapresult = $client->GetTeacherGroupsByClassDescription(array(
        'sKey' => $config['soapkey'],
        'sDescription' => "jaar"
        ));

    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($soapresult->GetTeacherGroupsByClassDescriptionResult);
    if ($xml === false)
    {
        foreach(libxml_get_errors() as $error) {
            echo "\t", $error->message;
        }
    }
    $errormsgs = $xml->xpath("/error");
    if (count($errormsgs))
    {
        $textnot .= "Terugzetten is mislukt!\n";
        $htmlnot .= "Terugzetten is mislukt!<br/>";
        $dump = print_r(objectToArray($soapresult), true);
        $textnot .= $dump;
        $htmlnot .= str_replace("\n", "<BR />", $dump);
    }
    $xml->asXML("TeacherGroups.xml");

    $soapresult = $client->GetTeachersByClass(array(
        'sKey' => $config['soapkey'],
        'iClassID' => 184623
    ));

    $xml = simplexml_load_string($soapresult->GetTeachersByClassResult);
    if ($xml === false)
    {
        foreach(libxml_get_errors() as $error) {
            echo "\t", $error->message;
        }
    }
    $errormsgs = $xml->xpath("/error");
    if (count($errormsgs))
    {
        $textnot .= "Terugzetten is mislukt!\n";
        $htmlnot .= "Terugzetten is mislukt!<br/>";
        $dump = print_r(objectToArray($soapresult), true);
        $textnot .= $dump;
        $htmlnot .= str_replace("\n", "<BR />", $dump);
    }
    $xml->asXML("Teachers_184623.xml");

    $soapresult = $client->GetStudentsByClass(array(
        'sKey' => $config['soapkey'],
        'iClassID' => 184623
        ));

    $xml = simplexml_load_string($soapresult->GetStudentsByClassResult);
    if ($xml === false)
    {
        foreach(libxml_get_errors() as $error) {
            echo "\t", $error->message;
        }
    }
    $errormsgs = $xml->xpath("/error");
    if (count($errormsgs))
    {
        $textnot .= "Terugzetten is mislukt!\n";
        $htmlnot .= "Terugzetten is mislukt!<br/>";
        $dump = print_r(objectToArray($soapresult), true);
        $textnot .= $dump;
        $htmlnot .= str_replace("\n", "<BR />", $dump);
    }
    $xml->asXML("GroupMembers_184623.xml");

    $soapresult = $client->GetPlans(array(
        'sKey' => $config['soapkey'],
        'iClassID' => 184623
    ));

    $xml = simplexml_load_string($soapresult->GetPlansResult);
    if ($xml === false)
    {
        foreach(libxml_get_errors() as $error) {
            echo "\t", $error->message;
        }
    }
    $errormsgs = $xml->xpath("/error");
    if (count($errormsgs))
    {
        $textnot .= "Terugzetten is mislukt!\n";
        $htmlnot .= "Terugzetten is mislukt!<br/>";
        $dump = print_r(objectToArray($soapresult), true);
        $textnot .= $dump;
        $htmlnot .= str_replace("\n", "<BR />", $dump);
    }
    $xml->asXML("Plans_184623.xml");

    echo "Done";
}
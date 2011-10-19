<?PHP 

// RSS proxy
//
// For the RSS reader page for the xerte template
//
// Version 1.0 University of Nottingham

include 'Snoopy.class.php';
include 'config.php';

$snoopy = new Snoopy;

$url = $_GET['rss'];

$snoopy->proxy_host1=$xerte_toolkits_site->proxy1;				
$snoopy->proxy_host2=$xerte_toolkits_site->proxy2;				
$snoopy->proxy_host3=$xerte_toolkits_site->proxy3;				
$snoopy->proxy_host4=$xerte_toolkits_site->proxy4;				
$snoopy->proxy_port1=$xerte_toolkits_site->port1;
$snoopy->proxy_port2=$xerte_toolkits_site->port2;
$snoopy->proxy_port3=$xerte_toolkits_site->port3;
$snoopy->proxy_port4=$xerte_toolkits_site->port4;

$content = $snoopy->fetch($url);

echo $snoopy->results;

?>
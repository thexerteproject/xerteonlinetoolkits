<?php
/**
 * 
 * export template, allows the site to display the html for the export panel
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

require_once("../../../config.php");


include "../template_status.php";

include "../url_library.php";

include "../user_library.php";

$database_id=database_connect("Export template database connect success","Export template database connect failed");

/*
 * check user has some rights to this template
 */

if(is_user_creator(mysql_real_escape_string($_POST['template_id']), $_SESSION['toolkits_logon_id'])||is_user_admin()){

    echo "<p class=\"header\"><span>Export</span></p>";	

    echo "<p>There are two ways to export a project</p>";

    echo "<p>A zip file export will package (but not delete) your project into one zip file. If you then open this file, the contents can be used to deploy your project on any webpage.</p><p>Click on zip export to get your file - <a href='" . $xerte_toolkits_site->site_url . url_return("export" , $_POST['template_id']) . "'>Zip export</a></p>";

    echo "<p>As above, but with references to web based files altered - <a href='" . $xerte_toolkits_site->site_url . url_return("export_local" , $_POST['template_id']) . "'>Zip (local) export</a></p>";

    echo "<p>A SCORM 1.2 file export will package (but not delete) your project into one zip file. This zip file can then be imported by most VLEs to become part of an online course. This file will be SCORM 1.2 compliant.</p><p>Click on Scorm export to get this package - <a href='" . $xerte_toolkits_site->site_url . url_return("scorm" , $_POST['template_id']) . "'>Scorm export</a></p>";

    echo "<p>As above, but with richer SCORM metadata - <a href='" . $xerte_toolkits_site->site_url . url_return("scorm_rich" , $_POST['template_id']) . "'>SCORM + metadata export</a></p>";

}else{

    echo "<p>Sorry you do not have rights to this template</p>";

}

?>



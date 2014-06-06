<?PHP

/**
*
* preview page, allows the site to make a preview page for a xerte module
*
* @author Patrick Lockley
* @version 1.0
* @params array row_play - The array from the last mysql query
* @copyright Copyright (c) 2008,2009 University of Nottingham
* @package
*/

require_once(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');

/**
*
* Function show_preview_code
* This function creates folders needed when creating a template
* @param array $row - an array from a mysql query for the template
* @param array $row_username - an array from a mysql query for the username
* @version 1.0
* @author Patrick Lockley
*/

require_once(dirname(__FILE__) . "/play.php");

function show_preview_code($row)
{
    global $xerte_toolkits_site;

    $template_dir = $xerte_toolkits_site->users_file_area_full . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    if(!file_exists($template_dir .'/preview.xml')) {

        $buffer = file_get_contents($template_dir . '/data.xml');
        $fp = fopen($template_dir . '/preview.xml','x');
        fwrite($fp, $buffer);
        fclose($fp);

    }

    $preview_filename = "preview.xml";

	//************ TEMPORARY ****************

	//if (file_exists($template_dir . '/preview2.xml')) {
	//	$preview_filename = "preview2.xml";
	//}

	//***************************************

    echo show_template_page($row, $preview_filename);
}

function show_preview_code2($row, $row_username){

	global $xerte_toolkits_site;

    _load_language_file("/modules/xerte/preview.inc");

    $template_dir = $xerte_toolkits_site->users_file_area_full . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    /*
    * Format the XML strings to provide data to the engine
    */

	if(!file_exists($template_dir . '/preview.xml')) {

		$buffer = file_get_contents($template_dir . "/data.xml");

		$fp = fopen($template_dir . "/preview.xml","x");
		fwrite($fp, $buffer);
		fclose($fp);

	}

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row_username['username'] . "-" . $row['template_name'] . "/";

    $xmlfile = $string_for_flash . "preview.xml";

    $xmlFixer = new XerteXMLInspector();
    $xmlFixer->loadTemplateXML($xmlfile);

    if (strlen($xmlFixer->getName()) > 0)
    {
        $title = $xmlFixer->getName();
    }
    else
    {
        $title = XERTE_PREVIEW_TITLE;
    }
    $string_for_flash_xml = $xmlfile . "?time=" . time();

    $flash_js_dir = "modules/" . $row['template_framework'] . "/";
    $template_path = "modules/" . $row['template_framework'] . "/parent_templates/" . $row['template_name'] . "/";
    $rlo_file = $template_path . $row['template_name'] . ".rlt";

    list($x, $y) = explode("~",get_template_screen_size($row['template_name'],$row['template_framework']));

    // determine the correct engine to use
    $engine = 'flash';
    $extra_flags = explode(";", $row['extra_flags']);
    foreach($extra_flags as $flag)
    {
        $parameter = explode("=", $flag);
        switch($parameter[0])
        {
            case 'engine':
                $engine = $parameter[1];
                break;
        }
    }
    // If given as a parameter, force this engine
    // If given as a parameter, force this engine
    if (isset($_REQUEST['engine']))
    {
        if ($_REQUEST['engine'] == 'other')
        {
            if ($engine == 'flash')
                $engine = 'javascript';
            else
                $engine = 'flash';
        }
        else
        {
            $engine=$_REQUEST['engine'];
        }
    }
    if ($engine == 'flash')
    {
        $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player/rloObject.htm");

        $page_content = str_replace("%WIDTH%", $x, $page_content);
        $page_content = str_replace("%HEIGHT%", $y, $page_content);
        $page_content = str_replace("%TITLE%", $title , $page_content);
        $page_content = str_replace("%RLOFILE%", $rlo_file, $page_content);
        $page_content = str_replace("%JSDIR%", $flash_js_dir, $page_content);
        $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
        $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);
        $page_content = str_replace("%SITE%",$xerte_toolkits_site->site_url,$page_content);

        $tracking = "<script type=\"text/javascript\" src=\"" . $flash_js_dir . "js/xttracking_noop.js\"></script>";

        $page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);
    }
    else
    {
        // $engine is assumed to be html5 if flash is NOT set
        $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player_html5/rloObject.htm");
        $page_content = str_replace("%TITLE%", $title , $page_content);
        $page_content = str_replace("%TEMPLATEPATH%", $template_path, $page_content);
        $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
        $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);

        $tracking = "<script type=\"text/javascript\" src=\"" . $template_path . "common_html5/js/xttracking_noop.js\"></script>";

        $page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);
    }
    echo $page_content;
}


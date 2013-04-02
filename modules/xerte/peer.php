<?php 
/**
 * 
 * peer page, allows the site to make a peer review page for a xerte module
 *
 * @author Patrick Lockley
 * @version 1.0
 * @copyright Copyright (c) 2008,2009 University of Nottingham
 * @package
 */

/**
 * 
 * Function show template
 * This function creates folders needed when creating a template
 * @param array $row_play - an array from the last mysql query
 * @version 1.0
 * @author Patrick Lockley
 */

function show_template($row_play, $retouremail){
    global $xerte_toolkits_site;

    _load_language_file("/modules/xerte/peer.inc");

    $string_for_flash_xml = $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/data.xml";

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row_play['template_id'] . "-" . $row_play['username'] . "-" . $row_play['template_name'] . "/";

    list($x, $y) = explode("~",get_template_screen_size($row_play['template_name'],$row_play['template_framework']));

?>
        <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html lang="en">
        <head>
        <title><?PHP echo XERTE_PREVIEW_TITLE;  ?></title>
        <script type="text/javascript" src="modules/xerte/js/rlohelper.js"></script>
        <script type="text/javascript" src="modules/xerte/js/xttracking_noop.js"></script>
        <script src = "rloObject.js"></script>
        <script type="text/javascript" language="Javascript" src="website_code/scripts/peer.js"></script>
        <script type="text/javascript" language="Javascript" src="website_code/scripts/ajax_management.js"></script>
    <script type="text/javascript">
    function enableTTS(){
        if (navigator.appName.indexOf("Microsoft") != -1){
            VoiceObj = new ActiveXObject("Sapi.SpVoice");
        }
    }
    </script>
        </head>
        <body style="#ffffff; font-family:verdana,tahoma,arial; font-size:80%;">
        <div style="width:900px; margin:0 auto;">
        <p style="margin 0px; padding:0px">
        <b><?PHP echo XERTE_PEER_DESCRIPTION; ?></b><br><?PHP echo XERTE_PEER_GUIDANCE;?> 
        </p>
    <script type="text/javascript" language="JavaScript">

<?PHP

    /*
     * slightly modified xerte preview code to allow for flash vars
     */

    echo "myRLO = new rloObject('" . $x . "','" . $y . "','modules/" . $row_play['template_framework'] . "/parent_templates/" . $row_play['template_name'] . "/" . $row_play['template_name'] . ".rlt','$string_for_flash', '$string_for_flash_xml', '$xerte_toolkits_site->site_url')";

    echo "</script>";

    echo "<a name=\"feedbackform\"><p style=\"width:250px; color:red;\"  id=\"feedback\"></p></a>";

    echo "<br><form name=\"peer\" action=\"javascript:send_review('" . $retouremail . "','" . $row_play['template_id'] . "')\" method=\"post\" enctype=\"text/plain\"><textarea style=\"width:800px; height:300px;\" name=\"response\">" . XERTE_PEER_TEXTAREA_INSTRUCTIONS . "</textarea><br/><button type=\"submit\" class=\"xerte_button\">" . XERTE_PEER_BUTTON_SEND . "</button></form><a name=\"feedbackform\"><p style=\"width:250px;\"  id=\"feedback\"></p></a></div>";

    echo "</body></html>";

}

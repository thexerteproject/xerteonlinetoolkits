<?php 
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/**
 * 
 * peer page, allows the site to make a peer review page for a xerte module
 *
 * @author Patrick Lockley
 * @version 1.0
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

require_once(dirname(__FILE__) . "/play.php");
_load_language_file("/modules/xerte/peer.inc");

function show_peer_template($row, $retouremail)
{
    global $xerte_toolkits_site;


    $peer_template = show_template_page($row, "data.xml");

    // Look for the body element and insert description and explanation
    $body_pos = strpos($peer_template, "<body");
    $end_body_pos = strpos($peer_template, ">", $body_pos);
    $peer_page = substr($peer_template, 0, $end_body_pos);
    $peer_page .= " style=\"#ffffff; font-family:verdana,tahoma,arial; font-size:80%;\">\n";
    $peer_page .= "   <div style=\"width:900px; margin:0 auto;\">\n";
    $peer_page .= "   <div><p style=\"margin 0px; padding:0px\">\n";
    $peer_page .= "   <h1>" . XERTE_PEER_DESCRIPTION . "</h1>" . XERTE_PEER_GUIDANCE . "</p></div><div>\n";

    $peer_page .=  "<div><a name=\"feedbackform\"><p style=\"color:red;\"  id=\"feedback\"></p></a>\n";
    $peer_page .= "<br><form name=\"peer\" action=\"javascript:send_review('" . $retouremail . "','" . $row['template_id'] . "')\" method=\"post\" enctype=\"text/plain\"><textarea style=\"width:800px; height:300px;\" name=\"response\">" . XERTE_PEER_TEXTAREA_INSTRUCTIONS . "</textarea><br/><button type=\"submit\" class=\"xerte_button\">" . XERTE_PEER_BUTTON_SEND . "</button></form><a name=\"feedbackform\"><p style=\"width:250px;\"  id=\"feedback\"></p></a></div>";
    $peer_page .= "</div><div>";

    $peer_page .= substr($peer_template, $end_body_pos + 1);


    // Look for </body> and insert </div>
    $peer_page  = str_replace("</body>", "</div></body>", $peer_page);

    // Look for </head> and insert javascript
    $ajax = "<script type=\"text/javascript\" language=\"Javascript\" src=\"website_code/scripts/peer.js\"></script>\n";
    $ajax .= "<script type=\"text/javascript\" language=\"Javascript\" src=\"website_code/scripts/ajax_management.js\"></script>\n";
    $ajax .= "</head>";

    $peer_page  = str_replace("</head>", $ajax, $peer_page);


    echo $peer_page;

}

function show_peer_login_form($mesg="")
{
    echo "<html>\n";
    echo "<body style=\"#ffffff; font-family:verdana,tahoma,arial; font-size:80%;\">\n";
    echo "   <div style=\"width:900px; margin:0 auto;\">\n";
    echo "   <div><p style=\"margin 0px; padding:0px\">\n";
    echo "   <b>" . XERTE_PEER_DESCRIPTION . "</b><br>" . XERTE_PEER_GUIDANCE . "</p></div><div>\n";
    echo "<center><p><form method=\"post\" action=\"\">\n";
    echo "<p>" . XERTE_PEER_PASSWORD . " <input type=\"password\" size=\"20\" maxlength=\"36\" name=\"password\" /></p><p><button type=\"submit\">" . XERTE_PEER_LOGIN_BUTTON . "</button></p>\n";
    if (strlen($mesg)>0)
    {
        echo "<p>" . $mesg . "</p>";
    }
    echo "</center></div></body></html>";
}

?>
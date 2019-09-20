<?PHP
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
 * This routine expects data that will be ransformed into a document that word can accept
 *
 * This is su=imply building an html file and storing as .doc file. Word will do the work
 *
 * However, to be able to handle images we need to build a mime 1.0 document, like Word does with mhtml files
 *
 * The images are saved in a subfolder, and the src needs to be adapted for that
 *
 * See the website below for an excellent explanation. It also show how we can extend this in the future.
 *
 * @ref https://sebsauvage.net/wiki/doku.php?id=word_document_generation
 *
 */
require_once("config.php");

class mime10class
{
    private $data;
    const boundary='----=_NextPart_XERTE.DOCUMENTATION.PARTS.EYUUREZ';
    function __construct() { $this->data="MIME-Version: 1.0\nContent-Type: multipart/related; boundary=\"".self::boundary."\"\n\n"; }
    public function addFile($filename,$contenttype,$data)
    {
        $this->data = $this->data . '--'.self::boundary . "\nContent-Location: file:///C:/" . preg_replace('!\\\!', '/', $filename) . "\nContent-Transfer-Encoding: base64\nContent-Type: " . $contenttype . "\n\n";
        $this->data = $this->data . base64_encode($data) . "\n\n";
    }
    public function getFile() { return $this->data . '--' . self::boundary . '--'; }
}

if (isset($_SESSION['toolkits_logon_id'])) {
    $data = json_decode($_POST['data'], true);

    $filename = "file";
    if ($data["filename"]) $filename = $data["filename"];


    header('Content-type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $filename . '.DOC"');

    $doc = "";
    $doc .= "<html>";
    $doc .= "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">";
    $doc .= '<head>';
    $doc .= '<style>@page Section1 {size:' . $data['size'] . ';mso-page-orientation:' . $data['orientation'] . ';}div.Section1 {page:Section1;}</style>';
    $doc .= "<style>" . $data['styles'] . "</style>";
    $doc .= '</head>';

    $doc .= "<body>";

    $doc .= "<div class=\"Section1\">";
    $doc .= "<h1>" . $data['documentName'] . "</h1>";
    $doc .= "<p>" . $data['documentText'] . "</p>";
    $doc .= "<p>" . $data['documentIntro'] . "</p>";

    foreach ($data['pages'] as $pagekey => $pagevalue) {
        $doc .= "<h1>" . $pagevalue['pageName'] . "</h1>";
        $doc .= "<p>" . $pagevalue['pageText'] . "</p>";
        $doc .= "<div class=\"page\">";

        foreach ($pagevalue['sections'] as $sectionkey => $sectionvalue) {
            if (array_key_exists('sectionName', $sectionvalue)) {
                $doc .= "<div class=\"section\">";
                $doc .= "<h2>" . $sectionvalue['sectionName'] . "</h2>";
                $doc .= "<p>" . $sectionvalue['sectionText'] . "</p>";
            }
            foreach ($sectionvalue["items"] as $itemkey => $itemvalue) {
                $doc .= "<div class=\"item\">";
                $doc .= "<h3>" . $itemvalue['itemName'] . "</h3>";
                $doc .= "<p>" . $itemvalue['itemText'] . "</p>";
                $doc .= "<p class=\"item\"><i>" . $itemvalue['itemValue'] . "</i></p>";
                $doc .= "</div>";
            }
            if (array_key_exists('sectionName', $sectionvalue)) {
                $doc .= "</div>";
            }
        }
        $doc .= "</div>";
    }

    $doc .= "</div>";
    $doc .= "</body>";
    $doc .= "</html>";

    // Replace all images by inline images
    $worddoc = new mime10class();
    $ipos = strpos($doc, "<img");
    while ($ipos !== false) {
        // Get the value of the src attribute
        $bpos = strpos($doc, "src=", $ipos);
        if ($bpos !== false) {
            // Skip Needle
            $bpos += 4;
            // get quote used
            $quote = $doc[$bpos];
            $bpos += 1; // skip quote
            $epos = strpos($doc, $quote, $bpos);
            if ($epos !== false) {
                $imgfile = substr($doc, $bpos, $epos - $bpos);
                $imgdata = file_get_contents($imgfile);
                $imgparts = pathinfo($imgfile);
                $new_imgfile = 'images/' . $imgparts['basename'];

                $src = $new_imgfile;
                // Add image to mime file
                $worddoc->addFile($new_imgfile, 'image/' . $imgparts['extension'], $imgdata);
                // Replace old src with new src
                $doc = substr($doc, 0, $bpos) . $src . substr($doc, $epos);
            }
        }
        $ipos = strpos($doc, "<img", $ipos+1);
    }
    $filename_parts = pathinfo($filename);
    $worddoc->addFile($filename_parts['filename'] . '.htm', 'text/html', $doc);
    echo $worddoc->getFile();
}

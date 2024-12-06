<?php
require_once(dirname(__FILE__) . "/../../config.php");
require_once(dirname(__FILE__) . "/xmlInspector.php");
require_once(dirname(__FILE__) . "/Html2Text/html2text.php");

class XerteProjectDecoder extends XerteXMLInspector
{
    function __construct($xmlpath)
    {
        $this->loadTemplateXML($xmlpath);
    }

    private function getLabelFromText($s)
    {
        $stripped = str_replace(array('/', ' '), '_', $s);
        $stripped = str_replace("&nbsp;", " ", $stripped);
        return $stripped;
    }

    private function getLabelFromHtml($s)
    {
        $s_withspaces = str_replace("&nbsp;", " ", $s);

        //$stripped = strip_tags($s_withspaces);
	    $stripped=convert_html_to_text($s_withspaces, true);
        // Convert HTML entities to single characters
        $stripped = html_entity_decode($stripped, ENT_QUOTES, 'UTF-8');
        $stripped = preg_replace('/[^a-zA-Z0-9_ ]/', '', trim($stripped));
        $stripped = str_replace(' ', '_', $stripped);
        return $stripped;
    }

    private function getTextFromHtml($s)
    {
        $s_withspaces = str_replace("&nbsp;", " ", $s);

        //$stripped = strip_tags($s_withspaces);
        $stripped=convert_html_to_text($s_withspaces, true);

        // Convert HTML entities to single characters
        $stripped = html_entity_decode($stripped, ENT_QUOTES, 'UTF-8');
        //$stripped = preg_replace('/[^a-zA-Z0-9_ ]/', '', trim($stripped));
        return trim($stripped);
    }

    private function normalizePercentage($s)
    {
        $norm = $s;
        $ppos = strpos($norm, '%');
        if ($ppos !== false)
        {
            $norm = substr($norm, 0, $ppos) . (strlen($norm) > $ppos ? substr($norm, $ppos+1) : '');
        }
        $norm = floatval(preg_replace("/[^0-9\.\-]/","",$norm));
        if ($norm < 0.99)
            $norm = $norm *100;

        return $norm;
    }

    private function decodeSubInteractions($project, $page, $interaction)
    {
        $subinteractions = array();

        $subinteraction = new \stdClass();
        /*
         * CREATE TABLE `subinteractions` (
  `idsubinteractions` int(11) NOT NULL AUTO_INCREMENT,
  `idinteraction` int(11) NOT NULL,
  `subinteractionnr` int(11) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `displayname` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `type` varchar(45) COLLATE utf8_unicode_ci NOT NULL,

  `weighting` float NOT NULL DEFAULT '1',
  `grouping` varchar(45) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`idsubinteractions`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

         */

        $xml = $page->node;
        if (isset($xml['trackinglabel'])) {
            $subinteraction->name = $this->getLabelFromText((string)$xml['trackinglabel']);
            $subinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $subinteraction->name;
        }
        else {
            $subinteraction->name = $this->getLabelFromHtml((string)$xml['name']);
            if ($interaction->trackinglabelSet)
                $subinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $interaction->name;
            else
                $subinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $subinteraction->name;
        }
        $subinteraction->displayname = $this->getTextFromHtml((string)$xml['name']);


        switch ($xml->getName()) {
            case 'categories':
                //match
                $subinteraction->kind = 'match';
                $answer = '';
                $cats = $xml->children();
                for ($i = 0; $i < count($cats); $i++) {
                    $items = $cats[$i]->children();
                    for ($j = 0; $j < count($items); $j++) {
                        if (strlen($answer) > 0)
                            $answer .= '[,]';
                        $answer .= $this->getLabelFromHtml((string)$items[$j]['name']) . '[.]' . $this->getLabelFromHtml((string)$cats[$i]['name']);
                    }
                }
                $subinteraction->answer = $answer;
                $subinteractions[] = $subinteraction;
                break;
            case 'dictation':
                // fill-in
                $d = $xml->children();
                for ($i = 0; $i < count($d); $i++) {
                    $qsubinteraction = json_decode(json_encode($subinteraction));

                    if (isset($d[$i]['trackinglabel'])) {
                        $qsubinteraction->name = $this->getLabelFromText((string)$d[$i]['trackinglabel']);
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $subinteraction->name;
                    }
                    else {
                        $qsubinteraction->name = $this->getLabelFromHtml((string)$d[$i]['name']);
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                    }
                    $qsubinteraction->displayname = $this->getTextFromHtml((string)$d[$i]['name']);
                    $qsubinteraction->question = $this->getTextFromHtml((string)$d[$i]['prompt']);
                    $qsubinteraction->kind = 'fill-in';
                    $qsubinteraction->answer = $this->getTextFromHtml((string)$d[$i]['answer']);

                    $subinteractions[] = $qsubinteraction;
                }
                break;
            case 'gapFill':
                $passage = $xml['passage'];
                $delimiter = isset($xml["mainDelimiter"]) && trim((string)$xml["mainDelimiter"]) != "" ? trim($xml["mainDelimiter"]) : "|";
                $passages = explode($delimiter, $passage);
                $marked = false;
                $markedwords = array();
                foreach($passages as $i => $passage) {
                    $passage = trim($passage);
                    if (strlen($passage) > 0) {
                        if (!$marked) {
                            $marked = true;
                        }
                        else{
                            $markedwords[] = $passage;
                            $marked = false;
                        }
                    }
                }
                $interactivity = (string)$xml['interactivity'];
                switch ($interactivity) {
                    case "Fill in Blank":
                        // fill-in
                        $delimiter = isset($xml["answerDelimiter"]) && trim((string)$xml["answerDelimiter"]) != "" ? trim($xml["answerDelimiter"]) : ",";
                        foreach($markedwords as $i => $markedword) {
                            $qsubinteraction = json_decode(json_encode($subinteraction));

                            $qsubinteraction->name = $this->getLabelFromText("interaction number" . " " . $i);
                            $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                            $qsubinteraction->displayname = $this->getTextFromHtml($markedword);
                            $qsubinteraction->kind = 'fill-in';
                            $qsubinteraction->answer = str_replace($delimiter, '[,]', $this->getLabelFromHtml($markedword));
                            $subinteractions[] = $qsubinteraction;
                        }
                        break;
                    case "Drag Drop":
                        // match
                        $answer = '';
                        foreach($markedwords as $i => $markedword) {
                            if (strlen($answer) > 0)
                                $answer .= '[,]';
                            $answer .= $this->getLabelFromHtml($markedword) . '[.]' . $i;
                        }
                        $subinteraction->answer = $answer;
                        $subinteraction->kind = 'match';
                        $subinteractions[] = $subinteraction;
                        break;
                    case "Drop Down Menu":
                    default:
                        // choice
                        $delimiter = isset($xml["dropDownDelimiter"]) && trim((string)$xml["dropDownDelimiter"]) != "" ? trim($xml["dropDownDelimiter"]) : ",";
                        $noise = (string)$xml['noise'];
                        $noisedelimiter = isset($xml["noiseDelimiter"]) && trim((string)$xml["noiseDelimiter"]) != "" ? trim($xml["noiseDelimiter"]) : " ";
                        $noiseoptions = explode($noisedelimiter, $noise);
                        foreach($markedwords as $i => $markedword) {
                            $qsubinteraction = json_decode(json_encode($subinteraction));
                            $markedoptions = explode($delimiter, $markedword);
                            if (count($markedoptions) == 0)
                            {
                                $markedoptions[] = "";
                            }
                            $options = array();
                            $options = array_merge($noiseoptions, $markedoptions);
                            foreach($options as $j => $option) {
                                $options[$j] = $this->getLabelFromText($option);
                            }
                            sort($options);
                            $qsubinteraction->name = $this->getLabelFromText("interaction number" . " " . $i);
                            $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                            $qsubinteraction->displayname = $this->getTextFromHtml($markedoptions[0]);
                            $qsubinteraction->kind = 'choice';
                            $qsubinteraction->choicetype = 'Single Answer';
                            $qsubinteraction->choices = implode('[,]', $options);
                            $qsubinteraction->answer = $this->getLabelFromText($markedoptions[0]);
                            $subinteractions[] = $qsubinteraction;
                        }
                        break;
                }
                break;
            case 'grid':
                // match
                $answer = "";
                $rows = explode('||', (string)$xml["data"]);
                $rowCount = 1;
                $header = (isset($xml["header"]) ? (string)$xml["header"] : "");
                $fixedCells = (isset($xml["fixedCells"]) ? (string)$xml["fixedCells"] : "");
                $fixedRows = (isset($xml["fixedRows"]) ? (string)$xml["fixedRows"] : "");
                $fixedCols = (isset($xml["fixedCols"]) ? (string)$xml["fixedCols"] : "");
                foreach($rows as $i => $row)
                {
                    if ($rowCount == 1 && ($header == "row" || $header == "both"))
                    {
                        $rowCount++;
                        continue;
                    }
                    $columnCount = 1;

                    $columns = explode('|', $row);
                    foreach($columns as $j=>$column)
                    {
                        if ($columnCount == 1 && ($header == "col" || $header == "both"))
                        {
                            $columnCount++;
                            continue;
                        }
                        if(strpos($fixedCells,$columnCount . "," . $rowCount) === false &&
                           strpos($fixedRows, $rowCount) === false &&
                           strpos($fixedCols, $columnCount) === false)
                        {
                            if (strlen($answer) > 0)
                                $answer .= '[,]';
                            $answer .= $this->getLabelFromHtml((string)$column) . '[.]' . '[' . $columnCount . ',' . $rowCount . ']';

                        }
                        $columnCount++;
                    }
                    $rowCount++;
                }
                $subinteraction->answer = $answer;
                $subinteraction->kind = 'match';
                $subinteractions[] = $subinteraction;
                break;
            case 'interactiveText':
                // choice

                break;
            case 'mcq':
                $options = $xml->children();
                $cAnswer = '';
                $cChoices = '';
                for ($j = 0; $j < count($options); $j++) {
                    if ((string)$options[$j]['correct'] == 'true') {
                        if (strlen($cAnswer) > 0)
                            $cAnswer .= '[,]';
                        $cAnswer .= $this->getLabelFromHtml((string)$options[$j]['name']);
                    }
                    if (strlen($cChoices) > 0)
                        $cChoices .= '[,]';
                    $cChoices .= $this->getLabelFromHtml((string)$options[$j]['name']);
                }
                $subinteraction->question = $this->getTextFromHtml((string)$xml['prompt']);
                $subinteraction->answer = $cAnswer;
                $subinteraction->choices = $cChoices;
                $subinteraction->kind = 'choice';
                $subinteraction->choicetype = (string)$xml['type'];
                $subinteractions[] = $subinteraction;
                break;
            case 'mediaLesson':
                $mcqs = $xml->xpath('.//synchMCQ');
                for ($i = 0; $i < count($mcqs); $i++) {
                    $qsubinteraction = json_decode(json_encode($subinteraction));
                    if (isset($mcqs[$i]['name']) && trim((string)$mcqs[$i]['name']) != "") {
                        $qsubinteraction->name = $this->getLabelFromText((string)$mcqs[$i]['name']);
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                        $qsubinteraction->displayname = $this->getTextFromHtml((string)$mcqs[$i]['name']);

                    }
                    else {
                        $qsubinteraction->name = $this->getLabelFromHtml((string)$mcqs[$i]['text']);
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                        $qsubinteraction->displayname = $this->getTextFromHtml((string)$mcqs[$i]['text']);
                    }
                    $options = $mcqs[$i]->children();
                    $cAnswer = '';
                    $cChoices = '';
                    for ($j = 0; $j < count($options); $j++) {
                        if ((string)$options[$j]['correct'] == 'true') {
                            if (strlen($cAnswer) > 0)
                                $cAnswer .= '[,]';
                            $cAnswer .= $this->getLabelFromHtml((string)$options[$j]['name']);
                        }
                        if (strlen($cChoices) > 0)
                            $cChoices .= '[,]';
                        $cChoices .= $this->getLabelFromHtml((string)$options[$j]['name']);
                    }
                    $qsubinteraction->question = $this->getTextFromHtml((string)$mcqs[$i]['text']);
                    $qsubinteraction->answer = $cAnswer;
                    $qsubinteraction->choices = $cChoices;
                    $qsubinteraction->kind = 'choice';
                    $qsubinteraction->choicetype = (string)$mcqs[$i]['answerType'];
                    $subinteractions[] = $qsubinteraction;
                }
                break;
            case 'interactiveVideo':
                $mcqs = $xml->xpath('.//ivSynchMCQ');
                for ($i = 0; $i < count($mcqs); $i++) {
                    $qsubinteraction = json_decode(json_encode($subinteraction));
                    if (isset($d[$i]['name']) && trim((string)$mcqs[$i]['name']) != "") {
                        $qsubinteraction->name = $this->getLabelFromText((string)$mcqs[$i]['name']);
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                        $qsubinteraction->displayname = $this->getTextFromHtml((string)$mcqs[$i]['name']);
                    }
                    else {
                        $qsubinteraction->name = $this->getLabelFromHtml((string)$mcqs[$i]['text']);
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                        $qsubinteraction->displayname = $this->getTextFromHtml((string)$mcqs[$i]['text']);
                    }
                    $options = $mcqs[$i]->children();
                    $cAnswer = '';
                    $cChoices = '';
                    for ($j = 0; $j < count($options); $j++) {
                        if ((string)$options[$j]['correct'] == 'true') {
                            if (strlen($cAnswer) > 0)
                                $cAnswer .= '[,]';
                            $cAnswer .= $this->getLabelFromHtml((string)$options[$j]['name']);
                        }
                        if (strlen($cChoices) > 0)
                            $cChoices .= '[,]';
                        $cChoices .= $this->getLabelFromHtml((string)$options[$j]['name']);
                    }
                    $qsubinteraction->question = $this->getTextFromHtml((string)$mcqs[$i]['text']);
                    $qsubinteraction->answer = $cAnswer;
                    $qsubinteraction->choices = $cChoices;
                    $qsubinteraction->kind = 'choice';
                    $qsubinteraction->choicetype = (string)$mcqs[$i]['answerType'];
                    $subinteractions[] = $qsubinteraction;
                }
                break;
            case 'opinion':
                //numeric
                $subinteraction->kind = 'opinion';
                $classes = $xml->children();
                foreach($classes as $class)
                {
                    $qs = $class->children();
                    for ($i = 0; $i < count($qs); $i++) {
                        $qsubinteraction = json_decode(json_encode($subinteraction));
                        if (isset($qs[$i]['name'])) {
                            $qsubinteraction->name = $this->getLabelFromText((string)$qs[$i]['name']);
                        } else {
                            $qsubinteraction->name = $this->getLabelFromHtml((string)$qs[$i]['prompt']);
                        }
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                        $options = $qs[$i]->children();
                        $cAnswer = '';
                        $dAnswer = '';
                        for ($j = 0; $j < count($options); $j++) {
                            if (strlen($cAnswer) > 0)
                                $cAnswer .= '[,]';
                            $cAnswer .= $this->getLabelFromText((string)$options[$j]['name']);
                            if (strlen($dAnswer) > 0)
                                $dAnswer .= '[,]';
                            $dAnswer .= $this->getTextFromHtml((string)$options[$j]['text']);
                        }
                        if (isset($qs[$i]['name'])) {
                            $qsubinteraction->displayname = $this->getTextFromHtml((string)$qs[$i]['name']);
                        } else {
                            $qsubinteraction->displayname = $this->getTextFromHtml((string)$qs[$i]['prompt']);
                        }
                        $qsubinteraction->class = $this->getTextFromHtml((string)$class['name']);
                        $qsubinteraction->classtitle = $this->getTextFromHtml((string)$class['title']);
                        $qsubinteraction->question = $this->getTextFromHtml((string)$qs[$i]['prompt']);
                        $qsubinteraction->choices = $cAnswer;
                        $qsubinteraction->choicesdisplay = $dAnswer;
                        $qsubinteraction->choicetype = 'numeric';
                        $subinteractions[] = $qsubinteraction;
                    }
                }
                break;
            case 'quiz':
                //choice
                $subinteraction->kind = 'choice';
                $qs = $xml->children();
                for ($i = 0; $i < count($qs); $i++) {
                    $qsubinteraction = json_decode(json_encode($subinteraction));
                    $qsubinteraction->name = $this->getLabelFromText((string)$qs[$i]['name']);
                    if (!isset($qsubinteraction->name))
                    {
                        $qsubinteraction->name = $this->getLabelFromHtml((string)$qs[$i]['prompt']);
                    }
                    if (isset($qsubinteraction->name))
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $qsubinteraction->name;
                    else {
                        $qsubinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $i;
                    }
                    $options = $qs[$i]->children();
                    $cAnswer = '';
                    $cChoices = '';
                    for ($j = 0; $j < count($options); $j++) {
                        if ((string)$options[$j]['correct'] == 'true') {
                            if (strlen($cAnswer) > 0)
                                $cAnswer .= '[,]';
                            $cAnswer .= $this->getLabelFromText((string)$options[$j]['name']);
                        }
                        if (strlen($cChoices) > 0)
                            $cChoices .= '[,]';
                        $cChoices .= $this->getLabelFromText((string)$options[$j]['name']);
                    }
                    $qsubinteraction->question = $this->getTextFromHtml((string)$qs[$i]['prompt']);
                    $qsubinteraction->answer = $cAnswer;
                    $qsubinteraction->choices = $cChoices;
                    $qsubinteraction->choicetype = (string)$qs[$i]['type'];
                    $subinteractions[] = $qsubinteraction;
                }
                break;
            case 'textCorrection':
                // fill-in
                if (isset($xml['trackinglabel'])) {
                    $subinteraction->name = $this->getLabelFromText((string)$xml['trackinglabel']);
                    $subinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $subinteraction->name;
                }
                else {
                    $subinteraction->name = $this->getLabelFromHtml((string)$xml['introduction']);
                    if ($interaction->trackinglabelSet)
                        $subinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $interaction->name;
                    else
                        $subinteraction->xapiobjectid = $interaction->xapiobjectid . '/' . $subinteraction->name;
                }
                $subinteraction->displayname = $this->getTextFromHtml((string)$xml['name']);
                $subinteraction->kind = 'fill-in';
                $subinteraction->question = $this->getTextFromHtml((string)$xml['introduction']);
                $subinteraction->answer = $this->getLabelFromHtml((string)$xml['answer']);
                $subinteractions[] = $subinteraction;
                break;
            case 'textMatch':
                //match
                $subinteraction->kind = 'match';
                $answer = '';
                $cats = $xml->children();
                for ($i = 0; $i < count($cats); $i++) {
                    if (strlen($answer) > 0)
                        $answer .= '[,]';
                    $answer .= $this->getLabelFromHtml((string)$cats[$i]['p2']) . '[.]' . $this->getLabelFromHtml((string)$cats[$i]['p1']);
                }
                $subinteraction->answer = $answer;
                $subinteractions[] = $subinteraction;
                break;
            case 'timeline':
                //match
                $subinteraction->kind = 'match';
                $answer = '';
                $cats = $xml->children();
                for ($i = 0; $i < count($cats); $i++) {
                    if (strlen($answer) > 0)
                        $answer .= '[,]';
                    $answer .= $this->getLabelFromHtml((string)$cats[$i]['text']) . '[.]' . $this->getLabelFromHtml((string)$cats[$i]['name']);
                }
                $subinteraction->answer = $answer;
                $subinteractions[] = $subinteraction;
                break;
            case 'topXQ':

                break;
            case 'modelAnswer':
                // fill-in
                $subinteraction->kind = 'fill-in';
                $subinteraction->question = $this->getTextFromHtml((string)$xml['prompt']);
                $subinteraction->answer = $this->getTextFromHtml((string)$xml['feedback']);
                $subinteractions[] = $subinteraction;
                break;
        }

        return $subinteractions;
    }

    private function setPagexAPIId($project, $page)
    {
        // This is full of knowledge of how tracking is done in Xerte :-(
        // Get name of page
        // Use name if tracking label is set
        // ref module/xerte/xAPI/xttracking_xapi.js
        if (isset($page->node['trackinglabel'])) {
            $name = $this->getLabelFromHtml((string)$page->node['trackinglabel']);
        }
        else if (isset($page->node['name']) && (string)$page->node['name'] != '') {
            $name = $this->getLabelFromHtml((string)$page->node['name']);
        }
        else {
            $name = $page->index;
        }
        $page->xapiobjectid = $project->xapiobjectid . '/' . $name;
    }
    private function decodeInteraction($project, $page)    {
        global $xerte_toolkits_site;
        $interaction = new \stdClass();

        $interaction->page = $page->index;
        // This is full of knowledge of how tracking is done in Xerte :-(
        // Get name of page
        // Use name if tracking label is set
        // ref module/xerte/xAPI/xttracking_xapi.js
        if (isset($page->node['trackinglabel'])) {
            $interaction->name = $this->getLabelFromText((string)$page->node['trackinglabel']);
            $interaction->trackinglabelSet = true;
        }
        else if (isset($page->node['name']) && (string)$page->node['name'] != '') {
            $interaction->name = $this->getLabelFromHtml((string)$page->node['name']);
            $interaction->trackinglabelSet = false;
        }
        else {
            $interaction->name = $page->index;
        }

        $interaction->xapiobjectid = $project->xapiobjectid . "/" . $interaction->name;

        $interaction->displayname = $this->getTextFromHtml((string)$page->node['name']);
        $interaction->kind = 'numeric';
        $interaction->systemname = $page->node->getName();
        if (isset($page->node['unmarkForCompletion']))
            if ((string)$page->node['unmarkForCompletion'] === 'true')
                $interaction->completion = false;
            else
                $interaction->completion = true;
        else
            $interaction->completion = true;
        if (isset($page->node['grouping']))
            $interaction->grouping = (string)$page->node['grouping'];
        else
            $interaction->grouping = '';
        if (isset($page->node['trackingWeight'])) {
            $interaction->weighting = floatval((string)$page->node['trackingWeight']);
        }
        else
            $interaction->weighting = '1';
        $interaction->active = true;
        switch ($interaction->systemname) {
            case 'categories':
            case 'dictation':
            case 'gapFill':
            case 'grid':
            case 'interactiveText':
            case 'mcq':
            case 'mediaLesson':
            case 'interactiveVideo':
            case 'opinion':
            case 'quiz':
            case 'textCorrection':
            case 'textMatch':
            case 'timeline':
            case 'topXQ':
            case 'modelAnswer':
                $interaction->interaction = true;
                break;
            default:
                $interaction->interaction = false;
        }
        if ($interaction->interaction) {
            $interaction->subinteractions = $this->decodeSubInteractions($project, $page, $interaction);
        }

        return $interaction;
    }

    // Create a JSON structure with the full decoded details from theXML
    // and from the templatedetails table.
    // Is used by the catalog.php function and by the oai_pmh functionality (in future)
    // The point is to put this functionality as close to Xerte as possible
    public function detailedTemplateDecode($template_id, $dbrecord = null)
    {
        global $xerte_toolkits_site;

        $prefix = $xerte_toolkits_site->database_table_prefix;
        $project = new stdClass();

        if ($dbrecord == null) {
            // $template has two structures
            // db record which we will extract from the database
            $q = "select td.template_id, 
          otd.template_framework, 
          otd.template_name as template_type, 
          otd.display_name as type_display_name, 
          td.template_name,  
          td.creator_id as owner_userid, 
          ld.username as owner_username, 
          concat(ld.firstname, ' ', ld.surname) as owner_name,
          td.date_created, 
          td.date_modified, 
          td.date_accessed, 
          td.number_of_uses, 
          td.access_to_whom, 
          td.extra_flags,
          td.tsugi_published as lti_enabled,
          td.tsugi_xapi_enabled as xapi_enabled
          from {$prefix}templatedetails as td, 
          {$prefix}originaltemplatesdetails otd,
          {$prefix}logindetails ld 
          where td.template_type_id=otd.template_type_id and td.creator_id=ld.login_id and td.template_id=?";
            $params = array($template_id);

            $project->db_record = db_query_one($q, $params);
        }
        else {
            $project->db_record = $dbrecord;
        }
        $project->version = getVersion();
        $project->xmlstr = $this->xmlstr;

        // data_xml which contains the contents of the templates data.xml file
        // We're going to decode that


        // Get the main project parameters from the xml
        $project->id = $template_id;
        $project->name = $this->getTextFromHtml((string)$this->xml['name']);

        $project->xapiobjectid = $xerte_toolkits_site->site_url . $project->id;

        $project->system = 'xerte';
        $project->type = $project->db_record['template_framework'];
        $project->subtype = $project->db_record['template_type'];
        if (isset($project->db_record['xapi_enabled'])) {
            $project->xapi = ($project->db_record['xapi_enabled'] == '1' ? true : false);
        }
        else
        {
            $project->xapi = false;
        }
        if (isset($project->db_record['lti_enabled'])) {
            $project->lti = ($project->db_record['lti_enabled'] == '1' ? true : false);
        }
        else{
            $project->lti = false;
        }
        if (isset($this->xml['course']))
            $project->course = urldecode((string)$this->xml['course']);
        else
            $project->course = 'unknown';
        if (isset($this->xml['module']))
            $project->module = urldecode((string)$this->xml['module']);
        else
            $project->module = '';
        if (isset($this->xml['oaiPmhAgree']))
            $project->oaiPmhAgree = (string)$this->xml['oaiPmhAgree'];
        else
            $project->oaiPmhAgree = '';
        if (isset($this->xml['metaDescription']))
            $project->description = (string)$this->xml['metaDescription'];
        else
            $project->description = '';
        if (isset($this->xml['metaEducation']) && (string)$this->xml['metaEducation'] !== "")
            $project->education = (string)$this->xml['metaEducation'];
        else
            $project->education = 'unknown';
            //assent flag
        if (isset($this->xml['metaKeywords']))
            $project->keywords = (string)$this->xml['metaKeywords'];
        else
            $project->keywords = '';
        if (isset($this->xml['metaAuthor']))
            $project->author = (string)$this->xml['metaAuthor'];
        else
            $project->author = '';
        $project->active = true;
        if (isset($this->xml['trackingPassed']))
            $project->passingpercentage = $this->normalizePercentage((string)$this->xml['trackingPassed']);
        else
            $project->passingpercentage = $this->normalizePercentage('55');
        // Bleehhh site uses metaCategory (and category is used for something else)
        if (isset($this->xml['metaCategory']) && (string)$this->xml['metaCategory'] !== "")
            $project->category = (string)$this->xml['category'];
        else {
            if ($project->type != 'site' && isset($this->xml['category']) && (string)$this->xml['category'] !== "")
                $project->category = (string)$this->xml['category'];
            else
                $project->category = 'unknown';
        }
        $project->language = (string)$this->xml['language'];
        $project->access = $project->db_record['access_to_whom'];
        if ($project->type != 'xerte') {
            $project->autointeractions = false;
        } else {
            $project->autointeractions = true;
        }

        $project->interactions = array();
        if ($project->autointeractions) {
            for ($i = 0; $i < count($this->pages); $i++) {
                $this->setPagexAPIId($project, $this->pages[$i]);
                $page = new \stdClass();
                $page->index = $this->pages[$i]->index;
                $page->name = $this->pages[$i]->name;
                $page->type = $this->pages[$i]->type;
                $page->xapiobjectid = $this->pages[$i]->xapiobjectid;
                $page->interactions[] = $this->decodeInteraction($project, $this->pages[$i]);
                $project->pages[] = $page;
            }
        }

        return $project;
    }

}

<?php
require_once(dirname(__FILE__) . "/../../config.php");
require_once "./anthropicApi.php";
require_once "./openaiApi.php";
require_once "./mistralApi.php";

$types = ["wordsearch","topxq","timeline","textmatch","texthighlight","textgraphics","textcorrection","textbox","textarea","text","tabledoc","summary","sound","singleimg","selectlist","quiz","orient","opinion","nestedtab","nestedpage","nestedcolumnpage","navpage","nav","mptext","movie","morphimages","modify","media360","mcq","ivoverlaypanel","inventory","interactivetext","imgseries","imageviewer","imagesequence","image","hangman","grid","gapfill","flickr","flashcards","dialog","description","crossword","columnpage","categories","buttonsequence","buttonquestion","bullets","bleedingimage","audioslideshow"];



$openai = new openaiApi("openai");
$mistral = new mistralApi("mistral");
$anthropic = new anthropicApi("anthropic");
foreach($types as $type) {
	$openai->ai_request([], $type, "", "");
	$mistral->ai_request([], $type, "", "");
	$anthropic->ai_request([], $type, "", "");
}

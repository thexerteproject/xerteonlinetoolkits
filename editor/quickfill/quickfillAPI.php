<?php
error_reporting(0);

require_once(dirname(__FILE__) . "/../../config.php");

$type = x_clean_input($_POST["type"]);
$parameters = x_clean_input($_POST["parameters"]);
//todo hardcoded language
$language = 'en-GB';

$allowed_types = ['quiz',
    'opinion',
    'tabNavExtra',
    'columnPage',
    'audioSlideshow',
    'imageSequence', 'thumbnailViewer',
    'SictTimeline',
    'transcriptReader',
    'flashCards',
    'list',
    'nav',
    'perspectives',
    'annotatedDiagram',
    'hotspotGroup',
    'topXQ',
    'buttonSequence',
    'categories',
    'decision',
    'dialog',
    'dictation',
    'documentation',
    'page',
    'section',
    'dragDropLabel',
    'hotspotImage',
    'hotSpotQuestion',
    'interactiveText',
    'ivOverlayPanel',
    'inventory',
    'textMatch',
    'mcq',
    'opinion',
    'timeline',
    'memory',
    'crossword',
    'links',
    'adaptiveContent',
    'mediaLesson',
    'panel',
    'mediaPanel'];

if (!in_array($type, $allowed_types)) {
    die(json_encode(["status" => "error", "message" => "quickfill support is not available for this page."]));
}

require_once ("basic_quickfill.php");

$quickfillApi = new basicquickfill();

$result = $quickfillApi->qf_request($type, $parameters, $language);

if ($result->status) {
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}
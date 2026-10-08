<?php
/**
 * Workspace project panel data for a template (JSON, no HTML fragments).
 */

require_once dirname(__FILE__) . "/../../../config.php";

require_once dirname(__FILE__) . "/../user_library.php";
require_once dirname(__FILE__) . "/../template_status.php";
require_once dirname(__FILE__) . "/../services/PropertiesRestService.php";
require_once dirname(__FILE__) . "/../properties/properties_library.php";

/**
 * @return array<string,mixed>
 */
function template_workspace_get_info($template_id)
{
    properties_rest_load_language_sets();

    $template_id = (int) $template_id;
    $_SESSION["XAPI_PROXY"] = $template_id;

    $statistics_available = statistics_prepare($template_id);

    $info = array(
        'template_id' => $template_id,
        'role' => get_user_access_rights($template_id),
        'panels' => array(
            'project' => properties_rest_project_payload($template_id, false, ''),
            'media' => properties_rest_media_quota_payload($template_id),
            'access' => properties_rest_access_payload($template_id, false),
            'sharing' => properties_rest_sharing_status_payload($template_id),
            'rss' => properties_rest_rss_payload($template_id, false),
            'syndication' => properties_rest_syndication_payload($template_id, false),
            'xml' => properties_rest_xml_payload($template_id, false),
            'peer' => properties_rest_peer_payload($template_id, false),
        ),
        'fetch_statistics' => (bool) $statistics_available->available,
        'lrs' => isset($statistics_available->lrs) ? $statistics_available->lrs : null,
        'dashboard' => isset($statistics_available->dashboard) ? $statistics_available->dashboard : null,
        'lti_published' => isset($statistics_available->published) ? (bool) $statistics_available->published : false,
        'lti_url' => isset($statistics_available->url) ? $statistics_available->url : null,
        'xapi_url' => isset($statistics_available->xapi_url) ? $statistics_available->xapi_url : null,
    );

    return $info;
}

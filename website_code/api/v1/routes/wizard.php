<?php
/**
 * Wizard REST routes — merged .xwd XML for the editor.
 */

global $xerte_toolkits_site;
require_once $xerte_toolkits_site->root_file_path . 'website_code/php/services/WizardMergedDefinitionService.php';

function wizard_rest_api_dispatch($method, $path, array $params)
{
    if ($method === 'GET' && $path === 'wizard/definition') {
        $result = wizard_get_merged_definition_for_rest($params);
        if (!$result['ok']) {
            ApiResponse::error($result['code'], $result['error'], $result['message']);
            exit;
        }
        ApiResponse::success(array('xml' => $result['xml']));
        exit;
    }

    ApiResponse::error(404, 'unknown_wizard_route', 'No handler for ' . $method . ' ' . $path);
    exit;
}

<?php
/**
 * Workspace Properties REST routes.
 */

global $xerte_toolkits_site;
require_once $xerte_toolkits_site->root_file_path . 'website_code/php/services/WorkspacePropertiesRestHandlers.php';

function workspaceproperties_rest_api_dispatch($method, $path, array $params)
{
    workspaceproperties_rest_route($method, $path, $params);
}


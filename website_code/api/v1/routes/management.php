<?php
/**
 * Admin/Management REST routes.
 */

global $xerte_toolkits_site;
require_once $xerte_toolkits_site->root_file_path . 'website_code/php/services/ManagementRestHandlers.php';

function management_rest_api_dispatch($method, $path, array $params)
{
    management_rest_route($method, $path, $params);
}


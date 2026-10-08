<?php
/**
 * Properties REST routes — delegates to PropertiesRestHandlers.
 */

global $xerte_toolkits_site;
require_once $xerte_toolkits_site->root_file_path . 'website_code/php/services/PropertiesRestHandlers.php';

function properties_rest_api_dispatch($method, $path, array $params)
{
    $sub = substr($path, strlen('properties/'));
    properties_rest_route($method, $sub, $params);
}

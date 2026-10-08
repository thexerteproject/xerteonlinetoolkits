<?php
/**
 * Workspace Properties REST dispatcher.
 */

require_once dirname(__FILE__) . '/WorkspacePropertiesRestService.php';

function workspaceproperties_rest_route($method, $path, array $params)
{
    try {
        $sub = substr($path, strlen('workspaceproperties/'));
        switch ($sub) {
            case 'projects/menu':
                ApiResponse::success(workspaceproperties_rest_projects_menu());
                exit;
            case 'projects/my':
                ApiResponse::success(workspaceproperties_rest_my_projects());
                exit;
            case 'projects/shared':
                ApiResponse::success(workspaceproperties_rest_shared_projects());
                exit;
            case 'projects/public':
                ApiResponse::success(workspaceproperties_rest_public_projects());
                exit;
            case 'projects/usage':
                ApiResponse::success(workspaceproperties_rest_usage_projects());
                exit;
            case 'projects/rss':
                ApiResponse::success(workspaceproperties_rest_rss_projects());
                exit;
            case 'projects/open':
                ApiResponse::success(workspaceproperties_rest_open_projects());
                exit;
            case 'projects/peer':
                ApiResponse::success(workspaceproperties_rest_peer_projects());
                exit;
            case 'projects/xml':
                ApiResponse::success(workspaceproperties_rest_xml_projects());
                exit;
            case 'my-properties':
                ApiResponse::success(workspaceproperties_rest_my_properties());
                exit;
            case 'folder-rss':
                ApiResponse::success(workspaceproperties_rest_folder_rss());
                exit;
            case 'api-keys':
                ApiResponse::success(workspaceproperties_rest_api_keys());
                exit;
            default:
                ApiResponse::error(404, 'unknown_workspaceproperties_route', 'Unknown workspaceproperties route: ' . $sub);
                exit;
        }
    } catch (Throwable $e) {
        ApiResponse::error(500, 'workspaceproperties_error', $e->getMessage());
        exit;
    }
}


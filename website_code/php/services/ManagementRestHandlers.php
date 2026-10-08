<?php
/**
 * Admin/Management REST dispatcher.
 */

require_once dirname(__FILE__) . '/ManagementRestService.php';

function management_rest_route($method, $path, array $params)
{
    try {
        $sub = substr($path, strlen('management/'));

        // Panels (GET)
        if ($method === 'GET') {
            switch ($sub) {
                case 'feeds':
                    ApiResponse::success(management_rest_feeds_panel());
                    exit;
                case 'licenses':
                    ApiResponse::success(management_rest_licenses_panel());
                    exit;
                case 'categories':
                    ApiResponse::success(management_rest_categories_panel());
                    exit;
                case 'educationlevels':
                    ApiResponse::success(management_rest_educationlevels_panel());
                    exit;
                case 'grouping':
                    ApiResponse::success(management_rest_grouping_panel());
                    exit;
                case 'course':
                    ApiResponse::success(management_rest_course_panel());
                    exit;
                default:
                    break;
            }
        }

        // Mutations (POST)
        if ($method === 'POST') {
            switch ($sub) {
                case 'feeds/remove':
                    ApiResponse::success(management_rest_remove_feed($params));
                    exit;
                case 'licenses/remove':
                    ApiResponse::success(management_rest_remove_license($params));
                    exit;
                case 'licenses/new':
                    ApiResponse::success(management_rest_new_license($params));
                    exit;
                case 'categories/remove':
                    ApiResponse::success(management_rest_remove_category($params));
                    exit;
                case 'categories/new':
                    ApiResponse::success(management_rest_new_category($params));
                    exit;
                case 'educationlevels/remove':
                    ApiResponse::success(management_rest_remove_educationlevel($params));
                    exit;
                case 'educationlevels/new':
                    ApiResponse::success(management_rest_new_educationlevel($params));
                    exit;
                case 'grouping/remove':
                    ApiResponse::success(management_rest_remove_grouping($params));
                    exit;
                case 'grouping/new':
                    ApiResponse::success(management_rest_new_grouping($params));
                    exit;
                case 'course/remove':
                    ApiResponse::success(management_rest_remove_course($params));
                    exit;
                case 'course/new':
                    ApiResponse::success(management_rest_new_course($params));
                    exit;

                // Uploads (multipart)
                case 'templates/upload':
                    ApiResponse::success(management_rest_upload_template());
                    exit;
                case 'themes/upload':
                    ApiResponse::success(management_rest_upload_theme());
                    exit;
                default:
                    break;
            }
        }

        ApiResponse::error(404, 'unknown_management_route', 'Unknown management route: ' . $sub);
        exit;
    } catch (Throwable $e) {
        ApiResponse::error(500, 'management_error', $e->getMessage());
        exit;
    }
}


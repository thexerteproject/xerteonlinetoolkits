<?php
/**
 * Xerte REST API v1 — JSON responses (see route list below).
 * Call: .../website_code/api/v1/index.php?route=session/keepalive
 * XML payloads (preview.xml, wizard .xwd) are returned inside JSON as { "xml": "..." } unless noted.
 * GET wizard/definition?template_id=… — merged wizard (.xwd) for editor; requires login + template access.
 */

require_once dirname(__FILE__) . '/../../../config.php';
require_once dirname(__FILE__) . '/lib/ApiResponse.php';
require_once dirname(__FILE__) . '/lib/ApiRequest.php';
require_once dirname(__FILE__) . '/lib/ApiAuth.php';
require_once dirname(__FILE__) . '/lib/ApiRouter.php';

$method = ApiRouter::getMethod();
$path = ApiRouter::getPath();
$params = ApiRequest::getParams();

if ($path === '') {
    ApiResponse::error(400, 'bad_route', 'Missing route (use ?route=... or PATH_INFO)');
    exit;
}

if ($method === 'GET' && $path === 'session/keepalive') {
    ob_start();
    require $xerte_toolkits_site->root_file_path . 'website_code/php/keepalive.php';
    $raw = trim(ob_get_clean());
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        ApiResponse::success($decoded);
    } else {
        ApiResponse::success(array('refreshed' => true));
    }
    exit;
}

if ($method === 'POST' && $path === 'learning-objects/save') {
    ApiAuth::requireLoggedInOrAdmin();
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/services/LearningObjectSaveService.php';
    $result = learning_object_save_from_request($params);
    if (!$result['ok']) {
        $code = isset($result['code']) ? $result['code'] : 'save_failed';
        $status = ($code === 'forbidden') ? 403 : 400;
        ApiResponse::error($status, $code, $result['message']);
        exit;
    }
    ApiResponse::success(array('saved' => true, 'mode' => $result['mode']));
    exit;
}

if ($method === 'GET' && $path === 'preview-xml') {
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/services/TemplatePreviewXmlService.php';
    $file = isset($params['file']) ? x_clean_input($params['file']) : '';
    $result = template_preview_xml_load($file);
    if (!$result['ok']) {
        ApiResponse::error(404, $result['code'], $result['message']);
        exit;
    }
    ApiResponse::success(array('xml' => $result['xml']));
    exit;
}

if ($method === 'POST' && $path === 'editor/quickfill') {
    ApiAuth::requireLoggedIn();
    require_once $xerte_toolkits_site->root_file_path . 'editor/quickfill/basic_quickfill.php';
    $type = x_clean_input($params['type']);
    $parameters = x_clean_input($params['parameters']);
    $language = $_SESSION['toolkits_language'];
    $quickfillApi = new basicquickfill();
    $result = $quickfillApi->qf_request($type, $parameters, $language);
    ApiResponse::success(array('status' => 'success', 'result' => $result));
    exit;
}

if ($method === 'POST' && $path === 'workspace/projects-sorted') {
    ApiAuth::requireLoggedIn();
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/display_library.php';
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/user_library.php';
    $sort_type = isset($params['sort_type']) ? x_clean_input($params['sort_type']) : 'date_down';
    $_SESSION['sort_type'] = $sort_type;
    $json = get_users_projects($_SESSION['sort_type']);
    ApiResponse::success(json_decode($json));
    exit;
}

if ($method === 'POST' && $path === 'templates/info') {
    ApiAuth::requireLoggedIn();
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/templates/TemplateWorkspaceInfoService.php';
    if (!isset($params['template_id'])) {
        ApiResponse::error(400, 'missing_template_id', 'No template id');
        exit;
    }
    $template_id = x_clean_input($params['template_id'], 'numeric');
    if (!has_rights_to_this_template($template_id, $_SESSION['toolkits_logon_id']) && !is_user_permitted("projectadmin")) {
        ApiResponse::error(403, 'forbidden', 'No access to this template');
        exit;
    }
    ApiResponse::success(template_workspace_get_info($template_id));
    exit;
}

if ($method === 'POST' && $path === 'folders/info') {
    ApiAuth::requireLoggedIn();
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/folders/WorkspaceFolderInfoService.php';
    if (!isset($params['folder_id'])) {
        ApiResponse::error(400, 'missing_folder_id', 'No folder id');
        exit;
    }
    ApiResponse::success(folder_workspace_get_info($params['folder_id']));
    exit;
}

if ($method === 'POST' && $path === 'groups/info') {
    ApiAuth::requireLoggedIn();
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/groups/WorkspaceGroupInfoService.php';
    if (!isset($params['group_id']) || !isset($params['group_name'])) {
        ApiResponse::error(400, 'missing_group', 'group_id and group_name required');
        exit;
    }
    ApiResponse::success(group_workspace_get_info($params['group_name'], $params['group_id']));
    exit;
}

if ($method === 'POST' && $path === 'management/group-members') {
    ApiAuth::requireLoggedIn();
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/user_library.php';
    if (!is_user_permitted("useradmin")) {
        ApiResponse::error(403, 'forbidden', 'Management access required');
        exit;
    }
    _load_language_file("/website_code/php/management/user_groups.inc");
    _load_language_file("/website_code/php/management/users.inc");
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/management/GroupMembersData.php';
    $group_id = isset($params['group_id']) ? $params['group_id'] : '';
    $data = management_get_group_members_data($group_id);
    if ($data === null) {
        ApiResponse::error(400, 'invalid_group', 'Invalid group');
        exit;
    }
    $data['i18n'] = array(
        'headingPrefix' => USER_GROUPS_MANAGEMENT_GROUP_MEMBERS,
        'noMembers' => USER_GROUPS_MANAGEMENT_NO_MEMBERS,
        'oneMember' => USER_GROUPS_MANAGEMENT_ONE_MEMBER,
        'membersCount' => USER_GROUPS_MANAGEMENT_MEMBERS_COUNT,
        'toggle' => USERS_TOGGLE,
        'removeMember' => USER_GROUPS_MANAGEMENT_REMOVE_MEMBER,
        'usersId' => USERS_ID,
        'usersFirst' => USERS_FIRST,
        'usersKnown' => USERS_KNOWN,
        'usersUsername' => USERS_USERNAME,
    );
    ApiResponse::success($data);
    exit;
}

if ($method === 'POST' && $path === 'user/preferences') {
    ApiAuth::requireLoggedIn();
    require_once $xerte_toolkits_site->root_file_path . 'website_code/php/services/UserPreferencesRestService.php';
    $res = user_preferences_rest_save($params);
    if (!is_array($res) || empty($res['ok'])) {
        $status = is_array($res) && isset($res['status']) ? (int) $res['status'] : 500;
        $code = is_array($res) && isset($res['code']) ? (string) $res['code'] : 'preferences_error';
        $msg = is_array($res) && isset($res['message']) ? (string) $res['message'] : 'Preferences error';
        ApiResponse::error($status, $code, $msg);
        exit;
    }
    ApiResponse::success($res['data']);
    exit;
}

if ($method === 'GET' && $path === 'system/health') {
    ApiResponse::success(array('api' => 'v1', 'time' => date('c')));
    exit;
}

if (strpos($path, 'properties/') === 0) {
    ApiAuth::requireLoggedIn();
    require_once dirname(__FILE__) . '/routes/properties.php';
    properties_rest_api_dispatch($method, $path, $params);
    exit;
}

if (strpos($path, 'wizard/') === 0) {
    ApiAuth::requireLoggedIn();
    require_once dirname(__FILE__) . '/routes/wizard.php';
    wizard_rest_api_dispatch($method, $path, $params);
    exit;
}

if (strpos($path, 'workspaceproperties/') === 0) {
    ApiAuth::requireLoggedIn();
    require_once dirname(__FILE__) . '/routes/workspaceproperties.php';
    workspaceproperties_rest_api_dispatch($method, $path, $params);
    exit;
}

if (strpos($path, 'management/') === 0) {
    ApiAuth::requireLoggedIn();
    require_once dirname(__FILE__) . '/routes/management.php';
    management_rest_api_dispatch($method, $path, $params);
    exit;
}

ApiResponse::error(404, 'unknown_route', 'No handler for ' . $method . ' ' . $path);

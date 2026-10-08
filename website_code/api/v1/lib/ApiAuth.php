<?php
/**
 * Session checks for REST endpoints (same rules as legacy PHP scripts).
 */
class ApiAuth
{
    public static function requireLoggedIn(): void
    {
        global $xerte_toolkits_site;
        require_once($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->php_library_path . 'user_library.php');
        if (empty($_SESSION['toolkits_logon_id'])) {
            ApiResponse::error(401, 'auth_required', 'Please login');
            exit;
        }
    }

    public static function requireLoggedInOrAdmin(): void
    {
        global $xerte_toolkits_site;
        require_once($xerte_toolkits_site->root_file_path . $xerte_toolkits_site->php_library_path . 'user_library.php');
        if (!isset($_SESSION['toolkits_logon_username']) && !is_user_admin()) {
            ApiResponse::error(401, 'auth_required', 'Session is invalid or expired');
            exit;
        }
    }
}

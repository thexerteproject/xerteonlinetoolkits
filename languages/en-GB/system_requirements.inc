<?php
/**
 * Language strings for system_requirements.php
 */

// Page and sections
define('SYSTEM_REQ_PAGE_TITLE', 'Environment Report');
define('SYSTEM_REQ_SERVER_INFORMATION', 'Server Information');

// Table headers / labels
define('SYSTEM_REQ_ITEM', 'Item');
define('SYSTEM_REQ_VALUE', 'Value');
define('SYSTEM_REQ_PHP_VERSION', 'PHP Version');
define('SYSTEM_REQ_APACHE_VERSION', 'Apache Version');
define('SYSTEM_REQ_MYSQL_VERSION', 'MySQL/MariaDB Version');

// PHP Configuration
define('SYSTEM_REQ_PHP_CONFIGURATION', 'PHP Configuration');
define('SYSTEM_REQ_DIRECTIVE', 'Directive');

define('SYSTEM_REQ_UPLOAD_MAX_FILESIZE', 'upload_max_filesize');
define('SYSTEM_REQ_UPLOAD_MAX_FILESIZE_INFO', 'Defines the maximum file size users can upload, including exported projects, so typically 150MB, or 200MB, is a suitable value.');

define('SYSTEM_REQ_POST_MAX_SIZE', 'post_max_size');
define('SYSTEM_REQ_POST_MAX_SIZE_INFO', 'Should be larger than, or double, the upload_max_filesize value to support import of exported projects e.g. 300MB.');

define('SYSTEM_REQ_MEMORY_LIMIT', 'memory_limit');
define('SYSTEM_REQ_MEMORY_LIMIT_INFO', 'Often too low by default. A value like 512M is typically more suitable.');

define('SYSTEM_REQ_MORE_INFO', 'Further info');

// Extensions section
define('SYSTEM_REQ_EXTENSIONS_HEADING', 'PHP Extensions (Required & Optional)');
define('SYSTEM_REQ_EXTENSION', 'Extension');
define('SYSTEM_REQ_STATUS', 'Status (Installed and enabled)');
define('SYSTEM_REQ_OPTIONAL_ENABLED', 'Optional (Enabled)');
define('SYSTEM_REQ_OPTIONAL_NOT_INSTALLED', 'Optional (Not Installed)');

define('SYSTEM_REQ_YES', 'Yes');
define('SYSTEM_REQ_NO', 'No');

// Directory permissions
define('SYSTEM_REQ_DIR_PERMISSIONS', 'Directory Write Permissions');
define('SYSTEM_REQ_DIRECTORY', 'Directory');
define('SYSTEM_REQ_WRITABLE', 'Writable');

// Logins
define('SYSTEM_REQ_LAST_LOGINS', 'Last 10 Logins');
define('SYSTEM_REQ_USERNAME', 'Username');
define('SYSTEM_REQ_NAME', 'Name');
define('SYSTEM_REQ_LAST_LOGIN', 'Last login');
define('SYSTEM_REQ_NO_RECENT_LOGINS', 'No recent logins found or tracking not available.');

// Errors
define('SYSTEM_REQ_DB_QUERY_FAILED', 'Database query failed.');

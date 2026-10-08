<?php
/**
 * Workspace Properties REST payload builders (no HTML fragments).
 */

require_once dirname(__FILE__) . '/../../../config.php';

function workspaceproperties_rest_load_language_sets()
{
    _load_language_file('/website_code/php/workspaceproperties/workspace_library.inc');
    _load_language_file('/website_code/php/workspaceproperties/shared_templates_template.inc');
    _load_language_file('/website_code/php/workspaceproperties/usage_templates_template.inc');
    _load_language_file('/website_code/php/workspaceproperties/peer_templates_template.inc');
    _load_language_file('/website_code/php/workspaceproperties/rss_templates_template.inc');
    _load_language_file('/website_code/php/workspaceproperties/xml_templates_template.inc');
    _load_language_file('/website_code/php/workspaceproperties/syndication_templates_template.inc');
    _load_language_file('/website_code/php/workspaceproperties/my_properties_template.inc');
    _load_language_file('/website_code/php/workspaceproperties/folder_rss_templates_template.inc');
    _load_language_file('/website_code/php/workspaceproperties/api_template.inc');
}

function workspaceproperties_rest_projects_menu()
{
    workspaceproperties_rest_load_language_sets();
    return array(
        'panel' => 'projects-menu',
        'tabs' => array(
            array('id' => 'my', 'label' => WORKSPACE_LIBRARY_MY),
            array('id' => 'shared', 'label' => WORKSPACE_LIBRARY_SHARED),
            array('id' => 'public', 'label' => WORKSPACE_LIBRARY_PUBLIC),
            array('id' => 'usage', 'label' => WORKSPACE_LIBRARY_USAGE),
            array('id' => 'peer', 'label' => WORKSPACE_LIBRARY_PEER),
            array('id' => 'rss', 'label' => WORKSPACE_LIBRARY_RSS),
            array('id' => 'xml', 'label' => WORKSPACE_LIBRARY_XML),
            array('id' => 'open', 'label' => WORKSPACE_LIBRARY_OPEN),
        ),
        'defaultTab' => 'my',
    );
}

function workspaceproperties_rest_my_projects()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $rows = db_query("select template_id, template_name from {$p}templatedetails where creator_id= ? ORDER BY date_created DESC", array($_SESSION['toolkits_logon_id']));
    usort($rows, function ($a, $b) { return $a['template_id'] > $b['template_id']; });
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', ' ', $r['template_name']),
            'previewUrl' => $xerte_toolkits_site->site_url . 'preview.php?template_id=' . (int) $r['template_id'],
        );
    }
    return array(
        'panel' => 'projects-my',
        'caption' => WORKSPACE_LIBRARY_MY_PROJECTS_INTRO,
        'columns' => array(
            array('id' => 'templateId', 'label' => WORKSPACE_LIBRARY_TEMPLATE_ID, 'narrow' => true),
            array('id' => 'name', 'label' => WORKSPACE_LIBRARY_TEMPLATE_NAME),
        ),
        'items' => $items,
        'i18n' => array('linkWindow' => WORKSPACE_LIBRARY_LINK_WINDOW),
    );
}

function workspaceproperties_rest_shared_projects()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "select td.template_id, td.template_name, ld.firstname, ld.surname from {$p}logindetails ld, {$p}templatedetails td, {$p}templaterights tr where tr.user_id= ? and td.template_id = tr.template_id and td.creator_id = ld.login_id";
    $rows = db_query($sql, array($_SESSION['toolkits_logon_id']));
    usort($rows, function ($a, $b) { return $a['template_id'] > $b['template_id']; });
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', ' ', $r['template_name']),
            'creator' => trim($r['firstname'] . ' ' . $r['surname']),
            'previewUrl' => $xerte_toolkits_site->site_url . 'preview.php?template_id=' . (int) $r['template_id'],
        );
    }
    return array(
        'panel' => 'projects-shared',
        'caption' => SHARED_TEMPLATE_INTRO,
        'columns' => array(
            array('id' => 'templateId', 'label' => WORKSPACE_LIBRARY_TEMPLATE_ID, 'narrow' => true),
            array('id' => 'name', 'label' => WORKSPACE_LIBRARY_TEMPLATE_NAME),
            array('id' => 'creator', 'label' => SHARED_TEMPLATE_CREATOR),
        ),
        'items' => $items,
        'i18n' => array('linkWindow' => WORKSPACE_LIBRARY_LINK_WINDOW),
    );
}

function workspaceproperties_rest_public_projects()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "select td.template_id, td.template_name, td.access_to_whom from {$p}templatedetails td, {$p}templaterights tr where (access_to_whom = ? or access_to_whom = ? or access_to_whom like ?) AND tr.user_id = ? and tr.template_id = td.template_id ORDER BY template_name DESC";
    $rows = db_query($sql, array('public', 'password', 'other%', $_SESSION['toolkits_logon_id']));
    usort($rows, function ($a, $b) { return $a['template_id'] > $b['template_id']; });
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', ' ', $r['template_name']),
            'access' => $r['access_to_whom'],
            'playUrl' => $xerte_toolkits_site->site_url . 'play.php?template_id=' . (int) $r['template_id'],
        );
    }
    return array(
        'panel' => 'projects-public',
        'caption' => WORKSPACE_LIBRARY_PUBLIC_PROJECTS_INTRO,
        'columns' => array(
            array('id' => 'templateId', 'label' => WORKSPACE_LIBRARY_TEMPLATE_ID, 'narrow' => true),
            array('id' => 'name', 'label' => WORKSPACE_LIBRARY_TEMPLATE_NAME),
            array('id' => 'access', 'label' => WORKSPACE_LIBRARY_ACCESS),
        ),
        'items' => $items,
        'i18n' => array('linkWindow' => WORKSPACE_LIBRARY_LINK_WINDOW),
    );
}

function workspaceproperties_rest_usage_projects()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "select td.template_id, td.template_name, td.number_of_uses from {$p}templatedetails td, {$p}templaterights tr where tr.user_id= ? and td.template_id = tr.template_id and td.number_of_uses > 0";
    $rows = db_query($sql, array($_SESSION['toolkits_logon_id']));
    usort($rows, function ($a, $b) { return $a['number_of_uses'] < $b['number_of_uses']; });
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', ' ', $r['template_name']),
            'uses' => (int) ($r['number_of_uses'] ? $r['number_of_uses'] : 0),
            'previewUrl' => $xerte_toolkits_site->site_url . 'preview.php?template_id=' . (int) $r['template_id'],
        );
    }
    return array(
        'panel' => 'projects-usage',
        'caption' => USAGE_TEMPLATE_INTRO,
        'columns' => array(
            array('id' => 'templateId', 'label' => WORKSPACE_LIBRARY_TEMPLATE_ID, 'narrow' => true),
            array('id' => 'name', 'label' => WORKSPACE_LIBRARY_TEMPLATE_NAME),
            array('id' => 'uses', 'label' => USAGE_TEMPLATE_STATS),
        ),
        'items' => $items,
        'i18n' => array('linkWindow' => WORKSPACE_LIBRARY_LINK_WINDOW),
    );
}

function workspaceproperties_rest_peer_projects()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "select td.template_id, td.template_name, ashr.extra from {$p}templatedetails td, {$p}additional_sharing ashr where td.creator_id= ? AND td.template_id  = ashr.template_id and ashr.sharing_type=?";
    $rows = db_query($sql, array($_SESSION['toolkits_logon_id'], 'peer'));
    usort($rows, function ($a, $b) { return $a['template_id'] > $b['template_id']; });
    $items = array();
    foreach ($rows as $r) {
        $extra = isset($r['extra']) ? explode(',', $r['extra']) : array();
        $pwd = isset($extra[0]) ? $extra[0] : '';
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', ' ', $r['template_name']),
            'password' => $pwd,
            'peerUrl' => $xerte_toolkits_site->site_url . 'peer.php?template_id=' . (int) $r['template_id'],
        );
    }
    return array(
        'panel' => 'projects-peer',
        'caption' => PEER_REVIEW_INTRO,
        'columns' => array(
            array('id' => 'templateId', 'label' => WORKSPACE_LIBRARY_TEMPLATE_ID, 'narrow' => true),
            array('id' => 'name', 'label' => WORKSPACE_LIBRARY_TEMPLATE_NAME),
            array('id' => 'password', 'label' => PEER_REVIEW_PSWD),
        ),
        'items' => $items,
        'i18n' => array('linkWindow' => WORKSPACE_LIBRARY_LINK_WINDOW, 'copy' => PEER_REVIEW_COPY),
    );
}

function workspaceproperties_rest_rss_projects()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "select td.template_id, td.template_name, ts.rss, ts.export, ts.syndication, ts.category from {$p}templatedetails td, {$p}templatesyndication ts where td.creator_id= ? and td.template_id  = ts.template_id and (ts.rss= ? or ts.export = ? or ts.syndication = ?)";
    $rows = db_query($sql, array($_SESSION['toolkits_logon_id'], 'true', 'true', 'true'));
    usort($rows, function ($a, $b) { return $a['template_id'] > $b['template_id']; });
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', ' ', $r['template_name']),
            'rss' => ($r['rss'] === 'true'),
            'export' => ($r['export'] === 'true'),
            'open' => ($r['syndication'] === 'true'),
            'category' => ($r['syndication'] === 'true') ? $r['category'] : null,
            'previewUrl' => $xerte_toolkits_site->site_url . 'preview.php?template_id=' . (int) $r['template_id'],
        );
    }
    return array(
        'panel' => 'projects-rss',
        'caption' => RSS_WORKSPACE_INTRO,
        'columns' => array(
            array('id' => 'templateId', 'label' => WORKSPACE_LIBRARY_TEMPLATE_ID, 'narrow' => true),
            array('id' => 'name', 'label' => WORKSPACE_LIBRARY_TEMPLATE_NAME),
            array('id' => 'rss', 'label' => RSS_WORKSPACE_RSS, 'icon' => true),
            array('id' => 'export', 'label' => RSS_WORKSPACE_EXPORT, 'icon' => true),
            array('id' => 'open', 'label' => RSS_WORKSPACE_OPEN, 'icon' => true),
            array('id' => 'category', 'label' => RSS_WORKSPACE_OPEN_CATEGORY),
        ),
        'items' => $items,
        'i18n' => array('linkWindow' => WORKSPACE_LIBRARY_LINK_WINDOW, 'on' => RSS_WORKSPACE_ON, 'off' => RSS_WORKSPACE_OFF),
    );
}

function workspaceproperties_rest_open_projects()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "select td.template_id, td.template_name, ts.syndication from {$p}templatedetails td, {$p}templaterights tr, {$p}templatesyndication ts where td.creator_id= ? and td.template_id = tr.template_id and tr.template_id = ts.template_id and (tr.role= ? or tr.role=?) AND ts.syndication = ?";
    $rows = db_query($sql, array($_SESSION['toolkits_logon_id'], 'creator', 'co-author', 'true'));
    usort($rows, function ($a, $b) { return $a['template_id'] > $b['template_id']; });
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', '', $r['template_name']),
            'status' => ($r['syndication'] ? SYNDICATION_TEMPLATE_ON : SYNDICATION_TEMPLATE_OFF),
        );
    }
    return array(
        'panel' => 'projects-open',
        'caption' => SYNDICATION_TEMPLATE_INTRO,
        'columns' => array(
            array('id' => 'templateId', 'label' => WORKSPACE_LIBRARY_TEMPLATE_ID, 'narrow' => true),
            array('id' => 'name', 'label' => WORKSPACE_LIBRARY_TEMPLATE_NAME),
            array('id' => 'status', 'label' => SYNDICATION_TEMPLATE_TERM),
        ),
        'items' => $items,
    );
}

function workspaceproperties_rest_xml_projects()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $sql = "select td.template_id, td.template_name from {$p}templatedetails td, {$p}additional_sharing ashr where td.creator_id= ? and td.template_id = ashr.template_id and ashr.sharing_type=?";
    $rows = db_query($sql, array($_SESSION['toolkits_logon_id'], 'xml'));
    usort($rows, function ($a, $b) { return $a['template_id'] > $b['template_id']; });
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'templateId' => (int) $r['template_id'],
            'name' => str_replace('_', ' ', $r['template_name']),
            'previewUrl' => $xerte_toolkits_site->site_url . 'preview.php?template_id=' . (int) $r['template_id'],
        );
    }
    return array(
        'panel' => 'projects-xml',
        'caption' => XML_TEMPLATE_INTRO,
        'columns' => array(
            array('id' => 'templateId', 'label' => WORKSPACE_LIBRARY_TEMPLATE_ID, 'narrow' => true),
            array('id' => 'name', 'label' => WORKSPACE_LIBRARY_TEMPLATE_NAME),
        ),
        'items' => $items,
        'i18n' => array('linkWindow' => WORKSPACE_LIBRARY_LINK_WINDOW),
    );
}

function workspaceproperties_rest_my_properties()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $row = db_query_one("select firstname, surname, username, lastlogin from {$p}logindetails where login_id= ?", array($_SESSION['toolkits_logon_id']));
    return array(
        'panel' => 'my-properties',
        'heading' => MY_PROPERTIES_DETAILS,
        'user' => array(
            'name' => isset($row['firstname']) ? trim($row['firstname'] . ' ' . $row['surname']) : '',
            'username' => isset($row['username']) ? $row['username'] : '',
            'lastLogin' => isset($row['lastlogin']) ? $row['lastlogin'] : '',
        ),
        'i18n' => array(
            'nameLabel' => MY_PROPERTIES_NAME_DETAILS,
            'usernameLabel' => MY_PROPERTIES_USERNAME_DETAILS,
            'lastLoginLabel' => MY_PROPERTIES_LOGIN_DETAILS,
            'error' => MY_PROPERTIES_ERROR,
        ),
    );
}

function workspaceproperties_rest_folder_rss()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    require_once dirname(__FILE__) . '/../url_library.php';
    $p = $xerte_toolkits_site->database_table_prefix;
    $folders = db_query("select folder_name from {$p}folderdetails where login_id= ? AND folder_parent != ? ", array($_SESSION['toolkits_logon_id'], '0'));
    $userSlug = $_SESSION['toolkits_firstname'] . '_' . $_SESSION['toolkits_surname'];
    $userFeedUrl = $xerte_toolkits_site->site_url . url_return('RSS_user', $userSlug);
    $folderFeeds = array();
    foreach ($folders as $f) {
        $fname = str_replace('_', ' ', $f['folder_name']);
        $url = $xerte_toolkits_site->site_url . url_return('RSS_user', $userSlug);
        if ($xerte_toolkits_site->apache == 'true') {
            $url .= '/' . $fname . '/';
        } else {
            $url .= '&folder_name=' . $fname;
        }
        $folderFeeds[] = array('name' => $fname, 'url' => $url);
    }
    return array(
        'panel' => 'folder-rss',
        'heading' => FOLDER_RSS_TEMPLATE_MY,
        'userFeed' => array('name' => $_SESSION['toolkits_firstname'] . ' ' . $_SESSION['toolkits_surname'], 'url' => $userFeedUrl),
        'folderFeeds' => $folderFeeds,
        'i18n' => array(
            'myFeedHeading' => FOLDER_RSS_TEMPLATE_MY_FEED,
            'myFolderFeedHeading' => FOLDER_RSS_TEMPLATE_MY_FOLDER_FEED,
            'linksNewWindow' => FOLDER_RSS_TEMPLATE_LINKS_NEW,
            'linksSrOnly' => FOLDER_RSS_TEMPLATE_LINKS,
            'error' => FOLDER_RSS_TEMPLATE_ERROR,
        ),
    );
}

function workspaceproperties_rest_api_keys()
{
    global $xerte_toolkits_site;
    workspaceproperties_rest_load_language_sets();
    $p = $xerte_toolkits_site->database_table_prefix;
    $rows = db_query("select description, consumer_key, consumer_secret, active, created, last_modified, last_used, uses_count from {$p}api_keys where user_id= ? ORDER BY created DESC", array($_SESSION['toolkits_logon_id']));
    if ($rows === false) {
        return array('panel' => 'api', 'installed' => false, 'heading' => API_HEADER, 'i18n' => array('notInstalled' => API_NOT_INSTALLED));
    }
    $items = array();
    foreach ($rows as $r) {
        $items[] = array(
            'description' => $r['description'],
            'key' => $r['consumer_key'],
            'secret' => $r['consumer_secret'],
            'active' => (bool) $r['active'],
            'created' => $r['created'],
            'modified' => $r['last_modified'],
            'lastUsed' => $r['last_used'],
            'usesCount' => (int) $r['uses_count'],
        );
    }
    return array(
        'panel' => 'api',
        'installed' => true,
        'heading' => API_HEADER,
        'items' => $items,
        'i18n' => array(
            'keyLabel' => API_KEY,
            'secretLabel' => API_SECRET,
            'statusLabel' => API_STATUS,
            'createdLabel' => API_CREATED,
            'modifiedLabel' => API_MODIFIED,
            'lastUsedLabel' => API_LAST_USED,
            'neverUsed' => API_NEVER_USED,
            'usedFmt' => API_USED,
            'noApplications' => API_NO_APPLICATIONS,
        ),
    );
}


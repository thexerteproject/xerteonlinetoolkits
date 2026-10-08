<?php
/**
 * Emit JavaScript var declarations for PHP language constants used by
 * website_code/scripts/properties_tab.js (render*() helpers).
 *
 * Called from properties.php after the same language files as the legacy
 * server-rendered properties panels.
 */
function properties_tab_echo_js_constants()
{
    static $extras_loaded = false;
    if (!$extras_loaded) {
        _load_language_file('/website_code/php/properties/media_and_quota_template.inc');
        _load_language_file('/website_code/php/properties/gift_template.inc');
        _load_language_file('/website_code/php/properties/export_template.inc');
        _load_language_file('/website_code/php/properties/name_select_template.inc');
        _load_language_file('/website_code/php/properties/name_select_gift_template.inc');
        $extras_loaded = true;
    }

    $prefixes = array(
        'PROPERTIES_LIBRARY_',
        'PROPERTIES_TAB_',
        'PUBLISH_',
        'MEDIA_AND_QUOTA_',
        'EXPORT_',
        'GIFT_',
        'SHARING_',
        'NAME_SELECT_',
    );

    $user_constants = get_defined_constants(true);
    $user_constants = isset($user_constants['user']) ? $user_constants['user'] : array();

    echo '<script type="text/javascript">' . "\n";
    foreach ($user_constants as $name => $value) {
        $use = false;
        foreach ($prefixes as $prefix) {
            if (strpos($name, $prefix) === 0) {
                $use = true;
                break;
            }
        }
        if (!$use) {
            continue;
        }
        if (is_string($value) || is_int($value) || is_float($value)) {
            echo 'var ' . $name . ' = ' . json_encode($value, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . ";\n";
        } elseif (is_bool($value)) {
            echo 'var ' . $name . ' = ' . ($value ? 'true' : 'false') . ";\n";
        }
    }
    echo '</script>' . "\n";
}

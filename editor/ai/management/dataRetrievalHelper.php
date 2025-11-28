<?php

require_once (str_replace('\\', '/', __DIR__) . "/../../../website_code/php/management/vendor_option_component.php");

if(!isset($_SESSION['toolkits_logon_username']) && php_sapi_name() !== 'cli'){
    die("Session ID not set");
}

/**
 * Determines whether a vendor is active.
 * A vendor is active when it is enabled and either (a) no key is required, or (b) a key is present.
 *
 * @param vendor_option_component $v
 * @return bool
 */
function is_vendor_active(vendor_option_component $v): bool
{
    return ($v->enabled ?? false) && ( !($v->needs_key ?? false) || ($v->has_key ?? false) );
}

/**
 * Normalizes per-block preferences to arrays of lowercase vendor names.
 * Accepts either a string or array of strings per block.
 *
 * @param array<string,string|array<int,string>> $preferences
 * @param array<string,array<int,string>> $defaults
 * @return array<string,array<int,string>>
 */
function normalize_preferences(array $preferences, array $defaults): array
{
    $norm = $defaults;
    foreach ($preferences as $type => $pref) {
        $list = is_array($pref) ? $pref : [$pref];
        $norm[$type] = array_values(array_unique(array_map(
            static fn($v) => strtolower(trim((string)$v)),
            $list
        )));
    }
    return $norm;
}

/**
 * Selects a single vendor from an active set:
 * - If exactly one vendor is active, selects it.
 * - If multiple vendors are active, applies the preference order for the block.
 * - If still ambiguous, falls back to lexicographic order by vendor key.
 *
 * @param array<string,array<string,mixed>> $activeVendors Map: vendor => info
 * @param array<int,string> $preferencesForType Lowercased ordered vendor names
 * @return string|null Selected vendor name or null if none are active
 */
function choose_vendor(array $activeVendors, array $preferencesForType): ?string
{
    if (!$activeVendors) {
        return null;
    }
    if (count($activeVendors) === 1) {
        return array_key_first($activeVendors);
    }

    $byLower = [];
    foreach ($activeVendors as $name => $_) {
        $byLower[strtolower($name)] = $name;
    }
    foreach ($preferencesForType as $want) {
        if (isset($byLower[$want])) {
            return $byLower[$want];
        }
    }

    $names = array_keys($activeVendors);
    sort($names, SORT_STRING);
    return $names[0];
}

function get_vendor_settings(): array
{
    global $xerte_toolkits_site;
    $query = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}management_helper WHERE enabled = 1 ORDER BY type ASC";
    $res = db_query($query);

    $blocks = array();
    if ($res !== false) {

        foreach ($res as $vendor) {
            $block = new vendor_option_component($vendor);
            $blocks[$block->type][$block->vendor] = $block;
        }

    }
    return $blocks;
}


function get_block_indicators(array $preferences = []): array
{
    // Default priorities used only to break ties when multiple vendors are active.
    $defaultPriorities = [
        'ai'            => ['mistral'],
        'model'         => ['mistral'],     // alias for environments that use "model"
        'encoding'      => ['mistralenc'],
        'transcription' => ['gladia'],
        'imagegen'      =>['dalle3'],
        'image'         =>['pexels'],
        // Extend with other blocks as needed, e.g. 'image' => ['unsplash', 'pexels', 'pixabay'].
    ];
    $prefs = normalize_preferences($preferences, $defaultPriorities);

    $blocks = get_vendor_settings();
    $out = [];

    foreach ($blocks as $type => $vendors) {
        $activeVendors = [];

        foreach ($vendors as $vendorName => $vendor) {
            if (!is_vendor_active($vendor)) {
                continue;
            }

            $activeVendors[$vendorName] = [
                'vendor'    => $vendorName,
                'label'     => $vendor->label,
                'has_key'   => $vendor->has_key ?? false,
                'needs_key' => $vendor->needs_key ?? false,
                'key_name'  => ($vendor->needs_key ?? false) ? "{$vendor->vendor}_key" : null, // pointer only; not the secret
                'type'      => $vendor->type,
            ];
        }

        // Use preferences for the current type; fall back to the "model" alias list where appropriate.
        $typePrefs = $prefs[$type] ?? ($prefs['model'] ?? []);
        $chosen    = choose_vendor($activeVendors, $typePrefs);

        $out[$type] = [
            'active'         => (bool)$activeVendors,
            'active_vendor'  => $chosen,
            'key_name'       => $chosen && isset($activeVendors[$chosen]['key_name']) ? $activeVendors[$chosen]['key_name'] : null,
            'active_vendors' => $activeVendors,
        ];
    }

    return $out;
}

/**
 * Checks if a given vendor (by name) is active.
 * A vendor is considered active when:
 *   - It exists in the database (enabled = 1)
 *   - It either does not need a key, or has one present
 *
 * @param string $vendorName Vendor name to check (case-insensitive)
 * @param string $type  type filter (e.g. 'ai', 'image')
 * @return bool True if active, false otherwise
 */
function vendor_is_active(string $vendorName, string $type): bool
{
    $vendorName = strtolower(trim($vendorName));
    $vendorTypes = get_vendor_settings();

    if (!$vendorTypes) {
        return false;
    }

    if (isset($vendorTypes[$type]) and isset($vendorTypes[$type][$vendorName])) {
        return is_vendor_active($vendorTypes[$type][$vendorName]);
    }

    return false;
}

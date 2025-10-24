<?php

require_once (str_replace('\\', '/', __DIR__) . "/../../../website_code/php/management/vendor_option_component.php");

if(!isset($_SESSION['toolkits_logon_id'])){
    die("Session ID not set");
}

function fetch_vendor_settings(): array
{
    global $xerte_toolkits_site;
    $query = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}management_helper WHERE enabled = 1 ORDER BY type ASC";
    $res = db_query($query);
    return $res;
}
/**
 * Drop-in helpers for building per-block vendor indicators from database rows.
 *
 * - Uses fetch_vendor_settings() (raw DB rows) instead of get_vendor_settings().
 * - Wraps rows with vendor_option_component for consistent semantics.
 * - Determines the set of "active" vendors per block.
 * - Selects exactly one active vendor per block (radio-style), applying
 *   optional preferences only when multiple options are active.
 * - Never returns API keys; only exposes a key reference name (e.g., "mistral_key").
 *
 */

/**
 * Fetches enabled vendor rows from the management_helper table in ascending type order.
 *
 * @return array<int,array<string,mixed>> Raw database rows. Returns [] when no results.
 */
if (!function_exists('fetch_vendor_settings')) {
    function fetch_vendor_settings(): array
    {
        global $xerte_toolkits_site;
        $query = "SELECT * FROM {$xerte_toolkits_site->database_table_prefix}management_helper WHERE enabled = 1 ORDER BY type ASC";
        $res = db_query($query);
        return $res !== false ? $res : [];
    }
}

/**
 * Produces a sanitized row for vendor_option_component. Normalizes booleans and strings.
 *
 * @param array<string,mixed> $row
 * @return array<string,mixed>
 */
function sanitize_vendor_row(array $row): array
{
    $toBool = static function ($v): bool {
        if (is_bool($v)) return $v;
        if (is_int($v))  return $v !== 0;
        if ($v === null) return false;
        $s = strtolower(trim((string)$v));
        return in_array($s, ['1', 'true', 'yes', 'on'], true);
    };

    return [
        'vendor'      => isset($row['vendor']) ? (string)$row['vendor'] : null,
        'label'       => isset($row['label']) ? (string)$row['label'] : null,
        'type'        => isset($row['type']) ? (string)$row['type'] : null,
        'needs_key'   => $toBool($row['needs_key'] ?? false),
        'enabled'     => $toBool($row['enabled'] ?? false),
        'sub_options' => array_key_exists('sub_options', $row) ? (string)$row['sub_options'] : '{}',
    ];
}

/**
 * Builds a [type => [vendor => vendor_option_component]] map from raw DB rows.
 *
 * @param array<int,array<string,mixed>> $rows
 * @return array<string,array<string,vendor_option_component>>
 */
function build_vendor_blocks_from_rows(array $rows): array
{
    $blocks = [];
    foreach ($rows as $row) {
        $clean = sanitize_vendor_row($row);
        $obj   = new vendor_option_component($clean);
        $type  = $obj->type ?: 'unknown';
        $name  = $obj->vendor ?: 'unknown';
        $blocks[$type][$name] = $obj;
    }
    return $blocks;
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

/**
 * Builds per-block indicators without returning or reading API key values.
 * Exposes only a key reference name (e.g., "mistral_key") when applicable.
 *
 * Default preference (applied only when multiple vendors are simultaneously active):
 *  - 'ai' / 'model'        => 'mistral'
 *  - 'encoding'            => 'mistralenc'
 *  - 'transcription'       => 'gladia'
 *
 * @param array<string,string|array<int,string>> $preferences Optional per-block preferences.
 *        Example: ['ai' => ['mistral','anthropic','openai'], 'encoding' => 'mistralenc']
 *
 * @return array<string,array{
 *     active: bool,
 *     active_vendor: ?string,
 *     key_name: ?string,
 *     active_vendors: array<string,array{
 *         vendor: string,
 *         label: string,
 *         has_key: bool,
 *         needs_key: bool,
 *         key_name: ?string,
 *         type: string
 *     }>
 * }>
 */
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

    // Fetch raw rows and build vendor blocks.
    $rows   = fetch_vendor_settings();
    $blocks = build_vendor_blocks_from_rows($rows); // [type => [vendor => vendor_option_component]]

    $out = [];

    foreach ($blocks as $type => $vendors) {
        $activeVendors = [];

        foreach ($vendors as $vendorName => $v) {
            if (!($v instanceof vendor_option_component)) {
                continue;
            }
            if (!is_vendor_active($v)) {
                continue;
            }

            $activeVendors[$vendorName] = [
                'vendor'    => $vendorName,
                'label'     => $v->label,
                'has_key'   => $v->has_key ?? false,
                'needs_key' => $v->needs_key ?? false,
                'key_name'  => ($v->needs_key ?? false) ? "{$v->vendor}_key" : null, // pointer only; not the secret
                'type'      => $v->type,
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
 * @param string|null $type Optional type filter (e.g. 'ai', 'image')
 * @return bool True if active, false otherwise
 */
function vendor_is_active(string $vendorName, ?string $type = null): bool
{
    $vendorName = strtolower(trim($vendorName));
    $rows = fetch_vendor_settings();

    if (!$rows) {
        return false;
    }

    foreach ($rows as $row) {
        $clean = sanitize_vendor_row($row);
        if (strtolower((string)$clean['vendor']) !== $vendorName) {
            continue;
        }
        if ($type !== null && strtolower((string)$clean['type']) !== strtolower($type)) {
            continue;
        }

        $v = new vendor_option_component($clean);
        return is_vendor_active($v);
    }

    return false;
}

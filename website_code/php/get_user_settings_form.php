<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    require_once("../../config.php");
    require_once("user_library.php");
} catch (Exception $e) {
    header('Content-Type: text/html; charset=utf-8');
    echo "<div style='color: red;'>Error loading config: " . htmlspecialchars($e->getMessage()) . "</div>";
    exit;
}

if (empty($_SESSION['toolkits_logon_id'])) {
    header('Content-Type: text/html; charset=utf-8');
    echo "<div style='color: red;'>Please login</div>";
    exit;
}

_load_language_file("/user_settings.inc");

header('Content-Type: text/html; charset=utf-8');

$username = isset($_SESSION['toolkits_logon_username']) ? $_SESSION['toolkits_logon_username'] : '';
$section = isset($_GET['section']) ? $_GET['section'] : 'details';
$allowedSections = array('details', 'preferences');
if (!in_array($section, $allowedSections, true)) {
    $section = 'details';
}

ob_end_clean();

if ($section === 'preferences') {
?>
<div class="preferences-modal" id="preferences-form">
    <div class="preferences-modal-header">
        <h2 class="preferences-modal-title"><?php echo USER_SETTINGS_PREFERENCES_TITLE; ?></h2>
        <button type="button" class="preferences-modal-close" aria-label="<?php echo USER_SETTINGS_CANCEL; ?>">&times;</button>
    </div>

    <div class="preferences-modal-body">
        <section class="preferences-section">
            <h3 class="preferences-section-title"><?php echo USER_SETTINGS_SECTION_EDITOR_OPEN; ?></h3>
            <div class="preferences-options">
                <label class="preferences-option">
                    <input type="radio" name="editor_open_mode" value="popup" id="editor_open_mode_popup" class="preferences-input">
                    <span class="preferences-control preferences-control--radio" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_POPUP; ?></span>
                </label>
                <label class="preferences-option">
                    <input type="radio" name="editor_open_mode" value="_blank" id="editor_open_mode_blank" class="preferences-input">
                    <span class="preferences-control preferences-control--radio" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_BLANK; ?></span>
                </label>
                <label class="preferences-option">
                    <input type="radio" name="editor_open_mode" value="lightbox" id="editor_open_mode_lightbox" class="preferences-input">
                    <span class="preferences-control preferences-control--radio" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_LIGHTBOX; ?></span>
                </label>
            </div>
        </section>

        <section class="preferences-section">
            <h3 class="preferences-section-title"><?php echo USER_SETTINGS_SECTION_OVERVIEW; ?></h3>
            <div class="preferences-options">
                <label class="preferences-option">
                    <input type="checkbox" id="panel_east_open" name="panel_east_open" class="preferences-input">
                    <span class="preferences-control preferences-control--checkbox" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_PANEL_EAST; ?></span>
                </label>
                <label class="preferences-option">
                    <input type="checkbox" id="panel_south_open" name="panel_south_open" class="preferences-input">
                    <span class="preferences-control preferences-control--checkbox" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_PANEL_SOUTH; ?></span>
                </label>
            </div>
        </section>

        <section class="preferences-section">
            <h3 class="preferences-section-title"><?php echo USER_SETTINGS_SECTION_IN_EDITOR; ?></h3>
            <div class="preferences-options">
                <label class="preferences-option">
                    <input type="checkbox" id="editor_panel_east_open" name="editor_panel_east_open" class="preferences-input">
                    <span class="preferences-control preferences-control--checkbox" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_EDITOR_PANEL_EAST; ?></span>
                </label>
                <label class="preferences-option">
                    <input type="checkbox" id="editor_show_language" name="editor_show_language" class="preferences-input">
                    <span class="preferences-control preferences-control--checkbox" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_EDITOR_SHOW_LANGUAGE; ?></span>
                </label>
                <label class="preferences-option">
                    <input type="checkbox" id="editor_show_toolbar" name="editor_show_toolbar" class="preferences-input">
                    <span class="preferences-control preferences-control--checkbox" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_EDITOR_SHOW_TOOLBAR; ?></span>
                </label>
                <label class="preferences-option">
                    <input type="checkbox" id="editor_expand_groups" name="editor_expand_groups" class="preferences-input">
                    <span class="preferences-control preferences-control--checkbox" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_EDITOR_EXPAND_GROUPS; ?></span>
                </label>
                <label class="preferences-option">
                    <input type="checkbox" id="editor_expand_tree" name="editor_expand_tree" class="preferences-input">
                    <span class="preferences-control preferences-control--checkbox" aria-hidden="true"></span>
                    <span class="preferences-option-text"><?php echo USER_SETTINGS_EDITOR_EXPAND_TREE; ?></span>
                </label>
            </div>
        </section>
    </div>

    <div class="preferences-modal-footer">
        <button type="button" class="preferences-btn preferences-btn-cancel"><?php echo USER_SETTINGS_CANCEL; ?></button>
        <button type="button" class="preferences-btn preferences-btn-save"><?php echo USER_SETTINGS_SAVE; ?></button>
    </div>
</div>
<?php
    exit;
}
?>
<div class="preferences-modal password-modal" id="password-form" data-username="<?php echo htmlspecialchars($username, ENT_QUOTES, 'UTF-8'); ?>">
    <div class="preferences-modal-header">
        <h2 class="preferences-modal-title"><?php echo USER_SETTINGS_PASSWORD_TITLE; ?></h2>
        <button type="button" class="preferences-modal-close" aria-label="<?php echo USER_SETTINGS_CANCEL; ?>">&times;</button>
    </div>

    <div class="preferences-modal-body">
        <form id="passform" class="password-form-fields" autocomplete="off">
            <div class="password-field">
                <label for="oldpass"><?php echo USER_SETTINGS_PASSWORD_OLD; ?></label>
                <input type="password" id="oldpass" autocomplete="current-password">
            </div>
            <div class="password-field">
                <label for="newpass"><?php echo USER_SETTINGS_PASSWORD_NEW; ?></label>
                <input type="password" id="newpass" autocomplete="new-password">
            </div>
            <div class="password-field">
                <label for="newpassrepeat"><?php echo USER_SETTINGS_PASSWORD_NEW_REPEAT; ?></label>
                <input type="password" id="newpassrepeat" autocomplete="new-password">
            </div>
        </form>
        <div id="result" class="password-form-result" aria-live="polite"></div>
    </div>

    <div class="preferences-modal-footer">
        <button type="button" class="preferences-btn preferences-btn-cancel"><?php echo USER_SETTINGS_CANCEL; ?></button>
        <button type="button" class="preferences-btn preferences-btn-save password-btn-submit"><?php echo USER_SETTINGS_PASSWORD_SUBMIT; ?></button>
    </div>
</div>

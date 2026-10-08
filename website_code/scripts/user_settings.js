/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
	
	/**	
	 * 
	 * code to handle settings dropdown menu
	 *
	 * @author Noud Liefrink
	 * @version 1.0
	 * @package
	 */

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function settingsDropdown() {
    document.getElementById("settings").classList.toggle("show");
}

function getUserbarDropdownMenu($dropdown) {
    var menuId = $dropdown.data("menuId");
    if (menuId) {
        var $portalMenu = $("#" + menuId);
        if ($portalMenu.length) {
            return $portalMenu;
        }
    }
    return $dropdown.find(".userbar-dropdown-menu").first();
}

function positionUserbarDropdownMenu($dropdown) {
    var $toggle = $dropdown.find(".userbar-dropdown-toggle").first();
    var $menu = getUserbarDropdownMenu($dropdown);
    if (!$toggle.length || !$menu.length) {
        return;
    }
    var rect = $toggle[0].getBoundingClientRect();
    $menu.css({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
        left: "auto"
    });
}

function openUserbarDropdown($dropdown) {
    var $menu = $dropdown.find(".userbar-dropdown-menu").first();
    if (!$menu.length) {
        return;
    }

    var menuId = $dropdown.data("menuId");
    if (!menuId) {
        menuId = "userbar-menu-" + ($(".userbar-dropdown").index($dropdown) + 1);
        $dropdown.data("menuId", menuId);
        $menu.attr("id", menuId);
    }

    if (!$menu.parent().is("body")) {
        $menu.data("userbarDropdown", $dropdown);
        $("body").append($menu);
    }

    $dropdown.addClass("open");
    $dropdown.closest(".userbar-item").find(".userbar-dropdown-toggle, .userbar-profile-btn").attr("aria-expanded", "true");
    $menu.addClass("userbar-dropdown-menu--open");
    positionUserbarDropdownMenu($dropdown);
}

function closeUserbarDropdown($dropdown) {
    var $menu = getUserbarDropdownMenu($dropdown);
    $dropdown.removeClass("open");
    $dropdown.closest(".userbar-item").find(".userbar-dropdown-toggle, .userbar-profile-btn").attr("aria-expanded", "false");
    $menu.removeClass("userbar-dropdown-menu--open").css({ top: "", right: "", left: "" });

    if ($menu.length && $menu.parent().is("body")) {
        $dropdown.append($menu);
    }
}

function closeUserbarDropdowns(except) {
    $(".userbar-dropdown.open").each(function() {
        if (!except || this !== except) {
            closeUserbarDropdown($(this));
        }
    });
}

$(function() {
    $(".userbar-dropdown-toggle, .userbar-profile-btn").on("click", function(e) {
        e.stopPropagation();
        var $dropdown = $(this).closest(".userbar-dropdown");
        if (!$dropdown.length) {
            $dropdown = $(this).closest(".userbar-item").find(".userbar-dropdown").first();
        }
        var isOpen = $dropdown.hasClass("open");
        closeUserbarDropdowns();
        if (!isOpen) {
            openUserbarDropdown($dropdown);
        }
    });

    $(window).on("resize scroll", function() {
        $(".userbar-dropdown.open").each(function() {
            positionUserbarDropdownMenu($(this));
        });
    });

    $(document).on("click", ".userbar-language-form .userbar-dropdown-item", function() {
        var lang = $(this).data("language");
        $(this).closest("form").find("input[name='language']").val(lang);
        $(this).closest("form").submit();
    });

    $(document).on("click", ".userbar-user-item", function(e) {
        closeUserbarDropdowns();
        e.stopPropagation();
    });

    $("body").on("click", function(e) {
        if (!$(e.target).closest(".userbar-dropdown").length &&
            !$(e.target).closest(".userbar-dropdown-menu").length) {
            closeUserbarDropdowns();
        }

        if (!(e.target.class == "settingsDropdown" || $(e.target).parents(".settingsDropdown").length)) {
            var dropdowns = $(".settings-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });
})

/**
 * Password change popup and form code:
 */

function preferenceIsTruthy(value, defaultValue) {
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value !== false && value !== 'false' && value !== 0 && value !== '0';
}

function populatePreferencesForm($root) {
    var prefs = (typeof user_preferences !== 'undefined' && user_preferences) ? user_preferences : {};

    $root.find('#panel_east_open').prop('checked', preferenceIsTruthy(prefs.panel_east_open, true));
    $root.find('#panel_south_open').prop('checked', preferenceIsTruthy(prefs.panel_south_open, true));
    $root.find('#editor_panel_east_open').prop('checked', preferenceIsTruthy(prefs.editor_panel_east_open, true));
    $root.find('#editor_show_language').prop('checked', preferenceIsTruthy(prefs.editor_show_language, false));
    $root.find('#editor_show_toolbar').prop('checked', preferenceIsTruthy(prefs.editor_show_toolbar, false));
    $root.find('#editor_expand_groups').prop('checked', preferenceIsTruthy(prefs.editor_expand_groups, false));
    $root.find('#editor_expand_tree').prop('checked', preferenceIsTruthy(prefs.editor_expand_tree, false));

    var editorOpenMode = prefs.editor_open_mode;
    if (editorOpenMode !== 'popup' && editorOpenMode !== '_blank' && editorOpenMode !== 'lightbox') {
        editorOpenMode = 'popup';
    }
    $root.find('input[name="editor_open_mode"][value="' + editorOpenMode + '"]').prop('checked', true);
}

function applyWorkspacePanelPreferences(prefs) {
    if (typeof xerteinner_layout !== 'undefined') {
        if (prefs.panel_east_open) {
            xerteinner_layout.open('east');
        } else {
            xerteinner_layout.close('east');
        }
    }
    if (typeof xertemain_layout !== 'undefined') {
        if (prefs.panel_south_open) {
            xertemain_layout.open('south');
        } else {
            xertemain_layout.close('south');
        }
    }
}

function savePreferencesFromForm($root) {
    var prefs = {
        panel_east_open: $root.find('#panel_east_open').is(':checked'),
        panel_south_open: $root.find('#panel_south_open').is(':checked'),
        editor_panel_east_open: $root.find('#editor_panel_east_open').is(':checked'),
        editor_show_language: $root.find('#editor_show_language').is(':checked'),
        editor_show_toolbar: $root.find('#editor_show_toolbar').is(':checked'),
        editor_expand_groups: $root.find('#editor_expand_groups').is(':checked'),
        editor_expand_tree: $root.find('#editor_expand_tree').is(':checked'),
        editor_open_mode: $root.find('input[name="editor_open_mode"]:checked').val() || 'popup'
    };

    if (typeof window.user_preferences === 'undefined' || window.user_preferences === null) {
        window.user_preferences = {};
    }

    if (typeof save_user_preference === 'function') {
        Object.keys(prefs).forEach(function(key) {
            save_user_preference(key, prefs[key]);
        });
    }

    Object.keys(prefs).forEach(function(key) {
        window.user_preferences[key] = prefs[key];
    });

    applyWorkspacePanelPreferences(prefs);

    var expandTreeCb = $('#expand_tree');
    if (expandTreeCb.length > 0) {
        expandTreeCb.prop('checked', prefs.editor_expand_tree);
        expandTreeCb.trigger('change');
    }
}

function getSettingsDialogElement() {
    var $dialog = $("#change-password-dialog");
    if (!$dialog.length) {
        $dialog = $("<div id='change-password-dialog'></div>").appendTo("body");
    } else if (!$.contains(document.documentElement, $dialog[0])) {
        $dialog.appendTo("body");
    }
    return $dialog;
}

function bindPreferencesModalHandlers($dialog) {
    var $root = $dialog.find('#preferences-form');

    $root.find('.preferences-modal-close, .preferences-btn-cancel').off('click.prefs').on('click.prefs', function() {
        $dialog.dialog('close');
    });

    $root.find('.preferences-btn-save').off('click.prefs').on('click.prefs', function() {
        savePreferencesFromForm($root);
        $dialog.dialog('close');
    });
}

function bindPasswordModalHandlers($dialog) {
    var $root = $dialog.find('#password-form');
    var username = $root.data('username') || '';

    $root.find('.preferences-modal-close, .preferences-btn-cancel').off('click.pwd').on('click.pwd', function() {
        $dialog.dialog('close');
    });

    $root.find('.password-btn-submit').off('click.pwd').on('click.pwd', function() {
        if (username) {
            changePassword(username);
        }
    });

    $root.find('#passform').off('submit.pwd').on('submit.pwd', function(e) {
        e.preventDefault();
        if (username) {
            changePassword(username);
        }
    });
}

function clearPasswordForm($dialog) {
    var $root = $dialog.length ? $dialog : getSettingsDialogElement();
    $root.find('#passform input[type=password]').val('');
    $root.find('#result').html('');
}

function bindLegacyPreferencesHandlers() {
    $("#change-password-dialog #panel_east_open").on('change', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('panel_east_open', $(this).is(':checked'));
            if (typeof xerteinner_layout !== 'undefined') {
                if ($(this).is(':checked')) {
                    xerteinner_layout.open('east');
                } else {
                    xerteinner_layout.close('east');
                }
            }
        }
    });

    $("#change-password-dialog #panel_south_open").on('change', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('panel_south_open', $(this).is(':checked'));
            if (typeof xertemain_layout !== 'undefined') {
                if ($(this).is(':checked')) {
                    xertemain_layout.open('south');
                } else {
                    xertemain_layout.close('south');
                }
            }
        }
    });

    $("#change-password-dialog #editor_panel_east_open").on('change', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_panel_east_open', $(this).is(':checked'));
        }
    });

    $("#change-password-dialog #editor_show_language").on('change', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_show_language', $(this).is(':checked'));
        }
    });

    $("#change-password-dialog #editor_show_toolbar").on('change', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_show_toolbar', $(this).is(':checked'));
        }
    });

    $("#change-password-dialog #editor_expand_groups").on('change', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_expand_groups', $(this).is(':checked'));
        }
    });

    $("#change-password-dialog #editor_expand_tree").on('change', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_expand_tree', $(this).is(':checked'));
            var expandTreeCb = $('#expand_tree');
            if (expandTreeCb.length > 0) {
                expandTreeCb.prop('checked', $(this).is(':checked'));
                expandTreeCb.trigger('change');
            }
        }
    });

    $("#change-password-dialog #editor_open_mode").on('change', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_open_mode', $(this).val());
        }
    });
}

function populateLegacyPreferencesForm($dialog) {
    if (typeof user_preferences === 'undefined' || !user_preferences) {
        return;
    }

    var eastCheckbox = $dialog.find("#panel_east_open");
    if (eastCheckbox.length) {
        eastCheckbox.prop('checked', preferenceIsTruthy(user_preferences.panel_east_open, true));
    }

    var southCheckbox = $dialog.find("#panel_south_open");
    if (southCheckbox.length) {
        southCheckbox.prop('checked', preferenceIsTruthy(user_preferences.panel_south_open, true));
    }

    var editorEastCheckbox = $dialog.find("#editor_panel_east_open");
    if (editorEastCheckbox.length) {
        editorEastCheckbox.prop('checked', preferenceIsTruthy(user_preferences.editor_panel_east_open, true));
    }

    var editorShowLanguageCheckbox = $dialog.find("#editor_show_language");
    if (editorShowLanguageCheckbox.length) {
        editorShowLanguageCheckbox.prop('checked', preferenceIsTruthy(user_preferences.editor_show_language, false));
    }

    var editorShowToolbarCheckbox = $dialog.find("#editor_show_toolbar");
    if (editorShowToolbarCheckbox.length) {
        editorShowToolbarCheckbox.prop('checked', preferenceIsTruthy(user_preferences.editor_show_toolbar, false));
    }

    var editorExpandGroupsCheckbox = $dialog.find("#editor_expand_groups");
    if (editorExpandGroupsCheckbox.length) {
        editorExpandGroupsCheckbox.prop('checked', preferenceIsTruthy(user_preferences.editor_expand_groups, false));
    }

    var editorExpandTreeCheckbox = $dialog.find("#editor_expand_tree");
    if (editorExpandTreeCheckbox.length) {
        editorExpandTreeCheckbox.prop('checked', preferenceIsTruthy(user_preferences.editor_expand_tree, false));
    }

    var editorOpenModeSelect = $dialog.find("#editor_open_mode");
    if (editorOpenModeSelect.length) {
        var editorOpenMode = user_preferences.editor_open_mode;
        if (editorOpenMode === 'popup' || editorOpenMode === '_blank' || editorOpenMode === 'lightbox') {
            editorOpenModeSelect.val(editorOpenMode);
        } else {
            editorOpenModeSelect.val('popup');
        }
    }
}

function changepasswordPopup(section) {
    section = section || 'details';
    var isPreferencesModal = (section === 'preferences');
    var isPasswordModal = (section === 'details');
    var useStyledModal = isPreferencesModal || isPasswordModal;
    var formUrl = (typeof ajax_php_path !== 'undefined' ? ajax_php_path : 'website_code/php/') +
        'get_user_settings_form.php?section=' + encodeURIComponent(section) + '&_=' + Date.now();

    var $dialog = getSettingsDialogElement();

    if (!$dialog.data("ui-dialog")) {
        $dialog.dialog({
            autoOpen: false,
            modal: true,
            width: useStyledModal ? 560 : 450,
            height: "auto",
            resizable: false,
            title: "",
            dialogClass: useStyledModal ? "preferences-dialog workspace-dialog" : "workspace-dialog",
            close: function() {
                clearPasswordForm($dialog);
            }
        });
    }

    $dialog.dialog("option", {
        width: useStyledModal ? 560 : 450,
        dialogClass: useStyledModal ? "preferences-dialog workspace-dialog" : "workspace-dialog",
        title: ""
    });

    $.ajax({
        url: formUrl,
        type: "GET",
        cache: false,
        dataType: "html",
        success: function(html) {
            $dialog = getSettingsDialogElement();
            $dialog.html(html);

            if (isPreferencesModal) {
                var $form = $dialog.find("#preferences-form");
                if ($form.length) {
                    populatePreferencesForm($form);
                    bindPreferencesModalHandlers($dialog);
                } else {
                    console.error("Preferences form failed to load.", html);
                }
            } else if (isPasswordModal) {
                var $passwordForm = $dialog.find("#password-form");
                if ($passwordForm.length) {
                    bindPasswordModalHandlers($dialog);
                    $dialog.find('#oldpass').trigger('focus');
                } else {
                    console.error("Password form failed to load.", html);
                }
            }

            $dialog.dialog("open");
        },
        error: function(xhr, status, error) {
            console.error("Error loading settings form:", error, xhr.responseText);
            $dialog = getSettingsDialogElement();
            $dialog.html("<div style='padding: 20px; color: red;'>Error loading form. Please try again.</div>");
            if (!$dialog.data("ui-dialog")) {
                $dialog.dialog({
                    autoOpen: false,
                    modal: true,
                    width: 450,
                    title: "",
                    dialogClass: "workspace-dialog"
                });
            }
            $dialog.dialog("open");
        }
    });
}

function ajax_send(url, mesg, success){

    $.ajax({
        type: "POST",
        url: "library/Xerte/Authentication/Db/" + url,
        data: mesg,
        success: success
    })

}

function changePassword(username){
    var oldpass = $("#oldpass").val();
    var passwd1 = $("#newpass").val();
    var passwd2 = $("#newpassrepeat").val();
    if (passwd1 == passwd2) {

        var mesg = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(passwd1) + '&oldpass=' + encodeURIComponent(oldpass);

        ajax_send("changepassword.php", mesg, function(response) {
            $("#result").html(response);
        });

    } else {
        $('#result').html("<p>" + PASS_FAILED + "</p><p><font color = \"red\"><ul><li>" + NOT_SAME_PASS + "</li></ul></font></p>");
    }

    $("#passform").find("input[type=password]").val('');
}


/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module core/editor/utils/editorusagedata
 */
import { env, global, uid } from '@ckeditor/ckeditor5-utils';
/**
 * This part of the code is not executed in open-source implementations using a GPL key.
 * It only runs when a specific license key is provided. If you are uncertain whether
 * this applies to your installation, please contact our support team.
 *
 * @internal
 */
export function getEditorUsageData(editor) {
    return {
        sessionId: getSessionId(),
        pageSessionId: getPageSessionID(),
        hostname: window.location.hostname,
        version: globalThis.CKEDITOR_VERSION,
        type: getEditorType(editor),
        plugins: getPluginsUsageData(editor.plugins),
        distribution: getDistributionUsageData(),
        env: getEnvUsageData(),
        integration: Object.create(null),
        menuBar: {
            isVisible: !!editor.config.get('menuBar.isVisible')
        },
        language: {
            ui: editor.locale.uiLanguage,
            content: editor.locale.contentLanguage
        },
        toolbar: {
            main: getToolbarUsageData(editor.config.get('toolbar')),
            block: getToolbarUsageData(editor.config.get('blockToolbar')),
            balloon: getToolbarUsageData(editor.config.get('balloonToolbar'))
        }
    };
}
function getEditorType(editor) {
    return Object.getPrototypeOf(editor).constructor.editorName;
}
function getPluginsUsageData(collection) {
    return Array
        .from(collection)
        .filter(([PluginConstructor]) => !!PluginConstructor.pluginName)
        .map(([PluginConstructor]) => {
        const { pluginName, isContextPlugin, isOfficialPlugin, isPremiumPlugin } = PluginConstructor;
        return {
            isContext: !!isContextPlugin,
            isOfficial: !!isOfficialPlugin,
            isPremium: !!isPremiumPlugin,
            name: pluginName
        };
    });
}
function getToolbarUsageData(toolbarConfig) {
    if (!toolbarConfig) {
        return undefined;
    }
    const normalizedToolbar = Array.isArray(toolbarConfig) ?
        { items: toolbarConfig } :
        toolbarConfig;
    const flattenToolbarConfigNames = extractToolbarConfigItemsNames(normalizedToolbar.items || []);
    const isMultiline = flattenToolbarConfigNames.includes('-');
    return {
        isMultiline,
        shouldNotGroupWhenFull: !!normalizedToolbar.shouldNotGroupWhenFull,
        items: stripToolbarSeparatorItems(flattenToolbarConfigNames)
    };
    function stripToolbarSeparatorItems(items) {
        return items.filter((item) => item !== '|' && item !== '-');
    }
    function extractToolbarConfigItemsNames(items) {
        return items.flatMap(item => {
            if (typeof item === 'string') {
                return [item];
            }
            return extractToolbarConfigItemsNames(item.items);
        });
    }
}
function getDistributionUsageData() {
    return {
        channel: (window[Symbol.for('cke distribution')] || 'sh')
    };
}
function getEnvUsageData() {
    let os = 'unknown';
    let browser = 'unknown';
    if (env.isMac) {
        os = 'mac';
    }
    else if (env.isWindows) {
        os = 'windows';
    }
    else if (env.isiOS) {
        os = 'ios';
    }
    else if (env.isAndroid) {
        os = 'android';
    }
    if (env.isGecko) {
        browser = 'gecko';
    }
    else if (env.isBlink) {
        browser = 'blink';
    }
    else if (env.isSafari) {
        browser = 'safari';
    }
    return {
        os,
        browser
    };
}
function getSessionId() {
    if (!localStorage.getItem('__ckeditor-session-id')) {
        localStorage.setItem('__ckeditor-session-id', uid());
    }
    return localStorage.getItem('__ckeditor-session-id');
}
function getPageSessionID() {
    global.window.CKEDITOR_PAGE_SESSION_ID = global.window.CKEDITOR_PAGE_SESSION_ID || uid();
    return global.window.CKEDITOR_PAGE_SESSION_ID;
}

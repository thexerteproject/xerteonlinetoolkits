/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/env
 */
import { global } from './dom/global.js';
/**
 * Safely returns `userAgent` from browser's navigator API in a lower case.
 * If navigator API is not available it will return an empty string.
 *
 * @internal
 */
export function getUserAgent() {
    // In some environments navigator API might not be available.
    try {
        return navigator.userAgent.toLowerCase();
    }
    catch {
        return '';
    }
}
const userAgent = /* #__PURE__ */ getUserAgent();
/**
 * A namespace containing environment and browser information.
 */
export const env = {
    isMac: /* #__PURE__ */ isMac(userAgent),
    isWindows: /* #__PURE__ */ isWindows(userAgent),
    isGecko: /* #__PURE__ */ isGecko(userAgent),
    isSafari: /* #__PURE__ */ isSafari(userAgent),
    isiOS: /* #__PURE__ */ isiOS(userAgent),
    isAndroid: /* #__PURE__ */ isAndroid(userAgent),
    isBlink: /* #__PURE__ */ isBlink(userAgent),
    get isMediaForcedColors() {
        return isMediaForcedColors();
    },
    get isMotionReduced() {
        return isMotionReduced();
    },
    features: {
        isRegExpUnicodePropertySupported: /* #__PURE__ */ isRegExpUnicodePropertySupported()
    }
};
/**
 * Checks if User Agent represented by the string is running on Macintosh.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running on Macintosh or not.
 */
export function isMac(userAgent) {
    return userAgent.indexOf('macintosh') > -1;
}
/**
 * Checks if User Agent represented by the string is running on Windows.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running on Windows or not.
 */
export function isWindows(userAgent) {
    return userAgent.indexOf('windows') > -1;
}
/**
 * Checks if User Agent represented by the string is Firefox (Gecko).
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Firefox or not.
 */
export function isGecko(userAgent) {
    return !!userAgent.match(/gecko\/\d+/);
}
/**
 * Checks if User Agent represented by the string is Safari.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Safari or not.
 */
export function isSafari(userAgent) {
    return userAgent.indexOf(' applewebkit/') > -1 && userAgent.indexOf('chrome') === -1;
}
/**
 * Checks if User Agent represented by the string is running in iOS.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running in iOS or not.
 */
export function isiOS(userAgent) {
    // "Request mobile site" || "Request desktop site".
    return !!userAgent.match(/iphone|ipad/i) || (isMac(userAgent) && navigator.maxTouchPoints > 0);
}
/**
 * Checks if User Agent represented by the string is Android mobile device.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Safari or not.
 */
export function isAndroid(userAgent) {
    return userAgent.indexOf('android') > -1;
}
/**
 * Checks if User Agent represented by the string is Blink engine.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Blink engine or not.
 */
export function isBlink(userAgent) {
    // The Edge browser before switching to the Blink engine used to report itself as Chrome (and "Edge/")
    // but after switching to the Blink it replaced "Edge/" with "Edg/".
    return userAgent.indexOf('chrome/') > -1 && userAgent.indexOf('edge/') < 0;
}
/**
 * Checks if the current environment supports ES2018 Unicode properties like `\p{P}` or `\p{L}`.
 * More information about unicode properties might be found
 * [in Unicode Standard Annex #44](https://www.unicode.org/reports/tr44/#GC_Values_Table).
 *
 * @internal
 */
export function isRegExpUnicodePropertySupported() {
    let isSupported = false;
    // Feature detection for Unicode properties. Added in ES2018. Currently Firefox does not support it.
    // See https://github.com/ckeditor/ckeditor5-mention/issues/44#issuecomment-487002174.
    try {
        // Usage of regular expression literal cause error during build (ckeditor/ckeditor5-dev#534).
        isSupported = 'ć'.search(new RegExp('[\\p{L}]', 'u')) === 0;
    }
    catch {
        // Firefox throws a SyntaxError when the group is unsupported.
    }
    return isSupported;
}
/**
 * Checks if the user agent has enabled a forced colors mode (e.g. Windows High Contrast mode).
 *
 * Returns `false` in environments where `window` global object is not available.
 *
 * @internal
 */
export function isMediaForcedColors() {
    return global.window.matchMedia ? global.window.matchMedia('(forced-colors: active)').matches : false;
}
/**
 * Checks if the user enabled "prefers reduced motion" setting in browser.
 *
 * Returns `false` in environments where `window` global object is not available.
 *
 * @internal
 */
export function isMotionReduced() {
    return global.window.matchMedia ? global.window.matchMedia('(prefers-reduced-motion)').matches : false;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Safely returns `userAgent` from browser's navigator API in a lower case.
 * If navigator API is not available it will return an empty string.
 *
 * @internal
 */
export declare function getUserAgent(): string;
/**
 * A namespace containing environment and browser information.
 */
export interface EnvType {
    /**
     * Indicates that the application is running on Macintosh.
     */
    readonly isMac: boolean;
    /**
     * Indicates that the application is running on Windows.
     */
    readonly isWindows: boolean;
    /**
     * Indicates that the application is running in Firefox (Gecko).
     */
    readonly isGecko: boolean;
    /**
     * Indicates that the application is running in Safari.
     */
    readonly isSafari: boolean;
    /**
     * Indicates that the application is running in iOS.
     */
    readonly isiOS: boolean;
    /**
     * Indicates that the application is running on Android mobile device.
     */
    readonly isAndroid: boolean;
    /**
     * Indicates that the application is running in a browser using the Blink engine.
     */
    readonly isBlink: boolean;
    /**
     * Indicates that the user agent has enabled a forced colors mode (e.g. Windows High Contrast mode).
     *
     * Note that the value of this property is evaluated each time it is accessed, and it may change over time, if the environment
     * settings have changed.
     */
    readonly isMediaForcedColors: boolean;
    /**
     * Indicates that "prefer reduced motion" browser setting is active.
     *
     * Note that the value of this property is evaluated each time it is accessed, and it may change over time, if the environment
     * settings have changed.
     */
    readonly isMotionReduced: boolean;
    /**
     * Environment features information.
     */
    readonly features: EnvFeaturesType;
}
export interface EnvFeaturesType {
    /**
     * Indicates that the environment supports ES2018 Unicode property escapes — like `\p{P}` or `\p{L}`.
     * More information about unicode properties might be found
     * [in Unicode Standard Annex #44](https://www.unicode.org/reports/tr44/#GC_Values_Table).
     */
    readonly isRegExpUnicodePropertySupported: boolean;
}
/**
 * A namespace containing environment and browser information.
 */
export declare const env: EnvType;
/**
 * Checks if User Agent represented by the string is running on Macintosh.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running on Macintosh or not.
 */
export declare function isMac(userAgent: string): boolean;
/**
 * Checks if User Agent represented by the string is running on Windows.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running on Windows or not.
 */
export declare function isWindows(userAgent: string): boolean;
/**
 * Checks if User Agent represented by the string is Firefox (Gecko).
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Firefox or not.
 */
export declare function isGecko(userAgent: string): boolean;
/**
 * Checks if User Agent represented by the string is Safari.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Safari or not.
 */
export declare function isSafari(userAgent: string): boolean;
/**
 * Checks if User Agent represented by the string is running in iOS.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is running in iOS or not.
 */
export declare function isiOS(userAgent: string): boolean;
/**
 * Checks if User Agent represented by the string is Android mobile device.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Safari or not.
 */
export declare function isAndroid(userAgent: string): boolean;
/**
 * Checks if User Agent represented by the string is Blink engine.
 *
 * @internal
 * @param userAgent **Lowercase** `navigator.userAgent` string.
 * @returns Whether User Agent is Blink engine or not.
 */
export declare function isBlink(userAgent: string): boolean;
/**
 * Checks if the current environment supports ES2018 Unicode properties like `\p{P}` or `\p{L}`.
 * More information about unicode properties might be found
 * [in Unicode Standard Annex #44](https://www.unicode.org/reports/tr44/#GC_Values_Table).
 *
 * @internal
 */
export declare function isRegExpUnicodePropertySupported(): boolean;
/**
 * Checks if the user agent has enabled a forced colors mode (e.g. Windows High Contrast mode).
 *
 * Returns `false` in environments where `window` global object is not available.
 *
 * @internal
 */
export declare function isMediaForcedColors(): boolean;
/**
 * Checks if the user enabled "prefers reduced motion" setting in browser.
 *
 * Returns `false` in environments where `window` global object is not available.
 *
 * @internal
 */
export declare function isMotionReduced(): boolean;

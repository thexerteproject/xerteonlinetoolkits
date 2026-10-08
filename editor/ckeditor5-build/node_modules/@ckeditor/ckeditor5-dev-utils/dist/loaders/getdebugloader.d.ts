/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
type DebugLoaderOptions = {
    loader: string;
    options: {
        debugFlags: Array<string>;
    };
};
/**
 * @param {Array.<string>} debugFlags
 * @returns {object}
 */
export default function getDebugLoader(debugFlags: Array<string>): DebugLoaderOptions;
export {};

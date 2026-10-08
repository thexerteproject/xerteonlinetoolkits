/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
export default function getIconsLoader({ matchExtensionOnly }?: {
    matchExtensionOnly?: boolean;
}): {
    test: RegExp;
    use: Array<string>;
};

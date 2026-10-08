/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module minimap/utils
 */
import { Rect } from 'ckeditor5/src/utils.js';
import type { Editor } from 'ckeditor5/src/core.js';
/**
 * Clones the editing view DOM root by using a dedicated pair of {@link module:engine/view/renderer~ViewRenderer} and
 * {@link module:engine/view/domconverter~ViewDomConverter}. The DOM root clone updates incrementally to stay in sync with the
 * source root.
 *
 * @internal
 * @param editor The editor instance the original editing root belongs to.
 * @param rootName The name of the root to clone.
 * @returns The editing root DOM clone element.
 */
export declare function cloneEditingViewDomRoot(editor: Editor, rootName?: string): HTMLElement;
/**
 * Harvests all web page styles, for instance, to allow re-using them in an `<iframe>` preserving the look of the content.
 *
 * The returned data format is as follows:
 *
 * ```ts
 * [
 * 	'p { color: red; ... } h2 { font-size: 2em; ... } ...',
 * 	'.spacing { padding: 1em; ... }; ...',
 * 	'...',
 * 	{ href: 'http://link.to.external.stylesheet' },
 * 	{ href: '...' }
 * ]
 * ```
 *
 * **Note**: For stylesheets with `href` different than window origin, an object is returned because
 * accessing rules of these styles may cause CORS errors (depending on the configuration of the web page).
 *
 * @internal
 */
export declare function getPageStyles(): Array<string | {
    href: string;
}>;
/**
 * Gets dimensions rectangle according to passed DOM element. Returns whole window's size for `body` element.
 *
 * @internal
 */
export declare function getDomElementRect(domElement: HTMLElement): Rect;
/**
 * Gets client height according to passed DOM element. Returns window's height for `body` element.
 *
 * @internal
 */
export declare function getClientHeight(domElement: HTMLElement): number;
/**
 * Returns the DOM element itself if it's not a `body` element, whole window otherwise.
 *
 * @internal
 */
export declare function getScrollable(domElement: HTMLElement): Window | HTMLElement;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/space
 */
/**
 * Replaces last space preceding elements closing tag with `&nbsp;`. Such operation prevents spaces from being removed
 * during further DOM/View processing (see especially {@link module:engine/view/domconverter~ViewDomConverter#_processDomInlineNodes}).
 * This method also takes into account Word specific `<o:p></o:p>` empty tags.
 * Additionally multiline sequences of spaces and new lines between tags are removed (see #39 and #40).
 *
 * @param htmlString HTML string in which spacing should be normalized.
 * @returns Input HTML with spaces normalized.
 * @internal
 */
export declare function normalizeSpacing(htmlString: string): string;
/**
 * Normalizes spacing in special Word `spacerun spans` (`<span style='mso-spacerun:yes'>\s+</span>`) by replacing
 * all spaces with `&nbsp; ` pairs. This prevents spaces from being removed during further DOM/View processing
 * (see especially {@link module:engine/view/domconverter~ViewDomConverter#_processDomInlineNodes}).
 *
 * @param htmlDocument Native `Document` object in which spacing should be normalized.
 * @internal
 */
export declare function normalizeSpacerunSpans(htmlDocument: Document): void;

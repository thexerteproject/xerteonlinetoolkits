/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Removes the `xmlns` attribute from table pasted from Google Sheets.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 * @internal
 */
export function removeXmlns(documentFragment, writer) {
    for (const child of documentFragment.getChildren()) {
        if (child.is('element', 'table') && child.hasAttribute('xmlns')) {
            writer.removeAttribute('xmlns', child);
        }
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Removes `<style>` block added by Google Sheets to a copied content.
 *
 * @param documentFragment element `data.content` obtained from clipboard
 * @internal
 */
export function removeStyleBlock(documentFragment, writer) {
    for (const child of Array.from(documentFragment.getChildren())) {
        if (child.is('element', 'style')) {
            writer.remove(child);
        }
    }
}

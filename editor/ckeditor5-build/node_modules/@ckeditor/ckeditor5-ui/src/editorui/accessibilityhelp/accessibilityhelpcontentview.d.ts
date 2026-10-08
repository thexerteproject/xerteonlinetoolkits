/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/editorui/accessibilityhelp/accessibilityhelpcontentview
 */
import { type Locale } from '@ckeditor/ckeditor5-utils';
import { View } from '../../view.js';
import type { KeystrokeInfoDefinitions } from '@ckeditor/ckeditor5-core';
/**
 * The view displaying keystrokes in the Accessibility help dialog.
 */
export declare class AccessibilityHelpContentView extends View<HTMLDivElement> {
    /**
     * @inheritDoc
     */
    constructor(locale: Locale, keystrokes: KeystrokeInfoDefinitions);
    /**
     * @inheritDoc
     */
    focus(): void;
    /**
     * Creates `<section><h3>Category label</h3>...</section>` elements for each category of keystrokes.
     */
    private _createCategories;
    /**
     * Creates `[<h4>Optional label</h4>]<dl>...</dl>` elements for each group of keystrokes in a category.
     */
    private _createGroup;
    /**
     * Creates `<dt>Keystroke label</dt><dd>Keystroke definition</dd>` elements for each keystroke in a group.
     */
    private _createGroupRow;
}

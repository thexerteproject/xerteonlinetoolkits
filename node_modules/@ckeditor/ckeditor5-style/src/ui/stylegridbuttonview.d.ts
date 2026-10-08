/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/ui/stylegridbuttonview
 */
import type { Locale } from 'ckeditor5/src/utils.js';
import { ButtonView, View } from 'ckeditor5/src/ui.js';
import type { NormalizedStyleDefinition } from '../styleutils.js';
/**
 * A class representing an individual button (style) in the grid. Renders a rich preview of the style.
 *
 * @internal
 */
export declare class StyleGridButtonView extends ButtonView {
    /**
     * Definition of the style the button will apply when executed.
     */
    readonly styleDefinition: NormalizedStyleDefinition;
    /**
     * The view rendering the preview of the style.
     */
    readonly previewView: View;
    /**
     * Creates an instance of the {@link module:style/ui/stylegridbuttonview~StyleGridButtonView} class.
     *
     * @param locale The localization services instance.
     * @param styleDefinition Definition of the style.
     */
    constructor(locale: Locale, styleDefinition: NormalizedStyleDefinition);
    /**
     * Creates the view representing the preview of the style.
     */
    private _createPreview;
}

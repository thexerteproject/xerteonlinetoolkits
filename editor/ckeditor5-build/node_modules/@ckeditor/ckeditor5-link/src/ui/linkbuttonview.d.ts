/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ButtonView, IconView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
/**
 * Represents a view for a dropdown menu button.
 */
export declare class LinkButtonView extends ButtonView {
    /**
     * An icon that displays an arrow to indicate a direction of the menu.
     */
    readonly arrowView: IconView;
    /**
     * Creates an instance of the dropdown menu button view.
     *
     * @param locale The localization services instance.
     */
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Creates the arrow view instance.
     *
     * @private
     */
    private _createArrowView;
}

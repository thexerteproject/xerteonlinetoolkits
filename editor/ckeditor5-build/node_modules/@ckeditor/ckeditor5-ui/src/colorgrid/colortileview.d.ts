/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Locale } from '@ckeditor/ckeditor5-utils';
import { ButtonView } from '../button/buttonview.js';
/**
 * This class represents a single color tile in the {@link module:ui/colorgrid/colorgridview~ColorGridView}.
 */
export declare class ColorTileView extends ButtonView {
    /**
     * String representing a color shown as tile's background.
     */
    color: string | undefined;
    /**
     * A flag that toggles a special CSS class responsible for displaying
     * a border around the button.
     */
    hasBorder: boolean;
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
}

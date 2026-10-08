/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ButtonView } from '../../button/buttonview.js';
import { type DropdownButton } from './dropdownbutton.js';
import { IconView } from '../../icon/iconview.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The default dropdown button view class.
 *
 * ```ts
 * const view = new DropdownButtonView();
 *
 * view.set( {
 * 	label: 'A button',
 * 	keystroke: 'Ctrl+B',
 * 	tooltip: true
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 *
 * Also see the {@link module:ui/dropdown/utils~createDropdown `createDropdown()` util}.
 */
export declare class DropdownButtonView extends ButtonView implements DropdownButton {
    /**
     * An icon that displays arrow to indicate a dropdown button.
     */
    readonly arrowView: IconView;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Creates a {@link module:ui/icon/iconview~IconView} instance as {@link #arrowView}.
     */
    private _createArrowView;
}

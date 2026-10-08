/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/button/switchbuttonview
 */
import { View } from '../view.js';
import { ButtonView } from './buttonview.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/button/switchbutton.css';
/**
 * The switch button view class.
 *
 * ```ts
 * const view = new SwitchButtonView();
 *
 * view.set( {
 * 	withText: true,
 * 	label: 'Switch me!'
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 */
export declare class SwitchButtonView extends ButtonView {
    /**
     * The toggle switch of the button.
     */
    readonly toggleSwitchView: View;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Creates a toggle child view.
     */
    private _createToggleView;
}

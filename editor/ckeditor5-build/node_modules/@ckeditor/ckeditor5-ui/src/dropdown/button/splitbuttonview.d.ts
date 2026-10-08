/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { KeystrokeHandler, FocusTracker, type Locale } from '@ckeditor/ckeditor5-utils';
import { View } from '../../view.js';
import { ButtonView } from '../../button/buttonview.js';
import { type ViewCollection } from '../../viewcollection.js';
import { type Button } from '../../button/button.js';
import { type DropdownButton } from './dropdownbutton.js';
import type { FocusableView } from '../../focuscycler.js';
import '../../../theme/components/dropdown/splitbutton.css';
/**
 * The split button view class.
 *
 * ```ts
 * const view = new SplitButtonView();
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
export declare class SplitButtonView extends View<HTMLDivElement> implements DropdownButton {
    /**
     * Collection of the child views inside of the split button {@link #element}.
     */
    readonly children: ViewCollection;
    /**
     * A main button of split button.
     */
    readonly actionView: ButtonView;
    /**
     * A secondary button of split button that opens dropdown.
     */
    readonly arrowView: ButtonView;
    /**
     * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
     * keystrokes of the split button:
     *
     * * <kbd>▶</kbd> moves focus to arrow view when action view is focused,
     * * <kbd>◀</kbd> moves focus to action view when arrow view is focused.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * Tracks information about DOM focus in the dropdown.
     */
    readonly focusTracker: FocusTracker;
    /**
     * @inheritDoc
     */
    label: string | undefined;
    /**
     * @inheritDoc
     */
    keystroke: string | undefined;
    /**
     * @inheritDoc
     */
    tooltip: Button['tooltip'];
    /**
     * @inheritDoc
     */
    tooltipPosition: Button['tooltipPosition'];
    /**
     * @inheritDoc
     */
    type: Button['type'];
    /**
     * @inheritDoc
     */
    isOn: boolean;
    /**
     * @inheritDoc
     */
    isEnabled: boolean;
    /**
     * @inheritDoc
     */
    isVisible: boolean;
    /**
     * @inheritDoc
     */
    isToggleable: boolean;
    /**
     * @inheritDoc
     */
    withText: boolean;
    /**
     * @inheritDoc
     */
    withKeystroke: boolean;
    /**
     * @inheritDoc
     */
    icon: string | undefined;
    /**
     * @inheritDoc
     */
    tabindex: number;
    /**
     * @inheritDoc
     */
    class: string | undefined;
    /**
     * @inheritDoc
     */
    labelStyle: string | undefined;
    /**
     * @inheritDoc
     */
    role: string | undefined;
    /**
     * @inheritDoc
     */
    ariaChecked: boolean | undefined;
    /**
     * @inheritDoc
     */
    ariaLabel?: string | undefined;
    /**
     * @inheritDoc
     */
    ariaLabelledBy: string | undefined;
    /**
     * @inheritDoc
     */
    constructor(locale?: Locale, actionButton?: ButtonView & FocusableView);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the {@link module:ui/button/buttonview~ButtonView#element} of the action part of split button.
     */
    focus(): void;
    /**
     * Creates a {@link module:ui/button/buttonview~ButtonView} instance as {@link #actionView} and binds it with main split button
     * attributes.
     */
    private _createActionView;
    /**
     * Creates a {@link module:ui/button/buttonview~ButtonView} instance as {@link #arrowView} and binds it with main split button
     * attributes.
     */
    private _createArrowView;
}

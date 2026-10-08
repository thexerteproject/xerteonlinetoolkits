/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/button/buttonview
 */
import { View } from '../view.js';
import { IconView } from '../icon/iconview.js';
import { type ViewCollection } from '../viewcollection.js';
import type { Button } from './button.js';
import { type ButtonLabel } from './buttonlabel.js';
import { type Locale } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/button/button.css';
/**
 * The button view class.
 *
 * ```ts
 * const view = new ButtonView();
 *
 * view.set( {
 * 	label: 'A button',
 * 	keystroke: 'Ctrl+B',
 * 	tooltip: true,
 * 	withText: true
 * } );
 *
 * view.render();
 *
 * document.body.append( view.element );
 * ```
 */
export declare class ButtonView extends View<HTMLButtonElement> implements Button {
    /**
     * Collection of the child views inside of the button {@link #element}.
     */
    readonly children: ViewCollection;
    /**
     * Label of the button view. Its text is configurable using the {@link #label label attribute}.
     *
     * If not configured otherwise in the `constructor()`, by default the label is an instance
     * of {@link module:ui/button/buttonlabelview~ButtonLabelView}.
     */
    readonly labelView: ButtonLabel;
    /**
     * The icon view of the button. Will be added to {@link #children} when the
     * {@link #icon icon attribute} is defined.
     */
    readonly iconView: IconView;
    /**
     * A view displaying the keystroke of the button next to the {@link #labelView label}.
     * Added to {@link #children} when the {@link #withKeystroke `withKeystroke` attribute}
     * is defined.
     */
    readonly keystrokeView: View;
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
    icon: string | undefined;
    /**
     * @inheritDoc
     */
    isEnabled: boolean;
    /**
     * @inheritDoc
     */
    isOn: boolean;
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
    keystroke: string | undefined;
    /**
     * @inheritDoc
     */
    label: string | undefined;
    /**
     * @inheritDoc
     */
    tabindex: number;
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
    withText: boolean;
    /**
     * @inheritDoc
     */
    withKeystroke: boolean;
    /**
     * @inheritDoc
     */
    role: string | undefined;
    /**
     * @inheritDoc
     */
    ariaLabel?: string | undefined;
    /**
     * @inheritDoc
     */
    ariaLabelledBy: string | undefined;
    /**
     * Aria-pressed attribute of element. It is calculated based on {@link #isToggleable isToggleable} and {@link #role}.
     * It's set to true if the button is on and the role is not checkable.
     *
     * @readonly
     * @internal
     */
    _ariaPressed: string | false;
    /**
     * Aria-checked attribute of element. It is calculated based on {@link #isToggleable isToggleable} and {@link #role}.
     * It's set to true if the button is on and the role is checkable.
     *
     * @readonly
     * @internal
     */
    _ariaChecked: string | false;
    /**
     * Tooltip of the button bound to the template.
     *
     * @see #tooltip
     * @see module:ui/button/buttonview~ButtonView#_getTooltipString
     * @internal
     * @observable
     */
    _tooltipString: string;
    /**
     * Delayed focus function for focus handling in Safari.
     */
    private _focusDelayed;
    /**
     * Creates an instance of the button view class.
     *
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param labelView The instance of the button's label. If not provided, an instance of
     * {@link module:ui/button/buttonlabelview~ButtonLabelView} is used.
     */
    constructor(locale?: Locale, labelView?: ButtonLabel);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * Focuses the {@link #element} of the button.
     */
    focus(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Binds the label view instance it with button attributes.
     */
    private _setupLabelView;
    /**
     * Creates a view that displays a keystroke next to a {@link #labelView label }
     * and binds it with button attributes.
     */
    private _createKeystrokeView;
    /**
     * Gets the text for the tooltip from the combination of
     * {@link #tooltip}, {@link #label} and {@link #keystroke} attributes.
     *
     * @see #tooltip
     * @see #_tooltipString
     * @param tooltip Button tooltip.
     * @param label Button label.
     * @param keystroke Button keystroke.
     */
    private _getTooltipString;
}

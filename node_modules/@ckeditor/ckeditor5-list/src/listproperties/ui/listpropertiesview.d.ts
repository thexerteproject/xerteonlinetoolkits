/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/ui/listpropertiesview
 */
import { ButtonView, View, ViewCollection, FocusCycler, SwitchButtonView, LabeledFieldView, CollapsibleView, type InputNumberView, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import type { NormalizedListPropertiesConfig } from '../utils/config.js';
import '../../../theme/listproperties.css';
/**
 * The list properties view to be displayed in the list dropdown.
 *
 * Contains a grid of available list styles and, for numbered list, also the list start index and reversed fields.
 *
 * @internal
 */
export declare class ListPropertiesView extends View {
    /**
     * @inheritDoc
     */
    locale: Locale;
    /**
     * A collection of the child views.
     */
    readonly children: ViewCollection;
    /**
     * A view that renders the grid of list styles.
     */
    readonly stylesView: StylesView | null;
    /**
     * A collapsible view that hosts additional list property fields ({@link #startIndexFieldView} and
     * {@link #reversedSwitchButtonView}) to visually separate them from the {@link #stylesView grid of styles}.
     *
     * **Note**: Only present when:
     * * the view represents **numbered** list properties,
     * * and the {@link #stylesView} is rendered,
     * * and either {@link #startIndexFieldView} or {@link #reversedSwitchButtonView} is rendered.
     *
     * @readonly
     */
    additionalPropertiesCollapsibleView: CollapsibleView | null;
    /**
     * A labeled number field allowing the user to set the start index of the list.
     *
     * **Note**: Only present when the view represents **numbered** list properties.
     *
     * @readonly
     */
    startIndexFieldView: LabeledFieldView<InputNumberView> | null;
    /**
     * A switch button allowing the user to make the edited list reversed.
     *
     * **Note**: Only present when the view represents **numbered** list properties.
     *
     * @readonly
     */
    reversedSwitchButtonView: SwitchButtonView | null;
    /**
     * Tracks information about the DOM focus in the view.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of views that can be focused in the properties view.
     */
    readonly focusables: ViewCollection<FocusableView>;
    /**
     * Helps cycling over {@link #focusables} in the view.
     */
    readonly focusCycler: FocusCycler;
    /**
     * Creates an instance of the list properties view.
     *
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param options Options of the view.
     * @param options.enabledProperties An object containing the configuration of enabled list property names.
     * Allows conditional rendering the sub-components of the properties view.
     * @param options.styleButtonViews A list of style buttons to be rendered
     * inside the styles grid. The grid will not be rendered when `enabledProperties` does not include the `'styles'` key.
     * @param options.styleGridAriaLabel An assistive technologies label set on the grid of styles (if the grid is rendered).
     */
    constructor(locale: Locale, { enabledProperties, styleButtonViews, styleGridAriaLabel }: {
        enabledProperties: NormalizedListPropertiesConfig;
        styleButtonViews: Array<ButtonView> | null;
        styleGridAriaLabel: string;
    });
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    focus(): void;
    /**
     * @inheritDoc
     */
    focusLast(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates the list styles grid.
     *
     * @param styleButtons Buttons to be placed in the grid.
     * @param styleGridAriaLabel The assistive technology label of the grid.
     */
    private _createStylesView;
    /**
     * Renders {@link #startIndexFieldView} and/or {@link #reversedSwitchButtonView} depending on the configuration of the properties view.
     *
     * @param enabledProperties An object containing the configuration of enabled list property names
     * (see {@link #constructor}).
     */
    private _addNumberedListPropertyViews;
    /**
     * Creates the list start index labeled field.
     */
    private _createStartIndexField;
    /**
     * Creates the reversed list switch button.
     */
    private _createReversedSwitchButton;
}
/**
 * The view that renders the grid of styles.
 *
 * @internal
 */
export type StylesView = View & {
    children: ViewCollection;
    focusTracker: FocusTracker;
    keystrokes: KeystrokeHandler;
    focus(): void;
};
/**
 * Fired when the list start index value has changed via {@link ~ListPropertiesView#startIndexFieldView}.
 *
 * @eventName ~ListPropertiesView#listStart
 */
export type ListPropertiesViewListStartEvent = {
    name: 'listStart';
    args: [data: {
        startIndex: number;
    }];
};
/**
 * Fired when the list order has changed (reversed) via {@link ~ListPropertiesView#reversedSwitchButtonView}.
 *
 * @eventName ~ListPropertiesView#listReversed
 */
export type ListPropertiesViewListReversedEvent = {
    name: 'listReversed';
    args: [];
};

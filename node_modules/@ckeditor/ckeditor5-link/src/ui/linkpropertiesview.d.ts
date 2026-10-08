/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/ui/linkpropertiesview
 */
import { ButtonView, View, ViewCollection, type SwitchButtonView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '../../theme/linkproperties.css';
/**
 * The link properties view controller class.
 *
 * See {@link module:link/ui/linkpropertiesview~LinkPropertiesView}.
 */
export declare class LinkPropertiesView extends View {
    /**
     * Tracks information about DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * The Back button view displayed in the header.
     */
    backButtonView: ButtonView;
    /**
     * A collection of child views.
     */
    readonly children: ViewCollection;
    /**
     * A collection of {@link module:ui/button/switchbuttonview~SwitchButtonView},
     * which corresponds to {@link module:link/linkcommand~LinkCommand#manualDecorators manual decorators}
     * configured in the editor.
     */
    readonly listChildren: ViewCollection<SwitchButtonView>;
    /**
     * A collection of views that can be focused in the form.
     */
    private readonly _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    private readonly _focusCycler;
    /**
     * Creates an instance of the {@link module:link/ui/linkpropertiesview~LinkPropertiesView} class.
     *
     * Also see {@link #render}.
     *
     * @param locale The localization services instance.
     */
    constructor(locale: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the fist {@link #_focusables} in the form.
     */
    focus(): void;
    /**
     * Creates a back button view.
     */
    private _createBackButton;
    /**
     * Creates a header view for the form.
     */
    private _createHeaderView;
    /**
     * Creates a form view that displays the {@link #listChildren} collection.
     */
    private _createListView;
}
/**
 * Fired when the {@link ~LinkPropertiesView#backButtonView} is pressed.
 *
 * @eventName ~LinkPropertiesView#back
 */
export type LinkPropertiesBackEvent = {
    name: 'back';
    args: [];
};

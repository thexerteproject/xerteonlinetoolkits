/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/ui/linkprovideritemsview
 */
import { ButtonView, View, ListView, ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import '../../theme/linkprovideritems.css';
/**
 * The link provider items view.
 */
export declare class LinkProviderItemsView extends View {
    /**
     * Tracks information about the list of links.
     *
     * @observable
     */
    hasItems: boolean;
    /**
     * The header label of the view.
     *
     * @observable
     */
    title: string;
    /**
     * The text displayed when no links are available.
     *
     * @observable
     */
    emptyListPlaceholder: string;
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
     * The List view of links buttons.
     */
    listView: ListView;
    /**
     * The collection of child views, which is bind with the `listView`.
     */
    readonly listChildren: ViewCollection<ButtonView>;
    /**
     * The view displayed when the list is empty.
     */
    emptyListInformation: View;
    /**
     * A collection of child views.
     */
    children: ViewCollection;
    /**
     * A collection of views that can be focused in the form.
     */
    private readonly _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    private readonly _focusCycler;
    /**
     * Creates an instance of the {@link module:link/ui/linkprovideritemsview~LinkProviderItemsView} class.
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
     * Creates a view for the list at the bottom.
     */
    private _createListView;
    /**
     * Creates a back button view that cancels the form.
     */
    private _createBackButton;
    /**
     * Creates a header view for the form.
     */
    private _createHeaderView;
    /**
     * Creates an info view for an empty list.
     */
    private _createEmptyLinksListItemView;
}
/**
 * Fired when the links view is canceled, for example with a click on {@link ~LinkProviderItemsView#backButtonView}.
 *
 * @eventName ~LinkProviderItemsView#cancel
 */
export type LinkProvidersCancelEvent = {
    name: 'cancel';
    args: [];
};

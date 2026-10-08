/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/linkui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ContextualBalloon, ToolbarView, type ViewWithCssTransitionDisabler } from 'ckeditor5/src/ui.js';
import { LinkEditing } from './linkediting.js';
import { LinkFormView } from './ui/linkformview.js';
import { LinkProviderItemsView } from './ui/linkprovideritemsview.js';
import { LinkPropertiesView } from './ui/linkpropertiesview.js';
import '../theme/linktoolbar.css';
/**
 * The link UI plugin. It introduces the `'link'` and `'unlink'` buttons and support for the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export declare class LinkUI extends Plugin {
    /**
     * The toolbar view displayed inside of the balloon.
     */
    toolbarView: ToolbarView | null;
    /**
     * The form view displayed inside the balloon.
     */
    formView: LinkFormView & ViewWithCssTransitionDisabler | null;
    /**
     * The view displaying links list.
     */
    linkProviderItemsView: LinkProviderItemsView | null;
    /**
     * The form view displaying properties link settings.
     */
    propertiesView: LinkPropertiesView & ViewWithCssTransitionDisabler | null;
    /**
     * The selected text of the link or text that is selected and can become a link.
     *
     * Note: It is `undefined` when the current selection does not allow for text,
     * for example any non text node is selected or multiple blocks are selected.
     *
     * @observable
     * @readonly
     */
    selectedLinkableText: string | undefined;
    /**
     * The contextual balloon plugin instance.
     */
    private _balloon;
    /**
     * The collection of the link providers.
     */
    private _linksProviders;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ContextualBalloon, typeof LinkEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): "LinkUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Registers list of buttons below the link form view that
     * open a list of links provided by the clicked provider.
     */
    registerLinksListProvider(provider: LinksProvider): void;
    /**
     * Creates views.
     */
    private _createViews;
    /**
     * Creates the ToolbarView instance.
     */
    private _createToolbarView;
    /**
     * Creates the {@link module:link/ui/linkformview~LinkFormView} instance.
     */
    private _createFormView;
    /**
     * Creates a sorted array of buttons with link names.
     */
    private _createLinkProviderListView;
    /**
     * Creates a view for links provider.
     */
    private _createLinkProviderItemsView;
    /**
     * Creates the {@link module:link/ui/linkpropertiesview~LinkPropertiesView} instance.
     */
    private _createPropertiesView;
    /**
     * Obtains the state of the manual decorators.
     */
    private _getDecoratorSwitchesState;
    /**
     * Registers listeners used in editing plugin, used to open links.
     */
    private _registerEditingOpeners;
    /**
     * Registers components in the ComponentFactory.
     */
    private _registerComponents;
    /**
     * Creates a links button view.
     */
    private _createLinksListProviderButton;
    /**
     * Creates a button for link command to use either in toolbar or in menu bar.
     */
    private _createButton;
    /**
     * Attaches actions that control whether the balloon panel containing the
     * {@link #formView} should be displayed.
     */
    private _enableBalloonActivators;
    /**
     * Attaches actions that control whether the balloon panel containing the
     * {@link #formView} is visible or not.
     */
    private _enableUserBalloonInteractions;
    /**
     * Adds the {@link #toolbarView} to the {@link #_balloon}.
     *
     * @internal
     */
    _addToolbarView(): void;
    /**
     * Adds the {@link #formView} to the {@link #_balloon}.
     */
    private _addFormView;
    /**
     * Adds the {@link #propertiesView} to the {@link #_balloon}.
     */
    private _addPropertiesView;
    /**
     * Shows the view with links provided by the given provider.
     */
    private _showLinksProviderView;
    /**
     * Adds the {@link #linkProviderItemsView} to the {@link #_balloon}.
     */
    private _addLinkProviderItemsView;
    /**
     * Closes the form view. Decides whether the balloon should be hidden completely or if the action view should be shown. This is
     * decided upon the link command value (which has a value if the document selection is in the link).
     */
    private _closeFormView;
    /**
     * Removes the {@link #propertiesView} from the {@link #_balloon}.
     */
    private _removePropertiesView;
    /**
     * Removes the {@link #linkProviderItemsView} from the {@link #_balloon}.
     */
    private _removeLinksProviderView;
    /**
     * Removes the {@link #formView} from the {@link #_balloon}.
     */
    private _removeFormView;
    /**
     * Shows the correct UI type. It is either {@link #formView} or {@link #toolbarView}.
     *
     * @internal
     */
    _showUI(forceVisible?: boolean): void;
    /**
     * Removes the {@link #formView} from the {@link #_balloon}.
     *
     * See {@link #_addFormView}, {@link #_addToolbarView}.
     */
    private _hideUI;
    /**
     * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
     * reposition itself when the editor UI should be refreshed.
     *
     * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
     */
    private _startUpdatingUI;
    /**
     * Returns `true` when {@link #propertiesView} is in the {@link #_balloon}.
     */
    private get _arePropertiesInPanel();
    /**
     * Returns `true` when {@link #linkProviderItemsView} is in the {@link #_balloon}.
     */
    private get _isLinksListInPanel();
    /**
     * Returns `true` when {@link #formView} is in the {@link #_balloon}.
     */
    private get _isFormInPanel();
    /**
     * Returns `true` when {@link #toolbarView} is in the {@link #_balloon}.
     */
    private get _isToolbarInPanel();
    /**
     * Returns `true` when {@link #propertiesView} is in the {@link #_balloon} and it is
     * currently visible.
     */
    private get _isPropertiesVisible();
    /**
     * Returns `true` when {@link #formView} is in the {@link #_balloon} and it is
     * currently visible.
     */
    private get _isFormVisible();
    /**
     * Returns `true` when {@link #toolbarView} is in the {@link #_balloon} and it is
     * currently visible.
     */
    private get _isToolbarVisible();
    /**
     * Returns `true` when {@link #propertiesView}, {@link #toolbarView}, {@link #linkProviderItemsView}
     * or {@link #formView} is in the {@link #_balloon}.
     */
    private get _isUIInPanel();
    /**
     * Returns `true` when {@link #propertiesView}, {@link #linkProviderItemsView}, {@link #toolbarView}
     * or {@link #formView} is in the {@link #_balloon} and it is currently visible.
     */
    private get _isUIVisible();
    /**
     * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
     * to the target element or selection.
     *
     * If the selection is collapsed and inside a link element, the panel will be attached to the
     * entire link element. Otherwise, it will be attached to the selection.
     */
    private _getBalloonPositionData;
    /**
     * Returns the link {@link module:engine/view/attributeelement~ViewAttributeElement} under
     * the {@link module:engine/view/document~ViewDocument editing view's} selection or `null`
     * if there is none.
     *
     * **Note**: For a non–collapsed selection, the link element is returned when **fully**
     * selected and the **only** element within the selection boundaries, or when
     * a linked widget is selected.
     */
    private _getSelectedLinkElement;
    /**
     * Returns selected link text content.
     * If link is not selected it returns the selected text.
     * If selection or link includes non text node (inline object or block) then returns undefined.
     */
    private _getSelectedLinkableText;
    /**
     * Returns a provider by its URL.
     *
     * @param href URL of the link.
     * @returns Link provider and item or `null` if not found.
     */
    private _getLinkProviderLinkByHref;
    /**
     * Displays a fake visual selection when the contextual balloon is displayed.
     *
     * This adds a 'link-ui' marker into the document that is rendered as a highlight on selected text fragment.
     */
    private _showFakeVisualSelection;
    /**
     * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
     */
    private _hideFakeVisualSelection;
}
/**
 * Link list item that represents a single link in the provider's list.
 * It's displayed after the user clicks the button that opens the list in the link form view.
 */
export type LinksProviderListItem = {
    /**
     * Unique identifier of the item. Avoids collection malfunction when there are links with the same labels.
     */
    id: string;
    /**
     * URL of the link.
     */
    href: string;
    /**
     * Label that is used as a text for the list item.
     */
    label: string;
    /**
     * Optional icon displayed for the item.
     */
    icon?: string;
};
/**
 * Link list item with additional attributes that will be used when:
 *
 * 	* The item is selected and the preview of the item is displayed.
 * 	* The user selects the item and the link is created.
 * 	* The user navigates to the item using editing.
 *
 * It can be used to perform additional lookups in the database or to provide additional information about the link.
 */
export type LinksProviderDetailedItem = {
    /**
     * URL of the link.
     */
    href: string;
    /**
     * Optional icon displayed when the user opens toolbar with the item preview.
     */
    icon?: string;
    /**
     * Optional label shown in the link preview. If not passed then the `href` is used as the label.
     */
    label?: string;
    /**
     * Optional tooltip shown in the link preview.
     */
    tooltip?: string;
};
/**
 * Interface for a provider that provides a list of links to be displayed in the link form view.
 */
export type LinksProvider = {
    /**
     * Label that serves two purposes:
     *
     * 	* As a text for the button that opens this link list from within link form view.
     * 	* As a text for the header when the list of links from this provider is displayed.
     */
    label: string;
    /**
     * Message to be displayed when there are no items in the list.
     * It's optional and if not provided, a default message will be displayed.
     */
    emptyListPlaceholder?: string;
    /**
     * Weight used for ordering providers in the list. Higher weight means the provider will be displayed lower in the list.
     *
     * @default 0
     */
    order?: number;
    /**
     * Callback for retrieving an static array of items which is being called every time the list is displayed.
     * It's not required to provide all links at once, it's possible to pass only slice of links.
     */
    getListItems(): Array<LinksProviderListItem>;
    /**
     * Optional callback for retrieving an item by its URL.
     * If not provided the item from the list will be used.
     */
    getItem?(href: string): LinksProviderDetailedItem | null;
    /**
     * Callback called when user clicked the link in the list.
     *
     * @param item Item that was clicked.
     * @returns `true` if the link was handled by the provider, `false` otherwise. It'll prevent the default action if `true`.
     */
    navigate?(item: LinksProviderDetailedItem): boolean;
};

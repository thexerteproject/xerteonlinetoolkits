/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ContextualBalloon, type ViewWithCssTransitionDisabler } from 'ckeditor5/src/ui.js';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget.js';
import { BookmarkFormView } from './ui/bookmarkformview.js';
import { BookmarkEditing } from './bookmarkediting.js';
import '../theme/bookmarktoolbar.css';
/**
 * The UI plugin of the bookmark feature.
 *
 * It registers the `'bookmark'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * which inserts the `bookmark` element upon selection.
 */
export declare class BookmarkUI extends Plugin {
    /**
     * The form view displayed inside the balloon.
     */
    formView: BookmarkFormView & ViewWithCssTransitionDisabler | null;
    /**
     * The contextual balloon plugin instance.
     */
    private _balloon;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof BookmarkEditing, typeof ContextualBalloon, typeof WidgetToolbarRepository];
    /**
     * @inheritDoc
     */
    static get pluginName(): "BookmarkUI";
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
    afterInit(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates views.
     */
    private _createViews;
    /**
     * Creates the {@link module:bookmark/ui/bookmarkformview~BookmarkFormView} instance.
     */
    private _createFormView;
    /**
     * Creates link form menu list entry, so it'll be possible to access
     * the list of the bookmarks from the link form.
     */
    private _registerLinkProvider;
    /**
     * Scrolls the editor to the bookmark with the given id.
     */
    private _scrollToBookmark;
    /**
     * Creates a toolbar Bookmark button. Clicking this button will show
     * a {@link #_balloon} attached to the selection.
     */
    private _registerComponents;
    /**
     * Creates a button for `bookmark` command to use either in toolbar or in menu bar.
     */
    private _createBookmarkButton;
    /**
     * Attaches actions that control whether the balloon panel containing the
     * {@link #formView} is visible or not.
     */
    private _enableUserBalloonInteractions;
    /**
     * Adds the {@link #formView} to the {@link #_balloon}.
     */
    private _addFormView;
    /**
     * Removes the {@link #formView} from the {@link #_balloon}.
     */
    private _removeFormView;
    /**
     * Shows the {@link #formView}.
     */
    private _showFormView;
    /**
     * Removes the {@link #formView} from the {@link #_balloon}.
     */
    private _hideFormView;
    /**
     * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
     * reposition itself when the editor UI should be refreshed.
     *
     * See: {@link #_hideFormView} to learn when the UI stops reacting to the `update` event.
     */
    private _startUpdatingUI;
    /**
     * Returns `true` when {@link #formView} is in the {@link #_balloon}.
     */
    private get _isFormInPanel();
    /**
     * Returns `true` when {@link #formView} is in the {@link #_balloon} and it is currently visible.
     */
    private get _isFormVisible();
    /**
     * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
     * to the target element or selection.
     */
    private _getBalloonPositionData;
    /**
     * Returns the bookmark {@link module:engine/view/attributeelement~ViewAttributeElement} under
     * the {@link module:engine/view/document~ViewDocument editing view's} selection or `null`
     * if there is none.
     */
    private _getSelectedBookmarkElement;
    /**
     * Displays a fake visual selection when the contextual balloon is displayed.
     *
     * This adds a 'bookmark-ui' marker into the document that is rendered as a highlight on selected text fragment.
     */
    private _showFakeVisualSelection;
    /**
     * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
     */
    private _hideFakeVisualSelection;
}

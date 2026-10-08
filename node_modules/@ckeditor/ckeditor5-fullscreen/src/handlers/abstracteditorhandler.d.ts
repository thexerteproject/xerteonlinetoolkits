/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type EventInfo } from 'ckeditor5/src/utils.js';
import type { ElementApi, Editor, EditorConfig } from 'ckeditor5/src/core.js';
/**
 * The abstract editor type handler.
 *
 * This class defines some actions and behaviors that are applied when fullscreen mode is toggled, and which are common
 * regardless of the editor type. Then, specific classes like `ClassicEditorHandler` or `DecoupledEditorHandler`
 * extend this class with actions specific for these editor types.
 *
 * Extend this class to provide fullscreen mode handling for unsupported editor types,
 * or if you wish to heavily customize the default behavior.
 *
 * The only method that is necessary to provide when extending this class is {@link #defaultOnEnter}. However, make sure to
 * familiarize yourself with the below full list of actions taken by `FullscreenAbstractEditorHandler` to understand
 * what is covered by default, and what should be provided by you.
 *
 * When entering the fullscreen mode, the {@link #enable} method is called. It creates the properly styled container
 * and handles the editor features that need it, in the following order:
 *
 * 1. Saves the scroll positions of all ancestors of the editable element to restore them after leaving the fullscreen mode.
 * 2. Executes the {@link #defaultOnEnter} method to move the proper editor UI elements to the fullscreen mode.
 * **If you extend the abstract handler, you should override this method** to move the elements that are specific to your editor type, like:
 * 	editable, toolbar, menu bar.
 * 	Use {@link #moveToFullscreen} method for this purpose to ensure they are automatically cleaned up after leaving the fullscreen mode.
 * 3. Adds proper classes to the `<body>` and `<html>` elements to block page scrolling, adjust `z-index` etc.
 *
 * Steps 4-12 are only executed if the corresponding features are used.
 *
 * 4. If presence list is used, moves it to the fullscreen mode container.
 * 5. If document outline is used, moves it to the fullscreen mode.
 * 6. If pagination is used, adjusts it's configuration for the changed view.
 * 7. If annotations are used, moves them to the fullscreen mode.
 * 8. If revision history is used, overrides the callbacks to show the revision viewer in the fullscreen mode.
 * 9. If AI Tabs is used, moves it to the fullscreen mode.
 * 10. If source editing and document outline are both used, registers a callback hiding the document outline header in source editing mode.
 * 11. Changes the position of some dialogs to utilize the empty space on the right side of the editable element.
 * 12. If custom container is used, hides all other elements in it to ensure they don't create an empty unscrollable space.
 *
 * Then finally:
 *
 * 13. Adjusts the visibility of the left and right sidebars based on the available space.
 * 14. Sets up a resize observer to adjust the visibility of the left and right sidebars dynamically.
 * 15. Executes the configured {@link module:fullscreen/fullscreenconfig~FullscreenConfig#onEnterCallback
 * 	`config.fullscreen.onEnterCallback`} function.
 * 	By default, it returns the fullscreen mode container element so it can be further customized.
 *
 * When leaving the fullscreen mode, the {@link #disable} method is called. It does the following:
 *
 * 1. Execute the configured {@link module:fullscreen/fullscreenconfig~FullscreenConfig#onLeaveCallback
 * 	`config.fullscreen.onLeaveCallback`} function.
 * 2. Remove the classes added to the `<body>` and `<html>` elements.
 * 3. If document outline is used, restore its default container.
 * 4. If annotations are used, restore their original state (UI, filters etc).
 * 5. If revision history is used, restore the original callbacks.
 * 7. If AI Tabs is used, restore it to the original state.
 * 8. If source editing and document outline are both used, restore the document outline header.
 * 9. Restore all moved elements to their original place.
 * 10. Destroy the fullscreen mode container.
 * 11. If the editor has a toolbar, switch its behavior to the one configured in the
 * 	{@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} property.
 * 12. Restore the scroll positions of all ancestors of the editable element.
 * 13. If pagination is used, restore its default configuration.
 * 14. Restore default dialogs positions.
 *
 * This class is exported to allow for custom extensions.
 */
export declare class FullscreenAbstractEditorHandler {
    /**
     * Maps placeholder names to placeholder elements and moved elements.
     */
    private _placeholderMap;
    /**
     * The wrapper element that holds the fullscreen mode layout.
     */
    private _wrapper;
    /**
     * The document object in which the editor is located.
     */
    private _document;
    /**
     * Data of the annotations UIs that were active before entering the fullscreen mode.
     */
    private _annotationsUIsData;
    /**
     * The pagination body collection that is used in the fullscreen mode.
     * If we don't move pagination lines to the fullscreen container, they won't be visible.
     */
    private _paginationBodyCollection;
    /**
     * Whether the left sidebar collapse button is created.
     */
    private _hasLeftCollapseButton;
    /**
     * The button that toggles the visibility of the left sidebar.
     */
    private _collapseLeftSidebarButton;
    /**
     * The resize observer that is used to adjust the visibility of the left and right sidebars dynamically.
     */
    private _resizeObserver;
    /**
     * The width of the expanded left and right sidebars in the fullscreen mode. Necessary for logic checking if they should be visible.
     */
    private _sidebarsWidths;
    /**
     * Whether the left sidebar should be kept hidden even if there is enough space for it. It's set to `true` when user
     * collapses the left sidebar with a button. Behavior is reset when exiting the fullscreen mode.
     */
    private _keepLeftSidebarHidden;
    /**
     * Temporary flag used to ignore the first automatic layout adjustment logic when user collapses the left sidebar with a button.
     * It is then immediately set back to `false`.
     */
    private _forceShowLeftSidebar;
    /**
     * A callback that hides the document outline header when the source editing mode is enabled.
     * Document outline element itself is hidden by source editing plugin.
     */
    private _sourceEditingCallback;
    /**
     * A map of elements that were hidden when entering the fullscreen mode.
     * It is used to restore their previous visibility when leaving the fullscreen mode and avoid showing elements
     * that were hidden before entering the fullscreen mode.
     */
    private _hiddenElements;
    /**
     * A map matching the ancestors of the editable element with their scroll positions before entering fullscreen mode.
     */
    private _savedAncestorsScrollPositions;
    /**
     * A callback that shows the revision viewer, stored to restore the original one after exiting the fullscreen mode.
     */
    protected _showRevisionViewerCallback: ((config?: EditorConfig) => Promise<any>) | null;
    /**
     * A callback that closes the revision viewer, stored to restore the original one after exiting the fullscreen mode.
     */
    protected _closeRevisionViewerCallback: ((viewerEditor?: any) => Promise<unknown>) | null;
    /**
     * An editor instance. It should be set by the particular editor type handler.
     */
    protected _editor: Editor & Partial<ElementApi>;
    /**
     * A map of AI Tabs data that were set before entering the fullscreen mode.
     */
    private _aiTabsData;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * Moves the given element to the fullscreen mode container, leaving a placeholder in its place.
     */
    moveToFullscreen(elementToMove: HTMLElement, placeholderName: string): void;
    /**
     * Returns a single moved element to its original place.
     */
    restoreMovedElementLocation(placeholderName: string): void;
    /**
     * Returns the fullscreen mode container element.
     */
    getWrapper(): HTMLElement;
    /**
     * Enables the fullscreen mode. It executes the editor-specific enable handler and then the configured callback.
     */
    enable(): void;
    /**
     * Disables the fullscreen mode by restoring all moved elements and destroying the fullscreen container.
     */
    disable(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * A function that moves the editor UI elements to the fullscreen mode. It should be set by the particular editor type handler.
     *
     * Returns the fullscreen mode container element so it can be further customized via
     * `fullscreen.onEnterCallback` configuration property.
     */
    defaultOnEnter(): HTMLElement;
    /**
     * Destroys the fullscreen mode container.
     */
    private _destroyContainer;
    /**
     * Checks if the PresenceListUI plugin is available and moves its elements to fullscreen mode.
     */
    private _generatePresenceListContainer;
    /**
     * Checks if the DocumentOutlineUI plugin is available and moves its elements to fullscreen mode.
     */
    private _generateDocumentOutlineContainer;
    /**
     * Restores the default value of documentOutlineContainer, which is modified in fullscreen mode.
     */
    private _restoreDocumentOutlineDefaultContainer;
    private _generateCollapseButton;
    /**
     * Stores the current state of the annotations UIs to restore it when leaving fullscreen mode and switches the UI to the wide sidebar.
     */
    private _overrideAnnotationsUIs;
    /**
     * Restores the saved state of the annotations UIs.
     */
    private _restoreAnnotationsUIs;
    /**
     * Modifies the revision history viewer callbacks to display the viewer in the fullscreen mode.
     */
    private _overrideRevisionHistoryCallbacks;
    /**
     * Resets the revision history viewer callbacks to their original values.
     */
    private _restoreRevisionHistoryCallbacks;
    /**
     * Adds an event listener when the dialog opens to adjust its position in fullscreen mode,
     * utilizing the empty space on the right side of the editable element.
     */
    private _registerFullscreenDialogPositionAdjustments;
    /**
     * Removes an event listener that adjusts the dialog's position in fullscreen mode.
     */
    private _unregisterFullscreenDialogPositionAdjustments;
    /**
     * Stores a bound reference to the _updateDialogPosition method, allowing it to be attached and detached from change event.
     */
    updateDialogPositionCallback: (_evt: EventInfo, _name: string, isOpen: boolean) => void;
    /**
     * If dialog is open, adjust its positioning.
     */
    private _updateDialogPosition;
    /**
     * Adjusts the dialog position to utilize the empty space on the right side of the editable.
     * The new dialog position should be on the right side of the fullscreen view with a 30px margin.
     * Only dialogs with the position set to "editor-top-side" should have their position changed.
     */
    private _setNewDialogPosition;
    /**
     * Saves the scroll positions of all ancestors of the given element.
     */
    private _saveAncestorsScrollPositions;
    /**
     * Stores the current state of the AI Tabs and moves it to the fullscreen mode.
     */
    private _handleAITabsTransfer;
    /**
     * Checks the transition event to see if it's changing the width of the AI tabs and if so, adjusts the visible fullscreen mode elements.
     */
    private _handleAISidebarTransitions;
    /**
     * Restores the state of the AI Tabs to the original values.
     */
    private _restoreAITabs;
    /**
     * Adjusts the visibility of the left and right sidebars based on the available space.
     */
    private _adjustVisibleElements;
    /**
     * Switches the annotations UI to the requested one.
     */
    private _switchAnnotationsUI;
    /**
     * Sets up a resize observer to adjust the visibility of the left and right sidebars dynamically.
     */
    private _setupResizeObserver;
    /**
     * Hides the left sidebar. Works only if there is anything to hide.
     */
    private _hideLeftSidebar;
    /**
     * Shows the left sidebar. Works only if there is anything to show.
     */
    private _showLeftSidebar;
    /**
     * Hides the right sidebar. Works only if there is anything to hide.
     */
    private _hideRightSidebar;
    /**
     * Shows the right sidebar. Works only if there is anything to show.
     */
    private _showRightSidebar;
}

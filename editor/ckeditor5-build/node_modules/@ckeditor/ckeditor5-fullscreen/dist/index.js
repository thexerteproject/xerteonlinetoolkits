/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { global, createElement, Rect, ResizeObserver, env } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { BodyCollection, ButtonView, DialogViewPosition, MenuBarView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconPreviousArrow, IconDocumentOutlineToggle } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { IconFullscreenLeave, IconFullscreenEnter } from '@ckeditor/ckeditor5-icons/dist/index.js';

const DIALOG_OFFSET = 28;
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
 */ class FullscreenAbstractEditorHandler {
    /**
	 * Maps placeholder names to placeholder elements and moved elements.
	 */ _placeholderMap;
    /**
	 * The wrapper element that holds the fullscreen mode layout.
	 */ _wrapper = null;
    /**
	 * The document object in which the editor is located.
	 */ _document;
    /**
	 * Data of the annotations UIs that were active before entering the fullscreen mode.
	 */ _annotationsUIsData = null;
    /**
	 * The pagination body collection that is used in the fullscreen mode.
	 * If we don't move pagination lines to the fullscreen container, they won't be visible.
	 */ _paginationBodyCollection = null;
    /**
	 * Whether the left sidebar collapse button is created.
	 */ _hasLeftCollapseButton = false;
    /**
	 * The button that toggles the visibility of the left sidebar.
	 */ _collapseLeftSidebarButton = null;
    /**
	 * The resize observer that is used to adjust the visibility of the left and right sidebars dynamically.
	 */ _resizeObserver = null;
    /**
	 * The width of the expanded left and right sidebars in the fullscreen mode. Necessary for logic checking if they should be visible.
	 */ _sidebarsWidths = {
        left: 0,
        right: 0
    };
    /**
	 * Whether the left sidebar should be kept hidden even if there is enough space for it. It's set to `true` when user
	 * collapses the left sidebar with a button. Behavior is reset when exiting the fullscreen mode.
	 */ _keepLeftSidebarHidden = false;
    /**
	 * Temporary flag used to ignore the first automatic layout adjustment logic when user collapses the left sidebar with a button.
	 * It is then immediately set back to `false`.
	 */ _forceShowLeftSidebar = false;
    /**
	 * A callback that hides the document outline header when the source editing mode is enabled.
	 * Document outline element itself is hidden by source editing plugin.
	 */ /* istanbul ignore next -- @preserve */ _sourceEditingCallback = (_evt, _name, value)=>{
        this.getWrapper().querySelector('.ck-fullscreen__document-outline-header').style.display = value ? 'none' : '';
    };
    /**
	 * A map of elements that were hidden when entering the fullscreen mode.
	 * It is used to restore their previous visibility when leaving the fullscreen mode and avoid showing elements
	 * that were hidden before entering the fullscreen mode.
	 */ _hiddenElements = new Map();
    /**
	 * A map matching the ancestors of the editable element with their scroll positions before entering fullscreen mode.
	 */ _savedAncestorsScrollPositions = new Map();
    /**
	 * A callback that shows the revision viewer, stored to restore the original one after exiting the fullscreen mode.
	 */ _showRevisionViewerCallback = null;
    /**
	 * A callback that closes the revision viewer, stored to restore the original one after exiting the fullscreen mode.
	 */ _closeRevisionViewerCallback = null;
    /**
	 * A map of AI Tabs data that were set before entering the fullscreen mode.
	 */ _aiTabsData = null;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        this._placeholderMap = new Map();
        if (editor.plugins.has('RevisionHistory')) {
            this._showRevisionViewerCallback = editor.config.get('revisionHistory').showRevisionViewerCallback;
            this._closeRevisionViewerCallback = editor.config.get('revisionHistory').closeRevisionViewerCallback;
        }
        this._editor = editor;
        this._document = this._editor.sourceElement ? this._editor.sourceElement.ownerDocument : global.document;
        this._editor.config.define('fullscreen.container', this._document.body);
        editor.on('destroy', ()=>{
            if (this._wrapper) {
                this.destroy();
            }
            if (this._resizeObserver) {
                this._resizeObserver.destroy();
            }
        });
    }
    /**
	 * Moves the given element to the fullscreen mode container, leaving a placeholder in its place.
	 */ moveToFullscreen(elementToMove, placeholderName) {
        const placeholderElement = createElement(this._document, 'div');
        placeholderElement.setAttribute('data-ck-fullscreen-placeholder', placeholderName);
        elementToMove.replaceWith(placeholderElement);
        this.getWrapper().querySelector(`[data-ck-fullscreen="${placeholderName}"]`).append(elementToMove);
        this._placeholderMap.set(placeholderName, {
            placeholderElement,
            movedElement: elementToMove
        });
    }
    /**
	 * Returns a single moved element to its original place.
	 */ restoreMovedElementLocation(placeholderName) {
        if (!this._placeholderMap.has(placeholderName)) {
            return;
        }
        const { placeholderElement, movedElement } = this._placeholderMap.get(placeholderName);
        placeholderElement.replaceWith(movedElement);
        placeholderElement.remove();
        this._placeholderMap.delete(placeholderName);
        if (this._placeholderMap.size === 0) {
            this._destroyContainer();
        }
    }
    /**
	 * Returns the fullscreen mode container element.
	 */ getWrapper() {
        if (!this._wrapper) {
            this._wrapper = createElement(this._document, 'div', {
                class: 'ck ck-fullscreen__main-wrapper'
            });
            // For now, the container is generated in a very straightforward way. If necessary, it may be rewritten using editor's UI lib.
            this._wrapper.innerHTML = `
				<div class="ck ck-fullscreen__top-wrapper ck-reset_all">
					<div class="ck ck-fullscreen__menu-bar" data-ck-fullscreen="menu-bar"></div>
					<div class="ck ck-fullscreen__toolbar" data-ck-fullscreen="toolbar"></div>
				</div>
				<div class="ck ck-fullscreen__editable-wrapper">
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar"></div>
					<div class="ck ck-fullscreen__editable" data-ck-fullscreen="editable">
						<div class="ck ck-fullscreen__pagination-view" data-ck-fullscreen="pagination-view"></div>
					</div>
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__right-sidebar" data-ck-fullscreen="right-sidebar"></div>
					<div class="ck ck-fullscreen__right-edge" data-ck-fullscreen="right-edge"></div>
				</div>
				<div class="ck ck-fullscreen__bottom-wrapper">
					<div class="ck ck-fullscreen__body-wrapper" data-ck-fullscreen="body-wrapper"></div>
				</div>
			`;
            this._editor.config.get('fullscreen.container').appendChild(this._wrapper);
        }
        return this._wrapper;
    }
    /**
	 * Enables the fullscreen mode. It executes the editor-specific enable handler and then the configured callback.
	 */ enable() {
        this._saveAncestorsScrollPositions(this._editor.ui.getEditableElement());
        this.defaultOnEnter();
        // Block scroll if the fullscreen container is the body element. Otherwise the document has to stay scrollable.
        if (this._editor.config.get('fullscreen.container') === this._document.body) {
            this._document.body.classList.add('ck-fullscreen');
            this._document.body.parentElement.classList.add('ck-fullscreen');
        }
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore if -- @preserve */ if (this._editor.plugins.has('PresenceListUI')) {
            this._generatePresenceListContainer();
        }
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore if -- @preserve */ if (this._editor.plugins.has('DocumentOutlineUI')) {
            this._generateDocumentOutlineContainer();
        }
        if (this._hasLeftCollapseButton) {
            this._generateCollapseButton();
        }
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore next -- @preserve */ if (this._editor.plugins.has('Pagination') && this._editor.plugins.get('Pagination').isEnabled) {
            const paginationRenderer = this._editor.plugins.get('PaginationRenderer');
            paginationRenderer.setupScrollableAncestor();
            this._paginationBodyCollection = new BodyCollection(this._editor.locale);
            this._paginationBodyCollection.attachToDom();
            paginationRenderer.linesRepository.setViewCollection(this._paginationBodyCollection);
            this._editor.once('destroy', ()=>{
                this._paginationBodyCollection.detachFromDom();
            });
            this.moveToFullscreen(this._paginationBodyCollection.bodyCollectionContainer, 'body-wrapper');
        }
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore if -- @preserve */ if (this._editor.plugins.has('AnnotationsUIs')) {
            this._overrideAnnotationsUIs();
        }
        if (this._editor.plugins.has('RevisionHistory')) {
            // Code coverage is provided in the commercial package repository as integration unit tests.
            /* istanbul ignore if -- @preserve */ if (this._editor.plugins.get('RevisionHistory').isRevisionViewerOpen) {
                // Keep in mind that closing the revision history viewer is an asynchronous operation.
                this._editor.config.get('revisionHistory.closeRevisionViewerCallback')();
            }
            this._overrideRevisionHistoryCallbacks();
        }
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore if -- @preserve */ if (this._editor.plugins.has('AITabs')) {
            this._handleAITabsTransfer();
        }
        if (this._editor.plugins.has('SourceEditing') && this._editor.plugins.has('DocumentOutlineUI')) {
            // Register a callback to hide the document outline header in source editing mode.
            this._editor.plugins.get('SourceEditing').on('change:isSourceEditingMode', this._sourceEditingCallback);
        }
        // Dialog position should be done after all known elements are moved to the fullscreen container.
        if (this._editor.plugins.has('Dialog')) {
            this._registerFullscreenDialogPositionAdjustments();
        }
        // Hide all other elements in the container to ensure they don't create an empty unscrollable space.
        for (const element of this._editor.config.get('fullscreen.container').children){
            // Do not hide body wrapper and ckbox wrapper to keep dialogs, balloons etc visible.
            if (element !== this._wrapper && !element.classList.contains('ck-body-wrapper') && !element.classList.contains('ckbox-wrapper') && // Already hidden elements are not hidden again to avoid accidentally showing them after leaving fullscreen.
            element.style.display !== 'none') {
                this._hiddenElements.set(element, element.style.display);
                element.style.display = 'none';
            }
        }
        // Save the information about the width of the left and right sidebars before they possibly get hidden.
        // It will be used for math checking if they should be visible or not dynamically.
        this._sidebarsWidths = {
            left: this._wrapper.querySelector('.ck-fullscreen__left-sidebar').scrollWidth,
            right: this._wrapper.querySelector('.ck-fullscreen__right-sidebar').scrollWidth
        };
        this._adjustVisibleElements();
        this._setupResizeObserver();
        if (this._editor.config.get('fullscreen.onEnterCallback')) {
            this._editor.config.get('fullscreen.onEnterCallback')(this.getWrapper());
        }
    }
    /**
	 * Disables the fullscreen mode by restoring all moved elements and destroying the fullscreen container.
	 */ disable() {
        if (this._editor.config.get('fullscreen.onLeaveCallback')) {
            this._editor.config.get('fullscreen.onLeaveCallback')(this.getWrapper());
        }
        this._document.body.classList.remove('ck-fullscreen');
        this._document.body.parentElement.classList.remove('ck-fullscreen');
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore if -- @preserve */ if (this._editor.plugins.has('DocumentOutlineUI')) {
            this._restoreDocumentOutlineDefaultContainer();
        }
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore if -- @preserve */ if (this._annotationsUIsData) {
            this._restoreAnnotationsUIs();
        }
        if (this._editor.plugins.has('RevisionHistory')) {
            this._restoreRevisionHistoryCallbacks();
        }
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore if -- @preserve */ if (this._editor.plugins.has('AITabs')) {
            this._restoreAITabs();
        }
        if (this._editor.plugins.has('SourceEditing') && this._editor.plugins.has('DocumentOutlineUI')) {
            this._editor.plugins.get('SourceEditing').off('change:isSourceEditingMode', this._sourceEditingCallback);
        }
        for (const placeholderName of this._placeholderMap.keys()){
            this.restoreMovedElementLocation(placeholderName);
        }
        // Container is also destroyed in the `restoreMovedElementLocation()` method, but we need to do it here
        // to ensure that the container is destroyed even if no elements were moved.
        this._destroyContainer();
        if (this._editor.ui.view.toolbar) {
            this._editor.ui.view.toolbar.switchBehavior(this._editor.config.get('toolbar.shouldNotGroupWhenFull') === true ? 'static' : 'dynamic');
        }
        // Restore scroll positions of all ancestors. It may include the closest editable wrapper causing the editor to change
        // the visible content, which is not what we want. Thus, after executing the command, we use
        // `editor.editing.view.scrollToTheSelection()` to scroll the editor viewport to the current selection.
        // Using `behavior: 'instant'` is necessary to force scroll if some of the containers has `scroll-behavior: smooth` set (otherwise
        // the scroll won't happen).
        for (const [ancestor, value] of this._savedAncestorsScrollPositions){
            // `ScrollBehavior` has incorrect type definition in currently used TS version (5.0.4). Fix should be present since 5.1.0:
            // https://github.com/Microsoft/TypeScript/issues/28755. Hence we need a type assertion here.
            ancestor.scrollTo({
                left: value.scrollLeft,
                top: value.scrollTop,
                behavior: 'instant'
            });
        }
        this._savedAncestorsScrollPositions.clear();
        // Pagination has to be restored after leaving fullscreen mode to ensure proper rendering.
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore next -- @preserve */ if (this._editor.plugins.has('Pagination') && this._editor.plugins.get('Pagination').isEnabled) {
            const paginationRenderer = this._editor.plugins.get('PaginationRenderer');
            paginationRenderer.setupScrollableAncestor();
            paginationRenderer.linesRepository.setViewCollection(this._editor.ui.view.body);
            this._paginationBodyCollection.detachFromDom();
            this._paginationBodyCollection?.destroy();
        }
        // Also dialog position needs to be recalculated after leaving fullscreen mode.
        if (this._editor.plugins.has('Dialog')) {
            this._unregisterFullscreenDialogPositionAdjustments();
        }
        // Reset the behavior of the left sidebar.
        this._keepLeftSidebarHidden = false;
        this._resizeObserver?.destroy();
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        for (const { placeholderElement, movedElement } of this._placeholderMap.values()){
            placeholderElement.remove();
            movedElement.remove();
        }
        this._destroyContainer();
        this._document.body.classList.remove('ck-fullscreen');
        this._document.body.parentElement.classList.remove('ck-fullscreen');
    }
    /**
	 * A function that moves the editor UI elements to the fullscreen mode. It should be set by the particular editor type handler.
	 *
	 * Returns the fullscreen mode container element so it can be further customized via
	 * `fullscreen.onEnterCallback` configuration property.
	 */ defaultOnEnter() {
        return this.getWrapper();
    }
    /**
	 * Destroys the fullscreen mode container.
	 */ _destroyContainer() {
        if (!this._wrapper) {
            return;
        }
        this._wrapper.remove();
        this._wrapper = null;
        // Restore visibility of all other elements in the container.
        for (const [element, displayValue] of this._hiddenElements){
            element.style.display = displayValue;
        }
        this._hiddenElements.clear();
    }
    /**
	 * Checks if the PresenceListUI plugin is available and moves its elements to fullscreen mode.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _generatePresenceListContainer() {
        const t = this._editor.t;
        const presenceListElement = createElement(document, 'div', {
            class: 'ck ck-fullscreen__left-sidebar-item'
        });
        presenceListElement.innerHTML = `
			<div class="ck ck-fullscreen__left-sidebar-header"></div>
			<div class="ck ck-fullscreen__presence-list" data-ck-fullscreen="presence-list"></div>
		`;
        presenceListElement.firstElementChild.innerText = t('Connected users');
        if (!document.querySelector('[data-ck-fullscreen="left-sidebar-sticky"]')) {
            document.querySelector('[data-ck-fullscreen="left-sidebar"]').appendChild(createElement(document, 'div', {
                class: 'ck ck-fullscreen__left-sidebar-sticky',
                'data-ck-fullscreen': 'left-sidebar-sticky'
            }));
        }
        document.querySelector('[data-ck-fullscreen="left-sidebar-sticky"]').appendChild(presenceListElement);
        const presenceListUI = this._editor.plugins.get('PresenceListUI');
        this.moveToFullscreen(presenceListUI.view.element, 'presence-list');
        this._hasLeftCollapseButton = true;
    }
    /**
	 * Checks if the DocumentOutlineUI plugin is available and moves its elements to fullscreen mode.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _generateDocumentOutlineContainer() {
        const t = this._editor.t;
        const documentOutlineHeaderElement = createElement(document, 'div', {
            class: 'ck-fullscreen__left-sidebar-item ck-fullscreen__left-sidebar-item--no-margin'
        });
        documentOutlineHeaderElement.innerHTML = `
			<div class="ck ck-fullscreen__left-sidebar-header ck-fullscreen__document-outline-header"></div>
		`;
        documentOutlineHeaderElement.firstElementChild.innerText = t('Document outline');
        const documentOutlineBodyWrapper = createElement(document, 'div', {
            class: 'ck ck-fullscreen__left-sidebar-item ck-fullscreen__document-outline-wrapper'
        });
        documentOutlineBodyWrapper.innerHTML = `
			<div class="ck ck-fullscreen__document-outline" data-ck-fullscreen="document-outline"></div>
		`;
        if (!document.querySelector('[data-ck-fullscreen="left-sidebar-sticky"]')) {
            document.querySelector('[data-ck-fullscreen="left-sidebar"]').appendChild(createElement(document, 'div', {
                class: 'ck ck-fullscreen__left-sidebar-sticky',
                'data-ck-fullscreen': 'left-sidebar-sticky'
            }));
        }
        document.querySelector('[data-ck-fullscreen="left-sidebar"]').appendChild(documentOutlineBodyWrapper);
        document.querySelector('[data-ck-fullscreen="left-sidebar-sticky"]').appendChild(documentOutlineHeaderElement);
        const documentOutlineUI = this._editor.plugins.get('DocumentOutlineUI');
        documentOutlineUI.view.documentOutlineContainer = document.querySelector('[data-ck-fullscreen="left-sidebar"]');
        this.moveToFullscreen(documentOutlineUI.view.element, 'document-outline');
        this._hasLeftCollapseButton = true;
    }
    /**
	 * Restores the default value of documentOutlineContainer, which is modified in fullscreen mode.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _restoreDocumentOutlineDefaultContainer() {
        const documentOutlineUI = this._editor.plugins.get('DocumentOutlineUI');
        documentOutlineUI.view.documentOutlineContainer = documentOutlineUI.view.element;
    }
    // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _generateCollapseButton() {
        const button = new ButtonView(this._editor.locale);
        const leftSidebarContainer = document.querySelector('.ck-fullscreen__left-sidebar');
        const t = this._editor.t;
        button.set({
            label: t('Toggle sidebar'),
            class: 'ck-fullscreen__left-sidebar-toggle-button',
            tooltip: t('Hide left sidebar'),
            tooltipPosition: 'se',
            icon: IconPreviousArrow
        });
        button.on('execute', ()=>{
            // Change the look of the button to reflect the state of the left sidebar.
            if (leftSidebarContainer.classList.contains('ck-fullscreen__left-sidebar--collapsed')) {
                // Enable automatic left sidebar toggling.
                this._forceShowLeftSidebar = true;
                this._keepLeftSidebarHidden = false;
                this._showLeftSidebar();
            } else {
                // Disable automatic left sidebar toggling.
                this._keepLeftSidebarHidden = true;
                this._hideLeftSidebar();
            }
            // Keep the focus in the editor whenever the button is clicked.
            this._editor.editing.view.focus();
        });
        button.render();
        this._collapseLeftSidebarButton = button;
        // Append the button at the top of the left sidebar.
        leftSidebarContainer.prepend(button.element);
    }
    /**
	 * Stores the current state of the annotations UIs to restore it when leaving fullscreen mode and switches the UI to the wide sidebar.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _overrideAnnotationsUIs() {
        const annotationsUIs = this._editor.plugins.get('AnnotationsUIs');
        this._annotationsUIsData = new Map(annotationsUIs.uisData);
        annotationsUIs.deactivateAll();
        const sidebarPlugin = this._editor.plugins.get('Sidebar');
        // There are two scenarios to consider: if wide sidebar is already used and when it's not.
        // If sidebar container is not set (e.g. in case of inline annotations), we need to:
        // 1. Set the sidebar container in the sidebar plugin.
        // 2. Activate the wide sidebar UI.
        // 3. Move the sidebar element to the fullscreen mode.
        if (!sidebarPlugin.container) {
            sidebarPlugin.setContainer(this.getWrapper().querySelector('[data-ck-fullscreen="right-sidebar"]'));
            this._switchAnnotationsUI('wideSidebar');
            this.moveToFullscreen(sidebarPlugin.container.firstElementChild, 'right-sidebar');
        } else {
            this._switchAnnotationsUI('wideSidebar');
            this.moveToFullscreen(sidebarPlugin.container.firstElementChild, 'right-sidebar');
            sidebarPlugin.setContainer(this.getWrapper().querySelector('[data-ck-fullscreen="right-sidebar"]'));
        }
    }
    /**
	 * Restores the saved state of the annotations UIs.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _restoreAnnotationsUIs() {
        const sidebarPlugin = this._editor.plugins.get('Sidebar');
        const sidebarContainer = sidebarPlugin.context.config.get('sidebar.container');
        // If sidebar container was set initially, restore it to the original value from config.
        if (sidebarContainer) {
            sidebarPlugin.setContainer(sidebarContainer);
        }
        const annotationsUIs = this._editor.plugins.get('AnnotationsUIs');
        annotationsUIs.deactivateAll();
        for (const [uiName, data] of [
            ...this._annotationsUIsData
        ]){
            annotationsUIs.activate(uiName, data.filter);
        }
        this._annotationsUIsData = null;
    }
    /**
	 * Modifies the revision history viewer callbacks to display the viewer in the fullscreen mode.
	 */ _overrideRevisionHistoryCallbacks() {
        // * Hide editor's editable, toolbar and sidebar;
        // * Disable menu bar;
        // * Show revision viewer editable, toolbar and sidebar.
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore next -- @preserve */ this._editor.config.set('revisionHistory.showRevisionViewerCallback', async ()=>{
            const revisionViewerEditor = await this._showRevisionViewerCallback();
            if (this._editor.plugins.has('DocumentOutlineUI')) {
                this.getWrapper().querySelector('.ck-fullscreen__document-outline-header').style.display = 'none';
            }
            this.restoreMovedElementLocation('editable');
            this.restoreMovedElementLocation('toolbar');
            this.restoreMovedElementLocation('right-sidebar');
            if (this._annotationsUIsData) {
                this._restoreAnnotationsUIs();
            }
            if (this._editor.ui.view.menuBarView) {
                this._editor.ui.view.menuBarView.disable();
            }
            this.moveToFullscreen(revisionViewerEditor.ui.getEditableElement(), 'editable');
            this.moveToFullscreen(revisionViewerEditor.ui.view.toolbar.element, 'toolbar');
            this.moveToFullscreen(this._editor.config.get('revisionHistory.viewerSidebarContainer'), 'right-sidebar');
            return revisionViewerEditor;
        });
        // * Hide revision viewer editable, toolbar and sidebar;
        // * Enable menu bar;
        // * Show editor's editable, toolbar and sidebar.
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore next -- @preserve */ this._editor.config.set('revisionHistory.closeRevisionViewerCallback', async ()=>{
            this.restoreMovedElementLocation('toolbar');
            this.restoreMovedElementLocation('editable');
            this.restoreMovedElementLocation('right-sidebar');
            if (this._editor.plugins.has('DocumentOutlineUI')) {
                this.getWrapper().querySelector('.ck-fullscreen__document-outline-header').style.display = '';
            }
            this.moveToFullscreen(this._editor.ui.getEditableElement(), 'editable');
            this.moveToFullscreen(this._editor.ui.view.toolbar.element, 'toolbar');
            await this._closeRevisionViewerCallback();
            if (this._editor.plugins.has('AnnotationsUIs')) {
                this._overrideAnnotationsUIs();
            }
            if (this._editor.ui.view.menuBarView) {
                this._editor.ui.view.menuBarView.enable();
            }
        });
    }
    /**
	 * Resets the revision history viewer callbacks to their original values.
	 */ _restoreRevisionHistoryCallbacks() {
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore next -- @preserve */ this._editor.config.set('revisionHistory.showRevisionViewerCallback', async ()=>{
            return this._showRevisionViewerCallback();
        });
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore next -- @preserve */ this._editor.config.set('revisionHistory.closeRevisionViewerCallback', async ()=>{
            return this._closeRevisionViewerCallback();
        });
    }
    /**
	 * Adds an event listener when the dialog opens to adjust its position in fullscreen mode,
	 * utilizing the empty space on the right side of the editable element.
	 */ _registerFullscreenDialogPositionAdjustments() {
        const dialog = this._editor.plugins.get('Dialog');
        this._setNewDialogPosition();
        dialog.on('change:isOpen', this.updateDialogPositionCallback, {
            priority: 'highest'
        });
    }
    /**
	 * Removes an event listener that adjusts the dialog's position in fullscreen mode.
	 */ _unregisterFullscreenDialogPositionAdjustments() {
        const dialog = this._editor.plugins.get('Dialog');
        const dialogView = dialog.view;
        if (dialogView && dialogView.position === null) {
            dialogView.position = DialogViewPosition.EDITOR_TOP_SIDE;
        }
        if (dialogView) {
            dialogView.updatePosition();
        }
        dialog.off('change:isOpen', this.updateDialogPositionCallback);
    }
    /**
	 * Stores a bound reference to the _updateDialogPosition method, allowing it to be attached and detached from change event.
	 */ updateDialogPositionCallback = this._updateDialogPosition.bind(this);
    /**
	 * If dialog is open, adjust its positioning.
	 */ _updateDialogPosition(_evt, _name, isOpen) {
        if (isOpen) {
            this._setNewDialogPosition();
        }
    }
    /**
	 * Adjusts the dialog position to utilize the empty space on the right side of the editable.
	 * The new dialog position should be on the right side of the fullscreen view with a 30px margin.
	 * Only dialogs with the position set to "editor-top-side" should have their position changed.
	 */ _setNewDialogPosition() {
        const dialog = this._editor.plugins.get('Dialog');
        const dialogView = dialog.view;
        if (!dialogView || dialogView.position !== DialogViewPosition.EDITOR_TOP_SIDE) {
            return;
        }
        // It's possible that the right edge container is used but not visible. We then fallback to the wrapper.
        const keepRightEdgeContainerVisible = new Rect(this._wrapper.querySelector('.ck-fullscreen__right-edge')).getVisible();
        const relativeContainer = keepRightEdgeContainerVisible ? this._wrapper.querySelector('.ck-fullscreen__right-edge') : this._wrapper;
        const relativeContainerRect = new Rect(relativeContainer).getVisible();
        const editorContainerRect = new Rect(document.querySelector('.ck-fullscreen__editable')).getVisible();
        const dialogRect = new Rect(dialogView.element.querySelector('.ck-dialog')).getVisible();
        const scrollOffset = new Rect(document.querySelector('.ck-fullscreen__editable-wrapper')).excludeScrollbarsAndBorders().getVisible().width - new Rect(document.querySelector('.ck-fullscreen__editable-wrapper')).getVisible().width;
        if (relativeContainerRect && editorContainerRect && dialogRect) {
            dialogView.position = null;
            const leftOffset = keepRightEdgeContainerVisible ? relativeContainerRect.left - dialogRect.width - DIALOG_OFFSET : relativeContainerRect.left + relativeContainerRect.width - dialogRect.width - DIALOG_OFFSET + scrollOffset;
            dialogView.moveTo(leftOffset, editorContainerRect.top);
        }
    }
    /**
	 * Saves the scroll positions of all ancestors of the given element.
	 */ _saveAncestorsScrollPositions(domElement) {
        let element = domElement.parentElement;
        if (!element) {
            return;
        }
        while(element){
            const overflowY = element.style.overflowY || global.window.getComputedStyle(element).overflowY;
            const overflowX = element.style.overflowX || global.window.getComputedStyle(element).overflowX;
            // Out of 5 possible keyword values: visible, hidden, clip, scroll and auto - only the last two allow for scrolling.
            if (overflowY === 'auto' || overflowY === 'scroll' || overflowX === 'auto' || overflowX === 'scroll') {
                this._savedAncestorsScrollPositions.set(element, {
                    scrollLeft: element.scrollLeft,
                    scrollTop: element.scrollTop
                });
            } else if (element.tagName === 'HTML') {
                this._savedAncestorsScrollPositions.set(element, {
                    scrollLeft: element.scrollLeft,
                    scrollTop: element.scrollTop
                });
            }
            element = element.parentElement;
        }
    }
    /**
	 * Stores the current state of the AI Tabs and moves it to the fullscreen mode.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _handleAITabsTransfer() {
        const aiTabs = this._editor.plugins.get('AITabs');
        this._aiTabsData = {
            side: aiTabs.side,
            type: aiTabs.type
        };
        this.moveToFullscreen(aiTabs.view.element, 'right-edge');
        aiTabs.side = 'right';
        aiTabs.type = 'sidebar';
        // Adjust the visible elements when the transition (changing the size of the AI tabs) ends. Earlier we do not have the
        // correct sizes of elements.
        aiTabs.view.element.addEventListener('transitionend', (evt)=>this._handleAISidebarTransitions(evt));
    }
    /**
	 * Checks the transition event to see if it's changing the width of the AI tabs and if so, adjusts the visible fullscreen mode elements.
	 */ _handleAISidebarTransitions(evt) {
        const aiTabs = this._editor.plugins.get('AITabs');
        // Transition may occur on any element inside the AI tabs (e.g. changing the box-shadow in review mode),
        // so we need to check the target and the property name.
        if (evt.target === aiTabs.view.element && evt.propertyName.includes('width')) {
            this._adjustVisibleElements();
        }
    }
    /**
	 * Restores the state of the AI Tabs to the original values.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _restoreAITabs() {
        const aiTabs = this._editor.plugins.get('AITabs');
        aiTabs.side = this._aiTabsData?.side;
        aiTabs.type = this._aiTabsData?.type;
        this._aiTabsData = null;
        aiTabs.view.element.removeEventListener('transitionend', this._handleAISidebarTransitions);
    }
    /**
	 * Adjusts the visibility of the left and right sidebars based on the available space.
	 */ _adjustVisibleElements() {
        const editableWrapper = this._wrapper.querySelector('.ck-fullscreen__editable-wrapper');
        // If user has explicitly opened the left sidebar, don't try to hide it automatically - but only once. Any later
        // resizes will affect the sidebar visibility.
        if (this._forceShowLeftSidebar) {
            this._forceShowLeftSidebar = false;
            return;
        }
        // First of all, check if we need to collapse something or not.
        if (editableWrapper.scrollWidth > editableWrapper.clientWidth) {
            // If we do, collapse left sidebar first.
            this._hideLeftSidebar();
            // If we still need more space, collapse right sidebar.
            if (editableWrapper.scrollWidth > editableWrapper.clientWidth) {
                this._hideRightSidebar();
            }
        } else {
            // Try to expand right sidebar first. It's not enough to check if scrollWidth + rightSidebarWidth < clientWidth,
            // because the wrapper will always stretch to the full available width.
            // We need to check the sum of its children widths instead.
            let actualWidth = [
                ...editableWrapper.children
            ].reduce((acc, child)=>acc + child.scrollWidth, 0);
            // If adding right sidebar width to the factual width of the wrapper
            // would still be less than the client width, expand right sidebar.
            if (actualWidth + this._sidebarsWidths.right < editableWrapper.clientWidth) {
                this._showRightSidebar();
                actualWidth = [
                    ...editableWrapper.children
                ].reduce((acc, child)=>acc + child.scrollWidth, 0);
            }
            // Then follow the same logic for left sidebar - but only if we are controlling it
            // (i.e. user hasn't explicitly collapsed the sidebar with a button).
            if (actualWidth + this._sidebarsWidths.left < editableWrapper.clientWidth && !this._keepLeftSidebarHidden) {
                this._showLeftSidebar();
            }
        }
    }
    /**
	 * Switches the annotations UI to the requested one.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _switchAnnotationsUI(uiName) {
        const annotationsUIs = this._editor.plugins.get('AnnotationsUIs');
        annotationsUIs.deactivateAll();
        const annotationsFilters = new Map();
        for (const [uiName, data] of [
            ...this._annotationsUIsData
        ]){
            // Default filter is `() => true`. Only store filters that are different.
            if (data.filter !== annotationsUIs.defaultFilter) {
                annotationsFilters.set(uiName, data.filter);
            }
        }
        // First, check if someone has a filter defined for requested UI. If so, retrieve and apply it in fullscreen.
        if (annotationsFilters.has(uiName)) {
            annotationsUIs.activate(uiName, annotationsFilters.get(uiName));
        } else if (annotationsFilters.size) {
            annotationsUIs.activate(uiName, (annotation)=>[
                    ...annotationsFilters.values()
                ].some((filter)=>filter(annotation)));
        } else {
            annotationsUIs.switchTo(uiName);
        }
    }
    /**
	 * Sets up a resize observer to adjust the visibility of the left and right sidebars dynamically.
	 */ _setupResizeObserver() {
        const wrapper = this._wrapper.querySelector('.ck-fullscreen__editable-wrapper');
        if (this._resizeObserver) {
            this._resizeObserver.destroy();
        }
        this._resizeObserver = new ResizeObserver(wrapper, ()=>{
            this._adjustVisibleElements();
        });
    }
    /**
	 * Hides the left sidebar. Works only if there is anything to hide.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _hideLeftSidebar() {
        const t = this._editor.t;
        if (this._collapseLeftSidebarButton) {
            const leftSidebar = this._wrapper.querySelector('.ck-fullscreen__left-sidebar');
            leftSidebar.classList.add('ck-fullscreen__left-sidebar--collapsed');
            this._collapseLeftSidebarButton.icon = IconDocumentOutlineToggle;
            this._collapseLeftSidebarButton.tooltip = t('Show left sidebar');
        }
    }
    /**
	 * Shows the left sidebar. Works only if there is anything to show.
	 */ // Code coverage is provided in the commercial package repository as integration unit tests.
    /* istanbul ignore next -- @preserve */ _showLeftSidebar() {
        const t = this._editor.t;
        if (this._collapseLeftSidebarButton) {
            const leftSidebar = this._wrapper.querySelector('.ck-fullscreen__left-sidebar');
            leftSidebar.classList.remove('ck-fullscreen__left-sidebar--collapsed');
            this._collapseLeftSidebarButton.icon = IconPreviousArrow;
            this._collapseLeftSidebarButton.tooltip = t('Hide left sidebar');
        }
    }
    /**
	 * Hides the right sidebar. Works only if there is anything to hide.
	 */ _hideRightSidebar() {
        if (this._wrapper.querySelector('.ck-fullscreen__right-sidebar').firstChild) {
            this._switchAnnotationsUI('narrowSidebar');
            this._wrapper.querySelector('.ck-fullscreen__right-sidebar').classList.add('ck-fullscreen__right-sidebar--collapsed');
        }
    }
    /**
	 * Shows the right sidebar. Works only if there is anything to show.
	 */ _showRightSidebar() {
        if (this._wrapper.querySelector('.ck-fullscreen__right-sidebar').firstChild) {
            this._switchAnnotationsUI('wideSidebar');
            this._wrapper.querySelector('.ck-fullscreen__right-sidebar').classList.remove('ck-fullscreen__right-sidebar--collapsed');
        }
    }
}

/**
 * The classic editor fullscreen mode handler.
 */ class FullscreenClassicEditorHandler extends FullscreenAbstractEditorHandler {
    /**
	 * An editor instance.
	 */ _editor;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._editor = editor;
    }
    /**
	 * A function that moves the editor UI elements to the fullscreen mode.
	 */ defaultOnEnter() {
        const editorUI = this._editor.ui;
        const editorUIView = editorUI.view;
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore next -- @preserve */ if (this._editor.plugins.has('Pagination') && this._editor.plugins.get('Pagination').isEnabled) {
            this.moveToFullscreen(editorUI.getEditableElement().parentElement.querySelector('.ck-pagination-view'), 'pagination-view');
        }
        this.moveToFullscreen(editorUI.getEditableElement(), 'editable');
        this.moveToFullscreen(editorUIView.toolbar.element, 'toolbar');
        editorUIView.toolbar.switchBehavior(this._editor.config.get('fullscreen.toolbar.shouldNotGroupWhenFull') === true ? 'static' : 'dynamic');
        // In classic editor, the `dir` attribute is set on the top-level container and it affects the styling
        // in both menu bar and toolbar (adding the side padding to the elements).
        // Since we don't move the whole container but only parts, we need to reapply the attribute value manually.
        // Decupled editor doesn't have this issue because there is no top-level container,
        // so `dir` attribute is set on each component separately.
        this.getWrapper().setAttribute('dir', editorUIView.element.getAttribute('dir'));
        // The `ck-rounded-corners` class is added to the wrapper element to ensure that the corners in menu bar, toolbar etc are rounded
        // when the editor is in fullscreen mode.
        // Decupled editor doesn't have this issue because there is no top-level container,
        // so `ck-rounded-corners` class is set on each component separately.
        this.getWrapper().classList.add('ck-rounded-corners');
        if (this._editor.config.get('fullscreen.menuBar.isVisible')) {
            if (!editorUIView.menuBarView) {
                editorUIView.menuBarView = new MenuBarView(this._editor.locale);
                editorUIView.menuBarView.render();
                editorUI.initMenuBar(editorUIView.menuBarView);
            }
            this.moveToFullscreen(editorUIView.menuBarView.element, 'menu-bar');
        }
        return this.getWrapper();
    }
}

/**
 * The decoupled editor fullscreen mode handler.
 */ class FullscreenDecoupledEditorHandler extends FullscreenAbstractEditorHandler {
    /**
	 * An editor instance.
	 */ _editor;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._editor = editor;
    }
    /**
	 * A function that moves the editor UI elements to the fullscreen mode.
	 */ defaultOnEnter() {
        // Code coverage is provided in the commercial package repository as integration unit tests.
        /* istanbul ignore next -- @preserve */ if (this._editor.plugins.has('Pagination') && this._editor.plugins.get('Pagination').isEnabled) {
            this.moveToFullscreen(this._editor.ui.getEditableElement().parentElement.querySelector('.ck-pagination-view'), 'pagination-view');
        }
        this.moveToFullscreen(this._editor.ui.getEditableElement(), 'editable');
        this.moveToFullscreen(this._editor.ui.view.toolbar.element, 'toolbar');
        this._editor.ui.view.toolbar.switchBehavior(this._editor.config.get('fullscreen.toolbar.shouldNotGroupWhenFull') === true ? 'static' : 'dynamic');
        if (this._editor.config.get('fullscreen.menuBar.isVisible')) {
            this.moveToFullscreen(this._editor.ui.view.menuBarView.element, 'menu-bar');
        }
        return this.getWrapper();
    }
}

/**
 * A command toggling the fullscreen mode.
 */ class FullscreenCommand extends Command {
    /**
	 * Specialized class handling the fullscreen mode toggling for a specific editor type.
	 *
	 * If you want to add support for a new editor type (for now, only Classic and Decoupled editors are handled),
	 * create a custom handler that extends `FullscreenAbstractEditorHandler` and replace `fullscreenHandler` with it after
	 * editor initialization:
	 *
	 * ```ts
	 * // See the details of how to implement a custom handler in the `FullscreenAbstractEditorHandler` class API docs.
	 * class CustomEditorHandler extends FullscreenAbstractEditorHandler {}
	 *
	 * CustomEditorClass.create( document.querySelector( '#editor' ), {} )
	 * 	.then( ( editor ) => {
	 * 		editor.commands.get( 'toggleFullscreen' ).fullscreenHandler = new CustomEditorHandler( editor );
	 * 	} );
	 * ```
	 */ fullscreenHandler;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this.affectsData = false;
        this.isEnabled = true;
        this.value = false;
        // Choose the appropriate handler based on the editor type.
        // Currently only `ClassicEditor` and `DecoupledEditor` are supported. For other editor types, you should create a custom handler
        // that extends `FullscreenAbstractEditorHandler` and replace `fullscreenHandler` with it.
        if (isClassicEditor(editor)) {
            this.fullscreenHandler = new FullscreenClassicEditorHandler(editor);
        } else if (isDecoupledEditor(editor)) {
            this.fullscreenHandler = new FullscreenDecoupledEditorHandler(editor);
        } else {
            this.fullscreenHandler = new FullscreenAbstractEditorHandler(editor);
        }
    }
    /**
	 * Toggles the fullscreen mode.
	 */ execute() {
        if (this.value) {
            this._disableFullscreenMode();
        } else {
            this._enableFullscreenMode();
        }
    }
    /**
	 * Enables the fullscreen mode.
	 */ _enableFullscreenMode() {
        this.fullscreenHandler.enable();
        this.value = true;
    }
    /**
	 * Disables the fullscreen mode.
	 */ _disableFullscreenMode() {
        this.fullscreenHandler.disable();
        this.value = false;
    }
}
/**
 * Classic editor typeguard.
 */ function isClassicEditor(editor) {
    return editor.constructor.editorName === 'ClassicEditor';
}
/**
 * Decoupled editor typeguard.
 */ function isDecoupledEditor(editor) {
    return editor.constructor.editorName === 'DecoupledEditor';
}

/**
 * A plugin that registers the fullscreen mode command.
 */ class FullscreenEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FullscreenEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('fullscreen.menuBar.isVisible', true);
        // By default, toolbar should behave the same way in fullscreen mode as in normal mode.
        // This means that the toolbar buttons should be grouped when the toolbar is full.
        editor.config.define('fullscreen.toolbar.shouldNotGroupWhenFull', editor.config.get('toolbar.shouldNotGroupWhenFull') === true);
    }
    /**
	 * @inheritDoc
	 */ init() {
        this.editor.commands.add('toggleFullscreen', new FullscreenCommand(this.editor));
        const t = this.editor.locale.t;
        // Set the Ctrl+Shift+F keystroke.
        this.editor.keystrokes.set('Ctrl+Shift+F', (evt, cancel)=>{
            this.editor.execute('toggleFullscreen');
            // On non-Chromium browsers, the editor view and toolbar are not blurred properly after moving the editable,
            // even though the `document.activeElement` is changed. Hence we need to blur them manually.
            // Fixes https://github.com/ckeditor/ckeditor5/issues/18250 and https://github.com/ckeditor/ckeditor5/issues/18247.
            if (!env.isBlink) {
                this.editor.editing.view.document.isFocused = false;
                this.editor.ui.view.toolbar.focusTracker.focusedElement = null;
            }
            // The order of scroll and focus is not important here.
            this.editor.editing.view.scrollToTheSelection();
            this.editor.editing.view.focus();
            cancel();
        });
        // Add the information about the keystroke to the accessibility database.
        this.editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Toggle fullscreen mode'),
                    keystroke: 'CTRL+SHIFT+F'
                }
            ],
            categoryId: 'navigation'
        });
    }
}

const COMMAND_NAME = 'toggleFullscreen';
/**
 * A plugin registering the fullscreen mode buttons.
 */ class FullscreenUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FullscreenEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FullscreenUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        editor.ui.componentFactory.add('fullscreen', ()=>this._createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:fullscreen', ()=>this._createButton(MenuBarMenuListItemButtonView));
    }
    /**
	 * Creates a button that toggles the fullscreen mode.
	 */ _createButton(ButtonClass) {
        const editor = this.editor;
        const t = editor.t;
        const command = editor.commands.get(COMMAND_NAME);
        const view = new ButtonClass(editor.locale);
        view.set({
            isToggleable: true
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        view.bind('isOn').to(command, 'value');
        if (view instanceof MenuBarMenuListItemButtonView) {
            view.set({
                role: 'menuitemcheckbox',
                label: t('Fullscreen mode')
            });
        } else {
            view.bind('icon').to(command, 'value', (value)=>value ? IconFullscreenLeave : IconFullscreenEnter);
            view.bind('label').to(command, 'value', (value)=>value ? t('Leave fullscreen mode') : t('Enter fullscreen mode'));
            view.set({
                tooltip: true
            });
        }
        this.listenTo(view, 'execute', ()=>{
            editor.execute(COMMAND_NAME);
            // On non-Chromium browsers, toolbar is not blurred properly after moving the editable,
            // even though the `document.activeElement` is changed. Hence we need to blur the view manually.
            // Fixes https://github.com/ckeditor/ckeditor5/issues/18250 and https://github.com/ckeditor/ckeditor5/issues/18247.
            if (!env.isBlink) {
                this.editor.ui.view.toolbar.focusTracker.focusedElement = null;
            }
            // The order of scroll and focus is not important here.
            editor.editing.view.scrollToTheSelection();
            editor.editing.view.focus();
        });
        return view;
    }
}

/**
 * The fullscreen mode feature.
 */ class Fullscreen extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FullscreenEditing,
            FullscreenUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Fullscreen';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { Fullscreen, FullscreenAbstractEditorHandler, FullscreenClassicEditorHandler, FullscreenCommand, FullscreenDecoupledEditorHandler, FullscreenEditing, FullscreenUI };
//# sourceMappingURL=index.js.map

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/toolbar/balloon/balloontoolbar
 */
import { ContextualBalloon } from '../../panel/balloon/contextualballoon.js';
import { ToolbarView } from '../toolbarview.js';
import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import { FocusTracker } from '@ckeditor/ckeditor5-utils';
/**
 * The contextual toolbar.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export declare class BalloonToolbar extends Plugin {
    /**
     * The toolbar view displayed in the balloon.
     */
    readonly toolbarView: ToolbarView;
    /**
     * Tracks the focus of the {@link module:ui/editorui/editorui~EditorUI#getEditableElement editable element}
     * and the {@link #toolbarView}. When both are blurred then the toolbar should hide.
     */
    readonly focusTracker: FocusTracker;
    /**
     * A cached and normalized `config.balloonToolbar` object.
     */
    private _balloonConfig;
    /**
     * An instance of the resize observer that allows to respond to changes in editable's geometry
     * so the toolbar can stay within its boundaries (and group toolbar items that do not fit).
     *
     * **Note**: Used only when `shouldNotGroupWhenFull` was **not** set in the
     * {@link module:core/editor/editorconfig~EditorConfig#balloonToolbar configuration}.
     *
     * **Note:** Created in {@link #init}.
     */
    private _resizeObserver;
    /**
     * The contextual balloon plugin instance.
     */
    private readonly _balloon;
    /**
     * Fires `_selectionChangeDebounced` event using `es-toolkit#debounce`.
     *
     * This event is an internal plugin event which is fired 200 ms after model selection last change.
     * This is to makes easy test debounced action without need to use `setTimeout`.
     *
     * This function is stored as a plugin property to make possible to cancel
     * trailing debounced invocation on destroy.
     */
    private readonly _fireSelectionChangeDebounced;
    /**
     * @inheritDoc
     */
    static get pluginName(): "BalloonToolbar";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ContextualBalloon];
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Returns whether the toolbar is visible in the ContextualBalloon.
     */
    private get _isToolbarVisible();
    /**
     * Creates the toolbar view instance.
     */
    private _createToolbarView;
    /**
     * Shows the toolbar and attaches it to the selection.
     *
     * Fires {@link #event:show} event which can be stopped to prevent the toolbar from showing up.
     *
     * @param showForCollapsedSelection When set `true`, the toolbar will show despite collapsed selection in the
     * editing view.
     */
    show(showForCollapsedSelection?: boolean): void;
    /**
     * Hides the toolbar.
     */
    hide(): void;
    /**
     * Add or remove editable elements to the focus tracker. It watches added and removed roots
     * and adds or removes their editable elements to the focus tracker.
     */
    private _trackFocusableEditableElements;
    /**
     * Returns positioning options for the {@link #_balloon}. They control the way balloon is attached
     * to the selection.
     */
    private _getBalloonPositionData;
    /**
     * Updates the position of the {@link #_balloon} to make up for changes:
     *
     * * in the geometry of the selection it is attached to (e.g. the selection moved in the viewport or expanded or shrunk),
     * * or the geometry of the balloon toolbar itself (e.g. the toolbar has grouped or ungrouped some items and it is shorter or longer).
     */
    private _updatePosition;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Returns toolbar positions for the given direction of the selection.
     */
    private _getBalloonPositions;
}
/**
 * This event is fired just before the toolbar shows up. Stopping this event will prevent this.
 *
 * @eventName ~BalloonToolbar#show
 */
export type BalloonToolbarShowEvent = {
    name: 'show';
    args: [];
};

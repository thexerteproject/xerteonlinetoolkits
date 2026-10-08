/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/editorui/editorui
 */
import { ComponentFactory } from '../componentfactory.js';
import { TooltipManager } from '../tooltipmanager.js';
import { PoweredBy } from './poweredby.js';
import { EvaluationBadge } from './evaluationbadge.js';
import { AriaLiveAnnouncer } from '../arialiveannouncer.js';
import { type EditorUIView } from './editoruiview.js';
import { type ToolbarView } from '../toolbar/toolbarview.js';
import { FocusTracker } from '@ckeditor/ckeditor5-utils';
import type { Editor, ViewportOffsetConfig } from '@ckeditor/ckeditor5-core';
import type { MenuBarView, MenuBarConfigAddedGroup, MenuBarConfigAddedItem, MenuBarConfigAddedMenu } from '../menubar/menubarview.js';
declare const EditorUI_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * A class providing the minimal interface that is required to successfully bootstrap any editor UI.
 */
export declare abstract class EditorUI extends /* #__PURE__ */ EditorUI_base {
    /**
     * The editor that the UI belongs to.
     */
    readonly editor: Editor;
    /**
     * An instance of the {@link module:ui/componentfactory~ComponentFactory}, a registry used by plugins
     * to register factories of specific UI components.
     */
    readonly componentFactory: ComponentFactory;
    /**
     * Stores the information about the editor UI focus and propagates it so various plugins and components
     * are unified as a focus group.
     */
    readonly focusTracker: FocusTracker;
    /**
     * Manages the tooltips displayed on mouseover and focus across the UI.
     */
    readonly tooltipManager: TooltipManager;
    /**
     * A helper that enables the "powered by" feature in the editor and renders a link to the project's webpage.
     */
    readonly poweredBy: PoweredBy;
    /**
     * A helper that enables the "evaluation badge" feature in the editor.
     */
    readonly evaluationBadge: EvaluationBadge;
    /**
     * A helper that manages the content of an `aria-live` regions used by editor features to announce status changes
     * to screen readers.
     */
    readonly ariaLiveAnnouncer: AriaLiveAnnouncer;
    /**
     * Indicates the UI is ready. Set `true` after {@link #event:ready} event is fired.
     *
     * @readonly
     * @default false
     */
    isReady: boolean;
    abstract get view(): EditorUIView;
    /**
     * Stores viewport offsets from every direction.
     *
     * Viewport offset can be used to constrain balloons or other UI elements into an element smaller than the viewport.
     * This can be useful if there are any other absolutely positioned elements that may interfere with editor UI.
     *
     * Example `editor.ui.viewportOffset` returns:
     *
     * ```js
     * {
     * 	top: 50,
     * 	right: 50,
     * 	bottom: 50,
     * 	left: 50,
     * 	visualTop: 50
     * }
     * ```
     *
     * This property can be overriden after editor already being initialized:
     *
     * ```js
     * editor.ui.viewportOffset = {
     * 	top: 100,
     * 	right: 0,
     * 	bottom: 0,
     * 	left: 0
     * };
     * ```
     *
     * @observable
     */
    viewportOffset: ViewportOffset;
    /**
     * Stores all editable elements used by the editor instance.
     */
    private _editableElementsMap;
    /**
     * All available & focusable toolbars.
     */
    private _focusableToolbarDefinitions;
    /**
     * All additional menu bar items, groups or menus that have their default location defined.
     */
    private _extraMenuBarElements;
    /**
     * The last focused element to which focus should return on `Esc` press.
     */
    private _lastFocusedForeignElement;
    /**
     * The DOM emitter instance used for visual viewport watching.
     */
    private _domEmitter?;
    /**
     * Creates an instance of the editor UI class.
     *
     * @param editor The editor instance.
     */
    constructor(editor: Editor);
    /**
     * The main (outermost) DOM element of the editor UI.
     *
     * For example, in {@link module:editor-classic/classiceditor~ClassicEditor} it is a `<div>` which
     * wraps the editable element and the toolbar. In {@link module:editor-inline/inlineeditor~InlineEditor}
     * it is the editable element itself (as there is no other wrapper). However, in
     * {@link module:editor-decoupled/decouplededitor~DecoupledEditor} it is set to `null` because this editor does not
     * come with a single "main" HTML element (its editable element and toolbar are separate).
     *
     * This property can be understood as a shorthand for retrieving the element that a specific editor integration
     * considers to be its main DOM element.
     */
    get element(): HTMLElement | null;
    /**
     * Fires the {@link module:ui/editorui/editorui~EditorUI#event:update `update`} event.
     *
     * This method should be called when the editor UI (e.g. positions of its balloons) needs to be updated due to
     * some environmental change which CKEditor 5 is not aware of (e.g. resize of a container in which it is used).
     */
    update(): void;
    /**
     * Destroys the UI.
     */
    destroy(): void;
    /**
     * Stores the native DOM editable element used by the editor under a unique name.
     *
     * Also, registers the element in the editor to maintain the accessibility of the UI. When the user is editing text in a focusable
     * editable area, they can use the <kbd>Alt</kbd> + <kbd>F10</kbd> keystroke to navigate over editor toolbars. See {@link #addToolbar}.
     *
     * @param rootName The unique name of the editable element.
     * @param domElement The native DOM editable element.
     */
    setEditableElement(rootName: string, domElement: HTMLElement): void;
    /**
     * Removes the editable from the editor UI. Removes all handlers added by {@link #setEditableElement}.
     *
     * @param rootName The name of the editable element to remove.
     */
    removeEditableElement(rootName: string): void;
    /**
     * Returns the editable editor element with the given name or null if editable does not exist.
     *
     * @param rootName The editable name.
     */
    getEditableElement(rootName?: string): HTMLElement | undefined;
    /**
     * Returns array of names of all editor editable elements.
     */
    getEditableElementsNames(): IterableIterator<string>;
    /**
     * Adds a toolbar to the editor UI. Used primarily to maintain the accessibility of the UI.
     *
     * Focusable toolbars can be accessed (focused) by users by pressing the <kbd>Alt</kbd> + <kbd>F10</kbd> keystroke.
     * Successive keystroke presses navigate over available toolbars.
     *
     * @param toolbarView A instance of the toolbar to be registered.
     */
    addToolbar(toolbarView: ToolbarView, options?: FocusableToolbarOptions): void;
    /**
     * Registers an extra menu bar element, which could be a single item, a group of items, or a menu containing groups.
     *
     * ```ts
     * // Register a new menu bar item.
     * editor.ui.extendMenuBar( {
     *   item: 'menuBar:customFunctionButton',
     *   position: 'after:menuBar:bold'
     * } );
     *
     * // Register a new menu bar group.
     * editor.ui.extendMenuBar( {
     *   group: {
     *     groupId: 'customGroup',
     *     items: [
     *       'menuBar:customFunctionButton'
     *     ]
     *   },
     *   position: 'start:help'
     * } );
     *
     * // Register a new menu bar menu.
     * editor.ui.extendMenuBar( {
     *   menu: {
     *     menuId: 'customMenu',
     *     label: 'customMenu',
     *     groups: [
     *       {
     *         groupId: 'customGroup',
     *         items: [
     *           'menuBar:customFunctionButton'
     *         ]
     *       }
     *     ]
     *   },
     *   position: 'after:help'
     * } );
     * ```
     */
    extendMenuBar(config: MenuBarConfigAddedItem | MenuBarConfigAddedGroup | MenuBarConfigAddedMenu): void;
    /**
     * Initializes menu bar.
     */
    initMenuBar(menuBarView: MenuBarView): void;
    /**
     * Returns viewport offsets object:
     *
     * ```js
     * {
     * 	top: Number,
     * 	right: Number,
     * 	bottom: Number,
     * 	left: Number
     * }
     * ```
     *
     * Only top property is currently supported.
     */
    private _readViewportOffsetFromConfig;
    /**
     * Starts listening for <kbd>Alt</kbd> + <kbd>F10</kbd> and <kbd>Esc</kbd> keystrokes in the context of focusable
     * {@link #setEditableElement editable elements} and {@link #addToolbar toolbars}
     * to allow users navigate across the UI.
     */
    private _initFocusTracking;
    /**
     * Saves last focused element that doen not belong to editing view to restore focus on `Esc`.
     */
    private _saveLastFocusedForeignElement;
    /**
     * Returns definitions of toolbars that could potentially be focused, sorted by their importance for the user.
     *
     * Focusable toolbars candidates are either:
     * * already visible,
     * * have `beforeFocus()` set in their {@link module:ui/editorui/editorui~FocusableToolbarDefinition definition} that suggests that
     * they might show up when called. Keep in mind that determining whether a toolbar will show up (and become focusable) is impossible
     * at this stage because it depends on its implementation, that in turn depends on the editing context (selection).
     *
     * **Note**: Contextual toolbars take precedence over regular toolbars.
     */
    private _getFocusableCandidateToolbarDefinitions;
    /**
     * Returns a definition of the toolbar that is currently visible and focused (one of its children has focus).
     *
     * `null` is returned when no toolbar is currently focused.
     */
    private _getCurrentFocusedToolbarDefinition;
    /**
     * Focuses a focusable toolbar candidate using its definition.
     *
     * @param candidateToolbarDefinition A definition of the toolbar to focus.
     * @returns `true` when the toolbar candidate was focused. `false` otherwise.
     */
    private _focusFocusableCandidateToolbar;
    /**
     * Provides an integration between {@link #viewportOffset} and {@link module:utils/dom/scroll~scrollViewportToShowTarget}.
     * It allows the UI-agnostic engine method to consider user-configured viewport offsets specific for the integration.
     *
     * @param evt The `scrollToTheSelection` event info.
     * @param data The payload carried by the `scrollToTheSelection` event.
     */
    private _handleScrollToTheSelection;
    /**
     * Ensures that the focus tracker is aware of all views' DOM elements in the body collection.
     */
    private _bindBodyCollectionWithFocusTracker;
    /**
     * Set initial viewport offset and setup visualTop augmentation.
     */
    private _initViewportOffset;
    /**
     * Listen to visual viewport changes and update the viewportOffset with the visualTop property
     * according to the visible part of it (visual viewport).
     */
    private _initVisualViewportSupport;
    /**
     * Calculate the viewport top offset according to the visible part of it (visual viewport).
     */
    private _getVisualViewportTopOffset;
}
/**
 * Fired when the editor UI is ready.
 *
 * Fired before {@link module:engine/controller/datacontroller~DataController#event:ready}.
 *
 * @eventName ~EditorUI#ready
 */
export type EditorUIReadyEvent = {
    name: 'ready';
    args: [];
};
/**
 * Fired whenever the UI (all related components) should be refreshed.
 *
 * **Note:**: The event is fired after each {@link module:engine/view/document~ViewDocument#event:layoutChanged}.
 * It can also be fired manually via the {@link module:ui/editorui/editorui~EditorUI#update} method.
 *
 * @eventName ~EditorUI#update
 */
export type EditorUIUpdateEvent = {
    name: 'update';
    args: [];
};
/**
 * A definition of a focusable toolbar. Used by {@link module:ui/editorui/editorui~EditorUI#addToolbar}.
 */
export interface FocusableToolbarDefinition {
    /**
     * An instance of a focusable toolbar view.
     */
    toolbarView: ToolbarView;
    /**
     * Options of a focusable toolbar view:
     *
     * * `isContextual`: Marks the higher priority toolbar. For example when there are 2 visible toolbars,
     * it allows to distinguish which toolbar should be focused first after the `alt+f10` keystroke
     * * `beforeFocus`: A callback executed before the `ToolbarView` gains focus upon the `Alt+F10` keystroke.
     * * `afterBlur`: A callback executed after `ToolbarView` loses focus upon `Esc` keystroke but before
     * the focus goes back to the `origin`.
     */
    options: FocusableToolbarOptions;
}
export interface FocusableToolbarOptions {
    /**
     * Set `true` if the toolbar is attached to the content of the editor. Such toolbar takes
     * a precedence over other toolbars when a user pressed <kbd>Alt</kbd> + <kbd>F10</kbd>.
     */
    isContextual?: boolean;
    /**
     * Specify a callback executed before the toolbar instance DOM element gains focus
     * upon the <kbd>Alt</kbd> + <kbd>F10</kbd> keystroke.
     */
    beforeFocus?: () => void;
    /**
     * Specify a callback executed after the toolbar instance DOM element loses focus upon
     * <kbd>Esc</kbd> keystroke but before the focus goes back to the {@link ~EditorUI#setEditableElement editable element}.
     */
    afterBlur?: () => void;
}
export interface ViewportOffset extends ViewportOffsetConfig {
    /**
     * The top offset of the visual viewport.
     *
     * This value is calculated based on the visual viewport position.
     */
    visualTop?: number;
}
export {};

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/view
 */
import { ViewDocument } from './document.js';
import { ViewDowncastWriter } from './downcastwriter.js';
import { ViewDomConverter } from './domconverter.js';
import { ViewPosition, type ViewPositionOffset } from './position.js';
import { ViewRange } from './range.js';
import { ViewSelection, type ViewPlaceOrOffset, type ViewSelectable, type ViewSelectionOptions } from './selection.js';
import type { Observer, ObserverConstructor } from './observer/observer.js';
import type { StylesProcessor } from './stylesmap.js';
import { type ViewElement } from './element.js';
import type { ViewNode } from './node.js';
import { type ViewItem } from './item.js';
import { KeyObserver } from './observer/keyobserver.js';
import { FakeSelectionObserver } from './observer/fakeselectionobserver.js';
import { MutationObserver } from './observer/mutationobserver.js';
import { SelectionObserver } from './observer/selectionobserver.js';
import { FocusObserver } from './observer/focusobserver.js';
import { CompositionObserver } from './observer/compositionobserver.js';
import { InputObserver } from './observer/inputobserver.js';
import { ArrowKeysObserver } from './observer/arrowkeysobserver.js';
import { TabObserver } from './observer/tabobserver.js';
import { type IfTrue } from '@ckeditor/ckeditor5-utils';
type DomRange = globalThis.Range;
declare const EditingView_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * Editor's view controller class. Its main responsibility is DOM - View management for editing purposes, to provide
 * abstraction over the DOM structure and events and hide all browsers quirks.
 *
 * View controller renders view document to DOM whenever view structure changes. To determine when view can be rendered,
 * all changes need to be done using the {@link module:engine/view/view~EditingView#change} method, using
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter}:
 *
 * ```ts
 * view.change( writer => {
 * 	writer.insert( position, writer.createText( 'foo' ) );
 * } );
 * ```
 *
 * View controller also register {@link module:engine/view/observer/observer~Observer observers} which observes changes
 * on DOM and fire events on the {@link module:engine/view/document~ViewDocument Document}.
 * Note that the following observers are added by the class constructor and are always available:
 *
 * * {@link module:engine/view/observer/selectionobserver~SelectionObserver},
 * * {@link module:engine/view/observer/focusobserver~FocusObserver},
 * * {@link module:engine/view/observer/keyobserver~KeyObserver},
 * * {@link module:engine/view/observer/fakeselectionobserver~FakeSelectionObserver}.
 * * {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 * * {@link module:engine/view/observer/inputobserver~InputObserver}.
 * * {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}.
 * * {@link module:engine/view/observer/tabobserver~TabObserver}.
 *
 * This class also {@link module:engine/view/view~EditingView#attachDomRoot binds the DOM and the view elements}.
 *
 * If you do not need full a DOM - view management, and only want to transform a tree of view elements to a tree of DOM
 * elements you do not need this controller. You can use the {@link module:engine/view/domconverter~ViewDomConverter ViewDomConverter}
 * instead.
 */
export declare class EditingView extends /* #__PURE__ */ EditingView_base {
    /**
     * Instance of the {@link module:engine/view/document~ViewDocument} associated with this view controller.
     */
    readonly document: ViewDocument;
    /**
     * Instance of the {@link module:engine/view/domconverter~ViewDomConverter domConverter} used by
     * {@link module:engine/view/view~EditingView#_renderer renderer}
     * and {@link module:engine/view/observer/observer~Observer observers}.
     */
    readonly domConverter: ViewDomConverter;
    /**
     * Roots of the DOM tree. Map on the `HTMLElement`s with roots names as keys.
     */
    readonly domRoots: Map<string, HTMLElement>;
    /**
     * Used to prevent calling {@link #forceRender} and {@link #change} during rendering view to the DOM.
     *
     * @observable
     * @readonly
     */
    isRenderingInProgress: boolean;
    /**
     * Informs whether the DOM selection is inside any of the DOM roots managed by the view.
     *
     * @observable
     * @readonly
     */
    hasDomSelection: boolean;
    /**
     * Instance of the {@link module:engine/view/renderer~ViewRenderer renderer}.
     */
    private readonly _renderer;
    /**
     * A DOM root attributes cache. It saves the initial values of DOM root attributes before the DOM element
     * is {@link module:engine/view/view~EditingView#attachDomRoot attached} to the view so later on, when
     * the view is destroyed ({@link module:engine/view/view~EditingView#detachDomRoot}), they can be easily restored.
     * This way, the DOM element can go back to the (clean) state as if the editing view never used it.
     */
    private readonly _initialDomRootAttributes;
    /**
     * Map of registered {@link module:engine/view/observer/observer~Observer observers}.
     */
    private readonly _observers;
    /**
     * ViewDowncastWriter instance used in {@link #change change method} callbacks.
     */
    private readonly _writer;
    /**
     * Is set to `true` when {@link #change view changes} are currently in progress.
     */
    private _ongoingChange;
    /**
     * Used to prevent calling {@link #forceRender} and {@link #change} during rendering view to the DOM.
     */
    private _postFixersInProgress;
    /**
     * Internal flag to temporary disable rendering. See the usage in the {@link #_disableRendering}.
     */
    private _renderingDisabled;
    /**
     * Internal flag that disables rendering when there are no changes since the last rendering.
     * It stores information about changed selection and changed elements from attached document roots.
     */
    private _hasChangedSinceTheLastRendering;
    /**
     * @param stylesProcessor The styles processor instance.
     */
    constructor(stylesProcessor: StylesProcessor);
    /**
     * Attaches a DOM root element to the view element and enable all observers on that element.
     * Also {@link module:engine/view/renderer~ViewRenderer#markToSync mark element} to be synchronized
     * with the view what means that all child nodes will be removed and replaced with content of the view root.
     *
     * This method also will change view element name as the same as tag name of given dom root.
     * Name is always transformed to lower case.
     *
     * **Note:** Use {@link #detachDomRoot `detachDomRoot()`} to revert this action.
     *
     * @param domRoot DOM root element.
     * @param name Name of the root.
     */
    attachDomRoot(domRoot: HTMLElement, name?: string): void;
    /**
     * Detaches a DOM root element from the view element and restores its attributes to the state before
     * {@link #attachDomRoot `attachDomRoot()`}.
     *
     * @param name Name of the root to detach.
     */
    detachDomRoot(name: string): void;
    /**
     * Gets DOM root element.
     *
     * @param name  Name of the root.
     * @returns DOM root element instance.
     */
    getDomRoot(name?: string): HTMLElement | undefined;
    /**
     * Creates observer of the given type if not yet created, {@link module:engine/view/observer/observer~Observer#enable enables} it
     * and {@link module:engine/view/observer/observer~Observer#observe attaches} to all existing and future
     * {@link #domRoots DOM roots}.
     *
     * Note: Observers are recognized by their constructor (classes). A single observer will be instantiated and used only
     * when registered for the first time. This means that features and other components can register a single observer
     * multiple times without caring whether it has been already added or not.
     *
     * @param ObserverConstructor The constructor of an observer to add.
     * Should create an instance inheriting from {@link module:engine/view/observer/observer~Observer}.
     * @returns Added observer instance.
     */
    addObserver(ObserverConstructor: ObserverConstructor): Observer;
    getObserver<T extends ObserverConstructor>(ObserverConstructor: T): T extends AlwaysRegisteredViewObservers ? InstanceType<T> : InstanceType<T> | undefined;
    /**
     * Disables all added observers.
     */
    disableObservers(): void;
    /**
     * Enables all added observers.
     */
    enableObservers(): void;
    /**
     * Scrolls the page viewport and {@link #domRoots} with their ancestors to reveal the
     * caret, **if not already visible to the user**.
     *
     * **Note**: Calling this method fires the {@link module:engine/view/view~ViewScrollToTheSelectionEvent} event that
     * allows custom behaviors.
     *
     * @param options Additional configuration of the scrolling behavior.
     * @param options.viewportOffset A distance between the DOM selection and the viewport boundary to be maintained
     * while scrolling to the selection (default is 20px). Setting this value to `0` will reveal the selection precisely at
     * the viewport boundary.
     * @param options.ancestorOffset A distance between the DOM selection and scrollable DOM root ancestor(s) to be maintained
     * while scrolling to the selection (default is 20px). Setting this value to `0` will reveal the selection precisely at
     * the scrollable ancestor(s) boundary.
     * @param options.alignToTop When set `true`, the DOM selection will be aligned to the top of the viewport if not already visible
     * (see `forceScroll` to learn more).
     * @param options.forceScroll When set `true`, the DOM selection will be aligned to the top of the viewport and scrollable ancestors
     * whether it is already visible or not. This option will only work when `alignToTop` is `true`.
     */
    scrollToTheSelection<T extends boolean, U extends IfTrue<T>>({ alignToTop, forceScroll, viewportOffset, ancestorOffset }?: {
        readonly viewportOffset?: number | {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
        readonly ancestorOffset?: number;
        readonly alignToTop?: T;
        readonly forceScroll?: U;
    }): void;
    /**
     * It will focus DOM element representing {@link module:engine/view/editableelement~ViewEditableElement ViewEditableElement}
     * that is currently having selection inside.
     */
    focus(): void;
    /**
     * The `change()` method is the primary way of changing the view. You should use it to modify any node in the view tree.
     * It makes sure that after all changes are made the view is rendered to the DOM (assuming that the view will be changed
     * inside the callback). It prevents situations when the DOM is updated when the view state is not yet correct. It allows
     * to nest calls one inside another and still performs a single rendering after all those changes are made.
     * It also returns the return value of its callback.
     *
     * ```ts
     * const text = view.change( writer => {
     * 	const newText = writer.createText( 'foo' );
     * 	writer.insert( position1, newText );
     *
     * 	view.change( writer => {
     * 		writer.insert( position2, writer.createText( 'bar' ) );
     * 	} );
     *
     * 	writer.remove( range );
     *
     * 	return newText;
     * } );
     * ```
     *
     * When the outermost change block is done and rendering to the DOM is over the
     * {@link module:engine/view/view~EditingView#event:render `View#render`} event is fired.
     *
     * This method throws a `applying-view-changes-on-rendering` error when
     * the change block is used after rendering to the DOM has started.
     *
     * @param callback Callback function which may modify the view.
     * @returns Value returned by the callback.
     */
    change<TReturn>(callback: (writer: ViewDowncastWriter) => TReturn): TReturn;
    /**
     * Forces rendering {@link module:engine/view/document~ViewDocument view document} to DOM. If any view changes are
     * currently in progress, rendering will start after all {@link #change change blocks} are processed.
     *
     * Note that this method is dedicated for special cases. All view changes should be wrapped in the {@link #change}
     * block and the view will automatically check whether it needs to render DOM or not.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `applying-view-changes-on-rendering` when
     * trying to re-render when rendering to DOM has already started.
     */
    forceRender(): void;
    /**
     * Destroys this instance. Makes sure that all observers are destroyed and listeners removed.
     */
    destroy(): void;
    /**
     * Creates position at the given location. The location can be specified as:
     *
     * * a {@link module:engine/view/position~ViewPosition position},
     * * parent element and offset (offset defaults to `0`),
     * * parent element and `'end'` (sets position at the end of that element),
     * * {@link module:engine/view/item~ViewItem view item} and `'before'` or `'after'` (sets position before or after given view item).
     *
     * This method is a shortcut to other constructors such as:
     *
     * * {@link #createPositionBefore},
     * * {@link #createPositionAfter},
     *
     * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~ViewItem view item}.
     */
    createPositionAt(itemOrPosition: ViewItem | ViewPosition, offset?: ViewPositionOffset): ViewPosition;
    /**
     * Creates a new position after given view item.
     *
     * @param item View item after which the position should be located.
     */
    createPositionAfter(item: ViewItem): ViewPosition;
    /**
     * Creates a new position before given view item.
     *
     * @param item View item before which the position should be located.
     */
    createPositionBefore(item: ViewItem): ViewPosition;
    /**
     * Creates a range spanning from `start` position to `end` position.
     *
     * **Note:** This factory method creates it's own {@link module:engine/view/position~ViewPosition} instances basing on passed values.
     *
     * @param start Start position.
     * @param end End position. If not set, range will be collapsed at `start` position.
     */
    createRange(start: ViewPosition, end?: ViewPosition | null): ViewRange;
    /**
     * Creates a range that starts before given {@link module:engine/view/item~ViewItem view item} and ends after it.
     */
    createRangeOn(item: ViewItem): ViewRange;
    /**
     * Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * @param element Element which is a parent for the range.
     */
    createRangeIn(element: ViewElement): ViewRange;
    /**
     * Creates new {@link module:engine/view/selection~ViewSelection} instance.
     *
     * ```ts
     * // Creates collapsed selection at the position of given item and offset.
     * const paragraph = view.createContainerElement( 'paragraph' );
     * const selection = view.createSelection( paragraph, offset );
     *
     * // Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the
     * // first child of that element and ends after the last child of that element.
     * const selection = view.createSelection( paragraph, 'in' );
     *
     * // Creates a range on an {@link module:engine/view/item~ViewItem item} which starts before the item and ends
     * // just after the item.
     * const selection = view.createSelection( paragraph, 'on' );
     * ```
     *
     * `Selection`'s factory method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Creates backward selection.
     * const selection = view.createSelection( paragraph, 'in', { backward: true } );
     * ```
     *
     * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * represented in other way, for example by applying proper CSS class.
     *
     * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
     * (and be  properly handled by screen readers).
     *
     * ```ts
     * // Creates fake selection with label.
     * const selection = view.createSelection( element, 'in', { fake: true, label: 'foo' } );
     * ```
     *
     * See also: {@link #createSelection:SELECTABLE `createSelection( selectable, options )`}.
     *
     * @label NODE_OFFSET
     */
    createSelection(selectable: ViewNode, placeOrOffset: ViewPlaceOrOffset, options?: ViewSelectionOptions): ViewSelection;
    /**
     * Creates new {@link module:engine/view/selection~ViewSelection} instance.
     *
     * ```ts
     * // Creates empty selection without ranges.
     * const selection = view.createSelection();
     *
     * // Creates selection at the given range.
     * const range = view.createRange( start, end );
     * const selection = view.createSelection( range );
     *
     * // Creates selection at the given ranges
     * const ranges = [ view.createRange( start1, end2 ), view.createRange( star2, end2 ) ];
     * const selection = view.createSelection( ranges );
     *
     * // Creates selection from the other selection.
     * const otherSelection = view.createSelection();
     * const selection = view.createSelection( otherSelection );
     *
     * // Creates selection from the document selection.
     * const selection = view.createSelection( editor.editing.view.document.selection );
     *
     * // Creates selection at the given position.
     * const position = view.createPositionFromPath( root, path );
     * const selection = view.createSelection( position );
     * ```
     *
     * `Selection`'s factory method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
     *
     * ```ts
     * // Creates backward selection.
     * const selection = view.createSelection( range, { backward: true } );
     * ```
     *
     * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
     * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
     * represented in other way, for example by applying proper CSS class.
     *
     * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
     * (and be  properly handled by screen readers).
     *
     * ```ts
     * // Creates fake selection with label.
     * const selection = view.createSelection( range, { fake: true, label: 'foo' } );
     * ```
     *
     * See also: {@link #createSelection:NODE_OFFSET `createSelection( node, placeOrOffset, options )`}.
     *
     * @label SELECTABLE
     */
    createSelection(selectable?: Exclude<ViewSelectable, ViewNode>, options?: ViewSelectionOptions): ViewSelection;
    /**
     * Disables or enables rendering. If the flag is set to `true` then the rendering will be disabled.
     * If the flag is set to `false` and if there was some change in the meantime, then the rendering action will be performed.
     *
     * @internal
     * @param flag A flag indicates whether the rendering should be disabled.
     */
    _disableRendering(flag: boolean): void;
    /**
     * Renders all changes. In order to avoid triggering the observers (e.g. selection) all observers are disabled
     * before rendering and re-enabled after that.
     */
    private _render;
}
/**
 * Fired after a topmost {@link module:engine/view/view~EditingView#change change block} and all
 * {@link module:engine/view/document~ViewDocument#registerPostFixer post-fixers} are executed.
 *
 * Actual rendering is performed as a first listener on 'normal' priority.
 *
 * ```ts
 * view.on( 'render', () => {
 * 	// Rendering to the DOM is complete.
 * } );
 * ```
 *
 * This event is useful when you want to update interface elements after the rendering, e.g. position of the
 * balloon panel. If you wants to change view structure use
 * {@link module:engine/view/document~ViewDocument#registerPostFixer post-fixers}.
 *
 * @eventName ~EditingView#render
 */
export type ViewRenderEvent = {
    name: 'render';
    args: [];
};
/**
 * An event fired at the moment of {@link module:engine/view/view~EditingView#scrollToTheSelection} being called. It
 * carries two objects in its payload (`args`):
 *
 * * The first argument is the {@link module:engine/view/view~ViewScrollToTheSelectionEventData object containing data} that gets
 *   passed down to the {@link module:utils/dom/scroll~scrollViewportToShowTarget} helper. If some event listener modifies it, it can
 *   adjust the behavior of the scrolling (e.g. include additional `viewportOffset`).
 * * The second argument corresponds to the original arguments passed to {@link module:utils/dom/scroll~scrollViewportToShowTarget}.
 *   It allows listeners to re-execute the `scrollViewportToShowTarget()` method with its original arguments if there is such a need,
 *   for instance, if the integration requires re–scrolling after certain interaction.
 *
 * @eventName ~EditingView#scrollToTheSelection
 */
export type ViewScrollToTheSelectionEvent = {
    name: 'scrollToTheSelection';
    args: [
        ViewScrollToTheSelectionEventData,
        Parameters<EditingView['scrollToTheSelection']>[0]
    ];
};
/**
 * An object passed down to the {@link module:utils/dom/scroll~scrollViewportToShowTarget} helper while calling
 * {@link module:engine/view/view~EditingView#scrollToTheSelection}.
 */
export type ViewScrollToTheSelectionEventData = {
    target: DomRange;
    viewportOffset: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    ancestorOffset: number;
    alignToTop?: boolean;
    forceScroll?: boolean;
};
/**
 * Observers that are always registered.
 */
export type AlwaysRegisteredViewObservers = typeof MutationObserver | typeof FocusObserver | typeof SelectionObserver | typeof KeyObserver | typeof FakeSelectionObserver | typeof CompositionObserver | typeof ArrowKeysObserver | typeof InputObserver | typeof TabObserver;
export {};

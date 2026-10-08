/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/view
 */
import { ViewDocument } from './document.js';
import { ViewDowncastWriter } from './downcastwriter.js';
import { ViewRenderer } from './renderer.js';
import { ViewDomConverter } from './domconverter.js';
import { ViewPosition } from './position.js';
import { ViewRange } from './range.js';
import { ViewSelection } from './selection.js';
import { KeyObserver } from './observer/keyobserver.js';
import { FakeSelectionObserver } from './observer/fakeselectionobserver.js';
import { MutationObserver } from './observer/mutationobserver.js';
import { SelectionObserver } from './observer/selectionobserver.js';
import { FocusObserver } from './observer/focusobserver.js';
import { CompositionObserver } from './observer/compositionobserver.js';
import { InputObserver } from './observer/inputobserver.js';
import { ArrowKeysObserver } from './observer/arrowkeysobserver.js';
import { TabObserver } from './observer/tabobserver.js';
import { CKEditorError, env, ObservableMixin, scrollViewportToShowTarget } from '@ckeditor/ckeditor5-utils';
import { injectUiElementHandling } from './uielement.js';
import { injectQuirksHandling } from './filler.js';
import { cloneDeep } from 'es-toolkit/compat';
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
export class EditingView extends /* #__PURE__ */ ObservableMixin() {
    /**
     * Instance of the {@link module:engine/view/document~ViewDocument} associated with this view controller.
     */
    document;
    /**
     * Instance of the {@link module:engine/view/domconverter~ViewDomConverter domConverter} used by
     * {@link module:engine/view/view~EditingView#_renderer renderer}
     * and {@link module:engine/view/observer/observer~Observer observers}.
     */
    domConverter;
    /**
     * Roots of the DOM tree. Map on the `HTMLElement`s with roots names as keys.
     */
    domRoots = new Map();
    /**
     * Instance of the {@link module:engine/view/renderer~ViewRenderer renderer}.
     */
    _renderer;
    /**
     * A DOM root attributes cache. It saves the initial values of DOM root attributes before the DOM element
     * is {@link module:engine/view/view~EditingView#attachDomRoot attached} to the view so later on, when
     * the view is destroyed ({@link module:engine/view/view~EditingView#detachDomRoot}), they can be easily restored.
     * This way, the DOM element can go back to the (clean) state as if the editing view never used it.
     */
    _initialDomRootAttributes = new WeakMap();
    /**
     * Map of registered {@link module:engine/view/observer/observer~Observer observers}.
     */
    _observers = new Map();
    /**
     * ViewDowncastWriter instance used in {@link #change change method} callbacks.
     */
    _writer;
    /**
     * Is set to `true` when {@link #change view changes} are currently in progress.
     */
    _ongoingChange = false;
    /**
     * Used to prevent calling {@link #forceRender} and {@link #change} during rendering view to the DOM.
     */
    _postFixersInProgress = false;
    /**
     * Internal flag to temporary disable rendering. See the usage in the {@link #_disableRendering}.
     */
    _renderingDisabled = false;
    /**
     * Internal flag that disables rendering when there are no changes since the last rendering.
     * It stores information about changed selection and changed elements from attached document roots.
     */
    _hasChangedSinceTheLastRendering = false;
    /**
     * @param stylesProcessor The styles processor instance.
     */
    constructor(stylesProcessor) {
        super();
        this.document = new ViewDocument(stylesProcessor);
        this.domConverter = new ViewDomConverter(this.document);
        this.set('isRenderingInProgress', false);
        this.set('hasDomSelection', false);
        this._renderer = new ViewRenderer(this.domConverter, this.document.selection);
        this._renderer.bind('isFocused', 'isSelecting', 'isComposing')
            .to(this.document, 'isFocused', 'isSelecting', 'isComposing');
        this._writer = new ViewDowncastWriter(this.document);
        // Add default observers.
        // Make sure that this list matches AlwaysRegisteredViewObservers type.
        this.addObserver(MutationObserver);
        this.addObserver(FocusObserver);
        this.addObserver(SelectionObserver);
        this.addObserver(KeyObserver);
        this.addObserver(FakeSelectionObserver);
        this.addObserver(CompositionObserver);
        this.addObserver(ArrowKeysObserver);
        this.addObserver(InputObserver);
        this.addObserver(TabObserver);
        // Inject quirks handlers.
        injectQuirksHandling(this);
        injectUiElementHandling(this);
        // Use 'normal' priority so that rendering is performed as first when using that priority.
        this.on('render', () => {
            this._render();
            // Informs that layout has changed after render.
            this.document.fire('layoutChanged');
            // Reset the `_hasChangedSinceTheLastRendering` flag after rendering.
            this._hasChangedSinceTheLastRendering = false;
        });
        // Listen to the document selection changes directly.
        this.listenTo(this.document.selection, 'change', () => {
            this._hasChangedSinceTheLastRendering = true;
        });
        // Trigger re-render if only the focus changed.
        this.listenTo(this.document, 'change:isFocused', () => {
            this._hasChangedSinceTheLastRendering = true;
        });
        // Remove ranges from DOM selection if editor is blurred.
        // See https://github.com/ckeditor/ckeditor5/issues/5753.
        if (env.isiOS) {
            this.listenTo(this.document, 'blur', (evt, data) => {
                const relatedViewElement = this.domConverter.mapDomToView(data.domEvent.relatedTarget);
                // Do not modify DOM selection if focus is moved to other editable of the same editor.
                if (!relatedViewElement) {
                    this.domConverter._clearDomSelection();
                }
            });
        }
        // Listen to external content mutations (directly in the DOM) and mark them to get verified by the renderer.
        this.listenTo(this.document, 'mutations', (evt, { mutations }) => {
            mutations.forEach(mutation => this._renderer.markToSync(mutation.type, mutation.node));
        }, { priority: 'low' });
        // After all mutated nodes were marked to sync we can trigger view to DOM synchronization
        // to make sure the DOM structure matches the view.
        this.listenTo(this.document, 'mutations', () => {
            this.forceRender();
        }, { priority: 'lowest' });
    }
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
    attachDomRoot(domRoot, name = 'main') {
        const viewRoot = this.document.getRoot(name);
        // Set view root name the same as DOM root tag name.
        viewRoot._name = domRoot.tagName.toLowerCase();
        const initialDomRootAttributes = {};
        // 1. Copy and cache the attributes to remember the state of the element before attaching.
        //    The cached attributes will be restored in detachDomRoot() so the element goes to the
        //    clean state as if the editing view never used it.
        // 2. Apply the attributes using the view writer, so they all go under the control of the engine.
        //    The editing view takes over the attribute management completely because various
        //    features (e.g. addPlaceholder()) require dynamic changes of those attributes and they
        //    cannot be managed by the engine and the UI library at the same time.
        for (const { name, value } of Array.from(domRoot.attributes)) {
            initialDomRootAttributes[name] = value;
            // Do not use writer.setAttribute() for the class attribute. The EditableUIView class
            // and its descendants could have already set some using the writer.addClass() on the view
            // document root. They haven't been rendered yet so they are not present in the DOM root.
            // Using writer.setAttribute( 'class', ... ) would override them completely.
            if (name === 'class') {
                this._writer.addClass(value.split(' '), viewRoot);
            }
            else {
                // There is a chance that some attributes have already been set on the view root before attaching
                // the DOM root and should be preserved. This is a similar case to the "class" attribute except
                // this time there is no workaround using a some low-level API.
                if (!viewRoot.hasAttribute(name)) {
                    this._writer.setAttribute(name, value, viewRoot);
                }
            }
        }
        this._initialDomRootAttributes.set(domRoot, initialDomRootAttributes);
        const updateContenteditableAttribute = () => {
            this._writer.setAttribute('contenteditable', (!viewRoot.isReadOnly).toString(), viewRoot);
            if (viewRoot.isReadOnly) {
                this._writer.addClass('ck-read-only', viewRoot);
            }
            else {
                this._writer.removeClass('ck-read-only', viewRoot);
            }
        };
        // Set initial value.
        updateContenteditableAttribute();
        this.domRoots.set(name, domRoot);
        this.domConverter.bindElements(domRoot, viewRoot);
        this._renderer.markToSync('children', viewRoot);
        this._renderer.markToSync('attributes', viewRoot);
        this._renderer.domDocuments.add(domRoot.ownerDocument);
        viewRoot.on('change:children', (evt, node) => this._renderer.markToSync('children', node));
        viewRoot.on('change:attributes', (evt, node) => this._renderer.markToSync('attributes', node));
        viewRoot.on('change:text', (evt, node) => this._renderer.markToSync('text', node));
        viewRoot.on('change:isReadOnly', () => this.change(updateContenteditableAttribute));
        viewRoot.on('change', () => {
            this._hasChangedSinceTheLastRendering = true;
        });
        for (const observer of this._observers.values()) {
            observer.observe(domRoot, name);
        }
    }
    /**
     * Detaches a DOM root element from the view element and restores its attributes to the state before
     * {@link #attachDomRoot `attachDomRoot()`}.
     *
     * @param name Name of the root to detach.
     */
    detachDomRoot(name) {
        const domRoot = this.domRoots.get(name);
        // Remove all root attributes so the DOM element is "bare".
        Array.from(domRoot.attributes).forEach(({ name }) => domRoot.removeAttribute(name));
        const initialDomRootAttributes = this._initialDomRootAttributes.get(domRoot);
        // Revert all view root attributes back to the state before attachDomRoot was called.
        for (const attribute in initialDomRootAttributes) {
            domRoot.setAttribute(attribute, initialDomRootAttributes[attribute]);
        }
        this.domRoots.delete(name);
        this.domConverter.unbindDomElement(domRoot);
        for (const observer of this._observers.values()) {
            observer.stopObserving(domRoot);
        }
    }
    /**
     * Gets DOM root element.
     *
     * @param name  Name of the root.
     * @returns DOM root element instance.
     */
    getDomRoot(name = 'main') {
        return this.domRoots.get(name);
    }
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
    addObserver(ObserverConstructor) {
        let observer = this._observers.get(ObserverConstructor);
        if (observer) {
            return observer;
        }
        observer = new ObserverConstructor(this);
        this._observers.set(ObserverConstructor, observer);
        for (const [name, domElement] of this.domRoots) {
            observer.observe(domElement, name);
        }
        observer.enable();
        return observer;
    }
    /**
     * Returns observer of the given type or `undefined` if such observer has not been added yet.
     *
     * @param ObserverConstructor The constructor of an observer to get.
     * @returns Observer instance or undefined.
     */
    getObserver(ObserverConstructor) {
        return this._observers.get(ObserverConstructor);
    }
    /**
     * Disables all added observers.
     */
    disableObservers() {
        for (const observer of this._observers.values()) {
            observer.disable();
        }
    }
    /**
     * Enables all added observers.
     */
    enableObservers() {
        for (const observer of this._observers.values()) {
            observer.enable();
        }
    }
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
    scrollToTheSelection({ alignToTop, forceScroll, viewportOffset = 20, ancestorOffset = 20 } = {}) {
        const range = this.document.selection.getFirstRange();
        if (!range) {
            return;
        }
        // Clone to make sure properties like `viewportOffset` are not mutated in the event listeners.
        const originalArgs = cloneDeep({ alignToTop, forceScroll, viewportOffset, ancestorOffset });
        if (typeof viewportOffset === 'number') {
            viewportOffset = {
                top: viewportOffset,
                bottom: viewportOffset,
                left: viewportOffset,
                right: viewportOffset
            };
        }
        const options = {
            target: this.domConverter.viewRangeToDom(range),
            viewportOffset,
            ancestorOffset,
            alignToTop,
            forceScroll
        };
        this.fire('scrollToTheSelection', options, originalArgs);
        scrollViewportToShowTarget(options);
    }
    /**
     * It will focus DOM element representing {@link module:engine/view/editableelement~ViewEditableElement ViewEditableElement}
     * that is currently having selection inside.
     */
    focus() {
        if (!this.document.isFocused) {
            const editable = this.document.selection.editableElement;
            if (editable) {
                this.domConverter.focus(editable);
                this.forceRender();
            }
            else {
                // Before focusing view document, selection should be placed inside one of the view's editables.
                // Normally its selection will be converted from model document (which have default selection), but
                // when using view document on its own, we need to manually place selection before focusing it.
                //
                // @if CK_DEBUG // console.warn( 'There is no selection in any editable to focus.' );
            }
        }
    }
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
    change(callback) {
        if (this.isRenderingInProgress || this._postFixersInProgress) {
            /**
             * Thrown when there is an attempt to make changes to the view tree when it is in incorrect state. This may
             * cause some unexpected behaviour and inconsistency between the DOM and the view.
             * This may be caused by:
             *
             * * calling {@link module:engine/view/view~EditingView#change} or {@link module:engine/view/view~EditingView#forceRender}
             * during rendering process,
             * * calling {@link module:engine/view/view~EditingView#change} or {@link module:engine/view/view~EditingView#forceRender}
             * inside of {@link module:engine/view/document~ViewDocument#registerPostFixer post-fixer function}.
             *
             * @error cannot-change-view-tree
             */
            throw new CKEditorError('cannot-change-view-tree', this);
        }
        try {
            // Recursive call to view.change() method - execute listener immediately.
            if (this._ongoingChange) {
                return callback(this._writer);
            }
            // This lock will assure that all recursive calls to view.change() will end up in same block - one "render"
            // event for all nested calls.
            this._ongoingChange = true;
            const callbackResult = callback(this._writer);
            this._ongoingChange = false;
            // This lock is used by editing controller to render changes from outer most model.change() once. As plugins might call
            // view.change() inside model.change() block - this will ensures that postfixers and rendering are called once after all
            // changes. Also, we don't need to render anything if there're no changes since last rendering.
            if (!this._renderingDisabled && this._hasChangedSinceTheLastRendering) {
                this._postFixersInProgress = true;
                this.document._callPostFixers(this._writer);
                this._postFixersInProgress = false;
                this.fire('render');
            }
            return callbackResult;
        }
        catch (err) {
            // @if CK_DEBUG // throw err;
            /* istanbul ignore next -- @preserve */
            CKEditorError.rethrowUnexpectedError(err, this);
        }
    }
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
    forceRender() {
        this._hasChangedSinceTheLastRendering = true;
        this.getObserver(FocusObserver).flush();
        this.change(() => { });
    }
    /**
     * Destroys this instance. Makes sure that all observers are destroyed and listeners removed.
     */
    destroy() {
        for (const observer of this._observers.values()) {
            observer.destroy();
        }
        this.document.destroy();
        this.stopListening();
    }
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
    createPositionAt(itemOrPosition, offset) {
        return ViewPosition._createAt(itemOrPosition, offset);
    }
    /**
     * Creates a new position after given view item.
     *
     * @param item View item after which the position should be located.
     */
    createPositionAfter(item) {
        return ViewPosition._createAfter(item);
    }
    /**
     * Creates a new position before given view item.
     *
     * @param item View item before which the position should be located.
     */
    createPositionBefore(item) {
        return ViewPosition._createBefore(item);
    }
    /**
     * Creates a range spanning from `start` position to `end` position.
     *
     * **Note:** This factory method creates it's own {@link module:engine/view/position~ViewPosition} instances basing on passed values.
     *
     * @param start Start position.
     * @param end End position. If not set, range will be collapsed at `start` position.
     */
    createRange(start, end) {
        return new ViewRange(start, end);
    }
    /**
     * Creates a range that starts before given {@link module:engine/view/item~ViewItem view item} and ends after it.
     */
    createRangeOn(item) {
        return ViewRange._createOn(item);
    }
    /**
     * Creates a range inside an {@link module:engine/view/element~ViewElement element} which starts before the first child of
     * that element and ends after the last child of that element.
     *
     * @param element Element which is a parent for the range.
     */
    createRangeIn(element) {
        return ViewRange._createIn(element);
    }
    createSelection(...args) {
        return new ViewSelection(...args);
    }
    /**
     * Disables or enables rendering. If the flag is set to `true` then the rendering will be disabled.
     * If the flag is set to `false` and if there was some change in the meantime, then the rendering action will be performed.
     *
     * @internal
     * @param flag A flag indicates whether the rendering should be disabled.
     */
    _disableRendering(flag) {
        this._renderingDisabled = flag;
        if (flag == false) {
            // Render when you stop blocking rendering.
            this.change(() => { });
        }
    }
    /**
     * Renders all changes. In order to avoid triggering the observers (e.g. selection) all observers are disabled
     * before rendering and re-enabled after that.
     */
    _render() {
        this.isRenderingInProgress = true;
        this.disableObservers();
        this._renderer.render();
        this.enableObservers();
        this.isRenderingInProgress = false;
    }
}

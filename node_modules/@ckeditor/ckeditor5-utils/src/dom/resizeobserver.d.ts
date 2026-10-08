/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * A helper class which instances allow performing custom actions when native DOM elements are resized.
 *
 * ```ts
 * const editableElement = editor.editing.view.getDomRoot();
 *
 * const observer = new ResizeObserver( editableElement, entry => {
 * 	console.log( 'The editable element has been resized in DOM.' );
 * 	console.log( entry.target ); // -> editableElement
 * 	console.log( entry.contentRect.width ); // -> e.g. '423px'
 * } );
 * ```
 *
 * It uses the [native DOM resize observer](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
 * under the hood.
 */
export declare class ResizeObserver {
    /**
     * The element observed by this observer.
     */
    private readonly _element;
    /**
     * The callback executed each time {@link #_element} is resized.
     */
    private readonly _callback;
    /**
     * The single native observer instance shared across all {@link module:utils/dom/resizeobserver~ResizeObserver} instances.
     */
    private static _observerInstance;
    /**
     * A mapping of native DOM elements and their callbacks shared across all
     * {@link module:utils/dom/resizeobserver~ResizeObserver} instances.
     */
    private static _elementCallbacks;
    /**
     * Creates an instance of the `ResizeObserver` class.
     *
     * @param element A DOM element that is to be observed for resizing. Note that
     * the element must be visible (i.e. not detached from DOM) for the observer to work.
     * @param callback A function called when the observed element was resized. It passes
     * the [`ResizeObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry)
     * object with information about the resize event.
     */
    constructor(element: Element, callback: (entry: ResizeObserverEntry) => void);
    /**
     * The element observed by this observer.
     */
    get element(): Element;
    /**
     * Destroys the observer which disables the `callback` passed to the {@link #constructor}.
     */
    destroy(): void;
    /**
     * Registers a new resize callback for the DOM element.
     */
    private static _addElementCallback;
    /**
     * Removes a resize callback from the DOM element. If no callbacks are left
     * for the element, it removes the element from the native observer.
     */
    private static _deleteElementCallback;
    /**
     * Returns are registered resize callbacks for the DOM element.
     */
    private static _getElementCallbacks;
    /**
     * Creates the single native observer shared across all `ResizeObserver` instances.
     */
    private static _createObserver;
}

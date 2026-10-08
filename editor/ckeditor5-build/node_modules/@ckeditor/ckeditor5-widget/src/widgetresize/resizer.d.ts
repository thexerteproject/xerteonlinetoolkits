/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Rect, type DecoratedMethodEvent } from '@ckeditor/ckeditor5-utils';
import { WidgetResizeState } from './resizerstate.js';
import type { WidgetResizerOptions } from '../widgetresize.js';
declare const WidgetResizer_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * Represents a resizer for a single resizable object.
 */
export declare class WidgetResizer extends /* #__PURE__ */ WidgetResizer_base {
    /**
     * Flag that indicates whether resizer can be used.
     *
     * @observable
     */
    isEnabled: boolean;
    /**
     * Flag that indicates that resizer is currently focused.
     *
     * @observable
     */
    isSelected: boolean;
    /**
     * Flag that indicates whether resizer is rendered (visible on the screen).
     *
     * @readonly
     * @observable
     */
    isVisible: boolean;
    /**
     * Stores the state of the resizable host geometry, such as the original width, the currently proposed height, etc.
     *
     * Note that a new state is created for each resize transaction.
     */
    private _state;
    /**
     * A view displaying the proposed new element size during the resizing.
     */
    private _sizeView;
    /**
     * Options passed to the {@link #constructor}.
     */
    private _options;
    /**
     * A wrapper that is controlled by the resizer. This is usually a widget element.
     */
    private _viewResizerWrapper;
    /**
     * The width of the resized {@link module:widget/widgetresize~WidgetResizerOptions#viewElement viewElement} before the resizing started.
     */
    private _initialViewWidth;
    /**
     * @param options Resizer options.
     */
    constructor(options: WidgetResizerOptions);
    /**
     * Stores the state of the resizable host geometry, such as the original width, the currently proposed height, etc.
     *
     * Note that a new state is created for each resize transaction.
     */
    get state(): WidgetResizeState;
    /**
     * Makes resizer visible in the UI.
     */
    show(): void;
    /**
     * Hides resizer in the UI.
     */
    hide(): void;
    /**
     * Attaches the resizer to the DOM.
     */
    attach(): void;
    /**
     * Starts the resizing process.
     *
     * Creates a new {@link #state} for the current process.
     *
     * @fires begin
     * @param domResizeHandle Clicked handle.
     */
    begin(domResizeHandle: HTMLElement): void;
    /**
     * Updates the proposed size based on `domEventData`.
     *
     * @fires updateSize
     */
    updateSize(domEventData: MouseEvent): void;
    /**
     * Applies the geometry proposed with the resizer.
     *
     * @fires commit
     */
    commit(): void;
    /**
     * Cancels and rejects the proposed resize dimensions, hiding the UI.
     *
     * @fires cancel
     */
    cancel(): void;
    /**
     * Destroys the resizer.
     */
    destroy(): void;
    /**
     * Redraws the resizer.
     *
     * @param handleHostRect Handle host rectangle might be given to improve performance.
     */
    redraw(handleHostRect?: Rect): void;
    containsHandle(domElement: HTMLElement): boolean;
    static isResizeHandle(domElement: HTMLElement): boolean;
    /**
     * Cleans up the context state.
     */
    private _cleanup;
    /**
     * Calculates the proposed size as the resize handles are dragged.
     *
     * @param domEventData Event data that caused the size update request. It should be used to calculate the proposed size.
     */
    private _proposeNewSize;
    /**
     * Obtains the resize host.
     *
     * Resize host is an object that receives dimensions which are the result of resizing.
     */
    private _getResizeHost;
    /**
     * Obtains the handle host.
     *
     * Handle host is an object that the handles are aligned to.
     *
     * Handle host will not always be an entire widget itself. Take an image as an example. The image widget
     * contains an image and a caption. Only the image should be surrounded with handles.
     */
    private _getHandleHost;
    /**
     * DOM container of the entire resize UI.
     *
     * Note that this property will have a value only after the element bound with the resizer is rendered
     * (otherwise `null`).
     */
    private get _domResizerWrapper();
    /**
     * Renders the resize handles in the DOM.
     *
     * @param domElement The resizer wrapper.
     */
    private _appendHandles;
    /**
     * Sets up the {@link #_sizeView} property and adds it to the passed `domElement`.
     */
    private _appendSizeUI;
}
/**
 * @eventName ~WidgetResizer#begin
 */
export type WidgetResizerBeginEvent = DecoratedMethodEvent<WidgetResizer, 'begin'>;
/**
 * @eventName ~WidgetResizer#cancel
 */
export type WidgetResizerCancelEvent = DecoratedMethodEvent<WidgetResizer, 'cancel'>;
/**
 * @eventName ~WidgetResizer#commit
 */
export type WidgetResizerCommitEvent = DecoratedMethodEvent<WidgetResizer, 'commit'>;
/**
 * @eventName ~WidgetResizer#updateSize
 */
export type WidgetResizerUpdateSizeEvent = DecoratedMethodEvent<WidgetResizer, 'updateSize'>;
export {};

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { WidgetResizerOptions } from '../widgetresize.js';
declare const WidgetResizeState_base: {
    new (): import("@ckeditor/ckeditor5-utils").Observable;
    prototype: import("@ckeditor/ckeditor5-utils").Observable;
};
/**
 * Stores the internal state of a single resizable object.
 */
export declare class WidgetResizeState extends /* #__PURE__ */ WidgetResizeState_base {
    /**
     * The position of the handle that initiated the resizing. E.g. `"top-left"`, `"bottom-right"` etc. or `null`
     * if unknown.
     *
     * @readonly
     * @observable
     */
    activeHandlePosition: string | null;
    /**
     * The width (percents) proposed, but not committed yet, in the current resize process.
     *
     * @readonly
     * @observable
     */
    proposedWidthPercents: number | null;
    /**
     * The width (pixels) proposed, but not committed yet, in the current resize process.
     *
     * @readonly
     * @observable
     */
    proposedWidth: number | null;
    /**
     * The height (pixels) proposed, but not committed yet, in the current resize process.
     *
     * @readonly
     * @observable
     */
    proposedHeight: number | null;
    /**
     * @readonly
     * @observable
     */
    proposedHandleHostWidth: number | null;
    /**
     * @readonly
     * @observable
     */
    proposedHandleHostHeight: number | null;
    /**
     * The reference point of the resizer where the dragging started. It is used to measure the distance the user cursor
     * traveled, so how much the image should be enlarged.
     * This information is only known after the DOM was rendered, so it will be updated later.
     *
     * @internal
     */
    _referenceCoordinates: {
        x: number;
        y: number;
    } | null;
    /**
     * Resizer options.
     */
    private readonly _options;
    /**
     * The original width (pixels) of the resized object when the resize process was started.
     *
     * @readonly
     */
    private _originalWidth?;
    /**
     * The original height (pixels) of the resized object when the resize process was started.
     *
     * @readonly
     */
    private _originalHeight?;
    /**
     * The original width (percents) of the resized object when the resize process was started.
     *
     * @readonly
     */
    private _originalWidthPercents?;
    /**
     * A width to height ratio of the resized image.
     *
     * @readonly
     */
    private _aspectRatio?;
    /**
     * @param options Resizer options.
     */
    constructor(options: WidgetResizerOptions);
    /**
     * The original width (pixels) of the resized object when the resize process was started.
     */
    get originalWidth(): number | undefined;
    /**
     * The original height (pixels) of the resized object when the resize process was started.
     */
    get originalHeight(): number | undefined;
    /**
     * The original width (percents) of the resized object when the resize process was started.
     */
    get originalWidthPercents(): number | undefined;
    /**
     * A width to height ratio of the resized image.
     */
    get aspectRatio(): number | undefined;
    /**
     *
     * @param domResizeHandle The handle used to calculate the reference point.
     */
    begin(domResizeHandle: HTMLElement, domHandleHost: HTMLElement, domResizeHost: HTMLElement): void;
    update(newSize: {
        width: number;
        height: number;
        widthPercents: number;
        handleHostWidth: number;
        handleHostHeight: number;
    }): void;
}
export {};

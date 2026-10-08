/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/datatransfer
 */
type DomDataTransfer = globalThis.DataTransfer;
/**
 * A facade over the native [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer) object.
 */
export declare class ViewDataTransfer {
    /**
     * The array of files created from the native `DataTransfer#files` or `DataTransfer#items`.
     */
    private _files;
    /**
     * The native DataTransfer object.
     */
    private _native;
    /**
     * @param nativeDataTransfer The native [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer) object.
     * @param options.cacheFiles Whether `files` list should be initialized in the constructor.
     */
    constructor(nativeDataTransfer: DomDataTransfer, options?: {
        cacheFiles?: boolean;
    });
    /**
     * The array of files created from the native `DataTransfer#files` or `DataTransfer#items`.
     */
    get files(): Array<File>;
    /**
     * Returns an array of available native content types.
     */
    get types(): ReadonlyArray<string>;
    /**
     * Gets the data from the data transfer by its MIME type.
     *
     * ```ts
     * dataTransfer.getData( 'text/plain' );
     * ```
     *
     * @param type The MIME type. E.g. `text/html` or `text/plain`.
     */
    getData(type: string): string;
    /**
     * Sets the data in the data transfer.
     *
     * @param type The MIME type. E.g. `text/html` or `text/plain`.
     */
    setData(type: string, data: string): void;
    /**
     * The effect that is allowed for a drag operation.
     */
    set effectAllowed(value: ViewEffectAllowed);
    get effectAllowed(): ViewEffectAllowed;
    /**
     * The actual drop effect.
     */
    set dropEffect(value: ViewDropEffect);
    get dropEffect(): ViewDropEffect;
    /**
     * Set a preview image of the dragged content.
     */
    setDragImage(image: Element, x: number, y: number): void;
    /**
     * Whether the dragging operation was canceled.
     */
    get isCanceled(): boolean;
}
/**
 * The effect that is allowed for a drag operation.
 */
export type ViewEffectAllowed = DomDataTransfer['effectAllowed'];
/**
 * The actual drop effect.
 */
export type ViewDropEffect = DomDataTransfer['dropEffect'];
export {};

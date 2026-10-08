/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module minimap/minimapiframeview
 */
import { IframeView } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import type { MinimapViewOptions } from './minimapview.js';
/**
 * The internal `<iframe>` view that hosts the minimap content.
 *
 * @internal
 */
export declare class MinimapIframeView extends IframeView {
    /**
     * The CSS `top` used to scroll the minimap.
     *
     * @readonly
     */
    top: number;
    /**
     * The CSS `height` of the iframe.
     *
     * @readonly
     */
    height: number;
    /**
     * Cached view constructor options for re-use in other methods.
     */
    private readonly _options;
    /**
     * Creates an instance of the internal minimap iframe.
     */
    constructor(locale: Locale, options: MinimapViewOptions);
    /**
     * @inheritDoc
     */
    render(): Promise<unknown>;
    /**
     * Sets the new height of the iframe.
     */
    setHeight(newHeight: number): void;
    /**
     * Sets the top offset of the iframe to move it around vertically.
     */
    setTopOffset(newOffset: number): void;
    /**
     * Sets the internal structure of the `<iframe>` readying it to display the
     * minimap element.
     */
    private _prepareDocument;
}

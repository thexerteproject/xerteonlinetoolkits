/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/text
 */
import { ViewNode } from './node.js';
import { type ViewDocument } from './document.js';
/**
 * Tree view text node.
 *
 * The constructor of this class should not be used directly. To create a new text node instance
 * use the {@link module:engine/view/downcastwriter~ViewDowncastWriter#createText `ViewDowncastWriter#createText()`}
 * method when working on data downcasted from the model or the
 * {@link module:engine/view/upcastwriter~ViewUpcastWriter#createText `ViewUpcastWriter#createText()`}
 * method when working on non-semantic views.
 */
export declare class ViewText extends ViewNode {
    /**
     * The text content.
     *
     * Setting the data fires the {@link module:engine/view/node~ViewNode#event:change:text change event}.
     */
    private _textData;
    /**
     * Creates a tree view text node.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#createText
     * @internal
     * @param document The document instance to which this text node belongs.
     * @param data The text's data.
     */
    constructor(document: ViewDocument, data: string);
    /**
     * The text content.
     */
    get data(): string;
    /**
     * The `_data` property is controlled by a getter and a setter.
     *
     * The getter is required when using the addition assignment operator on protected property:
     *
     * ```ts
     * const foo = downcastWriter.createText( 'foo' );
     * const bar = downcastWriter.createText( 'bar' );
     *
     * foo._data += bar.data;   // executes: `foo._data = foo._data + bar.data`
     * console.log( foo.data ); // prints: 'foobar'
     * ```
     *
     * If the protected getter didn't exist, `foo._data` will return `undefined` and result of the merge will be invalid.
     *
     * The setter sets data and fires the {@link module:engine/view/node~ViewNode#event:change:text change event}.
     *
     * @internal
     */
    get _data(): string;
    set _data(data: string);
    /**
     * Checks if this text node is similar to other text node.
     * Both nodes should have the same data to be considered as similar.
     *
     * @param otherNode Node to check if it is same as this node.
     */
    isSimilar(otherNode: ViewNode): boolean;
    /**
     * Converts `ViewText` instance to plain object and returns it.
     *
     * @returns `ViewText` instance converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Clones this node.
     *
     * @internal
     * @returns Text node that is a clone of this node.
     */
    _clone(): ViewText;
}

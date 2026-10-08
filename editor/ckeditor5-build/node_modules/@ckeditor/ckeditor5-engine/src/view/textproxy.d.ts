/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/textproxy
 */
import { ViewTypeCheckable } from './typecheckable.js';
import { type ViewDocument } from './document.js';
import { type ViewDocumentFragment } from './documentfragment.js';
import { type ViewElement } from './element.js';
import { type ViewNode } from './node.js';
import { type ViewText } from './text.js';
/**
 * ViewTextProxy is a wrapper for substring of {@link module:engine/view/text~ViewText}. Instance of this class is created by
 * {@link module:engine/view/treewalker~ViewTreeWalker} when only a part of {@link module:engine/view/text~ViewText} needs to be returned.
 *
 * `ViewTextProxy` has an API similar to {@link module:engine/view/text~ViewText Text} and allows to do most of the common tasks performed
 * on view nodes.
 *
 * **Note:** Some `ViewTextProxy` instances may represent whole text node, not just a part of it.
 * See {@link module:engine/view/textproxy~ViewTextProxy#isPartial}.
 *
 * **Note:** `ViewTextProxy` is a readonly interface.
 *
 * **Note:** `ViewTextProxy` instances are created on the fly basing
 * on the current state of parent {@link module:engine/view/text~ViewText}.
 * Because of this it is highly unrecommended to store references to `TextProxy instances because they might get
 * invalidated due to operations on Document. Also ViewTextProxy is not a {@link module:engine/view/node~ViewNode} so it cannot be
 * inserted as a child of {@link module:engine/view/element~ViewElement}.
 *
 * `ViewTextProxy` instances are created by {@link module:engine/view/treewalker~ViewTreeWalker view tree walker}.
 * You should not need to create an instance of this class by your own.
 */
export declare class ViewTextProxy extends ViewTypeCheckable {
    /**
     * Reference to the {@link module:engine/view/text~ViewText} element which ViewTextProxy is a substring.
     */
    readonly textNode: ViewText;
    /**
     * Text data represented by this text proxy.
     */
    readonly data: string;
    /**
     * Offset in the `textNode` where this `ViewTextProxy` instance starts.
     */
    readonly offsetInText: number;
    /**
     * Creates a text proxy.
     *
     * @internal
     * @param textNode Text node which part is represented by this text proxy.
     * @param offsetInText Offset in {@link module:engine/view/textproxy~ViewTextProxy#textNode text node}
     * from which the text proxy starts.
     * @param length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
     */
    constructor(textNode: ViewText, offsetInText: number, length: number);
    /**
     * Offset size of this node.
     */
    get offsetSize(): number;
    /**
     * Flag indicating whether `ViewTextProxy` instance covers only part of the original {@link module:engine/view/text~ViewText text node}
     * (`true`) or the whole text node (`false`).
     *
     * This is `false` when text proxy starts at the very beginning of {@link module:engine/view/textproxy~ViewTextProxy#textNode textNode}
     * ({@link module:engine/view/textproxy~ViewTextProxy#offsetInText offsetInText} equals `0`) and text proxy sizes is equal to
     * text node size.
     */
    get isPartial(): boolean;
    /**
     * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
     */
    get parent(): ViewElement | ViewDocumentFragment | null;
    /**
     * Root of this text proxy, which is same as root of text node represented by this text proxy.
     */
    get root(): ViewNode | ViewDocumentFragment;
    /**
     * {@link module:engine/view/document~ViewDocument View document} that owns this text proxy, or `null` if the text proxy is inside
     * {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment}.
     */
    get document(): ViewDocument | null;
    /**
     * Returns ancestors array of this text proxy.
     *
     * @param options Options object.
     * @param options.includeSelf When set to `true`, textNode will be also included in parent's array.
     * @param options.parentFirst When set to `true`, array will be sorted from text proxy parent to
     * root element, otherwise root element will be the first item in the array.
     * @returns Array with ancestors.
     */
    getAncestors(options?: {
        includeSelf?: boolean;
        parentFirst?: boolean;
    }): Array<ViewText | ViewElement | ViewDocumentFragment>;
}

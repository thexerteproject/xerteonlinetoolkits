/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/view/attributeelement
 */
import { ViewElement, type ViewElementAttributes } from './element.js';
import { type ViewDocument } from './document.js';
import { type ViewNode } from './node.js';
/**
 * Attribute elements are used to represent formatting elements in the view (think – `<b>`, `<span style="font-size: 2em">`, etc.).
 * Most often they are created when downcasting model text attributes.
 *
 * Editing engine does not define a fixed HTML DTD. This is why a feature developer needs to choose between various
 * types (container element, {@link module:engine/view/attributeelement~ViewAttributeElement attribute element},
 * {@link module:engine/view/emptyelement~ViewEmptyElement empty element}, etc) when developing a feature.
 *
 * To create a new attribute element instance use the
 * {@link module:engine/view/downcastwriter~ViewDowncastWriter#createAttributeElement `ViewDowncastWriter#createAttributeElement()`} method.
 */
export declare class ViewAttributeElement extends ViewElement {
    static readonly DEFAULT_PRIORITY: number;
    /**
     * Element priority. Decides in what order elements are wrapped by {@link module:engine/view/downcastwriter~ViewDowncastWriter}.
     *
     * @internal
     * @readonly
     */
    _priority: number;
    /**
     * Element identifier. If set, it is used by {@link module:engine/view/element~ViewElement#isSimilar},
     * and then two elements are considered similar if, and only if they have the same `_id`.
     *
     * @internal
     * @readonly
     */
    _id: string | number | null;
    /**
     * Keeps all the attribute elements that have the same {@link module:engine/view/attributeelement~ViewAttributeElement#id ids}
     * and still exist in the view tree.
     *
     * This property is managed by {@link module:engine/view/downcastwriter~ViewDowncastWriter}.
     */
    private readonly _clonesGroup;
    /**
     * Creates an attribute element.
     *
     * @see module:engine/view/downcastwriter~ViewDowncastWriter#createAttributeElement
     * @see module:engine/view/element~ViewElement
     * @protected
     * @param document The document instance to which this element belongs.
     * @param name Node name.
     * @param attrs Collection of attributes.
     * @param children A list of nodes to be inserted into created element.
     */
    constructor(document: ViewDocument, name: string, attrs?: ViewElementAttributes, children?: ViewNode | Iterable<ViewNode>);
    /**
     * Element priority. Decides in what order elements are wrapped by {@link module:engine/view/downcastwriter~ViewDowncastWriter}.
     */
    get priority(): number;
    /**
     * Element identifier. If set, it is used by {@link module:engine/view/element~ViewElement#isSimilar},
     * and then two elements are considered similar if, and only if they have the same `id`.
     */
    get id(): string | number | null;
    /**
     * Returns all {@link module:engine/view/attributeelement~ViewAttributeElement attribute elements} that has the
     * same {@link module:engine/view/attributeelement~ViewAttributeElement#id id} and are in the view tree (were not removed).
     *
     * Note: If this element has been removed from the tree, returned set will not include it.
     *
     * Throws {@link module:utils/ckeditorerror~CKEditorError attribute-element-get-elements-with-same-id-no-id}
     * if this element has no `id`.
     *
     * @returns Set containing all the attribute elements
     * with the same `id` that were added and not removed from the view tree.
     */
    getElementsWithSameId(): Set<ViewAttributeElement>;
    /**
     * Checks if this element is similar to other element.
     *
     * If none of elements has set {@link module:engine/view/attributeelement~ViewAttributeElement#id}, then both elements
     * should have the same name, attributes and priority to be considered as similar. Two similar elements can contain
     * different set of children nodes.
     *
     * If at least one element has {@link module:engine/view/attributeelement~ViewAttributeElement#id} set, then both
     * elements have to have the same {@link module:engine/view/attributeelement~ViewAttributeElement#id} value to be
     * considered similar.
     *
     * Similarity is important for {@link module:engine/view/downcastwriter~ViewDowncastWriter}. For example:
     *
     * * two following similar elements can be merged together into one, longer element,
     * * {@link module:engine/view/downcastwriter~ViewDowncastWriter#unwrap} checks similarity of passed element and processed element to
     * decide whether processed element should be unwrapped,
     * * etc.
     */
    isSimilar(otherElement: ViewElement): boolean;
    /**
     * Converts `ViewAttributeElement` instance to plain object and returns it.
     *
     * @returns `ViewAttributeElement` instance converted to plain object.
     */
    toJSON(): unknown;
    /**
     * Clones provided element with priority.
     *
     * @internal
     * @param deep If set to `true` clones element and all its children recursively. When set to `false`,
     * element will be cloned without any children.
     * @returns Clone of this element.
     */
    _clone(deep?: boolean): this;
    /**
     * Used by {@link module:engine/view/element~ViewElement#_mergeAttributesFrom} to verify if the given element can be merged without
     * conflicts into this element.
     *
     * @internal
     */
    _canMergeAttributesFrom(otherElement: ViewAttributeElement): boolean;
    /**
     * Used by {@link module:engine/view/element~ViewElement#_subtractAttributesOf} to verify if the given element attributes
     * can be fully subtracted from this element.
     *
     * @internal
     */
    _canSubtractAttributesOf(otherElement: ViewAttributeElement): boolean;
}

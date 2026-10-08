/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/model/utils/insertobject
 */
import { type ModelDocumentSelection } from '../documentselection.js';
import { type ModelSelection } from '../selection.js';
import { type ModelElement } from '../element.js';
import { type Model } from '../model.js';
import { type ModelRange } from '../range.js';
/**
 * Inserts an {@glink framework/deep-dive/schema#object-elements object element} at a specific position in the editor content.
 *
 * **Note:** Use {@link module:engine/model/model~Model#insertObject} instead of this function.
 * This function is only exposed to be reusable in algorithms which change the {@link module:engine/model/model~Model#insertObject}
 * method's behavior.
 *
 * **Note**: For more documentation and examples, see {@link module:engine/model/model~Model#insertObject}.
 *
 * @param model The model in context of which the insertion should be performed.
 * @param object An object to be inserted into the model document.
 * @param selectable A selectable where the content should be inserted. If not specified, the current
 * {@link module:engine/model/document~ModelDocument#selection document selection} will be used instead.
 * @param options Additional options.
 * @param options.findOptimalPosition An option that, when set, adjusts the insertion position (relative to
 * `selectable` and `placeOrOffset`) so that the content of `selectable` is not split upon insertion (a.k.a. non-destructive insertion).
 * * When `'auto'`, the algorithm will decide whether to insert the object before or after `selectable` to avoid content splitting.
 * * When `'before'`, the closest position before `selectable` will be used that will not result in content splitting.
 * * When `'after'`, the closest position after `selectable` will be used that will not result in content splitting.
 *
 * Note that this option works only for block objects. Inline objects are inserted into text and do not split blocks.
 * @param options.setSelection An option that, when set, moves the
 * {@link module:engine/model/document~ModelDocument#selection document selection} after inserting the object.
 * * When `'on'`, the document selection will be set on the inserted object.
 * * When `'after'`, the document selection will move to the closest text node after the inserted object. If there is no
 * such text node, a paragraph will be created and the document selection will be moved inside it.
 * @returns A range which contains all the performed changes. This is a range that, if removed,
 * would return the model to the state before the insertion. If no changes were preformed by `insertObject()`, returns a range collapsed
 * at the insertion position.
 */
export declare function insertObject(model: Model, object: ModelElement, selectable?: ModelSelection | ModelDocumentSelection | null, options?: {
    findOptimalPosition?: 'auto' | 'before' | 'after';
    setSelection?: 'on' | 'after';
}): ModelRange;

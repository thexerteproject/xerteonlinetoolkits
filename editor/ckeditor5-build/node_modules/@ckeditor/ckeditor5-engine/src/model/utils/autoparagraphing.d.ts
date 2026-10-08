/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type ModelNode } from '../node.js';
import { type ModelPosition } from '../position.js';
import { type ModelSchema } from '../schema.js';
import { type ModelWriter } from '../writer.js';
/**
 * @module engine/model/utils/autoparagraphing
 */
/**
 * Fixes all empty roots.
 *
 * @internal
 * @param writer The model writer.
 * @returns `true` if any change has been applied, `false` otherwise.
 */
export declare function autoParagraphEmptyRoots(writer: ModelWriter): boolean;
/**
 * Checks if the given node wrapped with a paragraph would be accepted by the schema in the given position.
 *
 * @internal
 * @param position The position at which to check.
 * @param nodeOrType The child node or child type to check.
 * @param schema A schema instance used for element validation.
 */
export declare function isParagraphable(position: ModelPosition, nodeOrType: ModelNode | string, schema: ModelSchema): boolean;
/**
 * Inserts a new paragraph at the given position and returns a position inside that paragraph.
 *
 * @internal
 * @param position The position where a paragraph should be inserted.
 * @param writer The model writer.
 * @returns  Position inside the created paragraph.
 */
export declare function wrapInParagraph(position: ModelPosition, writer: ModelWriter): ModelPosition;

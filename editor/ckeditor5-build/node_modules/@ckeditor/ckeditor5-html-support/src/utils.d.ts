/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/utils
 */
import type { ModelDocumentSelection, ViewDowncastWriter, ModelItem, ModelRange, ViewElement, ModelWriter } from 'ckeditor5/src/engine.js';
export interface GHSViewAttributes {
    attributes?: Record<string, unknown>;
    classes?: Array<string>;
    styles?: Record<string, string>;
}
/**
* Helper function for the downcast converter. Updates attributes on the given view element.
*
* @param writer The view writer.
* @param oldViewAttributes The previous GHS attribute value.
* @param newViewAttributes The current GHS attribute value.
* @param viewElement The view element to update.
* @internal
*/
export declare function updateViewAttributes(writer: ViewDowncastWriter, oldViewAttributes: GHSViewAttributes, newViewAttributes: GHSViewAttributes, viewElement: ViewElement): void;
/**
 * Helper function for the downcast converter. Sets attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 * @internal
 */
export declare function setViewAttributes(writer: ViewDowncastWriter, viewAttributes: GHSViewAttributes, viewElement: ViewElement): void;
/**
 * Helper function for the downcast converter. Removes attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 * @internal
 */
export declare function removeViewAttributes(writer: ViewDowncastWriter, viewAttributes: GHSViewAttributes, viewElement: ViewElement): void;
/**
* Merges view element attribute objects.
*
* @internal
*/
export declare function mergeViewElementAttributes(target: GHSViewAttributes, source: GHSViewAttributes): GHSViewAttributes;
type ModifyGhsAttributesCallback = (t: Map<string, unknown>) => void;
type ModifyGhsClassesCallback = (t: Set<string>) => void;
type ModifyGhsStylesCallback = (t: Map<string, string>) => void;
/**
 * Updates a GHS attribute on a specified item.
 *
 * @param callback That receives a map as an argument and should modify it (add or remove entries).
 * @internal
 */
export declare function modifyGhsAttribute(writer: ModelWriter, item: ModelItem | ModelDocumentSelection, ghsAttributeName: string, subject: 'attributes', callback: ModifyGhsAttributesCallback): void;
/**
 * Updates a GHS attribute on a specified item.
 *
 * @param callback That receives a set as an argument and should modify it (add or remove entries).
 * @internal
 */
export declare function modifyGhsAttribute(writer: ModelWriter, item: ModelItem | ModelDocumentSelection, ghsAttributeName: string, subject: 'classes', callback: ModifyGhsClassesCallback): void;
/**
 * Updates a GHS attribute on a specified item.
 * @param callback That receives a map as an argument and should modify it (add or remove entries).
 */
export declare function modifyGhsAttribute(writer: ModelWriter, item: ModelItem | ModelDocumentSelection, ghsAttributeName: string, subject: 'styles', callback: ModifyGhsStylesCallback): void;
/**
 * Strips the `styles`, and `classes` keys from the GHS attribute value on the given item.
 *
 * @internal
 */
export declare function removeFormatting(ghsAttributeName: string, itemRange: ModelRange, writer: ModelWriter): void;
/**
 * Transforms passed string to PascalCase format. Examples:
 * * `div` => `Div`
 * * `h1` => `H1`
 * * `table` => `Table`
 *
 * @internal
 */
export declare function toPascalCase(data: string): string;
/**
 * Returns the attribute name of the model element that holds raw HTML attributes.
 *
 * @internal
 */
export declare function getHtmlAttributeName(viewElementName: string): string;
export {};

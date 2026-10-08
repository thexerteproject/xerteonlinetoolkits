/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/converters/tableproperties
 */
import type { Editor } from 'ckeditor5/src/core.js';
import type { Conversion, UpcastConversionData, ViewElement, Consumables } from 'ckeditor5/src/engine.js';
/**
 * Conversion helper for upcasting attributes using normalized styles.
 *
 * @param options.modelAttribute The attribute to set.
 * @param options.styleName The style name to convert.
 * @param options.attributeName The HTML attribute name to convert.
 * @param options.attributeType The HTML attribute type for value normalization.
 * @param options.viewElement The view element name that should be converted.
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 * @param options.shouldUpcast The function which returns `true` if style should be upcasted from this element.
 * @internal
 */
export declare function upcastStyleToAttribute(conversion: Conversion, options: {
    modelAttribute: string;
    styleName: string;
    attributeName?: string;
    attributeType?: 'length' | 'color';
    viewElement: string | RegExp;
    defaultValue: string;
    reduceBoxSides?: boolean;
    shouldUpcast?: (viewElement: ViewElement) => boolean;
}): void;
/**
 * The style values for border styles.
 *
 * @internal
 */
export interface StyleValues {
    color: string;
    style: string;
    width: string;
}
/**
 * Conversion helper for upcasting border styles for view elements.
 *
 * @param editor The editor instance.
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `borderColor` value.
 * @param defaultBorder.style The default `borderStyle` value.
 * @param defaultBorder.width The default `borderWidth` value.
 * @internal
 */
export declare function upcastBorderStyles(editor: Editor, viewElementName: string, modelAttributes: StyleValues, defaultBorder: StyleValues): void;
/**
 * Conversion helper for downcasting an attribute to a style.
 *
 * @internal
 */
export declare function downcastAttributeToStyle(conversion: Conversion, options: {
    modelElement: string;
    modelAttribute: string;
    styleName: string;
}): void;
/**
 * Conversion helper for downcasting attributes from the model table to a view table (not to `<figure>`).
 *
 * @internal
 */
export declare function downcastTableAttribute(conversion: Conversion, options: {
    modelAttribute: string;
    styleName: string;
}): void;
/**
 * Returns the default value for table or table cell property adjusted for layout tables.
 *
 * @internal
 */
export declare function getDefaultValueAdjusted(defaultValue: string, layoutTableDefault: string, data: UpcastConversionData<ViewElement>): string;
/**
 * Default table alignment options.
 */
export declare const DEFAULT_TABLE_ALIGNMENT_OPTIONS: {
    left: {
        className: string;
    };
    center: {
        className: string;
    };
    right: {
        className: string;
    };
    blockLeft: {
        className: string;
    };
    blockRight: {
        className: string;
    };
};
/**
 * Configuration for upcasting table alignment from view to model.
 */
export declare const upcastTableAlignmentConfig: Array<UpcastTableAlignmentConfig>;
export declare const downcastTableAlignmentConfig: Record<TableAlignmentValues, {
    align: string | undefined;
    style: string;
    className: string;
}>;
type UpcastTableAlignmentConfig = {
    view: {
        name: RegExp | string;
        styles?: Record<string, RegExp | string>;
        attributes?: Record<string, RegExp | string>;
        key?: string;
        value?: RegExp | string;
    };
    getAlign: ((viewElement: ViewElement) => string | undefined) | (() => string);
    getConsumables: (viewElement: ViewElement) => Consumables;
};
export type TableAlignmentValues = 'left' | 'center' | 'right' | 'blockLeft' | 'blockRight';
export {};

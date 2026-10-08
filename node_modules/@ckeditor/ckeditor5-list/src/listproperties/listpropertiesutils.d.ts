/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listproperties/listpropertiesutils
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * A set of helpers related to document lists.
 */
export declare class ListPropertiesUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ListPropertiesUtils";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * Gets all the style types supported by given list type.
     */
    getAllSupportedStyleTypes(): Array<string>;
    /**
     * Checks whether the given list-style-type is supported by numbered or bulleted list.
     */
    getListTypeFromListStyleType(listStyleType: string): 'bulleted' | 'numbered' | null;
    /**
     * Converts `type` attribute of `<ul>` or `<ol>` elements to `list-style-type` equivalent.
     */
    getListStyleTypeFromTypeAttribute(value: string): string | null;
    /**
     * Converts `list-style-type` style to `type` attribute of `<ul>` or `<ol>` elements.
     */
    getTypeAttributeFromListStyleType(value: string): string | null;
}

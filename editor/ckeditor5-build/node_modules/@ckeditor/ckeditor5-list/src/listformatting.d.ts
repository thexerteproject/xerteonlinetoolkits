/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listformatting
 */
import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { ListItemBoldIntegration } from './listformatting/listitemboldintegration.js';
import { ListItemItalicIntegration } from './listformatting/listitemitalicintegration.js';
import { ListItemFontSizeIntegration } from './listformatting/listitemfontsizeintegration.js';
import { ListItemFontColorIntegration } from './listformatting/listitemfontcolorintegration.js';
import { ListItemFontFamilyIntegration } from './listformatting/listitemfontfamilyintegration.js';
import '../theme/listformatting.css';
/**
 * The list formatting plugin.
 *
 * It enables integration with formatting plugins to style the list marker.
 * The list marker is styled based on the consistent formatting applied to the content of the list item.
 *
 * The list of supported formatting plugins includes:
 * * Font color.
 * * Font size.
 * * Font family.
 * * Bold.
 * * Italic.
 */
export declare class ListFormatting extends Plugin {
    /**
     * The list of loaded formatting.
     */
    private readonly _loadedFormatting;
    /**
     * @inheritDoc
     */
    static get pluginName(): "ListFormatting";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ListItemBoldIntegration, typeof ListItemItalicIntegration, typeof ListItemFontSizeIntegration, typeof ListItemFontColorIntegration, typeof ListItemFontFamilyIntegration];
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Registers a postfixer that ensures that the list item formatting attribute is consistent with the formatting
     * applied to the content of the list item.
     */
    private _registerPostfixerForListItemFormatting;
    /**
     * Registers an integration between a default attribute (e.g., `fontFamily`) and a new attribute
     * intended specifically for list item elements (e.g., `listItemFontFamily`).
     *
     * These attributes are later used by the postfixer logic to determine whether to add the new attribute
     * to the list item element, based on whether there is a consistent default formatting attribute
     * applied within its content.
     */
    registerFormatAttribute(formatAttribute: string, listItemFormatAttribute: string): void;
    /**
     * Returns true if the given model attribute name is a supported inline formatting attribute.
     */
    private _isInlineOrSelectionFormatting;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/listformatting/listitemfontsizeintegration
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ListEditing } from '../list/listediting.js';
/**
 * The list item font size integration plugin.
 */
export declare class ListItemFontSizeIntegration extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ListItemFontSizeIntegration";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ListEditing];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
}

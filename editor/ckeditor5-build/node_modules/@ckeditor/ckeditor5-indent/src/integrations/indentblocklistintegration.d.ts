/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * This integration enables using block indentation feature with lists.
 */
export declare class IndentBlockListIntegration extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "IndentBlockListIntegration";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * Setups conversion for list block indent using offset indents.
     */
    private _setupConversionUsingOffsetForListBlock;
    /**
     * Setups conversion for list item block indent using offset indents.
     */
    private _setupConversionUsingOffsetForListItemBlock;
    /**
     * Setups conversion for list block indent using classes.
     */
    private _setupConversionUsingClassesForListBlock;
    /**
     * Setups conversion for list item block indent using classes.
     */
    private _setupConversionUsingClassesForListItemBlock;
}

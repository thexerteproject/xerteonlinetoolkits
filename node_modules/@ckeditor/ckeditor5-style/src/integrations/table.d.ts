/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/integrations/table
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { StyleUtils } from '../styleutils.js';
export declare class TableStyleSupport extends Plugin {
    private _tableUtils;
    private _styleUtils;
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableStyleSupport";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof StyleUtils];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Checks if this plugin's custom logic should be applied for defintion-block pair.
     *
     * @param definition Style definition that is being considered.
     * @param block Block element to check if should be styled.
     * @returns True if the defintion-block pair meet the plugin criteria, false otherwise.
     */
    private _isApplicable;
    /**
     * Checks if the style definition should be applied to selected block.
     *
     * @param definition Style definition that is being considered.
     * @param block Block element to check if should be styled.
     * @returns True if the block should be style with the style description, false otherwise.
     */
    private _isStyleEnabledForBlock;
    /**
     * Gets all blocks that the style should be applied to.
     *
     * @param definition Style definition that is being considered.
     * @param block A block element from selection.
     * @returns An array with the block that was passed as an argument if meets the criteria, null otherwise.
     */
    private _getAffectedBlocks;
}

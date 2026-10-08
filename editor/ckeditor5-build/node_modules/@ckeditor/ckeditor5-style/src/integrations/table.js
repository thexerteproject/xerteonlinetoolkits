/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/integrations/table
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { StyleUtils } from '../styleutils.js';
export class TableStyleSupport extends Plugin {
    _tableUtils;
    _styleUtils;
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'TableStyleSupport';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get requires() {
        return [StyleUtils];
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        if (!editor.plugins.has('TableEditing')) {
            return;
        }
        this._styleUtils = editor.plugins.get(StyleUtils);
        this._tableUtils = this.editor.plugins.get('TableUtils');
        this.listenTo(this._styleUtils, 'isStyleEnabledForBlock', (evt, [definition, block]) => {
            if (this._isApplicable(definition, block)) {
                evt.return = this._isStyleEnabledForBlock(definition, block);
                evt.stop();
            }
        }, { priority: 'high' });
        this.listenTo(this._styleUtils, 'getAffectedBlocks', (evt, [definition, block]) => {
            if (this._isApplicable(definition, block)) {
                evt.return = this._getAffectedBlocks(definition, block);
                evt.stop();
            }
        }, { priority: 'high' });
        this.listenTo(this._styleUtils, 'configureGHSDataFilter', (evt, [{ block }]) => {
            const ghsDataFilter = this.editor.plugins.get('DataFilter');
            ghsDataFilter.loadAllowedConfig(block
                .filter(definition => definition.element == 'figcaption')
                .map(definition => ({ name: 'caption', classes: definition.classes })));
        });
    }
    /**
     * Checks if this plugin's custom logic should be applied for defintion-block pair.
     *
     * @param definition Style definition that is being considered.
     * @param block Block element to check if should be styled.
     * @returns True if the defintion-block pair meet the plugin criteria, false otherwise.
     */
    _isApplicable(definition, block) {
        if (['td', 'th'].includes(definition.element)) {
            return block.name == 'tableCell';
        }
        if (['thead', 'tbody'].includes(definition.element)) {
            return block.name == 'table';
        }
        return false;
    }
    /**
     * Checks if the style definition should be applied to selected block.
     *
     * @param definition Style definition that is being considered.
     * @param block Block element to check if should be styled.
     * @returns True if the block should be style with the style description, false otherwise.
     */
    _isStyleEnabledForBlock(definition, block) {
        if (['td', 'th'].includes(definition.element)) {
            const location = this._tableUtils.getCellLocation(block);
            const tableRow = block.parent;
            const table = tableRow.parent;
            const headingRows = table.getAttribute('headingRows') || 0;
            const headingColumns = table.getAttribute('headingColumns') || 0;
            const isHeadingCell = location.row < headingRows || location.column < headingColumns;
            if (definition.element == 'th') {
                return isHeadingCell;
            }
            else {
                return !isHeadingCell;
            }
        }
        if (['thead', 'tbody'].includes(definition.element)) {
            const headingRows = block.getAttribute('headingRows') || 0;
            if (definition.element == 'thead') {
                return headingRows > 0;
            }
            else {
                return headingRows < this._tableUtils.getRows(block);
            }
        }
        /* istanbul ignore next -- @preserve */
        return false;
    }
    /**
     * Gets all blocks that the style should be applied to.
     *
     * @param definition Style definition that is being considered.
     * @param block A block element from selection.
     * @returns An array with the block that was passed as an argument if meets the criteria, null otherwise.
     */
    _getAffectedBlocks(definition, block) {
        if (!this._isStyleEnabledForBlock(definition, block)) {
            return null;
        }
        return [block];
    }
}

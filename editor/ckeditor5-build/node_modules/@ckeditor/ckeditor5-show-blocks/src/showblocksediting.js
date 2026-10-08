/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module show-blocks/showblocksediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ShowBlocksCommand } from './showblockscommand.js';
/**
 * The show blocks editing plugin.
 */
export class ShowBlocksEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'ShowBlocksEditing';
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
    init() {
        const { editor } = this;
        editor.commands.add('showBlocks', new ShowBlocksCommand(editor));
    }
}

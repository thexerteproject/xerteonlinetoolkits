/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command } from 'ckeditor5/src/core.js';
import { isFirstBlockOfListItem, isListItemBlock, sortBlocks, splitListItemBefore } from './utils/model.js';
/**
 * The document list split command that splits the list item at the selection.
 *
 * It is used by the {@link module:list/list~List list feature}.
 */
export class ListSplitCommand extends Command {
    /**
     * Whether list item should be split before or after the selected block.
     */
    _direction;
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param direction Whether list item should be split before or after the selected block.
     */
    constructor(editor, direction) {
        super(editor);
        this._direction = direction;
    }
    /**
     * @inheritDoc
     */
    refresh() {
        this.isEnabled = this._checkEnabled();
    }
    /**
     * Splits the list item at the selection.
     *
     * @fires execute
     * @fires afterExecute
     */
    execute() {
        const editor = this.editor;
        editor.model.change(writer => {
            const changedBlocks = splitListItemBefore(this._getStartBlock(), writer);
            this._fireAfterExecute(changedBlocks);
        });
    }
    /**
     * Fires the `afterExecute` event.
     *
     * @param changedBlocks The changed list elements.
     */
    _fireAfterExecute(changedBlocks) {
        this.fire('afterExecute', sortBlocks(new Set(changedBlocks)));
    }
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @returns Whether the command should be enabled.
     */
    _checkEnabled() {
        const selection = this.editor.model.document.selection;
        const block = this._getStartBlock();
        return selection.isCollapsed &&
            isListItemBlock(block) &&
            !isFirstBlockOfListItem(block);
    }
    /**
     * Returns the model element that is the main focus of the command (according to the current selection and command direction).
     */
    _getStartBlock() {
        const doc = this.editor.model.document;
        const positionParent = doc.selection.getFirstPosition().parent;
        return (this._direction == 'before' ? positionParent : positionParent.nextSibling);
    }
}

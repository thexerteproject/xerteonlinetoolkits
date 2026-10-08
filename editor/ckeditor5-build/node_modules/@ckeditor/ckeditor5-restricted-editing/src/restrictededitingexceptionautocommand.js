/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/restrictededitingexceptionautocommand
 */
import { Command } from 'ckeditor5/src/core.js';
import { count } from 'ckeditor5/src/utils.js';
/**
 * The command that toggles exceptions from the restricted editing on text or on blocks.
 */
export class RestrictedEditingExceptionAutoCommand extends Command {
    /**
     * The inline exception command.
     */
    _inlineCommand;
    /**
     * The block exception command.
     */
    _blockCommand;
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        this._inlineCommand = editor.commands.get('restrictedEditingException');
        this._blockCommand = editor.commands.get('restrictedEditingExceptionBlock');
    }
    /**
     * @inheritDoc
     */
    refresh() {
        this.value = this._inlineCommand.value || this._blockCommand.value;
        this.isEnabled = this._inlineCommand.isEnabled || this._blockCommand.isEnabled;
    }
    /**
     * @inheritDoc
     */
    execute() {
        const editor = this.editor;
        // Selection is inside an inline exception.
        if (this._inlineCommand.value) {
            editor.execute('restrictedEditingException');
        }
        // Selection inside a block exception.
        else if (this._blockCommand.value) {
            editor.execute('restrictedEditingExceptionBlock');
        }
        // Selection allows only for inline exception.
        else if (this._inlineCommand.isEnabled && !this._blockCommand.isEnabled) {
            editor.execute('restrictedEditingException');
        }
        // Selection allows only for block exception.
        else if (this._blockCommand.isEnabled && !this._inlineCommand.isEnabled) {
            editor.execute('restrictedEditingExceptionBlock');
        }
        // Check selection to pick exception type.
        else {
            const schema = editor.model.schema;
            const selection = editor.model.document.selection;
            const selectedElement = selection.getSelectedElement();
            if (selection.isCollapsed ||
                selectedElement && schema.isObject(selectedElement) && schema.isBlock(selectedElement) ||
                count(selection.getSelectedBlocks()) > 1) {
                editor.execute('restrictedEditingExceptionBlock');
            }
            else {
                editor.execute('restrictedEditingException');
            }
        }
    }
}

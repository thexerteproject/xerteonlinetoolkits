/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
/**
 * The delete and backspace feature. Handles keys such as <kbd>Delete</kbd> and <kbd>Backspace</kbd>, other
 * keystrokes and user actions that result in deleting content in the editor.
 */
export declare class Delete extends Plugin {
    /**
     * Whether pressing backspace should trigger undo action
     */
    private _undoOnBackspace;
    /**
     * @inheritDoc
     */
    static get pluginName(): "Delete";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * If the next user action after calling this method is pressing backspace, it would undo the last change.
     *
     * Requires {@link module:undo/undoediting~UndoEditing} plugin. If not loaded, does nothing.
     */
    requestUndoOnBackspace(): void;
}

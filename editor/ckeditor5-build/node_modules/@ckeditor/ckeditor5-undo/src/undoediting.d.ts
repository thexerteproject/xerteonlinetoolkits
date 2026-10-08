/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module undo/undoediting
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
/**
 * The undo engine feature.
 *
 * It introduces the `'undo'` and `'redo'` commands to the editor.
 */
export declare class UndoEditing extends Plugin {
    /**
     * The command that manages the undo {@link module:engine/model/batch~Batch batches} stack (history).
     * Created and registered during the {@link #init feature initialization}.
     */
    private _undoCommand;
    /**
     * The command that manages the redo {@link module:engine/model/batch~Batch batches} stack (history).
     * Created and registered during the {@link #init feature initialization}.
     */
    private _redoCommand;
    /**
     * Keeps track of which batches were registered in undo.
     */
    private _batchRegistry;
    /**
     * @inheritDoc
     */
    static get pluginName(): "UndoEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}

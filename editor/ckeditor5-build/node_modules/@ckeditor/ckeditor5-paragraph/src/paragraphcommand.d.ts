/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paragraph/paragraphcommand
 */
import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import type { ModelSelection, ModelDocumentSelection } from '@ckeditor/ckeditor5-engine';
/**
 * The paragraph command.
 */
export declare class ParagraphCommand extends Command {
    constructor(editor: Editor);
    /**
     * The value of the command. Indicates whether the selection start is placed in a paragraph.
     *
     * @readonly
     * @observable
     */
    value: boolean;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command. All the blocks (see {@link module:engine/model/schema~ModelSchema}) in the selection
     * will be turned to paragraphs.
     *
     * @fires execute
     * @param options Options for the executed command.
     * @param options.selection The selection that the command should be applied to. By default,
     * if not provided, the command is applied to the {@link module:engine/model/document~ModelDocument#selection}.
     */
    execute(options?: {
        selection?: ModelSelection | ModelDocumentSelection;
    }): void;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paragraph/insertparagraphcommand
 */
import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import type { ModelPosition } from '@ckeditor/ckeditor5-engine';
/**
 * The insert paragraph command. It inserts a new paragraph at a specific
 * {@link module:engine/model/position~ModelPosition document position}.
 *
 * ```ts
 * // Insert a new paragraph before an element in the document.
 * editor.execute( 'insertParagraph', {
 *   position: editor.model.createPositionBefore( element )
 * } );
 * ```
 *
 * If a paragraph is disallowed in the context of the specific position, the command
 * will attempt to split position ancestors to find a place where it is possible
 * to insert a paragraph.
 *
 * **Note**: This command moves the selection to the inserted paragraph.
 */
export declare class InsertParagraphCommand extends Command {
    constructor(editor: Editor);
    /**
     * Executes the command.
     *
     * @param options Options for the executed command.
     * @param options.position The model position at which the new paragraph will be inserted.
     * @param options.attributes Attributes keys and values to set on a inserted paragraph.
     * @fires execute
     */
    execute(options: {
        position: ModelPosition;
        attributes?: Record<string, unknown>;
    }): ModelPosition | null;
    /**
     * Returns the best position to insert a new paragraph.
     */
    private _findPositionToInsertParagraph;
}

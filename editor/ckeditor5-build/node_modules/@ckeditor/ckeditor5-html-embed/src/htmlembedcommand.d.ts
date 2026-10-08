/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The insert HTML embed element command.
 *
 * The command is registered by {@link module:html-embed/htmlembedediting~HtmlEmbedEditing} as `'htmlEmbed'`.
 *
 * To insert an empty HTML embed element at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'htmlEmbed' );
 * ```
 *
 * You can specify the initial content of a new HTML embed in the argument:
 *
 * ```ts
 * editor.execute( 'htmlEmbed', '<b>Initial content.</b>' );
 * ```
 *
 * To update the content of the HTML embed, select it in the model and pass the content in the argument:
 *
 * ```ts
 * editor.execute( 'htmlEmbed', '<b>New content of an existing embed.</b>' );
 * ```
 */
export declare class HtmlEmbedCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command, which either:
     *
     * * creates and inserts a new HTML embed element if none was selected,
     * * updates the content of the HTML embed if one was selected.
     *
     * @fires execute
     * @param value When passed, the value (content) will be set on a new embed or a selected one.
     */
    execute(value?: string): void;
}

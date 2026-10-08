/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
* @module table/tablecaption/toggletablecaptioncommand
*/
import { Command } from 'ckeditor5/src/core.js';
/**
 * The toggle table caption command.
 *
 * This command is registered by {@link module:table/tablecaption/tablecaptionediting~TableCaptionEditing} as the
 * `'toggleTableCaption'` editor command.
 *
 * Executing this command:
 *
 * * either adds or removes the table caption of a selected table (depending on whether the caption is present or not),
 * * removes the table caption if the selection is anchored in one.
 *
 * ```ts
 * // Toggle the presence of the caption.
 * editor.execute( 'toggleTableCaption' );
 * ```
 *
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using
 * the `focusCaptionOnShow` option:
 *
 * ```ts
 * editor.execute( 'toggleTableCaption', { focusCaptionOnShow: true } );
 * ```
 */
export declare class ToggleTableCaptionCommand extends Command {
    value: boolean;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * ```ts
     * editor.execute( 'toggleTableCaption' );
     * ```
     *
     * @param options Options for the executed command.
     * @param options.focusCaptionOnShow When true and the caption shows up, the selection will be moved into it straight away.
     * @fires execute
     */
    execute({ focusCaptionOnShow }?: {
        focusCaptionOnShow?: boolean;
    }): void;
    /**
     * Shows the table caption. Also:
     *
     * * it attempts to restore the caption content from the `TableCaptionEditing` caption registry,
     * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
     *
     * @param focusCaptionOnShow Default focus behavior when showing the caption.
     */
    private _showTableCaption;
    /**
     * Hides the caption of a selected table (or an table caption the selection is anchored to).
     *
     * The content of the caption is stored in the `TableCaptionEditing` caption registry to make this
     * a reversible action.
     */
    private _hideTableCaption;
}

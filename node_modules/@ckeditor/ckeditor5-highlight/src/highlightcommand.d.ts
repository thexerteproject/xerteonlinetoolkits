/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module highlight/highlightcommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The highlight command. It is used by the {@link module:highlight/highlightediting~HighlightEditing highlight feature}
 * to apply the text highlighting.
 *
 * ```ts
 * editor.execute( 'highlight', { value: 'greenMarker' } );
 * ```
 *
 * **Note**: Executing the command without a value removes the attribute from the model. If the selection is collapsed
 * inside a text with the highlight attribute, the command will remove the attribute from the entire range
 * of that text.
 */
export declare class HighlightCommand extends Command {
    /**
     * A value indicating whether the command is active. If the selection has some highlight attribute,
     * it corresponds to the value of that attribute.
     *
     * @observable
     * @readonly
     */
    value: string | undefined;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @param options Options for the executed command.
     * @param options.value The value to apply.
     *
     * @fires execute
     */
    execute(options?: {
        value?: string | null;
    }): void;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module emoji/emojicommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * Command that shows the emoji user interface.
 */
export declare class EmojiCommand extends Command {
    /**
     * Updates the command's {@link #isEnabled} based on the current selection.
     */
    refresh(): void;
    /**
     * Opens emoji user interface for the current document selection.
     *
     * @fires execute
     * @param [searchValue=''] A default query used to filer the grid when opening the UI.
     */
    execute(searchValue?: string): void;
}

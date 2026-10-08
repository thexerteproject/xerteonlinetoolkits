/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The insert bookmark command.
 *
 * The command is registered by {@link module:bookmark/bookmarkediting~BookmarkEditing} as `'insertBookmark'`.
 *
 * To insert a bookmark element at place where is the current collapsed selection or where is the beginning of document selection,
 * execute the command passing the bookmark id as a parameter:
 *
 * ```ts
 * editor.execute( 'insertBookmark', { bookmarkId: 'foo_bar' } );
 * ```
 */
export declare class InsertBookmarkCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options Command options.
     * @param options.bookmarkId The value of the `bookmarkId` attribute.
     */
    execute(options: {
        bookmarkId: string;
    }): void;
    /**
     * Returns the position where the bookmark can be inserted. And if it is not possible to insert a bookmark,
     * check if it is possible to insert a paragraph.
     */
    private _getPositionToInsertBookmark;
}

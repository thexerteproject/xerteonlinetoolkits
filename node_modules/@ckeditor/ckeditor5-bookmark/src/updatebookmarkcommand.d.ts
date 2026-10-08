/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module bookmark/updatebookmarkcommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The update bookmark command.
 *
 * The command is registered by {@link module:bookmark/bookmarkediting~BookmarkEditing} as `'updateBookmark'`.
 *
 * To update the `bookmarkId` of current selected bookmark element, execute the command passing the bookmark id as a parameter:
 *
 * ```ts
 * editor.execute( 'updateBookmark', { bookmarkId: 'newId' } );
 * ```
 */
export declare class UpdateBookmarkCommand extends Command {
    /**
     * The value of the `'bookmarkId'` attribute.
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
     * @fires execute
     * @param options Command options.
     * @param options.bookmarkId The new value of the `bookmarkId` attribute to set.
     */
    execute(options: {
        bookmarkId: string;
    }): void;
}

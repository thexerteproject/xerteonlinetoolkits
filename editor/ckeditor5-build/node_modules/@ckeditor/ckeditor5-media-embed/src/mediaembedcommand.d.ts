/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The insert media command.
 *
 * The command is registered by the {@link module:media-embed/mediaembedediting~MediaEmbedEditing} as `'mediaEmbed'`.
 *
 * To insert media at the current selection, execute the command and specify the URL:
 *
 * ```ts
 * editor.execute( 'mediaEmbed', 'http://url.to.the/media' );
 * ```
 */
export declare class MediaEmbedCommand extends Command {
    /**
     * Media url.
     */
    value: string | undefined;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command, which either:
     *
     * * updates the URL of the selected media,
     * * inserts the new media into the editor and puts the selection around it.
     *
     * @fires execute
     * @param url The URL of the media.
     */
    execute(url: string): void;
}

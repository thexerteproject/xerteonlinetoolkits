/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { ModelWriter, ModelElement } from 'ckeditor5/src/engine.js';
/**
 * @module image/image/replaceimagesourcecommand
 */
/**
 * Replace image source command.
 *
 * Changes image source to the one provided. Can be executed as follows:
 *
 * ```ts
 * editor.execute( 'replaceImageSource', { source: 'http://url.to.the/image' } );
 * ```
 */
export declare class ReplaceImageSourceCommand extends Command {
    value: string | null;
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options Options for the executed command.
     * @param options.source The image source to replace.
     */
    execute(options: {
        source: string;
    }): void;
    /**
     * Cleanup image attributes that are not relevant to the new source.
     *
     * Removed attributes are: 'srcset', 'sizes', 'sources', 'width', 'height', 'alt'.
     *
     * This method is decorated, to allow custom cleanup logic.
     * For example, to remove 'myImageId' attribute after 'src' has changed:
     *
     * ```ts
     * replaceImageSourceCommand.on( 'cleanupImage', ( eventInfo, [ writer, image ] ) => {
     * 	writer.removeAttribute( 'myImageId', image );
     * } );
     * ```
     */
    cleanupImage(writer: ModelWriter, image: ModelElement): void;
}

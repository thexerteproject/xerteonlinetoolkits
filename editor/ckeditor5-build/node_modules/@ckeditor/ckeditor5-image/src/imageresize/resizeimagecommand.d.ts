/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageresize/resizeimagecommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The resize image command. Currently, it only supports the width attribute.
 */
export declare class ResizeImageCommand extends Command {
    /**
     * Desired image width and height.
     */
    value: undefined | null | {
        width: string | null;
        height: string | null;
    };
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command.
     *
     * ```ts
     * // Sets the width to 50%:
     * editor.execute( 'resizeImage', { width: '50%' } );
     *
     * // Removes the width attribute:
     * editor.execute( 'resizeImage', { width: null } );
     * ```
     *
     * @param options
     * @param options.width The new width of the image.
     * @fires execute
     */
    execute(options: {
        width: string | null;
    }): void;
}

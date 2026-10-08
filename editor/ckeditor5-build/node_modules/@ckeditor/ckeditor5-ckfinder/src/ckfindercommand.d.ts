/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ckfinder/ckfindercommand
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
/**
 * The CKFinder command. It is used by the {@link module:ckfinder/ckfinderediting~CKFinderEditing CKFinder editing feature}
 * to open the CKFinder file manager to insert an image or a link to a file into the editor content.
 *
 * ```ts
 * editor.execute( 'ckfinder' );
 * ```
 *
 * **Note:** This command uses other features to perform tasks:
 * - To insert images the {@link module:image/image/insertimagecommand~InsertImageCommand 'insertImage'} command
 * from the {@link module:image/image~Image Image feature}.
 * - To insert links to files the {@link module:link/linkcommand~LinkCommand 'link'} command
 * from the {@link module:link/link~Link Link feature}.
 */
export declare class CKFinderCommand extends Command {
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * @inheritDoc
     */
    execute(): void;
}

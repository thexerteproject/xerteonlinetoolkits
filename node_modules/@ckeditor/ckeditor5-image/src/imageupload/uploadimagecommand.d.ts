/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { type ArrayOrItem } from 'ckeditor5/src/utils.js';
/**
 * @module image/imageupload/uploadimagecommand
 */
/**
 * The upload image command.
 *
 * The command is registered by the {@link module:image/imageupload/imageuploadediting~ImageUploadEditing} plugin as `uploadImage`
 * and it is also available via aliased `imageUpload` name.
 *
 * In order to upload an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionRange} algorithm),
 * execute the command and pass the native image file instance:
 *
 * ```ts
 * this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
 * 	// Assuming that only images were pasted:
 * 	const images = Array.from( data.dataTransfer.files );
 *
 * 	// Upload the first image:
 * 	editor.execute( 'uploadImage', { file: images[ 0 ] } );
 * } );
 * ```
 *
 * It is also possible to insert multiple images at once:
 *
 * ```ts
 * editor.execute( 'uploadImage', {
 * 	file: [
 * 		file1,
 * 		file2
 * 	]
 * } );
 * ```
 */
export declare class UploadImageCommand extends Command {
    /**
     * The command property: `false` if there is no permission on image upload, otherwise `true`.
     *
     * @observable
     * @internal
     */
    isAccessAllowed: boolean;
    /**
     * Creates an instance of the `imageUlpoad` command. When executed, the command upload one of
     * the currently selected image from computer.
     *
     * @param editor The editor instance.
     */
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
     * @param options.file The image file or an array of image files to upload.
     */
    execute(options: {
        file: ArrayOrItem<File>;
    }): void;
    /**
     * Handles uploading single file.
     */
    private _uploadImage;
}

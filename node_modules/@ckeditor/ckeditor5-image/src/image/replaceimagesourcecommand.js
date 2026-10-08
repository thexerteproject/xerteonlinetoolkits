/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command } from 'ckeditor5/src/core.js';
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
export class ReplaceImageSourceCommand extends Command {
    constructor(editor) {
        super(editor);
        this.decorate('cleanupImage');
    }
    /**
     * @inheritDoc
     */
    refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const element = this.editor.model.document.selection.getSelectedElement();
        this.isEnabled = imageUtils.isImage(element);
        this.value = this.isEnabled ? element.getAttribute('src') : null;
    }
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options Options for the executed command.
     * @param options.source The image source to replace.
     */
    execute(options) {
        const image = this.editor.model.document.selection.getSelectedElement();
        const imageUtils = this.editor.plugins.get('ImageUtils');
        this.editor.model.change(writer => {
            writer.setAttribute('src', options.source, image);
            this.cleanupImage(writer, image);
            imageUtils.setImageNaturalSizeAttributes(image);
        });
    }
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
    cleanupImage(writer, image) {
        writer.removeAttribute('srcset', image);
        writer.removeAttribute('sizes', image);
        /**
         * In case responsive images some attributes should be cleaned up.
         * Check: https://github.com/ckeditor/ckeditor5/issues/15093
         */
        writer.removeAttribute('sources', image);
        writer.removeAttribute('width', image);
        writer.removeAttribute('height', image);
        writer.removeAttribute('alt', image);
    }
}

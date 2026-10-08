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
export class ResizeImageCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const element = imageUtils.getClosestSelectedImageElement(editor.model.document.selection);
        this.isEnabled = !!element;
        if (!element || !element.hasAttribute('resizedWidth')) {
            this.value = null;
        }
        else {
            this.value = {
                width: element.getAttribute('resizedWidth'),
                height: null
            };
        }
    }
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
    execute(options) {
        const editor = this.editor;
        const model = editor.model;
        const imageUtils = editor.plugins.get('ImageUtils');
        const imageElement = imageUtils.getClosestSelectedImageElement(model.document.selection);
        this.value = {
            width: options.width,
            height: null
        };
        if (imageElement) {
            model.change(writer => {
                writer.setAttribute('resizedWidth', options.width, imageElement);
                writer.removeAttribute('resizedHeight', imageElement);
                imageUtils.setImageNaturalSizeAttributes(imageElement);
            });
        }
    }
}

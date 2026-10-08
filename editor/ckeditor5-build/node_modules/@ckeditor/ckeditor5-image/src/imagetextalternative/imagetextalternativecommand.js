/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imagetextalternative/imagetextalternativecommand
 */
import { Command } from 'ckeditor5/src/core.js';
/**
 * The image text alternative command. It is used to change the `alt` attribute of `<imageBlock>` and `<imageInline>` model elements.
 */
export class ImageTextAlternativeCommand extends Command {
    /**
     * @inheritDoc
     */
    refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const element = imageUtils.getClosestSelectedImageElement(this.editor.model.document.selection);
        this.isEnabled = !!element;
        if (this.isEnabled && element.hasAttribute('alt')) {
            this.value = element.getAttribute('alt');
        }
        else {
            this.value = false;
        }
    }
    /**
     * Executes the command.
     *
     * @fires execute
     * @param options
     * @param options.newValue The new value of the `alt` attribute to set.
     */
    execute(options) {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const model = editor.model;
        const imageElement = imageUtils.getClosestSelectedImageElement(model.document.selection);
        model.change(writer => {
            writer.setAttribute('alt', options.newValue, imageElement);
        });
    }
}

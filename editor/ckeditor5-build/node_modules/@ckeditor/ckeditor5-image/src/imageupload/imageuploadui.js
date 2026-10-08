/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageupload/imageuploadui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { FileDialogButtonView, MenuBarMenuListItemFileDialogButtonView } from 'ckeditor5/src/ui.js';
import { IconImageUpload } from 'ckeditor5/src/icons.js';
import { createImageTypeRegExp } from './utils.js';
/**
 * The image upload button plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature} documentation.
 *
 * Adds the `'uploadImage'` button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageUpload` button as an alias for backward compatibility.
 *
 * Adds the `'menuBar:uploadImage'` menu button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component, which are the default components
 * through which image upload is available.
 */
export class ImageUploadUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'ImageUploadUI';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        // Setup `uploadImage` button and add `imageUpload` button as an alias for backward compatibility.
        editor.ui.componentFactory.add('uploadImage', () => this._createToolbarButton());
        editor.ui.componentFactory.add('imageUpload', () => this._createToolbarButton());
        editor.ui.componentFactory.add('menuBar:uploadImage', () => this._createMenuBarButton('standalone'));
        if (editor.plugins.has('ImageInsertUI')) {
            editor.plugins.get('ImageInsertUI').registerIntegration({
                name: 'upload',
                observable: () => editor.commands.get('uploadImage'),
                buttonViewCreator: () => this._createToolbarButton(),
                formViewCreator: () => this._createDropdownButton(),
                menuBarButtonViewCreator: isOnly => this._createMenuBarButton(isOnly ? 'insertOnly' : 'insertNested')
            });
        }
    }
    /**
     * Creates the base for various kinds of the button component provided by this feature.
     */
    _createButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const command = editor.commands.get('uploadImage');
        const imageTypes = editor.config.get('image.upload.types');
        const imageTypesRegExp = createImageTypeRegExp(imageTypes);
        const view = new ButtonClass(editor.locale);
        const t = locale.t;
        view.set({
            acceptedType: imageTypes.map(type => `image/${type}`).join(','),
            allowMultipleFiles: true,
            label: t('Upload from computer'),
            icon: IconImageUpload
        });
        view.bind('isEnabled').to(command);
        view.on('done', (evt, files) => {
            const imagesToUpload = Array.from(files).filter(file => imageTypesRegExp.test(file.type));
            if (imagesToUpload.length) {
                editor.execute('uploadImage', { file: imagesToUpload });
                editor.editing.view.focus();
            }
        });
        return view;
    }
    /**
     * Creates a simple toolbar button, with an icon and a tooltip.
     */
    _createToolbarButton() {
        const t = this.editor.locale.t;
        const imageInsertUI = this.editor.plugins.get('ImageInsertUI');
        const uploadImageCommand = this.editor.commands.get('uploadImage');
        const button = this._createButton(FileDialogButtonView);
        button.tooltip = true;
        button.bind('label').to(imageInsertUI, 'isImageSelected', uploadImageCommand, 'isAccessAllowed', (isImageSelected, isAccessAllowed) => {
            if (!isAccessAllowed) {
                return t('You have no image upload permissions.');
            }
            return isImageSelected ? t('Replace image from computer') : t('Upload image from computer');
        });
        return button;
    }
    /**
     * Creates a button for the dropdown view, with an icon, text and no tooltip.
     */
    _createDropdownButton() {
        const t = this.editor.locale.t;
        const imageInsertUI = this.editor.plugins.get('ImageInsertUI');
        const button = this._createButton(FileDialogButtonView);
        button.withText = true;
        button.bind('label').to(imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ? t('Replace from computer') : t('Upload from computer'));
        button.on('execute', () => {
            imageInsertUI.dropdownView.isOpen = false;
        });
        return button;
    }
    /**
     * Creates a button for the menu bar.
     */
    _createMenuBarButton(type) {
        const t = this.editor.locale.t;
        const button = this._createButton(MenuBarMenuListItemFileDialogButtonView);
        button.withText = true;
        switch (type) {
            case 'standalone':
                button.label = t('Image from computer');
                break;
            case 'insertOnly':
                button.label = t('Image');
                break;
            case 'insertNested':
                button.label = t('From computer');
                break;
        }
        return button;
    }
}

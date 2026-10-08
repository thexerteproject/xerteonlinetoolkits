/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageinsert/imageinsertviaurlui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, Dialog, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { IconImageUrl } from 'ckeditor5/src/icons.js';
import { ImageInsertUI } from './imageinsertui.js';
import { ImageInsertUrlView } from './ui/imageinserturlview.js';
/**
 * The image insert via URL plugin (UI part).
 *
 * The plugin introduces two UI components to the {@link module:ui/componentfactory~ComponentFactory UI component factory}:
 *
 * * the `'insertImageViaUrl'` toolbar button,
 * * the `'menuBar:insertImageViaUrl'` menu bar component.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component, which are default components
 * through which inserting image via URL is available.
 */
export class ImageInsertViaUrlUI extends Plugin {
    _imageInsertUI;
    _formView;
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'ImageInsertViaUrlUI';
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
    static get requires() {
        return [ImageInsertUI, Dialog];
    }
    init() {
        this.editor.ui.componentFactory.add('insertImageViaUrl', () => this._createToolbarButton());
        this.editor.ui.componentFactory.add('menuBar:insertImageViaUrl', () => this._createMenuBarButton('standalone'));
    }
    /**
     * @inheritDoc
     */
    afterInit() {
        this._imageInsertUI = this.editor.plugins.get('ImageInsertUI');
        this._imageInsertUI.registerIntegration({
            name: 'url',
            observable: () => this.editor.commands.get('insertImage'),
            buttonViewCreator: () => this._createToolbarButton(),
            formViewCreator: () => this._createDropdownButton(),
            menuBarButtonViewCreator: isOnly => this._createMenuBarButton(isOnly ? 'insertOnly' : 'insertNested')
        });
    }
    /**
     * Creates the base for various kinds of the button component provided by this feature.
     */
    _createInsertUrlButton(ButtonClass) {
        const button = new ButtonClass(this.editor.locale);
        button.icon = IconImageUrl;
        button.on('execute', () => {
            this._showModal();
        });
        return button;
    }
    /**
     * Creates a simple toolbar button, with an icon and a tooltip.
     */
    _createToolbarButton() {
        const t = this.editor.locale.t;
        const button = this._createInsertUrlButton(ButtonView);
        button.tooltip = true;
        button.bind('label').to(this._imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ? t('Update image URL') : t('Insert image via URL'));
        return button;
    }
    /**
     * Creates a button for the dropdown view, with an icon, text and no tooltip.
     */
    _createDropdownButton() {
        const t = this.editor.locale.t;
        const button = this._createInsertUrlButton(ButtonView);
        button.withText = true;
        button.bind('label').to(this._imageInsertUI, 'isImageSelected', isImageSelected => isImageSelected ? t('Update image URL') : t('Insert via URL'));
        return button;
    }
    /**
     * Creates a button for the menu bar.
     */
    _createMenuBarButton(type) {
        const t = this.editor.locale.t;
        const button = this._createInsertUrlButton(MenuBarMenuListItemButtonView);
        button.withText = true;
        switch (type) {
            case 'standalone':
                button.label = t('Image via URL');
                break;
            case 'insertOnly':
                button.label = t('Image');
                break;
            case 'insertNested':
                button.label = t('Via URL');
                break;
        }
        return button;
    }
    /**
     * Creates the form view used to submit the image URL.
     */
    _createInsertUrlView() {
        const editor = this.editor;
        const locale = editor.locale;
        const replaceImageSourceCommand = editor.commands.get('replaceImageSource');
        const insertImageCommand = editor.commands.get('insertImage');
        const imageInsertUrlView = new ImageInsertUrlView(locale);
        imageInsertUrlView.bind('isImageSelected').to(this._imageInsertUI);
        imageInsertUrlView.bind('isEnabled').toMany([insertImageCommand, replaceImageSourceCommand], 'isEnabled', (...isEnabled) => (isEnabled.some(isCommandEnabled => isCommandEnabled)));
        return imageInsertUrlView;
    }
    /**
     * Shows the insert image via URL form view in a modal.
     */
    _showModal() {
        const editor = this.editor;
        const locale = editor.locale;
        const t = locale.t;
        const dialog = editor.plugins.get('Dialog');
        if (!this._formView) {
            this._formView = this._createInsertUrlView();
            this._formView.on('submit', () => this._handleSave());
        }
        const replaceImageSourceCommand = editor.commands.get('replaceImageSource');
        this._formView.imageURLInputValue = replaceImageSourceCommand.value || '';
        dialog.show({
            id: 'insertImageViaUrl',
            title: t('Image via URL'),
            isModal: true,
            content: this._formView,
            actionButtons: [
                {
                    label: t('Cancel'),
                    withText: true,
                    onExecute: () => dialog.hide()
                },
                {
                    label: this._imageInsertUI.isImageSelected ? t('Save') : t('Insert'),
                    class: 'ck-button-action',
                    withText: true,
                    onExecute: () => this._handleSave()
                }
            ]
        });
    }
    /**
     * Executes appropriate command depending on selection and form value.
     */
    _handleSave() {
        const replaceImageSourceCommand = this.editor.commands.get('replaceImageSource');
        // If an image element is currently selected, we want to replace its source attribute (instead of inserting a new image).
        // We detect if an image is selected by checking `replaceImageSource` command state.
        if (replaceImageSourceCommand.isEnabled) {
            this.editor.execute('replaceImageSource', { source: this._formView.imageURLInputValue });
        }
        else {
            this.editor.execute('insertImage', { source: this._formView.imageURLInputValue });
        }
        this.editor.plugins.get('Dialog').hide();
    }
}

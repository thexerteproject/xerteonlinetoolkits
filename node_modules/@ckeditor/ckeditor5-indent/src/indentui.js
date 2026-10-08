/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/indentui
 */
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { IconIndent, IconOutdent } from 'ckeditor5/src/icons.js';
/**
 * The indent UI feature.
 *
 * This plugin registers the `'indent'` and `'outdent'` buttons.
 *
 * **Note**: In order for the commands to work, at least one of the compatible features is required. Read more in
 * the {@link module:indent/indent~Indent indent feature} API documentation.
 */
export class IndentUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'IndentUI';
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
        const locale = editor.locale;
        const t = editor.t;
        const localizedIndentIcon = locale.uiLanguageDirection == 'ltr' ? IconIndent : IconOutdent;
        const localizedOutdentIcon = locale.uiLanguageDirection == 'ltr' ? IconOutdent : IconIndent;
        this._defineButton('indent', t('Increase indent'), localizedIndentIcon);
        this._defineButton('outdent', t('Decrease indent'), localizedOutdentIcon);
    }
    /**
     * Defines UI buttons for both toolbar and menu bar.
     */
    _defineButton(commandName, label, icon) {
        const editor = this.editor;
        editor.ui.componentFactory.add(commandName, () => {
            const buttonView = this._createButton(ButtonView, commandName, label, icon);
            buttonView.set({
                tooltip: true
            });
            return buttonView;
        });
        editor.ui.componentFactory.add('menuBar:' + commandName, () => {
            return this._createButton(MenuBarMenuListItemButtonView, commandName, label, icon);
        });
    }
    /**
     * Creates a button to use either in toolbar or in menu bar.
     */
    _createButton(ButtonClass, commandName, label, icon) {
        const editor = this.editor;
        const command = editor.commands.get(commandName);
        const view = new ButtonClass(editor.locale);
        view.set({
            label,
            icon
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        // Execute the command.
        this.listenTo(view, 'execute', () => {
            editor.execute(commandName);
            editor.editing.view.focus();
        });
        return view;
    }
}

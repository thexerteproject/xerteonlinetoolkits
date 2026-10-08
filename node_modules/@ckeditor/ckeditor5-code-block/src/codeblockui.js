/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module code-block/codeblockui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Collection } from 'ckeditor5/src/utils.js';
import { UIModel, SplitButtonView, createDropdown, addListToDropdown, MenuBarMenuListItemButtonView, MenuBarMenuListView, MenuBarMenuView, MenuBarMenuListItemView } from 'ckeditor5/src/ui.js';
import { IconCodeBlock } from 'ckeditor5/src/icons.js';
import { getNormalizedAndLocalizedLanguageDefinitions } from './utils.js';
import '../theme/codeblock.css';
/**
 * The code block UI plugin.
 *
 * Introduces the `'codeBlock'` dropdown.
 */
export class CodeBlockUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CodeBlockUI';
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
        const t = editor.t;
        const componentFactory = editor.ui.componentFactory;
        const normalizedLanguageDefs = getNormalizedAndLocalizedLanguageDefinitions(editor);
        const itemDefinitions = this._getLanguageListItemDefinitions(normalizedLanguageDefs);
        const command = editor.commands.get('codeBlock');
        componentFactory.add('codeBlock', locale => {
            const dropdownView = createDropdown(locale, SplitButtonView);
            const splitButtonView = dropdownView.buttonView;
            const accessibleLabel = t('Insert code block');
            splitButtonView.set({
                label: accessibleLabel,
                tooltip: true,
                icon: IconCodeBlock,
                isToggleable: true
            });
            splitButtonView.bind('isOn').to(command, 'value', value => !!value);
            splitButtonView.on('execute', () => {
                editor.execute('codeBlock', {
                    usePreviousLanguageChoice: true
                });
                editor.editing.view.focus();
            });
            dropdownView.on('execute', evt => {
                editor.execute('codeBlock', {
                    language: evt.source._codeBlockLanguage,
                    forceValue: true
                });
                editor.editing.view.focus();
            });
            dropdownView.class = 'ck-code-block-dropdown';
            dropdownView.bind('isEnabled').to(command);
            addListToDropdown(dropdownView, itemDefinitions, {
                role: 'menu',
                ariaLabel: accessibleLabel
            });
            return dropdownView;
        });
        componentFactory.add('menuBar:codeBlock', locale => {
            const menuView = new MenuBarMenuView(locale);
            menuView.buttonView.set({
                role: 'menuitem',
                label: t('Code block'),
                icon: IconCodeBlock
            });
            menuView.bind('isEnabled').to(command);
            const listView = new MenuBarMenuListView(locale);
            listView.set({
                ariaLabel: t('Insert code block')
            });
            for (const definition of itemDefinitions) {
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.bind(...Object.keys(definition.model)).to(definition.model);
                buttonView.set({
                    isToggleable: true,
                    role: 'menuitemcheckbox'
                });
                buttonView.delegate('execute').to(menuView);
                buttonView.on('execute', () => {
                    editor.execute('codeBlock', {
                        language: definition.model._codeBlockLanguage,
                        forceValue: command.value == definition.model._codeBlockLanguage ? false : true
                    });
                    editor.editing.view.focus();
                });
                listItemView.children.add(buttonView);
                listView.items.add(listItemView);
            }
            menuView.panelView.children.add(listView);
            return menuView;
        });
    }
    /**
     * A helper returning a collection of the `codeBlock` dropdown items representing languages
     * available for the user to choose from.
     */
    _getLanguageListItemDefinitions(normalizedLanguageDefs) {
        const editor = this.editor;
        const command = editor.commands.get('codeBlock');
        const itemDefinitions = new Collection();
        for (const languageDef of normalizedLanguageDefs) {
            const definition = {
                type: 'button',
                model: new UIModel({
                    _codeBlockLanguage: languageDef.language,
                    label: languageDef.label,
                    role: 'menuitemradio',
                    withText: true
                })
            };
            definition.model.bind('isOn').to(command, 'value', value => {
                return value === definition.model._codeBlockLanguage;
            });
            itemDefinitions.add(definition);
        }
        return itemDefinitions;
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module restricted-editing/restrictededitingmodeui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { IconContentLock } from 'ckeditor5/src/icons.js';
import { UIModel, createDropdown, addListToDropdown, MenuBarMenuListItemButtonView, MenuBarMenuView, MenuBarMenuListView, MenuBarMenuListItemView } from 'ckeditor5/src/ui.js';
import { Collection } from 'ckeditor5/src/utils.js';
/**
 * The restricted editing mode UI feature.
 *
 * It introduces the `'restrictedEditing'` dropdown that offers tools to navigate between exceptions across
 * the document.
 */
export class RestrictedEditingModeUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'RestrictedEditingModeUI';
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
        editor.ui.componentFactory.add('restrictedEditing', locale => {
            const dropdownView = createDropdown(locale);
            const listItems = new Collection();
            this._getButtonDefinitions().forEach(({ commandName, label, keystroke }) => {
                listItems.add(this._getButtonDefinition(commandName, label, keystroke));
            });
            addListToDropdown(dropdownView, listItems, {
                role: 'menu'
            });
            dropdownView.buttonView.set({
                label: t('Navigate editable regions'),
                icon: IconContentLock,
                tooltip: true,
                isEnabled: true,
                isOn: false
            });
            this.listenTo(dropdownView, 'execute', evt => {
                const { _commandName } = evt.source;
                editor.execute(_commandName);
                editor.editing.view.focus();
            });
            return dropdownView;
        });
        editor.ui.componentFactory.add('menuBar:restrictedEditing', locale => {
            const menuView = new MenuBarMenuView(locale);
            const listView = new MenuBarMenuListView(locale);
            listView.set({
                ariaLabel: t('Navigate editable regions'),
                role: 'menu'
            });
            menuView.buttonView.set({
                label: t('Navigate editable regions'),
                icon: IconContentLock
            });
            menuView.panelView.children.add(listView);
            this._getButtonDefinitions().forEach(({ commandName, label, keystroke }) => {
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = this._createMenuBarButton(label, commandName, keystroke);
                buttonView.delegate('execute').to(menuView);
                listItemView.children.add(buttonView);
                listView.items.add(listItemView);
            });
            return menuView;
        });
    }
    /**
     * Creates a button for restricted editing command to use in menu bar.
     */
    _createMenuBarButton(label, commandName, keystroke) {
        const editor = this.editor;
        const command = editor.commands.get(commandName);
        const view = new MenuBarMenuListItemButtonView(editor.locale);
        view.set({
            label,
            keystroke,
            isEnabled: true,
            isOn: false
        });
        view.bind('isEnabled').to(command);
        // Execute the command.
        this.listenTo(view, 'execute', () => {
            editor.execute(commandName);
            editor.editing.view.focus();
        });
        return view;
    }
    /**
     * Returns a definition of the navigation button to be used in the dropdown.
     *
     * @param commandName The name of the command that the button represents.
     * @param label The translated label of the button.
     * @param keystroke The button keystroke.
     */
    _getButtonDefinition(commandName, label, keystroke) {
        const editor = this.editor;
        const command = editor.commands.get(commandName);
        const definition = {
            type: 'button',
            model: new UIModel({
                label,
                withText: true,
                keystroke,
                withKeystroke: true,
                role: 'menuitem',
                _commandName: commandName
            })
        };
        definition.model.bind('isEnabled').to(command, 'isEnabled');
        return definition;
    }
    /**
     * Returns definitions for UI buttons.
     *
     * @internal
     */
    _getButtonDefinitions() {
        const t = this.editor.locale.t;
        return [
            { commandName: 'goToPreviousRestrictedEditingException', label: t('Previous editable region'), keystroke: 'Shift+Tab' },
            { commandName: 'goToNextRestrictedEditingException', label: t('Next editable region'), keystroke: 'Tab' }
        ];
    }
}

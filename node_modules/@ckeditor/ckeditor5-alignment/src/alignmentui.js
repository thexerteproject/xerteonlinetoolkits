/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module alignment/alignmentui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, createDropdown, addToolbarToDropdown, MenuBarMenuListItemView, MenuBarMenuListItemButtonView, MenuBarMenuView, MenuBarMenuListView } from 'ckeditor5/src/ui.js';
import { IconAlignCenter, IconAlignJustify, IconAlignLeft, IconAlignRight } from 'ckeditor5/src/icons.js';
import { isSupported, normalizeAlignmentOptions } from './utils.js';
const iconsMap = /* #__PURE__ */ (() => new Map([
    ['left', IconAlignLeft],
    ['right', IconAlignRight],
    ['center', IconAlignCenter],
    ['justify', IconAlignJustify]
]))();
/**
 * The default alignment UI plugin.
 *
 * It introduces the `'alignment:left'`, `'alignment:right'`, `'alignment:center'` and `'alignment:justify'` buttons
 * and the `'alignment'` dropdown.
 */
export class AlignmentUI extends Plugin {
    /**
     * Returns the localized option titles provided by the plugin.
     *
     * The following localized titles corresponding with
     * {@link module:alignment/alignmentconfig~AlignmentConfig#options} are available:
     *
     * * `'left'`,
     * * `'right'`,
     * * `'center'`,
     * * `'justify'`.
     *
     * @readonly
     */
    get localizedOptionTitles() {
        const t = this.editor.t;
        return {
            'left': t('Align left'),
            'right': t('Align right'),
            'center': t('Align center'),
            'justify': t('Justify')
        };
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'AlignmentUI';
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
        const options = normalizeAlignmentOptions(editor.config.get('alignment.options'));
        options
            .map(option => option.name)
            .filter(isSupported)
            .forEach(option => this._addButton(option));
        this._addToolbarDropdown(options);
        this._addMenuBarMenu(options);
    }
    /**
     * Helper method for initializing the button and linking it with an appropriate command.
     *
     * @param option The name of the alignment option for which the button is added.
     */
    _addButton(option) {
        const editor = this.editor;
        editor.ui.componentFactory.add(`alignment:${option}`, locale => this._createButton(locale, option));
    }
    /**
     * Helper method for creating the button view element.
     *
     * @param locale Editor locale.
     * @param option The name of the alignment option for which the button is added.
     * @param buttonAttrs Optional parameters passed to button view instance.
     */
    _createButton(locale, option, buttonAttrs = {}) {
        const editor = this.editor;
        const command = editor.commands.get('alignment');
        const buttonView = new ButtonView(locale);
        buttonView.set({
            label: this.localizedOptionTitles[option],
            icon: iconsMap.get(option),
            tooltip: true,
            isToggleable: true,
            ...buttonAttrs
        });
        // Bind button model to command.
        buttonView.bind('isEnabled').to(command);
        buttonView.bind('isOn').to(command, 'value', value => value === option);
        // Execute command.
        this.listenTo(buttonView, 'execute', () => {
            editor.execute('alignment', { value: option });
            editor.editing.view.focus();
        });
        return buttonView;
    }
    /**
     * Helper method for initializing the toolnar dropdown and linking it with an appropriate command.
     *
     * @param options The name of the alignment option for which the button is added.
     */
    _addToolbarDropdown(options) {
        const editor = this.editor;
        const factory = editor.ui.componentFactory;
        factory.add('alignment', locale => {
            const dropdownView = createDropdown(locale);
            const tooltipPosition = locale.uiLanguageDirection === 'rtl' ? 'w' : 'e';
            const t = locale.t;
            // Add existing alignment buttons to dropdown's toolbar.
            addToolbarToDropdown(dropdownView, () => options.map(option => this._createButton(locale, option.name, { tooltipPosition })), {
                enableActiveItemFocusOnDropdownOpen: true,
                isVertical: true,
                ariaLabel: t('Text alignment toolbar')
            });
            // Configure dropdown properties an behavior.
            dropdownView.buttonView.set({
                label: t('Text alignment'),
                tooltip: true
            });
            dropdownView.extendTemplate({
                attributes: {
                    class: 'ck-alignment-dropdown'
                }
            });
            // The default icon depends on the direction of the content.
            const defaultIcon = locale.contentLanguageDirection === 'rtl' ? iconsMap.get('right') : iconsMap.get('left');
            const command = editor.commands.get('alignment');
            // Change icon to reflect current selection's alignment.
            dropdownView.buttonView.bind('icon').to(command, 'value', value => iconsMap.get(value) || defaultIcon);
            // Enable button if any of the buttons is enabled.
            dropdownView.bind('isEnabled').to(command, 'isEnabled');
            // Focus the editable after executing the command.
            // Overrides a default behaviour where the focus is moved to the dropdown button (#12125).
            this.listenTo(dropdownView, 'execute', () => {
                editor.editing.view.focus();
            });
            return dropdownView;
        });
    }
    /**
     * Creates a menu for all alignment options to use either in menu bar.
     *
     * @param options Normalized alignment options from config.
     */
    _addMenuBarMenu(options) {
        const editor = this.editor;
        editor.ui.componentFactory.add('menuBar:alignment', locale => {
            const command = editor.commands.get('alignment');
            const t = locale.t;
            const menuView = new MenuBarMenuView(locale);
            const listView = new MenuBarMenuListView(locale);
            menuView.bind('isEnabled').to(command);
            listView.set({
                ariaLabel: t('Text alignment'),
                role: 'menu'
            });
            menuView.buttonView.set({
                label: t('Text alignment')
            });
            for (const option of options) {
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.delegate('execute').to(menuView);
                buttonView.set({
                    label: this.localizedOptionTitles[option.name],
                    icon: iconsMap.get(option.name),
                    role: 'menuitemcheckbox',
                    isToggleable: true
                });
                buttonView.on('execute', () => {
                    editor.execute('alignment', { value: option.name });
                    editor.editing.view.focus();
                });
                buttonView.bind('isOn').to(command, 'value', value => value === option.name);
                buttonView.bind('isEnabled').to(command, 'isEnabled');
                listItemView.children.add(buttonView);
                listView.items.add(listItemView);
            }
            menuView.panelView.children.add(listView);
            return menuView;
        });
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module font/fontsize/fontsizeui
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { IconFontSize } from 'ckeditor5/src/icons.js';
import { UIModel, createDropdown, addListToDropdown, MenuBarMenuView, MenuBarMenuListView, MenuBarMenuListItemView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { Collection } from 'ckeditor5/src/utils.js';
import { normalizeOptions } from './utils.js';
import { FONT_SIZE } from '../utils.js';
import '../../theme/fontsize.css';
/**
 * The font size UI plugin. It introduces the `'fontSize'` dropdown.
 */
export class FontSizeUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'FontSizeUI';
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
        const options = this._getLocalizedOptions();
        const command = editor.commands.get(FONT_SIZE);
        const accessibleLabel = t('Font Size');
        const listOptions = _prepareListOptions(options, command);
        // Register UI component.
        editor.ui.componentFactory.add(FONT_SIZE, locale => {
            const dropdownView = createDropdown(locale);
            addListToDropdown(dropdownView, listOptions, {
                role: 'menu',
                ariaLabel: accessibleLabel
            });
            // Create dropdown model.
            dropdownView.buttonView.set({
                label: accessibleLabel,
                icon: IconFontSize,
                tooltip: true
            });
            dropdownView.extendTemplate({
                attributes: {
                    class: [
                        'ck-font-size-dropdown'
                    ]
                }
            });
            dropdownView.bind('isEnabled').to(command);
            // Execute command when an item from the dropdown is selected.
            this.listenTo(dropdownView, 'execute', evt => {
                editor.execute(evt.source.commandName, { value: evt.source.commandParam });
                editor.editing.view.focus();
            });
            return dropdownView;
        });
        editor.ui.componentFactory.add(`menuBar:${FONT_SIZE}`, locale => {
            const menuView = new MenuBarMenuView(locale);
            menuView.buttonView.set({
                label: accessibleLabel,
                icon: IconFontSize
            });
            menuView.bind('isEnabled').to(command);
            const listView = new MenuBarMenuListView(locale);
            for (const definition of listOptions) {
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.set({
                    role: 'menuitemradio',
                    isToggleable: true
                });
                buttonView.bind(...Object.keys(definition.model)).to(definition.model);
                buttonView.delegate('execute').to(menuView);
                buttonView.on('execute', () => {
                    editor.execute(definition.model.commandName, {
                        value: definition.model.commandParam
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
     * Returns options as defined in `config.fontSize.options` but processed to account for
     * editor localization, i.e. to display {@link module:font/fontconfig~FontSizeOption}
     * in the correct language.
     *
     * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
     * when the user configuration is defined because the editor does not exist yet.
     */
    _getLocalizedOptions() {
        const editor = this.editor;
        const t = editor.t;
        const localizedTitles = {
            Default: t('Default'),
            Tiny: t('Tiny'),
            Small: t('Small'),
            Big: t('Big'),
            Huge: t('Huge')
        };
        const options = normalizeOptions((editor.config.get(FONT_SIZE)).options);
        return options.map(option => {
            const title = localizedTitles[option.title];
            if (title && title != option.title) {
                // Clone the option to avoid altering the original `namedPresets` from `./utils.js`.
                option = Object.assign({}, option, { title });
            }
            return option;
        });
    }
}
/**
 * Prepares FontSize dropdown items.
 */
function _prepareListOptions(options, command) {
    const itemDefinitions = new Collection();
    for (const option of options) {
        const def = {
            type: 'button',
            model: new UIModel({
                commandName: FONT_SIZE,
                commandParam: option.model,
                label: option.title,
                class: 'ck-fontsize-option',
                role: 'menuitemradio',
                withText: true
            })
        };
        if (option.view && typeof option.view !== 'string') {
            if (option.view.styles) {
                def.model.set('labelStyle', `font-size:${option.view.styles['font-size']}`);
            }
            if (option.view.classes) {
                def.model.set('class', `${def.model.class} ${option.view.classes}`);
            }
        }
        def.model.bind('isOn').to(command, 'value', value => value === option.model);
        // Add the option to the collection.
        itemDefinitions.add(def);
    }
    return itemDefinitions;
}

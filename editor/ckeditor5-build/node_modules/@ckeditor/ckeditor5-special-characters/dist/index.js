/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { Typing } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { IconSpecialCharacters } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { View, addKeyboardHandlingForGrid, ButtonView, FocusCycler, LabeledFieldView, createLabeledDropdown, UIModel, addListToDropdown, Dialog, MenuBarMenuListItemButtonView, DialogViewPosition } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { FocusTracker, KeystrokeHandler, global, Collection, CKEditorError } from '@ckeditor/ckeditor5-utils/dist/index.js';

/**
 * A grid of character tiles. It allows browsing special characters and selecting the character to
 * be inserted into the content.
 *
 * @internal
 */ class CharacterGridView extends View {
    /**
	 * A collection of the child tile views. Each tile represents a particular character.
	 */ tiles;
    /**
	 * Tracks information about the DOM focus in the grid.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * Creates an instance of a character grid containing tiles representing special characters.
	 *
	 * @param locale The localization services instance.
	 */ constructor(locale){
        super(locale);
        this.tiles = this.createCollection();
        this.setTemplate({
            tag: 'div',
            children: [
                {
                    tag: 'div',
                    attributes: {
                        class: [
                            'ck',
                            'ck-character-grid__tiles'
                        ]
                    },
                    children: this.tiles
                }
            ],
            attributes: {
                class: [
                    'ck',
                    'ck-character-grid'
                ]
            }
        });
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        addKeyboardHandlingForGrid({
            keystrokeHandler: this.keystrokes,
            focusTracker: this.focusTracker,
            gridItems: this.tiles,
            numberOfColumns: ()=>global.window.getComputedStyle(this.element.firstChild) // Responsive .ck-character-grid__tiles
                .getPropertyValue('grid-template-columns').split(' ').length,
            uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
        });
    }
    /**
	 * Creates a new tile for the grid.
	 *
	 * @param character A human-readable character displayed as the label (e.g. "ε").
	 * @param name The name of the character (e.g. "greek small letter epsilon").
	 */ createTile(character, name) {
        const tile = new ButtonView(this.locale);
        tile.set({
            label: character,
            withText: true,
            class: 'ck-character-grid__tile'
        });
        // Labels are vital for the users to understand what character they're looking at.
        // For now we're using native title attribute for that, see #5817.
        tile.extendTemplate({
            attributes: {
                title: name
            },
            on: {
                mouseover: tile.bindTemplate.to('mouseover'),
                focus: tile.bindTemplate.to('focus')
            }
        });
        tile.on('mouseover', ()=>{
            this.fire('tileHover', {
                name,
                character
            });
        });
        tile.on('focus', ()=>{
            this.fire('tileFocus', {
                name,
                character
            });
        });
        tile.on('execute', ()=>{
            this.fire('execute', {
                name,
                character
            });
        });
        return tile;
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        for (const item of this.tiles){
            this.focusTracker.add(item.element);
        }
        this.tiles.on('change', (eventInfo, { added, removed })=>{
            if (added.length > 0) {
                for (const item of added){
                    this.focusTracker.add(item.element);
                }
            }
            if (removed.length > 0) {
                for (const item of removed){
                    this.focusTracker.remove(item.element);
                }
            }
        });
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the first focusable in {@link ~CharacterGridView#tiles}.
	 */ focus() {
        this.tiles.first.focus();
    }
}

/**
 * The view displaying detailed information about a special character glyph, e.g. upon
 * hovering it with a mouse.
 *
 * @internal
 */ class CharacterInfoView extends View {
    constructor(locale){
        super(locale);
        const bind = this.bindTemplate;
        this.set('character', null);
        this.set('name', null);
        this.bind('code').to(this, 'character', characterToUnicodeString);
        this.setTemplate({
            tag: 'div',
            children: [
                {
                    tag: 'span',
                    attributes: {
                        class: [
                            'ck-character-info__name'
                        ]
                    },
                    children: [
                        {
                            // Note: ZWSP to prevent vertical collapsing.
                            text: bind.to('name', (name)=>name ? name : '\u200B')
                        }
                    ]
                },
                {
                    tag: 'span',
                    attributes: {
                        class: [
                            'ck-character-info__code'
                        ]
                    },
                    children: [
                        {
                            text: bind.to('code')
                        }
                    ]
                }
            ],
            attributes: {
                class: [
                    'ck',
                    'ck-character-info'
                ]
            }
        });
    }
}
/**
 * Converts a character into a "Unicode string", for instance:
 *
 * "$" -> "U+0024"
 *
 * Returns an empty string when the character is `null`.
 */ function characterToUnicodeString(character) {
    if (character === null) {
        return '';
    }
    const hexCode = character.codePointAt(0).toString(16);
    return 'U+' + ('0000' + hexCode).slice(-4);
}

/**
 * A view that glues pieces of the special characters dropdown panel together:
 *
 * * the navigation view (allows selecting the category),
 * * the grid view (displays characters as a grid),
 * * and the info view (displays detailed info about a specific character).
 *
 * @internal
 */ class SpecialCharactersView extends View {
    /**
	 * A collection of the focusable children of the view.
	 */ items;
    /**
	 * Tracks information about the DOM focus in the view.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * Helps cycling over focusable {@link #items} in the view.
	 */ _focusCycler;
    /**
	 * An instance of the `SpecialCharactersCategoriesView`.
	 */ categoriesView;
    /**
	 * An instance of the `CharacterGridView`.
	 */ gridView;
    /**
	 * An instance of the `CharacterInfoView`.
	 */ infoView;
    /**
	 * Creates an instance of the `SpecialCharactersView`.
	 */ constructor(locale, categoriesView, gridView, infoView){
        super(locale);
        this.categoriesView = categoriesView;
        this.gridView = gridView;
        this.infoView = infoView;
        this.items = this.createCollection();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this._focusCycler = new FocusCycler({
            focusables: this.items,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                focusPrevious: 'shift + tab',
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'div',
            children: [
                this.categoriesView,
                this.gridView,
                this.infoView
            ],
            attributes: {
                // Avoid focus loss when the user clicks the area of the grid that is not a button.
                // https://github.com/ckeditor/ckeditor5/pull/12319#issuecomment-1231779819
                tabindex: '-1'
            }
        });
        this.items.add(this.categoriesView);
        this.items.add(this.gridView);
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this.focusTracker.add(this.categoriesView.element);
        this.focusTracker.add(this.gridView.element);
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the first focusable in {@link #items}.
	 */ focus() {
        this._focusCycler.focusFirst();
    }
}

/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 *
 * @internal
 */ class SpecialCharactersCategoriesView extends View {
    _groupNames;
    _dropdownView;
    /**
	 * Creates an instance of the {@link module:special-characters/ui/specialcharacterscategoriesview~SpecialCharactersCategoriesView}
	 * class.
	 *
	 * @param locale The localization services instance.
	 * @param groupNames The names of the character groups.
	 */ constructor(locale, groupNames){
        super(locale);
        this.set('currentGroupName', Array.from(groupNames.entries())[0][0]);
        this._groupNames = groupNames;
        this._dropdownView = new LabeledFieldView(locale, createLabeledDropdown);
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-character-categories'
                ]
            },
            children: [
                this._dropdownView
            ]
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this._setupDropdown();
    }
    /**
	 * @inheritDoc
	 */ focus() {
        this._dropdownView.focus();
    }
    /**
	 * Creates dropdown item list, sets up bindings and fills properties.
	 */ _setupDropdown() {
        const items = new Collection();
        for (const [name, label] of this._groupNames){
            const item = {
                type: 'button',
                model: new UIModel({
                    name,
                    label,
                    role: 'menuitemradio',
                    withText: true
                })
            };
            item.model.bind('isOn').to(this, 'currentGroupName', (value)=>{
                return value === name;
            });
            items.add(item);
        }
        const t = this.locale.t;
        const accessibleLabel = t('Category');
        this._dropdownView.set({
            label: accessibleLabel,
            isEmpty: false
        });
        this._dropdownView.fieldView.panelPosition = this.locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw';
        this._dropdownView.fieldView.buttonView.set({
            withText: true,
            tooltip: accessibleLabel,
            ariaLabel: accessibleLabel,
            ariaLabelledBy: undefined,
            isOn: false
        });
        this._dropdownView.fieldView.buttonView.bind('label').to(this, 'currentGroupName', (value)=>this._groupNames.get(value));
        this._dropdownView.fieldView.on('execute', ({ source })=>{
            this.currentGroupName = source.name;
        });
        addListToDropdown(this._dropdownView.fieldView, items, {
            ariaLabel: accessibleLabel,
            role: 'menu'
        });
    }
}

const ALL_SPECIAL_CHARACTERS_GROUP = 'All';
/**
 * The special characters feature.
 *
 * Introduces the `'specialCharacters'` dropdown.
 */ class SpecialCharacters extends Plugin {
    /**
	 * Registered characters. A pair of a character name and its symbol.
	 */ _characters;
    /**
	 * Registered groups. Each group contains a displayed label and a collection with symbol names.
	 */ _groups;
    /**
	 * A label describing the "All" special characters category.
	 */ _allSpecialCharactersGroupLabel;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Typing,
            Dialog
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SpecialCharacters';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'SCH';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        const t = editor.t;
        this._characters = new Map();
        this._groups = new Map();
        this._allSpecialCharactersGroupLabel = t('All');
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        editor.ui.componentFactory.add('specialCharacters', ()=>{
            const button = this._createDialogButton(ButtonView);
            button.set({
                tooltip: true
            });
            return button;
        });
        editor.ui.componentFactory.add('menuBar:specialCharacters', ()=>{
            return this._createDialogButton(MenuBarMenuListItemButtonView);
        });
    }
    /**
	 * Adds a collection of special characters to the specified group. The title of a special character must be unique.
	 *
	 * **Note:** The "All" category name is reserved by the plugin and cannot be used as a new name for a special
	 * characters category.
	 */ addItems(groupName, items, options = {
        label: groupName
    }) {
        if (groupName === ALL_SPECIAL_CHARACTERS_GROUP) {
            /**
			 * The name "All" for a special category group cannot be used because it is a special category that displays all
			 * available special characters.
			 *
			 * @error special-character-invalid-group-name
			 */ throw new CKEditorError('special-character-invalid-group-name', null);
        }
        const group = this._getGroup(groupName, options.label);
        for (const item of items){
            group.items.add(item.title);
            this._characters.set(item.title, item.character);
        }
    }
    /**
	 * Returns special character groups in an order determined based on configuration and registration sequence.
	 */ getGroups() {
        const groups = Array.from(this._groups.keys());
        const order = this.editor.config.get('specialCharacters.order') || [];
        const invalidGroup = order.find((item)=>!groups.includes(item));
        if (invalidGroup) {
            /**
			 * One of the special character groups in the "specialCharacters.order" configuration doesn't exist.
			 *
			 * @error special-character-invalid-order-group-name
			 */ throw new CKEditorError('special-character-invalid-order-group-name', null, {
                invalidGroup
            });
        }
        return new Set([
            ...order,
            ...groups
        ]);
    }
    /**
	 * Returns a collection of special characters symbol names (titles).
	 */ getCharactersForGroup(groupName) {
        if (groupName === ALL_SPECIAL_CHARACTERS_GROUP) {
            return new Set(this._characters.keys());
        }
        const group = this._groups.get(groupName);
        if (group) {
            return group.items;
        }
    }
    /**
	 * Returns the symbol of a special character for the specified name. If the special character could not be found, `undefined`
	 * is returned.
	 *
	 * @param title The title of a special character.
	 */ getCharacter(title) {
        return this._characters.get(title);
    }
    /**
	 * Returns a group of special characters. If the group with the specified name does not exist, it will be created.
	 *
	 * @param groupName The name of the group to create.
	 * @param label The label describing the new group.
	 */ _getGroup(groupName, label) {
        if (!this._groups.has(groupName)) {
            this._groups.set(groupName, {
                items: new Set(),
                label
            });
        }
        return this._groups.get(groupName);
    }
    /**
	 * Updates the symbol grid depending on the currently selected character group.
	 */ _updateGrid(currentGroupName, gridView) {
        // Updating the grid starts with removing all tiles belonging to the old group.
        gridView.tiles.clear();
        const characterTitles = this.getCharactersForGroup(currentGroupName);
        for (const title of characterTitles){
            const character = this.getCharacter(title);
            gridView.tiles.add(gridView.createTile(character, title));
        }
    }
    /**
	 * Initializes the dropdown, used for lazy loading.
	 *
	 * @returns An object with `categoriesView`, `gridView` and `infoView` properties, containing UI parts.
	 */ _createDropdownPanelContent(locale) {
        const groupEntries = Array.from(this.getGroups()).map((name)=>[
                name,
                this._groups.get(name).label
            ]);
        // The map contains a name of category (an identifier) and its label (a translational string).
        const specialCharsGroups = new Map([
            // Add a special group that shows all available special characters.
            [
                ALL_SPECIAL_CHARACTERS_GROUP,
                this._allSpecialCharactersGroupLabel
            ],
            ...groupEntries
        ]);
        const categoriesView = new SpecialCharactersCategoriesView(locale, specialCharsGroups);
        const gridView = new CharacterGridView(locale);
        const infoView = new CharacterInfoView(locale);
        gridView.on('tileHover', (evt, data)=>{
            infoView.set(data);
        });
        gridView.on('tileFocus', (evt, data)=>{
            infoView.set(data);
        });
        // Update the grid of special characters when a user changed the character group.
        categoriesView.on('change:currentGroupName', (evt, propertyName, newValue)=>{
            this._updateGrid(newValue, gridView);
        });
        // Set the initial content of the special characters grid.
        this._updateGrid(categoriesView.currentGroupName, gridView);
        return {
            categoriesView,
            gridView,
            infoView
        };
    }
    /**
	 * Creates a button for toolbar and menu bar that will show special characters dialog.
	 */ _createDialogButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const buttonView = new ButtonClass(editor.locale);
        const command = editor.commands.get('insertText');
        const t = locale.t;
        const dialogPlugin = this.editor.plugins.get('Dialog');
        buttonView.set({
            label: t('Special characters'),
            icon: IconSpecialCharacters,
            isToggleable: true
        });
        buttonView.bind('isOn').to(dialogPlugin, 'id', (id)=>id === 'specialCharacters');
        buttonView.bind('isEnabled').to(command, 'isEnabled');
        buttonView.on('execute', ()=>{
            if (dialogPlugin.id === 'specialCharacters') {
                dialogPlugin.hide();
                return;
            }
            this._showDialog();
        });
        return buttonView;
    }
    _showDialog() {
        const editor = this.editor;
        const dialog = editor.plugins.get('Dialog');
        const locale = editor.locale;
        const t = locale.t;
        const { categoriesView, gridView, infoView } = this._createDropdownPanelContent(locale);
        const content = new SpecialCharactersView(locale, categoriesView, gridView, infoView);
        gridView.on('execute', (evt, data)=>{
            editor.execute('insertText', {
                text: data.character
            });
        });
        dialog.show({
            id: 'specialCharacters',
            title: t('Special characters'),
            className: 'ck-special-characters',
            content,
            position: DialogViewPosition.EDITOR_TOP_SIDE
        });
    }
}

/**
 * A plugin that provides special characters for the "Arrows" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersArrows ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */ class SpecialCharactersArrows extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SpecialCharactersArrows';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = editor.t;
        const plugin = editor.plugins.get('SpecialCharacters');
        plugin.addItems('Arrows', [
            {
                title: t('leftwards simple arrow'),
                character: '←'
            },
            {
                title: t('rightwards simple arrow'),
                character: '→'
            },
            {
                title: t('upwards simple arrow'),
                character: '↑'
            },
            {
                title: t('downwards simple arrow'),
                character: '↓'
            },
            {
                title: t('leftwards double arrow'),
                character: '⇐'
            },
            {
                title: t('rightwards double arrow'),
                character: '⇒'
            },
            {
                title: t('upwards double arrow'),
                character: '⇑'
            },
            {
                title: t('downwards double arrow'),
                character: '⇓'
            },
            {
                title: t('leftwards dashed arrow'),
                character: '⇠'
            },
            {
                title: t('rightwards dashed arrow'),
                character: '⇢'
            },
            {
                title: t('upwards dashed arrow'),
                character: '⇡'
            },
            {
                title: t('downwards dashed arrow'),
                character: '⇣'
            },
            {
                title: t('leftwards arrow to bar'),
                character: '⇤'
            },
            {
                title: t('rightwards arrow to bar'),
                character: '⇥'
            },
            {
                title: t('upwards arrow to bar'),
                character: '⤒'
            },
            {
                title: t('downwards arrow to bar'),
                character: '⤓'
            },
            {
                title: t('up down arrow with base'),
                character: '↨'
            },
            {
                title: t('back with leftwards arrow above'),
                character: '🔙'
            },
            {
                title: t('end with leftwards arrow above'),
                character: '🔚'
            },
            {
                title: t('on with exclamation mark with left right arrow above'),
                character: '🔛'
            },
            {
                title: t('soon with rightwards arrow above'),
                character: '🔜'
            },
            {
                title: t('top with upwards arrow above'),
                character: '🔝'
            }
        ], {
            label: t('Arrows')
        });
    }
}

/**
 * A plugin that provides special characters for the "Text" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersText ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */ class SpecialCharactersText extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SpecialCharactersText';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = editor.t;
        const plugin = editor.plugins.get('SpecialCharacters');
        plugin.addItems('Text', [
            {
                character: '‹',
                title: t('Single left-pointing angle quotation mark')
            },
            {
                character: '›',
                title: t('Single right-pointing angle quotation mark')
            },
            {
                character: '«',
                title: t('Left-pointing double angle quotation mark')
            },
            {
                character: '»',
                title: t('Right-pointing double angle quotation mark')
            },
            {
                character: '‘',
                title: t('Left single quotation mark')
            },
            {
                character: '’',
                title: t('Right single quotation mark')
            },
            {
                character: '“',
                title: t('Left double quotation mark')
            },
            {
                character: '”',
                title: t('Right double quotation mark')
            },
            {
                character: '‚',
                title: t('Single low-9 quotation mark')
            },
            {
                character: '„',
                title: t('Double low-9 quotation mark')
            },
            {
                character: '¡',
                title: t('Inverted exclamation mark')
            },
            {
                character: '¿',
                title: t('Inverted question mark')
            },
            {
                character: '‥',
                title: t('Two dot leader')
            },
            {
                character: '…',
                title: t('Horizontal ellipsis')
            },
            {
                character: '‡',
                title: t('Double dagger')
            },
            {
                character: '‰',
                title: t('Per mille sign')
            },
            {
                character: '‱',
                title: t('Per ten thousand sign')
            },
            {
                character: '‼',
                title: t('Double exclamation mark')
            },
            {
                character: '⁈',
                title: t('Question exclamation mark')
            },
            {
                character: '⁉',
                title: t('Exclamation question mark')
            },
            {
                character: '⁇',
                title: t('Double question mark')
            },
            {
                character: '©',
                title: t('Copyright sign')
            },
            {
                character: '®',
                title: t('Registered sign')
            },
            {
                character: '™',
                title: t('Trade mark sign')
            },
            {
                character: '§',
                title: t('Section sign')
            },
            {
                character: '¶',
                title: t('Paragraph sign')
            },
            {
                character: '⁋',
                title: t('Reversed paragraph sign')
            }
        ], {
            label: t('Text')
        });
    }
}

/**
 * A plugin that provides special characters for the "Mathematical" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersMathematical ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */ class SpecialCharactersMathematical extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SpecialCharactersMathematical';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = editor.t;
        const plugin = editor.plugins.get('SpecialCharacters');
        plugin.addItems('Mathematical', [
            {
                character: '<',
                title: t('Less-than sign')
            },
            {
                character: '>',
                title: t('Greater-than sign')
            },
            {
                character: '≤',
                title: t('Less-than or equal to')
            },
            {
                character: '≥',
                title: t('Greater-than or equal to')
            },
            {
                character: '–',
                title: t('En dash')
            },
            {
                character: '—',
                title: t('Em dash')
            },
            {
                character: '¯',
                title: t('Macron')
            },
            {
                character: '‾',
                title: t('Overline')
            },
            {
                character: '°',
                title: t('Degree sign')
            },
            {
                character: '−',
                title: t('Minus sign')
            },
            {
                character: '±',
                title: t('Plus-minus sign')
            },
            {
                character: '÷',
                title: t('Division sign')
            },
            {
                character: '⁄',
                title: t('Fraction slash')
            },
            {
                character: '×',
                title: t('Multiplication sign')
            },
            {
                character: 'ƒ',
                title: t('Latin small letter f with hook')
            },
            {
                character: '∫',
                title: t('Integral')
            },
            {
                character: '∑',
                title: t('N-ary summation')
            },
            {
                character: '∞',
                title: t('Infinity')
            },
            {
                character: '√',
                title: t('Square root')
            },
            {
                character: '∼',
                title: t('Tilde operator')
            },
            {
                character: '≅',
                title: t('Approximately equal to')
            },
            {
                character: '≈',
                title: t('Almost equal to')
            },
            {
                character: '≠',
                title: t('Not equal to')
            },
            {
                character: '≡',
                title: t('Identical to')
            },
            {
                character: '∈',
                title: t('Element of')
            },
            {
                character: '∉',
                title: t('Not an element of')
            },
            {
                character: '∋',
                title: t('Contains as member')
            },
            {
                character: '∏',
                title: t('N-ary product')
            },
            {
                character: '∧',
                title: t('Logical and')
            },
            {
                character: '∨',
                title: t('Logical or')
            },
            {
                character: '¬',
                title: t('Not sign')
            },
            {
                character: '∩',
                title: t('Intersection')
            },
            {
                character: '∪',
                title: t('Union')
            },
            {
                character: '∂',
                title: t('Partial differential')
            },
            {
                character: '∀',
                title: t('For all')
            },
            {
                character: '∃',
                title: t('There exists')
            },
            {
                character: '∅',
                title: t('Empty set')
            },
            {
                character: '∇',
                title: t('Nabla')
            },
            {
                character: '∗',
                title: t('Asterisk operator')
            },
            {
                character: '∝',
                title: t('Proportional to')
            },
            {
                character: '∠',
                title: t('Angle')
            },
            {
                character: '¼',
                title: t('Vulgar fraction one quarter')
            },
            {
                character: '½',
                title: t('Vulgar fraction one half')
            },
            {
                character: '¾',
                title: t('Vulgar fraction three quarters')
            }
        ], {
            label: t('Mathematical')
        });
    }
}

/**
 * A plugin that provides special characters for the "Latin" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersLatin ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */ class SpecialCharactersLatin extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SpecialCharactersLatin';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = editor.t;
        const plugin = editor.plugins.get('SpecialCharacters');
        plugin.addItems('Latin', [
            {
                character: 'Ā',
                title: t('Latin capital letter a with macron')
            },
            {
                character: 'ā',
                title: t('Latin small letter a with macron')
            },
            {
                character: 'Ă',
                title: t('Latin capital letter a with breve')
            },
            {
                character: 'ă',
                title: t('Latin small letter a with breve')
            },
            {
                character: 'Ą',
                title: t('Latin capital letter a with ogonek')
            },
            {
                character: 'ą',
                title: t('Latin small letter a with ogonek')
            },
            {
                character: 'Ć',
                title: t('Latin capital letter c with acute')
            },
            {
                character: 'ć',
                title: t('Latin small letter c with acute')
            },
            {
                character: 'Ĉ',
                title: t('Latin capital letter c with circumflex')
            },
            {
                character: 'ĉ',
                title: t('Latin small letter c with circumflex')
            },
            {
                character: 'Ċ',
                title: t('Latin capital letter c with dot above')
            },
            {
                character: 'ċ',
                title: t('Latin small letter c with dot above')
            },
            {
                character: 'Č',
                title: t('Latin capital letter c with caron')
            },
            {
                character: 'č',
                title: t('Latin small letter c with caron')
            },
            {
                character: 'Ď',
                title: t('Latin capital letter d with caron')
            },
            {
                character: 'ď',
                title: t('Latin small letter d with caron')
            },
            {
                character: 'Đ',
                title: t('Latin capital letter d with stroke')
            },
            {
                character: 'đ',
                title: t('Latin small letter d with stroke')
            },
            {
                character: 'Ē',
                title: t('Latin capital letter e with macron')
            },
            {
                character: 'ē',
                title: t('Latin small letter e with macron')
            },
            {
                character: 'Ĕ',
                title: t('Latin capital letter e with breve')
            },
            {
                character: 'ĕ',
                title: t('Latin small letter e with breve')
            },
            {
                character: 'Ė',
                title: t('Latin capital letter e with dot above')
            },
            {
                character: 'ė',
                title: t('Latin small letter e with dot above')
            },
            {
                character: 'Ę',
                title: t('Latin capital letter e with ogonek')
            },
            {
                character: 'ę',
                title: t('Latin small letter e with ogonek')
            },
            {
                character: 'Ě',
                title: t('Latin capital letter e with caron')
            },
            {
                character: 'ě',
                title: t('Latin small letter e with caron')
            },
            {
                character: 'Ĝ',
                title: t('Latin capital letter g with circumflex')
            },
            {
                character: 'ĝ',
                title: t('Latin small letter g with circumflex')
            },
            {
                character: 'Ğ',
                title: t('Latin capital letter g with breve')
            },
            {
                character: 'ğ',
                title: t('Latin small letter g with breve')
            },
            {
                character: 'Ġ',
                title: t('Latin capital letter g with dot above')
            },
            {
                character: 'ġ',
                title: t('Latin small letter g with dot above')
            },
            {
                character: 'Ģ',
                title: t('Latin capital letter g with cedilla')
            },
            {
                character: 'ģ',
                title: t('Latin small letter g with cedilla')
            },
            {
                character: 'Ĥ',
                title: t('Latin capital letter h with circumflex')
            },
            {
                character: 'ĥ',
                title: t('Latin small letter h with circumflex')
            },
            {
                character: 'Ħ',
                title: t('Latin capital letter h with stroke')
            },
            {
                character: 'ħ',
                title: t('Latin small letter h with stroke')
            },
            {
                character: 'Ĩ',
                title: t('Latin capital letter i with tilde')
            },
            {
                character: 'ĩ',
                title: t('Latin small letter i with tilde')
            },
            {
                character: 'Ī',
                title: t('Latin capital letter i with macron')
            },
            {
                character: 'ī',
                title: t('Latin small letter i with macron')
            },
            {
                character: 'Ĭ',
                title: t('Latin capital letter i with breve')
            },
            {
                character: 'ĭ',
                title: t('Latin small letter i with breve')
            },
            {
                character: 'Į',
                title: t('Latin capital letter i with ogonek')
            },
            {
                character: 'į',
                title: t('Latin small letter i with ogonek')
            },
            {
                character: 'İ',
                title: t('Latin capital letter i with dot above')
            },
            {
                character: 'ı',
                title: t('Latin small letter dotless i')
            },
            {
                character: 'Ĳ',
                title: t('Latin capital ligature ij')
            },
            {
                character: 'ĳ',
                title: t('Latin small ligature ij')
            },
            {
                character: 'Ĵ',
                title: t('Latin capital letter j with circumflex')
            },
            {
                character: 'ĵ',
                title: t('Latin small letter j with circumflex')
            },
            {
                character: 'Ķ',
                title: t('Latin capital letter k with cedilla')
            },
            {
                character: 'ķ',
                title: t('Latin small letter k with cedilla')
            },
            {
                character: 'ĸ',
                title: t('Latin small letter kra')
            },
            {
                character: 'Ĺ',
                title: t('Latin capital letter l with acute')
            },
            {
                character: 'ĺ',
                title: t('Latin small letter l with acute')
            },
            {
                character: 'Ļ',
                title: t('Latin capital letter l with cedilla')
            },
            {
                character: 'ļ',
                title: t('Latin small letter l with cedilla')
            },
            {
                character: 'Ľ',
                title: t('Latin capital letter l with caron')
            },
            {
                character: 'ľ',
                title: t('Latin small letter l with caron')
            },
            {
                character: 'Ŀ',
                title: t('Latin capital letter l with middle dot')
            },
            {
                character: 'ŀ',
                title: t('Latin small letter l with middle dot')
            },
            {
                character: 'Ł',
                title: t('Latin capital letter l with stroke')
            },
            {
                character: 'ł',
                title: t('Latin small letter l with stroke')
            },
            {
                character: 'Ń',
                title: t('Latin capital letter n with acute')
            },
            {
                character: 'ń',
                title: t('Latin small letter n with acute')
            },
            {
                character: 'Ņ',
                title: t('Latin capital letter n with cedilla')
            },
            {
                character: 'ņ',
                title: t('Latin small letter n with cedilla')
            },
            {
                character: 'Ň',
                title: t('Latin capital letter n with caron')
            },
            {
                character: 'ň',
                title: t('Latin small letter n with caron')
            },
            {
                character: 'ŉ',
                title: t('Latin small letter n preceded by apostrophe')
            },
            {
                character: 'Ŋ',
                title: t('Latin capital letter eng')
            },
            {
                character: 'ŋ',
                title: t('Latin small letter eng')
            },
            {
                character: 'Ō',
                title: t('Latin capital letter o with macron')
            },
            {
                character: 'ō',
                title: t('Latin small letter o with macron')
            },
            {
                character: 'Ŏ',
                title: t('Latin capital letter o with breve')
            },
            {
                character: 'ŏ',
                title: t('Latin small letter o with breve')
            },
            {
                character: 'Ő',
                title: t('Latin capital letter o with double acute')
            },
            {
                character: 'ő',
                title: t('Latin small letter o with double acute')
            },
            {
                character: 'Œ',
                title: t('Latin capital ligature oe')
            },
            {
                character: 'œ',
                title: t('Latin small ligature oe')
            },
            {
                character: 'Ŕ',
                title: t('Latin capital letter r with acute')
            },
            {
                character: 'ŕ',
                title: t('Latin small letter r with acute')
            },
            {
                character: 'Ŗ',
                title: t('Latin capital letter r with cedilla')
            },
            {
                character: 'ŗ',
                title: t('Latin small letter r with cedilla')
            },
            {
                character: 'Ř',
                title: t('Latin capital letter r with caron')
            },
            {
                character: 'ř',
                title: t('Latin small letter r with caron')
            },
            {
                character: 'Ś',
                title: t('Latin capital letter s with acute')
            },
            {
                character: 'ś',
                title: t('Latin small letter s with acute')
            },
            {
                character: 'Ŝ',
                title: t('Latin capital letter s with circumflex')
            },
            {
                character: 'ŝ',
                title: t('Latin small letter s with circumflex')
            },
            {
                character: 'Ş',
                title: t('Latin capital letter s with cedilla')
            },
            {
                character: 'ş',
                title: t('Latin small letter s with cedilla')
            },
            {
                character: 'Š',
                title: t('Latin capital letter s with caron')
            },
            {
                character: 'š',
                title: t('Latin small letter s with caron')
            },
            {
                character: 'Ţ',
                title: t('Latin capital letter t with cedilla')
            },
            {
                character: 'ţ',
                title: t('Latin small letter t with cedilla')
            },
            {
                character: 'Ť',
                title: t('Latin capital letter t with caron')
            },
            {
                character: 'ť',
                title: t('Latin small letter t with caron')
            },
            {
                character: 'Ŧ',
                title: t('Latin capital letter t with stroke')
            },
            {
                character: 'ŧ',
                title: t('Latin small letter t with stroke')
            },
            {
                character: 'Ũ',
                title: t('Latin capital letter u with tilde')
            },
            {
                character: 'ũ',
                title: t('Latin small letter u with tilde')
            },
            {
                character: 'Ū',
                title: t('Latin capital letter u with macron')
            },
            {
                character: 'ū',
                title: t('Latin small letter u with macron')
            },
            {
                character: 'Ŭ',
                title: t('Latin capital letter u with breve')
            },
            {
                character: 'ŭ',
                title: t('Latin small letter u with breve')
            },
            {
                character: 'Ů',
                title: t('Latin capital letter u with ring above')
            },
            {
                character: 'ů',
                title: t('Latin small letter u with ring above')
            },
            {
                character: 'Ű',
                title: t('Latin capital letter u with double acute')
            },
            {
                character: 'ű',
                title: t('Latin small letter u with double acute')
            },
            {
                character: 'Ų',
                title: t('Latin capital letter u with ogonek')
            },
            {
                character: 'ų',
                title: t('Latin small letter u with ogonek')
            },
            {
                character: 'Ŵ',
                title: t('Latin capital letter w with circumflex')
            },
            {
                character: 'ŵ',
                title: t('Latin small letter w with circumflex')
            },
            {
                character: 'Ŷ',
                title: t('Latin capital letter y with circumflex')
            },
            {
                character: 'ŷ',
                title: t('Latin small letter y with circumflex')
            },
            {
                character: 'Ÿ',
                title: t('Latin capital letter y with diaeresis')
            },
            {
                character: 'Ź',
                title: t('Latin capital letter z with acute')
            },
            {
                character: 'ź',
                title: t('Latin small letter z with acute')
            },
            {
                character: 'Ż',
                title: t('Latin capital letter z with dot above')
            },
            {
                character: 'ż',
                title: t('Latin small letter z with dot above')
            },
            {
                character: 'Ž',
                title: t('Latin capital letter z with caron')
            },
            {
                character: 'ž',
                title: t('Latin small letter z with caron')
            },
            {
                character: 'ſ',
                title: t('Latin small letter long s')
            }
        ], {
            label: t('Latin')
        });
    }
}

/**
 * A plugin that provides special characters for the "Currency" category.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersCurrency ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */ class SpecialCharactersCurrency extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SpecialCharactersCurrency';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = editor.t;
        const plugin = editor.plugins.get('SpecialCharacters');
        plugin.addItems('Currency', [
            {
                character: '$',
                title: t('Dollar sign')
            },
            {
                character: '€',
                title: t('Euro sign')
            },
            {
                character: '¥',
                title: t('Yen sign')
            },
            {
                character: '£',
                title: t('Pound sign')
            },
            {
                character: '¢',
                title: t('Cent sign')
            },
            {
                character: '₠',
                title: t('Euro-currency sign')
            },
            {
                character: '₡',
                title: t('Colon sign')
            },
            {
                character: '₢',
                title: t('Cruzeiro sign')
            },
            {
                character: '₣',
                title: t('French franc sign')
            },
            {
                character: '₤',
                title: t('Lira sign')
            },
            {
                character: '¤',
                title: t('Currency sign')
            },
            {
                character: '₿',
                title: t('Bitcoin sign')
            },
            {
                character: '₥',
                title: t('Mill sign')
            },
            {
                character: '₦',
                title: t('Naira sign')
            },
            {
                character: '₧',
                title: t('Peseta sign')
            },
            {
                character: '₨',
                title: t('Rupee sign')
            },
            {
                character: '₩',
                title: t('Won sign')
            },
            {
                character: '₪',
                title: t('New sheqel sign')
            },
            {
                character: '₫',
                title: t('Dong sign')
            },
            {
                character: '₭',
                title: t('Kip sign')
            },
            {
                character: '₮',
                title: t('Tugrik sign')
            },
            {
                character: '₯',
                title: t('Drachma sign')
            },
            {
                character: '₰',
                title: t('German penny sign')
            },
            {
                character: '₱',
                title: t('Peso sign')
            },
            {
                character: '₲',
                title: t('Guarani sign')
            },
            {
                character: '₳',
                title: t('Austral sign')
            },
            {
                character: '₴',
                title: t('Hryvnia sign')
            },
            {
                character: '₵',
                title: t('Cedi sign')
            },
            {
                character: '₶',
                title: t('Livre tournois sign')
            },
            {
                character: '₷',
                title: t('Spesmilo sign')
            },
            {
                character: '₸',
                title: t('Tenge sign')
            },
            {
                character: '₹',
                title: t('Indian rupee sign')
            },
            {
                character: '₺',
                title: t('Turkish lira sign')
            },
            {
                character: '₻',
                title: t('Nordic mark sign')
            },
            {
                character: '₼',
                title: t('Manat sign')
            },
            {
                character: '₽',
                title: t('Ruble sign')
            }
        ], {
            label: t('Currency')
        });
    }
}

/**
 * A plugin combining a basic set of characters for the special characters plugin.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., SpecialCharacters, SpecialCharactersEssentials ],
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 */ class SpecialCharactersEssentials extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SpecialCharactersEssentials';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            SpecialCharactersCurrency,
            SpecialCharactersText,
            SpecialCharactersMathematical,
            SpecialCharactersArrows,
            SpecialCharactersLatin
        ];
    }
}

export { SpecialCharacters, SpecialCharactersArrows, SpecialCharactersCurrency, SpecialCharactersEssentials, SpecialCharactersLatin, SpecialCharactersMathematical, SpecialCharactersText, SpecialCharactersCategoriesView as _SpecialCharactersCategoriesView, CharacterGridView as _SpecialCharactersGridView, CharacterInfoView as _SpecialCharactersInfoView, SpecialCharactersView as _SpecialCharactersView };
//# sourceMappingURL=index.js.map

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { logWarning, CKEditorError, first } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { ButtonView, createDropdown, addToolbarToDropdown, MenuBarMenuView, MenuBarMenuListView, MenuBarMenuListItemView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconAlignLeft, IconAlignRight, IconAlignCenter, IconAlignJustify } from '@ckeditor/ckeditor5-icons/dist/index.js';

/**
 * @module alignment/utils
 */ /**
 * The list of supported alignment options:
 *
 * * `'left'`,
 * * `'right'`,
 * * `'center'`,
 * * `'justify'`
 *
 * @internal
 */ const supportedOptions = [
    'left',
    'right',
    'center',
    'justify'
];
/**
 * Checks whether the passed option is supported by {@link module:alignment/alignmentediting~AlignmentEditing}.
 *
 * @internal
 * @param option The option value to check.
 */ function isSupported(option) {
    return supportedOptions.includes(option);
}
/**
 * Checks whether alignment is the default one considering the direction
 * of the editor content.
 *
 * @internal
 * @param alignment The name of the alignment to check.
 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
 */ function isDefault(alignment, locale) {
    // Right now only LTR is supported so the 'left' value is always the default one.
    if (locale.contentLanguageDirection == 'rtl') {
        return alignment === 'right';
    } else {
        return alignment === 'left';
    }
}
/**
 * Brings the configuration to the common form, an array of objects.
 *
 * @internal
 * @param configuredOptions Alignment plugin configuration.
 * @returns Normalized object holding the configuration.
 */ function normalizeAlignmentOptions(configuredOptions) {
    const normalizedOptions = configuredOptions.map((option)=>{
        let result;
        if (typeof option == 'string') {
            result = {
                name: option
            };
        } else {
            result = option;
        }
        return result;
    })// Remove all unknown options.
    .filter((option)=>{
        const isNameValid = supportedOptions.includes(option.name);
        if (!isNameValid) {
            /**
				 * The `name` in one of the `alignment.options` is not recognized.
				 * The available options are: `'left'`, `'right'`, `'center'` and `'justify'`.
				 *
				 * @error alignment-config-name-not-recognized
				 * @param {object} option Options with unknown value of the `name` property.
				 */ logWarning('alignment-config-name-not-recognized', {
                option
            });
        }
        return isNameValid;
    });
    const classNameCount = normalizedOptions.filter((option)=>Boolean(option.className)).length;
    // We either use classes for all styling options or for none.
    if (classNameCount && classNameCount < normalizedOptions.length) {
        /**
		 * The `className` property has to be defined for all options once at least one option declares `className`.
		 *
		 * @error alignment-config-classnames-are-missing
		 * @param {object} configuredOptions Contents of `alignment.options`.
		 */ throw new CKEditorError('alignment-config-classnames-are-missing', {
            configuredOptions
        });
    }
    // Validate resulting config.
    normalizedOptions.forEach((option, index, allOptions)=>{
        const succeedingOptions = allOptions.slice(index + 1);
        const nameAlreadyExists = succeedingOptions.some((item)=>item.name == option.name);
        if (nameAlreadyExists) {
            /**
			 * The same `name` in one of the `alignment.options` was already declared.
			 * Each `name` representing one alignment option can be set exactly once.
			 *
			 * @error alignment-config-name-already-defined
			 * @param {object} option First option that declares given `name`.
			 * @param {object} configuredOptions Contents of `alignment.options`.
			 */ throw new CKEditorError('alignment-config-name-already-defined', {
                option,
                configuredOptions
            });
        }
        // The `className` property is present. Check for duplicates then.
        if (option.className) {
            const classNameAlreadyExists = succeedingOptions.some((item)=>item.className == option.className);
            if (classNameAlreadyExists) {
                /**
				 * The same `className` in one of the `alignment.options` was already declared.
				 *
				 * @error alignment-config-classname-already-defined
				 * @param {object} option First option that declares given `className`.
				 * @param {object} configuredOptions
				 * Contents of `alignment.options`.
				 */ throw new CKEditorError('alignment-config-classname-already-defined', {
                    option,
                    configuredOptions
                });
            }
        }
    });
    return normalizedOptions;
}

const ALIGNMENT = 'alignment';
/**
 * The alignment command plugin.
 */ class AlignmentCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const locale = editor.locale;
        const firstBlock = first(this.editor.model.document.selection.getSelectedBlocks());
        // As first check whether to enable or disable the command as the value will always be false if the command cannot be enabled.
        this.isEnabled = Boolean(firstBlock) && this._canBeAligned(firstBlock);
        if (this.isEnabled && firstBlock.hasAttribute('alignment')) {
            this.value = firstBlock.getAttribute('alignment');
        } else {
            this.value = locale.contentLanguageDirection === 'rtl' ? 'right' : 'left';
        }
    }
    /**
	 * Executes the command. Applies the alignment `value` to the selected blocks.
	 * If no `value` is passed, the `value` is the default one or it is equal to the currently selected block's alignment attribute,
	 * the command will remove the attribute from the selected blocks.
	 *
	 * @param options Options for the executed command.
	 * @param options.value The value to apply.
	 * @fires execute
	 */ execute(options = {}) {
        const editor = this.editor;
        const locale = editor.locale;
        const model = editor.model;
        const doc = model.document;
        const value = options.value;
        model.change((writer)=>{
            // Get only those blocks from selected that can have alignment set
            const blocks = Array.from(doc.selection.getSelectedBlocks()).filter((block)=>this._canBeAligned(block));
            const currentAlignment = blocks[0].getAttribute('alignment');
            // Remove alignment attribute if current alignment is:
            // - default (should not be stored in model as it will bloat model data)
            // - equal to currently set
            // - or no value is passed - denotes default alignment.
            const removeAlignment = isDefault(value, locale) || currentAlignment === value || !value;
            if (removeAlignment) {
                removeAlignmentFromSelection(blocks, writer);
            } else {
                setAlignmentOnSelection(blocks, writer, value);
            }
        });
    }
    /**
	 * Checks whether a block can have alignment set.
	 *
	 * @param block The block to be checked.
	 */ _canBeAligned(block) {
        return this.editor.model.schema.checkAttribute(block, ALIGNMENT);
    }
}
/**
 * Removes the alignment attribute from blocks.
 */ function removeAlignmentFromSelection(blocks, writer) {
    for (const block of blocks){
        writer.removeAttribute(ALIGNMENT, block);
    }
}
/**
 * Sets the alignment attribute on blocks.
 */ function setAlignmentOnSelection(blocks, writer, alignment) {
    for (const block of blocks){
        writer.setAttribute(ALIGNMENT, alignment, block);
    }
}

/**
 * The alignment editing feature. It introduces the {@link module:alignment/alignmentcommand~AlignmentCommand command} and adds
 * the `alignment` attribute for block elements in the {@link module:engine/model/model~Model model}.
 */ class AlignmentEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'AlignmentEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('alignment', {
            options: supportedOptions.map((option)=>({
                    name: option
                }))
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const locale = editor.locale;
        const schema = editor.model.schema;
        const options = normalizeAlignmentOptions(editor.config.get('alignment.options'));
        // Filter out unsupported options and those that are redundant, e.g. `left` in LTR / `right` in RTL mode.
        const optionsToConvert = options.filter((option)=>isSupported(option.name) && !isDefault(option.name, locale));
        // Once there is at least one `className` defined, we switch to alignment with classes.
        const shouldUseClasses = optionsToConvert.some((option)=>!!option.className);
        // Allow alignment attribute on all blocks.
        schema.extend('$block', {
            allowAttributes: 'alignment'
        });
        editor.model.schema.setAttributeProperties('alignment', {
            isFormatting: true
        });
        if (shouldUseClasses) {
            editor.conversion.attributeToAttribute(buildClassDefinition(optionsToConvert));
        } else {
            // Downcast inline styles.
            editor.conversion.for('downcast').attributeToAttribute(buildDowncastInlineDefinition(optionsToConvert));
        }
        const upcastInlineDefinitions = buildUpcastInlineDefinitions(optionsToConvert);
        // Always upcast from inline styles.
        for (const definition of upcastInlineDefinitions){
            editor.conversion.for('upcast').attributeToAttribute(definition);
        }
        const upcastCompatibilityDefinitions = buildUpcastCompatibilityDefinitions(optionsToConvert);
        // Always upcast from deprecated `align` attribute.
        for (const definition of upcastCompatibilityDefinitions){
            editor.conversion.for('upcast').attributeToAttribute(definition);
        }
        editor.commands.add('alignment', new AlignmentCommand(editor));
    }
}
/**
 * Prepare downcast conversion definition for inline alignment styling.
 */ function buildDowncastInlineDefinition(options) {
    const view = {};
    for (const { name } of options){
        view[name] = {
            key: 'style',
            value: {
                'text-align': name
            }
        };
    }
    const definition = {
        model: {
            key: 'alignment',
            values: options.map((option)=>option.name)
        },
        view
    };
    return definition;
}
/**
 * Prepare upcast definitions for inline alignment styles.
 */ function buildUpcastInlineDefinitions(options) {
    const definitions = [];
    for (const { name } of options){
        definitions.push({
            view: {
                key: 'style',
                value: {
                    'text-align': name
                }
            },
            model: {
                key: 'alignment',
                value: name
            }
        });
    }
    return definitions;
}
/**
 * Prepare upcast definitions for deprecated `align` attribute.
 */ function buildUpcastCompatibilityDefinitions(options) {
    const definitions = [];
    for (const { name } of options){
        definitions.push({
            view: {
                key: 'align',
                value: name
            },
            model: {
                key: 'alignment',
                value: name
            }
        });
    }
    return definitions;
}
/**
 * Prepare conversion definitions for upcast and downcast alignment with classes.
 */ function buildClassDefinition(options) {
    const view = {};
    for (const option of options){
        view[option.name] = {
            key: 'class',
            value: option.className
        };
    }
    const definition = {
        model: {
            key: 'alignment',
            values: options.map((option)=>option.name)
        },
        view
    };
    return definition;
}

const iconsMap = /* #__PURE__ */ (()=>new Map([
        [
            'left',
            IconAlignLeft
        ],
        [
            'right',
            IconAlignRight
        ],
        [
            'center',
            IconAlignCenter
        ],
        [
            'justify',
            IconAlignJustify
        ]
    ]))();
/**
 * The default alignment UI plugin.
 *
 * It introduces the `'alignment:left'`, `'alignment:right'`, `'alignment:center'` and `'alignment:justify'` buttons
 * and the `'alignment'` dropdown.
 */ class AlignmentUI extends Plugin {
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
	 */ get localizedOptionTitles() {
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
	 */ static get pluginName() {
        return 'AlignmentUI';
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
        const options = normalizeAlignmentOptions(editor.config.get('alignment.options'));
        options.map((option)=>option.name).filter(isSupported).forEach((option)=>this._addButton(option));
        this._addToolbarDropdown(options);
        this._addMenuBarMenu(options);
    }
    /**
	 * Helper method for initializing the button and linking it with an appropriate command.
	 *
	 * @param option The name of the alignment option for which the button is added.
	 */ _addButton(option) {
        const editor = this.editor;
        editor.ui.componentFactory.add(`alignment:${option}`, (locale)=>this._createButton(locale, option));
    }
    /**
	 * Helper method for creating the button view element.
	 *
	 * @param locale Editor locale.
	 * @param option The name of the alignment option for which the button is added.
	 * @param buttonAttrs Optional parameters passed to button view instance.
	 */ _createButton(locale, option, buttonAttrs = {}) {
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
        buttonView.bind('isOn').to(command, 'value', (value)=>value === option);
        // Execute command.
        this.listenTo(buttonView, 'execute', ()=>{
            editor.execute('alignment', {
                value: option
            });
            editor.editing.view.focus();
        });
        return buttonView;
    }
    /**
	 * Helper method for initializing the toolnar dropdown and linking it with an appropriate command.
	 *
	 * @param options The name of the alignment option for which the button is added.
	 */ _addToolbarDropdown(options) {
        const editor = this.editor;
        const factory = editor.ui.componentFactory;
        factory.add('alignment', (locale)=>{
            const dropdownView = createDropdown(locale);
            const tooltipPosition = locale.uiLanguageDirection === 'rtl' ? 'w' : 'e';
            const t = locale.t;
            // Add existing alignment buttons to dropdown's toolbar.
            addToolbarToDropdown(dropdownView, ()=>options.map((option)=>this._createButton(locale, option.name, {
                        tooltipPosition
                    })), {
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
            dropdownView.buttonView.bind('icon').to(command, 'value', (value)=>iconsMap.get(value) || defaultIcon);
            // Enable button if any of the buttons is enabled.
            dropdownView.bind('isEnabled').to(command, 'isEnabled');
            // Focus the editable after executing the command.
            // Overrides a default behaviour where the focus is moved to the dropdown button (#12125).
            this.listenTo(dropdownView, 'execute', ()=>{
                editor.editing.view.focus();
            });
            return dropdownView;
        });
    }
    /**
	 * Creates a menu for all alignment options to use either in menu bar.
	 *
	 * @param options Normalized alignment options from config.
	 */ _addMenuBarMenu(options) {
        const editor = this.editor;
        editor.ui.componentFactory.add('menuBar:alignment', (locale)=>{
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
            for (const option of options){
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.delegate('execute').to(menuView);
                buttonView.set({
                    label: this.localizedOptionTitles[option.name],
                    icon: iconsMap.get(option.name),
                    role: 'menuitemcheckbox',
                    isToggleable: true
                });
                buttonView.on('execute', ()=>{
                    editor.execute('alignment', {
                        value: option.name
                    });
                    editor.editing.view.focus();
                });
                buttonView.bind('isOn').to(command, 'value', (value)=>value === option.name);
                buttonView.bind('isEnabled').to(command, 'isEnabled');
                listItemView.children.add(buttonView);
                listView.items.add(listItemView);
            }
            menuView.panelView.children.add(listView);
            return menuView;
        });
    }
}

/**
 * The text alignment plugin.
 *
 * For a detailed overview, check the {@glink features/text-alignment Text alignment} feature guide
 * and the {@glink api/alignment package page}.
 *
 * This is a "glue" plugin which loads the {@link module:alignment/alignmentediting~AlignmentEditing} and
 * {@link module:alignment/alignmentui~AlignmentUI} plugins.
 */ class Alignment extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            AlignmentEditing,
            AlignmentUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Alignment';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { Alignment, AlignmentCommand, AlignmentEditing, AlignmentUI, supportedOptions as _ALIGNMENT_SUPPORTED_OPTIONS, isSupported as _isAlignmentSupported, isDefault as _isDefaultAlignment, normalizeAlignmentOptions as _normalizeAlignmentOptions };
//# sourceMappingURL=index.js.map

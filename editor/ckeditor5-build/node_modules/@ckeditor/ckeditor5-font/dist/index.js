/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ModelDocumentSelection, isLengthStyleValue, isPercentageStyleValue, addBackgroundStylesRules } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { ColorSelectorView, createDropdown, addListToDropdown, MenuBarMenuView, MenuBarMenuListView, MenuBarMenuListItemView, MenuBarMenuListItemButtonView, UIModel, normalizeColorOptions, getLocalizedColorOptions, focusChildOnDropdownOpen } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { Collection, CKEditorError } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { IconFontFamily, IconFontSize, IconFontColor, IconFontBackground } from '@ckeditor/ckeditor5-icons/dist/index.js';

/**
 * The base font command.
 */ class FontCommand extends Command {
    /**
	 * A model attribute on which this command operates.
	 */ attributeKey;
    /**
	 * Creates an instance of the command.
	 *
	 * @param editor Editor instance.
	 * @param attributeKey The name of a model attribute on which this command operates.
	 */ constructor(editor, attributeKey){
        super(editor);
        this.attributeKey = attributeKey;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const doc = model.document;
        this.value = doc.selection.getAttribute(this.attributeKey);
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, this.attributeKey);
    }
    /**
	 * Executes the command. Applies the `value` of the {@link #attributeKey} to the selection.
	 * If no `value` is passed, it removes the attribute from the selection.
	 *
	 * @param options Options for the executed command.
	 * @param options.value The value to apply.
	 * @fires execute
	 */ execute(options = {}) {
        const model = this.editor.model;
        const document = model.document;
        const selection = document.selection;
        const value = options.value;
        const batch = options.batch;
        const updateAttribute = (writer)=>{
            if (selection.isCollapsed) {
                if (value) {
                    writer.setSelectionAttribute(this.attributeKey, value);
                } else {
                    writer.removeSelectionAttribute(this.attributeKey);
                }
            } else {
                const ranges = model.schema.getValidRanges(selection.getRanges(), this.attributeKey, {
                    includeEmptyRanges: true
                });
                for (const range of ranges){
                    let itemOrRange = range;
                    let attributeKey = this.attributeKey;
                    if (range.isCollapsed) {
                        itemOrRange = range.start.parent;
                        attributeKey = ModelDocumentSelection._getStoreAttributeKey(this.attributeKey);
                    }
                    if (value) {
                        writer.setAttribute(attributeKey, value, itemOrRange);
                    } else {
                        writer.removeAttribute(attributeKey, itemOrRange);
                    }
                }
            }
        };
        // In some scenarios, you may want to use a single undo step for multiple changes (e.g. in color picker).
        if (batch) {
            model.enqueueChange(batch, (writer)=>{
                updateAttribute(writer);
            });
        } else {
            model.change((writer)=>{
                updateAttribute(writer);
            });
        }
    }
}

/**
 * The name of the font size plugin.
 */ const FONT_SIZE = 'fontSize';
/**
 * The name of the font family plugin.
 */ const FONT_FAMILY = 'fontFamily';
/**
 * The name of the font color plugin.
 */ const FONT_COLOR = 'fontColor';
/**
 * The name of the font background color plugin.
 */ const FONT_BACKGROUND_COLOR = 'fontBackgroundColor';
/**
 * Builds a proper converter definition out of input data.
 *
 * @internal
 */ function buildDefinition(modelAttributeKey, options) {
    const definition = {
        model: {
            key: modelAttributeKey,
            values: []
        },
        view: {},
        upcastAlso: {}
    };
    for (const option of options){
        definition.model.values.push(option.model);
        definition.view[option.model] = option.view;
        if (option.upcastAlso) {
            definition.upcastAlso[option.model] = option.upcastAlso;
        }
    }
    return definition;
}
/**
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for upcasting data to the model.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 *
 * @internal
 */ function renderUpcastAttribute(styleAttr) {
    return (viewElement)=>normalizeColorCode(viewElement.getStyle(styleAttr));
}
/**
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for downcasting a color attribute to a `<span>` element.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 *
 * @internal
 */ function renderDowncastElement(styleAttr) {
    return (modelAttributeValue, { writer })=>writer.createAttributeElement('span', {
            style: `${styleAttr}:${modelAttributeValue}`
        }, {
            priority: 7
        });
}
/**
 * A helper that adds {@link module:ui/colorselector/colorselectorview~ColorSelectorView} to the color dropdown with proper initial values.
 *
 * @param options Configuration options
 * @param options.dropdownView The dropdown view to which a {@link module:ui/colorselector/colorselectorview~ColorSelectorView}
 * will be added.
 * @param options.colors An array with definitions representing colors to be displayed in the color selector.
 * @param options.columns The number of columns in the color grid.
 * @param options.removeButtonLabel The label for the button responsible for removing the color.
 * @param options.colorPickerLabel The label for the color picker button.
 * @param options.documentColorsLabel The label for the section with document colors.
 * @param options.documentColorsCount The number of document colors inside the dropdown.
 * @param options.colorPickerViewConfig Configuration of the color picker view.
 * @returns The new color selector view.
 * @internal
 */ function addColorSelectorToDropdown({ dropdownView, colors, columns, removeButtonLabel, colorPickerLabel, documentColorsLabel, documentColorsCount, colorPickerViewConfig }) {
    const locale = dropdownView.locale;
    const colorSelectorView = new ColorSelectorView(locale, {
        colors,
        columns,
        removeButtonLabel,
        colorPickerLabel,
        documentColorsLabel,
        documentColorsCount,
        colorPickerViewConfig
    });
    dropdownView.colorSelectorView = colorSelectorView;
    dropdownView.panelView.children.add(colorSelectorView);
    return colorSelectorView;
}
/**
 * Fixes the color value string.
 */ function normalizeColorCode(value) {
    return value.replace(/\s/g, '');
}

/**
 * The font family command. It is used by {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing}
 * to apply the font family.
 *
 * ```ts
 * editor.execute( 'fontFamily', { value: 'Arial' } );
 * ```
 *
 * **Note**: Executing the command without the value removes the attribute from the model.
 */ class FontFamilyCommand extends FontCommand {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor, FONT_FAMILY);
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module font/fontfamily/utils
 */ /**
 * Normalizes the {@link module:font/fontconfig~FontFamilyConfig#options configuration options}
 * to the {@link module:font/fontconfig~FontFamilyOption} format.
 *
 * @param configuredOptions An array of options taken from the configuration.
 * @internal
 */ function normalizeOptions$1(configuredOptions) {
    // Convert options to objects.
    return configuredOptions.map(getOptionDefinition$1)// Filter out undefined values that `getOptionDefinition` might return.
    .filter((option)=>option !== undefined);
}
/**
 * Normalizes the CSS `font-family` property value to an array of unquoted and trimmed font faces.
 *
 * @internal
 */ function normalizeFontFamilies(fontDefinition) {
    return fontDefinition.replace(/["']/g, '').split(',').map((name)=>name.trim());
}
/**
 * Returns an option definition either created from string shortcut.
 * If object is passed then this method will return it without alternating it. Returns undefined for item than cannot be parsed.
 *
 */ function getOptionDefinition$1(option) {
    // Treat any object as full item definition provided by user in configuration.
    if (typeof option === 'object') {
        return option;
    }
    // Handle 'default' string as a special case. It will be used to remove the fontFamily attribute.
    if (option === 'default') {
        return {
            title: 'Default',
            model: undefined
        };
    }
    // Ignore values that we cannot parse to a definition.
    if (typeof option !== 'string') {
        return undefined;
    }
    // Return font family definition from font string.
    return generateFontPreset(option);
}
/**
 * Creates a predefined preset for pixel size. It deconstructs font-family like string into full configuration option.
 * A font definition is passed as coma delimited set of font family names. Font names might be quoted.
 *
 * @param fontDefinition A font definition form configuration.
 */ function generateFontPreset(fontDefinition) {
    // Remove quotes from font names. They will be normalized later.
    const fontNames = normalizeFontFamilies(fontDefinition);
    // The first matched font name will be used as dropdown list item title and as model value.
    const firstFontName = fontNames[0];
    // CSS-compatible font names.
    const cssFontNames = fontNames.map(normalizeFontNameForCSS).join(', ');
    return {
        title: firstFontName,
        model: cssFontNames,
        view: {
            name: 'span',
            styles: {
                'font-family': cssFontNames
            },
            priority: 7
        }
    };
}
/**
 * Normalizes font name for the style attribute. It adds braces (') if font name contains spaces.
 */ function normalizeFontNameForCSS(fontName) {
    fontName = fontName.trim();
    // Compound font names should be quoted.
    if (fontName.indexOf(' ') > 0) {
        fontName = `'${fontName}'`;
    }
    return fontName;
}

/**
 * The font family editing feature.
 *
 * It introduces the {@link module:font/fontfamily/fontfamilycommand~FontFamilyCommand command} and
 * the `fontFamily` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as an inline `<span>` element (`<span style="font-family: Arial">`),
 * depending on the {@link module:font/fontconfig~FontFamilyConfig configuration}.
 */ class FontFamilyEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontFamilyEditing';
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
        // Define default configuration using font families shortcuts.
        editor.config.define(FONT_FAMILY, {
            options: [
                'default',
                'Arial, Helvetica, sans-serif',
                'Courier New, Courier, monospace',
                'Georgia, serif',
                'Lucida Sans Unicode, Lucida Grande, sans-serif',
                'Tahoma, Geneva, sans-serif',
                'Times New Roman, Times, serif',
                'Trebuchet MS, Helvetica, sans-serif',
                'Verdana, Geneva, sans-serif'
            ],
            supportAllValues: false
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        // Allow fontFamily attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: FONT_FAMILY
        });
        editor.model.schema.setAttributeProperties(FONT_FAMILY, {
            isFormatting: true,
            copyOnEnter: true
        });
        // Get configured font family options without "default" option.
        const options = normalizeOptions$1(editor.config.get('fontFamily.options')).filter((item)=>item.model);
        const definition = buildDefinition(FONT_FAMILY, options);
        // Set-up the two-way conversion.
        if (editor.config.get('fontFamily.supportAllValues')) {
            this._prepareAnyValueConverters();
            this._prepareCompatibilityConverter();
        } else {
            editor.conversion.attributeToElement(definition);
        }
        editor.commands.add(FONT_FAMILY, new FontFamilyCommand(editor));
    }
    /**
	 * These converters enable keeping any value found as `style="font-family: *"` as a value of an attribute on a text even
	 * if it is not defined in the plugin configuration.
	 */ _prepareAnyValueConverters() {
        const editor = this.editor;
        editor.conversion.for('downcast').attributeToElement({
            model: FONT_FAMILY,
            view: (attributeValue, { writer })=>{
                return writer.createAttributeElement('span', {
                    style: 'font-family:' + attributeValue
                }, {
                    priority: 7
                });
            }
        });
        editor.conversion.for('upcast').elementToAttribute({
            model: {
                key: FONT_FAMILY,
                value: (viewElement)=>viewElement.getStyle('font-family')
            },
            view: {
                name: 'span',
                styles: {
                    'font-family': /.*/
                }
            }
        });
    }
    /**
	 * Adds support for legacy `<font face="..">` formatting.
	 */ _prepareCompatibilityConverter() {
        const editor = this.editor;
        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'font',
                attributes: {
                    'face': /.*/
                }
            },
            model: {
                key: FONT_FAMILY,
                value: (viewElement)=>viewElement.getAttribute('face')
            }
        });
    }
}

/**
 * The font family UI plugin. It introduces the `'fontFamily'` dropdown.
 */ class FontFamilyUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontFamilyUI';
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
        const options = this._getLocalizedOptions();
        const command = editor.commands.get(FONT_FAMILY);
        const accessibleLabel = t('Font Family');
        const listOptions = _prepareListOptions$1(options, command);
        // Register UI component.
        editor.ui.componentFactory.add(FONT_FAMILY, (locale)=>{
            const dropdownView = createDropdown(locale);
            addListToDropdown(dropdownView, listOptions, {
                role: 'menu',
                ariaLabel: accessibleLabel
            });
            dropdownView.buttonView.set({
                label: accessibleLabel,
                icon: IconFontFamily,
                tooltip: true
            });
            dropdownView.extendTemplate({
                attributes: {
                    class: 'ck-font-family-dropdown'
                }
            });
            dropdownView.bind('isEnabled').to(command);
            // Execute command when an item from the dropdown is selected.
            this.listenTo(dropdownView, 'execute', (evt)=>{
                editor.execute(evt.source.commandName, {
                    value: evt.source.commandParam
                });
                editor.editing.view.focus();
            });
            return dropdownView;
        });
        editor.ui.componentFactory.add(`menuBar:${FONT_FAMILY}`, (locale)=>{
            const menuView = new MenuBarMenuView(locale);
            menuView.buttonView.set({
                label: accessibleLabel,
                icon: IconFontFamily
            });
            menuView.bind('isEnabled').to(command);
            const listView = new MenuBarMenuListView(locale);
            for (const definition of listOptions){
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.set({
                    role: 'menuitemradio',
                    isToggleable: true
                });
                buttonView.bind(...Object.keys(definition.model)).to(definition.model);
                buttonView.delegate('execute').to(menuView);
                buttonView.on('execute', ()=>{
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
	 * Returns options as defined in `config.fontFamily.options` but processed to account for
	 * editor localization, i.e. to display {@link module:font/fontconfig~FontFamilyOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there is no way to use {@link module:utils/locale~Locale#t}
	 * when the user configuration is defined because the editor does not exist yet.
	 */ _getLocalizedOptions() {
        const editor = this.editor;
        const t = editor.t;
        const options = normalizeOptions$1(editor.config.get(FONT_FAMILY).options);
        return options.map((option)=>{
            // The only title to localize is "Default" others are font names.
            if (option.title === 'Default') {
                option.title = t('Default');
            }
            return option;
        });
    }
}
/**
 * Prepares FontFamily dropdown items.
 */ function _prepareListOptions$1(options, command) {
    const itemDefinitions = new Collection();
    // Create dropdown items.
    for (const option of options){
        const def = {
            type: 'button',
            model: new UIModel({
                commandName: FONT_FAMILY,
                commandParam: option.model,
                label: option.title,
                role: 'menuitemradio',
                withText: true
            })
        };
        def.model.bind('isOn').to(command, 'value', (value)=>{
            // "Default" or check in strict font-family converters mode.
            if (value === option.model) {
                return true;
            }
            if (!value || !option.model) {
                return false;
            }
            const valueNormalized = normalizeFontFamilies(value)[0].toLowerCase();
            const optionNormalized = normalizeFontFamilies(option.model)[0].toLowerCase();
            return valueNormalized === optionNormalized;
        });
        // Try to set a dropdown list item style.
        if (option.view && typeof option.view !== 'string' && option.view.styles) {
            def.model.set('labelStyle', `font-family: ${option.view.styles['font-family']}`);
        }
        itemDefinitions.add(def);
    }
    return itemDefinitions;
}

/**
 * The font family plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentatiom
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} and
 * {@link module:font/fontfamily/fontfamilyui~FontFamilyUI} features in the editor.
 */ class FontFamily extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FontFamilyEditing,
            FontFamilyUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontFamily';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The font size command. It is used by {@link module:font/fontsize/fontsizeediting~FontSizeEditing}
 * to apply the font size.
 *
 * ```ts
 * editor.execute( 'fontSize', { value: 'small' } );
 * ```
 *
 * **Note**: Executing the command without the value removes the attribute from the model.
 */ class FontSizeCommand extends FontCommand {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor, FONT_SIZE);
    }
}

/**
 * Normalizes and translates the {@link module:font/fontconfig~FontSizeConfig#options configuration options}
 * to the {@link module:font/fontconfig~FontSizeOption} format.
 *
 * @param configuredOptions An array of options taken from the configuration.
 * @internal
 */ function normalizeOptions(configuredOptions) {
    // Convert options to objects.
    return configuredOptions.map((item)=>getOptionDefinition(item))// Filter out undefined values that `getOptionDefinition` might return.
    .filter((option)=>option !== undefined);
}
// Default named presets map. Always create a new instance of the preset object in order to avoid modifying references.
const namedPresets = {
    get tiny () {
        return {
            title: 'Tiny',
            model: 'tiny',
            view: {
                name: 'span',
                classes: 'text-tiny',
                priority: 7
            }
        };
    },
    get small () {
        return {
            title: 'Small',
            model: 'small',
            view: {
                name: 'span',
                classes: 'text-small',
                priority: 7
            }
        };
    },
    get big () {
        return {
            title: 'Big',
            model: 'big',
            view: {
                name: 'span',
                classes: 'text-big',
                priority: 7
            }
        };
    },
    get huge () {
        return {
            title: 'Huge',
            model: 'huge',
            view: {
                name: 'span',
                classes: 'text-huge',
                priority: 7
            }
        };
    }
};
/**
 * Returns an option definition either from preset or creates one from number shortcut.
 * If object is passed then this method will return it without alternating it. Returns undefined for item than cannot be parsed.
 */ function getOptionDefinition(option) {
    if (typeof option === 'number') {
        option = String(option);
    }
    // Check whether passed option is a full item definition provided by user in configuration.
    if (typeof option === 'object' && isFullItemDefinition(option)) {
        return attachPriority(option);
    }
    const preset = findPreset(option);
    // Item is a named preset.
    if (preset) {
        return attachPriority(preset);
    }
    // 'Default' font size. It will be used to remove the fontSize attribute.
    if (option === 'default') {
        return {
            model: undefined,
            title: 'Default'
        };
    }
    // At this stage we probably have numerical value to generate a preset so parse it's value.
    // Discard any faulty values.
    if (isNumericalDefinition(option)) {
        return undefined;
    }
    // Return font size definition from size value.
    return generatePixelPreset(option);
}
/**
 * Creates a predefined preset for pixel size.
 * @param definition Font size in pixels.
 * @returns
 */ function generatePixelPreset(definition) {
    // Extend a short (numeric value) definition.
    if (typeof definition === 'string') {
        definition = {
            title: definition,
            model: `${parseFloat(definition)}px`
        };
    }
    definition.view = {
        name: 'span',
        styles: {
            'font-size': definition.model
        }
    };
    return attachPriority(definition);
}
/**
 * Adds the priority to the view element definition if missing. It's required due to ckeditor/ckeditor5#2291
 */ function attachPriority(definition) {
    if (definition.view && typeof definition.view !== 'string' && !definition.view.priority) {
        definition.view.priority = 7;
    }
    return definition;
}
/**
 * Returns a prepared preset definition. If passed an object, a name of preset should be defined as `model` value.
 *
 * @param definition.model A preset name.
 */ function findPreset(definition) {
    return typeof definition === 'string' ? namedPresets[definition] : namedPresets[definition.model];
}
/**
 * We treat `definition` as completed if it is an object that contains `title`, `model` and `view` values.
 */ function isFullItemDefinition(definition) {
    return definition.title && definition.model && definition.view;
}
function isNumericalDefinition(definition) {
    let numberValue;
    if (typeof definition === 'object') {
        if (!definition.model) {
            /**
			 * Provided value as an option for {@link module:font/fontsize~FontSize} seems to invalid.
			 *
			 * See valid examples described in the {@link module:font/fontconfig~FontSizeConfig#options plugin configuration}.
			 *
			 * @error font-size-invalid-definition
			 */ throw new CKEditorError('font-size-invalid-definition', null, definition);
        } else {
            numberValue = parseFloat(definition.model);
        }
    } else {
        numberValue = parseFloat(definition);
    }
    return isNaN(numberValue);
}

// Mapping of `<font size="..">` styling to CSS's `font-size` values.
const styleFontSize = [
    'x-small',
    'x-small',
    'small',
    'medium',
    'large',
    'x-large',
    'xx-large',
    'xxx-large'
];
/**
 * The font size editing feature.
 *
 * It introduces the {@link module:font/fontsize/fontsizecommand~FontSizeCommand command} and the `fontSize`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span>` element with either:
 * * a style attribute (`<span style="font-size:12px">...</span>`),
 * * or a class attribute (`<span class="text-small">...</span>`)
 *
 * depending on the {@link module:font/fontconfig~FontSizeConfig configuration}.
 */ class FontSizeEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontSizeEditing';
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
        // Define default configuration using named presets.
        editor.config.define(FONT_SIZE, {
            options: [
                'tiny',
                'small',
                'default',
                'big',
                'huge'
            ],
            supportAllValues: false
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        // Allow fontSize attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: FONT_SIZE
        });
        editor.model.schema.setAttributeProperties(FONT_SIZE, {
            isFormatting: true,
            copyOnEnter: true
        });
        const supportAllValues = editor.config.get('fontSize.supportAllValues');
        // Define view to model conversion.
        const options = normalizeOptions(this.editor.config.get('fontSize.options')).filter((item)=>item.model);
        const definition = buildDefinition(FONT_SIZE, options);
        // Set-up the two-way conversion.
        if (supportAllValues) {
            this._prepareAnyValueConverters(definition);
            this._prepareCompatibilityConverter();
        } else {
            editor.conversion.attributeToElement(definition);
        }
        // Add FontSize command.
        editor.commands.add(FONT_SIZE, new FontSizeCommand(editor));
    }
    /**
	 * These converters enable keeping any value found as `style="font-size: *"` as a value of an attribute on a text even
	 * if it is not defined in the plugin configuration.
	 *
	 * @param definition Converter definition out of input data.
	 */ _prepareAnyValueConverters(definition) {
        const editor = this.editor;
        // If `fontSize.supportAllValues=true`, we do not allow to use named presets in the plugin's configuration.
        const presets = definition.model.values.filter((value)=>{
            return !isLengthStyleValue(String(value)) && !isPercentageStyleValue(String(value));
        });
        if (presets.length) {
            /**
			 * If {@link module:font/fontconfig~FontSizeConfig#supportAllValues `config.fontSize.supportAllValues`} is `true`,
			 * you need to use numerical values as font size options.
			 *
			 * See valid examples described in the {@link module:font/fontconfig~FontSizeConfig#options plugin configuration}.
			 *
			 * @error font-size-invalid-use-of-named-presets
			 * @param {Array.<string>} presets Invalid values.
			 */ throw new CKEditorError('font-size-invalid-use-of-named-presets', null, {
                presets
            });
        }
        editor.conversion.for('downcast').attributeToElement({
            model: FONT_SIZE,
            view: (attributeValue, { writer })=>{
                if (!attributeValue) {
                    return;
                }
                return writer.createAttributeElement('span', {
                    style: 'font-size:' + attributeValue
                }, {
                    priority: 7
                });
            }
        });
        editor.conversion.for('upcast').elementToAttribute({
            model: {
                key: FONT_SIZE,
                value: (viewElement)=>viewElement.getStyle('font-size')
            },
            view: {
                name: 'span',
                styles: {
                    'font-size': /.*/
                }
            }
        });
    }
    /**
	 * Adds support for legacy `<font size="..">` formatting.
	 */ _prepareCompatibilityConverter() {
        const editor = this.editor;
        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'font',
                attributes: {
                    // Documentation mentions sizes from 1 to 7. To handle old content we support all values
                    // up to 999 but clamp it to the valid range. Why 999? It should cover accidental values
                    // similar to percentage, e.g. 100%, 200% which could be the usual mistake for font size.
                    'size': /^[+-]?\d{1,3}$/
                }
            },
            model: {
                key: FONT_SIZE,
                value: (viewElement)=>{
                    const value = viewElement.getAttribute('size');
                    const isRelative = value[0] === '-' || value[0] === '+';
                    let size = parseInt(value, 10);
                    if (isRelative) {
                        // Add relative size (which can be negative) to the default size = 3.
                        size = 3 + size;
                    }
                    const maxSize = styleFontSize.length - 1;
                    const clampedSize = Math.min(Math.max(size, 0), maxSize);
                    return styleFontSize[clampedSize];
                }
            }
        });
    }
}

/**
 * The font size UI plugin. It introduces the `'fontSize'` dropdown.
 */ class FontSizeUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontSizeUI';
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
        const options = this._getLocalizedOptions();
        const command = editor.commands.get(FONT_SIZE);
        const accessibleLabel = t('Font Size');
        const listOptions = _prepareListOptions(options, command);
        // Register UI component.
        editor.ui.componentFactory.add(FONT_SIZE, (locale)=>{
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
            this.listenTo(dropdownView, 'execute', (evt)=>{
                editor.execute(evt.source.commandName, {
                    value: evt.source.commandParam
                });
                editor.editing.view.focus();
            });
            return dropdownView;
        });
        editor.ui.componentFactory.add(`menuBar:${FONT_SIZE}`, (locale)=>{
            const menuView = new MenuBarMenuView(locale);
            menuView.buttonView.set({
                label: accessibleLabel,
                icon: IconFontSize
            });
            menuView.bind('isEnabled').to(command);
            const listView = new MenuBarMenuListView(locale);
            for (const definition of listOptions){
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.set({
                    role: 'menuitemradio',
                    isToggleable: true
                });
                buttonView.bind(...Object.keys(definition.model)).to(definition.model);
                buttonView.delegate('execute').to(menuView);
                buttonView.on('execute', ()=>{
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
	 */ _getLocalizedOptions() {
        const editor = this.editor;
        const t = editor.t;
        const localizedTitles = {
            Default: t('Default'),
            Tiny: t('Tiny'),
            Small: t('Small'),
            Big: t('Big'),
            Huge: t('Huge')
        };
        const options = normalizeOptions(editor.config.get(FONT_SIZE).options);
        return options.map((option)=>{
            const title = localizedTitles[option.title];
            if (title && title != option.title) {
                // Clone the option to avoid altering the original `namedPresets` from `./utils.js`.
                option = Object.assign({}, option, {
                    title
                });
            }
            return option;
        });
    }
}
/**
 * Prepares FontSize dropdown items.
 */ function _prepareListOptions(options, command) {
    const itemDefinitions = new Collection();
    for (const option of options){
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
        def.model.bind('isOn').to(command, 'value', (value)=>value === option.model);
        // Add the option to the collection.
        itemDefinitions.add(def);
    }
    return itemDefinitions;
}

/**
 * The font size plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} and
 * {@link module:font/fontsize/fontsizeui~FontSizeUI} features in the editor.
 */ class FontSize extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FontSizeEditing,
            FontSizeUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontSize';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * Normalizes and translates the {@link module:font/fontconfig~FontSizeConfig#options configuration options}
	 * to the {@link module:font/fontconfig~FontSizeOption} format.
	 *
	 * @param options An array of options taken from the configuration.
	 */ normalizeSizeOptions(options) {
        return normalizeOptions(options);
    }
}

/**
 * The font color command. It is used by {@link module:font/fontcolor/fontcolorediting~FontColorEditing}
 * to apply the font color.
 *
 * ```ts
 * editor.execute( 'fontColor', { value: 'rgb(250, 20, 20)' } );
 * ```
 *
 * **Note**: Executing the command with the `null` value removes the attribute from the model.
 */ class FontColorCommand extends FontCommand {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor, FONT_COLOR);
    }
}

/**
 * The font color editing feature.
 *
 * It introduces the {@link module:font/fontcolor/fontcolorcommand~FontColorCommand command} and
 * the `fontColor` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as a `<span>` element (`<span style="color: ...">`),
 * depending on the {@link module:font/fontconfig~FontColorConfig configuration}.
 */ class FontColorEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontColorEditing';
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
        editor.config.define(FONT_COLOR, {
            colors: [
                {
                    color: 'hsl(0, 0%, 0%)',
                    label: 'Black'
                },
                {
                    color: 'hsl(0, 0%, 30%)',
                    label: 'Dim grey'
                },
                {
                    color: 'hsl(0, 0%, 60%)',
                    label: 'Grey'
                },
                {
                    color: 'hsl(0, 0%, 90%)',
                    label: 'Light grey'
                },
                {
                    color: 'hsl(0, 0%, 100%)',
                    label: 'White',
                    hasBorder: true
                },
                {
                    color: 'hsl(0, 75%, 60%)',
                    label: 'Red'
                },
                {
                    color: 'hsl(30, 75%, 60%)',
                    label: 'Orange'
                },
                {
                    color: 'hsl(60, 75%, 60%)',
                    label: 'Yellow'
                },
                {
                    color: 'hsl(90, 75%, 60%)',
                    label: 'Light green'
                },
                {
                    color: 'hsl(120, 75%, 60%)',
                    label: 'Green'
                },
                {
                    color: 'hsl(150, 75%, 60%)',
                    label: 'Aquamarine'
                },
                {
                    color: 'hsl(180, 75%, 60%)',
                    label: 'Turquoise'
                },
                {
                    color: 'hsl(210, 75%, 60%)',
                    label: 'Light blue'
                },
                {
                    color: 'hsl(240, 75%, 60%)',
                    label: 'Blue'
                },
                {
                    color: 'hsl(270, 75%, 60%)',
                    label: 'Purple'
                }
            ],
            columns: 5
        });
        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'span',
                styles: {
                    'color': /[\s\S]+/
                }
            },
            model: {
                key: FONT_COLOR,
                value: renderUpcastAttribute('color')
            }
        });
        // Support legacy `<font color="..">` formatting.
        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'font',
                attributes: {
                    'color': /^#?\w+$/
                }
            },
            model: {
                key: FONT_COLOR,
                value: (viewElement)=>viewElement.getAttribute('color')
            }
        });
        editor.conversion.for('downcast').attributeToElement({
            model: FONT_COLOR,
            view: renderDowncastElement('color')
        });
        editor.commands.add(FONT_COLOR, new FontColorCommand(editor));
        // Allow the font color attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: FONT_COLOR
        });
        editor.model.schema.setAttributeProperties(FONT_COLOR, {
            isFormatting: true,
            copyOnEnter: true
        });
    }
}

/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * It is used to create the `'fontBackgroundColor'` and `'fontColor'` dropdowns, each hosting
 * a {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
 */ class FontColorUIBase extends Plugin {
    /**
	 * The name of the command which will be executed when a color tile is clicked.
	 */ commandName;
    /**
	 * The name of this component in the {@link module:ui/componentfactory~ComponentFactory}.
	 * Also the configuration scope name in `editor.config`.
	 */ componentName;
    /**
	 * The SVG icon used by the dropdown.
	 */ icon;
    /**
	 * The label used by the dropdown.
	 */ dropdownLabel;
    /**
	 * The number of columns in the color grid.
	 */ columns;
    /**
	 * Creates a plugin which introduces a dropdown with a pre–configured
	 * {@link module:ui/colorselector/colorselectorview~ColorSelectorView}.
	 *
	 * @param editor An editor instance.
	 * @param config The configuration object.
	 * @param config.commandName The name of the command which will be executed when a color tile is clicked.
	 * @param config.componentName The name of the dropdown in the {@link module:ui/componentfactory~ComponentFactory}
	 * and the configuration scope name in `editor.config`.
	 * @param config.icon The SVG icon used by the dropdown.
	 * @param config.dropdownLabel The label used by the dropdown.
	 */ constructor(editor, { commandName, componentName, icon, dropdownLabel }){
        super(editor);
        this.commandName = commandName;
        this.componentName = componentName;
        this.icon = icon;
        this.dropdownLabel = dropdownLabel;
        this.columns = editor.config.get(`${this.componentName}.columns`);
    }
    /**
	* @inheritDoc
	*/ init() {
        const editor = this.editor;
        const locale = editor.locale;
        const t = locale.t;
        const command = editor.commands.get(this.commandName);
        const componentConfig = editor.config.get(this.componentName);
        const colorsConfig = normalizeColorOptions(componentConfig.colors);
        const localizedColors = getLocalizedColorOptions(locale, colorsConfig);
        const documentColorsCount = componentConfig.documentColors;
        const hasColorPicker = componentConfig.colorPicker !== false;
        // Register the UI component.
        editor.ui.componentFactory.add(this.componentName, (locale)=>{
            const dropdownView = createDropdown(locale);
            // Font color dropdown rendering is deferred once it gets open to improve performance (#6192).
            let dropdownContentRendered = false;
            const colorSelectorView = addColorSelectorToDropdown({
                dropdownView,
                colors: localizedColors.map((option)=>({
                        label: option.label,
                        color: option.model,
                        options: {
                            hasBorder: option.hasBorder
                        }
                    })),
                columns: this.columns,
                removeButtonLabel: t('Remove color'),
                colorPickerLabel: t('Color picker'),
                documentColorsLabel: documentColorsCount !== 0 ? t('Document colors') : '',
                documentColorsCount: documentColorsCount === undefined ? this.columns : documentColorsCount,
                colorPickerViewConfig: hasColorPicker ? componentConfig.colorPicker || {} : false
            });
            colorSelectorView.bind('selectedColor').to(command, 'value');
            dropdownView.buttonView.set({
                label: this.dropdownLabel,
                icon: this.icon,
                tooltip: true
            });
            dropdownView.extendTemplate({
                attributes: {
                    class: 'ck-color-ui-dropdown'
                }
            });
            dropdownView.bind('isEnabled').to(command);
            colorSelectorView.on('execute', (evt, data)=>{
                if (dropdownView.isOpen) {
                    editor.execute(this.commandName, {
                        value: data.value,
                        batch: this._undoStepBatch
                    });
                }
                if (data.source !== 'colorPicker') {
                    editor.editing.view.focus();
                }
                if (data.source === 'colorPickerSaveButton') {
                    dropdownView.isOpen = false;
                }
            });
            colorSelectorView.on('colorPicker:show', ()=>{
                this._undoStepBatch = editor.model.createBatch();
            });
            colorSelectorView.on('colorPicker:cancel', ()=>{
                if (this._undoStepBatch.operations.length) {
                    // We need to close the dropdown before the undo batch.
                    // Otherwise, FontColorUIBase treats undo as a selected color change,
                    // propagating the update to the whole selection.
                    // That's an issue if spans with various colors were selected.
                    dropdownView.isOpen = false;
                    editor.execute('undo', this._undoStepBatch);
                }
                editor.editing.view.focus();
            });
            dropdownView.on('change:isOpen', (evt, name, isVisible)=>{
                if (!dropdownContentRendered) {
                    dropdownContentRendered = true;
                    dropdownView.colorSelectorView.appendUI();
                }
                if (isVisible) {
                    if (documentColorsCount !== 0) {
                        colorSelectorView.updateDocumentColors(editor.model, this.componentName);
                    }
                    colorSelectorView.updateSelectedColors();
                    colorSelectorView.showColorGridsFragment();
                }
            });
            // Accessibility: focus the first active color when opening the dropdown.
            focusChildOnDropdownOpen(dropdownView, ()=>dropdownView.colorSelectorView.colorGridsFragmentView.staticColorsGrid.items.find((item)=>item.isOn));
            return dropdownView;
        });
        // Register menu bar button..
        editor.ui.componentFactory.add(`menuBar:${this.componentName}`, (locale)=>{
            const menuView = new MenuBarMenuView(locale);
            menuView.buttonView.set({
                label: this.dropdownLabel,
                icon: this.icon
            });
            menuView.bind('isEnabled').to(command);
            // Font color sub-menu rendering is deferred once it gets open to improve performance (#6192).
            let contentRendered = false;
            const colorSelectorView = new ColorSelectorView(locale, {
                colors: localizedColors.map((option)=>({
                        label: option.label,
                        color: option.model,
                        options: {
                            hasBorder: option.hasBorder
                        }
                    })),
                columns: this.columns,
                removeButtonLabel: t('Remove color'),
                colorPickerLabel: t('Color picker'),
                documentColorsLabel: documentColorsCount !== 0 ? t('Document colors') : '',
                documentColorsCount: documentColorsCount === undefined ? this.columns : documentColorsCount,
                colorPickerViewConfig: false
            });
            colorSelectorView.bind('selectedColor').to(command, 'value');
            colorSelectorView.delegate('execute').to(menuView);
            colorSelectorView.on('execute', (evt, data)=>{
                editor.execute(this.commandName, {
                    value: data.value,
                    batch: this._undoStepBatch
                });
                editor.editing.view.focus();
            });
            menuView.on('change:isOpen', (evt, name, isVisible)=>{
                if (!contentRendered) {
                    contentRendered = true;
                    colorSelectorView.appendUI();
                }
                if (isVisible) {
                    if (documentColorsCount !== 0) {
                        colorSelectorView.updateDocumentColors(editor.model, this.componentName);
                    }
                    colorSelectorView.updateSelectedColors();
                    colorSelectorView.showColorGridsFragment();
                }
            });
            menuView.panelView.children.add(colorSelectorView);
            return menuView;
        });
    }
}

/**
 * The font color UI plugin. It introduces the `'fontColor'` dropdown.
 */ class FontColorUI extends FontColorUIBase {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        const t = editor.locale.t;
        super(editor, {
            commandName: FONT_COLOR,
            componentName: FONT_COLOR,
            icon: IconFontColor,
            dropdownLabel: t('Font Color')
        });
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontColorUI';
    }
}

/**
 * The font color plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads the {@link module:font/fontcolor/fontcolorediting~FontColorEditing} and
 * {@link module:font/fontcolor/fontcolorui~FontColorUI} features in the editor.
 */ class FontColor extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FontColorEditing,
            FontColorUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontColor';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The font background color command. It is used by
 * {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing}
 * to apply the font background color.
 *
 * ```ts
 * editor.execute( 'fontBackgroundColor', { value: 'rgb(250, 20, 20)' } );
 * ```
 *
 * **Note**: Executing the command with the `null` value removes the attribute from the model.
 */ class FontBackgroundColorCommand extends FontCommand {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor, FONT_BACKGROUND_COLOR);
    }
}

/**
 * The font background color editing feature.
 *
 * It introduces the {@link module:font/fontbackgroundcolor/fontbackgroundcolorcommand~FontBackgroundColorCommand command} and
 * the `fontBackgroundColor` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as a `<span>` element (`<span style="background-color: ...">`),
 * depending on the {@link module:font/fontconfig~FontColorConfig configuration}.
 */ class FontBackgroundColorEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontBackgroundColorEditing';
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
        editor.config.define(FONT_BACKGROUND_COLOR, {
            colors: [
                {
                    color: 'hsl(0, 0%, 0%)',
                    label: 'Black'
                },
                {
                    color: 'hsl(0, 0%, 30%)',
                    label: 'Dim grey'
                },
                {
                    color: 'hsl(0, 0%, 60%)',
                    label: 'Grey'
                },
                {
                    color: 'hsl(0, 0%, 90%)',
                    label: 'Light grey'
                },
                {
                    color: 'hsl(0, 0%, 100%)',
                    label: 'White',
                    hasBorder: true
                },
                {
                    color: 'hsl(0, 75%, 60%)',
                    label: 'Red'
                },
                {
                    color: 'hsl(30, 75%, 60%)',
                    label: 'Orange'
                },
                {
                    color: 'hsl(60, 75%, 60%)',
                    label: 'Yellow'
                },
                {
                    color: 'hsl(90, 75%, 60%)',
                    label: 'Light green'
                },
                {
                    color: 'hsl(120, 75%, 60%)',
                    label: 'Green'
                },
                {
                    color: 'hsl(150, 75%, 60%)',
                    label: 'Aquamarine'
                },
                {
                    color: 'hsl(180, 75%, 60%)',
                    label: 'Turquoise'
                },
                {
                    color: 'hsl(210, 75%, 60%)',
                    label: 'Light blue'
                },
                {
                    color: 'hsl(240, 75%, 60%)',
                    label: 'Blue'
                },
                {
                    color: 'hsl(270, 75%, 60%)',
                    label: 'Purple'
                }
            ],
            columns: 5
        });
        editor.data.addStyleProcessorRules(addBackgroundStylesRules);
        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'span',
                styles: {
                    'background-color': /[\s\S]+/
                }
            },
            model: {
                key: FONT_BACKGROUND_COLOR,
                value: renderUpcastAttribute('background-color')
            }
        });
        editor.conversion.for('downcast').attributeToElement({
            model: FONT_BACKGROUND_COLOR,
            view: renderDowncastElement('background-color')
        });
        editor.commands.add(FONT_BACKGROUND_COLOR, new FontBackgroundColorCommand(editor));
        // Allow the font backgroundColor attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: FONT_BACKGROUND_COLOR
        });
        editor.model.schema.setAttributeProperties(FONT_BACKGROUND_COLOR, {
            isFormatting: true,
            copyOnEnter: true
        });
    }
}

/**
 * The font background color UI plugin. It introduces the `'fontBackgroundColor'` dropdown.
 */ class FontBackgroundColorUI extends FontColorUIBase {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        const t = editor.locale.t;
        super(editor, {
            commandName: FONT_BACKGROUND_COLOR,
            componentName: FONT_BACKGROUND_COLOR,
            icon: IconFontBackground,
            dropdownLabel: t('Font Background Color')
        });
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontBackgroundColorUI';
    }
}

/**
 * The font background color plugin.
 *
 * For a detailed overview, check the {@glink features/font font feature} documentation
 * and the {@glink api/font package page}.
 *
 * This is a "glue" plugin which loads
 * the {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing} and
 * {@link module:font/fontbackgroundcolor/fontbackgroundcolorui~FontBackgroundColorUI} features in the editor.
 */ class FontBackgroundColor extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FontBackgroundColorEditing,
            FontBackgroundColorUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'FontBackgroundColor';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * A plugin that enables a set of text styling features:
 *
 * * {@link module:font/fontsize~FontSize},
 * * {@link module:font/fontfamily~FontFamily}.
 * * {@link module:font/fontcolor~FontColor},
 * * {@link module:font/fontbackgroundcolor~FontBackgroundColor}.
 *
 * For a detailed overview, check the {@glink features/font Font feature} documentation
 * and the {@glink api/font package page}.
 */ class Font extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FontFamily,
            FontSize,
            FontColor,
            FontBackgroundColor
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Font';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { Font, FontBackgroundColor, FontBackgroundColorCommand, FontBackgroundColorEditing, FontBackgroundColorUI, FontColor, FontColorCommand, FontColorEditing, FontColorUI, FontColorUIBase, FontCommand, FontFamily, FontFamilyCommand, FontFamilyEditing, FontFamilyUI, FontSize, FontSizeCommand, FontSizeEditing, FontSizeUI, addColorSelectorToDropdown as _addFontColorSelectorToDropdown, buildDefinition as _buildFontDefinition, normalizeOptions$1 as _normalizeFontFamilyOptions, normalizeOptions as _normalizeFontSizeOptions, renderDowncastElement as _renderDowncastFontElement, renderUpcastAttribute as _renderUpcastFontColorAttribute };
//# sourceMappingURL=index.js.map

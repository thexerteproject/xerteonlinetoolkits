/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ModelDocumentSelection } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { getLanguageDirection, Collection } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { createDropdown, addListToDropdown, MenuBarMenuView, MenuBarMenuListView, ListSeparatorView, MenuBarMenuListItemView, MenuBarMenuListItemButtonView, UIModel } from '@ckeditor/ckeditor5-ui/dist/index.js';

/**
 * Returns the language attribute value in a human-readable text format:
 *
 * ```
 * <languageCode>:<textDirection>
 * ```
 *
 * * `languageCode` - The language code used for the `lang` attribute in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) format.
 * * `textDirection` - One of the following values: `rtl` or `ltr`, indicating the reading direction of the language.
 *
 * See the {@link module:core/editor/editorconfig~LanguageConfig#textPartLanguage text part language configuration}
 * for more information about language properties.
 *
 * If the `textDirection` argument is omitted, it will be automatically detected based on `languageCode`.
 *
 * @param languageCode The language code in the ISO 639-1 format.
 * @param textDirection The language text direction. Automatically detected if omitted.
 * @internal
 */ function stringifyLanguageAttribute(languageCode, textDirection) {
    textDirection = textDirection || getLanguageDirection(languageCode);
    return `${languageCode}:${textDirection}`;
}
/**
 * Retrieves language properties converted to attribute value by the
 * {@link module:language/utils~stringifyLanguageAttribute stringifyLanguageAttribute} function.
 *
 * @internal
 * @param str The attribute value.
 * @returns The object with properties:
 * * languageCode - The language code in the ISO 639 format.
 * * textDirection - The language text direction.
 */ function parseLanguageAttribute(str) {
    const [languageCode, textDirection] = str.split(':');
    return {
        languageCode,
        textDirection
    };
}

/**
 * The text part language command plugin.
 */ class TextPartLanguageCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const doc = model.document;
        this.value = this._getValueFromFirstAllowedNode();
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'language');
    }
    /**
	 * Executes the command. Applies the attribute to the selection or removes it from the selection.
	 *
	 * If `languageCode` is set to `false` or a `null` value, it will remove attributes. Otherwise, it will set
	 * the attribute in the `{@link #value value}` format.
	 *
	 * The execution result differs, depending on the {@link module:engine/model/document~ModelDocument#selection}:
	 *
	 * * If the selection is on a range, the command applies the attribute to all nodes in that range
	 * (if they are allowed to have this attribute by the {@link module:engine/model/schema~ModelSchema schema}).
	 * * If the selection is collapsed in a non-empty node, the command applies the attribute to the
	 * {@link module:engine/model/document~ModelDocument#selection} itself (note that typed characters copy attributes from the selection).
	 * * If the selection is collapsed in an empty node, the command applies the attribute to the parent node of the selection (note
	 * that the selection inherits all attributes from a node if it is in an empty node).
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.languageCode The language code to be applied to the model.
	 * @param options.textDirection The language text direction.
	 */ execute({ languageCode, textDirection } = {}) {
        const model = this.editor.model;
        const doc = model.document;
        const selection = doc.selection;
        const value = languageCode ? stringifyLanguageAttribute(languageCode, textDirection) : false;
        model.change((writer)=>{
            if (selection.isCollapsed) {
                if (value) {
                    writer.setSelectionAttribute('language', value);
                } else {
                    writer.removeSelectionAttribute('language');
                }
            } else {
                const ranges = model.schema.getValidRanges(selection.getRanges(), 'language', {
                    includeEmptyRanges: true
                });
                for (const range of ranges){
                    let itemOrRange = range;
                    let attributeKey = 'language';
                    if (range.isCollapsed) {
                        itemOrRange = range.start.parent;
                        attributeKey = ModelDocumentSelection._getStoreAttributeKey('language');
                    }
                    if (value) {
                        writer.setAttribute(attributeKey, value, itemOrRange);
                    } else {
                        writer.removeAttribute(attributeKey, itemOrRange);
                    }
                }
            }
        });
    }
    /**
	 * Returns the attribute value of the first node in the selection that allows the attribute.
	 * For a collapsed selection it returns the selection attribute.
	 *
	 * @returns The attribute value.
	 */ _getValueFromFirstAllowedNode() {
        const model = this.editor.model;
        const schema = model.schema;
        const selection = model.document.selection;
        if (selection.isCollapsed) {
            return selection.getAttribute('language') || false;
        }
        for (const range of selection.getRanges()){
            for (const item of range.getItems()){
                if (schema.checkAttribute(item, 'language')) {
                    return item.getAttribute('language') || false;
                }
            }
        }
        return false;
    }
}

/**
 * The text part language editing.
 *
 * Introduces the `'textPartLanguage'` command and the `'language'` model element attribute.
 */ class TextPartLanguageEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TextPartLanguageEditing';
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
        // Text part language options are only used to ensure that the feature works by default.
        // In the real usage it should be reconfigured by a developer. We are not providing
        // translations for `title` properties on purpose, as it's only an example configuration.
        editor.config.define('language', {
            textPartLanguage: [
                {
                    title: 'Arabic',
                    languageCode: 'ar'
                },
                {
                    title: 'French',
                    languageCode: 'fr'
                },
                {
                    title: 'Spanish',
                    languageCode: 'es'
                }
            ]
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        editor.model.schema.extend('$text', {
            allowAttributes: 'language'
        });
        editor.model.schema.setAttributeProperties('language', {
            copyOnEnter: true
        });
        this._defineConverters();
        editor.commands.add('textPartLanguage', new TextPartLanguageCommand(editor));
    }
    /**
	 * @private
	 */ _defineConverters() {
        const conversion = this.editor.conversion;
        conversion.for('upcast').elementToAttribute({
            model: {
                key: 'language',
                value: (viewElement)=>{
                    const languageCode = viewElement.getAttribute('lang');
                    const textDirection = viewElement.getAttribute('dir');
                    return stringifyLanguageAttribute(languageCode, textDirection);
                }
            },
            view: {
                name: 'span',
                attributes: {
                    lang: /[\s\S]+/
                }
            }
        });
        conversion.for('downcast').attributeToElement({
            model: 'language',
            view: (attributeValue, { writer }, data)=>{
                if (!attributeValue) {
                    return;
                }
                if (!data.item.is('$textProxy') && !data.item.is('documentSelection')) {
                    return;
                }
                const { languageCode, textDirection } = parseLanguageAttribute(attributeValue);
                return writer.createAttributeElement('span', {
                    lang: languageCode,
                    dir: textDirection
                });
            }
        });
    }
}

/**
 * The text part language UI plugin.
 *
 * It introduces the `'language'` dropdown.
 */ class TextPartLanguageUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TextPartLanguageUI';
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
        const defaultTitle = t('Choose language');
        const accessibleLabel = t('Language');
        // Register UI component.
        editor.ui.componentFactory.add('textPartLanguage', (locale)=>{
            const { definitions, titles } = this._getItemMetadata();
            const languageCommand = editor.commands.get('textPartLanguage');
            const dropdownView = createDropdown(locale);
            addListToDropdown(dropdownView, definitions, {
                ariaLabel: accessibleLabel,
                role: 'menu'
            });
            dropdownView.buttonView.set({
                ariaLabel: accessibleLabel,
                ariaLabelledBy: undefined,
                isOn: false,
                withText: true,
                tooltip: accessibleLabel
            });
            dropdownView.extendTemplate({
                attributes: {
                    class: [
                        'ck-text-fragment-language-dropdown'
                    ]
                }
            });
            dropdownView.bind('isEnabled').to(languageCommand, 'isEnabled');
            dropdownView.buttonView.bind('label').to(languageCommand, 'value', (value)=>{
                return value && titles[value] || defaultTitle;
            });
            dropdownView.buttonView.bind('ariaLabel').to(languageCommand, 'value', (value)=>{
                const selectedLanguageTitle = value && titles[value];
                if (!selectedLanguageTitle) {
                    return accessibleLabel;
                }
                return `${selectedLanguageTitle}, ${accessibleLabel}`;
            });
            // Execute command when an item from the dropdown is selected.
            this.listenTo(dropdownView, 'execute', (evt)=>{
                languageCommand.execute({
                    languageCode: evt.source.languageCode,
                    textDirection: evt.source.textDirection
                });
                editor.editing.view.focus();
            });
            return dropdownView;
        });
        // Register menu bar UI component.
        editor.ui.componentFactory.add('menuBar:textPartLanguage', (locale)=>{
            const { definitions } = this._getItemMetadata();
            const languageCommand = editor.commands.get('textPartLanguage');
            const menuView = new MenuBarMenuView(locale);
            menuView.buttonView.set({
                label: accessibleLabel
            });
            const listView = new MenuBarMenuListView(locale);
            listView.set({
                ariaLabel: t('Language'),
                role: 'menu'
            });
            for (const definition of definitions){
                if (definition.type != 'button') {
                    listView.items.add(new ListSeparatorView(locale));
                    continue;
                }
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.set({
                    role: 'menuitemradio',
                    isToggleable: true
                });
                buttonView.bind(...Object.keys(definition.model)).to(definition.model);
                buttonView.delegate('execute').to(menuView);
                listItemView.children.add(buttonView);
                listView.items.add(listItemView);
            }
            menuView.bind('isEnabled').to(languageCommand, 'isEnabled');
            menuView.panelView.children.add(listView);
            menuView.on('execute', (evt)=>{
                languageCommand.execute({
                    languageCode: evt.source.languageCode,
                    textDirection: evt.source.textDirection
                });
                editor.editing.view.focus();
            });
            return menuView;
        });
    }
    /**
	 * Returns metadata for dropdown and menu items.
	 */ _getItemMetadata() {
        const editor = this.editor;
        const itemDefinitions = new Collection();
        const titles = {};
        const languageCommand = editor.commands.get('textPartLanguage');
        const options = editor.config.get('language.textPartLanguage');
        const t = editor.locale.t;
        const removeTitle = t('Remove language');
        // Item definition with false `languageCode` will behave as remove lang button.
        itemDefinitions.add({
            type: 'button',
            model: new UIModel({
                label: removeTitle,
                languageCode: false,
                withText: true
            })
        });
        itemDefinitions.add({
            type: 'separator'
        });
        for (const option of options){
            const def = {
                type: 'button',
                model: new UIModel({
                    label: option.title,
                    languageCode: option.languageCode,
                    role: 'menuitemradio',
                    textDirection: option.textDirection,
                    withText: true
                })
            };
            const language = stringifyLanguageAttribute(option.languageCode, option.textDirection);
            def.model.bind('isOn').to(languageCommand, 'value', (value)=>value === language);
            itemDefinitions.add(def);
            titles[language] = option.title;
        }
        return {
            definitions: itemDefinitions,
            titles
        };
    }
}

/**
 * The text part language feature.
 *
 * This feature allows setting a language of the document's text part to support
 * [WCAG 3.1.2 Language of Parts](https://www.w3.org/TR/UNDERSTANDING-WCAG20/meaning-other-lang-id.html) specification.
 *
 * To change the editor's UI language, refer to the {@glink getting-started/setup/ui-language Setting the UI language} guide.
 *
 * For more information about this feature, check the {@glink api/language package page} as well as the {@glink features/language
 * Text part language} feature guide.
 *
 * This is a "glue" plugin which loads the
 * {@link module:language/textpartlanguageediting~TextPartLanguageEditing text part language editing feature}
 * and the {@link module:language/textpartlanguageui~TextPartLanguageUI text part language UI feature}.
 */ class TextPartLanguage extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TextPartLanguageEditing,
            TextPartLanguageUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TextPartLanguage';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { TextPartLanguage, TextPartLanguageCommand, TextPartLanguageEditing, TextPartLanguageUI, parseLanguageAttribute as _parseLanguageAttribute, stringifyLanguageAttribute as _stringifyLanguageAttribute };
//# sourceMappingURL=index.js.map

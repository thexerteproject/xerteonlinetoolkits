/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module indent/indentblock
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { addMarginStylesRules } from 'ckeditor5/src/engine.js';
import { IndentBlockCommand } from './indentblockcommand.js';
import { IndentUsingOffset } from './indentcommandbehavior/indentusingoffset.js';
import { IndentUsingClasses } from './indentcommandbehavior/indentusingclasses.js';
import { IndentBlockListIntegration } from './integrations/indentblocklistintegration.js';
const DEFAULT_ELEMENTS = ['paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6'];
/**
 * The block indentation feature.
 *
 * It registers the `'indentBlock'` and `'outdentBlock'` commands.
 *
 * If the plugin {@link module:indent/indent~Indent} is defined, it also attaches the `'indentBlock'` and `'outdentBlock'` commands to
 * the `'indent'` and `'outdent'` commands.
 */
export class IndentBlock extends Plugin {
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        editor.config.define('indentBlock', {
            offset: 40,
            unit: 'px'
        });
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'IndentBlock';
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
        return [IndentBlockListIntegration];
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const configuration = editor.config.get('indentBlock');
        if (configuration.classes && configuration.classes.length) {
            this._setupConversionUsingClasses(configuration.classes);
            editor.commands.add('indentBlock', new IndentBlockCommand(editor, new IndentUsingClasses({
                direction: 'forward',
                classes: configuration.classes
            })));
            editor.commands.add('outdentBlock', new IndentBlockCommand(editor, new IndentUsingClasses({
                direction: 'backward',
                classes: configuration.classes
            })));
        }
        else {
            editor.data.addStyleProcessorRules(addMarginStylesRules);
            this._setupConversionUsingOffset();
            editor.commands.add('indentBlock', new IndentBlockCommand(editor, new IndentUsingOffset({
                direction: 'forward',
                offset: configuration.offset,
                unit: configuration.unit
            })));
            editor.commands.add('outdentBlock', new IndentBlockCommand(editor, new IndentUsingOffset({
                direction: 'backward',
                offset: configuration.offset,
                unit: configuration.unit
            })));
        }
    }
    /**
     * @inheritDoc
     */
    afterInit() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const indentCommand = editor.commands.get('indent');
        const outdentCommand = editor.commands.get('outdent');
        // Enable block indentation to heading configuration options. If it is not defined enable in paragraph and default headings.
        const options = editor.config.get('heading.options');
        const configuredElements = options && options.map(option => option.model);
        const knownElements = configuredElements || DEFAULT_ELEMENTS;
        knownElements.forEach(elementName => {
            if (schema.isRegistered(elementName)) {
                schema.extend(elementName, { allowAttributes: 'blockIndent' });
            }
        });
        schema.setAttributeProperties('blockIndent', { isFormatting: true });
        indentCommand.registerChildCommand(editor.commands.get('indentBlock'));
        outdentCommand.registerChildCommand(editor.commands.get('outdentBlock'));
    }
    /**
     * Setups conversion for using offset indents.
     */
    _setupConversionUsingOffset() {
        const conversion = this.editor.conversion;
        const locale = this.editor.locale;
        const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
        conversion.for('upcast').attributeToAttribute({
            view: {
                styles: {
                    [marginProperty]: /[\s\S]+/
                }
            },
            model: {
                key: 'blockIndent',
                value: (viewElement) => {
                    // Do not indent block elements in Document Lists. See https://github.com/ckeditor/ckeditor5/issues/12466.
                    if (!viewElement.is('element', 'li')) {
                        return viewElement.getStyle(marginProperty);
                    }
                }
            }
        });
        conversion.for('downcast').attributeToAttribute({
            model: 'blockIndent',
            view: modelAttributeValue => {
                return {
                    key: 'style',
                    value: {
                        [marginProperty]: modelAttributeValue
                    }
                };
            }
        });
    }
    /**
     * Setups conversion for using classes.
     */
    _setupConversionUsingClasses(classes) {
        const definition = {
            model: {
                key: 'blockIndent',
                values: []
            },
            view: {}
        };
        for (const className of classes) {
            definition.model.values.push(className);
            definition.view[className] = {
                key: 'class',
                value: [className]
            };
        }
        this.editor.conversion.attributeToAttribute(definition);
    }
}

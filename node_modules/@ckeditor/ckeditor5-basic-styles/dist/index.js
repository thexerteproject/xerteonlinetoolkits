/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ModelDocumentSelection } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { IconBold, IconCode, IconItalic, IconStrikethrough, IconSubscript, IconSuperscript, IconUnderline } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { MenuBarMenuListItemButtonView, ButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { TwoStepCaretMovement, inlineHighlight } from '@ckeditor/ckeditor5-typing/dist/index.js';

/**
 * An extension of the base {@link module:core/command~Command} class, which provides utilities for a command
 * that toggles a single attribute on a text or an element.
 *
 * `AttributeCommand` uses {@link module:engine/model/document~ModelDocument#selection}
 * to decide which nodes (if any) should be changed, and applies or removes the attribute from them.
 *
 * The command checks the {@link module:engine/model/model~Model#schema} to decide if it can be enabled
 * for the current selection and to which nodes the attribute can be applied.
 */ class AttributeCommand extends Command {
    /**
	 * The attribute that will be set by the command.
	 */ attributeKey;
    /**
	 * @param attributeKey Attribute that will be set by the command.
	 */ constructor(editor, attributeKey){
        super(editor);
        this.attributeKey = attributeKey;
    }
    /**
	 * Updates the command's {@link #value} and {@link #isEnabled} based on the current selection.
	 */ refresh() {
        const model = this.editor.model;
        const doc = model.document;
        this.value = this._getValueFromFirstAllowedNode();
        this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, this.attributeKey);
    }
    /**
	 * Executes the command &ndash; applies the attribute to the selection or removes it from the selection.
	 *
	 * If the command is active (`value == true`), it will remove attributes. Otherwise, it will set attributes.
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
	 * @param options.forceValue If set, it will force the command behavior. If `true`,
	 * the command will apply the attribute, otherwise the command will remove the attribute.
	 * If not set, the command will look for its current value to decide what it should do.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const doc = model.document;
        const selection = doc.selection;
        const value = options.forceValue === undefined ? !this.value : options.forceValue;
        model.change((writer)=>{
            if (selection.isCollapsed) {
                if (value) {
                    writer.setSelectionAttribute(this.attributeKey, true);
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
        });
    }
    /**
	 * Checks the attribute value of the first node in the selection that allows the attribute.
	 * For the collapsed selection returns the selection attribute.
	 *
	 * @returns The attribute value.
	 */ _getValueFromFirstAllowedNode() {
        const model = this.editor.model;
        const schema = model.schema;
        const selection = model.document.selection;
        if (selection.isCollapsed) {
            return selection.hasAttribute(this.attributeKey);
        }
        for (const range of selection.getRanges()){
            for (const item of range.getItems()){
                if (schema.checkAttribute(item, this.attributeKey)) {
                    return item.hasAttribute(this.attributeKey);
                }
            }
        }
        return false;
    }
}

const BOLD$1 = 'bold';
/**
 * The bold editing feature.
 *
 * It registers the `'bold'` command and introduces the `bold` attribute in the model which renders to the view
 * as a `<strong>` element.
 */ class BoldEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'BoldEditing';
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
        const t = this.editor.t;
        // Allow bold attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: BOLD$1
        });
        editor.model.schema.setAttributeProperties(BOLD$1, {
            isFormatting: true,
            copyOnEnter: true
        });
        // Build converter from model to view for data and editing pipelines.
        editor.conversion.attributeToElement({
            model: BOLD$1,
            view: 'strong',
            upcastAlso: [
                'b',
                (viewElement)=>{
                    const fontWeight = viewElement.getStyle('font-weight');
                    if (!fontWeight) {
                        return null;
                    }
                    // Value of the `font-weight` attribute can be defined as a string or a number.
                    if (fontWeight == 'bold' || Number(fontWeight) >= 600) {
                        return {
                            name: true,
                            styles: [
                                'font-weight'
                            ]
                        };
                    }
                    return null;
                }
            ]
        });
        // Create bold command.
        editor.commands.add(BOLD$1, new AttributeCommand(editor, BOLD$1));
        // Set the Ctrl+B keystroke.
        editor.keystrokes.set('CTRL+B', BOLD$1);
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Bold text'),
                    keystroke: 'CTRL+B'
                }
            ]
        });
    }
}

/**
 * Returns a function that creates a (toolbar or menu bar) button for a basic style feature.
 *
 * @internal
 */ function getButtonCreator({ editor, commandName, plugin, icon, label, keystroke }) {
    return (ButtonClass)=>{
        const command = editor.commands.get(commandName);
        const view = new ButtonClass(editor.locale);
        view.set({
            label,
            icon,
            keystroke,
            isToggleable: true
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        view.bind('isOn').to(command, 'value');
        if (view instanceof MenuBarMenuListItemButtonView) {
            view.set({
                role: 'menuitemcheckbox'
            });
        } else {
            view.set({
                tooltip: true
            });
        }
        // Execute the command.
        plugin.listenTo(view, 'execute', ()=>{
            editor.execute(commandName);
            editor.editing.view.focus();
        });
        return view;
    };
}

const BOLD = 'bold';
/**
 * The bold UI feature. It introduces the Bold button.
 */ class BoldUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'BoldUI';
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
        const t = editor.locale.t;
        const createButton = getButtonCreator({
            editor,
            commandName: BOLD,
            plugin: this,
            icon: IconBold,
            label: t('Bold'),
            keystroke: 'CTRL+B'
        });
        // Add bold button to feature components.
        editor.ui.componentFactory.add(BOLD, ()=>createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + BOLD, ()=>createButton(MenuBarMenuListItemButtonView));
    }
}

/**
 * The bold feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/bold/boldediting~BoldEditing bold editing feature}
 * and {@link module:basic-styles/bold/boldui~BoldUI bold UI feature}.
 */ class Bold extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            BoldEditing,
            BoldUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Bold';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const CODE$1 = 'code';
const HIGHLIGHT_CLASS = 'ck-code_selected';
/**
 * The code editing feature.
 *
 * It registers the `'code'` command and introduces the `code` attribute in the model which renders to the view
 * as a `<code>` element.
 */ class CodeEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CodeEditing';
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
            TwoStepCaretMovement
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = this.editor.t;
        // Allow code attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: CODE$1
        });
        editor.model.schema.setAttributeProperties(CODE$1, {
            isFormatting: true,
            copyOnEnter: false
        });
        editor.conversion.attributeToElement({
            model: CODE$1,
            view: 'code'
        });
        // Create code command.
        editor.commands.add(CODE$1, new AttributeCommand(editor, CODE$1));
        // Enable two-step caret movement for `code` attribute.
        editor.plugins.get(TwoStepCaretMovement).registerAttribute(CODE$1);
        // Setup highlight over selected element.
        inlineHighlight(editor, CODE$1, 'code', HIGHLIGHT_CLASS);
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Move out of an inline code style'),
                    keystroke: [
                        [
                            'arrowleft',
                            'arrowleft'
                        ],
                        [
                            'arrowright',
                            'arrowright'
                        ]
                    ]
                }
            ]
        });
    }
}

const CODE = 'code';
/**
 * The code UI feature. It introduces the Code button.
 */ class CodeUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CodeUI';
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
        const t = editor.locale.t;
        const createButton = getButtonCreator({
            editor,
            commandName: CODE,
            plugin: this,
            icon: IconCode,
            label: t('Code')
        });
        // Add code button to feature components.
        editor.ui.componentFactory.add(CODE, ()=>createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + CODE, ()=>createButton(MenuBarMenuListItemButtonView));
    }
}

/**
 * The code feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/code/codeediting~CodeEditing code editing feature}
 * and {@link module:basic-styles/code/codeui~CodeUI code UI feature}.
 */ class Code extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            CodeEditing,
            CodeUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Code';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const ITALIC$1 = 'italic';
/**
 * The italic editing feature.
 *
 * It registers the `'italic'` command, the <kbd>Ctrl+I</kbd> keystroke and introduces the `italic` attribute in the model
 * which renders to the view as an `<i>` element.
 */ class ItalicEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ItalicEditing';
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
        const t = this.editor.t;
        // Allow italic attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: ITALIC$1
        });
        editor.model.schema.setAttributeProperties(ITALIC$1, {
            isFormatting: true,
            copyOnEnter: true
        });
        editor.conversion.attributeToElement({
            model: ITALIC$1,
            view: 'i',
            upcastAlso: [
                'em',
                {
                    styles: {
                        'font-style': 'italic'
                    }
                }
            ]
        });
        // Create italic command.
        editor.commands.add(ITALIC$1, new AttributeCommand(editor, ITALIC$1));
        // Set the Ctrl+I keystroke.
        editor.keystrokes.set('CTRL+I', ITALIC$1);
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Italic text'),
                    keystroke: 'CTRL+I'
                }
            ]
        });
    }
}

const ITALIC = 'italic';
/**
 * The italic UI feature. It introduces the Italic button.
 */ class ItalicUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ItalicUI';
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
        const t = editor.locale.t;
        const createButton = getButtonCreator({
            editor,
            commandName: ITALIC,
            plugin: this,
            icon: IconItalic,
            keystroke: 'CTRL+I',
            label: t('Italic')
        });
        // Add bold button to feature components.
        editor.ui.componentFactory.add(ITALIC, ()=>createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + ITALIC, ()=>createButton(MenuBarMenuListItemButtonView));
    }
}

/**
 * The italic feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/italic/italicediting~ItalicEditing} and
 * {@link module:basic-styles/italic/italicui~ItalicUI} plugins.
 */ class Italic extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ItalicEditing,
            ItalicUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Italic';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const STRIKETHROUGH$1 = 'strikethrough';
/**
 * The strikethrough editing feature.
 *
 * It registers the `'strikethrough'` command, the <kbd>Ctrl+Shift+X</kbd> keystroke and introduces the
 * `strikethroughsthrough` attribute in the model which renders to the view
 * as a `<s>` element.
 */ class StrikethroughEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'StrikethroughEditing';
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
        const t = this.editor.t;
        // Allow strikethrough attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: STRIKETHROUGH$1
        });
        editor.model.schema.setAttributeProperties(STRIKETHROUGH$1, {
            isFormatting: true,
            copyOnEnter: true
        });
        editor.conversion.attributeToElement({
            model: STRIKETHROUGH$1,
            view: 's',
            upcastAlso: [
                'del',
                'strike',
                {
                    styles: {
                        'text-decoration': 'line-through'
                    }
                }
            ]
        });
        // Create strikethrough command.
        editor.commands.add(STRIKETHROUGH$1, new AttributeCommand(editor, STRIKETHROUGH$1));
        // Set the Ctrl+Shift+X keystroke.
        editor.keystrokes.set('CTRL+SHIFT+X', 'strikethrough');
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Strikethrough text'),
                    keystroke: 'CTRL+SHIFT+X'
                }
            ]
        });
    }
}

const STRIKETHROUGH = 'strikethrough';
/**
 * The strikethrough UI feature. It introduces the Strikethrough button.
 */ class StrikethroughUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'StrikethroughUI';
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
        const t = editor.locale.t;
        const createButton = getButtonCreator({
            editor,
            commandName: STRIKETHROUGH,
            plugin: this,
            icon: IconStrikethrough,
            keystroke: 'CTRL+SHIFT+X',
            label: t('Strikethrough')
        });
        // Add strikethrough button to feature components.
        editor.ui.componentFactory.add(STRIKETHROUGH, ()=>createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + STRIKETHROUGH, ()=>createButton(MenuBarMenuListItemButtonView));
    }
}

/**
 * The strikethrough feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/strikethrough/strikethroughediting~StrikethroughEditing} and
 * {@link module:basic-styles/strikethrough/strikethroughui~StrikethroughUI} plugins.
 */ class Strikethrough extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            StrikethroughEditing,
            StrikethroughUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Strikethrough';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const SUBSCRIPT$1 = 'subscript';
/**
 * The subscript editing feature.
 *
 * It registers the `sub` command and introduces the `sub` attribute in the model which renders to the view
 * as a `<sub>` element.
 */ class SubscriptEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SubscriptEditing';
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
        // Allow sub attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: SUBSCRIPT$1
        });
        editor.model.schema.setAttributeProperties(SUBSCRIPT$1, {
            isFormatting: true,
            copyOnEnter: true
        });
        // Build converter from model to view for data and editing pipelines.
        editor.conversion.attributeToElement({
            model: SUBSCRIPT$1,
            view: 'sub',
            upcastAlso: [
                {
                    styles: {
                        'vertical-align': 'sub'
                    }
                }
            ]
        });
        // Create sub command.
        editor.commands.add(SUBSCRIPT$1, new AttributeCommand(editor, SUBSCRIPT$1));
    }
}

const SUBSCRIPT = 'subscript';
/**
 * The subscript UI feature. It introduces the Subscript button.
 */ class SubscriptUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SubscriptUI';
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
        const t = editor.locale.t;
        const createButton = getButtonCreator({
            editor,
            commandName: SUBSCRIPT,
            plugin: this,
            icon: IconSubscript,
            label: t('Subscript')
        });
        // Add subscript button to feature components.
        editor.ui.componentFactory.add(SUBSCRIPT, ()=>createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + SUBSCRIPT, ()=>createButton(MenuBarMenuListItemButtonView));
    }
}

/**
 * The subscript feature.
 *
 * It loads the {@link module:basic-styles/subscript/subscriptediting~SubscriptEditing} and
 * {@link module:basic-styles/subscript/subscriptui~SubscriptUI} plugins.
 */ class Subscript extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            SubscriptEditing,
            SubscriptUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Subscript';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const SUPERSCRIPT$1 = 'superscript';
/**
 * The superscript editing feature.
 *
 * It registers the `super` command and introduces the `super` attribute in the model which renders to the view
 * as a `<super>` element.
 */ class SuperscriptEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SuperscriptEditing';
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
        // Allow super attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: SUPERSCRIPT$1
        });
        editor.model.schema.setAttributeProperties(SUPERSCRIPT$1, {
            isFormatting: true,
            copyOnEnter: true
        });
        // Build converter from model to view for data and editing pipelines.
        editor.conversion.attributeToElement({
            model: SUPERSCRIPT$1,
            view: 'sup',
            upcastAlso: [
                {
                    styles: {
                        'vertical-align': 'super'
                    }
                }
            ]
        });
        // Create super command.
        editor.commands.add(SUPERSCRIPT$1, new AttributeCommand(editor, SUPERSCRIPT$1));
    }
}

const SUPERSCRIPT = 'superscript';
/**
 * The superscript UI feature. It introduces the Superscript button.
 */ class SuperscriptUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'SuperscriptUI';
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
        const t = editor.locale.t;
        const createButton = getButtonCreator({
            editor,
            commandName: SUPERSCRIPT,
            plugin: this,
            icon: IconSuperscript,
            label: t('Superscript')
        });
        // Add superscript button to feature components.
        editor.ui.componentFactory.add(SUPERSCRIPT, ()=>createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + SUPERSCRIPT, ()=>createButton(MenuBarMenuListItemButtonView));
    }
}

/**
 * The superscript feature.
 *
 * It loads the {@link module:basic-styles/superscript/superscriptediting~SuperscriptEditing} and
 * {@link module:basic-styles/superscript/superscriptui~SuperscriptUI} plugins.
 */ class Superscript extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            SuperscriptEditing,
            SuperscriptUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Superscript';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const UNDERLINE$1 = 'underline';
/**
 * The underline editing feature.
 *
 * It registers the `'underline'` command, the <kbd>Ctrl+U</kbd> keystroke
 * and introduces the `underline` attribute in the model which renders to the view as an `<u>` element.
 */ class UnderlineEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'UnderlineEditing';
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
        const t = this.editor.t;
        // Allow strikethrough attribute on text nodes.
        editor.model.schema.extend('$text', {
            allowAttributes: UNDERLINE$1
        });
        editor.model.schema.setAttributeProperties(UNDERLINE$1, {
            isFormatting: true,
            copyOnEnter: true
        });
        editor.conversion.attributeToElement({
            model: UNDERLINE$1,
            view: 'u',
            upcastAlso: {
                styles: {
                    'text-decoration': 'underline'
                }
            }
        });
        // Create underline command.
        editor.commands.add(UNDERLINE$1, new AttributeCommand(editor, UNDERLINE$1));
        // Set the Ctrl+U keystroke.
        editor.keystrokes.set('CTRL+U', 'underline');
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Underline text'),
                    keystroke: 'CTRL+U'
                }
            ]
        });
    }
}

const UNDERLINE = 'underline';
/**
 * The underline UI feature. It introduces the Underline button.
 */ class UnderlineUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'UnderlineUI';
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
        const t = editor.locale.t;
        const createButton = getButtonCreator({
            editor,
            commandName: UNDERLINE,
            plugin: this,
            icon: IconUnderline,
            label: t('Underline'),
            keystroke: 'CTRL+U'
        });
        // Add bold button to feature components.
        editor.ui.componentFactory.add(UNDERLINE, ()=>createButton(ButtonView));
        editor.ui.componentFactory.add('menuBar:' + UNDERLINE, ()=>createButton(MenuBarMenuListItemButtonView));
    }
}

/**
 * The underline feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature} guide
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/underline/underlineediting~UnderlineEditing} and
 * {@link module:basic-styles/underline/underlineui~UnderlineUI} plugins.
 */ class Underline extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            UnderlineEditing,
            UnderlineUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Underline';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { AttributeCommand, Bold, BoldEditing, BoldUI, Code, CodeEditing, CodeUI, Italic, ItalicEditing, ItalicUI, Strikethrough, StrikethroughEditing, StrikethroughUI, Subscript, SubscriptEditing, SubscriptUI, Superscript, SuperscriptEditing, SuperscriptUI, Underline, UnderlineEditing, UnderlineUI, getButtonCreator as _getBasicStylesButtonCreator };
//# sourceMappingURL=index.js.map

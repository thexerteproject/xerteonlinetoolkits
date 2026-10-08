/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { addMarginStylesRules } from 'ckeditor5/src/engine.js';
import { IndentBlockListCommand } from './indentblocklistcommand.js';
import { IndentBlockListItemCommand } from './indentblocklistitemcommand.js';
import { IndentUsingOffset } from '../indentcommandbehavior/indentusingoffset.js';
import { IndentUsingClasses } from '../indentcommandbehavior/indentusingclasses.js';
/**
 * This integration enables using block indentation feature with lists.
 */
export class IndentBlockListIntegration extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'IndentBlockListIntegration';
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
        if (!this.editor.plugins.has('ListEditing')) {
            return;
        }
        const config = editor.config.get('indentBlock');
        if (config.classes && config.classes.length) {
            this._setupConversionUsingClassesForListBlock(config.classes);
            this._setupConversionUsingClassesForListItemBlock(config.classes);
            editor.commands.add('indentBlockList', new IndentBlockListCommand(editor, new IndentUsingClasses({
                direction: 'forward',
                classes: config.classes
            })));
            editor.commands.add('outdentBlockList', new IndentBlockListCommand(editor, new IndentUsingClasses({
                direction: 'backward',
                classes: config.classes
            })));
            editor.commands.add('indentBlockListItem', new IndentBlockListItemCommand(editor, new IndentUsingClasses({
                direction: 'forward',
                classes: config.classes
            })));
            editor.commands.add('outdentBlockListItem', new IndentBlockListItemCommand(editor, new IndentUsingClasses({
                direction: 'backward',
                classes: config.classes
            })));
        }
        else {
            editor.data.addStyleProcessorRules(addMarginStylesRules);
            this._setupConversionUsingOffsetForListBlock();
            this._setupConversionUsingOffsetForListItemBlock();
            editor.commands.add('indentBlockList', new IndentBlockListCommand(editor, new IndentUsingOffset({
                direction: 'forward',
                offset: config.offset,
                unit: config.unit
            })));
            editor.commands.add('outdentBlockList', new IndentBlockListCommand(editor, new IndentUsingOffset({
                direction: 'backward',
                offset: config.offset,
                unit: config.unit
            })));
            editor.commands.add('indentBlockListItem', new IndentBlockListItemCommand(editor, new IndentUsingOffset({
                direction: 'forward',
                offset: config.offset,
                unit: config.unit
            })));
            editor.commands.add('outdentBlockListItem', new IndentBlockListItemCommand(editor, new IndentUsingOffset({
                direction: 'backward',
                offset: config.offset,
                unit: config.unit
            })));
        }
        const listEditing = editor.plugins.get('ListEditing');
        // Make sure that all items in a single list (items at the same level & listType) have the same blockIndentList attribute value.
        listEditing.on('postFixer', (evt, { listNodes, writer }) => {
            for (const { node, previousNodeInList } of listNodes) {
                // This is a first item of a nested list.
                if (!previousNodeInList) {
                    continue;
                }
                if (previousNodeInList.getAttribute('listType') != node.getAttribute('listType')) {
                    continue;
                }
                if (ensureIndentValuesConsistency('blockIndentList', node, previousNodeInList, writer)) {
                    evt.return = true;
                }
                if (previousNodeInList.getAttribute('listItemId') != node.getAttribute('listItemId')) {
                    continue;
                }
                if (ensureIndentValuesConsistency('blockIndentListItem', node, previousNodeInList, writer)) {
                    evt.return = true;
                }
            }
        });
        this.listenTo(editor.editing.view.document, 'tab', (evt, data) => {
            const commandName = data.shiftKey ? 'outdentBlockList' : 'indentBlockList';
            const command = this.editor.commands.get(commandName);
            if (command.isEnabled) {
                editor.execute(commandName, { firstListOnly: true });
                data.stopPropagation();
                data.preventDefault();
                evt.stop();
            }
        }, { context: 'li', priority: 'high' });
    }
    /**
     * @inheritDoc
     */
    afterInit() {
        const editor = this.editor;
        const model = editor.model;
        const schema = model.schema;
        if (!editor.plugins.has('ListEditing')) {
            return;
        }
        // Schema registration.
        schema.extend('$listItem', { allowAttributes: ['blockIndentList', 'blockIndentListItem'] });
        schema.setAttributeProperties('blockIndentList', { isFormatting: true });
        schema.setAttributeProperties('blockIndentListItem', { isFormatting: true });
        model.schema.addAttributeCheck(context => {
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'blockIndentList');
        model.schema.addAttributeCheck(context => {
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'blockIndentListItem');
        // Clear blockIndentList and blockIndentListItem when list indent changes.
        const clearBlockIndentAttributesOnListIndentChange = (_evt, changedBlocks) => {
            editor.model.change(writer => {
                for (const node of changedBlocks) {
                    if (node.hasAttribute('listItemId')) {
                        if (node.hasAttribute('blockIndentList')) {
                            writer.removeAttribute('blockIndentList', node);
                        }
                        if (node.hasAttribute('blockIndentListItem')) {
                            writer.removeAttribute('blockIndentListItem', node);
                        }
                    }
                }
            });
        };
        const indentListCommand = editor.commands.get('indentList');
        const outdentListCommand = editor.commands.get('outdentList');
        if (indentListCommand) {
            this.listenTo(indentListCommand, 'afterExecute', clearBlockIndentAttributesOnListIndentChange);
        }
        if (outdentListCommand) {
            this.listenTo(outdentListCommand, 'afterExecute', clearBlockIndentAttributesOnListIndentChange);
        }
        // Register list block indent commands in multi command.
        const indentCommand = editor.commands.get('indent');
        const outdentCommand = editor.commands.get('outdent');
        indentCommand.registerChildCommand(editor.commands.get('indentBlockList'));
        outdentCommand.registerChildCommand(editor.commands.get('outdentBlockList'));
        indentCommand.registerChildCommand(editor.commands.get('indentBlockListItem'));
        outdentCommand.registerChildCommand(editor.commands.get('outdentBlockListItem'));
    }
    /**
     * Setups conversion for list block indent using offset indents.
     */
    _setupConversionUsingOffsetForListBlock() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const locale = editor.locale;
        const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
        const listEditing = editor.plugins.get('ListEditing');
        conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:ol', listBlockIndentUpcastConverter('blockIndentList', marginProperty));
            dispatcher.on('element:ul', listBlockIndentUpcastConverter('blockIndentList', marginProperty));
        });
        listEditing.registerDowncastStrategy({
            scope: 'list',
            attributeName: 'blockIndentList',
            setAttributeOnDowncast(writer, value, element) {
                if (value) {
                    writer.setStyle(marginProperty, value, element);
                }
            }
        });
    }
    /**
     * Setups conversion for list item block indent using offset indents.
     */
    _setupConversionUsingOffsetForListItemBlock() {
        const editor = this.editor;
        const locale = editor.locale;
        const conversion = editor.conversion;
        const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
        const listEditing = editor.plugins.get('ListEditing');
        conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:li', listBlockIndentUpcastConverter('blockIndentListItem', marginProperty), { priority: 'low' });
        });
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'blockIndentListItem',
            setAttributeOnDowncast(writer, value, element) {
                if (value) {
                    writer.setStyle(marginProperty, value, element);
                }
            }
        });
    }
    /**
     * Setups conversion for list block indent using classes.
     */
    _setupConversionUsingClassesForListBlock(classes) {
        const editor = this.editor;
        const conversion = editor.conversion;
        const listEditing = editor.plugins.get('ListEditing');
        conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:ol', listBlockIndentUpcastConverterUsingClasses('blockIndentList', classes));
            dispatcher.on('element:ul', listBlockIndentUpcastConverterUsingClasses('blockIndentList', classes));
        });
        listEditing.registerDowncastStrategy({
            scope: 'list',
            attributeName: 'blockIndentList',
            setAttributeOnDowncast(writer, value, element) {
                if (value) {
                    writer.addClass(value, element);
                }
            }
        });
    }
    /**
     * Setups conversion for list item block indent using classes.
     */
    _setupConversionUsingClassesForListItemBlock(classes) {
        const editor = this.editor;
        const conversion = editor.conversion;
        const listEditing = editor.plugins.get('ListEditing');
        conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:li', listBlockIndentUpcastConverterUsingClasses('blockIndentListItem', classes), { priority: 'low' });
        });
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'blockIndentListItem',
            setAttributeOnDowncast(writer, value, element) {
                if (value) {
                    writer.addClass(value, element);
                }
            }
        });
    }
}
function listBlockIndentUpcastConverterUsingClasses(attributeName, classes) {
    return (evt, data, conversionApi) => {
        const { writer, consumable } = conversionApi;
        if (!data.modelRange) {
            Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
        }
        const viewClasses = Array.from(data.viewItem.getClassNames());
        const matchedClass = classes.find(cls => viewClasses.includes(cls));
        if (matchedClass === undefined) {
            return;
        }
        let applied = false;
        let indentLevel;
        for (const item of data.modelRange.getItems({ shallow: true })) {
            if (indentLevel === undefined) {
                indentLevel = item.getAttribute('listIndent');
            }
            if (item.hasAttribute(attributeName)) {
                continue;
            }
            if (item.getAttribute('listIndent') !== indentLevel) {
                continue;
            }
            writer.setAttribute(attributeName, matchedClass, item);
            applied = true;
        }
        if (applied) {
            consumable.consume(data.viewItem, { classes: matchedClass });
        }
    };
}
function listBlockIndentUpcastConverter(attributeName, marginProperty) {
    return (evt, data, conversionApi) => {
        const { writer, consumable } = conversionApi;
        if (!data.modelRange) {
            Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
        }
        const marginValue = data.viewItem.getStyle(marginProperty);
        let applied = false;
        let indentLevel;
        for (const item of data.modelRange.getItems({ shallow: true })) {
            if (indentLevel === undefined) {
                indentLevel = item.getAttribute('listIndent');
            }
            if (item.hasAttribute(attributeName)) {
                continue;
            }
            if (item.getAttribute('listIndent') !== indentLevel) {
                continue;
            }
            writer.setAttribute(attributeName, marginValue, item);
            applied = true;
        }
        if (applied) {
            consumable.consume(data.viewItem, { styles: marginProperty });
        }
    };
}
function ensureIndentValuesConsistency(attributeName, node, previousNodeInList, writer) {
    const prevNodeIndentListValue = previousNodeInList.getAttribute(attributeName);
    if (node.getAttribute(attributeName) === prevNodeIndentListValue) {
        return false;
    }
    if (prevNodeIndentListValue) {
        writer.setAttribute(attributeName, prevNodeIndentListValue, node);
    }
    else {
        writer.removeAttribute(attributeName, node);
    }
    return true;
}

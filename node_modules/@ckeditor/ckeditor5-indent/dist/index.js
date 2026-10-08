/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, MultiCommand, Command } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconIndent, IconOutdent } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { addMarginStylesRules } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { first } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { _isListItemBlock } from '@ckeditor/ckeditor5-list/dist/index.js';

/**
 * The indent editing feature.
 *
 * This plugin registers the `'indent'` and `'outdent'` commands.
 *
 * **Note**: In order for the commands to work, at least one of the compatible features is required. Read more in the
 * {@link module:indent/indent~Indent indent feature} API documentation.
 */ class IndentEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'IndentEditing';
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
        editor.commands.add('indent', new MultiCommand(editor));
        editor.commands.add('outdent', new MultiCommand(editor));
    }
}

/**
 * The indent UI feature.
 *
 * This plugin registers the `'indent'` and `'outdent'` buttons.
 *
 * **Note**: In order for the commands to work, at least one of the compatible features is required. Read more in
 * the {@link module:indent/indent~Indent indent feature} API documentation.
 */ class IndentUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'IndentUI';
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
        const locale = editor.locale;
        const t = editor.t;
        const localizedIndentIcon = locale.uiLanguageDirection == 'ltr' ? IconIndent : IconOutdent;
        const localizedOutdentIcon = locale.uiLanguageDirection == 'ltr' ? IconOutdent : IconIndent;
        this._defineButton('indent', t('Increase indent'), localizedIndentIcon);
        this._defineButton('outdent', t('Decrease indent'), localizedOutdentIcon);
    }
    /**
	 * Defines UI buttons for both toolbar and menu bar.
	 */ _defineButton(commandName, label, icon) {
        const editor = this.editor;
        editor.ui.componentFactory.add(commandName, ()=>{
            const buttonView = this._createButton(ButtonView, commandName, label, icon);
            buttonView.set({
                tooltip: true
            });
            return buttonView;
        });
        editor.ui.componentFactory.add('menuBar:' + commandName, ()=>{
            return this._createButton(MenuBarMenuListItemButtonView, commandName, label, icon);
        });
    }
    /**
	 * Creates a button to use either in toolbar or in menu bar.
	 */ _createButton(ButtonClass, commandName, label, icon) {
        const editor = this.editor;
        const command = editor.commands.get(commandName);
        const view = new ButtonClass(editor.locale);
        view.set({
            label,
            icon
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        // Execute the command.
        this.listenTo(view, 'execute', ()=>{
            editor.execute(commandName);
            editor.editing.view.focus();
        });
        return view;
    }
}

/**
 * The indent feature.
 *
 * This plugin acts as a single entry point plugin for other features that implement indentation of elements like lists or paragraphs.
 *
 * The compatible features are:
 *
 * * The {@link module:list/list~List} or {@link module:list/list/listediting~ListEditing} feature for list indentation.
 * * The {@link module:indent/indentblock~IndentBlock} feature for block indentation.
 *
 * This is a "glue" plugin that loads the following plugins:
 *
 * * The {@link module:indent/indentediting~IndentEditing indent editing feature}.
 * * The {@link module:indent/indentui~IndentUI indent UI feature}.
 *
 * The dependent plugins register the `'indent'` and `'outdent'` commands and introduce the `'indent'` and `'outdent'` buttons
 * that allow to increase or decrease text indentation of supported elements.
 *
 * **Note**: In order for the commands and buttons to work, at least one of compatible features is required.
 */ class Indent extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Indent';
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
            IndentEditing,
            IndentUI
        ];
    }
}

/**
 * The indent block command.
 *
 * The command is registered by the {@link module:indent/indentblock~IndentBlock} as `'indentBlock'` for indenting blocks and
 * `'outdentBlock'` for outdenting blocks.
 *
 * To increase block indentation at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlock' );
 * ```
 *
 * To decrease block indentation at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlock' );
 * ```
 */ class IndentBlockCommand extends Command {
    /**
	 * The command's indentation behavior.
	 */ _indentBehavior;
    /**
	 * Creates an instance of the command.
	 */ constructor(editor, indentBehavior){
        super(editor);
        this._indentBehavior = indentBehavior;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const model = editor.model;
        const block = first(model.document.selection.getSelectedBlocks());
        if (!block || !this._isIndentationChangeAllowed(block)) {
            this.isEnabled = false;
            return;
        }
        this.isEnabled = this._indentBehavior.checkEnabled(block.getAttribute('blockIndent'));
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const model = this.editor.model;
        const blocksToChange = this._getBlocksToChange();
        model.change((writer)=>{
            for (const block of blocksToChange){
                const currentIndent = block.getAttribute('blockIndent');
                const nextIndent = this._indentBehavior.getNextIndent(currentIndent);
                if (nextIndent) {
                    writer.setAttribute('blockIndent', nextIndent, block);
                } else {
                    writer.removeAttribute('blockIndent', block);
                }
            }
        });
    }
    /**
	 * Returns blocks from selection that should have blockIndent selection set.
	 */ _getBlocksToChange() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const blocksInSelection = Array.from(selection.getSelectedBlocks());
        return blocksInSelection.filter((block)=>this._isIndentationChangeAllowed(block));
    }
    /**
	 * Returns false if indentation cannot be applied, i.e.:
	 * - for blocks disallowed by schema declaration
	 * - for blocks in Document Lists (disallowed forward indentation only). See https://github.com/ckeditor/ckeditor5/issues/14155.
	 * Otherwise returns true.
	 */ _isIndentationChangeAllowed(element) {
        const editor = this.editor;
        if (!editor.model.schema.checkAttribute(element, 'blockIndent')) {
            return false;
        }
        if (!editor.plugins.has('ListUtils')) {
            return true;
        }
        // Only forward indentation is disallowed in list items. This allows the user to outdent blocks that are already indented.
        if (!this._indentBehavior.isForward) {
            return true;
        }
        const listUtils = editor.plugins.get('ListUtils');
        return !listUtils.isListItemBlock(element);
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module indent/indentcommandbehavior/indentusingoffset
 */ /**
 * The block indentation behavior that uses offsets to set indentation.
 *
 * @internal
 */ class IndentUsingOffset {
    /**
	 * The direction of indentation.
	 */ isForward;
    /**
	 * The offset of the next indentation step.
	 */ offset;
    /**
	 * Indentation unit.
	 */ unit;
    /**
	 * Creates an instance of the indentation behavior.
	 *
	 * @param config.direction The direction of indentation.
	 * @param config.offset The offset of the next indentation step.
	 * @param config.unit Indentation unit.
	 */ constructor(config){
        this.isForward = config.direction === 'forward';
        this.offset = config.offset;
        this.unit = config.unit;
    }
    /**
	 * @inheritDoc
	 */ checkEnabled(indentAttributeValue) {
        const currentOffset = parseFloat(indentAttributeValue || '0');
        // The command is always enabled for forward indentation.
        return this.isForward || currentOffset > 0;
    }
    /**
	 * @inheritDoc
	 */ getNextIndent(indentAttributeValue) {
        const currentOffset = parseFloat(indentAttributeValue || '0');
        const isSameUnit = !indentAttributeValue || indentAttributeValue.endsWith(this.unit);
        if (currentOffset < 0) {
            return;
        }
        if (!isSameUnit) {
            return this.isForward ? this.offset + this.unit : undefined;
        }
        const nextOffset = this.isForward ? this.offset : -this.offset;
        const offsetToSet = currentOffset + nextOffset;
        return offsetToSet > 0 ? offsetToSet + this.unit : undefined;
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module indent/indentcommandbehavior/indentusingclasses
 */ /**
 * The block indentation behavior that uses classes to set indentation.
 *
 * @internal
 */ class IndentUsingClasses {
    /**
	 * The direction of indentation.
	 */ isForward;
    /**
	 * A list of classes used for indentation.
	 */ classes;
    /**
	 * Creates an instance of the indentation behavior.
	 *
	 * @param config.direction The direction of indentation.
	 * @param config.classes A list of classes used for indentation.
	 */ constructor(config){
        this.isForward = config.direction === 'forward';
        this.classes = config.classes;
    }
    /**
	 * @inheritDoc
	 */ checkEnabled(indentAttributeValue) {
        const currentIndex = this.classes.indexOf(indentAttributeValue);
        if (this.isForward) {
            return currentIndex < this.classes.length - 1;
        } else {
            return currentIndex >= 0;
        }
    }
    /**
	 * @inheritDoc
	 */ getNextIndent(indentAttributeValue) {
        const currentIndex = this.classes.indexOf(indentAttributeValue);
        const indexStep = this.isForward ? 1 : -1;
        const nextIndex = currentIndex + indexStep;
        const nextIndexClamped = Math.min(nextIndex, this.classes.length - 1);
        return this.classes[nextIndexClamped];
    }
}

/**
 * The indent block list command.
 *
 * The command is registered by the {@link module:indent/integrations/indentblocklistintegration~IndentBlockListIntegration} as
 * `'indentBlockList'` for indenting lists and `'outdentBlockList'` for outdenting lists.
 *
 * To increase/decrease block indentation of the list the selection must be at the start of the first top–level list item
 * in the list.
 *
 * To increase block indentation of the list, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlockList' );
 * ```
 *
 * To decrease block indentation of the list, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlockList' );
 * ```
 */ class IndentBlockListCommand extends Command {
    /**
	 * The command's indentation behavior.
	 */ _indentBehavior;
    /**
	 * Creates an instance of the command.
	 */ constructor(editor, indentBehavior){
        super(editor);
        this._indentBehavior = indentBehavior;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const listItem = this._getFirstListItemIfSelectionIsAtListStart(this.editor.model.document.selection);
        this.isEnabled = !!listItem && this._indentBehavior.checkEnabled(listItem.getAttribute('blockIndentList'));
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.firstListOnly When `true`, indentation is applied only to the first list at the beginning of the selection.
	 * When `false` or omitted, indentation is applied to all lists of the selection.
	 */ execute(options = {}) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        model.change((writer)=>{
            const listItem = this._getFirstListItemIfSelectionIsAtListStart(selection);
            const listItems = [];
            if (!options.firstListOnly) {
                const blocks = Array.from(selection.getSelectedBlocks());
                for (const block of blocks){
                    if (_isListItemBlock(block) && block.getAttribute('listIndent') === 0 && model.schema.checkAttribute(block, 'blockIndentList')) {
                        listItems.push(block);
                    }
                }
            } else {
                listItems.push(listItem);
            }
            for (const item of listItems){
                const currentIndent = item.getAttribute('blockIndentList');
                const nextIndent = this._indentBehavior.getNextIndent(currentIndent);
                if (nextIndent) {
                    writer.setAttribute('blockIndentList', nextIndent, item);
                } else {
                    writer.removeAttribute('blockIndentList', item);
                }
            }
        });
    }
    /**
	 * Returns the list item at the beginning of the current selection if it is the first top–level list item in the list.
	 * Otherwise, returns `null`.
	 */ _getFirstListItemIfSelectionIsAtListStart(selection) {
        const position = selection.getFirstPosition();
        const listUtils = this.editor.plugins.get('ListUtils');
        const parent = position.parent;
        const schema = this.editor.model.schema;
        if (position.isAtStart && _isListItemBlock(parent) && parent.getAttribute('listIndent') == 0 && schema.checkAttribute(parent, 'blockIndentList') && listUtils.isFirstListItemInList(parent)) {
            return parent;
        }
        return null;
    }
}

/**
 * The indent block list item command.
 *
 * The command is registered by the {@link module:indent/integrations/indentblocklistintegration~IndentBlockListIntegration} as
 * `'indentBlockListItem'` for indenting list items and `'outdentBlockListItem'` for outdenting list items.
 *
 * It's only possible to reset the block indentation of a list item to `0`.
 * This means that if a list item has negative block indentation, the command will only allow forward indentation
 * to make it possible to reset it to `0` and if a list item has positive block indentation, the command
 * will only allow backward indentation to make it possible to reset it to `0`.
 *
 * To increase block indentation of the list item, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlockListItem' );
 * ```
 *
 * To decrease block indentation of the list item, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlockListItem' );
 * ```
 */ class IndentBlockListItemCommand extends Command {
    /**
	 * The command's indentation behavior.
	 */ _indentBehavior;
    /**
	 * Creates an instance of the command.
	 */ constructor(editor, indentBehavior){
        super(editor);
        this._indentBehavior = indentBehavior;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._getAffectedListItems().length > 0;
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const editor = this.editor;
        const model = editor.model;
        model.change((writer)=>{
            for (const block of this._getAffectedListItems()){
                writer.removeAttribute('blockIndentListItem', block);
            }
        });
    }
    /**
	 * Returns an array of list items which block indentation should be changed.
	 */ _getAffectedListItems() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const listUtils = this.editor.plugins.get('ListUtils');
        const blocksInSelection = Array.from(selection.getSelectedBlocks());
        const expandedBlocks = listUtils.expandListBlocksToCompleteItems(blocksInSelection);
        return expandedBlocks.filter((block)=>this._isIndentationChangeAllowed(block));
    }
    /**
	 * Returns `true` if changing the block indentation is allowed for the given list item.
	 *
	 * Indentation of a list item is only allowed if it moves toward zero. This means that:
	 * - when currentIndent = 0, the command should be disabled
	 * - when currentIndent < 0, only forward indentation should be allowed
	 * - when currentIndent > 0, only backward indentation should be allowed
	 *
	 * For classes-based indentation, the command should be enabled if there is a class to be removed.
	 */ _isIndentationChangeAllowed(element) {
        if (!element.hasAttribute('blockIndentListItem')) {
            return false;
        }
        const currentIndent = parseFloat(element.getAttribute('blockIndentListItem'));
        // Class based indent, allow only outdent.
        // TODO find a better way, probably use behavior to find out.
        if (isNaN(currentIndent)) {
            return !this._indentBehavior.isForward;
        }
        return this._indentBehavior.isForward && currentIndent < 0 || !this._indentBehavior.isForward && currentIndent > 0;
    }
}

/**
 * This integration enables using block indentation feature with lists.
 */ class IndentBlockListIntegration extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'IndentBlockListIntegration';
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
        } else {
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
        listEditing.on('postFixer', (evt, { listNodes, writer })=>{
            for (const { node, previousNodeInList } of listNodes){
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
        this.listenTo(editor.editing.view.document, 'tab', (evt, data)=>{
            const commandName = data.shiftKey ? 'outdentBlockList' : 'indentBlockList';
            const command = this.editor.commands.get(commandName);
            if (command.isEnabled) {
                editor.execute(commandName, {
                    firstListOnly: true
                });
                data.stopPropagation();
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: 'li',
            priority: 'high'
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const model = editor.model;
        const schema = model.schema;
        if (!editor.plugins.has('ListEditing')) {
            return;
        }
        // Schema registration.
        schema.extend('$listItem', {
            allowAttributes: [
                'blockIndentList',
                'blockIndentListItem'
            ]
        });
        schema.setAttributeProperties('blockIndentList', {
            isFormatting: true
        });
        schema.setAttributeProperties('blockIndentListItem', {
            isFormatting: true
        });
        model.schema.addAttributeCheck((context)=>{
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'blockIndentList');
        model.schema.addAttributeCheck((context)=>{
            const item = context.last;
            if (!item.getAttribute('listItemId')) {
                return false;
            }
        }, 'blockIndentListItem');
        // Clear blockIndentList and blockIndentListItem when list indent changes.
        const clearBlockIndentAttributesOnListIndentChange = (_evt, changedBlocks)=>{
            editor.model.change((writer)=>{
                for (const node of changedBlocks){
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
	 */ _setupConversionUsingOffsetForListBlock() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const locale = editor.locale;
        const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
        const listEditing = editor.plugins.get('ListEditing');
        conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on('element:ol', listBlockIndentUpcastConverter('blockIndentList', marginProperty));
            dispatcher.on('element:ul', listBlockIndentUpcastConverter('blockIndentList', marginProperty));
        });
        listEditing.registerDowncastStrategy({
            scope: 'list',
            attributeName: 'blockIndentList',
            setAttributeOnDowncast (writer, value, element) {
                if (value) {
                    writer.setStyle(marginProperty, value, element);
                }
            }
        });
    }
    /**
	 * Setups conversion for list item block indent using offset indents.
	 */ _setupConversionUsingOffsetForListItemBlock() {
        const editor = this.editor;
        const locale = editor.locale;
        const conversion = editor.conversion;
        const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
        const listEditing = editor.plugins.get('ListEditing');
        conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on('element:li', listBlockIndentUpcastConverter('blockIndentListItem', marginProperty), {
                priority: 'low'
            });
        });
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'blockIndentListItem',
            setAttributeOnDowncast (writer, value, element) {
                if (value) {
                    writer.setStyle(marginProperty, value, element);
                }
            }
        });
    }
    /**
	 * Setups conversion for list block indent using classes.
	 */ _setupConversionUsingClassesForListBlock(classes) {
        const editor = this.editor;
        const conversion = editor.conversion;
        const listEditing = editor.plugins.get('ListEditing');
        conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on('element:ol', listBlockIndentUpcastConverterUsingClasses('blockIndentList', classes));
            dispatcher.on('element:ul', listBlockIndentUpcastConverterUsingClasses('blockIndentList', classes));
        });
        listEditing.registerDowncastStrategy({
            scope: 'list',
            attributeName: 'blockIndentList',
            setAttributeOnDowncast (writer, value, element) {
                if (value) {
                    writer.addClass(value, element);
                }
            }
        });
    }
    /**
	 * Setups conversion for list item block indent using classes.
	 */ _setupConversionUsingClassesForListItemBlock(classes) {
        const editor = this.editor;
        const conversion = editor.conversion;
        const listEditing = editor.plugins.get('ListEditing');
        conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on('element:li', listBlockIndentUpcastConverterUsingClasses('blockIndentListItem', classes), {
                priority: 'low'
            });
        });
        listEditing.registerDowncastStrategy({
            scope: 'item',
            attributeName: 'blockIndentListItem',
            setAttributeOnDowncast (writer, value, element) {
                if (value) {
                    writer.addClass(value, element);
                }
            }
        });
    }
}
function listBlockIndentUpcastConverterUsingClasses(attributeName, classes) {
    return (evt, data, conversionApi)=>{
        const { writer, consumable } = conversionApi;
        if (!data.modelRange) {
            Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
        }
        const viewClasses = Array.from(data.viewItem.getClassNames());
        const matchedClass = classes.find((cls)=>viewClasses.includes(cls));
        if (matchedClass === undefined) {
            return;
        }
        let applied = false;
        let indentLevel;
        for (const item of data.modelRange.getItems({
            shallow: true
        })){
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
            consumable.consume(data.viewItem, {
                classes: matchedClass
            });
        }
    };
}
function listBlockIndentUpcastConverter(attributeName, marginProperty) {
    return (evt, data, conversionApi)=>{
        const { writer, consumable } = conversionApi;
        if (!data.modelRange) {
            Object.assign(data, conversionApi.convertChildren(data.viewItem, data.modelCursor));
        }
        const marginValue = data.viewItem.getStyle(marginProperty);
        let applied = false;
        let indentLevel;
        for (const item of data.modelRange.getItems({
            shallow: true
        })){
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
            consumable.consume(data.viewItem, {
                styles: marginProperty
            });
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
    } else {
        writer.removeAttribute(attributeName, node);
    }
    return true;
}

const DEFAULT_ELEMENTS = [
    'paragraph',
    'heading1',
    'heading2',
    'heading3',
    'heading4',
    'heading5',
    'heading6'
];
/**
 * The block indentation feature.
 *
 * It registers the `'indentBlock'` and `'outdentBlock'` commands.
 *
 * If the plugin {@link module:indent/indent~Indent} is defined, it also attaches the `'indentBlock'` and `'outdentBlock'` commands to
 * the `'indent'` and `'outdent'` commands.
 */ class IndentBlock extends Plugin {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('indentBlock', {
            offset: 40,
            unit: 'px'
        });
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'IndentBlock';
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
            IndentBlockListIntegration
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
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
        } else {
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
	 */ afterInit() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const indentCommand = editor.commands.get('indent');
        const outdentCommand = editor.commands.get('outdent');
        // Enable block indentation to heading configuration options. If it is not defined enable in paragraph and default headings.
        const options = editor.config.get('heading.options');
        const configuredElements = options && options.map((option)=>option.model);
        const knownElements = configuredElements || DEFAULT_ELEMENTS;
        knownElements.forEach((elementName)=>{
            if (schema.isRegistered(elementName)) {
                schema.extend(elementName, {
                    allowAttributes: 'blockIndent'
                });
            }
        });
        schema.setAttributeProperties('blockIndent', {
            isFormatting: true
        });
        indentCommand.registerChildCommand(editor.commands.get('indentBlock'));
        outdentCommand.registerChildCommand(editor.commands.get('outdentBlock'));
    }
    /**
	 * Setups conversion for using offset indents.
	 */ _setupConversionUsingOffset() {
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
                value: (viewElement)=>{
                    // Do not indent block elements in Document Lists. See https://github.com/ckeditor/ckeditor5/issues/12466.
                    if (!viewElement.is('element', 'li')) {
                        return viewElement.getStyle(marginProperty);
                    }
                }
            }
        });
        conversion.for('downcast').attributeToAttribute({
            model: 'blockIndent',
            view: (modelAttributeValue)=>{
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
	 */ _setupConversionUsingClasses(classes) {
        const definition = {
            model: {
                key: 'blockIndent',
                values: []
            },
            view: {}
        };
        for (const className of classes){
            definition.model.values.push(className);
            definition.view[className] = {
                key: 'class',
                value: [
                    className
                ]
            };
        }
        this.editor.conversion.attributeToAttribute(definition);
    }
}

export { Indent, IndentBlock, IndentBlockCommand, IndentBlockListCommand, IndentBlockListIntegration, IndentBlockListItemCommand, IndentEditing, IndentUI, IndentUsingClasses as _IndentUsingClasses, IndentUsingOffset as _IndentUsingOffset };
//# sourceMappingURL=index.js.map

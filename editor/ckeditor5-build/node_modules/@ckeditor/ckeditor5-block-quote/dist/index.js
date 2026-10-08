/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { Enter } from '@ckeditor/ckeditor5-enter/dist/index.js';
import { Delete } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { first } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { IconQuote } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';

/**
 * The block quote command plugin.
 *
 * @extends module:core/command~Command
 */ class BlockQuoteCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        this.value = this._getValue();
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Executes the command. When the command {@link #value is on}, all top-most block quotes within
	 * the selection will be removed. If it is off, all selected blocks will be wrapped with
	 * a block quote.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply a block quote,
	 * otherwise the command will remove the block quote. If not set, the command will act basing on its current value.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const schema = model.schema;
        const selection = model.document.selection;
        const blocks = Array.from(selection.getSelectedBlocks());
        const value = options.forceValue === undefined ? !this.value : options.forceValue;
        model.change((writer)=>{
            if (!value) {
                this._removeQuote(writer, blocks.filter(findQuote));
            } else {
                const blocksToQuote = blocks.filter((block)=>{
                    // Already quoted blocks needs to be considered while quoting too
                    // in order to reuse their <bQ> elements.
                    return findQuote(block) || checkCanBeQuoted(schema, block);
                });
                this._applyQuote(writer, blocksToQuote);
            }
        });
    }
    /**
	 * Checks the command's {@link #value}.
	 */ _getValue() {
        const selection = this.editor.model.document.selection;
        const firstBlock = first(selection.getSelectedBlocks());
        // In the current implementation, the block quote must be an immediate parent of a block element.
        return !!(firstBlock && findQuote(firstBlock));
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */ _checkEnabled() {
        if (this.value) {
            return true;
        }
        const selection = this.editor.model.document.selection;
        const schema = this.editor.model.schema;
        const firstBlock = first(selection.getSelectedBlocks());
        if (!firstBlock) {
            return false;
        }
        return checkCanBeQuoted(schema, firstBlock);
    }
    /**
	 * Removes the quote from given blocks.
	 *
	 * If blocks which are supposed to be "unquoted" are in the middle of a quote,
	 * start it or end it, then the quote will be split (if needed) and the blocks
	 * will be moved out of it, so other quoted blocks remained quoted.
	 */ _removeQuote(writer, blocks) {
        // Unquote all groups of block. Iterate in the reverse order to not break following ranges.
        getRangesOfBlockGroups(writer, blocks).reverse().forEach((groupRange)=>{
            if (groupRange.start.isAtStart && groupRange.end.isAtEnd) {
                writer.unwrap(groupRange.start.parent);
                return;
            }
            // The group of blocks are at the beginning of an <bQ> so let's move them left (out of the <bQ>).
            if (groupRange.start.isAtStart) {
                const positionBefore = writer.createPositionBefore(groupRange.start.parent);
                writer.move(groupRange, positionBefore);
                return;
            }
            // The blocks are in the middle of an <bQ> so we need to split the <bQ> after the last block
            // so we move the items there.
            if (!groupRange.end.isAtEnd) {
                writer.split(groupRange.end);
            }
            // Now we are sure that groupRange.end.isAtEnd is true, so let's move the blocks right.
            const positionAfter = writer.createPositionAfter(groupRange.end.parent);
            writer.move(groupRange, positionAfter);
        });
    }
    /**
	 * Applies the quote to given blocks.
	 */ _applyQuote(writer, blocks) {
        const quotesToMerge = [];
        // Quote all groups of block. Iterate in the reverse order to not break following ranges.
        getRangesOfBlockGroups(writer, blocks).reverse().forEach((groupRange)=>{
            let quote = findQuote(groupRange.start);
            if (!quote) {
                quote = writer.createElement('blockQuote');
                writer.wrap(groupRange, quote);
            }
            quotesToMerge.push(quote);
        });
        // Merge subsequent <bQ> elements. Reverse the order again because this time we want to go through
        // the <bQ> elements in the source order (due to how merge works – it moves the right element's content
        // to the first element and removes the right one. Since we may need to merge a couple of subsequent `<bQ>` elements
        // we want to keep the reference to the first (furthest left) one.
        quotesToMerge.reverse().reduce((currentQuote, nextQuote)=>{
            if (currentQuote.nextSibling == nextQuote) {
                writer.merge(writer.createPositionAfter(currentQuote));
                return currentQuote;
            }
            return nextQuote;
        });
    }
}
function findQuote(elementOrPosition) {
    return elementOrPosition.parent.name == 'blockQuote' ? elementOrPosition.parent : null;
}
/**
 * Returns a minimal array of ranges containing groups of subsequent blocks.
 *
 * content:         abcdefgh
 * blocks:          [ a, b, d, f, g, h ]
 * output ranges:   [ab]c[d]e[fgh]
 */ function getRangesOfBlockGroups(writer, blocks) {
    let startPosition;
    let i = 0;
    const ranges = [];
    while(i < blocks.length){
        const block = blocks[i];
        const nextBlock = blocks[i + 1];
        if (!startPosition) {
            startPosition = writer.createPositionBefore(block);
        }
        if (!nextBlock || block.nextSibling != nextBlock) {
            ranges.push(writer.createRange(startPosition, writer.createPositionAfter(block)));
            startPosition = null;
        }
        i++;
    }
    return ranges;
}
/**
 * Checks whether <bQ> can wrap the block.
 */ function checkCanBeQuoted(schema, block) {
    // TMP will be replaced with schema.checkWrap().
    const isBQAllowed = schema.checkChild(block.parent, 'blockQuote');
    const isBlockAllowedInBQ = schema.checkChild([
        '$root',
        'blockQuote'
    ], block);
    return isBQAllowed && isBlockAllowedInBQ;
}

/**
 * The block quote editing.
 *
 * Introduces the `'blockQuote'` command and the `'blockQuote'` model element.
 *
 * @extends module:core/plugin~Plugin
 */ class BlockQuoteEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'BlockQuoteEditing';
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
            Enter,
            Delete
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        editor.commands.add('blockQuote', new BlockQuoteCommand(editor));
        schema.register('blockQuote', {
            inheritAllFrom: '$container'
        });
        editor.conversion.elementToElement({
            model: 'blockQuote',
            view: 'blockquote'
        });
        // Postfixer which cleans incorrect model states connected with block quotes.
        editor.model.document.registerPostFixer((writer)=>{
            const changes = editor.model.document.differ.getChanges();
            for (const entry of changes){
                if (entry.type == 'insert') {
                    const element = entry.position.nodeAfter;
                    if (!element) {
                        continue;
                    }
                    if (element.is('element', 'blockQuote') && element.isEmpty) {
                        // Added an empty blockQuote - remove it.
                        writer.remove(element);
                        return true;
                    } else if (element.is('element', 'blockQuote') && !schema.checkChild(entry.position, element)) {
                        // Added a blockQuote in incorrect place. Unwrap it so the content inside is not lost.
                        writer.unwrap(element);
                        return true;
                    } else if (element.is('element')) {
                        // Just added an element. Check that all children meet the scheme rules.
                        const range = writer.createRangeIn(element);
                        for (const child of range.getItems()){
                            if (child.is('element', 'blockQuote') && !schema.checkChild(writer.createPositionBefore(child), child)) {
                                writer.unwrap(child);
                                return true;
                            }
                        }
                    }
                } else if (entry.type == 'remove') {
                    const parent = entry.position.parent;
                    if (parent.is('element', 'blockQuote') && parent.isEmpty) {
                        // Something got removed and now blockQuote is empty. Remove the blockQuote as well.
                        writer.remove(parent);
                        return true;
                    }
                }
            }
            return false;
        });
        const viewDocument = this.editor.editing.view.document;
        const selection = editor.model.document.selection;
        const blockQuoteCommand = editor.commands.get('blockQuote');
        // Overwrite default Enter key behavior.
        // If Enter key is pressed with selection collapsed in empty block inside a quote, break the quote.
        this.listenTo(viewDocument, 'enter', (evt, data)=>{
            if (!selection.isCollapsed || !blockQuoteCommand.value) {
                return;
            }
            const positionParent = selection.getLastPosition().parent;
            if (positionParent.isEmpty) {
                editor.execute('blockQuote');
                editor.editing.view.scrollToTheSelection();
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: 'blockquote'
        });
        // Overwrite default Backspace key behavior.
        // If Backspace key is pressed with selection collapsed in first empty block inside a quote, break the quote.
        this.listenTo(viewDocument, 'delete', (evt, data)=>{
            if (data.direction != 'backward' || !selection.isCollapsed || !blockQuoteCommand.value) {
                return;
            }
            const positionParent = selection.getLastPosition().parent;
            if (positionParent.isEmpty && !positionParent.previousSibling) {
                editor.execute('blockQuote');
                editor.editing.view.scrollToTheSelection();
                data.preventDefault();
                evt.stop();
            }
        }, {
            context: 'blockquote'
        });
    }
}

/**
 * The block quote UI plugin.
 *
 * It introduces the `'blockQuote'` button.
 *
 * @extends module:core/plugin~Plugin
 */ class BlockQuoteUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'BlockQuoteUI';
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
        editor.ui.componentFactory.add('blockQuote', ()=>{
            const buttonView = this._createButton(ButtonView);
            buttonView.set({
                tooltip: true
            });
            return buttonView;
        });
        editor.ui.componentFactory.add('menuBar:blockQuote', ()=>{
            const buttonView = this._createButton(MenuBarMenuListItemButtonView);
            buttonView.set({
                role: 'menuitemcheckbox'
            });
            return buttonView;
        });
    }
    /**
	 * Creates a button for block quote command to use either in toolbar or in menu bar.
	 */ _createButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const command = editor.commands.get('blockQuote');
        const view = new ButtonClass(editor.locale);
        const t = locale.t;
        view.set({
            label: t('Block quote'),
            icon: IconQuote,
            isToggleable: true
        });
        view.bind('isEnabled').to(command, 'isEnabled');
        view.bind('isOn').to(command, 'value');
        // Execute the command.
        this.listenTo(view, 'execute', ()=>{
            editor.execute('blockQuote');
            editor.editing.view.focus();
        });
        return view;
    }
}

/**
 * The block quote plugin.
 *
 * For more information about this feature check the {@glink api/block-quote package page}.
 *
 * This is a "glue" plugin which loads the {@link module:block-quote/blockquoteediting~BlockQuoteEditing block quote editing feature}
 * and {@link module:block-quote/blockquoteui~BlockQuoteUI block quote UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */ class BlockQuote extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            BlockQuoteEditing,
            BlockQuoteUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'BlockQuote';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { BlockQuote, BlockQuoteCommand, BlockQuoteEditing, BlockQuoteUI };
//# sourceMappingURL=index.js.map

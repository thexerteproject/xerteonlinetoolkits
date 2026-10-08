/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { Delete } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { ModelLiveRange, ModelSchemaContext } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { first } from '@ckeditor/ckeditor5-utils/dist/index.js';

/**
 * The block autoformatting engine. It allows to format various block patterns. For example,
 * it can be configured to turn a paragraph starting with `*` and followed by a space into a list item.
 *
 * The autoformatting operation is integrated with the undo manager,
 * so the autoformatting step can be undone if the user's intention was not to format the text.
 *
 * See the {@link module:autoformat/blockautoformatediting~blockAutoformatEditing `blockAutoformatEditing`} documentation
 * to learn how to create custom block autoformatters. You can also use
 * the {@link module:autoformat/autoformat~Autoformat} feature which enables a set of default autoformatters
 * (lists, headings, bold and italic).
 *
 * @module autoformat/blockautoformatediting
 */ /**
 * Creates a listener triggered on {@link module:engine/model/document~ModelDocument#event:change:data `change:data`} event in the document.
 * Calls the callback when inserted text matches the regular expression or the command name
 * if provided instead of the callback.
 *
 * Examples of usage:
 *
 * To convert a paragraph into heading 1 when `- ` is typed, using just the command name:
 *
 * ```ts
 * blockAutoformatEditing( editor, plugin, /^\- $/, 'heading1' );
 * ```
 *
 * To convert a paragraph into heading 1 when `- ` is typed, using just the callback:
 *
 * ```ts
 * blockAutoformatEditing( editor, plugin, /^\- $/, ( context ) => {
 * 	const { match } = context;
 * 	const headingLevel = match[ 1 ].length;
 *
 * 	editor.execute( 'heading', {
 * 		formatId: `heading${ headingLevel }`
 * 	} );
 * } );
 * ```
 *
 * @param editor The editor instance.
 * @param plugin The autoformat plugin instance.
 * @param pattern The regular expression to execute on just inserted text. The regular expression is tested against the text
 * from the beginning until the caret position.
 * @param callbackOrCommand The callback to execute or the command to run when the text is matched.
 * In case of providing the callback, it receives the following parameter:
 * * match RegExp.exec() result of matching the pattern to inserted text.
 */ function blockAutoformatEditing(editor, plugin, pattern, callbackOrCommand) {
    let callback;
    let command = null;
    if (typeof callbackOrCommand == 'function') {
        callback = callbackOrCommand;
    } else {
        // We assume that the actual command name was provided.
        command = editor.commands.get(callbackOrCommand);
        callback = ()=>{
            editor.execute(callbackOrCommand);
        };
    }
    editor.model.document.on('change:data', (evt, batch)=>{
        if (command && !command.isEnabled || !plugin.isEnabled) {
            return;
        }
        const range = first(editor.model.document.selection.getRanges());
        if (!range.isCollapsed) {
            return;
        }
        if (batch.isUndo || !batch.isLocal) {
            return;
        }
        const changes = Array.from(editor.model.document.differ.getChanges());
        const entry = changes[0];
        // Typing is represented by only a single change.
        if (changes.length != 1 || entry.type !== 'insert' || entry.name != '$text' || entry.length != 1) {
            return;
        }
        const blockToFormat = entry.position.parent;
        // Block formatting should be disabled in codeBlocks (#5800).
        if (blockToFormat.is('element', 'codeBlock')) {
            return;
        }
        // Only list commands and custom callbacks can be applied inside a list.
        if (blockToFormat.is('element', 'listItem') && typeof callbackOrCommand !== 'function' && ![
            'numberedList',
            'bulletedList',
            'todoList'
        ].includes(callbackOrCommand)) {
            return;
        }
        // In case a command is bound, do not re-execute it over an existing block style which would result in a style removal.
        // Instead, just drop processing so that autoformat trigger text is not lost. E.g. writing "# " in a level 1 heading.
        if (command && command.value === true) {
            return;
        }
        const firstNode = blockToFormat.getChild(0);
        const firstNodeRange = editor.model.createRangeOn(firstNode);
        // Range is only expected to be within or at the very end of the first text node.
        if (!firstNodeRange.containsRange(range) && !range.end.isEqual(firstNodeRange.end)) {
            return;
        }
        const match = pattern.exec(firstNode.data.substr(0, range.end.offset));
        // ...and this text node's data match the pattern.
        if (!match) {
            return;
        }
        // Use enqueueChange to create new batch to separate typing batch from the auto-format changes.
        editor.model.enqueueChange((writer)=>{
            const selection = editor.model.document.selection;
            // Matched range.
            const start = writer.createPositionAt(blockToFormat, 0);
            const end = writer.createPositionAt(blockToFormat, match[0].length);
            const range = new ModelLiveRange(start, end);
            const wasChanged = callback({
                match
            });
            // Remove matched text.
            if (wasChanged !== false) {
                // Store selection attributes to restore them after matched text removed.
                const selectionAttributes = Array.from(selection.getAttributes());
                writer.remove(range);
                const selectionRange = selection.getFirstRange();
                const blockRange = writer.createRangeIn(blockToFormat);
                // If the block is empty and the document selection has been moved when
                // applying formatting (e.g. is now in newly created block).
                if (blockToFormat.isEmpty && !blockRange.isEqual(selectionRange) && !blockRange.containsRange(selectionRange, true)) {
                    writer.remove(blockToFormat);
                }
                // Restore selection attributes.
                restoreSelectionAttributes(writer, selection, selectionAttributes);
            }
            range.detach();
            editor.model.enqueueChange(()=>{
                const deletePlugin = editor.plugins.get('Delete');
                deletePlugin.requestUndoOnBackspace();
            });
        });
    });
}
/**
 * Restore allowed selection attributes.
 */ function restoreSelectionAttributes(writer, selection, selectionAttributes) {
    const schema = writer.model.schema;
    const selectionPosition = selection.getFirstPosition();
    let selectionSchemaContext = new ModelSchemaContext(selectionPosition);
    if (schema.checkChild(selectionSchemaContext, '$text')) {
        selectionSchemaContext = selectionSchemaContext.push('$text');
    }
    for (const [attributeName, attributeValue] of selectionAttributes){
        if (schema.checkAttribute(selectionSchemaContext, attributeName)) {
            writer.setSelectionAttribute(attributeName, attributeValue);
        }
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * The inline autoformatting engine. It allows to format various inline patterns. For example,
 * it can be configured to make "foo" bold when typed `**foo**` (the `**` markers will be removed).
 *
 * The autoformatting operation is integrated with the undo manager,
 * so the autoformatting step can be undone if the user's intention was not to format the text.
 *
 * See the {@link module:autoformat/inlineautoformatediting~inlineAutoformatEditing `inlineAutoformatEditing`} documentation
 * to learn how to create custom inline autoformatters. You can also use
 * the {@link module:autoformat/autoformat~Autoformat} feature which enables a set of default autoformatters
 * (lists, headings, bold and italic).
 *
 * @module autoformat/inlineautoformatediting
 */ /**
 * Enables autoformatting mechanism for a given {@link module:core/editor/editor~Editor}.
 *
 * It formats the matched text by applying the given model attribute or by running the provided formatting callback.
 * On every {@link module:engine/model/document~ModelDocument#event:change:data data change} in the model document
 * the autoformatting engine checks the text on the left of the selection
 * and executes the provided action if the text matches given criteria (regular expression or callback).
 *
 * @param editor The editor instance.
 * @param plugin The autoformat plugin instance.
 * @param testRegexpOrCallback The regular expression or callback to execute on text.
 * Provided regular expression *must* have three capture groups. The first and the third capture group
 * should match opening and closing delimiters. The second capture group should match the text to format.
 *
 * ```ts
 * // Matches the `**bold text**` pattern.
 * // There are three capturing groups:
 * // - The first to match the starting `**` delimiter.
 * // - The second to match the text to format.
 * // - The third to match the ending `**` delimiter.
 * inlineAutoformatEditing( editor, plugin, /(\*\*)([^\*]+?)(\*\*)$/g, formatCallback );
 * ```
 *
 * When a function is provided instead of the regular expression, it will be executed with the text to match as a parameter.
 * The function should return proper "ranges" to delete and format.
 *
 * ```ts
 * {
 * 	remove: [
 * 		[ 0, 1 ],	// Remove the first letter from the given text.
 * 		[ 5, 6 ]	// Remove the 6th letter from the given text.
 * 	],
 * 	format: [
 * 		[ 1, 5 ]	// Format all letters from 2nd to 5th.
 * 	]
 * }
 * ```
 *
 * @param formatCallback A callback to apply actual formatting.
 * It should return `false` if changes should not be applied (e.g. if a command is disabled).
 *
 * ```ts
 * inlineAutoformatEditing( editor, plugin, /(\*\*)([^\*]+?)(\*\*)$/g, ( writer, rangesToFormat ) => {
 * 	const command = editor.commands.get( 'bold' );
 *
 * 	if ( !command.isEnabled ) {
 * 		return false;
 * 	}
 *
 * 	const validRanges = editor.model.schema.getValidRanges( rangesToFormat, 'bold' );
 *
 * 	for ( let range of validRanges ) {
 * 		writer.setAttribute( 'bold', true, range );
 * 	}
 * } );
 * ```
 */ function inlineAutoformatEditing(editor, plugin, testRegexpOrCallback, formatCallback) {
    let regExp;
    let testCallback;
    if (testRegexpOrCallback instanceof RegExp) {
        regExp = testRegexpOrCallback;
    } else {
        testCallback = testRegexpOrCallback;
    }
    // A test callback run on changed text.
    testCallback = testCallback || ((text)=>{
        let result;
        const remove = [];
        const format = [];
        while((result = regExp.exec(text)) !== null){
            // There should be full match and 3 capture groups.
            if (result && result.length < 4) {
                break;
            }
            let { index, '1': leftDel, '2': content, '3': rightDel } = result;
            // Real matched string - there might be some non-capturing groups so we need to recalculate starting index.
            const found = leftDel + content + rightDel;
            index += result[0].length - found.length;
            // Start and End offsets of delimiters to remove.
            const delStart = [
                index,
                index + leftDel.length
            ];
            const delEnd = [
                index + leftDel.length + content.length,
                index + leftDel.length + content.length + rightDel.length
            ];
            remove.push(delStart);
            remove.push(delEnd);
            format.push([
                index + leftDel.length,
                index + leftDel.length + content.length
            ]);
        }
        return {
            remove,
            format
        };
    });
    editor.model.document.on('change:data', (evt, batch)=>{
        if (batch.isUndo || !batch.isLocal || !plugin.isEnabled) {
            return;
        }
        const model = editor.model;
        const selection = model.document.selection;
        // Do nothing if selection is not collapsed.
        if (!selection.isCollapsed) {
            return;
        }
        const changes = Array.from(model.document.differ.getChanges());
        const entry = changes[0];
        // Typing is represented by only a single change.
        if (changes.length != 1 || entry.type !== 'insert' || entry.name != '$text' || entry.length != 1) {
            return;
        }
        const focus = selection.focus;
        const block = focus.parent;
        const { text, range } = getTextAfterCode(model.createRange(model.createPositionAt(block, 0), focus), model);
        const testOutput = testCallback(text);
        const rangesToFormat = testOutputToRanges(range.start, testOutput.format, model);
        const rangesToRemove = testOutputToRanges(range.start, testOutput.remove, model);
        if (!(rangesToFormat.length && rangesToRemove.length)) {
            return;
        }
        // Use enqueueChange to create new batch to separate typing batch from the auto-format changes.
        model.enqueueChange((writer)=>{
            // Apply format.
            const hasChanged = formatCallback(writer, rangesToFormat);
            // Strict check on `false` to have backward compatibility (when callbacks were returning `undefined`).
            if (hasChanged === false) {
                return;
            }
            // Remove delimiters - use reversed order to not mix the offsets while removing.
            for (const range of rangesToRemove.reverse()){
                writer.remove(range);
            }
            model.enqueueChange(()=>{
                const deletePlugin = editor.plugins.get('Delete');
                deletePlugin.requestUndoOnBackspace();
            });
        });
    });
}
/**
 * Converts output of the test function provided to the inlineAutoformatEditing and converts it to the model ranges
 * inside provided block.
 */ function testOutputToRanges(start, arrays, model) {
    return arrays.filter((array)=>array[0] !== undefined && array[1] !== undefined).map((array)=>{
        return model.createRange(start.getShiftedBy(array[0]), start.getShiftedBy(array[1]));
    });
}
/**
 * Returns the last text line after the last code element from the given range.
 * It is similar to {@link module:typing/utils/getlasttextline.getLastTextLine `getLastTextLine()`},
 * but it ignores any text before the last `code`.
 */ function getTextAfterCode(range, model) {
    let start = range.start;
    const text = Array.from(range.getItems()).reduce((rangeText, node)=>{
        // Trim text to a last occurrence of an inline element and update range start.
        if (!(node.is('$text') || node.is('$textProxy')) || node.getAttribute('code')) {
            start = model.createPositionAfter(node);
            return '';
        }
        return rangeText + node.data;
    }, '');
    return {
        text,
        range: model.createRange(start, range.end)
    };
}

/**
 * Enables a set of predefined autoformatting actions.
 *
 * For a detailed overview, check the {@glink features/autoformat Autoformatting} feature guide
 * and the {@glink api/autoformat package page}.
 */ class Autoformat extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Delete
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Autoformat';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const t = this.editor.t;
        this._addListAutoformats();
        this._addBasicStylesAutoformats();
        this._addHeadingAutoformats();
        this._addBlockQuoteAutoformats();
        this._addCodeBlockAutoformats();
        this._addHorizontalLineAutoformats();
        // Add the information about the keystroke to the accessibility database.
        editor.accessibility.addKeystrokeInfos({
            keystrokes: [
                {
                    label: t('Revert autoformatting action'),
                    keystroke: 'Backspace'
                }
            ]
        });
    }
    /**
	 * Adds autoformatting related to the {@link module:list/list~List}.
	 *
	 * When typed:
	 * - `* ` or `- ` &ndash; A paragraph will be changed into a bulleted list.
	 * - `1. ` or `1) ` &ndash; A paragraph will be changed into a numbered list ("1" can be any digit or a list of digits).
	 * - `[] ` or `[ ] ` &ndash; A paragraph will be changed into a to-do list.
	 * - `[x] ` or `[ x ] ` &ndash; A paragraph will be changed into a checked to-do list.
	 */ _addListAutoformats() {
        const commands = this.editor.commands;
        if (commands.get('bulletedList')) {
            blockAutoformatEditing(this.editor, this, /^[*-]\s$/, 'bulletedList');
        }
        if (commands.get('numberedList')) {
            blockAutoformatEditing(this.editor, this, /^1[.|)]\s$/, 'numberedList');
        }
        if (commands.get('todoList')) {
            blockAutoformatEditing(this.editor, this, /^\[\s?\]\s$/, 'todoList');
        }
        if (commands.get('checkTodoList')) {
            blockAutoformatEditing(this.editor, this, /^\[\s?x\s?\]\s$/, ()=>{
                this.editor.execute('todoList');
                this.editor.execute('checkTodoList');
            });
        }
    }
    /**
	 * Adds autoformatting related to the {@link module:basic-styles/bold~Bold},
	 * {@link module:basic-styles/italic~Italic}, {@link module:basic-styles/code~Code}
	 * and {@link module:basic-styles/strikethrough~Strikethrough}
	 *
	 * When typed:
	 * - `**foobar**` &ndash; `**` characters are removed and `foobar` is set to bold,
	 * - `__foobar__` &ndash; `__` characters are removed and `foobar` is set to bold,
	 * - `*foobar*` &ndash; `*` characters are removed and `foobar` is set to italic,
	 * - `_foobar_` &ndash; `_` characters are removed and `foobar` is set to italic,
	 * - ``` `foobar` &ndash; ``` ` ``` characters are removed and `foobar` is set to code,
	 * - `~~foobar~~` &ndash; `~~` characters are removed and `foobar` is set to strikethrough.
	 */ _addBasicStylesAutoformats() {
        const commands = this.editor.commands;
        if (commands.get('bold')) {
            const boldCallback = getCallbackFunctionForInlineAutoformat(this.editor, 'bold');
            inlineAutoformatEditing(this.editor, this, /(?:^|\s)(\*\*)([^*]+)(\*\*)$/g, boldCallback);
            inlineAutoformatEditing(this.editor, this, /(?:^|\s)(__)([^_]+)(__)$/g, boldCallback);
        }
        if (commands.get('italic')) {
            const italicCallback = getCallbackFunctionForInlineAutoformat(this.editor, 'italic');
            // The italic autoformatter cannot be triggered by the bold markers, so we need to check the
            // text before the pattern (e.g. `(?:^|[^\*])`).
            inlineAutoformatEditing(this.editor, this, /(?:^|\s)(\*)([^*_]+)(\*)$/g, italicCallback);
            inlineAutoformatEditing(this.editor, this, /(?:^|\s)(_)([^_]+)(_)$/g, italicCallback);
        }
        if (commands.get('code')) {
            const codeCallback = getCallbackFunctionForInlineAutoformat(this.editor, 'code');
            inlineAutoformatEditing(this.editor, this, /(`)([^`]+)(`)$/g, codeCallback);
        }
        if (commands.get('strikethrough')) {
            const strikethroughCallback = getCallbackFunctionForInlineAutoformat(this.editor, 'strikethrough');
            inlineAutoformatEditing(this.editor, this, /(~~)([^~]+)(~~)$/g, strikethroughCallback);
        }
    }
    /**
	 * Adds autoformatting related to {@link module:heading/heading~Heading}.
	 *
	 * It is using a number at the end of the command name to associate it with the proper trigger:
	 *
	 * * `heading` with a `heading1` value will be executed when typing `#`,
	 * * `heading` with a `heading2` value will be executed when typing `##`,
	 * * ... up to `heading6` for `######`.
	 */ _addHeadingAutoformats() {
        const command = this.editor.commands.get('heading');
        if (command) {
            command.modelElements.filter((name)=>name.match(/^heading[1-6]$/)).forEach((modelName)=>{
                const level = modelName[7];
                const pattern = new RegExp(`^(#{${level}})\\s$`);
                blockAutoformatEditing(this.editor, this, pattern, ()=>{
                    // Should only be active if command is enabled and heading style associated with pattern is inactive.
                    if (!command.isEnabled || command.value === modelName) {
                        return false;
                    }
                    this.editor.execute('heading', {
                        value: modelName
                    });
                });
            });
        }
    }
    /**
	 * Adds autoformatting related to {@link module:block-quote/blockquote~BlockQuote}.
	 *
	 * When typed:
	 * * `> ` &ndash; A paragraph will be changed to a block quote.
	 */ _addBlockQuoteAutoformats() {
        if (this.editor.commands.get('blockQuote')) {
            blockAutoformatEditing(this.editor, this, /^>\s$/, 'blockQuote');
        }
    }
    /**
	 * Adds autoformatting related to {@link module:code-block/codeblock~CodeBlock}.
	 *
	 * When typed:
	 * - `` ``` `` &ndash; A paragraph will be changed to a code block.
	 */ _addCodeBlockAutoformats() {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        if (editor.commands.get('codeBlock')) {
            blockAutoformatEditing(editor, this, /^```$/, ()=>{
                if (selection.getFirstPosition().parent.is('element', 'listItem')) {
                    return false;
                }
                this.editor.execute('codeBlock', {
                    usePreviousLanguageChoice: true
                });
            });
        }
    }
    /**
	 * Adds autoformatting related to {@link module:horizontal-line/horizontalline~HorizontalLine}.
	 *
	 * When typed:
	 * - `` --- `` &ndash; Will be replaced with a horizontal line.
	 */ _addHorizontalLineAutoformats() {
        if (this.editor.commands.get('horizontalLine')) {
            blockAutoformatEditing(this.editor, this, /^---$/, 'horizontalLine');
        }
    }
}
/**
 * Helper function for getting `inlineAutoformatEditing` callbacks that checks if command is enabled.
 */ function getCallbackFunctionForInlineAutoformat(editor, attributeKey) {
    return (writer, rangesToFormat)=>{
        const command = editor.commands.get(attributeKey);
        if (!command.isEnabled) {
            return false;
        }
        const validRanges = editor.model.schema.getValidRanges(rangesToFormat, attributeKey);
        for (const range of validRanges){
            writer.setAttribute(attributeKey, true, range);
        }
        // After applying attribute to the text, remove given attribute from the selection.
        // This way user is able to type a text without attribute used by auto formatter.
        writer.removeSelectionAttribute(attributeKey);
    };
}

export { Autoformat, blockAutoformatEditing, inlineAutoformatEditing };
//# sourceMappingURL=index.js.map

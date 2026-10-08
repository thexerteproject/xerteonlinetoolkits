/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ShiftEnter } from '@ckeditor/ckeditor5-enter/dist/index.js';
import { ViewUpcastWriter } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard/dist/index.js';
import { first, Collection } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { createDropdown, SplitButtonView, addListToDropdown, MenuBarMenuView, MenuBarMenuListView, MenuBarMenuListItemView, MenuBarMenuListItemButtonView, UIModel } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconCodeBlock } from '@ckeditor/ckeditor5-icons/dist/index.js';

/**
 * Returns code block languages as defined in `config.codeBlock.languages` but processed:
 *
 * * To consider the editor localization, i.e. to display {@link module:code-block/codeblockconfig~CodeBlockLanguageDefinition}
 * in the correct language. There is no way to use {@link module:utils/locale~Locale#t} when the user
 * configuration is defined because the editor does not exist yet.
 * * To make sure each definition has a CSS class associated with it even if not specified
 * in the original configuration.
 *
 * @internal
 */ function getNormalizedAndLocalizedLanguageDefinitions(editor) {
    const t = editor.t;
    const languageDefs = editor.config.get('codeBlock.languages');
    for (const def of languageDefs){
        if (def.label === 'Plain text') {
            def.label = t('Plain text');
        }
        if (def.class === undefined) {
            def.class = `language-${def.language}`;
        }
    }
    return languageDefs;
}
/**
 * Returns an object associating certain language definition properties with others. For instance:
 *
 * For:
 *
 * ```ts
 * const definitions = {
 * 	{ language: 'php', class: 'language-php', label: 'PHP' },
 * 	{ language: 'javascript', class: 'js', label: 'JavaScript' },
 * };
 *
 * getPropertyAssociation( definitions, 'class', 'language' );
 * ```
 *
 * returns:
 *
 * ```ts
 * {
 * 	'language-php': 'php',
 * 	'js': 'javascript'
 * }
 * ```
 *
 * and
 *
 * ```ts
 * getPropertyAssociation( definitions, 'language', 'label' );
 * ```
 *
 * returns:
 *
 * ```ts
 * {
 * 	'php': 'PHP',
 * 	'javascript': 'JavaScript'
 * }
 * ```
 *
 * @internal
 */ function getPropertyAssociation(languageDefs, key, value) {
    const association = {};
    for (const def of languageDefs){
        if (key === 'class') {
            // Only the first class is considered.
            const newKey = def[key].split(' ').shift();
            association[newKey] = def[value];
        } else {
            association[def[key]] = def[value];
        }
    }
    return association;
}
/**
 * For a given model text node, it returns white spaces that precede other characters in that node.
 * This corresponds to the indentation part of the code block line.
 *
 * @internal
 */ function getLeadingWhiteSpaces(textNode) {
    return textNode.data.match(/^(\s*)/)[0];
}
/**
 * For plain text containing the code (a snippet), it returns a document fragment containing
 * view text nodes separated by `<br>` elements (in place of new line characters "\n"), for instance:
 *
 * Input:
 *
 * ```ts
 * "foo()\n
 * bar()"
 * ```
 *
 * Output:
 *
 * ```html
 * <DocumentFragment>
 * 	"foo()"
 * 	<br/>
 * 	"bar()"
 * </DocumentFragment>
 * ```
 *
 * @param text The raw code text to be converted.
 * @internal
 */ function rawSnippetTextToViewDocumentFragment(writer, text) {
    const fragment = writer.createDocumentFragment();
    const textLines = text.split('\n');
    const items = textLines.reduce((nodes, line, lineIndex)=>{
        nodes.push(line);
        if (lineIndex < textLines.length - 1) {
            nodes.push(writer.createElement('br'));
        }
        return nodes;
    }, []);
    writer.appendChild(items, fragment);
    return fragment;
}
/**
 * Returns an array of all model positions within the selection that represent code block lines.
 *
 * If the selection is collapsed, it returns the exact selection anchor position:
 *
 * ```html
 * <codeBlock>[]foo</codeBlock>        ->     <codeBlock>^foo</codeBlock>
 * <codeBlock>foo[]bar</codeBlock>     ->     <codeBlock>foo^bar</codeBlock>
 * ```
 *
 * Otherwise, it returns positions **before** each text node belonging to all code blocks contained by the selection:
 *
 * ```html
 * <codeBlock>                                <codeBlock>
 *     foo[bar                                   ^foobar
 *     <softBreak></softBreak>         ->        <softBreak></softBreak>
 *     baz]qux                                   ^bazqux
 * </codeBlock>                               </codeBlock>
 * ```
 *
 * It also works across other non–code blocks:
 *
 * ```html
 * <codeBlock>                                <codeBlock>
 *     foo[bar                                   ^foobar
 * </codeBlock>                               </codeBlock>
 * <paragraph>text</paragraph>         ->     <paragraph>text</paragraph>
 * <codeBlock>                                <codeBlock>
 *     baz]qux                                   ^bazqux
 * </codeBlock>                               </codeBlock>
 * ```
 *
 * **Note:** The positions are in reverse order so they do not get outdated when iterating over them and
 * the writer inserts or removes elements at the same time.
 *
 * **Note:** The position is located after the leading white spaces in the text node.
 *
 * @internal
 */ function getIndentOutdentPositions(model) {
    const selection = model.document.selection;
    const positions = [];
    // When the selection is collapsed, there's only one position we can indent or outdent.
    if (selection.isCollapsed) {
        return [
            selection.anchor
        ];
    }
    // When the selection is NOT collapsed, collect all positions starting before text nodes
    // (code lines) in any <codeBlock> within the selection.
    // Walk backward so positions we are about to collect here do not get outdated when
    // inserting or deleting using the writer.
    const walker = selection.getFirstRange().getWalker({
        ignoreElementEnd: true,
        direction: 'backward'
    });
    for (const { item } of walker){
        let node = item.is('$textProxy') ? item.textNode : item;
        const parent = node.parent;
        if (!parent.is('element', 'codeBlock') || node.is('element', 'softBreak')) {
            continue;
        }
        // For each item in code block, move backwards until the beginning of the line it is in is found.
        while(node.previousSibling && !node.previousSibling.is('element', 'softBreak')){
            node = node.previousSibling;
        }
        // Take the leading white spaces into account (only for text nodes).
        const startOffset = !node.is('$text') ? node.startOffset : node.startOffset + getLeadingWhiteSpaces(node).length;
        const position = model.createPositionAt(parent, startOffset);
        // Do not add the same position twice. Unfortunately using set doesn't deduplicate positions because
        // they are different objects.
        if (positions.every((pos)=>!pos.isEqual(position))) {
            positions.push(position);
        }
    }
    return positions;
}
/**
 * Checks if any of the blocks within the model selection is a code block.
 *
 * @internal
 */ function isModelSelectionInCodeBlock(selection) {
    const firstBlock = first(selection.getSelectedBlocks());
    return !!firstBlock && firstBlock.is('element', 'codeBlock');
}
/**
 * Checks if an {@link module:engine/model/element~ModelElement Element} can become a code block.
 *
 * @param schema Model's schema.
 * @param element The element to be checked.
 * @returns Check result.
 * @internal
 */ function canBeCodeBlock(schema, element) {
    if (element.is('rootElement') || schema.isLimit(element)) {
        return false;
    }
    return schema.checkChild(element.parent, 'codeBlock');
}
/**
 * Get the translated message read by the screen reader when you enter or exit an element with your cursor.
 *
 * @internal
 */ function getCodeBlockAriaAnnouncement(t, languageDefs, element, direction) {
    const languagesToLabels = getPropertyAssociation(languageDefs, 'language', 'label');
    const codeBlockLanguage = element.getAttribute('language');
    if (codeBlockLanguage in languagesToLabels) {
        const language = languagesToLabels[codeBlockLanguage];
        if (direction === 'enter') {
            return t('Entering %0 code snippet', language);
        }
        return t('Leaving %0 code snippet', language);
    }
    if (direction === 'enter') {
        return t('Entering code snippet');
    }
    return t('Leaving code snippet');
}
/**
 * For given position, finds the closest position that is at the beginning of a line of code and returns a text node that is at the
 * beginning of the line (or `null` if there's no text node at the beginning of a given line).
 *
 * Line beings at the start of a code block element and after each `softBreak` element.
 *
 * Note: even though code block doesn't allow inline elements other than `<softBreak>` by default, some features may overwrite this rule,
 * so such inline elements are taken into account.
 *
 * Some examples of expected results:
 *
 * ```
 * <codeBlock>^</codeBlock>                                ->   null
 * <codeBlock>^foobar</codeBlock>                          ->   <codeBlock>[foobar]</codeBlock>
 * <codeBlock>foobar^</codeBlock>                          ->   <codeBlock>[foobar]</codeBlock>
 * <codeBlock>foo^bar</codeBlock>                          ->   <codeBlock>[foobar]</codeBlock>
 * <codeBlock>foo^<softBreak />bar</codeBlock>             ->   <codeBlock>[foo]<softBreak />bar</codeBlock>
 * <codeBlock>foo<softBreak />bar^</codeBlock>             ->   <codeBlock>foo<softBreak />[bar]</codeBlock>
 * <codeBlock>foo<softBreak />b^ar</codeBlock>             ->   <codeBlock>foo<softBreak />[bar]</codeBlock>
 * <codeBlock>foo<softBreak />^bar</codeBlock>             ->   <codeBlock>foo<softBreak />[bar]</codeBlock>
 * <codeBlock>^<element /></codeBlock>                     ->   null
 * <codeBlock><element />^</codeBlock>                     ->   null
 * <codeBlock>foo^<element /></codeBlock>                  ->   <codeBlock>[foo]<element /></codeBlock>
 * <codeBlock>foo<element />^</codeBlock>                  ->   <codeBlock>[foo]<element /></codeBlock>
 * <codeBlock>foo<element />bar^</codeBlock>               ->   <codeBlock>[foo]<element />bar</codeBlock>
 * <codeBlock><element />bar^</codeBlock>                  ->   null
 * <codeBlock>foo<softBreak />^<softBreak /></codeBlock>   ->   null
 * <codeBlock>foo<softBreak />^<element /></codeBlock>     ->   null
 * <codeBlock>foo<softBreak /><element />^</codeBlock>     ->   null
 * <codeBlock>foo<softBreak />bar<element />^</codeBlock>  ->   <codeBlock>foo<softBreak />[bar]<element /></codeBlock>
 * <codeBlock>foo<softBreak /><element />ba^r</codeBlock>  ->   null
 * ```
 *
 * @internal
 */ function getTextNodeAtLineStart(position, model) {
    // First, move position before a text node, if it is inside a text node.
    if (position.textNode) {
        position = model.createPositionBefore(position.textNode);
    }
    // Then, jump-back the position until it is before a `softBreak` or at the beginning of the `codeBlock`.
    while(position.nodeBefore && !position.nodeBefore.is('element', 'softBreak')){
        position = model.createPositionBefore(position.nodeBefore);
    }
    // Now, the position is at the beginning of a line.
    // Return a text node after the position, if there is one.
    const nodeAtStart = position.nodeAfter;
    return nodeAtStart && nodeAtStart.is('$text') ? nodeAtStart : null;
}

/**
 * The code block command plugin.
 */ class CodeBlockCommand extends Command {
    /**
	 * Contains the last used language.
	 */ _lastLanguage;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._lastLanguage = null;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.value = this._getValue();
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Executes the command. When the command {@link #value is on}, all topmost code blocks within
	 * the selection will be removed. If it is off, all selected blocks will be flattened and
	 * wrapped by a code block.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.language The code block language.
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply a code block,
	 * otherwise the command will remove the code block. If not set, the command will act basing on its current value.
	 * @param options.usePreviousLanguageChoice If set on `true` and the `options.language` is not specified, the command
	 * will apply the previous language (if the command was already executed) when inserting the `codeBlock` element.
	 */ execute(options = {}) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const normalizedLanguagesDefs = getNormalizedAndLocalizedLanguageDefinitions(editor);
        const firstLanguageInConfig = normalizedLanguagesDefs[0];
        const blocks = Array.from(selection.getSelectedBlocks());
        const value = options.forceValue == undefined ? !this.value : options.forceValue;
        const language = getLanguage(options, this._lastLanguage, firstLanguageInConfig.language);
        model.change((writer)=>{
            if (value) {
                this._applyCodeBlock(writer, blocks, language);
            } else {
                this._removeCodeBlock(writer, blocks);
            }
        });
    }
    /**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */ _getValue() {
        const selection = this.editor.model.document.selection;
        const firstBlock = first(selection.getSelectedBlocks());
        const isCodeBlock = !!firstBlock?.is('element', 'codeBlock');
        return isCodeBlock ? firstBlock.getAttribute('language') : false;
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
        return canBeCodeBlock(schema, firstBlock);
    }
    _applyCodeBlock(writer, blocks, language) {
        this._lastLanguage = language;
        const schema = this.editor.model.schema;
        const allowedBlocks = blocks.filter((block)=>canBeCodeBlock(schema, block));
        for (const block of allowedBlocks){
            writer.rename(block, 'codeBlock');
            writer.setAttribute('language', language, block);
            schema.removeDisallowedAttributes([
                block
            ], writer);
            // Remove children of the  `codeBlock` element that are not allowed. See #9567.
            Array.from(block.getChildren()).filter((child)=>!schema.checkChild(block, child)).forEach((child)=>writer.remove(child));
        }
        allowedBlocks.reverse().forEach((currentBlock, i)=>{
            const nextBlock = allowedBlocks[i + 1];
            if (currentBlock.previousSibling === nextBlock) {
                writer.appendElement('softBreak', nextBlock);
                writer.merge(writer.createPositionBefore(currentBlock));
            }
        });
    }
    _removeCodeBlock(writer, blocks) {
        const codeBlocks = blocks.filter((block)=>block.is('element', 'codeBlock'));
        for (const block of codeBlocks){
            const range = writer.createRangeOn(block);
            for (const item of Array.from(range.getItems()).reverse()){
                if (item.is('element', 'softBreak') && item.parent.is('element', 'codeBlock')) {
                    const { position } = writer.split(writer.createPositionBefore(item));
                    const elementAfter = position.nodeAfter;
                    writer.rename(elementAfter, 'paragraph');
                    writer.removeAttribute('language', elementAfter);
                    writer.remove(item);
                }
            }
            writer.rename(block, 'paragraph');
            writer.removeAttribute('language', block);
        }
    }
}
/**
 * Picks the language for the new code block. If any language is passed as an option,
 * it will be returned. Else, if option usePreviousLanguageChoice is true and some
 * code block was already created (lastLanguage is not null) then previously used
 * language will be returned. If not, it will return default language.
 */ function getLanguage(options, lastLanguage, defaultLanguage) {
    if (options.language) {
        return options.language;
    }
    if (options.usePreviousLanguageChoice && lastLanguage) {
        return lastLanguage;
    }
    return defaultLanguage;
}

/**
 * The code block indentation increase command plugin.
 */ class IndentCodeBlockCommand extends Command {
    /**
	 * A sequence of characters added to the line when the command is executed.
	 */ _indentSequence;
    constructor(editor){
        super(editor);
        this._indentSequence = editor.config.get('codeBlock.indentSequence');
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Executes the command. When the command {@link #isEnabled is enabled}, the indentation of the
	 * code lines in the selection will be increased.
	 *
	 * @fires execute
	 */ execute() {
        const editor = this.editor;
        const model = editor.model;
        model.change((writer)=>{
            const positions = getIndentOutdentPositions(model);
            // Indent all positions, for instance assuming the indent sequence is 4x space ("    "):
            //
            //		<codeBlock>^foo</codeBlock>        ->       <codeBlock>    foo</codeBlock>
            //
            //		<codeBlock>foo^bar</codeBlock>     ->       <codeBlock>foo    bar</codeBlock>
            //
            // Also, when there is more than one position:
            //
            //		<codeBlock>
            //			^foobar
            //			<softBreak></softBreak>
            //			^bazqux
            //		</codeBlock>
            //
            //		->
            //
            //		<codeBlock>
            //			    foobar
            //			<softBreak></softBreak>
            //			    bazqux
            //		</codeBlock>
            //
            for (const position of positions){
                const indentSequenceTextElement = writer.createText(this._indentSequence);
                // Previously insertion was done by writer.insertText(). It was changed to insertContent() to enable
                // integration of code block with track changes. It's the easiest way of integration because insertContent()
                // is already integrated with track changes, but if it ever cause any troubles it can be reverted, however
                // some additional work will be required in track changes integration of code block.
                model.insertContent(indentSequenceTextElement, position);
            }
        });
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 */ _checkEnabled() {
        if (!this._indentSequence) {
            return false;
        }
        // Indent (forward) command is always enabled when there's any code block in the selection
        // because you can always indent code lines.
        return isModelSelectionInCodeBlock(this.editor.model.document.selection);
    }
}

/**
 * The code block indentation decrease command plugin.
 */ class OutdentCodeBlockCommand extends Command {
    /**
	 * A sequence of characters removed from the line when the command is executed.
	 */ _indentSequence;
    constructor(editor){
        super(editor);
        this._indentSequence = editor.config.get('codeBlock.indentSequence');
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * Executes the command. When the command {@link #isEnabled is enabled}, the indentation of the
	 * code lines in the selection will be decreased.
	 *
	 * @fires execute
	 */ execute() {
        const editor = this.editor;
        const model = editor.model;
        model.change(()=>{
            const positions = getIndentOutdentPositions(model);
            // Outdent all positions, for instance assuming the indent sequence is 4x space ("    "):
            //
            //		<codeBlock>^foo</codeBlock>         ->       <codeBlock>foo</codeBlock>
            //
            //		<codeBlock>    ^bar</codeBlock>     ->       <codeBlock>bar</codeBlock>
            //
            // Also, when there is more than one position:
            //
            //		<codeBlock>
            //			    ^foobar
            //			<softBreak></softBreak>
            //			    ^bazqux
            //		</codeBlock>
            //
            //		->
            //
            //		<codeBlock>
            //			foobar
            //			<softBreak></softBreak>
            //			bazqux
            //		</codeBlock>
            for (const position of positions){
                const range = getLastOutdentableSequenceRange(model, position, this._indentSequence);
                if (range) {
                    // Previously deletion was done by writer.remove(). It was changed to deleteContent() to enable
                    // integration of code block with track changes. It's the easiest way of integration because deleteContent()
                    // is already integrated with track changes, but if it ever cause any troubles it can be reverted, however
                    // some additional work will be required in track changes integration of code block.
                    model.deleteContent(model.createSelection(range));
                }
            }
        });
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */ _checkEnabled() {
        if (!this._indentSequence) {
            return false;
        }
        const model = this.editor.model;
        if (!isModelSelectionInCodeBlock(model.document.selection)) {
            return false;
        }
        // Outdent command can execute only when there is an indent character sequence
        // in some of the lines.
        return getIndentOutdentPositions(model).some((position)=>{
            return getLastOutdentableSequenceRange(model, position, this._indentSequence);
        });
    }
}
// For a position coming from `getIndentOutdentPositions()`, it returns the range representing
// the last occurrence of the indent sequence among the leading whitespaces of the code line the
// position represents.
//
// For instance, assuming the indent sequence is 4x space ("    "):
//
//		<codeBlock>foo^</codeBlock>                                 ->          null
//		<codeBlock>foo^<softBreak></softBreak>bar</codeBlock>       ->          null
//		<codeBlock>  ^foo</codeBlock>                               ->          null
//		<codeBlock>        ^foo</codeBlock>                         ->          <codeBlock>    [    ]foo</codeBlock>
//		<codeBlock>    ^foo    bar</codeBlock>                      ->          <codeBlock>[    ]foo    bar</codeBlock>
//
// @param {<module:engine/model/model~Model>} model
// @param {<module:engine/model/position~ModelPosition>} position
// @param {String} sequence
// @returns {<module:engine/model/range~ModelRange>|null}
function getLastOutdentableSequenceRange(model, position, sequence) {
    // Positions start before each text node (code line). Get the node corresponding to the position.
    const nodeAtPosition = getTextNodeAtLineStart(position, model);
    if (!nodeAtPosition) {
        return null;
    }
    const leadingWhiteSpaces = getLeadingWhiteSpaces(nodeAtPosition);
    const lastIndexOfSequence = leadingWhiteSpaces.lastIndexOf(sequence);
    // For instance, assuming the indent sequence is 4x space ("    "):
    //
    //		<codeBlock>    	^foo</codeBlock>           ->             null
    //
    if (lastIndexOfSequence + sequence.length !== leadingWhiteSpaces.length) {
        return null;
    }
    // For instance, assuming the indent sequence is 4x space ("    "):
    //
    //		<codeBlock>  ^foo</codeBlock>           ->             null
    //
    if (lastIndexOfSequence === -1) {
        return null;
    }
    const { parent, startOffset } = nodeAtPosition;
    // Create a range that contains the **last** indent sequence among the leading whitespaces
    // of the line.
    //
    // For instance, assuming the indent sequence is 4x space ("    "):
    //
    //		<codeBlock>        ^foo</codeBlock>      ->     <codeBlock>    [    ]foo</codeBlock>
    //
    return model.createRange(model.createPositionAt(parent, startOffset + lastIndexOfSequence), model.createPositionAt(parent, startOffset + lastIndexOfSequence + sequence.length));
}

/**
 * A model-to-view (both editing and data) converter for the `codeBlock` element.
 *
 * Sample input:
 *
 * ```html
 * <codeBlock language="javascript">foo();<softBreak></softBreak>bar();</codeBlock>
 * ```
 *
 * Sample output (editing):
 *
 * ```html
 * <pre data-language="JavaScript"><code class="language-javascript">foo();<br />bar();</code></pre>
 * ```
 *
 * Sample output (data, see {@link module:code-block/converters~modelToDataViewSoftBreakInsertion}):
 *
 * ```html
 * <pre><code class="language-javascript">foo();\nbar();</code></pre>
 * ```
 *
 * @param languageDefs The normalized language configuration passed to the feature.
 * @param useLabels When `true`, the `<pre>` element will get a `data-language` attribute with a
 * human–readable label of the language. Used only in the editing.
 * @returns Returns a conversion callback.
 * @internal
 */ function modelToViewCodeBlockInsertion(model, languageDefs, useLabels = false) {
    // Language CSS classes:
    //
    //		{
    //			php: 'language-php',
    //			python: 'language-python',
    //			javascript: 'js',
    //			...
    //		}
    const languagesToClasses = getPropertyAssociation(languageDefs, 'language', 'class');
    // Language labels:
    //
    //		{
    //			php: 'PHP',
    //			python: 'Python',
    //			javascript: 'JavaScript',
    //			...
    //		}
    const languagesToLabels = getPropertyAssociation(languageDefs, 'language', 'label');
    return (evt, data, conversionApi)=>{
        const { writer, mapper, consumable } = conversionApi;
        if (!consumable.consume(data.item, 'insert')) {
            return;
        }
        const codeBlockLanguage = data.item.getAttribute('language');
        const targetViewPosition = mapper.toViewPosition(model.createPositionBefore(data.item));
        const preAttributes = {};
        // Attributes added only in the editing view.
        if (useLabels) {
            preAttributes['data-language'] = languagesToLabels[codeBlockLanguage];
            preAttributes.spellcheck = 'false';
        }
        const codeAttributes = languagesToClasses[codeBlockLanguage] ? {
            class: languagesToClasses[codeBlockLanguage]
        } : undefined;
        const code = writer.createContainerElement('code', codeAttributes);
        const pre = writer.createContainerElement('pre', preAttributes, code);
        writer.insert(targetViewPosition, pre);
        mapper.bindElements(data.item, code);
    };
}
/**
 * A model-to-data view converter for the new line (`softBreak`) separator.
 *
 * Sample input:
 *
 * ```html
 * <codeBlock ...>foo();<softBreak></softBreak>bar();</codeBlock>
 * ```
 *
 * Sample output:
 *
 * ```html
 * <pre><code ...>foo();\nbar();</code></pre>
 * ```
 *
 * @returns Returns a conversion callback.
 * @internal
 */ function modelToDataViewSoftBreakInsertion(model) {
    return (evt, data, conversionApi)=>{
        if (data.item.parent.name !== 'codeBlock') {
            return;
        }
        const { writer, mapper, consumable } = conversionApi;
        if (!consumable.consume(data.item, 'insert')) {
            return;
        }
        const position = mapper.toViewPosition(model.createPositionBefore(data.item));
        writer.insert(position, writer.createText('\n'));
    };
}
/**
 * A view-to-model converter for `<pre>` with the `<code>` HTML.
 *
 * Sample input:
 *
 * ```html
 * <pre><code class="language-javascript">foo();bar();</code></pre>
 * ```
 *
 * Sample output:
 *
 * ```html
 * <codeBlock language="javascript">foo();bar();</codeBlock>
 * ```
 *
 * @param languageDefs The normalized language configuration passed to the feature.
 * @returns Returns a conversion callback.
 * @internal
 */ function dataViewToModelCodeBlockInsertion(editingView, languageDefs) {
    // Language names associated with CSS classes:
    //
    //		{
    //			'language-php': 'php',
    //			'language-python': 'python',
    //			js: 'javascript',
    //			...
    //		}
    const classesToLanguages = getPropertyAssociation(languageDefs, 'class', 'language');
    const defaultLanguageName = languageDefs[0].language;
    return (evt, data, conversionApi)=>{
        const viewCodeElement = data.viewItem;
        const viewPreElement = viewCodeElement.parent;
        if (!viewPreElement || !viewPreElement.is('element', 'pre')) {
            return;
        }
        // In case of nested code blocks we don't want to convert to another code block.
        if (data.modelCursor.findAncestor('codeBlock')) {
            return;
        }
        const { consumable, writer } = conversionApi;
        if (!consumable.test(viewCodeElement, {
            name: true
        })) {
            return;
        }
        const codeBlock = writer.createElement('codeBlock');
        const viewChildClasses = [
            ...viewCodeElement.getClassNames()
        ];
        // As we're to associate each class with a model language, a lack of class (empty class) can be
        // also associated with a language if the language definition was configured so. Pushing an empty
        // string to make sure the association will work.
        if (!viewChildClasses.length) {
            viewChildClasses.push('');
        }
        // Figure out if any of the <code> element's class names is a valid programming
        // language class. If so, use it on the model element (becomes the language of the entire block).
        for (const className of viewChildClasses){
            const language = classesToLanguages[className];
            if (language) {
                consumable.consume(viewCodeElement, {
                    classes: [
                        className
                    ]
                });
                writer.setAttribute('language', language, codeBlock);
                break;
            }
        }
        // If no language value was set, use the default language from the config.
        if (!codeBlock.hasAttribute('language')) {
            writer.setAttribute('language', defaultLanguageName, codeBlock);
        }
        // Convert children before inserting the code block element
        // to make sure that code block won't be splitted by any block.
        conversionApi.convertChildren(viewCodeElement, codeBlock);
        // Let's try to insert code block.
        if (!conversionApi.safeInsert(codeBlock, data.modelCursor)) {
            return;
        }
        consumable.consume(viewCodeElement, {
            name: true
        });
        conversionApi.updateConversionResult(codeBlock, data);
    };
}
/**
 * A view-to-model converter for new line characters in `<pre>`.
 *
 * Sample input:
 *
 * ```html
 * <pre><code class="language-javascript">foo();\nbar();</code></pre>
 * ```
 *
 * Sample output:
 *
 * ```html
 * <codeBlock language="javascript">foo();<softBreak></softBreak>bar();</codeBlock>
 * ```
 *
 * @returns {Function} Returns a conversion callback.
 * @internal
 */ function dataViewToModelTextNewlinesInsertion() {
    return (evt, data, { consumable, writer })=>{
        let position = data.modelCursor;
        // When node is already converted then do nothing.
        if (!consumable.test(data.viewItem)) {
            return;
        }
        // When not inside `codeBlock` then do nothing.
        if (!position.findAncestor('codeBlock')) {
            return;
        }
        consumable.consume(data.viewItem);
        const text = data.viewItem.data;
        const textLines = text.split('\n').map((data)=>writer.createText(data));
        const lastLine = textLines[textLines.length - 1];
        for (const node of textLines){
            writer.insert(node, position);
            position = position.getShiftedBy(node.offsetSize);
            if (node !== lastLine) {
                const softBreak = writer.createElement('softBreak');
                writer.insert(softBreak, position);
                position = writer.createPositionAfter(softBreak);
            }
        }
        data.modelRange = writer.createRange(data.modelCursor, position);
        data.modelCursor = position;
    };
}
/**
 * A view-to-model converter that handles orphan text nodes (white spaces, new lines, etc.)
 * that surround `<code>` inside `<pre>`.
 *
 * Sample input:
 *
 * ```html
 * // White spaces
 * <pre> <code>foo()</code> </pre>
 *
 * // White spaces
 * <pre>      <code>foo()</code>      </pre>
 *
 * // White spaces
 * <pre>			<code>foo()</code>			</pre>
 *
 * // New lines
 * <pre>
 * 	<code>foo()</code>
 * </pre>
 *
 * // Redundant text
 * <pre>ABC<code>foo()</code>DEF</pre>
 * ```
 *
 * Unified output for each case:
 *
 * ```html
 * <codeBlock language="plaintext">foo()</codeBlock>
 * ```
 *
 * @returns Returns a conversion callback.
 * @internal
 */ function dataViewToModelOrphanNodeConsumer() {
    return (evt, data, { consumable })=>{
        const preElement = data.viewItem;
        // Don't clean up nested pre elements. Their content should stay as it is, they are not upcasted
        // to code blocks.
        if (preElement.findAncestor('pre')) {
            return;
        }
        const preChildren = Array.from(preElement.getChildren());
        const childCodeElement = preChildren.find((node)=>node.is('element', 'code'));
        // <code>-less <pre>. It will not upcast to code block in the model, skipping.
        if (!childCodeElement) {
            return;
        }
        for (const child of preChildren){
            if (child === childCodeElement || !child.is('$text')) {
                continue;
            }
            // Consuming the orphan to remove it from the input data.
            // Second argument in `consumable.consume` is discarded for text nodes.
            consumable.consume(child, {
                name: true
            });
        }
    };
}

const DEFAULT_ELEMENT = 'paragraph';
/**
 * The editing part of the code block feature.
 *
 * Introduces the `'codeBlock'` command and the `'codeBlock'` model element.
 */ class CodeBlockEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CodeBlockEditing';
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
            ShiftEnter
        ];
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('codeBlock', {
            languages: [
                {
                    language: 'plaintext',
                    label: 'Plain text'
                },
                {
                    language: 'c',
                    label: 'C'
                },
                {
                    language: 'cs',
                    label: 'C#'
                },
                {
                    language: 'cpp',
                    label: 'C++'
                },
                {
                    language: 'css',
                    label: 'CSS'
                },
                {
                    language: 'diff',
                    label: 'Diff'
                },
                {
                    language: 'go',
                    label: 'Go'
                },
                {
                    language: 'html',
                    label: 'HTML'
                },
                {
                    language: 'java',
                    label: 'Java'
                },
                {
                    language: 'javascript',
                    label: 'JavaScript'
                },
                {
                    language: 'php',
                    label: 'PHP'
                },
                {
                    language: 'python',
                    label: 'Python'
                },
                {
                    language: 'ruby',
                    label: 'Ruby'
                },
                {
                    language: 'typescript',
                    label: 'TypeScript'
                },
                {
                    language: 'xml',
                    label: 'XML'
                }
            ],
            // A single tab.
            indentSequence: '\t'
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const model = editor.model;
        const view = editor.editing.view;
        const normalizedLanguagesDefs = getNormalizedAndLocalizedLanguageDefinitions(editor);
        // The main command.
        editor.commands.add('codeBlock', new CodeBlockCommand(editor));
        // Commands that change the indentation.
        editor.commands.add('indentCodeBlock', new IndentCodeBlockCommand(editor));
        editor.commands.add('outdentCodeBlock', new OutdentCodeBlockCommand(editor));
        this.listenTo(view.document, 'tab', (evt, data)=>{
            const commandName = data.shiftKey ? 'outdentCodeBlock' : 'indentCodeBlock';
            const command = editor.commands.get(commandName);
            if (!command.isEnabled) {
                return;
            }
            editor.execute(commandName);
            data.stopPropagation();
            data.preventDefault();
            evt.stop();
        }, {
            context: 'pre'
        });
        schema.register('codeBlock', {
            allowWhere: '$block',
            allowChildren: '$text',
            // Disallow `$inlineObject` and its derivatives like `inlineWidget` inside `codeBlock` to ensure that only text,
            // not other inline elements like inline images, are allowed. This maintains the semantic integrity of code blocks.
            disallowChildren: '$inlineObject',
            allowAttributes: [
                'language'
            ],
            allowAttributesOf: '$listItem',
            isBlock: true
        });
        // Disallow formatting attributes on `codeBlock` children.
        schema.addAttributeCheck((context, attributeName)=>{
            const parent = context.getItem(context.length - 2);
            const isFormatting = schema.getAttributeProperties(attributeName).isFormatting;
            if (isFormatting && parent && parent.name == 'codeBlock') {
                return false;
            }
        });
        // Conversion.
        editor.editing.downcastDispatcher.on('insert:codeBlock', modelToViewCodeBlockInsertion(model, normalizedLanguagesDefs, true));
        editor.data.downcastDispatcher.on('insert:codeBlock', modelToViewCodeBlockInsertion(model, normalizedLanguagesDefs));
        editor.data.downcastDispatcher.on('insert:softBreak', modelToDataViewSoftBreakInsertion(model), {
            priority: 'high'
        });
        editor.data.upcastDispatcher.on('element:code', dataViewToModelCodeBlockInsertion(view, normalizedLanguagesDefs));
        editor.data.upcastDispatcher.on('text', dataViewToModelTextNewlinesInsertion());
        editor.data.upcastDispatcher.on('element:pre', dataViewToModelOrphanNodeConsumer(), {
            priority: 'high'
        });
        // Intercept the clipboard input (paste) when the selection is anchored in the code block and force the clipboard
        // data to be pasted as a single plain text. Otherwise, the code lines will split the code block and
        // "spill out" as separate paragraphs.
        this.listenTo(editor.editing.view.document, 'clipboardInput', (evt, data)=>{
            let insertionRange = model.createRange(model.document.selection.anchor);
            // Use target ranges in case this is a drop.
            if (data.targetRanges) {
                insertionRange = editor.editing.mapper.toModelRange(data.targetRanges[0]);
            }
            if (!insertionRange.start.parent.is('element', 'codeBlock')) {
                return;
            }
            const text = data.dataTransfer.getData('text/plain');
            const writer = new ViewUpcastWriter(editor.editing.view.document);
            // Pass the view fragment to the default clipboardInput handler.
            data.content = rawSnippetTextToViewDocumentFragment(writer, text);
        });
        if (editor.plugins.has('ClipboardPipeline')) {
            // Elements may have a plain textual representation (hence be present in the 'text/plain' data transfer),
            // but not be allowed in the code block.
            // Filter them out before inserting the content to the model.
            editor.plugins.get(ClipboardPipeline).on('contentInsertion', (evt, data)=>{
                const model = editor.model;
                const selection = model.document.selection;
                if (!selection.anchor.parent.is('element', 'codeBlock')) {
                    return;
                }
                model.change((writer)=>{
                    const contentRange = writer.createRangeIn(data.content);
                    for (const item of [
                        ...contentRange.getItems()
                    ]){
                        // Remove all nodes disallowed in the code block.
                        if (item.is('node') && !schema.checkChild(selection.anchor, item)) {
                            writer.remove(item);
                        }
                    }
                });
            });
        }
        // Make sure multi–line selection is always wrapped in a code block when `getSelectedContent()`
        // is used (e.g. clipboard copy). Otherwise, only the raw text will be copied to the clipboard and,
        // upon next paste, this bare text will not be inserted as a code block, which is not the best UX.
        // Similarly, when the selection in a single line, the selected content should be an inline code
        // so it can be pasted later on and retain it's preformatted nature.
        this.listenTo(model, 'getSelectedContent', (evt, [selection])=>{
            const anchor = selection.anchor;
            if (selection.isCollapsed || !anchor.parent.is('element', 'codeBlock') || !anchor.hasSameParentAs(selection.focus)) {
                return;
            }
            model.change((writer)=>{
                const docFragment = evt.return;
                // fo[o<softBreak></softBreak>b]ar  ->   <codeBlock language="...">[o<softBreak></softBreak>b]<codeBlock>
                if (anchor.parent.is('element') && (docFragment.childCount > 1 || selection.containsEntireContent(anchor.parent))) {
                    const codeBlock = writer.createElement('codeBlock', anchor.parent.getAttributes());
                    writer.append(docFragment, codeBlock);
                    const newDocumentFragment = writer.createDocumentFragment();
                    writer.append(codeBlock, newDocumentFragment);
                    evt.return = newDocumentFragment;
                    return;
                }
                // "f[oo]"                          ->   <$text code="true">oo</text>
                const textNode = docFragment.getChild(0);
                if (schema.checkAttribute(textNode, 'code')) {
                    writer.setAttribute('code', true, textNode);
                }
            });
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const commands = editor.commands;
        const indent = commands.get('indent');
        const outdent = commands.get('outdent');
        if (indent) {
            // Priority is highest due to integration with `IndentList` command of `List` plugin.
            // If selection is in a code block we give priority to it. This way list item cannot be indented
            // but if we would give priority to indenting list item then user would have to indent list item
            // as much as possible and only then he could indent code block.
            indent.registerChildCommand(commands.get('indentCodeBlock'), {
                priority: 'highest'
            });
        }
        if (outdent) {
            outdent.registerChildCommand(commands.get('outdentCodeBlock'));
        }
        // Customize the response to the <kbd>Enter</kbd> and <kbd>Shift</kbd>+<kbd>Enter</kbd>
        // key press when the selection is in the code block. Upon enter key press we can either
        // leave the block if it's "two or three enters" in a row or create a new code block line, preserving
        // previous line's indentation.
        this.listenTo(editor.editing.view.document, 'enter', (evt, data)=>{
            const positionParent = editor.model.document.selection.getLastPosition().parent;
            if (!positionParent.is('element', 'codeBlock')) {
                return;
            }
            if (!leaveBlockStartOnEnter(editor, data.isSoft) && !leaveBlockEndOnEnter(editor, data.isSoft)) {
                breakLineOnEnter(editor);
            }
            data.preventDefault();
            evt.stop();
        }, {
            context: 'pre'
        });
        this._initAriaAnnouncements();
    }
    /**
	 * Observe when user enters or leaves code block and set proper aria value in global live announcer.
	 * This allows screen readers to indicate when the user has entered and left the specified code block.
	 *
	 * @internal
	 */ _initAriaAnnouncements() {
        const { model, ui, t } = this.editor;
        const languageDefs = getNormalizedAndLocalizedLanguageDefinitions(this.editor);
        let lastFocusedCodeBlock = null;
        model.document.selection.on('change:range', ()=>{
            const focusParent = model.document.selection.focus.parent;
            if (!ui || lastFocusedCodeBlock === focusParent || !focusParent.is('element')) {
                return;
            }
            if (lastFocusedCodeBlock && lastFocusedCodeBlock.is('element', 'codeBlock')) {
                ui.ariaLiveAnnouncer.announce(getCodeBlockAriaAnnouncement(t, languageDefs, lastFocusedCodeBlock, 'leave'));
            }
            if (focusParent.is('element', 'codeBlock')) {
                ui.ariaLiveAnnouncer.announce(getCodeBlockAriaAnnouncement(t, languageDefs, focusParent, 'enter'));
            }
            lastFocusedCodeBlock = focusParent;
        });
    }
}
/**
 * Normally, when the Enter (or Shift+Enter) key is pressed, a soft line break is to be added to the
 * code block. Let's try to follow the indentation of the previous line when possible, for instance:
 *
 * ```html
 * // Before pressing enter (or shift enter)
 * <codeBlock>
 * "    foo()"[]                   // Indent of 4 spaces.
 * </codeBlock>
 *
 * // After pressing:
 * <codeBlock>
 * "    foo()"                 // Indent of 4 spaces.
 * <softBreak></softBreak>     // A new soft break created by pressing enter.
 * "    "[]                    // Retain the indent of 4 spaces.
 * </codeBlock>
 * ```
 */ function breakLineOnEnter(editor) {
    const model = editor.model;
    const modelDoc = model.document;
    // Use last position as other mechanisms (e.g. condition deciding whether this function should be called) also check that.
    const lastSelectionPosition = modelDoc.selection.getLastPosition();
    let leadingWhiteSpaces;
    const node = getTextNodeAtLineStart(lastSelectionPosition, model);
    // Figure out the indentation (white space chars) at the beginning of the line.
    if (node && node.is('$text')) {
        leadingWhiteSpaces = getLeadingWhiteSpaces(node);
    }
    // Keeping everything in a change block for a single undo step.
    editor.model.change((writer)=>{
        editor.execute('shiftEnter');
        // If the line before being broken in two had some indentation, let's retain it
        // in the new line.
        if (leadingWhiteSpaces) {
            writer.insertText(leadingWhiteSpaces, modelDoc.selection.anchor);
        }
    });
}
/**
 * Leave the code block when Enter (but NOT Shift+Enter) has been pressed twice at the beginning
 * of the code block:
 *
 * ```html
 * // Before:
 * <codeBlock>[]<softBreak></softBreak>foo</codeBlock>
 *
 * // After pressing:
 * <paragraph>[]</paragraph><codeBlock>foo</codeBlock>
 * ```
 *
 * @param isSoftEnter When `true`, enter was pressed along with <kbd>Shift</kbd>.
 * @returns `true` when selection left the block. `false` if stayed.
 */ function leaveBlockStartOnEnter(editor, isSoftEnter) {
    const model = editor.model;
    const modelDoc = model.document;
    const view = editor.editing.view;
    const lastSelectionPosition = modelDoc.selection.getLastPosition();
    const nodeAfter = lastSelectionPosition.nodeAfter;
    if (isSoftEnter || !modelDoc.selection.isCollapsed || !lastSelectionPosition.isAtStart) {
        return false;
    }
    if (!isSoftBreakNode(nodeAfter)) {
        return false;
    }
    // We're doing everything in a single change block to have a single undo step.
    editor.model.change((writer)=>{
        // "Clone" the <codeBlock> in the standard way.
        editor.execute('enter');
        // The cloned block exists now before the original code block.
        const newBlock = modelDoc.selection.anchor.parent.previousSibling;
        // Make the cloned <codeBlock> a regular <paragraph> (with clean attributes, so no language).
        writer.rename(newBlock, DEFAULT_ELEMENT);
        writer.setSelection(newBlock, 'in');
        editor.model.schema.removeDisallowedAttributes([
            newBlock
        ], writer);
        // Remove the <softBreak> that originally followed the selection position.
        writer.remove(nodeAfter);
    });
    // Eye candy.
    view.scrollToTheSelection();
    return true;
}
/**
 * Leave the code block when Enter (but NOT Shift+Enter) has been pressed twice at the end
 * of the code block:
 *
 * ```html
 * // Before:
 * <codeBlock>foo[]</codeBlock>
 *
 * // After first press:
 * <codeBlock>foo<softBreak></softBreak>[]</codeBlock>
 *
 * // After second press:
 * <codeBlock>foo</codeBlock><paragraph>[]</paragraph>
 * ```
 *
 * @param isSoftEnter When `true`, enter was pressed along with <kbd>Shift</kbd>.
 * @returns `true` when selection left the block. `false` if stayed.
 */ function leaveBlockEndOnEnter(editor, isSoftEnter) {
    const model = editor.model;
    const modelDoc = model.document;
    const view = editor.editing.view;
    const lastSelectionPosition = modelDoc.selection.getLastPosition();
    const nodeBefore = lastSelectionPosition.nodeBefore;
    let emptyLineRangeToRemoveOnEnter;
    if (isSoftEnter || !modelDoc.selection.isCollapsed || !lastSelectionPosition.isAtEnd || !nodeBefore || !nodeBefore.previousSibling) {
        return false;
    }
    // When the position is directly preceded by two soft breaks
    //
    //		<codeBlock>foo<softBreak></softBreak><softBreak></softBreak>[]</codeBlock>
    //
    // it creates the following range that will be cleaned up before leaving:
    //
    //		<codeBlock>foo[<softBreak></softBreak><softBreak></softBreak>]</codeBlock>
    //
    if (isSoftBreakNode(nodeBefore) && isSoftBreakNode(nodeBefore.previousSibling)) {
        emptyLineRangeToRemoveOnEnter = model.createRange(model.createPositionBefore(nodeBefore.previousSibling), model.createPositionAfter(nodeBefore));
    } else if (isEmptyishTextNode(nodeBefore) && isSoftBreakNode(nodeBefore.previousSibling) && isSoftBreakNode(nodeBefore.previousSibling.previousSibling)) {
        emptyLineRangeToRemoveOnEnter = model.createRange(model.createPositionBefore(nodeBefore.previousSibling.previousSibling), model.createPositionAfter(nodeBefore));
    } else if (isEmptyishTextNode(nodeBefore) && isSoftBreakNode(nodeBefore.previousSibling) && isEmptyishTextNode(nodeBefore.previousSibling.previousSibling) && nodeBefore.previousSibling.previousSibling && isSoftBreakNode(nodeBefore.previousSibling.previousSibling.previousSibling)) {
        emptyLineRangeToRemoveOnEnter = model.createRange(model.createPositionBefore(nodeBefore.previousSibling.previousSibling.previousSibling), model.createPositionAfter(nodeBefore));
    } else {
        return false;
    }
    // We're doing everything in a single change block to have a single undo step.
    editor.model.change((writer)=>{
        // Remove the last <softBreak>s and all white space characters that followed them.
        writer.remove(emptyLineRangeToRemoveOnEnter);
        // "Clone" the <codeBlock> in the standard way.
        editor.execute('enter');
        const newBlock = modelDoc.selection.anchor.parent;
        // Make the cloned <codeBlock> a regular <paragraph> (with clean attributes, so no language).
        writer.rename(newBlock, DEFAULT_ELEMENT);
        editor.model.schema.removeDisallowedAttributes([
            newBlock
        ], writer);
    });
    // Eye candy.
    view.scrollToTheSelection();
    return true;
}
function isEmptyishTextNode(node) {
    return node && node.is('$text') && !node.data.match(/\S/);
}
function isSoftBreakNode(node) {
    return node && node.is('element', 'softBreak');
}

/**
 * The code block UI plugin.
 *
 * Introduces the `'codeBlock'` dropdown.
 */ class CodeBlockUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CodeBlockUI';
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
        const componentFactory = editor.ui.componentFactory;
        const normalizedLanguageDefs = getNormalizedAndLocalizedLanguageDefinitions(editor);
        const itemDefinitions = this._getLanguageListItemDefinitions(normalizedLanguageDefs);
        const command = editor.commands.get('codeBlock');
        componentFactory.add('codeBlock', (locale)=>{
            const dropdownView = createDropdown(locale, SplitButtonView);
            const splitButtonView = dropdownView.buttonView;
            const accessibleLabel = t('Insert code block');
            splitButtonView.set({
                label: accessibleLabel,
                tooltip: true,
                icon: IconCodeBlock,
                isToggleable: true
            });
            splitButtonView.bind('isOn').to(command, 'value', (value)=>!!value);
            splitButtonView.on('execute', ()=>{
                editor.execute('codeBlock', {
                    usePreviousLanguageChoice: true
                });
                editor.editing.view.focus();
            });
            dropdownView.on('execute', (evt)=>{
                editor.execute('codeBlock', {
                    language: evt.source._codeBlockLanguage,
                    forceValue: true
                });
                editor.editing.view.focus();
            });
            dropdownView.class = 'ck-code-block-dropdown';
            dropdownView.bind('isEnabled').to(command);
            addListToDropdown(dropdownView, itemDefinitions, {
                role: 'menu',
                ariaLabel: accessibleLabel
            });
            return dropdownView;
        });
        componentFactory.add('menuBar:codeBlock', (locale)=>{
            const menuView = new MenuBarMenuView(locale);
            menuView.buttonView.set({
                role: 'menuitem',
                label: t('Code block'),
                icon: IconCodeBlock
            });
            menuView.bind('isEnabled').to(command);
            const listView = new MenuBarMenuListView(locale);
            listView.set({
                ariaLabel: t('Insert code block')
            });
            for (const definition of itemDefinitions){
                const listItemView = new MenuBarMenuListItemView(locale, menuView);
                const buttonView = new MenuBarMenuListItemButtonView(locale);
                buttonView.bind(...Object.keys(definition.model)).to(definition.model);
                buttonView.set({
                    isToggleable: true,
                    role: 'menuitemcheckbox'
                });
                buttonView.delegate('execute').to(menuView);
                buttonView.on('execute', ()=>{
                    editor.execute('codeBlock', {
                        language: definition.model._codeBlockLanguage,
                        forceValue: command.value == definition.model._codeBlockLanguage ? false : true
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
	 * A helper returning a collection of the `codeBlock` dropdown items representing languages
	 * available for the user to choose from.
	 */ _getLanguageListItemDefinitions(normalizedLanguageDefs) {
        const editor = this.editor;
        const command = editor.commands.get('codeBlock');
        const itemDefinitions = new Collection();
        for (const languageDef of normalizedLanguageDefs){
            const definition = {
                type: 'button',
                model: new UIModel({
                    _codeBlockLanguage: languageDef.language,
                    label: languageDef.label,
                    role: 'menuitemradio',
                    withText: true
                })
            };
            definition.model.bind('isOn').to(command, 'value', (value)=>{
                return value === definition.model._codeBlockLanguage;
            });
            itemDefinitions.add(definition);
        }
        return itemDefinitions;
    }
}

/**
 * The code block plugin.
 *
 * For more information about this feature check the {@glink api/code-block package page} and the
 * {@glink features/code-blocks code block} feature guide.
 *
 * This is a "glue" plugin that loads the {@link module:code-block/codeblockediting~CodeBlockEditing code block editing feature}
 * and the {@link module:code-block/codeblockui~CodeBlockUI code block UI feature}.
 */ class CodeBlock extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            CodeBlockEditing,
            CodeBlockUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CodeBlock';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

export { CodeBlock, CodeBlockCommand, CodeBlockEditing, CodeBlockUI, IndentCodeBlockCommand, OutdentCodeBlockCommand, canBeCodeBlock as _canBeCodeBlock, dataViewToModelCodeBlockInsertion as _dataViewToModelCodeBlockInsertion, dataViewToModelOrphanNodeConsumer as _dataViewToModelCodeBlockOrphanNodeConsumer, dataViewToModelTextNewlinesInsertion as _dataViewToModelCodeBlockTextNewlinesInsertion, getCodeBlockAriaAnnouncement as _getCodeBlockAriaAnnouncement, getIndentOutdentPositions as _getCodeBlockIndentOutdentPositions, getLeadingWhiteSpaces as _getCodeBlockLeadingWhiteSpaces, getPropertyAssociation as _getCodeBlockPropertyAssociation, getTextNodeAtLineStart as _getCodeBlockTextNodeAtLineStart, getNormalizedAndLocalizedLanguageDefinitions as _getNormalizedAndLocalizedCodeBlockLanguageDefinitions, isModelSelectionInCodeBlock as _isModelSelectionInCodeBlock, modelToDataViewSoftBreakInsertion as _modelToDataViewCodeBlockSoftBreakInsertion, modelToViewCodeBlockInsertion as _modelToViewCodeBlockInsertion, rawSnippetTextToViewDocumentFragment as _rawCodeBlockSnippetTextToViewDocumentFragment };
//# sourceMappingURL=index.js.map

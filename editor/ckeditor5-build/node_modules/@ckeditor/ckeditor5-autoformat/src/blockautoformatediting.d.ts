/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import type { Editor } from 'ckeditor5/src/core.js';
import { type Autoformat } from './autoformat.js';
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
 */
/**
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
 */
export declare function blockAutoformatEditing(editor: Editor, plugin: Autoformat, pattern: RegExp, callbackOrCommand: string | ((context: {
    match: RegExpExecArray;
}) => unknown)): void;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
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
 */
import type { Editor } from 'ckeditor5/src/core.js';
import type { ModelRange, ModelWriter } from 'ckeditor5/src/engine.js';
import { type Autoformat } from './autoformat.js';
export type AutoformatTestCallback = (text: string) => {
    remove: Array<Array<number>>;
    format: Array<Array<number>>;
};
/**
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
 */
export declare function inlineAutoformatEditing(editor: Editor, plugin: Autoformat, testRegexpOrCallback: RegExp | AutoformatTestCallback, formatCallback: (writer: ModelWriter, rangesToFormat: Array<ModelRange>) => boolean | undefined): void;

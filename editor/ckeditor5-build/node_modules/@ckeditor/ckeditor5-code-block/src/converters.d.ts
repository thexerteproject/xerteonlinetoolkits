/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module code-block/converters
 */
import type { GetCallback } from 'ckeditor5/src/utils.js';
import type { DowncastInsertEvent, Model, UpcastElementEvent, UpcastTextEvent, EditingView } from 'ckeditor5/src/engine.js';
import type { CodeBlockLanguageDefinition } from './codeblockconfig.js';
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
 */
export declare function modelToViewCodeBlockInsertion(model: Model, languageDefs: Array<CodeBlockLanguageDefinition>, useLabels?: boolean): GetCallback<DowncastInsertEvent>;
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
 */
export declare function modelToDataViewSoftBreakInsertion(model: Model): GetCallback<DowncastInsertEvent>;
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
 */
export declare function dataViewToModelCodeBlockInsertion(editingView: EditingView, languageDefs: Array<CodeBlockLanguageDefinition>): GetCallback<UpcastElementEvent>;
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
 */
export declare function dataViewToModelTextNewlinesInsertion(): GetCallback<UpcastTextEvent>;
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
 */
export declare function dataViewToModelOrphanNodeConsumer(): GetCallback<UpcastElementEvent>;

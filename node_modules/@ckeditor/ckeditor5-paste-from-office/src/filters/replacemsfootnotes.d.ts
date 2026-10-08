/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module paste-from-office/filters/replacemsfootnotes
 */
import type { ViewDocumentFragment, ViewUpcastWriter } from 'ckeditor5/src/engine.js';
/**
 * Replaces MS Word specific footnotes references and definitions with proper elements.
 *
 * Things to know about MS Word footnotes:
 *
 * * Footnote references in Word are marked with `mso-footnote-id` style.
 * * Word does not support nested footnotes, so references within definitions are ignored.
 * * Word appends extra spaces after footnote references within definitions, which are trimmed.
 * * Footnote definitions list is marked with `mso-element: footnote-list` style it contain `mso-element: footnote` elements.
 * * Footnote definition might contain tables, lists and other elements, not only text. They are placed directly within `li` element,
 * without any wrapper (in opposition to text content of the definition, which is placed within `MsoFootnoteText` element).
 *
 * Example pseudo document showing MS Word footnote structure:
 *
 * ```html
 * <p>Text with footnote<a style='mso-footnote-id:ftn1'>[1]</a> reference.</p>
 *
 * <div style='mso-element:footnote-list'>
 * 	<div style='mso-element:footnote' id=ftn1>
 * 		<p class=MsoFootnoteText><a style='mso-footnote-id:ftn1'>[1]</a> Footnote content</p>
 * 		<table class="MsoTableGrid">...</table>
 * 	</div>
 * </div>
 * ```
 *
 * Will be transformed into:
 *
 * ```html
 * <p>Text with footnote<sup class="footnote"><a id="ref-footnote-ftn1" href="#footnote-ftn1">1</a></sup> reference.</p>
 *
 * <ol class="footnotes">
 * 	<li class="footnote-definition" id="footnote-ftn1">
 * 		<a href="#ref-footnote-ftn1" class="footnote-backlink">^</a>
 * 		<div class="footnote-content">
 * 			<p>Footnote content</p>
 * 			<table>...</table>
 * 		</div>
 * 	</li>
 * </ol>
 * ```
 *
 * @param documentFragment `data.content` obtained from clipboard.
 * @param writer The view writer instance.
 * @internal
 */
export declare function replaceMSFootnotes(documentFragment: ViewDocumentFragment, writer: ViewUpcastWriter): void;

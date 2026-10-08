/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module markdown-gfm/gfmdataprocessor
 */
import { type DataProcessor, type ViewDocument, type ViewDocumentFragment, type MatcherPattern } from 'ckeditor5/src/engine.js';
/**
 * This data processor implementation uses GitHub Flavored Markdown as input/output data.
 *
 * See the {@glink features/markdown Markdown output} guide to learn more on how to enable it.
 */
export declare class MarkdownGfmDataProcessor implements DataProcessor {
    /**
     * HTML data processor used to process HTML produced by the Markdown-to-HTML converter and the other way.
     */
    private _htmlDP;
    /**
     * Helper for converting Markdown to HTML.
     */
    private _markdown2html;
    /**
     * Helper for converting HTML to Markdown.
     */
    private _html2markdown;
    /**
     * Creates a new instance of the Markdown data processor class.
     */
    constructor(document: ViewDocument);
    /**
     * Keeps the specified element in the output as HTML. This is useful if the editor contains
     * features producing HTML that is not a part of the Markdown standard.
     *
     * By default, all HTML tags are removed.
     *
     * @param element The element name to be kept.
     */
    keepHtml(element: keyof HTMLElementTagNameMap): void;
    /**
     * Converts the provided Markdown string to a view tree.
     *
     * @param data A Markdown string.
     * @returns The converted view element.
     */
    toView(data: string): ViewDocumentFragment;
    /**
     * Converts the provided {@link module:engine/view/documentfragment~ViewDocumentFragment} to data format &ndash; in this
     * case to a Markdown string.
     *
     * @returns Markdown string.
     */
    toData(viewFragment: ViewDocumentFragment): string;
    /**
     * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
     * and not processed during the conversion from Markdown to view elements.
     *
     * The raw data can be later accessed by a
     * {@link module:engine/view/element~ViewElement#getCustomProperty custom property of a view element} called `"$rawContent"`.
     *
     * @param pattern The pattern matching all view elements whose content should
     * be treated as raw data.
     */
    registerRawContentMatcher(pattern: MatcherPattern): void;
    /**
     * This method does not have any effect on the data processor result. It exists for compatibility with the
     * {@link module:engine/dataprocessor/dataprocessor~DataProcessor `DataProcessor` interface}.
     */
    useFillerType(): void;
}

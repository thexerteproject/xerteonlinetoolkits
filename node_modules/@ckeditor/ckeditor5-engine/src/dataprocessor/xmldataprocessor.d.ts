/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ViewDomConverter } from '../view/domconverter.js';
import { type DataProcessor } from './dataprocessor.js';
import { type DataProcessorHtmlWriter } from './htmlwriter.js';
import { type ViewDocument } from '../view/document.js';
import { type ViewDocumentFragment } from '../view/documentfragment.js';
import type { MatcherPattern } from '../view/matcher.js';
/**
 * The XML data processor class.
 * This data processor implementation uses XML as input and output data.
 * This class is needed because unlike HTML, XML allows to use any tag with any value.
 * For example, `<link>Text</link>` is a valid XML but invalid HTML.
 */
export declare class XmlDataProcessor implements DataProcessor {
    /**
     * A list of namespaces allowed to use in the XML input.
     *
     * For example, registering namespaces [ 'attribute', 'container' ] allows to use `<attirbute:tagName></attribute:tagName>`
     * and `<container:tagName></container:tagName>` input. It is mainly for debugging.
     */
    namespaces: Array<string>;
    /**
     * DOM parser instance used to parse an XML string to an XML document.
     */
    domParser: DOMParser;
    /**
     * DOM converter used to convert DOM elements to view elements.
     */
    domConverter: ViewDomConverter;
    /**
     * A basic HTML writer instance used to convert DOM elements to an XML string.
     * There is no need to use a dedicated XML writer because the basic HTML writer works well in this case.
     */
    htmlWriter: DataProcessorHtmlWriter;
    skipComments: boolean;
    /**
     * Creates a new instance of the XML data processor class.
     *
     * @param document The view document instance.
     * @param options Configuration options.
     * @param options.namespaces A list of namespaces allowed to use in the XML input.
     */
    constructor(document: ViewDocument, options?: {
        namespaces?: Array<string>;
    });
    /**
     * Converts the provided {@link module:engine/view/documentfragment~ViewDocumentFragment document fragment}
     * to data format &ndash; in this case an XML string.
     *
     * @returns An XML string.
     */
    toData(viewFragment: ViewDocumentFragment): string;
    /**
     * Converts the provided XML string to a view tree.
     *
     * @param data An XML string.
     * @returns A converted view element.
     */
    toView(data: string): ViewDocumentFragment;
    /**
     * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
     * and not processed during the conversion from XML to view elements.
     *
     * The raw data can be later accessed by a
     * {@link module:engine/view/element~ViewElement#getCustomProperty custom property of a view element} called `"$rawContent"`.
     *
     * @param pattern Pattern matching all view elements whose content should be treated as raw data.
     */
    registerRawContentMatcher(pattern: MatcherPattern): void;
    /**
     * If the processor is set to use marked fillers, it will insert `&nbsp;` fillers wrapped in `<span>` elements
     * (`<span data-cke-filler="true">&nbsp;</span>`) instead of regular `&nbsp;` characters.
     *
     * This mode allows for a more precise handling of block fillers (so they do not leak into editor content) but
     * bloats the editor data with additional markup.
     *
     * This mode may be required by some features and will be turned on by them automatically.
     *
     * @param type Whether to use the default or the marked `&nbsp;` block fillers.
     */
    useFillerType(type: 'default' | 'marked'): void;
    /**
     * Converts an XML string to its DOM representation. Returns a document fragment containing nodes parsed from
     * the provided data.
     */
    private _toDom;
}

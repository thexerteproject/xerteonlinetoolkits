/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { HtmlDataProcessor } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { unified } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkBreaks from 'remark-breaks';
import rehypeStringify from 'rehype-dom-stringify';
import { visit } from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';
import { fromDom } from 'hast-util-from-dom';
import rehypeParse from 'rehype-dom-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { h } from 'hastscript';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard/dist/index.js';

/**
 * This is a helper class used by the {@link module:markdown-gfm/markdown Markdown feature} to convert Markdown to HTML.
 */ class MarkdownGfmMdToHtml {
    _processor;
    constructor(){
        this._processor = unified()// Parses Markdown to an abstract syntax tree (AST).
        .use(remarkParse)// Adds support for GitHub Flavored Markdown (GFM).
        .use(remarkGfm, {
            singleTilde: true
        })// Replaces line breaks with `<br>` tags.
        .use(remarkBreaks)// Turns markdown syntax tree to HTML syntax tree, ignoring embedded HTML.
        .use(remarkRehype, {
            allowDangerousHtml: true
        })// Handles HTML embedded in Markdown.
        .use(rehypeDomRaw)// Removes classes from list elements.
        .use(deleteClassesFromToDoLists)// Serializes HTML syntax tree to HTML string.
        .use(rehypeStringify);
    }
    parse(markdown) {
        return this._processor.processSync(markdown).toString().replaceAll('\n</code>', '</code>');
    }
}
/**
 * Rehype plugin that improves handling of the To-do lists by removing:
 *  * default classes added to `<ul>`, `<ol>`, and `<li>` elements.
 *  * bogus space after <input type="checkbox"> because it would be preserved by ViewDomConverter as it's next to an inline object.
 */ function deleteClassesFromToDoLists() {
    return (tree)=>{
        visit(tree, 'element', (node)=>{
            if (node.tagName === 'ul' || node.tagName === 'ol' || node.tagName === 'li') {
                node.children = node.children.filter((child)=>child.type !== 'text' || !!child.value.trim());
                delete node.properties.className;
            }
        });
    };
}
/**
 * Rehype plugin to parse raw HTML nodes inside Markdown. This plugin is used instead of `rehype-raw` or `rehype-stringify`,
 * because those plugins rely on `parse5` DOM parser which is heavy and redundant in the browser environment where we can
 * use the native DOM APIs.
 *
 * This plugins finds any node (root or element) whose children include `raw` nodes and reparses them like so:
 * 1. Serializes its children to an HTML string.
 * 2. Reparses the HTML string using a `<template>` element.
 * 3. Converts each parsed DOM node back into HAST nodes.
 * 4. Replaces the original children with the newly created HAST nodes.
 */ function rehypeDomRaw() {
    return (tree)=>{
        visit(tree, [
            'root',
            'element'
        ], (node)=>{
            /* istanbul ignore next -- @preserve */ if (!isNodeRootOrElement(node)) {
                return;
            }
            // Only act on nodes with at least one raw child.
            if (!node.children.some((child)=>child.type === 'raw')) {
                return;
            }
            const template = document.createElement('template');
            // Serialize all children to an HTML fragment.
            template.innerHTML = toHtml({
                type: 'root',
                children: node.children
            }, {
                allowDangerousHtml: true
            });
            // Convert each parsed DOM node back into HAST and replace the original children.
            node.children = Array.from(template.content.childNodes).map((domNode)=>fromDom(domNode));
        });
    };
}
/**
 * Only needed for the type guard.
 */ function isNodeRootOrElement(node) {
    return (node.type === 'root' || node.type === 'element') && node.children;
}

class MarkdownGfmHtmlToMd {
    _processor;
    _keepRawTags = [];
    constructor(){
        this._buildProcessor();
    }
    keep(tagName) {
        this._keepRawTags.push(tagName.toLowerCase());
        this._buildProcessor();
    }
    parse(html) {
        return this._processor.processSync(html).toString().trim();
    }
    /**
	 * Returns handlers for raw HTML tags that should be kept in the Markdown output.
	 */ _getRawTagsHandlers() {
        return this._keepRawTags.reduce((handlers, tagName)=>{
            handlers[tagName] = (state, node)=>{
                const tag = toHtml(h(node.tagName, node.properties), {
                    allowDangerousHtml: true,
                    closeSelfClosing: true
                });
                const endOfOpeningTagIndex = tag.indexOf('>');
                const openingTag = tag.slice(0, endOfOpeningTagIndex + 1);
                const closingTag = tag.slice(endOfOpeningTagIndex + 1);
                return [
                    {
                        type: 'html',
                        value: openingTag
                    },
                    ...state.all(node),
                    {
                        type: 'html',
                        value: closingTag
                    }
                ];
            };
            return handlers;
        }, {});
    }
    _buildProcessor() {
        this._processor = unified()// Parse HTML to an abstract syntax tree (AST).
        .use(rehypeParse)// Removes `<label>` element from TODO lists.
        .use(removeLabelFromCheckboxes)// Turns HTML syntax tree into Markdown syntax tree.
        .use(rehypeRemark, {
            // Keeps allowed HTML tags.
            handlers: this._getRawTagsHandlers()
        })// Adds support for GitHub Flavored Markdown (GFM).
        .use(remarkGfm, {
            singleTilde: true
        })// Replaces line breaks with `<br>` tags.
        .use(remarkBreaks)// Serializes Markdown syntax tree to Markdown string.
        .use(remarkStringify, {
            resourceLink: true,
            emphasis: '_',
            rule: '-',
            handlers: {
                break: ()=>'\n'
            },
            unsafe: [
                {
                    character: '<'
                }
            ]
        });
    }
}
/**
 * Removes `<label>` element from TODO lists, so that `<input>` and `text` are direct children of `<li>`.
 */ function removeLabelFromCheckboxes() {
    return function(tree) {
        visit(tree, 'element', (node, index, parent)=>{
            if (index !== null && node.tagName === 'label' && parent.type === 'element' && parent.tagName === 'li') {
                parent.children.splice(index, 1, ...node.children);
            }
        });
    };
}

/**
 * This data processor implementation uses GitHub Flavored Markdown as input/output data.
 *
 * See the {@glink features/markdown Markdown output} guide to learn more on how to enable it.
 */ class MarkdownGfmDataProcessor {
    /**
	 * HTML data processor used to process HTML produced by the Markdown-to-HTML converter and the other way.
	 */ _htmlDP;
    /**
	 * Helper for converting Markdown to HTML.
	 */ _markdown2html;
    /**
	 * Helper for converting HTML to Markdown.
	 */ _html2markdown;
    /**
	 * Creates a new instance of the Markdown data processor class.
	 */ constructor(document){
        this._htmlDP = new HtmlDataProcessor(document);
        this._markdown2html = new MarkdownGfmMdToHtml();
        this._html2markdown = new MarkdownGfmHtmlToMd();
    }
    /**
	 * Keeps the specified element in the output as HTML. This is useful if the editor contains
	 * features producing HTML that is not a part of the Markdown standard.
	 *
	 * By default, all HTML tags are removed.
	 *
	 * @param element The element name to be kept.
	 */ keepHtml(element) {
        this._html2markdown.keep(element);
    }
    /**
	 * Converts the provided Markdown string to a view tree.
	 *
	 * @param data A Markdown string.
	 * @returns The converted view element.
	 */ toView(data) {
        const html = this._markdown2html.parse(data);
        return this._htmlDP.toView(html);
    }
    /**
	 * Converts the provided {@link module:engine/view/documentfragment~ViewDocumentFragment} to data format &ndash; in this
	 * case to a Markdown string.
	 *
	 * @returns Markdown string.
	 */ toData(viewFragment) {
        const html = this._htmlDP.toData(viewFragment);
        return this._html2markdown.parse(html);
    }
    /**
	 * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
	 * and not processed during the conversion from Markdown to view elements.
	 *
	 * The raw data can be later accessed by a
	 * {@link module:engine/view/element~ViewElement#getCustomProperty custom property of a view element} called `"$rawContent"`.
	 *
	 * @param pattern The pattern matching all view elements whose content should
	 * be treated as raw data.
	 */ registerRawContentMatcher(pattern) {
        this._htmlDP.registerRawContentMatcher(pattern);
    }
    /**
	 * This method does not have any effect on the data processor result. It exists for compatibility with the
	 * {@link module:engine/dataprocessor/dataprocessor~DataProcessor `DataProcessor` interface}.
	 */ useFillerType() {}
}

/**
 * The GitHub Flavored Markdown (GFM) plugin.
 *
 * For a detailed overview, check the {@glink features/markdown Markdown feature} guide.
 */ class Markdown extends Plugin {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.data.processor = new MarkdownGfmDataProcessor(editor.data.viewDocument);
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Markdown';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

const ALLOWED_MARKDOWN_FIRST_LEVEL_TAGS = [
    'SPAN',
    'BR',
    'PRE',
    'CODE'
];
/**
 * The GitHub Flavored Markdown (GFM) paste plugin.
 *
 * For a detailed overview, check the {@glink features/pasting/paste-markdown Paste Markdown feature} guide.
 */ class PasteFromMarkdownExperimental extends Plugin {
    /**
	 * @internal
	 */ _gfmDataProcessor;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._gfmDataProcessor = new MarkdownGfmDataProcessor(editor.data.viewDocument);
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'PasteFromMarkdownExperimental';
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
            ClipboardPipeline
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const view = editor.editing.view;
        const viewDocument = view.document;
        const clipboardPipeline = editor.plugins.get('ClipboardPipeline');
        let shiftPressed = false;
        this.listenTo(viewDocument, 'keydown', (evt, data)=>{
            shiftPressed = data.shiftKey;
        });
        this.listenTo(clipboardPipeline, 'inputTransformation', (evt, data)=>{
            if (shiftPressed) {
                return;
            }
            const dataAsTextHtml = data.dataTransfer.getData('text/html');
            if (!dataAsTextHtml) {
                const dataAsTextPlain = data.dataTransfer.getData('text/plain');
                data.content = this._gfmDataProcessor.toView(dataAsTextPlain);
                return;
            }
            const markdownFromHtml = this._parseMarkdownFromHtml(dataAsTextHtml);
            if (markdownFromHtml) {
                data.content = this._gfmDataProcessor.toView(markdownFromHtml);
            }
        });
    }
    /**
	 * Determines if the code copied from a website in the `text/html` type can be parsed as Markdown.
	 * It removes any OS-specific HTML tags, for example, <meta> on macOS and <!--StartFragment--> on Windows.
	 * Then removes a single wrapper HTML tag or wrappers for sibling tags, and if there are no more tags left,
	 * returns the remaining text. Returns null if there are any remaining HTML tags detected.
	 *
	 * @param htmlString Clipboard content in the `text/html` type format.
	 */ _parseMarkdownFromHtml(htmlString) {
        const withoutOsSpecificTags = this._removeOsSpecificTags(htmlString);
        if (!this._containsOnlyAllowedFirstLevelTags(withoutOsSpecificTags)) {
            return null;
        }
        const withoutWrapperTag = this._removeFirstLevelWrapperTagsAndBrs(withoutOsSpecificTags);
        if (this._containsAnyRemainingHtmlTags(withoutWrapperTag)) {
            return null;
        }
        return this._replaceHtmlReservedEntitiesWithCharacters(withoutWrapperTag);
    }
    /**
	 * Removes OS-specific tags.
	 *
	 * @param htmlString Clipboard content in the `text/html` type format.
	 */ _removeOsSpecificTags(htmlString) {
        // Removing the <meta> tag present on Mac.
        const withoutMetaTag = htmlString.replace(/^<meta\b[^>]*>/, '').trim();
        // Removing the <html> tag present on Windows.
        const withoutHtmlTag = withoutMetaTag.replace(/^<html>/, '').replace(/<\/html>$/, '').trim();
        // Removing the <body> tag present on Windows.
        const withoutBodyTag = withoutHtmlTag.replace(/^<body>/, '').replace(/<\/body>$/, '').trim();
        // Removing the <!--StartFragment--> tag present on Windows.
        return withoutBodyTag.replace(/^<!--StartFragment-->/, '').replace(/<!--EndFragment-->$/, '').trim();
    }
    /**
	 * If the input HTML string contains any first-level formatting tags
	 * like <b>, <strong>, or <i>, we should not treat it as Markdown.
	 *
	 * @param htmlString Clipboard content.
	 */ _containsOnlyAllowedFirstLevelTags(htmlString) {
        const parser = new DOMParser();
        const { body: tempElement } = parser.parseFromString(htmlString, 'text/html');
        const tagNames = Array.from(tempElement.children).map((el)=>el.tagName);
        return tagNames.every((el)=>ALLOWED_MARKDOWN_FIRST_LEVEL_TAGS.includes(el));
    }
    /**
	 * Removes multiple HTML wrapper tags from a list of sibling HTML tags.
	 *
	 * @param htmlString Clipboard content without any OS-specific tags.
	 */ _removeFirstLevelWrapperTagsAndBrs(htmlString) {
        const parser = new DOMParser();
        const { body: tempElement } = parser.parseFromString(htmlString, 'text/html');
        const brElements = tempElement.querySelectorAll('br');
        for (const br of brElements){
            br.replaceWith('\n');
        }
        const outerElements = tempElement.querySelectorAll(':scope > *');
        for (const element of outerElements){
            const elementClone = element.cloneNode(true);
            element.replaceWith(...elementClone.childNodes);
        }
        return tempElement.innerHTML;
    }
    /**
	 * Determines if a string contains any HTML tags.
	 */ _containsAnyRemainingHtmlTags(str) {
        return str.includes('<');
    }
    /**
	 * Replaces the reserved HTML entities with the actual characters.
	 *
	 * @param htmlString Clipboard content without any tags.
	 */ _replaceHtmlReservedEntitiesWithCharacters(htmlString) {
        return htmlString.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&nbsp;/g, ' ');
    }
}

export { Markdown, MarkdownGfmDataProcessor, MarkdownGfmHtmlToMd, MarkdownGfmMdToHtml, PasteFromMarkdownExperimental };
//# sourceMappingURL=index.js.map

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module markdown-gfm/html2markdown/html2markdown
 */
import { unified } from 'unified';
import rehypeParse from 'rehype-dom-parse';
import rehypeRemark from 'rehype-remark';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import { toHtml } from 'hast-util-to-html';
export class MarkdownGfmHtmlToMd {
    _processor;
    _keepRawTags = [];
    constructor() {
        this._buildProcessor();
    }
    keep(tagName) {
        this._keepRawTags.push(tagName.toLowerCase());
        this._buildProcessor();
    }
    parse(html) {
        return this._processor
            .processSync(html)
            .toString()
            .trim();
    }
    /**
     * Returns handlers for raw HTML tags that should be kept in the Markdown output.
     */
    _getRawTagsHandlers() {
        return this._keepRawTags.reduce((handlers, tagName) => {
            handlers[tagName] = (state, node) => {
                const tag = toHtml(h(node.tagName, node.properties), {
                    allowDangerousHtml: true,
                    closeSelfClosing: true
                });
                const endOfOpeningTagIndex = tag.indexOf('>');
                const openingTag = tag.slice(0, endOfOpeningTagIndex + 1);
                const closingTag = tag.slice(endOfOpeningTagIndex + 1);
                return [
                    { type: 'html', value: openingTag },
                    ...state.all(node),
                    { type: 'html', value: closingTag }
                ];
            };
            return handlers;
        }, {});
    }
    _buildProcessor() {
        this._processor = unified()
            // Parse HTML to an abstract syntax tree (AST).
            .use(rehypeParse)
            // Removes `<label>` element from TODO lists.
            .use(removeLabelFromCheckboxes)
            // Turns HTML syntax tree into Markdown syntax tree.
            .use(rehypeRemark, {
            // Keeps allowed HTML tags.
            handlers: this._getRawTagsHandlers()
        })
            // Adds support for GitHub Flavored Markdown (GFM).
            .use(remarkGfm, {
            singleTilde: true
        })
            // Replaces line breaks with `<br>` tags.
            .use(remarkBreaks)
            // Serializes Markdown syntax tree to Markdown string.
            .use(remarkStringify, {
            resourceLink: true,
            emphasis: '_',
            rule: '-',
            handlers: {
                break: () => '\n'
            },
            unsafe: [
                { character: '<' }
            ]
        });
    }
}
/**
 * Removes `<label>` element from TODO lists, so that `<input>` and `text` are direct children of `<li>`.
 */
function removeLabelFromCheckboxes() {
    return function (tree) {
        visit(tree, 'element', (node, index, parent) => {
            if (index !== null && node.tagName === 'label' && parent.type === 'element' && parent.tagName === 'li') {
                parent.children.splice(index, 1, ...node.children);
            }
        });
    };
}

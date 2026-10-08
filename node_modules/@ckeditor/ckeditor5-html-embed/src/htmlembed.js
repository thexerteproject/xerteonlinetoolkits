/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-embed/htmlembed
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Widget } from 'ckeditor5/src/widget.js';
import { HtmlEmbedEditing } from './htmlembedediting.js';
import { HtmlEmbedUI } from './htmlembedui.js';
/**
 * The HTML embed feature.
 *
 * It allows inserting HTML snippets directly into the editor.
 *
 * For a detailed overview, check the {@glink features/html/html-embed HTML embed feature} documentation.
 */
export class HtmlEmbed extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [HtmlEmbedEditing, HtmlEmbedUI, Widget];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'HtmlEmbed';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
}

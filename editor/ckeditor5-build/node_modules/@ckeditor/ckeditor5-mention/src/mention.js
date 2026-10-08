/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module mention/mention
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { MentionEditing, _toMentionAttribute } from './mentionediting.js';
import { MentionUI } from './mentionui.js';
import '../theme/mention.css';
/**
 * The mention plugin.
 *
 * For a detailed overview, check the {@glink features/mentions Mention feature} guide.
 */
export class Mention extends Plugin {
    toMentionAttribute(viewElement, data) {
        return _toMentionAttribute(viewElement, data);
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Mention';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get requires() {
        return [MentionEditing, MentionUI];
    }
}

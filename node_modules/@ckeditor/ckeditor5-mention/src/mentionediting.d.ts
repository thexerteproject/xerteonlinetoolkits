/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module mention/mentionediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import type { ModelElement } from 'ckeditor5/src/engine.js';
import type { MentionAttribute } from './mention.js';
/**
 * The mention editing feature.
 *
 * It introduces the {@link module:mention/mentioncommand~MentionCommand command} and the `mention`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span class="mention" data-mention="@mention">`.
 */
export declare class MentionEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "MentionEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}
/**
 * @internal
 */
export declare function _addMentionAttributes(baseMentionData: {
    id: string;
    _text: string;
}, data?: Record<string, unknown>): MentionAttribute;
/**
 * Creates a mention attribute value from the provided view element and optional data.
 *
 * This function is exposed as
 * {@link module:mention/mention~Mention#toMentionAttribute `editor.plugins.get( 'Mention' ).toMentionAttribute()`}.
 *
 * @internal
 */
export declare function _toMentionAttribute(viewElementOrMention: ModelElement, data?: Record<string, unknown>): MentionAttribute | undefined;

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/styleediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { StyleUtils } from './styleutils.js';
import { ListStyleSupport } from './integrations/list.js';
import { TableStyleSupport } from './integrations/table.js';
import { LinkStyleSupport } from './integrations/link.js';
/**
 * The style engine feature.
 *
 * It configures the {@glink features/html/general-html-support General HTML Support feature} based on
 * {@link module:style/styleconfig~StyleConfig#definitions configured style definitions} and introduces the
 * {@link module:style/stylecommand~StyleCommand style command} that applies styles to the content of the document.
 */
export declare class StyleEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "StyleEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly ["GeneralHtmlSupport", typeof StyleUtils, typeof ListStyleSupport, typeof TableStyleSupport, typeof LinkStyleSupport];
    /**
     * @inheritDoc
     */
    init(): void;
}

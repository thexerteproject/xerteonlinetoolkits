/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/integrations/link
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { StyleUtils } from '../styleutils.js';
export declare class LinkStyleSupport extends Plugin {
    private _styleUtils;
    private _htmlSupport;
    /**
     * @inheritDoc
     */
    static get pluginName(): "LinkStyleSupport";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof StyleUtils, "GeneralHtmlSupport"];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Verifies if the given style is applicable to the provided document selection.
     */
    private _isStyleEnabled;
    /**
     * Returns true if the given style is applied to the specified document selection.
     */
    private _isStyleActive;
    /**
     * Returns a selectable that given style should be applied to.
     */
    private _getAffectedSelectable;
}

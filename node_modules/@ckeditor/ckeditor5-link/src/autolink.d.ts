/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/autolink
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Delete } from 'ckeditor5/src/typing.js';
import { LinkEditing } from './linkediting.js';
/**
 * The autolink plugin.
 */
export declare class AutoLink extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof Delete, typeof LinkEditing];
    /**
     * @inheritDoc
     */
    static get pluginName(): "AutoLink";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    afterInit(): void;
    /**
     * For given position, returns a range that includes the whole link that contains the position.
     *
     * If position is not inside a link, returns `null`.
     */
    private _expandLinkRange;
    /**
     * Extends the document selection to includes all links that intersects with given `selectedRange`.
     */
    private _selectEntireLinks;
    /**
     * Enables autolinking on pasting a URL when some content is selected.
     */
    private _enablePasteLinking;
    /**
     * Enables autolinking on typing.
     */
    private _enableTypingHandling;
    /**
     * Enables autolinking on the <kbd>Enter</kbd> key.
     */
    private _enableEnterHandling;
    /**
     * Enables autolinking on the <kbd>Shift</kbd>+<kbd>Enter</kbd> keyboard shortcut.
     */
    private _enableShiftEnterHandling;
    /**
     * Checks if the passed range contains a linkable text.
     */
    private _checkAndApplyAutoLinkOnRange;
    /**
     * Applies a link on a given range if the link should be applied.
     *
     * @param url The URL to link.
     * @param range The text range to apply the link attribute to.
     */
    private _applyAutoLink;
    /**
     * Enqueues autolink changes in the model.
     *
     * @param url The URL to link.
     * @param range The text range to apply the link attribute to.
     */
    private _persistAutoLink;
}

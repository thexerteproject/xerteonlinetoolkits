/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module remove-format/removeformatediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
/**
 * The remove format editing plugin.
 *
 * It registers the {@link module:remove-format/removeformatcommand~RemoveFormatCommand removeFormat} command.
 */
export declare class RemoveFormatEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "RemoveFormatEditing";
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode(): string;
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module remove-format/removeformatediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { RemoveFormatCommand } from './removeformatcommand.js';
/**
 * The remove format editing plugin.
 *
 * It registers the {@link module:remove-format/removeformatcommand~RemoveFormatCommand removeFormat} command.
 */
export class RemoveFormatEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'RemoveFormatEditing';
    }
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode() {
        return 'RF';
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
    static get isPremiumPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        editor.commands.add('removeFormat', new RemoveFormatCommand(editor));
    }
}

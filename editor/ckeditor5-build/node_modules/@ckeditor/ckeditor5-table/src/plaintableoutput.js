/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/plaintableoutput
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Table } from './table.js';
/**
 * The plain table output feature.
 *
 * This feature strips the `<figure>` tag from the table data. This is because this tag is not supported
 * by most popular email clients and removing it ensures compatibility.
 */
export class PlainTableOutput extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'PlainTableOutput';
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
        return [Table];
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        editor.conversion.for('upcast').add(dispatcher => {
            dispatcher.on('element:table', (evt, data, conversionApi) => {
                // It's not necessary to upcast the `table` class. This class was only added in data downcast
                // to center a plain table in the editor output.
                // See: https://github.com/ckeditor/ckeditor5/issues/17888.
                conversionApi.consumable.consume(data.viewItem, { classes: 'table' });
            });
        });
    }
}

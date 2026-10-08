/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/integrations/heading
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Enter } from 'ckeditor5/src/enter.js';
import { DataSchema } from '../dataschema.js';
/**
 * Provides the General HTML Support integration with {@link module:heading/heading~Heading Heading} feature.
 */
export class HeadingElementSupport extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [DataSchema, Enter];
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'HeadingElementSupport';
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
    init() {
        const editor = this.editor;
        if (!editor.plugins.has('HeadingEditing')) {
            return;
        }
        const options = editor.config.get('heading.options');
        this.registerHeadingElements(editor, options);
    }
    /**
     * Registers all elements supported by HeadingEditing to enable custom attributes for those elements.
     */
    registerHeadingElements(editor, options) {
        const dataSchema = editor.plugins.get(DataSchema);
        const headerModels = [];
        for (const option of options) {
            if ('model' in option && 'view' in option) {
                dataSchema.registerBlockElement({
                    view: option.view,
                    model: option.model
                });
                headerModels.push(option.model);
            }
        }
        dataSchema.extendBlockElement({
            model: 'htmlHgroup',
            modelSchema: {
                allowChildren: headerModels
            }
        });
        dataSchema.extendBlockElement({
            model: 'htmlSummary',
            modelSchema: {
                allowChildren: headerModels
            }
        });
    }
}

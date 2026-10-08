/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/label/labelview
 */
import { View } from '../view.js';
import { uid } from '@ckeditor/ckeditor5-utils';
import '../../theme/components/label/label.css';
/**
 * The label view class.
 */
export class LabelView extends View {
    /**
     * An unique id of the label. It can be used by other UI components to reference
     * the label, for instance, using the `aria-describedby` DOM attribute.
     */
    id;
    /**
     * @inheritDoc
     */
    constructor(locale) {
        super(locale);
        this.set('text', undefined);
        this.set('for', undefined);
        this.id = `ck-editor__label_${uid()}`;
        const bind = this.bindTemplate;
        this.setTemplate({
            tag: 'label',
            attributes: {
                class: [
                    'ck',
                    'ck-label'
                ],
                id: this.id,
                for: bind.to('for')
            },
            children: [
                {
                    text: bind.to('text')
                }
            ]
        });
    }
}

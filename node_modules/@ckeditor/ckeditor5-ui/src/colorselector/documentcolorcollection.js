/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Collection, ObservableMixin } from '@ckeditor/ckeditor5-utils';
/**
 * A collection to store document colors. It enforces colors to be unique.
 */
export class DocumentColorCollection extends /* #__PURE__ */ ObservableMixin((Collection)) {
    constructor(options) {
        super(options);
        this.set('isEmpty', true);
        this.on('change', () => {
            this.set('isEmpty', this.length === 0);
        });
    }
    /**
     * Adds a color to the document color collection.
     *
     * This method ensures that no color duplicates are inserted (compared using
     * the color value of the {@link module:ui/colorgrid/colorgridview~ColorDefinition}).
     *
     * If the item does not have an ID, it will be automatically generated and set on the item.
     *
     * @param index The position of the item in the collection. The item is pushed to the collection when `index` is not specified.
     * @fires add
     * @fires change
     */
    add(item, index) {
        if (this.find(element => element.color === item.color)) {
            // No duplicates are allowed.
            return this;
        }
        return super.add(item, index);
    }
    /**
     * Checks if an object with given colors is present in the document color collection.
     */
    hasColor(color) {
        return !!this.find(item => item.color === color);
    }
}

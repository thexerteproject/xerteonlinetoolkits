/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module mention/ui/mentionlistitemview
 */
import { ListItemView } from 'ckeditor5/src/ui.js';
export class MentionListItemView extends ListItemView {
    item;
    marker;
    highlight() {
        const child = this.children.first;
        child.isOn = true;
    }
    removeHighlight() {
        const child = this.children.first;
        child.isOn = false;
    }
}

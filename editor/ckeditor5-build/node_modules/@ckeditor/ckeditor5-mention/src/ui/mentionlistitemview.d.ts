/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module mention/ui/mentionlistitemview
 */
import { ListItemView } from 'ckeditor5/src/ui.js';
import type { MentionFeedItem } from '../mentionconfig.js';
export declare class MentionListItemView extends ListItemView {
    item: MentionFeedItem;
    marker: string;
    highlight(): void;
    removeHighlight(): void;
}

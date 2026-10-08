/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module clipboard/clipboard
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ClipboardPipeline } from './clipboardpipeline.js';
import { DragDrop } from './dragdrop.js';
import { PastePlainText } from './pasteplaintext.js';
import { ClipboardMarkersUtils } from './clipboardmarkersutils.js';
/**
 * The clipboard feature.
 *
 * Read more about the clipboard integration in the {@glink framework/deep-dive/clipboard clipboard deep-dive} guide.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:clipboard/clipboardpipeline~ClipboardPipeline}
 * * {@link module:clipboard/dragdrop~DragDrop}
 * * {@link module:clipboard/pasteplaintext~PastePlainText}
 */
export declare class Clipboard extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "Clipboard";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ClipboardMarkersUtils, typeof ClipboardPipeline, typeof DragDrop, typeof PastePlainText];
    /**
     * @inheritDoc
     */
    init(): void;
}

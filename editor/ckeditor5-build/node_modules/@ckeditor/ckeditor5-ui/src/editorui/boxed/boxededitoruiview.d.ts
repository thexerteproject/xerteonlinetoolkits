/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/editorui/boxed/boxededitoruiview
 */
import { EditorUIView } from '../editoruiview.js';
import { type ViewCollection } from '../../viewcollection.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';
/**
 * The boxed editor UI view class. This class represents an editor interface
 * consisting of a toolbar and an editable area, enclosed within a box.
 */
export declare abstract class BoxedEditorUIView extends EditorUIView {
    /**
     * Collection of the child views located in the top (`.ck-editor__top`)
     * area of the UI.
     */
    readonly top: ViewCollection;
    /**
     * Collection of the child views located in the main (`.ck-editor__main`)
     * area of the UI.
     */
    readonly main: ViewCollection;
    /**
     * Voice label of the UI.
     */
    private readonly _voiceLabelView;
    /**
     * Creates an instance of the boxed editor UI view class.
     *
     * @param locale The locale instance..
     */
    constructor(locale: Locale);
    /**
     * Creates a voice label view instance.
     */
    private _createVoiceLabel;
}

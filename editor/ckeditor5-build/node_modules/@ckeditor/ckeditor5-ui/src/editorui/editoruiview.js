/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/editorui/editoruiview
 */
import { View } from '../view.js';
import { BodyCollection } from './bodycollection.js';
import '../../theme/components/editorui/editorui.css';
/**
 * The editor UI view class. Base class for the editor main views.
 */
export class EditorUIView extends View {
    /**
     * Collection of the child views, detached from the DOM
     * structure of the editor, like panels, icons etc.
     */
    body;
    /**
     * Menu bar view instance. Initialized by default in:
     *
     * * balloon editor;
     * * decoupled editor;
     * * multiroot editor.
     */
    menuBarView;
    /**
     * Toolbar view instance. Initialized by default in:
     *
     * * classic editor;
     * * decoupled editor;
     * * inline editor;
     * * multiroot editor.
     */
    toolbar;
    /**
     * Creates an instance of the editor UI view class.
     *
     * @param locale The locale instance.
     */
    constructor(locale) {
        super(locale);
        this.body = new BodyCollection(locale);
    }
    /**
     * @inheritDoc
     */
    render() {
        super.render();
        this.body.attachToDom();
    }
    /**
     * @inheritDoc
     */
    destroy() {
        this.body.detachFromDom();
        return super.destroy();
    }
}

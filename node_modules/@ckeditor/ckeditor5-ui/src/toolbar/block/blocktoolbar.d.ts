/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/toolbar/block/blocktoolbar
 */
import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import { BlockButtonView } from './blockbuttonview.js';
import { BalloonPanelView } from '../../panel/balloon/balloonpanelview.js';
import { ToolbarView } from '../toolbarview.js';
/**
 * The block toolbar plugin.
 *
 * This plugin provides a button positioned next to the block of content where the selection is anchored.
 * Upon clicking the button, a dropdown providing access to editor features shows up, as configured in
 * {@link module:core/editor/editorconfig~EditorConfig#blockToolbar}.
 *
 * By default, the button is displayed next to all elements marked in {@link module:engine/model/schema~ModelSchema}
 * as `$block` for which the toolbar provides at least one option.
 *
 * By default, the button is attached so its right boundary is touching the
 * {@link module:engine/view/editableelement~ViewEditableElement}:
 *
 * ```
 *  __ |
 * |  ||  This is a block of content that the
 *  ¯¯ |  button is attached to. This is a
 *     |  block of content that the button is
 *     |  attached to.
 * ```
 *
 * The position of the button can be adjusted using the CSS `transform` property:
 *
 * ```css
 * .ck-block-toolbar-button {
 * 	transform: translateX( -10px );
 * }
 * ```
 *
 * ```
 *  __   |
 * |  |  |  This is a block of content that the
 *  ¯¯   |  button is attached to. This is a
 *       |  block of content that the button is
 *       |  attached to.
 * ```
 *
 * **Note**: If you plan to run the editor in a right–to–left (RTL) language, keep in mind the button
 * will be attached to the **right** boundary of the editable area. In that case, make sure the
 * CSS position adjustment works properly by adding the following styles:
 *
 * ```css
 * .ck[dir="rtl"] .ck-block-toolbar-button {
 * 	transform: translateX( 10px );
 * }
 * ```
 */
export declare class BlockToolbar extends Plugin {
    /**
     * The toolbar view.
     */
    readonly toolbarView: ToolbarView;
    /**
     * The balloon panel view, containing the {@link #toolbarView}.
     */
    readonly panelView: BalloonPanelView;
    /**
     * The button view that opens the {@link #toolbarView}.
     */
    readonly buttonView: BlockButtonView;
    /**
     * An instance of the resize observer that allows to respond to changes in editable's geometry
     * so the toolbar can stay within its boundaries (and group toolbar items that do not fit).
     *
     * **Note**: Used only when `shouldNotGroupWhenFull` was **not** set in the
     * {@link module:core/editor/editorconfig~EditorConfig#blockToolbar configuration}.
     */
    private _resizeObserver;
    /**
     * A cached and normalized `config.blockToolbar` object.
     */
    private _blockToolbarConfig;
    /**
     * @inheritDoc
     */
    static get pluginName(): "BlockToolbar";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates the {@link #toolbarView}.
     */
    private _createToolbarView;
    /**
     * Creates the {@link #panelView}.
     */
    private _createPanelView;
    /**
     * Creates the {@link #buttonView}.
     */
    private _createButtonView;
    /**
     * Shows or hides the button.
     * When all the conditions for displaying the button are matched, it shows the button. Hides otherwise.
     */
    private _updateButton;
    /**
     * Hides the button.
     */
    private _hideButton;
    /**
     * Shows the {@link #toolbarView} attached to the {@link #buttonView}.
     * If the toolbar is already visible, then it simply repositions it.
     */
    private _showPanel;
    /**
     * Returns currently selected editable, based on the model selection.
     */
    private _getSelectedEditableElement;
    /**
     * Hides the {@link #toolbarView}.
     *
     * @param focusEditable When `true`, the editable will be focused after hiding the panel.
     */
    private _hidePanel;
    /**
     * Repositions the button on scroll.
     */
    private _repositionButtonOnScroll;
    /**
     * Attaches the {@link #buttonView} to the target block of content.
     *
     * @param targetElement Target element.
     */
    private _attachButtonToElement;
    /**
     * Clips the button element to the viewport of the editable element.
     *
     * 	* If the button overflows the editable viewport, it is clipped to make it look like it's cut off by the editable scrollable region.
     * 	* If the button is fully hidden by the top of the editable, it is not clickable but still visible in the DOM.
     *
     * @param buttonView The button view to clip.
     * @param editableElement The editable element whose viewport is used for clipping.
     */
    private _clipButtonToViewport;
    /**
     * Creates a resize observer that observes selected editable and resizes the toolbar panel accordingly.
     */
    private _setupToolbarResize;
    /**
     * Gets the {@link #toolbarView} max-width, based on given `editableElement` width plus the distance between the farthest
     * edge of the {@link #buttonView} and the editable.
     *
     * @returns A maximum width that toolbar can have, in pixels.
     */
    private _getToolbarMaxWidth;
}

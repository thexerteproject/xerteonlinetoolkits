/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/widgettoolbarrepository
 */
import { Plugin, type ToolbarConfigItem } from '@ckeditor/ckeditor5-core';
import type { ViewDocumentSelection, ViewElement } from '@ckeditor/ckeditor5-engine';
import { ContextualBalloon } from '@ckeditor/ckeditor5-ui';
import { type PositioningFunction } from '@ckeditor/ckeditor5-utils';
/**
 * Widget toolbar repository plugin. A central point for registering widget toolbars. This plugin handles the whole
 * toolbar rendering process and exposes a concise API.
 *
 * To add a toolbar for your widget use the {@link ~WidgetToolbarRepository#register `WidgetToolbarRepository#register()`} method.
 *
 * The following example comes from the {@link module:image/imagetoolbar~ImageToolbar} plugin:
 *
 * ```ts
 * class ImageToolbar extends Plugin {
 * 	static get requires() {
 * 		return [ WidgetToolbarRepository ];
 * 	}
 *
 * 	afterInit() {
 * 		const editor = this.editor;
 * 		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
 *
 * 		widgetToolbarRepository.register( 'image', {
 * 			items: editor.config.get( 'image.toolbar' ),
 * 			getRelatedElement: getClosestSelectedImageWidget
 * 		} );
 * 	}
 * }
 * ```
 */
export declare class WidgetToolbarRepository extends Plugin {
    /**
     * A map of toolbar definitions.
     */
    private _toolbarDefinitions;
    private _balloon;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ContextualBalloon];
    /**
     * @inheritDoc
     */
    static get pluginName(): "WidgetToolbarRepository";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    destroy(): void;
    /**
     * Registers toolbar in the WidgetToolbarRepository. It renders it in the `ContextualBalloon` based on the value of the invoked
     * `getRelatedElement` function. Toolbar items are gathered from `items` array.
     * The balloon's CSS class is by default `ck-toolbar-container` and may be override with the `balloonClassName` option.
     *
     * Note: This method should be called in the {@link module:core/plugin~PluginInterface#afterInit `Plugin#afterInit()`}
     * callback (or later) to make sure that the given toolbar items were already registered by other plugins.
     *
     * @param toolbarId An id for the toolbar. Used to
     * @param options Detailed options
     * @param options.ariaLabel Label used by assistive technologies to describe this toolbar element.
     * @param options.items Array of toolbar items.
     * @param options.getRelatedElement Callback which returns an element the toolbar should be attached to.
     * @param options.balloonClassName CSS class for the widget balloon.
     */
    register(toolbarId: string, { ariaLabel, items, getRelatedElement, balloonClassName, positions }: {
        ariaLabel?: string;
        items: Array<ToolbarConfigItem>;
        getRelatedElement: (selection: ViewDocumentSelection) => (ViewElement | null);
        balloonClassName?: string;
        positions?: ReadonlyArray<PositioningFunction>;
    }): void;
    /**
     * Iterates over stored toolbars and makes them visible or hidden.
     */
    private _updateToolbarsVisibility;
    /**
     * Hides the given toolbar.
     */
    private _hideToolbar;
    /**
     * Shows up the toolbar if the toolbar is not visible.
     * Otherwise, repositions the toolbar's balloon when toolbar's view is the most top view in balloon stack.
     *
     * It might happen here that the toolbar's view is under another view. Then do nothing as the other toolbar view
     * should be still visible after the {@link module:ui/editorui/editorui~EditorUI#event:update}.
     */
    private _showToolbar;
    private _isToolbarVisible;
    private _isToolbarInBalloon;
}

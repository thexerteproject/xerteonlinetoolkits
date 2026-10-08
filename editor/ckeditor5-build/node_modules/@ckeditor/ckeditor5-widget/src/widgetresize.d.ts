/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/widgetresize
 */
import { WidgetResizer } from './widgetresize/resizer.js';
import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import { type ModelElement, type ViewContainerElement } from '@ckeditor/ckeditor5-engine';
import '../theme/widgetresize.css';
/**
 * The widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresize~WidgetResize#attachTo} method to create a resizer for the specified widget.
 */
export declare class WidgetResize extends Plugin {
    /**
     * The currently selected resizer.
     *
     * @observable
     */
    selectedResizer: WidgetResizer | null;
    /**
     * References an active resizer.
     *
     * Active resizer means a resizer which handle is actively used by the end user.
     *
     * @internal
     * @observable
     */
    _activeResizer: WidgetResizer | null;
    /**
     * A map of resizers created using this plugin instance.
     */
    private _resizers;
    private _observer;
    private _redrawSelectedResizerThrottled;
    /**
     * @inheritDoc
     */
    static get pluginName(): "WidgetResize";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Redraws the selected resizer if there is any selected resizer and if it is visible.
     */
    redrawSelectedResizer(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Marks resizer as selected.
     */
    select(resizer: WidgetResizer): void;
    /**
     * Deselects currently set resizer.
     */
    deselect(): void;
    /**
     * @param options Resizer options.
     */
    attachTo(options: WidgetResizerOptions): WidgetResizer;
    /**
     * Returns a resizer created for a given view element (widget element).
     *
     * @param viewElement View element associated with the resizer.
     */
    getResizerByViewElement(viewElement: ViewContainerElement): WidgetResizer | undefined;
    /**
     * Returns a resizer that contains a given resize handle.
     */
    private _getResizerByHandle;
    /**
     * @param domEventData Native DOM event.
     */
    private _mouseDownListener;
    /**
     * @param domEventData Native DOM event.
     */
    private _mouseMoveListener;
    private _mouseUpListener;
}
/**
 * Interface describing a resizer. It allows to specify the resizing host, custom logic for calculating aspect ratio, etc.
 */
export interface WidgetResizerOptions {
    /**
     * Editor instance associated with the resizer.
     */
    editor: Editor;
    modelElement: ModelElement;
    /**
     * A view of an element to be resized. Typically it's the main widget's view instance.
     */
    viewElement: ViewContainerElement;
    unit?: 'px' | '%';
    /**
     * A callback to be executed once the resizing process is done.
     *
     * It receives a `Number` (`newValue`) as a parameter.
     *
     * For example, {@link module:image/imageresize~ImageResize} uses it to execute the resize image command
     * which puts the new value into the model.
     *
     * ```ts
     * {
     *	editor,
     *	modelElement: data.item,
     *	viewElement: widget,
     *
     *	onCommit( newValue ) {
     *		editor.execute( 'resizeImage', { width: newValue } );
     *	}
     * };
     * ```
     */
    onCommit: (newValue: string) => void;
    getResizeHost: (widgetWrapper: HTMLElement) => HTMLElement;
    getHandleHost: (widgetWrapper: HTMLElement) => HTMLElement;
    isCentered?: (resizer: WidgetResizer) => boolean;
}

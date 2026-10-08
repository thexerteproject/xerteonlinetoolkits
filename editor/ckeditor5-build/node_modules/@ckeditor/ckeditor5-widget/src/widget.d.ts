/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/widget
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { type ModelElement, type ModelNode, type ViewPosition, type ModelRange } from '@ckeditor/ckeditor5-engine';
import { Delete } from '@ckeditor/ckeditor5-typing';
import { WidgetTypeAround } from './widgettypearound/widgettypearound.js';
import '../theme/widget.css';
/**
 * The widget plugin. It enables base support for widgets.
 *
 * See {@glink api/widget package page} for more details and documentation.
 *
 * This plugin enables multiple behaviors required by widgets:
 *
 * * The model to view selection converter for the editing pipeline (it handles widget custom selection rendering).
 * If a converted selection wraps around a widget element, that selection is marked as
 * {@link module:engine/view/selection~ViewSelection#isFake fake}. Additionally, the `ck-widget_selected` CSS class
 * is added to indicate that widget has been selected.
 * * The mouse and keyboard events handling on and around widget elements.
 */
export declare class Widget extends Plugin {
    /**
     * Holds previously selected widgets.
     */
    private _previouslySelected;
    /**
     * @inheritDoc
     */
    static get pluginName(): "Widget";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof WidgetTypeAround, typeof Delete];
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Handles {@link module:engine/view/document~ViewDocument#event:mousedown mousedown} events on widget elements.
     */
    private _onMousedown;
    /**
     * Handles {@link module:engine/view/document~ViewDocument#event:pointerdown pointerdown} events on widget elements.
     */
    private _onPointerdown;
    /**
     * Selects entire block content, e.g. on triple click it selects entire paragraph.
     */
    private _selectBlockContent;
    /**
     * Handles {@link module:engine/view/document~ViewDocument#event:keydown keydown} events and changes
     * the model selection when:
     *
     * * arrow key is pressed when the widget is selected,
     * * the selection is next to a widget and the widget should become selected upon the arrow key press.
     *
     * See {@link #_preventDefaultOnArrowKeyPress}.
     */
    private _handleSelectionChangeOnArrowKeyPress;
    /**
     * Handles {@link module:engine/view/document~ViewDocument#event:keydown keydown} events and prevents
     * the default browser behavior to make sure the fake selection is not being moved from a fake selection
     * container.
     *
     * See {@link #_handleSelectionChangeOnArrowKeyPress}.
     */
    private _preventDefaultOnArrowKeyPress;
    /**
     * Handles delete keys: backspace and delete.
     *
     * @param isForward Set to true if delete was performed in forward direction.
     * @returns Returns `true` if keys were handled correctly.
     */
    private _handleDelete;
    /**
     * Sets {@link module:engine/model/selection~ModelSelection document's selection} over given element.
     *
     * @internal
     */
    _setSelectionOverElement(element: ModelNode): void;
    /**
     * Checks if {@link module:engine/model/element~ModelElement element} placed next to the current
     * {@link module:engine/model/selection~ModelSelection model selection} exists and is marked in
     * {@link module:engine/model/schema~ModelSchema schema} as `object`.
     *
     * @internal
     * @param forward Direction of checking.
     */
    _getObjectElementNextToSelection(forward: boolean): ModelElement | null;
    /**
     * Removes CSS class from previously selected widgets.
     */
    private _clearPreviouslySelectedWidgets;
    /**
     * Moves the document selection into the next editable or block widget.
     */
    private _selectNextEditable;
    /**
     * Looks for next focus point in the document starting from the given view position and direction.
     * The focus point is either a block widget or an editable.
     *
     * @internal
     */
    _findNextFocusRange(startPosition: ViewPosition, direction: 'backward' | 'forward'): ModelRange | null;
    /**
     * Updates the document selection so that it selects first ancestor widget.
     */
    private _selectAncestorWidget;
}

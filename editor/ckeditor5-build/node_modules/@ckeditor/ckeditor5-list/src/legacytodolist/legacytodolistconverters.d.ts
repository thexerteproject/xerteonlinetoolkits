/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/legacytodolist/legacytodolistconverters
 */
import type { DowncastAttributeEvent, DowncastInsertEvent, ModelElement, MapperModelToViewPositionEvent, Model, UpcastElementEvent, EditingView } from 'ckeditor5/src/engine.js';
import { type GetCallback } from 'ckeditor5/src/utils.js';
/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It converts the `listItem` model element to an unordered list with a {@link module:engine/view/uielement~ViewUIElement checkbox element}
 * at the beginning of each list item. It also merges the list with surrounding lists (if available).
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param model Model instance.
 * @param onCheckboxChecked Callback function.
 * @returns Returns a conversion callback.
 */
export declare function modelViewInsertion(model: Model, onCheckboxChecked: (element: ModelElement) => void): GetCallback<DowncastInsertEvent<ModelElement>>;
/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It is used by {@link module:engine/controller/datacontroller~DataController}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */
export declare function dataModelViewInsertion(model: Model): GetCallback<DowncastInsertEvent<ModelElement>>;
/**
 * A view-to-model converter for the checkbox element inside a view list item.
 *
 * It changes the `listType` of the model `listItem` to a `todo` value.
 * When a view checkbox element is marked as checked, an additional `todoListChecked="true"` attribute is added to the model item.
 *
 * It is used by {@link module:engine/controller/datacontroller~DataController}.
 *
 * @internal
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 */
export declare const dataViewModelCheckmarkInsertion: GetCallback<UpcastElementEvent>;
/**
 * A model-to-view converter for the `listType` attribute change on the `listItem` model element.
 *
 * This change means that the `<li>` element parent changes to `<ul class="todo-list">` and a
 * {@link module:engine/view/uielement~ViewUIElement checkbox UI element} is added at the beginning
 * of the list item element (or vice versa).
 *
 * This converter is preceded by {@link module:list/legacylist/legacyconverters~modelViewChangeType} and followed by
 * {@link module:list/legacylist/legacyconverters~modelViewMergeAfterChangeType} to handle splitting and merging surrounding lists
 * of the same type.
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param onCheckedChange Callback fired after clicking the checkbox UI element.
 * @param view Editing view controller.
 * @returns Returns a conversion callback.
 */
export declare function modelViewChangeType(onCheckedChange: (element: ModelElement) => void, view: EditingView): GetCallback<DowncastAttributeEvent<ModelElement>>;
/**
 * A model-to-view converter for the `todoListChecked` attribute change on the `listItem` model element.
 *
 * It marks the {@link module:engine/view/uielement~ViewUIElement checkbox UI element} as checked.
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @internal
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param onCheckedChange Callback fired after clicking the checkbox UI element.
 * @returns Returns a conversion callback.
 */
export declare function modelViewChangeChecked(onCheckedChange: (element: ModelElement) => void): GetCallback<DowncastAttributeEvent<ModelElement>>;
/**
 * A model-to-view position at zero offset mapper.
 *
 * This helper ensures that position inside todo-list in the view is mapped after the checkbox.
 *
 * It only handles the position at the beginning of a list item as other positions are properly mapped be the default mapper.
 *
 * @internal
 */
export declare function mapModelToViewPosition(view: EditingView): GetCallback<MapperModelToViewPositionEvent>;

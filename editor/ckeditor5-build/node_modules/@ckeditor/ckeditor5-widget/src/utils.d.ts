/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Rect, type GetCallback } from '@ckeditor/ckeditor5-utils';
import { type DowncastHighlightDescriptor, type MapperViewToModelPositionEvent, type ModelDocumentSelection, type ViewDowncastWriter, type Model, type ModelRange, type ModelSelection, type ViewEditableElement, type ViewElement, type ViewTypeCheckable } from '@ckeditor/ckeditor5-engine';
/**
 * CSS class added to each widget element.
 */
export declare const WIDGET_CLASS_NAME = "ck-widget";
/**
 * CSS class added to currently selected widget element.
 */
export declare const WIDGET_SELECTED_CLASS_NAME = "ck-widget_selected";
/**
 * Returns `true` if given {@link module:engine/view/node~ViewNode} is an {@link module:engine/view/element~ViewElement} and a widget.
 */
export declare function isWidget(node: ViewTypeCheckable): boolean;
/**
 * Converts the given {@link module:engine/view/element~ViewElement} to a widget in the following way:
 *
 * * sets the `contenteditable` attribute to `"false"`,
 * * adds the `ck-widget` CSS class,
 * * adds a custom {@link module:engine/view/element~ViewElement#getFillerOffset `getFillerOffset()`} method returning `null`,
 * * adds a custom property allowing to recognize widget elements by using {@link ~isWidget `isWidget()`},
 * * implements the {@link ~setHighlightHandling view highlight on widgets}.
 *
 * This function needs to be used in conjunction with
 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers downcast conversion helpers}
 * like {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`}.
 * Moreover, typically you will want to use `toWidget()` only for `editingDowncast`, while keeping the `dataDowncast` clean.
 *
 * For example, in order to convert a `<widget>` model element to `<div class="widget">` in the view, you can define
 * such converters:
 *
 * ```ts
 * editor.conversion.for( 'editingDowncast' )
 * 	.elementToElement( {
 * 		model: 'widget',
 * 		view: ( modelItem, { writer } ) => {
 * 			const div = writer.createContainerElement( 'div', { class: 'widget' } );
 *
 * 			return toWidget( div, writer, { label: 'some widget' } );
 * 		}
 * 	} );
 *
 * editor.conversion.for( 'dataDowncast' )
 * 	.elementToElement( {
 * 		model: 'widget',
 * 		view: ( modelItem, { writer } ) => {
 * 			return writer.createContainerElement( 'div', { class: 'widget' } );
 * 		}
 * 	} );
 * ```
 *
 * See the full source code of the widget (with a nested editable) schema definition and converters in
 * [this sample](https://github.com/ckeditor/ckeditor5-widget/blob/master/tests/manual/widget-with-nestededitable.js).
 *
 * @param options Additional options.
 * @param options.label Element's label provided to the {@link ~setLabel} function. It can be passed as
 * a plain string or a function returning a string. It represents the widget for assistive technologies (like screen readers).
 * @param options.hasSelectionHandle If `true`, the widget will have a selection handle added.
 * @returns Returns the same element.
 */
export declare function toWidget(element: ViewElement, writer: ViewDowncastWriter, options?: {
    label?: string | (() => string);
    hasSelectionHandle?: boolean;
}): ViewElement;
/**
 * Sets highlight handling methods. Uses {@link module:widget/highlightstack~WidgetHighlightStack} to
 * properly determine which highlight descriptor should be used at given time.
 */
export declare function setHighlightHandling(element: ViewElement, writer: ViewDowncastWriter, add?: (element: ViewElement, descriptor: DowncastHighlightDescriptor, writer: ViewDowncastWriter) => void, remove?: (element: ViewElement, descriptor: DowncastHighlightDescriptor, writer: ViewDowncastWriter) => void): void;
/**
 * Sets label for given element.
 * It can be passed as a plain string or a function returning a string. Function will be called each time label is retrieved by
 * {@link ~getLabel `getLabel()`}.
 */
export declare function setLabel(element: ViewElement, labelOrCreator: string | (() => string)): void;
/**
 * Returns the label of the provided element.
 */
export declare function getLabel(element: ViewElement): string;
/**
 * Adds functionality to the provided {@link module:engine/view/editableelement~ViewEditableElement} to act as a widget's editable:
 *
 * * sets the `contenteditable` attribute to `true` when
 * {@link module:engine/view/editableelement~ViewEditableElement#isReadOnly} is `false`,
 * otherwise sets it to `false`,
 * * adds the `ck-editor__editable` and `ck-editor__nested-editable` CSS classes,
 * * adds the `ck-editor__nested-editable_focused` CSS class when the editable is focused and removes it when it is blurred.
 * * implements the {@link ~setHighlightHandling view highlight on widget's editable}.
 * * sets the `role` attribute to `textbox` for accessibility purposes.
 *
 * Similarly to {@link ~toWidget `toWidget()`} this function should be used in `editingDowncast` only and it is usually
 * used together with {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`}.
 *
 * For example, in order to convert a `<nested>` model element to `<div class="nested">` in the view, you can define
 * such converters:
 *
 * ```ts
 * editor.conversion.for( 'editingDowncast' )
 * 	.elementToElement( {
 * 		model: 'nested',
 * 		view: ( modelItem, { writer } ) => {
 * 			const div = writer.createEditableElement( 'div', { class: 'nested' } );
 *
 * 			return toWidgetEditable( nested, writer, { label: 'label for editable' } );
 * 		}
 * 	} );
 *
 * editor.conversion.for( 'dataDowncast' )
 * 	.elementToElement( {
 * 		model: 'nested',
 * 		view: ( modelItem, { writer } ) => {
 * 			return writer.createContainerElement( 'div', { class: 'nested' } );
 * 		}
 * 	} );
 * ```
 *
 * See the full source code of the widget (with nested editable) schema definition and converters in
 * [this sample](https://github.com/ckeditor/ckeditor5-widget/blob/master/tests/manual/widget-with-nestededitable.js).
 *
 * @param options Additional options.
 * @param options.label Editable's label used by assistive technologies (e.g. screen readers).
 * @param options.withAriaRole Whether to add the role="textbox" attribute on the editable. Defaults to `true`.
 * @returns Returns the same element that was provided in the `editable` parameter
 */
export declare function toWidgetEditable(editable: ViewEditableElement, writer: ViewDowncastWriter, options?: {
    label?: string;
    withAriaRole?: boolean;
}): ViewEditableElement;
/**
 * Returns a model range which is optimal (in terms of UX) for inserting a widget block.
 *
 * For instance, if a selection is in the middle of a paragraph, the collapsed range before this paragraph
 * will be returned so that it is not split. If the selection is at the end of a paragraph,
 * the collapsed range after this paragraph will be returned.
 *
 * Note: If the selection is placed in an empty block, the range in that block will be returned. If that range
 * is then passed to {@link module:engine/model/model~Model#insertContent}, the block will be fully replaced
 * by the inserted widget block.
 *
 * @param selection The selection based on which the insertion position should be calculated.
 * @param model Model instance.
 * @returns The optimal range.
 */
export declare function findOptimalInsertionRange(selection: ModelSelection | ModelDocumentSelection, model: Model): ModelRange;
/**
 * A util to be used in order to map view positions to correct model positions when implementing a widget
 * which renders non-empty view element for an empty model element.
 *
 * For example:
 *
 * ```
 * // Model:
 * <placeholder type="name"></placeholder>
 *
 * // View:
 * <span class="placeholder">name</span>
 * ```
 *
 * In such case, view positions inside `<span>` cannot be correctly mapped to the model (because the model element is empty).
 * To handle mapping positions inside `<span class="placeholder">` to the model use this util as follows:
 *
 * ```ts
 * editor.editing.mapper.on(
 * 	'viewToModelPosition',
 * 	viewToModelPositionOutsideModelElement( model, viewElement => viewElement.hasClass( 'placeholder' ) )
 * );
 * ```
 *
 * The callback will try to map the view offset of selection to an expected model position.
 *
 * 1. When the position is at the end (or in the middle) of the inline widget:
 *
 * ```
 * // View:
 * <p>foo <span class="placeholder">name|</span> bar</p>
 *
 * // Model:
 * <paragraph>foo <placeholder type="name"></placeholder>| bar</paragraph>
 * ```
 *
 * 2. When the position is at the beginning of the inline widget:
 *
 * ```
 * // View:
 * <p>foo <span class="placeholder">|name</span> bar</p>
 *
 * // Model:
 * <paragraph>foo |<placeholder type="name"></placeholder> bar</paragraph>
 * ```
 *
 * @param model Model instance on which the callback operates.
 * @param viewElementMatcher Function that is passed a view element and should return `true` if the custom mapping
 * should be applied to the given view element.
 */
export declare function viewToModelPositionOutsideModelElement(model: Model, viewElementMatcher: (element: ViewElement) => boolean): GetCallback<MapperViewToModelPositionEvent>;
/**
 * Starting from a DOM resize host element (an element that receives dimensions as a result of resizing),
 * this helper returns the width of the found ancestor element.
 *
 *	* It searches up to 5 levels of ancestors only.
 *
 * @param domResizeHost Resize host DOM element that receives dimensions as a result of resizing.
 * @returns Width of ancestor element in pixels or 0 if no ancestor with a computed width has been found.
 */
export declare function calculateResizeHostAncestorWidth(domResizeHost: HTMLElement): number;
/**
 * Calculates a relative width of a `domResizeHost` compared to its ancestor in percents.
 *
 * @param domResizeHost Resize host DOM element.
 * @returns Percentage value between 0 and 100.
 */
export declare function calculateResizeHostPercentageWidth(domResizeHost: HTMLElement, resizeHostRect?: Rect): number;

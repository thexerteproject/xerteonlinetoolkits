/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { isWidget, toWidget } from 'ckeditor5/src/widget.js';
/**
 * Converts a given {@link module:engine/view/element~ViewElement} to a media embed widget:
 * * Adds a {@link module:engine/view/element~ViewElement#_setCustomProperty custom property}
 * allowing to recognize the media widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param writer An instance of the view writer.
 * @param label The element's label.
 * @internal
 */
export function toMediaWidget(viewElement, writer, label) {
    writer.setCustomProperty('media', true, viewElement);
    return toWidget(viewElement, writer, { label });
}
/**
 * Returns a media widget editing view element if one is selected.
 *
 * @internal
 */
export function getSelectedMediaViewWidget(selection) {
    const viewElement = selection.getSelectedElement();
    if (viewElement && isMediaWidget(viewElement)) {
        return viewElement;
    }
    return null;
}
/**
 * Checks if a given view element is a media widget.
 *
 * @internal
 */
export function isMediaWidget(viewElement) {
    return !!viewElement.getCustomProperty('media') && isWidget(viewElement);
}
/**
 * Creates a view element representing the media. Either a "semantic" one for the data pipeline:
 *
 * ```html
 * <figure class="media">
 * 	<oembed url="foo"></oembed>
 * </figure>
 * ```
 *
 * or a "non-semantic" (for the editing view pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 * </figure>
 * ```
 *
 * @internal
 */
export function createMediaFigureElement(writer, registry, url, options) {
    return writer.createContainerElement('figure', { class: 'media' }, [
        registry.getMediaViewElement(writer, url, options),
        writer.createSlot()
    ]);
}
/**
 * Returns a selected media element in the model, if any.
 *
 * @internal
 */
export function getSelectedMediaModelWidget(selection) {
    const selectedElement = selection.getSelectedElement();
    if (selectedElement && selectedElement.is('element', 'media')) {
        return selectedElement;
    }
    return null;
}
/**
 * Creates a media element and inserts it into the model.
 *
 * **Note**: This method will use {@link module:engine/model/model~Model#insertContent `model.insertContent()`} logic of inserting content
 * if no `insertPosition` is passed.
 *
 * @param url An URL of an embeddable media.
 * @param findOptimalPosition If true it will try to find optimal position to insert media without breaking content
 * in which a selection is.
 * @internal
 */
export function insertMedia(model, url, selectable, findOptimalPosition) {
    model.change(writer => {
        const mediaElement = writer.createElement('media', { url });
        model.insertObject(mediaElement, selectable, null, {
            setSelection: 'on',
            findOptimalPosition: findOptimalPosition ? 'auto' : undefined
        });
    });
}

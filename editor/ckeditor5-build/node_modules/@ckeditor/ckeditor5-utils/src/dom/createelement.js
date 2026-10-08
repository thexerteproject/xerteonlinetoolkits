/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/dom/createelement
 */
import { isIterable } from '../isiterable.js';
import { isString } from 'es-toolkit/compat';
/**
 * Creates an HTML or SVG element with attributes and children elements.
 *
 * ```ts
 * createElement( document, 'p' ); // <p>
 * createElement( document, 'mask', { xmlns: 'http://www.w3.org/2000/svg' } ); // <mask>
 * ```
 *
 * @param doc Document used to create the element.
 * @param name Name of the element.
 * @param attributes Object where keys represent attribute keys and values represent attribute values.
 * @param children Child or any iterable of children. Strings will be automatically turned into Text nodes.
 * @returns HTML or SVG element.
 */
export function createElement(doc, name, attributes = {}, children = []) {
    const namespace = attributes && attributes.xmlns;
    const element = namespace ? doc.createElementNS(namespace, name) : doc.createElement(name);
    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    if (isString(children) || !isIterable(children)) {
        children = [children];
    }
    for (let child of children) {
        if (isString(child)) {
            child = doc.createTextNode(child);
        }
        element.appendChild(child);
    }
    return element;
}

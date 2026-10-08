/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { startCase, cloneDeep } from 'es-toolkit/compat';
/**
* Helper function for the downcast converter. Updates attributes on the given view element.
*
* @param writer The view writer.
* @param oldViewAttributes The previous GHS attribute value.
* @param newViewAttributes The current GHS attribute value.
* @param viewElement The view element to update.
* @internal
*/
export function updateViewAttributes(writer, oldViewAttributes, newViewAttributes, viewElement) {
    if (oldViewAttributes) {
        removeViewAttributes(writer, oldViewAttributes, viewElement);
    }
    if (newViewAttributes) {
        setViewAttributes(writer, newViewAttributes, viewElement);
    }
}
/**
 * Helper function for the downcast converter. Sets attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 * @internal
 */
export function setViewAttributes(writer, viewAttributes, viewElement) {
    if (viewAttributes.attributes) {
        for (const [key, value] of Object.entries(viewAttributes.attributes)) {
            writer.setAttribute(key, value, viewElement);
        }
    }
    if (viewAttributes.styles) {
        writer.setStyle(viewAttributes.styles, viewElement);
    }
    if (viewAttributes.classes) {
        writer.addClass(viewAttributes.classes, viewElement);
    }
}
/**
 * Helper function for the downcast converter. Removes attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 * @internal
 */
export function removeViewAttributes(writer, viewAttributes, viewElement) {
    if (viewAttributes.attributes) {
        for (const [key] of Object.entries(viewAttributes.attributes)) {
            writer.removeAttribute(key, viewElement);
        }
    }
    if (viewAttributes.styles) {
        for (const style of Object.keys(viewAttributes.styles)) {
            writer.removeStyle(style, viewElement);
        }
    }
    if (viewAttributes.classes) {
        writer.removeClass(viewAttributes.classes, viewElement);
    }
}
/**
* Merges view element attribute objects.
*
* @internal
*/
export function mergeViewElementAttributes(target, source) {
    const result = cloneDeep(target);
    let key = 'attributes';
    for (key in source) {
        // Merge classes.
        if (key == 'classes') {
            result[key] = Array.from(new Set([...(target[key] || []), ...source[key]]));
        }
        // Merge attributes or styles.
        else {
            result[key] = { ...target[key], ...source[key] };
        }
    }
    return result;
}
export function modifyGhsAttribute(writer, item, ghsAttributeName, subject, callback) {
    const oldValue = item.getAttribute(ghsAttributeName);
    const newValue = {};
    for (const kind of ['attributes', 'styles', 'classes']) {
        // Properties other than `subject` should be assigned from `oldValue`.
        if (kind != subject) {
            if (oldValue && oldValue[kind]) {
                newValue[kind] = oldValue[kind];
            }
            continue;
        }
        // `callback` should be applied on property [`subject`].
        if (subject == 'classes') {
            const values = new Set(oldValue && oldValue.classes || []);
            callback(values);
            if (values.size) {
                newValue[kind] = Array.from(values);
            }
            continue;
        }
        const values = new Map(Object.entries(oldValue && oldValue[kind] || {}));
        callback(values);
        if (values.size) {
            newValue[kind] = Object.fromEntries(values);
        }
    }
    if (Object.keys(newValue).length) {
        if (item.is('documentSelection')) {
            writer.setSelectionAttribute(ghsAttributeName, newValue);
        }
        else {
            writer.setAttribute(ghsAttributeName, newValue, item);
        }
    }
    else if (oldValue) {
        if (item.is('documentSelection')) {
            writer.removeSelectionAttribute(ghsAttributeName);
        }
        else {
            writer.removeAttribute(ghsAttributeName, item);
        }
    }
}
/**
 * Strips the `styles`, and `classes` keys from the GHS attribute value on the given item.
 *
 * @internal
 */
export function removeFormatting(ghsAttributeName, itemRange, writer) {
    for (const item of itemRange.getItems({ shallow: true })) {
        const value = item.getAttribute(ghsAttributeName);
        // Copy only attributes to the new attribute value.
        if (value && value.attributes && Object.keys(value.attributes).length) {
            // But reset the GHS attribute only when there is anything more than just attributes.
            if (Object.keys(value).length > 1) {
                writer.setAttribute(ghsAttributeName, { attributes: value.attributes }, item);
            }
        }
        else {
            // There are no attributes, so remove the GHS attribute completely.
            writer.removeAttribute(ghsAttributeName, item);
        }
    }
}
/**
 * Transforms passed string to PascalCase format. Examples:
 * * `div` => `Div`
 * * `h1` => `H1`
 * * `table` => `Table`
 *
 * @internal
 */
export function toPascalCase(data) {
    return startCase(data).replace(/ /g, '');
}
/**
 * Returns the attribute name of the model element that holds raw HTML attributes.
 *
 * @internal
 */
export function getHtmlAttributeName(viewElementName) {
    return `html${toPascalCase(viewElementName)}Attributes`;
}

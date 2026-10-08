/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module widget/highlightstack
 */
import { EmitterMixin } from '@ckeditor/ckeditor5-utils';
/**
 * Class used to handle the correct order of highlights on elements.
 *
 * When different highlights are applied to same element the correct order should be preserved:
 *
 * * highlight with highest priority should be applied,
 * * if two highlights have same priority - sort by CSS class provided in
 * {@link module:engine/conversion/downcasthelpers~DowncastHighlightDescriptor}.
 *
 * This way, highlight will be applied with the same rules it is applied on texts.
 */
export class WidgetHighlightStack extends /* #__PURE__ */ EmitterMixin() {
    _stack = [];
    /**
     * Adds highlight descriptor to the stack.
     *
     * @fires change:top
     */
    add(descriptor, writer) {
        const stack = this._stack;
        // Save top descriptor and insert new one. If top is changed - fire event.
        const oldTop = stack[0];
        this._insertDescriptor(descriptor);
        const newTop = stack[0];
        // When new object is at the top and stores different information.
        if (oldTop !== newTop && !compareDescriptors(oldTop, newTop)) {
            this.fire('change:top', {
                oldDescriptor: oldTop,
                newDescriptor: newTop,
                writer
            });
        }
    }
    /**
     * Removes highlight descriptor from the stack.
     *
     * @fires change:top
     * @param id Id of the descriptor to remove.
     */
    remove(id, writer) {
        const stack = this._stack;
        const oldTop = stack[0];
        this._removeDescriptor(id);
        const newTop = stack[0];
        // When new object is at the top and stores different information.
        if (oldTop !== newTop && !compareDescriptors(oldTop, newTop)) {
            this.fire('change:top', {
                oldDescriptor: oldTop,
                newDescriptor: newTop,
                writer
            });
        }
    }
    /**
     * Inserts a given descriptor in correct place in the stack. It also takes care about updating information
     * when descriptor with same id is already present.
     */
    _insertDescriptor(descriptor) {
        const stack = this._stack;
        const index = stack.findIndex(item => item.id === descriptor.id);
        // Inserting exact same descriptor - do nothing.
        if (compareDescriptors(descriptor, stack[index])) {
            return;
        }
        // If descriptor with same id but with different information is on the stack - remove it.
        if (index > -1) {
            stack.splice(index, 1);
        }
        // Find correct place to insert descriptor in the stack.
        // It has different information (for example priority) so it must be re-inserted in correct place.
        let i = 0;
        while (stack[i] && shouldABeBeforeB(stack[i], descriptor)) {
            i++;
        }
        stack.splice(i, 0, descriptor);
    }
    /**
     * Removes descriptor with given id from the stack.
     *
     * @param id Descriptor's id.
     */
    _removeDescriptor(id) {
        const stack = this._stack;
        const index = stack.findIndex(item => item.id === id);
        // If descriptor with same id is on the list - remove it.
        if (index > -1) {
            stack.splice(index, 1);
        }
    }
}
/**
 * Compares two descriptors by checking their priority and class list.
 *
 * @returns Returns true if both descriptors are defined and have same priority and classes.
 */
function compareDescriptors(a, b) {
    return a && b && a.priority == b.priority && classesToString(a.classes) == classesToString(b.classes);
}
/**
 * Checks whenever first descriptor should be placed in the stack before second one.
 */
function shouldABeBeforeB(a, b) {
    if (a.priority > b.priority) {
        return true;
    }
    else if (a.priority < b.priority) {
        return false;
    }
    // When priorities are equal and names are different - use classes to compare.
    return classesToString(a.classes) > classesToString(b.classes);
}
/**
 * Converts CSS classes passed with {@link module:engine/conversion/downcasthelpers~DowncastHighlightDescriptor} to
 * sorted string.
 */
function classesToString(classes) {
    return Array.isArray(classes) ? classes.sort().join(',') : classes;
}

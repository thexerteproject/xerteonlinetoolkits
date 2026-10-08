/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/integrations/link
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { findAttributeRange, findAttributeRangeBound } from 'ckeditor5/src/typing.js';
import { StyleUtils } from '../styleutils.js';
export class LinkStyleSupport extends Plugin {
    _styleUtils;
    _htmlSupport;
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'LinkStyleSupport';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get requires() {
        return [StyleUtils, 'GeneralHtmlSupport'];
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        if (!editor.plugins.has('LinkEditing')) {
            return;
        }
        this._styleUtils = editor.plugins.get(StyleUtils);
        this._htmlSupport = this.editor.plugins.get('GeneralHtmlSupport');
        this.listenTo(this._styleUtils, 'isStyleEnabledForInlineSelection', (evt, [definition, selection]) => {
            if (definition.element == 'a') {
                evt.return = this._isStyleEnabled(definition, selection);
                evt.stop();
            }
        }, { priority: 'high' });
        this.listenTo(this._styleUtils, 'isStyleActiveForInlineSelection', (evt, [definition, selection]) => {
            if (definition.element == 'a') {
                evt.return = this._isStyleActive(definition, selection);
                evt.stop();
            }
        }, { priority: 'high' });
        this.listenTo(this._styleUtils, 'getAffectedInlineSelectable', (evt, [definition, selection]) => {
            if (definition.element != 'a') {
                return;
            }
            const selectable = this._getAffectedSelectable(definition, selection);
            if (selectable) {
                evt.return = selectable;
                evt.stop();
            }
        }, { priority: 'high' });
    }
    /**
     * Verifies if the given style is applicable to the provided document selection.
     */
    _isStyleEnabled(definition, selection) {
        const model = this.editor.model;
        // Handle collapsed selection.
        if (selection.isCollapsed) {
            return selection.hasAttribute('linkHref');
        }
        // Non-collapsed selection.
        for (const range of selection.getRanges()) {
            for (const item of range.getItems()) {
                if ((item.is('$textProxy') || model.schema.isInline(item)) && item.hasAttribute('linkHref')) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Returns true if the given style is applied to the specified document selection.
     */
    _isStyleActive(definition, selection) {
        const model = this.editor.model;
        const attributeName = this._htmlSupport.getGhsAttributeNameForElement(definition.element);
        // Handle collapsed selection.
        if (selection.isCollapsed) {
            if (selection.hasAttribute('linkHref')) {
                const ghsAttributeValue = selection.getAttribute(attributeName);
                if (this._styleUtils.hasAllClasses(ghsAttributeValue, definition.classes)) {
                    return true;
                }
            }
            return false;
        }
        // Non-collapsed selection.
        for (const range of selection.getRanges()) {
            for (const item of range.getItems()) {
                if ((item.is('$textProxy') || model.schema.isInline(item)) && item.hasAttribute('linkHref')) {
                    const ghsAttributeValue = item.getAttribute(attributeName);
                    return this._styleUtils.hasAllClasses(ghsAttributeValue, definition.classes);
                }
            }
        }
        return false;
    }
    /**
     * Returns a selectable that given style should be applied to.
     */
    _getAffectedSelectable(definition, selection) {
        const model = this.editor.model;
        // Handle collapsed selection.
        if (selection.isCollapsed) {
            const linkHref = selection.getAttribute('linkHref');
            return findAttributeRange(selection.getFirstPosition(), 'linkHref', linkHref, model);
        }
        // Non-collapsed selection.
        const ranges = [];
        for (const range of selection.getRanges()) {
            // First expand range to include the whole link.
            const expandedRange = model.createRange(expandAttributePosition(range.start, 'linkHref', true, model), expandAttributePosition(range.end, 'linkHref', false, model));
            // Pick only ranges on links.
            for (const item of expandedRange.getItems()) {
                if ((item.is('$textProxy') || model.schema.isInline(item)) && item.hasAttribute('linkHref')) {
                    ranges.push(this.editor.model.createRangeOn(item));
                }
            }
        }
        // Make sure that we have a continuous range on a link
        // (not split between text nodes with mixed attributes like bold etc.)
        return normalizeRanges(ranges);
    }
}
/**
 * Walks forward or backward (depends on the `lookBack` flag), node by node, as long as they have the same attribute value
 * and returns a position just before or after (depends on the `lookBack` flag) the last matched node.
 */
function expandAttributePosition(position, attributeName, lookBack, model) {
    const referenceNode = position.textNode || (lookBack ? position.nodeAfter : position.nodeBefore);
    if (!referenceNode || !referenceNode.hasAttribute(attributeName)) {
        return position;
    }
    const attributeValue = referenceNode.getAttribute(attributeName);
    return findAttributeRangeBound(position, attributeName, attributeValue, lookBack, model);
}
/**
 * Normalizes list of ranges by joining intersecting or "touching" ranges.
 *
 * Note: It assumes that ranges are sorted.
 */
function normalizeRanges(ranges) {
    for (let i = 1; i < ranges.length; i++) {
        const joinedRange = ranges[i - 1].getJoined(ranges[i]);
        if (joinedRange) {
            // Replace the ranges on the list with the new joined range.
            ranges.splice(--i, 2, joinedRange);
        }
    }
    return ranges;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * A filter function that returns matching item and group names in the list view.
 */
export function filterGroupAndItemNames(regExp, items) {
    let totalItemsCount = 0;
    let resultsCount = 0;
    for (const groupView of items) {
        const group = groupView;
        const groupItems = group.items;
        const isGroupLabelMatching = regExp && !!group.label.match(regExp);
        group.labelView.highlightText(isGroupLabelMatching ? regExp : null);
        for (const listItemView of groupItems) {
            const buttonView = listItemView.children.first;
            const labelView = buttonView.labelView;
            if (!regExp) {
                listItemView.isVisible = true;
                labelView.highlightText(null);
            }
            else {
                const isItemLabelMatching = !!buttonView.label.match(regExp);
                labelView.highlightText(isItemLabelMatching ? regExp : null);
                listItemView.isVisible = isGroupLabelMatching || isItemLabelMatching;
            }
        }
        const visibleInGroupCount = groupItems.filter(listItemView => listItemView.isVisible).length;
        totalItemsCount += group.items.length;
        resultsCount += isGroupLabelMatching ? group.items.length : visibleInGroupCount;
        group.isVisible = isGroupLabelMatching || !!visibleInGroupCount;
    }
    return {
        resultsCount,
        totalItemsCount
    };
}

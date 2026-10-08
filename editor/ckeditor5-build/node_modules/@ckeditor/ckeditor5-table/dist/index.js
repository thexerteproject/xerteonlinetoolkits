/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { toWidgetEditable, toWidget, Widget, isWidget, WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget/dist/index.js';
import { first, global, CKEditorError, KeystrokeHandler, FocusTracker, Collection, getLocalizedArrowKeyCodeDirection, Rect, priorities, DomEmitterMixin, toUnit, uid } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { isObject, debounce, isEqual, throttle } from 'es-toolkit/compat';
import { IconTable, IconTableColumn, IconTableRow, IconTableMergeCell, IconCheck, IconCancel, IconAlignBottom, IconAlignMiddle, IconAlignTop, IconAlignJustify, IconAlignRight, IconAlignCenter, IconAlignLeft, IconTableCellProperties, IconTableLayout, IconTableProperties, IconObjectInlineRight, IconObjectCenter, IconObjectInlineLeft, IconCaption, IconPreviousArrow, IconObjectRight, IconObjectLeft } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { View, addKeyboardHandlingForGrid, ButtonView, createDropdown, MenuBarMenuView, SwitchButtonView, SplitButtonView, addListToDropdown, UIModel, ViewCollection, FocusCycler, InputTextView, ColorSelectorView, FormHeaderView, FormRowView, submitHandler, LabelView, LabeledFieldView, createLabeledDropdown, createLabeledInputText, ToolbarView, BalloonPanelView, ContextualBalloon, normalizeColorOptions, getLocalizedColorOptions, clickOutsideHandler, DropdownButtonView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { ClipboardMarkersUtils, ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard/dist/index.js';
import { DomEventObserver, isColorStyleValue, isLengthStyleValue, isPercentageStyleValue, addBorderStylesRules, addPaddingStylesRules, addBackgroundStylesRules, addMarginStylesRules, enableViewPlaceholder, ModelElement } from '@ckeditor/ckeditor5-engine/dist/index.js';

const ALIGN_VALUES_REG_EXP$1 = /^(left|center|right)$/;
const FLOAT_VALUES_REG_EXP = /^(left|none|right)$/;
/**
 * Conversion helper for upcasting attributes using normalized styles.
 *
 * @param options.modelAttribute The attribute to set.
 * @param options.styleName The style name to convert.
 * @param options.attributeName The HTML attribute name to convert.
 * @param options.attributeType The HTML attribute type for value normalization.
 * @param options.viewElement The view element name that should be converted.
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 * @param options.shouldUpcast The function which returns `true` if style should be upcasted from this element.
 * @internal
 */ function upcastStyleToAttribute(conversion, options) {
    const { modelAttribute, styleName, attributeName, attributeType, viewElement, defaultValue, shouldUpcast = ()=>true, reduceBoxSides = false } = options;
    conversion.for('upcast').attributeToAttribute({
        view: {
            name: viewElement,
            styles: {
                [styleName]: /[\s\S]+/
            }
        },
        model: {
            key: modelAttribute,
            value: (viewElement, conversionApi, data)=>{
                // Ignore table elements inside figures and figures without the table class.
                if (!shouldUpcast(viewElement)) {
                    return;
                }
                const localDefaultValue = getDefaultValueAdjusted(defaultValue, '', data);
                const normalized = viewElement.getNormalizedStyle(styleName);
                const value = reduceBoxSides ? reduceBoxSidesValue(normalized) : normalized;
                if (localDefaultValue !== value) {
                    return value;
                }
                // Consume the style even if not applied to the element so it won't be processed by other converters.
                conversionApi.consumable.consume(viewElement, {
                    styles: styleName
                });
            }
        }
    });
    if (attributeName) {
        conversion.for('upcast').attributeToAttribute({
            view: {
                name: viewElement,
                attributes: {
                    [attributeName]: /.+/
                }
            },
            model: {
                key: modelAttribute,
                value: (viewElement, conversionApi, data)=>{
                    // Convert attributes of table and table cell elements, ignore figure.
                    // Do not convert attribute if related style is set as it has a higher priority.
                    // Do not convert attribute if the element is a table inside a figure with the related style set.
                    if (viewElement.name == 'figure' || viewElement.hasStyle(styleName) || viewElement.name == 'table' && viewElement.parent.name == 'figure' && viewElement.parent.hasStyle(styleName)) {
                        return;
                    }
                    const localDefaultValue = getDefaultValueAdjusted(defaultValue, '', data);
                    let value = viewElement.getAttribute(attributeName);
                    if (value && attributeType == 'length') {
                        const parsedValue = parseFloat(value);
                        if (isNaN(parsedValue)) {
                            value = localDefaultValue;
                        } else {
                            value = parsedValue + (value.includes('%') ? '%' : 'px');
                        }
                    }
                    if (localDefaultValue !== value) {
                        return value;
                    }
                    // Consume the attribute even if not applied to the element so it won't be processed by other converters.
                    conversionApi.consumable.consume(viewElement, {
                        attributes: attributeName
                    });
                }
            }
        });
    }
}
/**
 * Conversion helper for upcasting border styles for view elements.
 *
 * @param editor The editor instance.
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `borderColor` value.
 * @param defaultBorder.style The default `borderStyle` value.
 * @param defaultBorder.width The default `borderWidth` value.
 * @internal
 */ function upcastBorderStyles(editor, viewElementName, modelAttributes, defaultBorder) {
    const { conversion } = editor;
    conversion.for('upcast').add((dispatcher)=>dispatcher.on('element:' + viewElementName, (evt, data, conversionApi)=>{
            // If the element was not converted by element-to-element converter,
            // we should not try to convert the style. See #8393.
            if (!data.modelRange) {
                return;
            }
            // Check the most detailed properties. These will be always set directly or
            // when using the "group" properties like: `border-(top|right|bottom|left)` or `border`.
            const stylesToConsume = [
                'border-top-width',
                'border-top-color',
                'border-top-style',
                'border-bottom-width',
                'border-bottom-color',
                'border-bottom-style',
                'border-right-width',
                'border-right-color',
                'border-right-style',
                'border-left-width',
                'border-left-color',
                'border-left-style'
            ].filter((styleName)=>data.viewItem.hasStyle(styleName));
            if (!stylesToConsume.length) {
                return;
            }
            const matcherPattern = {
                styles: stylesToConsume
            };
            // Try to consume appropriate values from consumable values list.
            if (!conversionApi.consumable.test(data.viewItem, matcherPattern)) {
                return;
            }
            const modelElement = [
                ...data.modelRange.getItems({
                    shallow: true
                })
            ].pop();
            const tableElement = modelElement.findAncestor('table', {
                includeSelf: true
            });
            let localDefaultBorder = defaultBorder;
            if (tableElement && tableElement.getAttribute('tableType') == 'layout') {
                localDefaultBorder = {
                    style: 'none',
                    color: '',
                    width: ''
                };
            }
            conversionApi.consumable.consume(data.viewItem, matcherPattern);
            const normalizedBorder = {
                style: data.viewItem.getNormalizedStyle('border-style'),
                color: data.viewItem.getNormalizedStyle('border-color'),
                width: data.viewItem.getNormalizedStyle('border-width')
            };
            const reducedBorder = {
                style: reduceBoxSidesValue(normalizedBorder.style),
                color: reduceBoxSidesValue(normalizedBorder.color),
                width: reduceBoxSidesValue(normalizedBorder.width)
            };
            if (reducedBorder.style !== localDefaultBorder.style) {
                conversionApi.writer.setAttribute(modelAttributes.style, reducedBorder.style, modelElement);
            }
            if (reducedBorder.color !== localDefaultBorder.color) {
                conversionApi.writer.setAttribute(modelAttributes.color, reducedBorder.color, modelElement);
            }
            if (reducedBorder.width !== localDefaultBorder.width) {
                conversionApi.writer.setAttribute(modelAttributes.width, reducedBorder.width, modelElement);
            }
        }));
    if (editor.config.get('experimentalFlags.upcastTableBorderZeroAttributes')) {
        // If parent table has `border="0"` attribute then set border style to `none`
        // all table cells of that table and table itself.
        conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on(`element:${viewElementName}`, (evt, data, conversionApi)=>{
                const { modelRange, viewItem } = data;
                const viewTable = viewItem.is('element', 'table') ? viewItem : viewItem.findAncestor('table');
                // If something already consumed the border attribute on the nearest table element, skip the conversion.
                if (!conversionApi.consumable.test(viewTable, {
                    attributes: 'border'
                })) {
                    return;
                }
                // Ignore tables with border different than "0".
                if (viewTable.getAttribute('border') !== '0') {
                    return;
                }
                const modelElement = modelRange?.start?.nodeAfter;
                // If model element has any non-default border attribute, skip the conversion.
                if (!modelElement || Object.values(modelAttributes).some((attributeName)=>modelElement.hasAttribute(attributeName))) {
                    return;
                }
                conversionApi.writer.setAttribute(modelAttributes.style, 'none', modelElement);
                if (viewItem.is('element', 'table')) {
                    conversionApi.consumable.consume(viewItem, {
                        attributes: 'border'
                    });
                }
            });
        });
    }
}
/**
 * Conversion helper for downcasting an attribute to a style.
 *
 * @internal
 */ function downcastAttributeToStyle(conversion, options) {
    const { modelElement, modelAttribute, styleName } = options;
    conversion.for('downcast').attributeToAttribute({
        model: {
            name: modelElement,
            key: modelAttribute
        },
        view: (modelAttributeValue)=>({
                key: 'style',
                value: {
                    [styleName]: modelAttributeValue
                }
            })
    });
}
/**
 * Conversion helper for downcasting attributes from the model table to a view table (not to `<figure>`).
 *
 * @internal
 */ function downcastTableAttribute(conversion, options) {
    const { modelAttribute, styleName } = options;
    conversion.for('downcast').add((dispatcher)=>dispatcher.on(`attribute:${modelAttribute}:table`, (evt, data, conversionApi)=>{
            const { item, attributeNewValue } = data;
            const { mapper, writer } = conversionApi;
            if (!conversionApi.consumable.consume(data.item, evt.name)) {
                return;
            }
            const table = [
                ...mapper.toViewElement(item).getChildren()
            ].find((child)=>child.is('element', 'table'));
            if (attributeNewValue) {
                writer.setStyle(styleName, attributeNewValue, table);
            } else {
                writer.removeStyle(styleName, table);
            }
        }));
}
/**
 * Returns the default value for table or table cell property adjusted for layout tables.
 *
 * @internal
 */ function getDefaultValueAdjusted(defaultValue, layoutTableDefault, data) {
    const modelElement = data.modelRange && first(data.modelRange.getItems({
        shallow: true
    }));
    const tableElement = modelElement && modelElement.is('element') && modelElement.findAncestor('table', {
        includeSelf: true
    });
    if (tableElement && tableElement.getAttribute('tableType') === 'layout') {
        return layoutTableDefault;
    }
    return defaultValue;
}
/**
 * Reduces the full top, right, bottom, left object to a single string if all sides are equal.
 * Returns original style otherwise.
 */ function reduceBoxSidesValue(style) {
    if (!style) {
        return;
    }
    const sides = [
        'top',
        'right',
        'bottom',
        'left'
    ];
    const allSidesDefined = sides.every((side)=>style[side]);
    if (!allSidesDefined) {
        return style;
    }
    const topSideStyle = style.top;
    const allSidesEqual = sides.every((side)=>style[side] === topSideStyle);
    if (!allSidesEqual) {
        return style;
    }
    return topSideStyle;
}
/**
 * Default table alignment options.
 */ const DEFAULT_TABLE_ALIGNMENT_OPTIONS = {
    left: {
        className: 'table-style-align-left'
    },
    center: {
        className: 'table-style-align-center'
    },
    right: {
        className: 'table-style-align-right'
    },
    blockLeft: {
        className: 'table-style-block-align-left'
    },
    blockRight: {
        className: 'table-style-block-align-right'
    }
};
/**
 * Configuration for upcasting table alignment from view to model.
 */ const upcastTableAlignmentConfig = [
    // Support for the `float:*;` CSS definition for the table alignment.
    {
        view: {
            name: /^(table|figure)$/,
            styles: {
                float: FLOAT_VALUES_REG_EXP
            }
        },
        getAlign: (viewElement)=>{
            let align = viewElement.getStyle('float');
            if (align === 'none') {
                align = 'center';
            }
            return align;
        },
        getConsumables (viewElement) {
            const float = viewElement.getStyle('float');
            const styles = [
                'float'
            ];
            if (float === 'left' && viewElement.hasStyle('margin-right')) {
                styles.push('margin-right');
            } else if (float === 'right' && viewElement.hasStyle('margin-left')) {
                styles.push('margin-left');
            }
            return {
                styles
            };
        }
    },
    // Support for the `margin-left:auto; margin-right:auto;` CSS definition for the table alignment.
    {
        view: {
            name: /^(table|figure)$/,
            styles: {
                'margin-left': 'auto',
                'margin-right': 'auto'
            }
        },
        getAlign: ()=>'center',
        getConsumables: ()=>{
            return {
                styles: [
                    'margin-left',
                    'margin-right'
                ]
            };
        }
    },
    // Support for the left alignment using CSS classes.
    {
        view: {
            name: /^(table|figure)$/,
            key: 'class',
            value: 'table-style-align-left'
        },
        getAlign: ()=>'left',
        getConsumables () {
            return {
                classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.left.className
            };
        }
    },
    // Support for the right alignment using CSS classes.
    {
        view: {
            name: /^(table|figure)$/,
            key: 'class',
            value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.right.className
        },
        getAlign: ()=>'right',
        getConsumables () {
            return {
                classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.right.className
            };
        }
    },
    // Support for the center alignment using CSS classes.
    {
        view: {
            name: /^(table|figure)$/,
            key: 'class',
            value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.center.className
        },
        getAlign: ()=>'center',
        getConsumables () {
            return {
                classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.center.className
            };
        }
    },
    // Support for the block alignment left using CSS classes.
    {
        view: {
            name: /^(table|figure)$/,
            key: 'class',
            value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className
        },
        getAlign: ()=>'blockLeft',
        getConsumables () {
            return {
                classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className
            };
        }
    },
    // Support for the block alignment right using CSS classes.
    {
        view: {
            name: /^(table|figure)$/,
            key: 'class',
            value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className
        },
        getAlign: ()=>'blockRight',
        getConsumables () {
            return {
                classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className
            };
        }
    },
    // Support for the block alignment left using margin CSS styles.
    {
        view: {
            name: /^(table|figure)$/,
            styles: {
                'margin-left': '0',
                'margin-right': 'auto'
            }
        },
        getAlign: ()=>'blockLeft',
        getConsumables () {
            return {
                styles: [
                    'margin-left',
                    'margin-right'
                ]
            };
        }
    },
    // Support for the block alignment right using margin CSS styles.
    {
        view: {
            name: /^(table|figure)$/,
            styles: {
                'margin-left': 'auto',
                'margin-right': '0'
            }
        },
        getAlign: ()=>'blockRight',
        getConsumables () {
            return {
                styles: [
                    'margin-left',
                    'margin-right'
                ]
            };
        }
    },
    // Support for the `align` attribute as the backward compatibility while pasting from other sources.
    {
        view: {
            name: 'table',
            attributes: {
                align: ALIGN_VALUES_REG_EXP$1
            }
        },
        getAlign: (viewElement)=>viewElement.getAttribute('align'),
        getConsumables () {
            return {
                attributes: 'align'
            };
        }
    }
];
const downcastTableAlignmentConfig = {
    center: {
        align: 'center',
        style: 'margin-left: auto; margin-right: auto;',
        className: 'table-style-align-center'
    },
    left: {
        align: 'left',
        style: 'float: left;',
        className: 'table-style-align-left'
    },
    right: {
        align: 'right',
        style: 'float: right;',
        className: 'table-style-align-right'
    },
    blockLeft: {
        align: undefined,
        style: 'margin-left: 0; margin-right: auto;',
        className: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className
    },
    blockRight: {
        align: undefined,
        style: 'margin-left: auto; margin-right: 0;',
        className: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className
    }
};

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module table/tablewalker
 */ /**
 * The table iterator class. It allows to iterate over table cells. For each cell the iterator yields
 * {@link module:table/tablewalker~TableSlot} with proper table cell attributes.
 */ class TableWalker {
    /**
	 * The walker's table element.
	 *
	 * @internal
	 */ _table;
    /**
	 * A row index from which this iterator will start.
	 */ _startRow;
    /**
	 * A row index at which this iterator will end.
	 */ _endRow;
    /**
	 * If set, the table walker will only output cells from a given column and following ones or cells that overlap them.
	 */ _startColumn;
    /**
	 * If set, the table walker will only output cells up to a given column.
	 */ _endColumn;
    /**
	 * Enables output of spanned cells that are normally not yielded.
	 */ _includeAllSlots;
    /**
	 * Row indexes to skip from the iteration.
	 */ _skipRows;
    /**
	 * The current row index.
	 *
	 * @internal
	 */ _row;
    /**
	 * The index of the current row element in the table.
	 *
	 * @internal
	 */ _rowIndex;
    /**
	 * The current column index.
	 *
	 * @internal
	 */ _column;
    /**
	 * The cell index in a parent row. For spanned cells when {@link #_includeAllSlots} is set to `true`,
	 * this represents the index of the next table cell.
	 *
	 * @internal
	 */ _cellIndex;
    /**
	 * Holds a map of spanned cells in a table.
	 */ _spannedCells;
    /**
	 * Index of the next column where a cell is anchored.
	 */ _nextCellAtColumn;
    /**
	 * Indicates whether the iterator jumped to (or close to) the start row, ignoring rows that don't need to be traversed.
	 */ _jumpedToStartRow = false;
    /**
	 * Creates an instance of the table walker.
	 *
	 * The table walker iterates internally by traversing the table from row index = 0 and column index = 0.
	 * It walks row by row and column by column in order to output values defined in the constructor.
	 * By default it will output only the locations that are occupied by a cell. To include also spanned rows and columns,
	 * pass the `includeAllSlots` option to the constructor.
	 *
	 * The most important values of the iterator are column and row indexes of a cell.
	 *
	 * See {@link module:table/tablewalker~TableSlot} what values are returned by the table walker.
	 *
	 * To iterate over a given row:
	 *
	 * ```ts
	 * const tableWalker = new TableWalker( table, { startRow: 1, endRow: 2 } );
	 *
	 * for ( const tableSlot of tableWalker ) {
	 *   console.log( 'A cell at row', tableSlot.row, 'and column', tableSlot.column );
	 * }
	 * ```
	 *
	 * For instance the code above for the following table:
	 *
	 *  +----+----+----+----+----+----+
	 *  | 00      | 02 | 03 | 04 | 05 |
	 *  |         +----+----+----+----+
	 *  |         | 12      | 14 | 15 |
	 *  |         +----+----+----+    +
	 *  |         | 22           |    |
	 *  |----+----+----+----+----+    +
	 *  | 30 | 31 | 32 | 33 | 34 |    |
	 *  +----+----+----+----+----+----+
	 *
	 * will log in the console:
	 *
	 *  'A cell at row 1 and column 2'
	 *  'A cell at row 1 and column 4'
	 *  'A cell at row 1 and column 5'
	 *  'A cell at row 2 and column 2'
	 *
	 * To also iterate over spanned cells:
	 *
	 * ```ts
	 * const tableWalker = new TableWalker( table, { row: 1, includeAllSlots: true } );
	 *
	 * for ( const tableSlot of tableWalker ) {
	 *   console.log( 'Slot at', tableSlot.row, 'x', tableSlot.column, ':', tableSlot.isAnchor ? 'is anchored' : 'is spanned' );
	 * }
	 * ```
	 *
	 * will log in the console for the table from the previous example:
	 *
	 *  'Cell at 1 x 0 : is spanned'
	 *  'Cell at 1 x 1 : is spanned'
	 *  'Cell at 1 x 2 : is anchored'
	 *  'Cell at 1 x 3 : is spanned'
	 *  'Cell at 1 x 4 : is anchored'
	 *  'Cell at 1 x 5 : is anchored'
	 *
	 * **Note**: Option `row` is a shortcut that sets both `startRow` and `endRow` to the same row.
	 * (Use either `row` or `startRow` and `endRow` but never together). Similarly the `column` option sets both `startColumn`
	 * and `endColumn` to the same column (Use either `column` or `startColumn` and `endColumn` but never together).
	 *
	 * @param table A table over which the walker iterates.
	 * @param options An object with configuration.
	 * @param options.row A row index for which this iterator will output cells. Can't be used together with `startRow` and `endRow`.
	 * @param options.startRow A row index from which this iterator should start. Can't be used together with `row`. Default value is 0.
	 * @param options.endRow A row index at which this iterator should end. Can't be used together with `row`.
	 * @param options.column A column index for which this iterator will output cells.
	 * Can't be used together with `startColumn` and `endColumn`.
	 * @param options.startColumn A column index from which this iterator should start.
	 * Can't be used together with `column`. Default value is 0.
	 * @param options.endColumn A column index at which this iterator should end. Can't be used together with `column`.
	 * @param options.includeAllSlots Also return values for spanned cells. Default value is "false".
	 */ constructor(table, options = {}){
        this._table = table;
        this._startRow = options.row !== undefined ? options.row : options.startRow || 0;
        this._endRow = options.row !== undefined ? options.row : options.endRow;
        this._startColumn = options.column !== undefined ? options.column : options.startColumn || 0;
        this._endColumn = options.column !== undefined ? options.column : options.endColumn;
        this._includeAllSlots = !!options.includeAllSlots;
        this._skipRows = new Set();
        this._row = 0;
        this._rowIndex = 0;
        this._column = 0;
        this._cellIndex = 0;
        this._spannedCells = new Map();
        this._nextCellAtColumn = -1;
    }
    /**
	 * Iterable interface.
	 */ [Symbol.iterator]() {
        return this;
    }
    /**
	 * Gets the next table walker's value.
	 *
	 * @returns The next table walker's value.
	 */ next() {
        if (this._canJumpToStartRow()) {
            this._jumpToNonSpannedRowClosestToStartRow();
        }
        const row = this._table.getChild(this._rowIndex);
        // Iterator is done when there's no row (table ended) or the row is after `endRow` limit.
        if (!row || this._isOverEndRow()) {
            return {
                done: true,
                value: undefined
            };
        }
        // We step over current element when it is not a tableRow instance.
        if (!row.is('element', 'tableRow')) {
            this._rowIndex++;
            return this.next();
        }
        if (this._isOverEndColumn()) {
            return this._advanceToNextRow();
        }
        let outValue = null;
        const spanData = this._getSpanned();
        if (spanData) {
            if (this._includeAllSlots && !this._shouldSkipSlot()) {
                outValue = this._formatOutValue(spanData.cell, spanData.row, spanData.column);
            }
        } else {
            const cell = row.getChild(this._cellIndex);
            if (!cell) {
                // If there are no more cells left in row advance to the next row.
                return this._advanceToNextRow();
            }
            const colspan = parseInt(cell.getAttribute('colspan') || '1');
            const rowspan = parseInt(cell.getAttribute('rowspan') || '1');
            // Record this cell spans if it's not 1x1 cell.
            if (colspan > 1 || rowspan > 1) {
                this._recordSpans(cell, rowspan, colspan);
            }
            if (!this._shouldSkipSlot()) {
                outValue = this._formatOutValue(cell);
            }
            this._nextCellAtColumn = this._column + colspan;
        }
        // Advance to the next column before returning value.
        this._column++;
        if (this._column == this._nextCellAtColumn) {
            this._cellIndex++;
        }
        // The current value will be returned only if current row and column are not skipped.
        return outValue || this.next();
    }
    /**
	 * Marks a row to skip in the next iteration. It will also skip cells from the current row if there are any cells from the current row
	 * to output.
	 *
	 * @param row The row index to skip.
	 */ skipRow(row) {
        this._skipRows.add(row);
    }
    /**
	 * Advances internal cursor to the next row.
	 */ _advanceToNextRow() {
        this._row++;
        this._rowIndex++;
        this._column = 0;
        this._cellIndex = 0;
        this._nextCellAtColumn = -1;
        return this.next();
    }
    /**
	 * Checks if the current row is over {@link #_endRow}.
	 */ _isOverEndRow() {
        // If #_endRow is defined skip all rows after it.
        return this._endRow !== undefined && this._row > this._endRow;
    }
    /**
	 * Checks if the current cell is over {@link #_endColumn}
	 */ _isOverEndColumn() {
        // If #_endColumn is defined skip all cells after it.
        return this._endColumn !== undefined && this._column > this._endColumn;
    }
    /**
	 * A common method for formatting the iterator's output value.
	 *
	 * @param cell The table cell to output.
	 * @param anchorRow The row index of a cell anchor slot.
	 * @param anchorColumn The column index of a cell anchor slot.
	 */ _formatOutValue(cell, anchorRow = this._row, anchorColumn = this._column) {
        return {
            done: false,
            value: new TableSlot(this, cell, anchorRow, anchorColumn)
        };
    }
    /**
	 * Checks if the current slot should be skipped.
	 */ _shouldSkipSlot() {
        const rowIsMarkedAsSkipped = this._skipRows.has(this._row);
        const rowIsBeforeStartRow = this._row < this._startRow;
        const columnIsBeforeStartColumn = this._column < this._startColumn;
        const columnIsAfterEndColumn = this._endColumn !== undefined && this._column > this._endColumn;
        return rowIsMarkedAsSkipped || rowIsBeforeStartRow || columnIsBeforeStartColumn || columnIsAfterEndColumn;
    }
    /**
	 * Returns the cell element that is spanned over the current cell location.
	 */ _getSpanned() {
        const rowMap = this._spannedCells.get(this._row);
        // No spans for given row.
        if (!rowMap) {
            return null;
        }
        // If spans for given rows has entry for column it means that this location if spanned by other cell.
        return rowMap.get(this._column) || null;
    }
    /**
	 * Updates spanned cells map relative to the current cell location and its span dimensions.
	 *
	 * @param cell A cell that is spanned.
	 * @param rowspan Cell height.
	 * @param colspan Cell width.
	 */ _recordSpans(cell, rowspan, colspan) {
        const data = {
            cell,
            row: this._row,
            column: this._column
        };
        for(let rowToUpdate = this._row; rowToUpdate < this._row + rowspan; rowToUpdate++){
            for(let columnToUpdate = this._column; columnToUpdate < this._column + colspan; columnToUpdate++){
                if (rowToUpdate != this._row || columnToUpdate != this._column) {
                    this._markSpannedCell(rowToUpdate, columnToUpdate, data);
                }
            }
        }
    }
    /**
	 * Marks the cell location as spanned by another cell.
	 *
	 * @param row The row index of the cell location.
	 * @param column The column index of the cell location.
	 * @param data A spanned cell details (cell element, anchor row and column).
	 */ _markSpannedCell(row, column, data) {
        if (!this._spannedCells.has(row)) {
            this._spannedCells.set(row, new Map());
        }
        const rowSpans = this._spannedCells.get(row);
        rowSpans.set(column, data);
    }
    /**
	 * Checks if part of the table can be skipped.
	 */ _canJumpToStartRow() {
        return !!this._startRow && this._startRow > 0 && !this._jumpedToStartRow;
    }
    /**
	 * Sets the current row to `this._startRow` or the first row before it that has the number of cells
	 * equal to the number of columns in the table.
	 *
	 * Example:
	 * 	+----+----+----+
	 *  | 00 | 01 | 02 |
	 *  |----+----+----+
	 *  | 10      | 12 |
	 *  |         +----+
	 *  |         | 22 |
	 *  |         +----+
	 *  |         | 32 | <--- Start row
	 *  +----+----+----+
	 *  | 40 | 41 | 42 |
	 *  +----+----+----+
	 *
	 * If the 4th row is a `this._startRow`, this method will:
	 * 1.) Count the number of columns this table has based on the first row (3 columns in this case).
	 * 2.) Check if the 4th row contains 3 cells. It doesn't, so go to the row before it.
	 * 3.) Check if the 3rd row contains 3 cells. It doesn't, so go to the row before it.
	 * 4.) Check if the 2nd row contains 3 cells. It does, so set the current row to that row.
	 *
	 * Setting the current row this way is necessary to let the `next()`  method loop over the cells
	 * spanning multiple rows or columns and update the `this._spannedCells` property.
	 */ _jumpToNonSpannedRowClosestToStartRow() {
        const firstRowLength = this._getRowLength(0);
        for(let i = this._startRow; !this._jumpedToStartRow; i--){
            if (firstRowLength === this._getRowLength(i)) {
                this._row = i;
                this._rowIndex = i;
                this._jumpedToStartRow = true;
            }
        }
    }
    /**
	 * Returns a number of columns in a row taking `colspan` into consideration.
	 */ _getRowLength(rowIndex) {
        const row = this._table.getChild(rowIndex);
        return [
            ...row.getChildren()
        ].reduce((cols, row)=>{
            return cols + parseInt(row.getAttribute('colspan') || '1');
        }, 0);
    }
}
/**
 * An object returned by {@link module:table/tablewalker~TableWalker} when traversing table cells.
 */ class TableSlot {
    /**
	 * The current table cell.
	 */ cell;
    /**
	 * The row index of a table slot.
	 */ row;
    /**
	 * The column index of a table slot.
	 */ column;
    /**
	 * The row index of a cell anchor slot.
	 */ cellAnchorRow;
    /**
	 * The column index of a cell anchor slot.
	 */ cellAnchorColumn;
    /**
	 * The index of the current cell in the parent row.
	 */ _cellIndex;
    /**
	 * The index of the current row element in the table.
	 */ _rowIndex;
    /**
	 * The table element.
	 */ _table;
    /**
	 * Creates an instance of the table walker value.
	 *
	 * @param tableWalker The table walker instance.
	 * @param cell The current table cell.
	 * @param anchorRow The row index of a cell anchor slot.
	 * @param anchorColumn The column index of a cell anchor slot.
	 */ constructor(tableWalker, cell, anchorRow, anchorColumn){
        this.cell = cell;
        this.row = tableWalker._row;
        this.column = tableWalker._column;
        this.cellAnchorRow = anchorRow;
        this.cellAnchorColumn = anchorColumn;
        this._cellIndex = tableWalker._cellIndex;
        this._rowIndex = tableWalker._rowIndex;
        this._table = tableWalker._table;
    }
    // @if CK_DEBUG // public get isSpanned(): unknown { return throwMissingGetterError( 'isSpanned' ); }
    // @if CK_DEBUG // public get colspan(): unknown { return throwMissingGetterError( 'colspan' ); }
    // @if CK_DEBUG // public get rowspan(): unknown { return throwMissingGetterError( 'rowspan' ); }
    // @if CK_DEBUG // public get cellIndex(): unknown { return throwMissingGetterError( 'cellIndex' ); }
    /**
	 * Whether the cell is anchored in the current slot.
	 */ get isAnchor() {
        return this.row === this.cellAnchorRow && this.column === this.cellAnchorColumn;
    }
    /**
	 * The width of a cell defined by a `colspan` attribute. If the model attribute is not present, it is set to `1`.
	 */ get cellWidth() {
        return parseInt(this.cell.getAttribute('colspan') || '1');
    }
    /**
	 * The height of a cell defined by a `rowspan` attribute. If the model attribute is not present, it is set to `1`.
	 */ get cellHeight() {
        return parseInt(this.cell.getAttribute('rowspan') || '1');
    }
    /**
	 * The index of the current row element in the table.
	 */ get rowIndex() {
        return this._rowIndex;
    }
    /**
	 * Returns the {@link module:engine/model/position~ModelPosition} before the table slot.
	 */ getPositionBefore() {
        const model = this._table.root.document.model;
        return model.createPositionAt(this._table.getChild(this.row), this._cellIndex);
    }
}
 // @if CK_DEBUG //		throw new CKEditorError( 'tableslot-getter-removed', null, {
 // @if CK_DEBUG //			getterName
 // @if CK_DEBUG //		} );
 // @if CK_DEBUG // }

/**
 * A common method to update the numeric value. If a value is the default one, it will be unset.
 *
 * @internal
 * @param key An attribute key.
 * @param value The new attribute value.
 * @param item A model item on which the attribute will be set.
 * @param defaultValue The default attribute value. If a value is lower or equal, it will be unset.
 */ function updateNumericAttribute(key, value, item, writer, defaultValue = 1) {
    if (value !== undefined && value !== null && defaultValue !== undefined && defaultValue !== null && value > defaultValue) {
        writer.setAttribute(key, value, item);
    } else {
        writer.removeAttribute(key, item);
    }
}
/**
 * A common method to create an empty table cell. It creates a proper model structure as a table cell must have at least one block inside.
 *
 * @internal
 * @param writer The model writer.
 * @param insertPosition The position at which the table cell should be inserted.
 * @param attributes The element attributes.
 * @returns Created table cell.
 */ function createEmptyTableCell(writer, insertPosition, attributes = {}) {
    const tableCell = writer.createElement('tableCell', attributes);
    writer.insertElement('paragraph', tableCell);
    writer.insert(tableCell, insertPosition);
    return tableCell;
}
/**
 * Checks if a table cell belongs to the heading column section.
 *
 * @internal
 */ function isHeadingColumnCell(tableUtils, tableCell) {
    const table = tableCell.parent.parent;
    const headingColumns = parseInt(table.getAttribute('headingColumns') || '0');
    const { column } = tableUtils.getCellLocation(tableCell);
    return !!headingColumns && column < headingColumns;
}
/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @internal
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */ function enableProperty$1(schema, conversion, options) {
    const { modelAttribute } = options;
    schema.extend('tableCell', {
        allowAttributes: [
            modelAttribute
        ]
    });
    schema.setAttributeProperties(modelAttribute, {
        isFormatting: true
    });
    upcastStyleToAttribute(conversion, {
        viewElement: /^(td|th)$/,
        ...options
    });
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        ...options
    });
}
/**
 * Depending on the position of the selection we either return the table under cursor or look for the table higher in the hierarchy.
 *
 * @internal
 */ function getSelectionAffectedTable(selection) {
    const selectedElement = selection.getSelectedElement();
    // Is the command triggered from the `tableToolbar`?
    if (selectedElement && selectedElement.is('element', 'table')) {
        return selectedElement;
    }
    return selection.getFirstPosition().findAncestor('table');
}
/**
 * Groups table cells by their parent table.
 *
 * @internal
 */ function groupCellsByTable(tableCells) {
    const tableMap = new Map();
    for (const tableCell of tableCells){
        const table = tableCell.findAncestor('table');
        if (!tableMap.has(table)) {
            tableMap.set(table, []);
        }
        tableMap.get(table).push(tableCell);
    }
    return tableMap;
}
/**
 * Checks if all cells in a given row or column are header cells.
 *
 * @internal
 */ function isEntireCellsLineHeader({ table, row, column }) {
    const tableWalker = new TableWalker(table, {
        row,
        column
    });
    for (const { cell } of tableWalker){
        const cellType = cell.getAttribute('tableCellType');
        if (cellType !== 'header') {
            return false;
        }
    }
    return true;
}
/**
 * Checks whether the `tableCellType` attribute is enabled in the editor schema and the experimental flag is set.
 *
 * @internal
 */ function isTableCellTypeEnabled(editor) {
    const { model, config } = editor;
    return model.schema.checkAttribute('tableCell', 'tableCellType') && config.get('experimentalFlags.tableCellTypeSupport') === true;
}

/**
 * Returns a cropped table according to given dimensions.

 * To return a cropped table that starts at first row and first column and end in third row and column:
 *
 * ```ts
 * const croppedTable = cropTableToDimensions( table, {
 *   startRow: 1,
 *   endRow: 3,
 *   startColumn: 1,
 *   endColumn: 3
 * }, writer );
 * ```
 *
 * Calling the code above for the table below:
 *
 *        0   1   2   3   4                      0   1   2
 *      ┌───┬───┬───┬───┬───┐
 *   0  │ a │ b │ c │ d │ e │
 *      ├───┴───┤   ├───┴───┤                  ┌───┬───┬───┐
 *   1  │ f     │   │ g     │                  │   │   │ g │  0
 *      ├───┬───┴───┼───┬───┤   will return:   ├───┴───┼───┤
 *   2  │ h │ i     │ j │ k │                  │ i     │ j │  1
 *      ├───┤       ├───┤   │                  │       ├───┤
 *   3  │ l │       │ m │   │                  │       │ m │  2
 *      ├───┼───┬───┤   ├───┤                  └───────┴───┘
 *   4  │ n │ o │ p │   │ q │
 *      └───┴───┴───┴───┴───┘
 *
 * @internal
 */ function cropTableToDimensions(sourceTable, cropDimensions, writer) {
    const { startRow, startColumn, endRow, endColumn } = cropDimensions;
    // Initialize the cropped table element.
    const croppedTable = writer.createElement('table');
    // Copy table type attribute if present.
    const sourceTableType = sourceTable.getAttribute('tableType');
    if (sourceTableType) {
        writer.setAttribute('tableType', sourceTableType, croppedTable);
    }
    // Create empty table with empty rows equal to crop height.
    const cropHeight = endRow - startRow + 1;
    for(let i = 0; i < cropHeight; i++){
        writer.insertElement('tableRow', croppedTable, 'end');
    }
    const tableMap = [
        ...new TableWalker(sourceTable, {
            startRow,
            endRow,
            startColumn,
            endColumn,
            includeAllSlots: true
        })
    ];
    // Iterate over source table slots (including empty - spanned - ones).
    for (const { row: sourceRow, column: sourceColumn, cell: tableCell, isAnchor, cellAnchorRow, cellAnchorColumn } of tableMap){
        // Row index in cropped table.
        const rowInCroppedTable = sourceRow - startRow;
        const row = croppedTable.getChild(rowInCroppedTable);
        // For empty slots: fill the gap with empty table cell.
        if (!isAnchor) {
            // But fill the gap only if the spanning cell is anchored outside cropped area.
            // In the table from method jsdoc those cells are: "c" & "f".
            if (cellAnchorRow < startRow || cellAnchorColumn < startColumn) {
                createEmptyTableCell(writer, writer.createPositionAt(row, 'end'));
            }
        } else {
            const tableCellCopy = writer.cloneElement(tableCell);
            writer.append(tableCellCopy, row);
            // Trim table if it exceeds cropped area.
            // In the table from method jsdoc those cells are: "g" & "m".
            trimTableCellIfNeeded(tableCellCopy, sourceRow, sourceColumn, endRow, endColumn, writer);
        }
    }
    // Adjust heading rows & columns in cropped table if crop selection includes headings parts.
    addHeadingsToCroppedTable(croppedTable, sourceTable, startRow, startColumn, writer);
    return croppedTable;
}
/**
 * Returns slot info of cells that starts above and overlaps a given row.
 *
 * In a table below, passing `overlapRow = 3`
 *
 *     ┌───┬───┬───┬───┬───┐
 *  0  │ a │ b │ c │ d │ e │
 *     │   ├───┼───┼───┼───┤
 *  1  │   │ f │ g │ h │ i │
 *     ├───┤   ├───┼───┤   │
 *  2  │ j │   │ k │ l │   │
 *     │   │   │   ├───┼───┤
 *  3  │   │   │   │ m │ n │  <- overlap row to check
 *     ├───┼───┤   │   ├───│
 *  4  │ o │ p │   │   │ q │
 *     └───┴───┴───┴───┴───┘
 *
 * will return slot info for cells: "j", "f", "k".
 *
 * @internal
 * @param table The table to check.
 * @param overlapRow The index of the row to check.
 * @param startRow row to start analysis. Use it when it is known that the cells above that row will not overlap. Default value is 0.
 */ function getVerticallyOverlappingCells(table, overlapRow, startRow = 0) {
    const cells = [];
    const tableWalker = new TableWalker(table, {
        startRow,
        endRow: overlapRow - 1
    });
    for (const slotInfo of tableWalker){
        const { row, cellHeight } = slotInfo;
        const cellEndRow = row + cellHeight - 1;
        if (row < overlapRow && overlapRow <= cellEndRow) {
            cells.push(slotInfo);
        }
    }
    return cells;
}
/**
 * Splits the table cell horizontally.
 *
 * @internal
 * @returns Created table cell, if any were created.
 */ function splitHorizontally(tableCell, splitRow, writer) {
    const tableRow = tableCell.parent;
    const table = tableRow.parent;
    const rowIndex = tableRow.index;
    const rowspan = parseInt(tableCell.getAttribute('rowspan'));
    const newRowspan = splitRow - rowIndex;
    const newCellAttributes = {};
    const newCellRowSpan = rowspan - newRowspan;
    if (newCellRowSpan > 1) {
        newCellAttributes.rowspan = newCellRowSpan;
    }
    const colspan = parseInt(tableCell.getAttribute('colspan') || '1');
    if (colspan > 1) {
        newCellAttributes.colspan = colspan;
    }
    const startRow = rowIndex;
    const endRow = startRow + newRowspan;
    const tableMap = [
        ...new TableWalker(table, {
            startRow,
            endRow,
            includeAllSlots: true
        })
    ];
    let newCell = null;
    let columnIndex;
    for (const tableSlot of tableMap){
        const { row, column, cell } = tableSlot;
        if (cell === tableCell && columnIndex === undefined) {
            columnIndex = column;
        }
        if (columnIndex !== undefined && columnIndex === column && row === endRow) {
            newCell = createEmptyTableCell(writer, tableSlot.getPositionBefore(), newCellAttributes);
        }
    }
    // Update the rowspan attribute after updating table.
    updateNumericAttribute('rowspan', newRowspan, tableCell, writer);
    return newCell;
}
/**
 * Returns slot info of cells that starts before and overlaps a given column.
 *
 * In a table below, passing `overlapColumn = 3`
 *
 *    0   1   2   3   4
 *  ┌───────┬───────┬───┐
 *  │ a     │ b     │ c │
 *  │───┬───┴───────┼───┤
 *  │ d │ e         │ f │
 *  ├───┼───┬───────┴───┤
 *  │ g │ h │ i         │
 *  ├───┼───┼───┬───────┤
 *  │ j │ k │ l │ m     │
 *  ├───┼───┴───┼───┬───┤
 *  │ n │ o     │ p │ q │
 *  └───┴───────┴───┴───┘
 *                ^
 *                Overlap column to check
 *
 * will return slot info for cells: "b", "e", "i".
 *
 * @internal
 * @param table The table to check.
 * @param overlapColumn The index of the column to check.
 */ function getHorizontallyOverlappingCells(table, overlapColumn) {
    const cellsToSplit = [];
    const tableWalker = new TableWalker(table);
    for (const slotInfo of tableWalker){
        const { column, cellWidth } = slotInfo;
        const cellEndColumn = column + cellWidth - 1;
        if (column < overlapColumn && overlapColumn <= cellEndColumn) {
            cellsToSplit.push(slotInfo);
        }
    }
    return cellsToSplit;
}
/**
 * Splits the table cell vertically.
 *
 * @internal
 * @param columnIndex The table cell column index.
 * @param splitColumn The index of column to split cell on.
 * @returns Created table cell.
 */ function splitVertically(tableCell, columnIndex, splitColumn, writer) {
    const colspan = parseInt(tableCell.getAttribute('colspan'));
    const newColspan = splitColumn - columnIndex;
    const newCellAttributes = {};
    const newCellColSpan = colspan - newColspan;
    if (newCellColSpan > 1) {
        newCellAttributes.colspan = newCellColSpan;
    }
    const rowspan = parseInt(tableCell.getAttribute('rowspan') || '1');
    if (rowspan > 1) {
        newCellAttributes.rowspan = rowspan;
    }
    const newCell = createEmptyTableCell(writer, writer.createPositionAfter(tableCell), newCellAttributes);
    // Update the colspan attribute after updating table.
    updateNumericAttribute('colspan', newColspan, tableCell, writer);
    return newCell;
}
/**
 * Adjusts table cell dimensions to not exceed limit row and column.
 *
 * If table cell width (or height) covers a column (or row) that is after a limit column (or row)
 * this method will trim "colspan" (or "rowspan") attribute so the table cell will fit in a defined limits.
 *
 * @internal
 */ function trimTableCellIfNeeded(tableCell, cellRow, cellColumn, limitRow, limitColumn, writer) {
    const colspan = parseInt(tableCell.getAttribute('colspan') || '1');
    const rowspan = parseInt(tableCell.getAttribute('rowspan') || '1');
    const endColumn = cellColumn + colspan - 1;
    if (endColumn > limitColumn) {
        const trimmedSpan = limitColumn - cellColumn + 1;
        updateNumericAttribute('colspan', trimmedSpan, tableCell, writer, 1);
    }
    const endRow = cellRow + rowspan - 1;
    if (endRow > limitRow) {
        const trimmedSpan = limitRow - cellRow + 1;
        updateNumericAttribute('rowspan', trimmedSpan, tableCell, writer, 1);
    }
}
/**
 * Sets proper heading attributes to a cropped table.
 */ function addHeadingsToCroppedTable(croppedTable, sourceTable, startRow, startColumn, writer) {
    const headingRows = parseInt(sourceTable.getAttribute('headingRows') || '0');
    if (headingRows > 0) {
        const headingRowsInCrop = headingRows - startRow;
        updateNumericAttribute('headingRows', headingRowsInCrop, croppedTable, writer, 0);
    }
    const headingColumns = parseInt(sourceTable.getAttribute('headingColumns') || '0');
    if (headingColumns > 0) {
        const headingColumnsInCrop = headingColumns - startColumn;
        updateNumericAttribute('headingColumns', headingColumnsInCrop, croppedTable, writer, 0);
    }
}
/**
 * Removes columns that have no cells anchored.
 *
 * In table below:
 *
 *     +----+----+----+----+----+----+----+
 *     | 00 | 01      | 03 | 04      | 06 |
 *     +----+----+----+----+         +----+
 *     | 10 | 11      | 13 |         | 16 |
 *     +----+----+----+----+----+----+----+
 *     | 20 | 21      | 23 | 24      | 26 |
 *     +----+----+----+----+----+----+----+
 *                  ^--- empty ---^
 *
 * Will remove columns 2 and 5.
 *
 * **Note:** This is a low-level helper method for clearing invalid model state when doing table modifications.
 * To remove a column from a table use {@link module:table/tableutils~TableUtils#removeColumns `TableUtils.removeColumns()`}.
 *
 * @internal
 * @returns True if removed some columns.
 */ function removeEmptyColumns(table, tableUtils) {
    const width = tableUtils.getColumns(table);
    const columnsMap = new Array(width).fill(0);
    for (const { column } of new TableWalker(table)){
        columnsMap[column]++;
    }
    const emptyColumns = columnsMap.reduce((result, cellsCount, column)=>{
        return cellsCount ? result : [
            ...result,
            column
        ];
    }, []);
    if (emptyColumns.length > 0) {
        // Remove only last empty column because it will recurrently trigger removing empty rows.
        const emptyColumn = emptyColumns[emptyColumns.length - 1];
        // @if CK_DEBUG_TABLE // console.log( `Removing empty column: ${ emptyColumn }.` );
        tableUtils.removeColumns(table, {
            at: emptyColumn
        });
        return true;
    }
    return false;
}
/**
 * Removes rows that have no cells anchored.
 *
 * In table below:
 *
 *     +----+----+----+
 *     | 00 | 01 | 02 |
 *     +----+----+----+
 *     | 10 | 11 | 12 |
 *     +    +    +    +
 *     |    |    |    | <-- empty
 *     +----+----+----+
 *     | 30 | 31 | 32 |
 *     +----+----+----+
 *     | 40      | 42 |
 *     +         +    +
 *     |         |    | <-- empty
 *     +----+----+----+
 *     | 60 | 61 | 62 |
 *     +----+----+----+
 *
 * Will remove rows 2 and 5.
 *
 * **Note:** This is a low-level helper method for clearing invalid model state when doing table modifications.
 * To remove a row from a table use {@link module:table/tableutils~TableUtils#removeRows `TableUtils.removeRows()`}.
 *
 * @internal
 * @returns True if removed some rows.
 */ function removeEmptyRows(table, tableUtils) {
    const emptyRows = [];
    const tableRowCount = tableUtils.getRows(table);
    for(let rowIndex = 0; rowIndex < tableRowCount; rowIndex++){
        const tableRow = table.getChild(rowIndex);
        if (tableRow.isEmpty) {
            emptyRows.push(rowIndex);
        }
    }
    if (emptyRows.length > 0) {
        // Remove only last empty row because it will recurrently trigger removing empty columns.
        const emptyRow = emptyRows[emptyRows.length - 1];
        // @if CK_DEBUG_TABLE // console.log( `Removing empty row: ${ emptyRow }.` );
        tableUtils.removeRows(table, {
            at: emptyRow
        });
        return true;
    }
    return false;
}
/**
 * Removes rows and columns that have no cells anchored.
 *
 * In table below:
 *
 *     +----+----+----+----+
 *     | 00      | 02      |
 *     +----+----+         +
 *     | 10      |         |
 *     +----+----+----+----+
 *     | 20      | 22 | 23 |
 *     +         +    +    +
 *     |         |    |    | <-- empty row
 *     +----+----+----+----+
 *             ^--- empty column
 *
 * Will remove row 3 and column 1.
 *
 * **Note:** This is a low-level helper method for clearing invalid model state when doing table modifications.
 * To remove a rows from a table use {@link module:table/tableutils~TableUtils#removeRows `TableUtils.removeRows()`} and
 * {@link module:table/tableutils~TableUtils#removeColumns `TableUtils.removeColumns()`} to remove a column.
 *
 * @internal
 */ function removeEmptyRowsColumns(table, tableUtils) {
    const removedColumns = removeEmptyColumns(table, tableUtils);
    // If there was some columns removed then cleaning empty rows was already triggered.
    if (!removedColumns) {
        removeEmptyRows(table, tableUtils);
    }
}
/**
 * Returns adjusted last row index if selection covers part of a row with empty slots (spanned by other cells).
 * The `dimensions.lastRow` is equal to last row index but selection might be bigger.
 *
 * This happens *only* on rectangular selection so we analyze a case like this:
 *
 *        +---+---+---+---+
 *      0 | a | b | c | d |
 *        +   +   +---+---+
 *      1 |   | e | f | g |
 *        +   +---+   +---+
 *      2 |   | h |   | i | <- last row, each cell has rowspan = 2,
 *        +   +   +   +   +    so we need to return 3, not 2
 *      3 |   |   |   |   |
 *        +---+---+---+---+
 *
 * @internal
 * @returns Adjusted last row index.
 */ function adjustLastRowIndex(table, dimensions) {
    const lastRowMap = Array.from(new TableWalker(table, {
        startColumn: dimensions.firstColumn,
        endColumn: dimensions.lastColumn,
        row: dimensions.lastRow
    }));
    const everyCellHasSingleRowspan = lastRowMap.every(({ cellHeight })=>cellHeight === 1);
    // It is a "flat" row, so the last row index is OK.
    if (everyCellHasSingleRowspan) {
        return dimensions.lastRow;
    }
    // Otherwise get any cell's rowspan and adjust the last row index.
    const rowspanAdjustment = lastRowMap[0].cellHeight - 1;
    return dimensions.lastRow + rowspanAdjustment;
}
/**
 * Returns adjusted last column index if selection covers part of a column with empty slots (spanned by other cells).
 * The `dimensions.lastColumn` is equal to last column index but selection might be bigger.
 *
 * This happens *only* on rectangular selection so we analyze a case like this:
 *
 *       0   1   2   3
 *     +---+---+---+---+
 *     | a             |
 *     +---+---+---+---+
 *     | b | c | d     |
 *     +---+---+---+---+
 *     | e     | f     |
 *     +---+---+---+---+
 *     | g | h         |
 *     +---+---+---+---+
 *               ^
 *              last column, each cell has colspan = 2, so we need to return 3, not 2
 *
 * @internal
 * @returns Adjusted last column index.
 */ function adjustLastColumnIndex(table, dimensions) {
    const lastColumnMap = Array.from(new TableWalker(table, {
        startRow: dimensions.firstRow,
        endRow: dimensions.lastRow,
        column: dimensions.lastColumn
    }));
    const everyCellHasSingleColspan = lastColumnMap.every(({ cellWidth })=>cellWidth === 1);
    // It is a "flat" column, so the last column index is OK.
    if (everyCellHasSingleColspan) {
        return dimensions.lastColumn;
    }
    // Otherwise get any cell's colspan and adjust the last column index.
    const colspanAdjustment = lastColumnMap[0].cellWidth - 1;
    return dimensions.lastColumn + colspanAdjustment;
}
/**
 * Get view `<table>` element from the wrapper.
 */ function getViewTableFromWrapper(wrapperView) {
    for (const wrapperChild of wrapperView.getChildren()){
        if (wrapperChild.is('element', 'table')) {
            return wrapperChild;
        }
    }
}

/**
 * Returns a function that converts the table view representation:
 *
 * ```xml
 * <figure class="table"><table>...</table></figure>
 * ```
 *
 * to the model representation:
 *
 * ```xml
 * <table></table>
 * ```
 *
 * @internal
 */ function upcastTableFigure() {
    return (dispatcher)=>{
        dispatcher.on('element:figure', (evt, data, conversionApi)=>{
            // Do not convert if this is not a "table figure".
            if (!conversionApi.consumable.test(data.viewItem, {
                name: true,
                classes: 'table'
            })) {
                return;
            }
            // Find a table element inside the figure element.
            const viewTable = getViewTableFromWrapper(data.viewItem);
            // Do not convert if table element is absent or was already converted.
            if (!viewTable || !conversionApi.consumable.test(viewTable, {
                name: true
            })) {
                return;
            }
            // Consume the figure to prevent other converters from processing it again.
            conversionApi.consumable.consume(data.viewItem, {
                name: true,
                classes: 'table'
            });
            // Convert view table to model table.
            const conversionResult = conversionApi.convertItem(viewTable, data.modelCursor);
            // Get table element from conversion result.
            const modelTable = first(conversionResult.modelRange.getItems());
            // When table wasn't successfully converted then finish conversion.
            if (!modelTable || !modelTable.is('element', 'table')) {
                // Revert consumed figure so other features can convert it.
                conversionApi.consumable.revert(data.viewItem, {
                    name: true,
                    classes: 'table'
                });
                // If anyway some table content was converted, we have to pass the model range and cursor.
                if (conversionResult.modelRange && !conversionResult.modelRange.isCollapsed) {
                    data.modelRange = conversionResult.modelRange;
                    data.modelCursor = conversionResult.modelCursor;
                }
                return;
            }
            conversionApi.convertChildren(data.viewItem, conversionApi.writer.createPositionAt(modelTable, 'end'));
            conversionApi.updateConversionResult(modelTable, data);
        });
    };
}
/**
 * View table element to model table element conversion helper.
 *
 * This conversion helper converts the table element as well as table rows.
 *
 * @returns Conversion helper.
 * @internal
 */ function upcastTable() {
    return (dispatcher)=>{
        dispatcher.on('element:table', (evt, data, conversionApi)=>{
            const viewTable = data.viewItem;
            // When element was already consumed then skip it.
            if (!conversionApi.consumable.test(viewTable, {
                name: true
            })) {
                return;
            }
            const { rows, headingRows, headingColumns } = scanTable(viewTable);
            // Only set attributes if values is greater then 0.
            const attributes = {};
            if (headingColumns) {
                attributes.headingColumns = headingColumns;
            }
            if (headingRows) {
                attributes.headingRows = headingRows;
            }
            const table = conversionApi.writer.createElement('table', attributes);
            if (!conversionApi.safeInsert(table, data.modelCursor)) {
                return;
            }
            conversionApi.consumable.consume(viewTable, {
                name: true
            });
            // Upcast table rows in proper order (heading rows first).
            rows.forEach((row)=>conversionApi.convertItem(row, conversionApi.writer.createPositionAt(table, 'end')));
            // Convert everything else.
            conversionApi.convertChildren(viewTable, conversionApi.writer.createPositionAt(table, 'end'));
            // Create one row and one table cell for empty table.
            if (table.isEmpty) {
                const row = conversionApi.writer.createElement('tableRow');
                conversionApi.writer.insert(row, conversionApi.writer.createPositionAt(table, 'end'));
                createEmptyTableCell(conversionApi.writer, conversionApi.writer.createPositionAt(row, 'end'));
            }
            conversionApi.updateConversionResult(table, data);
        });
    };
}
/**
 * A conversion helper that skips empty <tr> elements from upcasting at the beginning of the table.
 *
 * An empty row is considered a table model error but when handling clipboard data there could be rows that contain only row-spanned cells
 * and empty TR-s are used to maintain the table structure (also {@link module:table/tablewalker~TableWalker} assumes that there are only
 * rows that have related `tableRow` elements).
 *
 * *Note:* Only the first empty rows are removed because they have no meaning and it solves the issue
 * of an improper table with all empty rows.
 *
 * @internal
 * @returns Conversion helper.
 */ function skipEmptyTableRow() {
    return (dispatcher)=>{
        dispatcher.on('element:tr', (evt, data)=>{
            if (data.viewItem.isEmpty && data.modelCursor.index == 0) {
                evt.stop();
            }
        }, {
            priority: 'high'
        });
    };
}
/**
 * A converter that ensures an empty paragraph is inserted in a table cell if no other content was converted.
 *
 * @internal
 * @returns Conversion helper.
 */ function ensureParagraphInTableCell(elementName) {
    return (dispatcher)=>{
        dispatcher.on(`element:${elementName}`, (evt, data, { writer })=>{
            // The default converter will create a model range on converted table cell.
            if (!data.modelRange) {
                return;
            }
            const tableCell = data.modelRange.start.nodeAfter;
            const modelCursor = writer.createPositionAt(tableCell, 0);
            // Ensure a paragraph in the model for empty table cells for converted table cells.
            if (data.viewItem.isEmpty) {
                writer.insertElement('paragraph', modelCursor);
                return;
            }
            const childNodes = Array.from(tableCell.getChildren());
            // In case there are only markers inside the table cell then move them to the paragraph.
            if (childNodes.every((node)=>node.is('element', '$marker'))) {
                const paragraph = writer.createElement('paragraph');
                writer.insert(paragraph, writer.createPositionAt(tableCell, 0));
                for (const node of childNodes){
                    writer.move(writer.createRangeOn(node), writer.createPositionAt(paragraph, 'end'));
                }
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * Scans table rows and extracts required metadata from the table:
 *
 * headingRows    - The number of rows that go as table headers.
 * headingColumns - The maximum number of row headings.
 * rows           - Sorted `<tr>` elements as they should go into the model - ie. if `<thead>` is inserted after `<tbody>` in the view.
 *
 * @param viewTable The view table element.
 * @returns The table metadata.
 */ function scanTable(viewTable) {
    let headingColumns = undefined;
    let shouldAccumulateHeadingRows = true;
    // The `<tbody>` and `<thead>` sections in the DOM do not have to be in order `<thead>` -> `<tbody>` and there might be more than one
    // of them.
    // As the model does not have these sections, rows from different sections must be sorted.
    // For example, below is a valid HTML table:
    //
    // <table>
    //   <tbody><tr><td>2</td></tr></tbody>
    //   <thead><tr><td>1</td></tr></thead>
    //   <tbody><tr><td>3</td></tr></tbody>
    // </table>
    //
    // But browsers will render rows in order as: 1 as the heading and 2 and 3 as the body.
    const headRows = [];
    const bodyRows = [];
    // Currently the editor does not support more then one <thead> section.
    // Only the first <thead> from the view will be used as a heading row and the others will be converted to body rows.
    let firstTheadElement;
    for (const tableChild of Array.from(viewTable.getChildren())){
        // Only `<thead>`, `<tbody>` & `<tfoot>` from allowed table children can have `<tr>`s.
        // The else is for future purposes (mainly `<caption>`).
        if (tableChild.name !== 'tbody' && tableChild.name !== 'thead' && tableChild.name !== 'tfoot') {
            continue;
        }
        // Save the first `<thead>` in the table as table header - all other ones will be converted to table body rows.
        if (tableChild.name === 'thead' && !firstTheadElement) {
            shouldAccumulateHeadingRows = true;
            firstTheadElement = tableChild;
        }
        // There might be some extra empty text nodes between the `<tr>`s.
        // Make sure further code operates on `tr`s only. (#145)
        const trs = Array.from(tableChild.getChildren()).filter((el)=>el.is('element', 'tr'));
        // Keep tracking of the previous row columns count to improve detection of heading rows.
        let maxPrevColumns = null;
        for (const tr of trs){
            const trColumns = Array.from(tr.getChildren()).filter((el)=>el.is('element', 'td') || el.is('element', 'th'));
            // This <tr> is a child of a first <thead> element.
            if (firstTheadElement && tableChild === firstTheadElement || tableChild.name === 'tbody' && trColumns.length > 0 && // These conditions handles the case when the first column is a <th> element and it's the only column in the row.
            // This case is problematic because it's not clear if this row should be a heading row or not, as it may be result
            // of the cell span from the previous row.
            // Issue: https://github.com/ckeditor/ckeditor5/issues/17556
            (maxPrevColumns === null || trColumns.length === maxPrevColumns) && trColumns.every((e)=>e.is('element', 'th')) && // If there is at least one "normal" table row between heading rows, then stop accumulating heading rows.
            shouldAccumulateHeadingRows) {
                headRows.push(tr);
                shouldAccumulateHeadingRows = true;
            } else {
                bodyRows.push(tr);
                shouldAccumulateHeadingRows = false;
            }
            // We use the maximum number of columns to avoid false positives when detecting
            // multiple rows with single column within `rowspan`. Without it the last row of `rowspan=3`
            // would be detected as a heading row because it has only one column (identical to the previous row).
            maxPrevColumns = Math.max(maxPrevColumns || 0, trColumns.length);
        }
    }
    // Generate the cell matrix so we can calculate the heading columns.
    const bodyMatrix = generateCellMatrix(bodyRows);
    for (const rowSlots of bodyMatrix){
        // Look for the first non-`<th>` entry (either a `<td>` or a missing cell).
        let index = 0;
        while(index < rowSlots.length){
            if (rowSlots[index]?.name !== 'th') {
                break;
            }
            index += 1;
        }
        // Update headingColumns.
        if (headingColumns === undefined || index < headingColumns) {
            headingColumns = index;
        }
    }
    return {
        headingRows: headRows.length,
        headingColumns: headingColumns || 0,
        rows: [
            ...headRows,
            ...bodyRows
        ]
    };
}
/**
 * Takes an array of `<tr>` elements and generates a "matrix" (square
 * two-dimensional array) describing which `<th>`s and `<td>`s fill which
 * "slots", factoring in `rowspan`s and `colspan`s. For example, given
 *
 * ```xml
 * <table>
 *   <tr> <td>11</td> <td rowspan="2">12-22</td> <td>13</td> </tr>
 *   <tr> <td>21</td> <td>23</td> </tr>
 *   <tr> <td colspan="2">31-32</td> <td>33</rd> </tr>
 * </table>
 * ```
 *
 * The result would be (with cell elements' text content in place of the element
 * objects for readability):
 *
 * ```js
 * [
 *   [ '11', '12-22', '13' ],
 *   [ '21', '12-22', '23' ],
 *   [ '31-32', '31-32', '33' ],
 * ]
 * ```
 *
 * This allows for a computation of heading columns that factors in the case
 * where a cell from a previous rows with a `rowspan` attribute effectively adds
 * an additional header cell to a subsequent row.
 *
 * There are also cases where cells are "missing" from a row. A simple one is
 * the case where a row simply has fewer cells than another row in the same
 * table. But another is one where a row has a cell with a `rowspan` that
 * effectively adds a cell to a subsequent row "off the end" of the row. In this
 * case, there will be a `null` value instead of an element object in that
 * position. For example,
 *
 * ```xml
 * <table>
 *   <tr> <td>11</td> <td>12</td> <td rowspan="2">13-23</td> </tr>
 *   <tr> <td>21</td> </tr>
 *   <tr> <td>31</td> </tr>
 * </table>
 * ```
 *
 * would result in
 *
 * ```js
 * [
 *   [ '11', '12', '13-23' ],
 *   [ '21', null, '13-23' ],
 *   [ '31', null, null ]
 * ]
 * ```
 *
 * @param trs the array of `<tr>` elements
 * @returns the cell matrix
 */ function generateCellMatrix(trs) {
    // As we iterate, we keep track of cells with rowspans >1 so later rows can
    // factor them in. This trackes any such cells from previous rows.
    let prevRowspans = new Map();
    // This is the maximum number of columns we've encountered.
    let maxColumns = 0;
    const slots = trs.map((tr)=>{
        // This will be the slots that are in this row, including cells from
        // previous rows with a big enough "rowspan" to affect this row.
        const curSlots = [];
        // Get the cell elements
        const children = Array.from(tr.getChildren()).filter((child)=>child.name === 'th' || child.name === 'td');
        // This will be any cells in this row that have a rowspan >1, so we can
        // combine it with `prevRowspans` when we're done processing this row.
        const curRowspans = new Map();
        // We need to process all the cells in this row, but also previous rows'
        // cells with rowspans might add additional slots to the end of this row, so
        // we need to iterate until we've both consumed all the children _and_
        // filled out slots to the max number of columns we've encountered so far.
        while(children.length || curSlots.length < maxColumns){
            const rowSpan = prevRowspans.get(curSlots.length);
            if (rowSpan && rowSpan.remaining > 0) {
                // We have a cell at this index in a previous row whose rowspan extends
                // it into this row, so we insert a copy of it here.
                curSlots.push(rowSpan.cell);
            } else {
                // See if we have more cells in the row.
                const cell = children.shift();
                if (cell) {
                    // We do, so process it
                    const colspan = parseInt(cell.getAttribute('colspan') || '1');
                    const rowspan = parseInt(cell.getAttribute('rowspan') || '1');
                    // Process this cell as many times as needed according to its colspan.
                    for(let i = 0; i < colspan; i++){
                        // if we have a >1 rowspan, create a record in the rowSpans map for
                        // this column index keeping track of it.
                        if (rowspan > 1) {
                            curRowspans.set(curSlots.length, {
                                cell,
                                remaining: rowspan - 1
                            });
                        }
                        curSlots.push(cell);
                    }
                } else {
                    // No remaining children in this row, so no cell in this slot.
                    curSlots.push(null);
                    continue;
                }
            }
        }
        // Now update the row spans. In weird edge cases where colspan and rowspan
        // conflict, we can end up with a cell in a column in this row that
        // "truncates" a row-spanning cell from a previous column, so make sure in
        // those cases, the value in `curRowspans` always "wins". We do this by
        // copying (and decrementing) values from `prevRowspans` into `curRowspans`
        // as long as there is no conflict, and then re-assigning `prevRowspans`.
        for (const [index, entry] of prevRowspans.entries()){
            entry.remaining -= 1;
            if (entry.remaining > 0 && !curRowspans.has(index)) {
                curRowspans.set(index, entry);
            }
        }
        prevRowspans = curRowspans;
        // Finally, update `maxColumns`.
        maxColumns = Math.max(maxColumns, curSlots.length);
        return curSlots;
    });
    // Now expand any rows that have fewer than `maxColumns` with nulls so we have
    // a proper matrix.
    for (const rowSlots of slots){
        while(rowSlots.length < maxColumns){
            rowSlots.push(null);
        }
    }
    return slots;
}

/**
 * Returns a string if all four values of box sides are equal.
 *
 * If a string is passed, it is treated as a single value (pass-through).
 *
 * ```ts
 * // Returns 'foo':
 * getSingleValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'foo' } );
 * getSingleValue( 'foo' );
 *
 * // Returns undefined:
 * getSingleValue( { top: 'foo', right: 'foo', bottom: 'bar', left: 'foo' } );
 * getSingleValue( { top: 'foo', right: 'foo' } );
 * ```
 *
 * @internal
 */ function getSingleValue(objectOrString) {
    if (!objectOrString || !isObject(objectOrString)) {
        return objectOrString;
    }
    const { top, right, bottom, left } = objectOrString;
    if (top == right && right == bottom && bottom == left) {
        return top;
    }
}
/**
 * Adds a unit to a value if the value is a number or a string representing a number.
 *
 * **Note**: It does nothing to non-numeric values.
 *
 * ```ts
 * getSingleValue( 25, 'px' ); // '25px'
 * getSingleValue( 25, 'em' ); // '25em'
 * getSingleValue( '25em', 'px' ); // '25em'
 * getSingleValue( 'foo', 'px' ); // 'foo'
 * ```
 *
 * @internal
 * @param defaultUnit A default unit added to a numeric value.
 */ function addDefaultUnitToNumericValue(value, defaultUnit) {
    const numericValue = parseFloat(value);
    if (Number.isNaN(numericValue)) {
        return value;
    }
    if (String(numericValue) !== String(value)) {
        return value;
    }
    return `${numericValue}${defaultUnit}`;
}
/**
 * Returns the normalized configuration.
 *
 * @internal
 * @param config The configuration to normalize.
 * @param options Options used to determine which properties should be added.
 */ function getNormalizedDefaultProperties(config, options = {}) {
    const normalizedConfig = {
        borderStyle: 'none',
        borderWidth: '',
        borderColor: '',
        backgroundColor: '',
        width: '',
        height: '',
        ...config
    };
    if (options.includeAlignmentProperty && !normalizedConfig.alignment) {
        normalizedConfig.alignment = 'center';
    }
    if (options.includePaddingProperty && !normalizedConfig.padding) {
        normalizedConfig.padding = '';
    }
    if (options.includeVerticalAlignmentProperty && !normalizedConfig.verticalAlignment) {
        normalizedConfig.verticalAlignment = 'middle';
    }
    if (options.includeHorizontalAlignmentProperty && !normalizedConfig.horizontalAlignment) {
        normalizedConfig.horizontalAlignment = options.isRightToLeftContent ? 'right' : 'left';
    }
    return normalizedConfig;
}
/**
 * Returns the normalized default table properties.
 *
 * @internal
 * @param config The configuration to normalize.
 * @param options Options used to determine which properties should be added.
 */ function getNormalizedDefaultTableProperties(config, options) {
    return getNormalizedDefaultProperties({
        // It adds support for border none in the table element, keep it in sync with the content styles
        // See more: https://github.com/ckeditor/ckeditor5/issues/6841#issuecomment-1959195608
        borderStyle: 'double',
        borderColor: 'hsl(0, 0%, 70%)',
        borderWidth: '1px',
        ...config
    }, options);
}
/**
 * Returns the normalized default cell properties.
 *
 * @internal
 * @param config The configuration to normalize.
 * @param options Options used to determine which properties should be added.
 */ function getNormalizedDefaultCellProperties(config, options) {
    return getNormalizedDefaultProperties({
        // It adds support for border none in the table element, keep it in sync with the content styles
        // See more: https://github.com/ckeditor/ckeditor5/issues/6841#issuecomment-1959195608
        borderStyle: 'solid',
        borderColor: 'hsl(0, 0%, 75%)',
        borderWidth: '1px',
        ...config
    }, options);
}

/**
 * Model table element to view table element conversion helper.
 *
 * @internal
 */ function downcastTable(tableUtils, options) {
    return (table, { writer })=>{
        const headingRows = table.getAttribute('headingRows') || 0;
        const tableElement = writer.createContainerElement('table', null, []);
        const figureElement = writer.createContainerElement('figure', {
            class: 'table'
        }, tableElement);
        // Table head slot.
        if (headingRows > 0) {
            writer.insert(writer.createPositionAt(tableElement, 'end'), writer.createContainerElement('thead', null, writer.createSlot((element)=>element.is('element', 'tableRow') && element.index < headingRows)));
        }
        // Table body slot.
        if (headingRows < tableUtils.getRows(table)) {
            writer.insert(writer.createPositionAt(tableElement, 'end'), writer.createContainerElement('tbody', null, writer.createSlot((element)=>element.is('element', 'tableRow') && element.index >= headingRows)));
        }
        // Dynamic slots.
        for (const { positionOffset, filter } of options.additionalSlots){
            writer.insert(writer.createPositionAt(tableElement, positionOffset), writer.createSlot(filter));
        }
        // Create a slot with items that don't fit into the table.
        writer.insert(writer.createPositionAt(tableElement, 'after'), writer.createSlot((element)=>{
            if (element.is('element', 'tableRow')) {
                return false;
            }
            return !options.additionalSlots.some(({ filter })=>filter(element));
        }));
        return options.asWidget ? toTableWidget(figureElement, writer) : figureElement;
    };
}
/**
 * Model table row element to view `<tr>` element conversion helper.
 *
 * @internal
 * @returns Element creator.
 */ function downcastRow() {
    return (tableRow, { writer })=>{
        return tableRow.isEmpty ? writer.createEmptyElement('tr') : writer.createContainerElement('tr');
    };
}
/**
 * Model table cell element to view `<td>` or `<th>` element conversion helper.
 *
 * This conversion helper will create proper `<th>` elements for table cells that are in the heading section (heading row or column)
 * and `<td>` otherwise.
 *
 * @internal
 * @param options.asWidget If set to `true`, the downcast conversion will produce a widget.
 * @param options.cellTypeEnabled If returns `true`, the downcast conversion will use the `tableCellType` attribute to determine cell type.
 * @returns Element creator.
 */ function downcastCell(options) {
    return (tableCell, { writer })=>{
        // If the table cell type feature is enabled, then we can simply check the cell type attribute.
        if (options.cellTypeEnabled?.()) {
            const cellElementName = tableCell.getAttribute('tableCellType') === 'header' ? 'th' : 'td';
            return createCellElement(writer, cellElementName);
        }
        // If the table cell type feature is not enabled, we should iterate through the table structure
        // to determine whether the cell is in the heading section.
        const tableRow = tableCell.parent;
        const table = tableRow.parent;
        const rowIndex = table.getChildIndex(tableRow);
        const tableWalker = new TableWalker(table, {
            row: rowIndex
        });
        const headingRows = table.getAttribute('headingRows') || 0;
        const headingColumns = table.getAttribute('headingColumns') || 0;
        let result = null;
        // We need to iterate over a table in order to get proper row & column values from a walker.
        for (const tableSlot of tableWalker){
            if (tableSlot.cell == tableCell) {
                const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;
                result = createCellElement(writer, isHeading ? 'th' : 'td');
                break;
            }
        }
        return result;
    };
    function createCellElement(writer, name) {
        return options.asWidget ? toWidgetEditable(writer.createEditableElement(name), writer, {
            withAriaRole: false
        }) : writer.createContainerElement(name);
    }
}
/**
 * Overrides paragraph inside table cell conversion.
 *
 * This converter:
 * * should be used to override default paragraph conversion.
 * * It will only convert `<paragraph>` placed directly inside `<tableCell>`.
 * * For a single paragraph without attributes it returns `<span>` to simulate data table.
 * * For all other cases it returns `<p>` element.
 *
 * @internal
 * @param options.asWidget If set to `true`, the downcast conversion will produce a widget.
 * @returns Element creator.
 */ function convertParagraphInTableCell(options = {}) {
    return (modelElement, { writer })=>{
        if (!modelElement.parent.is('element', 'tableCell')) {
            return null;
        }
        if (!isSingleParagraphWithoutAttributes(modelElement)) {
            return null;
        }
        if (options.asWidget) {
            return writer.createContainerElement('span', {
                class: 'ck-table-bogus-paragraph'
            });
        } else {
            // Using `<p>` in case there are some markers on it and transparentRendering will render it anyway.
            const viewElement = writer.createContainerElement('p');
            writer.setCustomProperty('dataPipeline:transparentRendering', true, viewElement);
            return viewElement;
        }
    };
}
/**
 * Checks if given model `<paragraph>` is an only child of a parent (`<tableCell>`) and if it has any attribute set.
 *
 * The paragraph should be converted in the editing view to:
 *
 * * If returned `true` - to a `<span class="ck-table-bogus-paragraph">`
 * * If returned `false` - to a `<p>`
 *
 * @internal
 */ function isSingleParagraphWithoutAttributes(modelElement) {
    const tableCell = modelElement.parent;
    const isSingleParagraph = tableCell.childCount == 1;
    return isSingleParagraph && !hasAnyAttribute(modelElement);
}
/**
 * Converts a given {@link module:engine/view/element~ViewElement} to a table widget:
 * * Adds a {@link module:engine/view/element~ViewElement#_setCustomProperty custom property}
 * allowing to recognize the table widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param writer An instance of the view writer.
 * @param label The element's label. It will be concatenated with the table `alt` attribute if one is present.
 */ function toTableWidget(viewElement, writer) {
    writer.setCustomProperty('table', true, viewElement);
    return toWidget(viewElement, writer, {
        hasSelectionHandle: true
    });
}
/**
 * Checks if an element has any attributes set.
 */ function hasAnyAttribute(element) {
    for (const attributeKey of element.getAttributeKeys()){
        // Ignore selection attributes stored on block elements.
        if (attributeKey.startsWith('selection:') || attributeKey == 'htmlEmptyBlock') {
            continue;
        }
        return true;
    }
    return false;
}
/**
 * Downcasts a plain table (also used in the clipboard pipeline).
 */ function convertPlainTable(editor) {
    return (table, conversionApi)=>{
        const hasPlainTableOutput = editor.plugins.has('PlainTableOutput');
        const isClipboardPipeline = conversionApi.options.isClipboardPipeline;
        const useExtendedAlignment = editor.config.get('experimentalFlags.useExtendedTableBlockAlignment');
        const stripFigureTagWithLayoutTable = shouldStripFigureTagWithLayoutTable(editor, table);
        if (hasPlainTableOutput || stripFigureTagWithLayoutTable || useExtendedAlignment && isClipboardPipeline) {
            return downcastPlainTable(table, conversionApi, editor);
        }
        return null;
    };
}
/**
 * Downcasts a plain table caption (also used in the clipboard pipeline).
 */ function convertPlainTableCaption(editor) {
    return (modelElement, { writer, options })=>{
        const hasPlainTableOutput = editor.plugins.has('PlainTableOutput');
        const isClipboardPipeline = options.isClipboardPipeline;
        const useExtendedAlignment = editor.config.get('experimentalFlags.useExtendedTableBlockAlignment');
        const stripFigureTagWithLayoutTable = shouldStripFigureTagWithLayoutTable(editor, modelElement);
        if (!(hasPlainTableOutput || stripFigureTagWithLayoutTable || useExtendedAlignment && isClipboardPipeline)) {
            return null;
        }
        if (modelElement.parent.name === 'table') {
            return writer.createContainerElement('caption');
        }
        return null;
    };
}
/**
 * Downcasts a plain table.
 *
 * @param table Table model element.
 * @param conversionApi The conversion API object.
 * @param editor The editor instance.
 * @returns Created element.
 */ function downcastPlainTable(table, conversionApi, editor) {
    const writer = conversionApi.writer;
    const headingRows = table.getAttribute('headingRows') || 0;
    // Table head rows slot.
    const headRowsSlot = writer.createSlot((element)=>element.is('element', 'tableRow') && element.index < headingRows);
    // Table body rows slot.
    const bodyRowsSlot = writer.createSlot((element)=>element.is('element', 'tableRow') && element.index >= headingRows);
    // Table children slot.
    const childrenSlot = writer.createSlot((element)=>!element.is('element', 'tableRow'));
    // Table <thead> element with all the heading rows.
    const theadElement = writer.createContainerElement('thead', null, headRowsSlot);
    // Table <tbody> element with all the body rows.
    const tbodyElement = writer.createContainerElement('tbody', null, bodyRowsSlot);
    // Table contents element containing <thead> and <tbody> when necessary.
    const tableContentElements = [];
    if (headingRows) {
        tableContentElements.push(theadElement);
    }
    if (headingRows < table.childCount) {
        tableContentElements.push(tbodyElement);
    }
    const tableAttributes = {
        class: 'table'
    };
    if (editor.plugins.has('TablePropertiesEditing') && conversionApi.options.isClipboardPipeline) {
        const defaultTableProperties = getNormalizedDefaultTableProperties(editor.config.get('table.tableProperties.defaultProperties'), {
            includeAlignmentProperty: true
        });
        const tableAlignment = table.getAttribute('tableAlignment');
        let localDefaultValue = defaultTableProperties.alignment;
        if (table.getAttribute('tableType') === 'layout') {
            localDefaultValue = '';
        }
        const tableAlignmentValue = tableAlignment || localDefaultValue;
        if (tableAlignmentValue) {
            tableAttributes.class += ' ' + downcastTableAlignmentConfig[tableAlignmentValue].className;
            tableAttributes.style = downcastTableAlignmentConfig[tableAlignmentValue].style;
            if (downcastTableAlignmentConfig[tableAlignmentValue].align !== undefined) {
                tableAttributes.align = downcastTableAlignmentConfig[tableAlignmentValue].align;
            }
        }
    }
    // Create table structure.
    //
    // <table>
    //    {children-slot-like-caption}
    //    <thead>
    //        {table-head-rows-slot}
    //    </thead>
    //    <tbody>
    //        {table-body-rows-slot}
    //    </tbody>
    // </table>
    return writer.createContainerElement('table', tableAttributes, [
        childrenSlot,
        ...tableContentElements
    ]);
}
/**
 * Registers border and background attributes converters for plain tables or when the clipboard pipeline is used.
 */ function downcastTableBorderAndBackgroundAttributes(editor) {
    const modelAttributes = {
        'border-width': 'tableBorderWidth',
        'border-color': 'tableBorderColor',
        'border-style': 'tableBorderStyle',
        'background-color': 'tableBackgroundColor'
    };
    for (const [styleName, modelAttribute] of Object.entries(modelAttributes)){
        editor.conversion.for('dataDowncast').add((dispatcher)=>{
            return dispatcher.on(`attribute:${modelAttribute}:table`, (evt, data, conversionApi)=>{
                const { item, attributeNewValue } = data;
                const { mapper, writer } = conversionApi;
                const hasPlainTableOutput = editor.plugins.has('PlainTableOutput');
                const isClipboardPipeline = conversionApi.options.isClipboardPipeline;
                const useExtendedAlignment = editor.config.get('experimentalFlags.useExtendedTableBlockAlignment');
                const stripFigureTagWithLayoutTable = shouldStripFigureTagWithLayoutTable(editor, item);
                if (!(hasPlainTableOutput || stripFigureTagWithLayoutTable || useExtendedAlignment && isClipboardPipeline)) {
                    return;
                }
                if (!conversionApi.consumable.consume(item, evt.name)) {
                    return;
                }
                const table = mapper.toViewElement(item);
                if (attributeNewValue) {
                    writer.setStyle(styleName, attributeNewValue, table);
                } else {
                    writer.removeStyle(styleName, table);
                }
            }, {
                priority: 'high'
            });
        });
    }
}
/**
 * Returns `true` if the figure tag should be stripped when using layout tables and when `tableType` is `layout`
 * or `stripFigureFromContentTable` option is set to `true`, `false` otherwise.
 *
 * @param editor The editor instance.
 * @param modelElement The model element to check.
 * @returns `true` if the figure tag should be stripped, `false` otherwise.
 */ function shouldStripFigureTagWithLayoutTable(editor, modelElement) {
    const hasTableLayout = editor.plugins.has('TableLayoutEditing');
    const stripFigureFromContentTable = editor.config.get('table.tableLayout.stripFigureFromContentTable') ?? true;
    const tableModelElement = modelElement.findAncestor('table', {
        includeSelf: true
    });
    const tableType = tableModelElement?.getAttribute('tableType');
    return hasTableLayout && (stripFigureFromContentTable || tableType === 'layout');
}

/**
 * The insert table command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTable'` editor command.
 *
 * To insert a table at the current selection, execute the command and specify the dimensions:
 *
 * ```ts
 * editor.execute( 'insertTable', { rows: 20, columns: 5 } );
 * ```
 */ class InsertTableCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const schema = model.schema;
        this.isEnabled = isAllowedInParent$1(selection, schema);
    }
    /**
	 * Executes the command.
	 *
	 * Inserts a table with the given number of rows and columns into the editor.
	 *
	 * @param options.rows The number of rows to create in the inserted table. Default value is 2.
	 * @param options.columns The number of columns to create in the inserted table. Default value is 2.
	 * @param options.headingRows The number of heading rows. If not provided it will default to
	 * {@link module:table/tableconfig~TableConfig#defaultHeadings `config.table.defaultHeadings.rows`} table config.
	 * @param options.headingColumns The number of heading columns. If not provided it will default to
	 * {@link module:table/tableconfig~TableConfig#defaultHeadings `config.table.defaultHeadings.columns`} table config.
	 * @fires execute
	 */ execute(options = {}) {
        const editor = this.editor;
        const model = editor.model;
        const tableUtils = editor.plugins.get('TableUtils');
        const defaultRows = editor.config.get('table.defaultHeadings.rows');
        const defaultColumns = editor.config.get('table.defaultHeadings.columns');
        if (options.headingRows === undefined && defaultRows) {
            options.headingRows = defaultRows;
        }
        if (options.headingColumns === undefined && defaultColumns) {
            options.headingColumns = defaultColumns;
        }
        model.change((writer)=>{
            const table = tableUtils.createTable(writer, options);
            model.insertObject(table, null, null, {
                findOptimalPosition: 'auto'
            });
            writer.setSelection(writer.createPositionAt(table.getNodeByPath([
                0,
                0,
                0
            ]), 0));
        });
    }
}
/**
 * Checks if the table is allowed in the parent.
 */ function isAllowedInParent$1(selection, schema) {
    const positionParent = selection.getFirstPosition().parent;
    const validParent = positionParent === positionParent.root ? positionParent : positionParent.parent;
    return schema.checkChild(validParent, 'table');
}

/**
 * The insert row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTableRowBelow'` and
 * `'insertTableRowAbove'` editor commands.
 *
 * To insert a row below the selected cell, execute the following command:
 *
 * ```ts
 * editor.execute( 'insertTableRowBelow' );
 * ```
 *
 * To insert a row above the selected cell, execute the following command:
 *
 * ```ts
 * editor.execute( 'insertTableRowAbove' );
 * ```
 */ class InsertRowCommand extends Command {
    /**
	 * The order of insertion relative to the row in which the caret is located.
	 */ order;
    /**
	 * Creates a new `InsertRowCommand` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 * @param options.order The order of insertion relative to the row in which the caret is located.
	 * Possible values: `"above"` and `"below"`. Default value is "below"
	 */ constructor(editor, options = {}){
        super(editor);
        this.order = options.order || 'below';
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const selection = this.editor.model.document.selection;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const isAnyCellSelected = !!tableUtils.getSelectionAffectedTableCells(selection).length;
        this.isEnabled = isAnyCellSelected;
    }
    /**
	 * Executes the command.
	 *
	 * Depending on the command's {@link #order} value, it inserts a row `'below'` or `'above'` the row in which selection is set.
	 *
	 * @fires execute
	 */ execute() {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const tableUtils = editor.plugins.get('TableUtils');
        const insertAbove = this.order === 'above';
        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const rowIndexes = tableUtils.getRowIndexes(affectedTableCells);
        const row = insertAbove ? rowIndexes.first : rowIndexes.last;
        const table = affectedTableCells[0].findAncestor('table');
        tableUtils.insertRows(table, {
            at: insertAbove ? row : row + 1,
            copyStructureFromAbove: !insertAbove
        });
    }
}

/**
 * The insert column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'insertTableColumnLeft'` and
 * `'insertTableColumnRight'` editor commands.
 *
 * To insert a column to the left of the selected cell, execute the following command:
 *
 * ```ts
 * editor.execute( 'insertTableColumnLeft' );
 * ```
 *
 * To insert a column to the right of the selected cell, execute the following command:
 *
 * ```ts
 * editor.execute( 'insertTableColumnRight' );
 * ```
 */ class InsertColumnCommand extends Command {
    /**
	 * The order of insertion relative to the column in which the caret is located.
	 */ order;
    /**
	 * Creates a new `InsertColumnCommand` instance.
	 *
	 * @param editor An editor on which this command will be used.
	 * @param options.order The order of insertion relative to the column in which the caret is located.
	 * Possible values: `"left"` and `"right"`. Default value is "right".
	 */ constructor(editor, options = {}){
        super(editor);
        this.order = options.order || 'right';
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const selection = this.editor.model.document.selection;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const isAnyCellSelected = !!tableUtils.getSelectionAffectedTableCells(selection).length;
        this.isEnabled = isAnyCellSelected;
    }
    /**
	 * Executes the command.
	 *
	 * Depending on the command's {@link #order} value, it inserts a column to the `'left'` or `'right'` of the column
	 * in which the selection is set.
	 *
	 * @fires execute
	 */ execute() {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const tableUtils = editor.plugins.get('TableUtils');
        const insertBefore = this.order === 'left';
        const affectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const columnIndexes = tableUtils.getColumnIndexes(affectedTableCells);
        const column = insertBefore ? columnIndexes.first : columnIndexes.last;
        const table = affectedTableCells[0].findAncestor('table');
        tableUtils.insertColumns(table, {
            columns: 1,
            at: insertBefore ? column : column + 1
        });
    }
}

/**
 * The split cell command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'splitTableCellVertically'`
 * and `'splitTableCellHorizontally'`  editor commands.
 *
 * You can split any cell vertically or horizontally by executing this command. For example, to split the selected table cell vertically:
 *
 * ```ts
 * editor.execute( 'splitTableCellVertically' );
 * ```
 */ class SplitCellCommand extends Command {
    /**
	 * The direction that indicates which cell will be split.
	 */ direction;
    /**
	 * Creates a new `SplitCellCommand` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 * @param options.direction Indicates whether the command should split cells `'horizontally'` or `'vertically'`.
	 */ constructor(editor, options = {}){
        super(editor);
        this.direction = options.direction || 'horizontally';
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const selectedCells = tableUtils.getSelectionAffectedTableCells(this.editor.model.document.selection);
        this.isEnabled = selectedCells.length === 1;
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const tableCell = tableUtils.getSelectionAffectedTableCells(this.editor.model.document.selection)[0];
        const isHorizontal = this.direction === 'horizontally';
        if (isHorizontal) {
            tableUtils.splitCellHorizontally(tableCell, 2);
        } else {
            tableUtils.splitCellVertically(tableCell, 2);
        }
    }
}

/**
 * The merge cell command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'mergeTableCellRight'`, `'mergeTableCellLeft'`,
 * `'mergeTableCellUp'` and `'mergeTableCellDown'` editor commands.
 *
 * To merge a table cell at the current selection with another cell, execute the command corresponding with the preferred direction.
 *
 * For example, to merge with a cell to the right:
 *
 * ```ts
 * editor.execute( 'mergeTableCellRight' );
 * ```
 *
 * **Note**: If a table cell has a different [`rowspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-rowspan)
 * (for `'mergeTableCellRight'` and `'mergeTableCellLeft'`) or [`colspan`](https://www.w3.org/TR/html50/tabular-data.html#attr-tdth-colspan)
 * (for `'mergeTableCellUp'` and `'mergeTableCellDown'`), the command will be disabled.
 */ class MergeCellCommand extends Command {
    /**
	 * The direction that indicates which cell will be merged with the currently selected one.
	 */ direction;
    /**
	 * Whether the merge is horizontal (left/right) or vertical (up/down).
	 */ isHorizontal;
    /**
	 * Creates a new `MergeCellCommand` instance.
	 *
	 * @param editor The editor on which this command will be used.
	 * @param options.direction Indicates which cell to merge with the currently selected one.
	 * Possible values are: `'left'`, `'right'`, `'up'` and `'down'`.
	 */ constructor(editor, options){
        super(editor);
        this.direction = options.direction;
        this.isHorizontal = this.direction == 'right' || this.direction == 'left';
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const cellToMerge = this._getMergeableCell();
        this.value = cellToMerge;
        this.isEnabled = !!cellToMerge;
    }
    /**
	 * Executes the command.
	 *
	 * Depending on the command's {@link #direction} value, it will merge the cell that is to the `'left'`, `'right'`, `'up'` or `'down'`.
	 *
	 * @fires execute
	 */ execute() {
        const model = this.editor.model;
        const doc = model.document;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const tableCell = tableUtils.getTableCellsContainingSelection(doc.selection)[0];
        const cellToMerge = this.value;
        const direction = this.direction;
        model.change((writer)=>{
            const isMergeNext = direction == 'right' || direction == 'down';
            // The merge mechanism is always the same so sort cells to be merged.
            const cellToExpand = isMergeNext ? tableCell : cellToMerge;
            const cellToRemove = isMergeNext ? cellToMerge : tableCell;
            // Cache the parent of cell to remove for later check.
            const removedTableCellRow = cellToRemove.parent;
            mergeTableCells$1(cellToRemove, cellToExpand, writer);
            const spanAttribute = this.isHorizontal ? 'colspan' : 'rowspan';
            const cellSpan = parseInt(tableCell.getAttribute(spanAttribute) || '1');
            const cellToMergeSpan = parseInt(cellToMerge.getAttribute(spanAttribute) || '1');
            // Update table cell span attribute and merge set selection on merged contents.
            writer.setAttribute(spanAttribute, cellSpan + cellToMergeSpan, cellToExpand);
            writer.setSelection(writer.createRangeIn(cellToExpand));
            const tableUtils = this.editor.plugins.get('TableUtils');
            const table = removedTableCellRow.findAncestor('table');
            // Remove empty rows and columns after merging.
            removeEmptyRowsColumns(table, tableUtils);
        });
    }
    /**
	 * Returns a cell that can be merged with the current cell depending on the command's direction.
	 */ _getMergeableCell() {
        const model = this.editor.model;
        const doc = model.document;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const tableCell = tableUtils.getTableCellsContainingSelection(doc.selection)[0];
        if (!tableCell) {
            return;
        }
        // First get the cell on proper direction.
        const cellToMerge = this.isHorizontal ? getHorizontalCell(tableCell, this.direction, tableUtils) : getVerticalCell(tableCell, this.direction, tableUtils);
        if (!cellToMerge) {
            return;
        }
        // If found check if the span perpendicular to merge direction is equal on both cells.
        const spanAttribute = this.isHorizontal ? 'rowspan' : 'colspan';
        const span = parseInt(tableCell.getAttribute(spanAttribute) || '1');
        const cellToMergeSpan = parseInt(cellToMerge.getAttribute(spanAttribute) || '1');
        if (cellToMergeSpan === span) {
            return cellToMerge;
        }
    }
}
/**
 * Returns the cell that can be merged horizontally.
 */ function getHorizontalCell(tableCell, direction, tableUtils) {
    const tableRow = tableCell.parent;
    const table = tableRow.parent;
    const horizontalCell = direction == 'right' ? tableCell.nextSibling : tableCell.previousSibling;
    const hasHeadingColumns = (table.getAttribute('headingColumns') || 0) > 0;
    if (!horizontalCell) {
        return;
    }
    // Sort cells:
    const cellOnLeft = direction == 'right' ? tableCell : horizontalCell;
    const cellOnRight = direction == 'right' ? horizontalCell : tableCell;
    // Get their column indexes:
    const { column: leftCellColumn } = tableUtils.getCellLocation(cellOnLeft);
    const { column: rightCellColumn } = tableUtils.getCellLocation(cellOnRight);
    const leftCellSpan = parseInt(cellOnLeft.getAttribute('colspan') || '1');
    const isCellOnLeftInHeadingColumn = isHeadingColumnCell(tableUtils, cellOnLeft);
    const isCellOnRightInHeadingColumn = isHeadingColumnCell(tableUtils, cellOnRight);
    // We cannot merge heading columns cells with regular cells.
    if (hasHeadingColumns && isCellOnLeftInHeadingColumn != isCellOnRightInHeadingColumn) {
        return;
    }
    // The cell on the right must have index that is distant to the cell on the left by the left cell's width (colspan).
    const cellsAreTouching = leftCellColumn + leftCellSpan === rightCellColumn;
    // If the right cell's column index is different it means that there are rowspanned cells between them.
    return cellsAreTouching ? horizontalCell : undefined;
}
/**
 * Returns the cell that can be merged vertically.
 */ function getVerticalCell(tableCell, direction, tableUtils) {
    const tableRow = tableCell.parent;
    const table = tableRow.parent;
    const rowIndex = table.getChildIndex(tableRow);
    // Don't search for mergeable cell if direction points out of the table.
    if (direction == 'down' && rowIndex === tableUtils.getRows(table) - 1 || direction == 'up' && rowIndex === 0) {
        return null;
    }
    const rowspan = parseInt(tableCell.getAttribute('rowspan') || '1');
    const headingRows = table.getAttribute('headingRows') || 0;
    const isMergeWithBodyCell = direction == 'down' && rowIndex + rowspan === headingRows;
    const isMergeWithHeadCell = direction == 'up' && rowIndex === headingRows;
    // Don't search for mergeable cell if direction points out of the current table section.
    if (headingRows && (isMergeWithBodyCell || isMergeWithHeadCell)) {
        return null;
    }
    const currentCellRowSpan = parseInt(tableCell.getAttribute('rowspan') || '1');
    const rowOfCellToMerge = direction == 'down' ? rowIndex + currentCellRowSpan : rowIndex;
    const tableMap = [
        ...new TableWalker(table, {
            endRow: rowOfCellToMerge
        })
    ];
    const currentCellData = tableMap.find((value)=>value.cell === tableCell);
    const mergeColumn = currentCellData.column;
    const cellToMergeData = tableMap.find(({ row, cellHeight, column })=>{
        if (column !== mergeColumn) {
            return false;
        }
        if (direction == 'down') {
            // If merging a cell below the mergeRow is already calculated.
            return row === rowOfCellToMerge;
        } else {
            // If merging a cell above calculate if it spans to mergeRow.
            return rowOfCellToMerge === row + cellHeight;
        }
    });
    return cellToMergeData && cellToMergeData.cell ? cellToMergeData.cell : null;
}
/**
 * Merges two table cells. It will ensure that after merging cells with an empty paragraph, the resulting table cell will only have one
 * paragraph. If one of the merged table cells is empty, the merged table cell will have the contents of the non-empty table cell.
 * If both are empty, the merged table cell will have only one empty paragraph.
 */ function mergeTableCells$1(cellToRemove, cellToExpand, writer) {
    if (!isEmpty$2(cellToRemove)) {
        if (isEmpty$2(cellToExpand)) {
            writer.remove(writer.createRangeIn(cellToExpand));
        }
        writer.move(writer.createRangeIn(cellToRemove), writer.createPositionAt(cellToExpand, 'end'));
    }
    // Remove merged table cell.
    writer.remove(cellToRemove);
}
/**
 * Checks if the passed table cell contains an empty paragraph.
 */ function isEmpty$2(tableCell) {
    const firstTableChild = tableCell.getChild(0);
    return tableCell.childCount == 1 && firstTableChild.is('element', 'paragraph') && firstTableChild.isEmpty;
}

/**
 * The remove row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'removeTableRow'` editor command.
 *
 * To remove the row containing the selected cell, execute the command:
 *
 * ```ts
 * editor.execute( 'removeTableRow' );
 * ```
 */ class RemoveRowCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const selectedCells = tableUtils.getSelectionAffectedTableCells(this.editor.model.document.selection);
        const firstCell = selectedCells[0];
        if (firstCell) {
            const table = firstCell.findAncestor('table');
            const tableRowCount = tableUtils.getRows(table);
            const lastRowIndex = tableRowCount - 1;
            const selectedRowIndexes = tableUtils.getRowIndexes(selectedCells);
            const areAllRowsSelected = selectedRowIndexes.first === 0 && selectedRowIndexes.last === lastRowIndex;
            // Disallow selecting whole table -> delete whole table should be used instead.
            this.isEnabled = !areAllRowsSelected;
        } else {
            this.isEnabled = false;
        }
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const model = this.editor.model;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const referenceCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        const removedRowIndexes = tableUtils.getRowIndexes(referenceCells);
        const firstCell = referenceCells[0];
        const table = firstCell.findAncestor('table');
        const columnIndexToFocus = tableUtils.getCellLocation(firstCell).column;
        model.change((writer)=>{
            const rowsToRemove = removedRowIndexes.last - removedRowIndexes.first + 1;
            tableUtils.removeRows(table, {
                at: removedRowIndexes.first,
                rows: rowsToRemove
            });
            const cellToFocus = getCellToFocus$1(table, removedRowIndexes.first, columnIndexToFocus, tableUtils.getRows(table));
            writer.setSelection(writer.createPositionAt(cellToFocus, 0));
        });
    }
}
/**
 * Returns a cell that should be focused before removing the row, belonging to the same column as the currently focused cell.
 * - If the row was not the last one, the cell to focus will be in the row that followed it (before removal).
 * - If the row was the last one, the cell to focus will be in the row that preceded it (before removal).
 */ function getCellToFocus$1(table, removedRowIndex, columnToFocus, tableRowCount) {
    // Don't go beyond last row's index.
    const row = table.getChild(Math.min(removedRowIndex, tableRowCount - 1));
    // Default to first table cell.
    let cellToFocus = row.getChild(0);
    let column = 0;
    for (const tableCell of row.getChildren()){
        if (column > columnToFocus) {
            return cellToFocus;
        }
        cellToFocus = tableCell;
        column += parseInt(tableCell.getAttribute('colspan') || '1');
    }
    return cellToFocus;
}

/**
 * The remove column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'removeTableColumn'` editor command.
 *
 * To remove the column containing the selected cell, execute the command:
 *
 * ```ts
 * editor.execute( 'removeTableColumn' );
 * ```
 */ class RemoveColumnCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const selectedCells = tableUtils.getSelectionAffectedTableCells(this.editor.model.document.selection);
        const firstCell = selectedCells[0];
        if (firstCell) {
            const table = firstCell.findAncestor('table');
            const tableColumnCount = tableUtils.getColumns(table);
            const { first, last } = tableUtils.getColumnIndexes(selectedCells);
            this.isEnabled = last - first < tableColumnCount - 1;
        } else {
            this.isEnabled = false;
        }
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const [firstCell, lastCell] = getBoundaryCells(this.editor.model.document.selection, tableUtils);
        const table = firstCell.parent.parent;
        // Cache the table before removing or updating colspans.
        const tableMap = [
            ...new TableWalker(table)
        ];
        // Store column indexes of removed columns.
        const removedColumnIndexes = {
            first: tableMap.find((value)=>value.cell === firstCell).column,
            last: tableMap.find((value)=>value.cell === lastCell).column
        };
        const cellToFocus = getCellToFocus(tableMap, firstCell, lastCell, removedColumnIndexes);
        this.editor.model.change((writer)=>{
            const columnsToRemove = removedColumnIndexes.last - removedColumnIndexes.first + 1;
            tableUtils.removeColumns(table, {
                at: removedColumnIndexes.first,
                columns: columnsToRemove
            });
            writer.setSelection(writer.createPositionAt(cellToFocus, 0));
        });
    }
}
/**
 * Returns a proper table cell to focus after removing a column.
 * - selection is on last table cell it will return previous cell.
 */ function getCellToFocus(tableMap, firstCell, lastCell, removedColumnIndexes) {
    const colspan = parseInt(lastCell.getAttribute('colspan') || '1');
    // If the table cell is spanned over 2+ columns - it will be truncated so the selection should
    // stay in that cell.
    if (colspan > 1) {
        return lastCell;
    } else if (firstCell.previousSibling || lastCell.nextSibling) {
        return lastCell.nextSibling || firstCell.previousSibling;
    } else {
        // Look for any cell in a column that precedes the first removed column.
        if (removedColumnIndexes.first) {
            return tableMap.reverse().find(({ column })=>{
                return column < removedColumnIndexes.first;
            }).cell;
        } else {
            return tableMap.reverse().find(({ column })=>{
                return column > removedColumnIndexes.last;
            }).cell;
        }
    }
}
/**
 * Returns helper object returning the first and the last cell contained in given selection, based on DOM order.
 */ function getBoundaryCells(selection, tableUtils) {
    const referenceCells = tableUtils.getSelectionAffectedTableCells(selection);
    const firstCell = referenceCells[0];
    const lastCell = referenceCells.pop();
    const returnValue = [
        firstCell,
        lastCell
    ];
    return firstCell.isBefore(lastCell) ? returnValue : returnValue.reverse();
}

/**
 * The header row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableColumnHeader'` editor command.
 *
 * You can make the row containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element) by executing:
 *
 * ```ts
 * editor.execute( 'setTableRowHeader' );
 * ```
 *
 * **Note:** All preceding rows will also become headers. If the current row is already a header, executing this command
 * will make it a regular row back again (including the following rows).
 */ class SetHeaderRowCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const model = this.editor.model;
        const selectedCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        if (selectedCells.length === 0) {
            this.isEnabled = false;
            this.value = false;
            return;
        }
        const table = selectedCells[0].findAncestor('table');
        this.isEnabled = model.schema.checkAttribute(table, 'headingRows');
        this.value = selectedCells.every((cell)=>this._isInHeading(cell, cell.parent.parent));
    }
    /**
	 * Executes the command.
	 *
	 * When the selection is in a non-header row, the command will set the `headingRows` table attribute to cover that row.
	 *
	 * When the selection is already in a header row, it will set `headingRows` so the heading section will end before that row.
	 *
	 * @fires execute
	 * @param options.forceValue If set, the command will set (`true`) or unset (`false`) the header rows according to
	 * the `forceValue` parameter instead of the current model state.
	 */ execute(options = {}) {
        if (options.forceValue === this.value) {
            return;
        }
        const tableUtils = this.editor.plugins.get('TableUtils');
        const model = this.editor.model;
        const selectedCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        const table = selectedCells[0].findAncestor('table');
        const { first, last } = tableUtils.getRowIndexes(selectedCells);
        const headingRowsToSet = this.value ? first : last + 1;
        const currentHeadingRows = table.getAttribute('headingRows') || 0;
        model.change((writer)=>{
            if (headingRowsToSet) {
                // Changing heading rows requires to check if any of a heading cell is overlapping vertically the table head.
                // Any table cell that has a rowspan attribute > 1 will not exceed the table head so we need to fix it in rows below.
                const startRow = headingRowsToSet > currentHeadingRows ? currentHeadingRows : 0;
                const overlappingCells = getVerticallyOverlappingCells(table, headingRowsToSet, startRow);
                for (const { cell } of overlappingCells){
                    splitHorizontally(cell, headingRowsToSet, writer);
                }
            }
            tableUtils.setHeadingRowsCount(writer, table, headingRowsToSet);
        });
    }
    /**
	 * Checks if a table cell is in the heading section.
	 */ _isInHeading(tableCell, table) {
        const headingRows = parseInt(table.getAttribute('headingRows') || '0');
        return !!headingRows && tableCell.parent.index < headingRows;
    }
}

/**
 * The header column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'setTableColumnHeader'` editor command.
 *
 * You can make the column containing the selected cell a [header](https://www.w3.org/TR/html50/tabular-data.html#the-th-element)
 * by executing:
 *
 * ```ts
 * editor.execute( 'setTableColumnHeader' );
 * ```
 *
 * **Note:** All preceding columns will also become headers. If the current column is already a header, executing this command
 * will make it a regular column back again (including the following columns).
 */ class SetHeaderColumnCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const model = this.editor.model;
        const selectedCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        if (selectedCells.length === 0) {
            this.isEnabled = false;
            this.value = false;
            return;
        }
        const table = selectedCells[0].findAncestor('table');
        this.isEnabled = model.schema.checkAttribute(table, 'headingColumns');
        this.value = selectedCells.every((cell)=>isHeadingColumnCell(tableUtils, cell));
    }
    /**
	 * Executes the command.
	 *
	 * When the selection is in a non-header column, the command will set the `headingColumns` table attribute to cover that column.
	 *
	 * When the selection is already in a header column, it will set `headingColumns` so the heading section will end before that column.
	 *
	 * @fires execute
	 * @param options.forceValue If set, the command will set (`true`) or unset (`false`) the header columns according to
	 * the `forceValue` parameter instead of the current model state.
	 */ execute(options = {}) {
        if (options.forceValue === this.value) {
            return;
        }
        const tableUtils = this.editor.plugins.get('TableUtils');
        const model = this.editor.model;
        const selectedCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        const table = selectedCells[0].findAncestor('table');
        const { first, last } = tableUtils.getColumnIndexes(selectedCells);
        const headingColumnsToSet = this.value ? first : last + 1;
        model.change((writer)=>{
            if (headingColumnsToSet) {
                // Changing heading columns requires to check if any of a heading cell is overlapping horizontally the table head.
                // Any table cell that has a colspan attribute > 1 will not exceed the table head so we need to fix it in columns before.
                const overlappingCells = getHorizontallyOverlappingCells(table, headingColumnsToSet);
                for (const { cell, column } of overlappingCells){
                    splitVertically(cell, column, headingColumnsToSet, writer);
                }
            }
            tableUtils.setHeadingColumnsCount(writer, table, headingColumnsToSet);
        });
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module table/tablecolumnresize/constants
 */ /**
 * The minimum column width given as a percentage value. Used in situations when the table is not yet rendered, so it is impossible to
 * calculate how many percentage of the table width would be {@link ~COLUMN_MIN_WIDTH_IN_PIXELS minimum column width in pixels}.
 *
 * @internal
 */ const COLUMN_MIN_WIDTH_AS_PERCENTAGE = 5;
/**
 * The minimum column width in pixels when the maximum table width is known.
 * This value is an equivalent of `10%` of the default editor width (600px).
 *
 * @internal
 */ const COLUMN_MIN_WIDTH_IN_PIXELS = 40;
/**
 * Determines how many digits after the decimal point are used to store the column width as a percentage value.
 *
 * @internal
 */ const COLUMN_WIDTH_PRECISION = 2;
/**
 * The distance in pixels that the mouse has to move to start resizing the column.
 *
 * @internal
 */ const COLUMN_RESIZE_DISTANCE_THRESHOLD = 3;

/**
 * Returns all the inserted or changed table model elements in a given change set. Only the tables
 * with 'columnsWidth' attribute are taken into account. The returned set may be empty.
 *
 * Most notably if an entire table is removed it will not be included in returned set.
 *
 * @internal
 * @param model The model to collect the affected elements from.
 * @returns A set of table model elements.
 */ function getChangedResizedTables(model) {
    const affectedTables = new Set();
    for (const change of model.document.differ.getChanges()){
        let referencePosition = null;
        // Checks if the particular change from the differ is:
        // - an insertion or removal of a table, a row or a cell,
        // - an attribute change on a table, a row or a cell.
        switch(change.type){
            case 'insert':
                referencePosition = [
                    'table',
                    'tableRow',
                    'tableCell'
                ].includes(change.name) ? change.position : null;
                break;
            case 'remove':
                // If the whole table is removed, there's no need to update its column widths (#12201).
                referencePosition = [
                    'tableRow',
                    'tableCell'
                ].includes(change.name) ? change.position : null;
                break;
            case 'attribute':
                if (change.range.start.nodeAfter) {
                    referencePosition = [
                        'table',
                        'tableRow',
                        'tableCell'
                    ].includes(change.range.start.nodeAfter.name) ? change.range.start : null;
                }
                break;
        }
        if (!referencePosition) {
            continue;
        }
        const tableNode = referencePosition.nodeAfter && referencePosition.nodeAfter.is('element', 'table') ? referencePosition.nodeAfter : referencePosition.findAncestor('table');
        // We iterate over the whole table looking for the nested tables that are also affected.
        for (const node of model.createRangeOn(tableNode).getItems()){
            if (!node.is('element', 'table')) {
                continue;
            }
            if (!getColumnGroupElement(node)) {
                continue;
            }
            affectedTables.add(node);
        }
    }
    return affectedTables;
}
/**
 * Calculates the percentage of the minimum column width given in pixels for a given table.
 *
 * @internal
 * @param modelTable A table model element.
 * @param editor The editor instance.
 * @returns The minimal column width in percentage.
 */ function getColumnMinWidthAsPercentage(modelTable, editor) {
    return COLUMN_MIN_WIDTH_IN_PIXELS * 100 / getTableWidthInPixels(modelTable, editor);
}
/**
 * Calculates the table width in pixels.
 *
 * @internal
 * @param modelTable A table model element.
 * @param editor The editor instance.
 * @returns The width of the table in pixels.
 */ function getTableWidthInPixels(modelTable, editor) {
    // It is possible for a table to not have a <tbody> element - see #11878.
    const referenceElement = getChildrenViewElement(modelTable, 'tbody', editor) || getChildrenViewElement(modelTable, 'thead', editor);
    const domReferenceElement = editor.editing.view.domConverter.mapViewToDom(referenceElement);
    return getElementWidthInPixels(domReferenceElement);
}
/**
 * Returns the a view element with a given name that is nested directly in a `<table>` element
 * related to a given `modelTable`.
 *
 * @param elementName Name of a view to be looked for, e.g. `'colgroup`', `'thead`'.
 * @returns Matched view or `undefined` otherwise.
 */ function getChildrenViewElement(modelTable, elementName, editor) {
    const viewFigure = editor.editing.mapper.toViewElement(modelTable);
    const viewTable = [
        ...viewFigure.getChildren()
    ].find((node)=>node.is('element', 'table'));
    return [
        ...viewTable.getChildren()
    ].find((node)=>node.is('element', elementName));
}
/**
 * Returns the computed width (in pixels) of the DOM element without padding and borders.
 *
 * @internal
 * @param domElement A DOM element.
 * @returns The width of the DOM element in pixels.
 */ function getElementWidthInPixels(domElement) {
    const styles = global.window.getComputedStyle(domElement);
    // In the 'border-box' box sizing algorithm, the element's width
    // already includes the padding and border width (#12335).
    if (styles.boxSizing === 'border-box') {
        return parseFloat(styles.width) - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight) - parseFloat(styles.borderLeftWidth) - parseFloat(styles.borderRightWidth);
    } else {
        return parseFloat(styles.width);
    }
}
/**
 * Returns the column indexes on the left and right edges of a cell. They differ if the cell spans
 * across multiple columns.
 *
 * @internal
 * @param cell A table cell model element.
 * @param tableUtils The Table Utils plugin instance.
 * @returns An object containing the indexes of the left and right edges of the cell.
 */ function getColumnEdgesIndexes(cell, tableUtils) {
    const cellColumnIndex = tableUtils.getCellLocation(cell).column;
    const cellWidth = cell.getAttribute('colspan') || 1;
    return {
        leftEdge: cellColumnIndex,
        rightEdge: cellColumnIndex + cellWidth - 1
    };
}
/**
 * Rounds the provided value to a fixed-point number with defined number of digits after the decimal point.
 *
 * @internal
 * @param value A number to be rounded.
 * @returns The rounded number.
 */ function toPrecision(value) {
    const multiplier = Math.pow(10, COLUMN_WIDTH_PRECISION);
    const number = typeof value === 'number' ? value : parseFloat(value);
    return Math.round(number * multiplier) / multiplier;
}
/**
 * Clamps the number within the inclusive lower (min) and upper (max) bounds. Returned number is rounded using the
 * {@link ~toPrecision `toPrecision()`} function.
 *
 * @internal
 * @param number A number to be clamped.
 * @param min A lower bound.
 * @param max An upper bound.
 * @returns The clamped number.
 */ function clamp(number, min, max) {
    if (number <= min) {
        return toPrecision(min);
    }
    if (number >= max) {
        return toPrecision(max);
    }
    return toPrecision(number);
}
/**
 * Creates an array with defined length and fills all elements with defined value.
 *
 * @internal
 * @param length The length of the array.
 * @param value The value to fill the array with.
 * @returns An array with defined length and filled with defined value.
 */ function createFilledArray(length, value) {
    return Array(length).fill(value);
}
/**
 * Sums all array values that can be parsed to a float.
 *
 * @internal
 * @param array An array of numbers.
 * @returns The sum of all array values.
 */ function sumArray(array) {
    return array.map((value)=>typeof value === 'number' ? value : parseFloat(value)).filter((value)=>!Number.isNaN(value)).reduce((result, item)=>result + item, 0);
}
/**
 * Makes sure that the sum of the widths from all columns is 100%. If the sum of all the widths is not equal 100%, all the widths are
 * changed proportionally so that they all sum back to 100%. If there are columns without specified width, the amount remaining
 * after assigning the known widths will be distributed equally between them.
 *
 * @internal
 * @param columnWidths An array of column widths.
 * @returns An array of column widths guaranteed to sum up to 100%.
 */ function normalizeColumnWidths(columnWidths) {
    const widths = columnWidths.map((width)=>{
        if (width === 'auto' || width === undefined) {
            return 'auto';
        }
        return parseFloat(width.replace('%', ''));
    });
    let normalizedWidths = calculateMissingColumnWidths(widths);
    const totalWidth = sumArray(normalizedWidths);
    if (totalWidth !== 100) {
        normalizedWidths = normalizedWidths// Adjust all the columns proportionally.
        .map((width)=>toPrecision(width * 100 / totalWidth))// Due to rounding of numbers it may happen that the sum of the widths of all columns will not be exactly 100%.
        // Therefore, the width of the last column is explicitly adjusted (narrowed or expanded), since all the columns
        // have been proportionally changed already.
        .map((columnWidth, columnIndex, width)=>{
            const isLastColumn = columnIndex === width.length - 1;
            if (!isLastColumn) {
                return columnWidth;
            }
            const totalWidth = sumArray(width);
            return toPrecision(columnWidth + 100 - totalWidth);
        });
    }
    return normalizedWidths.map((width)=>width + '%');
}
/**
 * Initializes the column widths by parsing the attribute value and calculating the uninitialized column widths. The special value 'auto'
 * indicates that width for the column must be calculated. The width of such uninitialized column is calculated as follows:
 * - If there is enough free space in the table for all uninitialized columns to have at least the minimum allowed width for all of them,
 *   then set this width equally for all uninitialized columns.
 * - Otherwise, just set the minimum allowed width for all uninitialized columns. The sum of all column widths will be greater than 100%,
 *   but then it will be adjusted proportionally to 100% in {@link #normalizeColumnWidths `normalizeColumnWidths()`}.
 *
 * @param columnWidths An array of column widths.
 * @returns An array with 'auto' values replaced with calculated widths.
 */ function calculateMissingColumnWidths(columnWidths) {
    const numberOfUninitializedColumns = columnWidths.filter((columnWidth)=>columnWidth === 'auto').length;
    if (numberOfUninitializedColumns === 0) {
        return columnWidths.map((columnWidth)=>toPrecision(columnWidth));
    }
    const totalWidthOfInitializedColumns = sumArray(columnWidths);
    const widthForUninitializedColumn = Math.max((100 - totalWidthOfInitializedColumns) / numberOfUninitializedColumns, COLUMN_MIN_WIDTH_AS_PERCENTAGE);
    return columnWidths.map((columnWidth)=>columnWidth === 'auto' ? widthForUninitializedColumn : columnWidth).map((columnWidth)=>toPrecision(columnWidth));
}
/**
 * Calculates the total horizontal space taken by the cell. That includes:
 *  * width,
 *  * left and red padding,
 *  * border width.
 *
 * @internal
 * @param domCell A DOM cell element.
 * @returns Width in pixels without `px` at the end.
 */ function getDomCellOuterWidth(domCell) {
    const styles = global.window.getComputedStyle(domCell);
    // In the 'border-box' box sizing algorithm, the element's width
    // already includes the padding and border width (#12335).
    if (styles.boxSizing === 'border-box') {
        return parseInt(styles.width);
    } else {
        return parseFloat(styles.width) + parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight) + parseFloat(styles.borderWidth);
    }
}
/**
 * Updates column elements to match columns widths.
 *
 * @internal
 * @param columns
 * @param tableColumnGroup
 * @param normalizedWidths
 * @param writer
 */ function updateColumnElements(columns, tableColumnGroup, normalizedWidths, writer) {
    for(let i = 0; i < Math.max(normalizedWidths.length, columns.length); i++){
        const column = columns[i];
        const columnWidth = normalizedWidths[i];
        if (!columnWidth) {
            // Number of `<tableColumn>` elements exceeds actual number of columns.
            writer.remove(column);
        } else if (!column) {
            // There is fewer `<tableColumn>` elements than actual columns.
            writer.appendElement('tableColumn', {
                columnWidth
            }, tableColumnGroup);
        } else {
            // Update column width.
            writer.setAttribute('columnWidth', columnWidth, column);
        }
    }
}
/**
 * Returns a 'tableColumnGroup' element from the 'table'.
 *
 * @internal
 * @param element A 'table' or 'tableColumnGroup' element.
 * @returns A 'tableColumnGroup' element.
 */ function getColumnGroupElement(element) {
    if (element.is('element', 'tableColumnGroup')) {
        return element;
    }
    const children = element.getChildren();
    return Array.from(children).find((element)=>element.is('element', 'tableColumnGroup'));
}
/**
 * Returns an array of 'tableColumn' elements. It may be empty if there's no `tableColumnGroup` element.
 *
 * @internal
 * @param element A 'table' or 'tableColumnGroup' element.
 * @returns An array of 'tableColumn' elements.
 */ function getTableColumnElements(element) {
    const columnGroupElement = getColumnGroupElement(element);
    if (!columnGroupElement) {
        return [];
    }
    return Array.from(columnGroupElement.getChildren());
}
/**
 * Returns an array of table column widths.
 *
 * @internal
 * @param element A 'table' or 'tableColumnGroup' element.
 * @returns An array of table column widths.
 */ function getTableColumnsWidths(element) {
    return getTableColumnElements(element).map((column)=>column.getAttribute('columnWidth'));
}
/**
 * Translates the `colSpan` model attribute into additional column widths and returns the resulting array.
 *
 * @internal
 * @param element A 'table' or 'tableColumnGroup' element.
 * @param writer A writer instance.
 * @returns An array of table column widths.
 */ function translateColSpanAttribute(element, writer) {
    const tableColumnElements = getTableColumnElements(element);
    return tableColumnElements.reduce((acc, element)=>{
        const columnWidth = element.getAttribute('columnWidth');
        const colSpan = element.getAttribute('colSpan');
        if (!colSpan) {
            acc.push(columnWidth);
            return acc;
        }
        // Translate the `colSpan` model attribute on to the proper number of column widths
        // and remove it from the element.
        // See https://github.com/ckeditor/ckeditor5/issues/14521#issuecomment-1662102889 for more details.
        for(let i = 0; i < colSpan; i++){
            acc.push(columnWidth);
        }
        writer.removeAttribute('colSpan', element);
        return acc;
    }, []);
}

/**
 * The table utilities plugin.
 */ class TableUtils extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableUtils';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        this.decorate('insertColumns');
        this.decorate('insertRows');
    }
    /**
	 * Returns the table cell location as an object with table row and table column indexes.
	 *
	 * For instance, in the table below:
	 *
	 *      0   1   2   3
	 *    +---+---+---+---+
	 *  0 | a     | b | c |
	 *    +       +   +---+
	 *  1 |       |   | d |
	 *    +---+---+   +---+
	 *  2 | e     |   | f |
	 *    +---+---+---+---+
	 *
	 * the method will return:
	 *
	 * ```ts
	 * const cellA = table.getNodeByPath( [ 0, 0 ] );
	 * editor.plugins.get( 'TableUtils' ).getCellLocation( cellA );
	 * // will return { row: 0, column: 0 }
	 *
	 * const cellD = table.getNodeByPath( [ 1, 0 ] );
	 * editor.plugins.get( 'TableUtils' ).getCellLocation( cellD );
	 * // will return { row: 1, column: 3 }
	 * ```
	 *
	 * @returns Returns a `{row, column}` object.
	 */ getCellLocation(tableCell) {
        const tableRow = tableCell.parent;
        const table = tableRow.parent;
        const rowIndex = table.getChildIndex(tableRow);
        const tableWalker = new TableWalker(table, {
            row: rowIndex
        });
        for (const { cell, row, column } of tableWalker){
            if (cell === tableCell) {
                return {
                    row,
                    column
                };
            }
        }
        // Should be unreachable code.
        /* istanbul ignore next -- @preserve */ return undefined;
    }
    /**
	 * Creates an empty table with a proper structure. The table needs to be inserted into the model,
	 * for example, by using the {@link module:engine/model/model~Model#insertContent} function.
	 *
	 * ```ts
	 * model.change( ( writer ) => {
	 *   // Create a table of 2 rows and 7 columns:
	 *   const table = tableUtils.createTable( writer, { rows: 2, columns: 7 } );
	 *
	 *   // Insert a table to the model at the best position taking the current selection:
	 *   model.insertContent( table );
	 * }
	 * ```
	 *
	 * @param writer The model writer.
	 * @param options.rows The number of rows to create. Default value is 2.
	 * @param options.columns The number of columns to create. Default value is 2.
	 * @param options.headingRows The number of heading rows. Default value is 0.
	 * @param options.headingColumns The number of heading columns. Default value is 0.
	 * @returns The created table element.
	 */ createTable(writer, options) {
        const table = writer.createElement('table');
        const rows = options.rows || 2;
        const columns = options.columns || 2;
        createEmptyRows(writer, table, 0, rows, columns);
        if (options.headingRows) {
            this.setHeadingRowsCount(writer, table, Math.min(options.headingRows, rows));
        }
        if (options.headingColumns) {
            this.setHeadingColumnsCount(writer, table, Math.min(options.headingColumns, columns));
        }
        return table;
    }
    /**
	 * Inserts rows into a table.
	 *
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).insertRows( table, { at: 1, rows: 2 } );
	 * ```
	 *
	 * Assuming the table on the left, the above code will transform it to the table on the right:
	 *
	 *  row index
	 *    0 +---+---+---+       `at` = 1,      +---+---+---+ 0
	 *      | a | b | c |       `rows` = 2,    | a | b | c |
	 *    1 +   +---+---+   <-- insert here    +   +---+---+ 1
	 *      |   | d | e |                      |   |   |   |
	 *    2 +   +---+---+       will give:     +   +---+---+ 2
	 *      |   | f | g |                      |   |   |   |
	 *    3 +---+---+---+                      +   +---+---+ 3
	 *                                         |   | d | e |
	 *                                         +   +---+---+ 4
	 *                                         +   + f | g |
	 *                                         +---+---+---+ 5
	 *
	 * @param table The table model element where the rows will be inserted.
	 * @param options.at The row index at which the rows will be inserted.  Default value is 0.
	 * @param options.rows The number of rows to insert.  Default value is 1.
	 * @param options.copyStructureFromAbove The flag for copying row structure. Note that
	 * the row structure will not be copied if this option is not provided.
	 */ insertRows(table, options = {}) {
        const model = this.editor.model;
        const insertAt = options.at || 0;
        const rowsToInsert = options.rows || 1;
        const isCopyStructure = options.copyStructureFromAbove !== undefined;
        const copyStructureFrom = options.copyStructureFromAbove ? insertAt - 1 : insertAt;
        const cellTypeEnabled = isTableCellTypeEnabled(this.editor);
        const rows = this.getRows(table);
        const columns = this.getColumns(table);
        if (insertAt > rows) {
            /**
			 * The `options.at` points at a row position that does not exist.
			 *
			 * @error tableutils-insertrows-insert-out-of-range
			 */ throw new CKEditorError('tableutils-insertrows-insert-out-of-range', this, {
                options
            });
        }
        model.change((writer)=>{
            let headingRows = table.getAttribute('headingRows') || 0;
            const headingColumns = table.getAttribute('headingColumns') || 0;
            // Inserting rows inside heading section requires to update `headingRows` attribute as the heading section will grow.
            if (headingRows > insertAt) {
                headingRows += rowsToInsert;
                this.setHeadingRowsCount(writer, table, headingRows, {
                    shallow: true
                });
            }
            // Inserting at the end or at the beginning of a table doesn't require to calculate anything special.
            if (!isCopyStructure && (insertAt === 0 || insertAt === rows)) {
                const rows = createEmptyRows(writer, table, insertAt, rowsToInsert, columns);
                if (cellTypeEnabled) {
                    for(let rowOffset = 0; rowOffset < rows.length; rowOffset++){
                        const row = rows[rowOffset];
                        for(let columnIndex = 0; columnIndex < columns; columnIndex++){
                            const cell = row[columnIndex];
                            if (insertAt + rowOffset < headingRows || columnIndex < headingColumns) {
                                writer.setAttribute('tableCellType', 'header', cell);
                            }
                        }
                    }
                }
                return;
            }
            // Iterate over all the rows above the inserted rows in order to check for the row-spanned cells.
            const walkerEndRow = isCopyStructure ? Math.max(insertAt, copyStructureFrom) : insertAt;
            const tableIterator = new TableWalker(table, {
                endRow: walkerEndRow
            });
            // Store spans of the reference row to reproduce it's structure. This array is column number indexed.
            const rowColSpansMap = new Array(columns).fill(1);
            for (const { row, column, cellHeight, cellWidth, cell } of tableIterator){
                const lastCellRow = row + cellHeight - 1;
                const isOverlappingInsertedRow = row < insertAt && insertAt <= lastCellRow;
                const isReferenceRow = row <= copyStructureFrom && copyStructureFrom <= lastCellRow;
                // If the cell is row-spanned and overlaps the inserted row, then reserve space for it in the row map.
                if (isOverlappingInsertedRow) {
                    // This cell overlaps the inserted rows so we need to expand it further.
                    writer.setAttribute('rowspan', cellHeight + rowsToInsert, cell);
                    // Mark this cell with negative number to indicate how many cells should be skipped when adding the new cells.
                    rowColSpansMap[column] = -cellWidth;
                } else if (isCopyStructure && isReferenceRow) {
                    rowColSpansMap[column] = cellWidth;
                }
            }
            for(let rowIndex = 0; rowIndex < rowsToInsert; rowIndex++){
                const tableRow = writer.createElement('tableRow');
                writer.insert(tableRow, table, insertAt);
                for(let cellIndex = 0; cellIndex < rowColSpansMap.length; cellIndex++){
                    const colspan = rowColSpansMap[cellIndex];
                    const insertPosition = writer.createPositionAt(tableRow, 'end');
                    // Insert the empty cell only if this slot is not row-spanned from any other cell.
                    if (colspan > 0) {
                        const insertedCells = createEmptyTableCell(writer, insertPosition, colspan > 1 ? {
                            colspan
                        } : undefined);
                        // If we insert row in heading section, set proper cell type.
                        if (cellTypeEnabled && (insertAt + rowIndex < headingRows || cellIndex < headingColumns)) {
                            writer.setAttribute('tableCellType', 'header', insertedCells);
                        }
                    }
                    // Skip the col-spanned slots, there won't be any cells.
                    cellIndex += Math.abs(colspan) - 1;
                }
            }
        });
    }
    /**
	 * Inserts columns into a table.
	 *
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).insertColumns( table, { at: 1, columns: 2 } );
	 * ```
	 *
	 * Assuming the table on the left, the above code will transform it to the table on the right:
	 *
	 *  0   1   2   3                   0   1   2   3   4   5
	 *  +---+---+---+                   +---+---+---+---+---+
	 *  | a     | b |                   | a             | b |
	 *  +       +---+                   +               +---+
	 *  |       | c |                   |               | c |
	 *  +---+---+---+     will give:    +---+---+---+---+---+
	 *  | d | e | f |                   | d |   |   | e | f |
	 *  +---+   +---+                   +---+---+---+   +---+
	 *  | g |   | h |                   | g |   |   |   | h |
	 *  +---+---+---+                   +---+---+---+---+---+
	 *  | i         |                   | i                 |
	 *  +---+---+---+                   +---+---+---+---+---+
	 *      ^---- insert here, `at` = 1, `columns` = 2
	 *
	 * @param table The table model element where the columns will be inserted.
	 * @param options.at The column index at which the columns will be inserted. Default value is 0.
	 * @param options.columns The number of columns to insert. Default value is 1.
	 */ insertColumns(table, options = {}) {
        const model = this.editor.model;
        const insertAt = options.at || 0;
        const columnsToInsert = options.columns || 1;
        const cellTypeEnabled = isTableCellTypeEnabled(this.editor);
        model.change((writer)=>{
            const headingRows = table.getAttribute('headingRows') || 0;
            let headingColumns = table.getAttribute('headingColumns');
            // Inserting columns inside heading section requires to update `headingColumns` attribute as the heading section will grow.
            if (insertAt < headingColumns) {
                headingColumns += columnsToInsert;
                this.setHeadingColumnsCount(writer, table, headingColumns, {
                    shallow: true
                });
            }
            const tableColumns = this.getColumns(table);
            // Inserting at the end and at the beginning of a table doesn't require to calculate anything special.
            if (insertAt === 0 || tableColumns === insertAt) {
                let rowIndex = 0;
                for (const tableRow of table.getChildren()){
                    // Ignore non-row elements inside the table (e.g. caption).
                    if (!tableRow.is('element', 'tableRow')) {
                        continue;
                    }
                    const insertedCells = createCells(columnsToInsert, writer, writer.createPositionAt(tableRow, insertAt ? 'end' : 0));
                    if (cellTypeEnabled) {
                        // If we insert column in heading section, set proper cell type.
                        for(let columnOffset = 0; columnOffset < insertedCells.length; columnOffset++){
                            if (insertAt + columnOffset < headingColumns || rowIndex < headingRows) {
                                writer.setAttribute('tableCellType', 'header', insertedCells[columnOffset]);
                            }
                        }
                    }
                    rowIndex++;
                }
                return;
            }
            const tableWalker = new TableWalker(table, {
                column: insertAt,
                includeAllSlots: true
            });
            for (const tableSlot of tableWalker){
                const { row, cell, cellAnchorColumn, cellAnchorRow, cellWidth, cellHeight } = tableSlot;
                // When iterating over column the table walker outputs either:
                // - cells at given column index (cell "e" from method docs),
                // - spanned columns (spanned cell from row between cells "g" and "h" - spanned by "e", only if `includeAllSlots: true`),
                // - or a cell from the same row which spans over this column (cell "a").
                if (cellAnchorColumn < insertAt) {
                    // If cell is anchored in previous column, it is a cell that spans over an inserted column (cell "a" & "i").
                    // For such cells expand them by a number of columns inserted.
                    writer.setAttribute('colspan', cellWidth + columnsToInsert, cell);
                    // This cell will overlap cells in rows below so skip them (because of `includeAllSlots` option) - (cell "a")
                    const lastCellRow = cellAnchorRow + cellHeight - 1;
                    for(let i = row; i <= lastCellRow; i++){
                        tableWalker.skipRow(i);
                    }
                } else {
                    // It's either cell at this column index or spanned cell by a row-spanned cell from row above.
                    // In table above it's cell "e" and a spanned position from row below (empty cell between cells "g" and "h")
                    const insertedCells = createCells(columnsToInsert, writer, tableSlot.getPositionBefore());
                    // If we insert column in heading section, set proper cell type.
                    if (cellTypeEnabled) {
                        for(let columnOffset = 0; columnOffset < insertedCells.length; columnOffset++){
                            if (insertAt + columnOffset < headingColumns || row < headingRows) {
                                writer.setAttribute('tableCellType', 'header', insertedCells[columnOffset]);
                            }
                        }
                    }
                }
            }
        });
    }
    /**
	 * Removes rows from the given `table`.
	 *
	 * This method re-calculates the table geometry including `rowspan` attribute of table cells overlapping removed rows
	 * and table headings values.
	 *
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).removeRows( table, { at: 1, rows: 2 } );
	 * ```
	 *
	 * Executing the above code in the context of the table on the left will transform its structure as presented on the right:
	 *
	 *  row index
	 *      ┌───┬───┬───┐        `at` = 1        ┌───┬───┬───┐
	 *    0 │ a │ b │ c │        `rows` = 2      │ a │ b │ c │ 0
	 *      │   ├───┼───┤                        │   ├───┼───┤
	 *    1 │   │ d │ e │  <-- remove from here  │   │ d │ g │ 1
	 *      │   │   ├───┤        will give:      ├───┼───┼───┤
	 *    2 │   │   │ f │                        │ h │ i │ j │ 2
	 *      │   │   ├───┤                        └───┴───┴───┘
	 *    3 │   │   │ g │
	 *      ├───┼───┼───┤
	 *    4 │ h │ i │ j │
	 *      └───┴───┴───┘
	 *
	 * @param options.at The row index at which the removing rows will start.
	 * @param options.rows The number of rows to remove. Default value is 1.
	 */ removeRows(table, options) {
        const model = this.editor.model;
        const rowsToRemove = options.rows || 1;
        const rowCount = this.getRows(table);
        const first = options.at;
        const last = first + rowsToRemove - 1;
        if (last > rowCount - 1) {
            /**
			 * The `options.at` param must point at existing row and `options.rows` must not exceed the rows in the table.
			 *
			 * @error tableutils-removerows-row-index-out-of-range
			 */ throw new CKEditorError('tableutils-removerows-row-index-out-of-range', this, {
                table,
                options
            });
        }
        model.change((writer)=>{
            const indexesObject = {
                first,
                last
            };
            // Removing rows from the table require that most calculations to be done prior to changing table structure.
            // Preparations must be done in the same enqueueChange callback to use the current table structure.
            // 1. Preparation - get row-spanned cells that have to be modified after removing rows.
            const { cellsToMove, cellsToTrim } = getCellsToMoveAndTrimOnRemoveRow(table, indexesObject);
            // 2. Execution
            // 2a. Move cells from removed rows that extends over a removed section - must be done before removing rows.
            // This will fill any gaps in a rows below that previously were empty because of row-spanned cells.
            if (cellsToMove.size) {
                const rowAfterRemovedSection = last + 1;
                moveCellsToRow(table, rowAfterRemovedSection, cellsToMove, writer);
            }
            // 2b. Remove all required rows.
            for(let i = last; i >= first; i--){
                writer.remove(table.getChild(i));
            }
            // 2c. Update cells from rows above that overlap removed section. Similar to step 2 but does not involve moving cells.
            for (const { rowspan, cell } of cellsToTrim){
                updateNumericAttribute('rowspan', rowspan, cell, writer);
            }
            // 2d. Adjust heading rows if removed rows were in a heading section.
            updateHeadingRows(table, indexesObject, writer);
            // 2e. Remove empty columns (without anchored cells) if there are any.
            if (!removeEmptyColumns(table, this)) {
                // If there wasn't any empty columns then we still need to check if this wasn't called
                // because of cleaning empty rows and we only removed one of them.
                removeEmptyRows(table, this);
            }
            // 3. If next rows are entirely header, adjust heading rows count.
            if (isTableCellTypeEnabled(this.editor)) {
                let headingRows = table.getAttribute('headingRows') || 0;
                const totalRows = this.getRows(table);
                while(headingRows < totalRows && isEntireCellsLineHeader({
                    table,
                    row: headingRows
                })){
                    headingRows++;
                }
                this.setHeadingRowsCount(writer, table, headingRows, {
                    shallow: true
                });
            }
        });
    }
    /**
	 * Removes columns from the given `table`.
	 *
	 * This method re-calculates the table geometry including the `colspan` attribute of table cells overlapping removed columns
	 * and table headings values.
	 *
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).removeColumns( table, { at: 1, columns: 2 } );
	 * ```
	 *
	 * Executing the above code in the context of the table on the left will transform its structure as presented on the right:
	 *
	 *    0   1   2   3   4                       0   1   2
	 *  ┌───────────────┬───┐                   ┌───────┬───┐
	 *  │ a             │ b │                   │ a     │ b │
	 *  │               ├───┤                   │       ├───┤
	 *  │               │ c │                   │       │ c │
	 *  ├───┬───┬───┬───┼───┤     will give:    ├───┬───┼───┤
	 *  │ d │ e │ f │ g │ h │                   │ d │ g │ h │
	 *  ├───┼───┼───┤   ├───┤                   ├───┤   ├───┤
	 *  │ i │ j │ k │   │ l │                   │ i │   │ l │
	 *  ├───┴───┴───┴───┴───┤                   ├───┴───┴───┤
	 *  │ m                 │                   │ m         │
	 *  └───────────────────┘                   └───────────┘
	 *        ^---- remove from here, `at` = 1, `columns` = 2
	 *
	 * @param options.at The row index at which the removing columns will start.
	 * @param options.columns The number of columns to remove.
	 */ removeColumns(table, options) {
        const model = this.editor.model;
        const first = options.at;
        const columnsToRemove = options.columns || 1;
        const last = options.at + columnsToRemove - 1;
        model.change((writer)=>{
            adjustHeadingColumns(table, {
                first,
                last
            }, writer);
            const tableColumns = getTableColumnElements(table);
            for(let removedColumnIndex = last; removedColumnIndex >= first; removedColumnIndex--){
                for (const { cell, column, cellWidth } of [
                    ...new TableWalker(table)
                ]){
                    // If colspaned cell overlaps removed column decrease its span.
                    if (column <= removedColumnIndex && cellWidth > 1 && column + cellWidth > removedColumnIndex) {
                        updateNumericAttribute('colspan', cellWidth - 1, cell, writer);
                    } else if (column === removedColumnIndex) {
                        // The cell in removed column has colspan of 1.
                        writer.remove(cell);
                    }
                }
                // If table has `tableColumn` elements, we need to update it manually.
                // See https://github.com/ckeditor/ckeditor5/issues/14521#issuecomment-1662102889 for details.
                if (tableColumns[removedColumnIndex]) {
                    // If the removed column is the first one then we need to add its width to the next column.
                    // Otherwise we add it to the previous column.
                    const adjacentColumn = removedColumnIndex === 0 ? tableColumns[1] : tableColumns[removedColumnIndex - 1];
                    const removedColumnWidth = parseFloat(tableColumns[removedColumnIndex].getAttribute('columnWidth'));
                    const adjacentColumnWidth = parseFloat(adjacentColumn.getAttribute('columnWidth'));
                    writer.remove(tableColumns[removedColumnIndex]);
                    // Add the removed column width (in %) to the adjacent column.
                    writer.setAttribute('columnWidth', removedColumnWidth + adjacentColumnWidth + '%', adjacentColumn);
                }
            }
            // Remove empty rows that could appear after removing columns.
            if (!removeEmptyRows(table, this)) {
                // If there wasn't any empty rows then we still need to check if this wasn't called
                // because of cleaning empty columns and we only removed one of them.
                removeEmptyColumns(table, this);
            }
            // If next columns are entirely header, adjust heading columns count.
            if (isTableCellTypeEnabled(this.editor)) {
                let headingColumns = table.getAttribute('headingColumns') || 0;
                const totalColumns = this.getColumns(table);
                while(headingColumns < totalColumns && isEntireCellsLineHeader({
                    table,
                    column: headingColumns
                })){
                    headingColumns++;
                }
                this.setHeadingColumnsCount(writer, table, headingColumns, {
                    shallow: true
                });
            }
        });
    }
    /**
	 * Divides a table cell vertically into several ones.
	 *
	 * The cell will be visually split into more cells by updating colspans of other cells in a column
	 * and inserting cells (columns) after that cell.
	 *
	 * In the table below, if cell "a" is split into 3 cells:
	 *
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +---+---+---+
	 *  | d | e | f |
	 *  +---+---+---+
	 *
	 * it will result in the table below:
	 *
	 *  +---+---+---+---+---+
	 *  | a |   |   | b | c |
	 *  +---+---+---+---+---+
	 *  | d         | e | f |
	 *  +---+---+---+---+---+
	 *
	 * So cell "d" will get its `colspan` updated to `3` and 2 cells will be added (2 columns will be created).
	 *
	 * Splitting a cell that already has a `colspan` attribute set will distribute the cell `colspan` evenly and the remainder
	 * will be left to the original cell:
	 *
	 *  +---+---+---+
	 *  | a         |
	 *  +---+---+---+
	 *  | b | c | d |
	 *  +---+---+---+
	 *
	 * Splitting cell "a" with `colspan=3` into 2 cells will create 1 cell with a `colspan=a` and cell "a" that will have `colspan=2`:
	 *
	 *  +---+---+---+
	 *  | a     |   |
	 *  +---+---+---+
	 *  | b | c | d |
	 *  +---+---+---+
	 */ splitCellVertically(tableCell, numberOfCells = 2) {
        const model = this.editor.model;
        const tableRow = tableCell.parent;
        const table = tableRow.parent;
        const rowspan = parseInt(tableCell.getAttribute('rowspan') || '1');
        const colspan = parseInt(tableCell.getAttribute('colspan') || '1');
        model.change((writer)=>{
            // First check - the cell spans over multiple rows so before doing anything else just split this cell.
            if (colspan > 1) {
                // Get spans of new (inserted) cells and span to update of split cell.
                const { newCellsSpan, updatedSpan } = breakSpanEvenly(colspan, numberOfCells);
                updateNumericAttribute('colspan', updatedSpan, tableCell, writer);
                // Each inserted cell will have the same attributes:
                const newCellsAttributes = {};
                // Do not store default value in the model.
                if (newCellsSpan > 1) {
                    newCellsAttributes.colspan = newCellsSpan;
                }
                // Copy rowspan of split cell.
                if (rowspan > 1) {
                    newCellsAttributes.rowspan = rowspan;
                }
                const cellsToInsert = colspan > numberOfCells ? numberOfCells - 1 : colspan - 1;
                createCells(cellsToInsert, writer, writer.createPositionAfter(tableCell), newCellsAttributes);
            }
            // Second check - the cell has colspan of 1 or we need to create more cells then the currently one spans over.
            if (colspan < numberOfCells) {
                const cellsToInsert = numberOfCells - colspan;
                // First step: expand cells on the same column as split cell.
                const tableMap = [
                    ...new TableWalker(table)
                ];
                // Get the column index of split cell.
                const { column: splitCellColumn } = tableMap.find(({ cell })=>cell === tableCell);
                // Find cells which needs to be expanded vertically - those on the same column or those that spans over split cell's column.
                const cellsToUpdate = tableMap.filter(({ cell, cellWidth, column })=>{
                    const isOnSameColumn = cell !== tableCell && column === splitCellColumn;
                    const spansOverColumn = column < splitCellColumn && column + cellWidth > splitCellColumn;
                    return isOnSameColumn || spansOverColumn;
                });
                // Expand cells vertically.
                for (const { cell, cellWidth } of cellsToUpdate){
                    writer.setAttribute('colspan', cellWidth + cellsToInsert, cell);
                }
                // Second step: create columns after split cell.
                // Each inserted cell will have the same attributes:
                const newCellsAttributes = {};
                // Do not store default value in the model.
                // Copy rowspan of split cell.
                if (rowspan > 1) {
                    newCellsAttributes.rowspan = rowspan;
                }
                createCells(cellsToInsert, writer, writer.createPositionAfter(tableCell), newCellsAttributes);
                const headingColumns = table.getAttribute('headingColumns') || 0;
                // Update heading section if split cell is in heading section.
                if (headingColumns > splitCellColumn) {
                    updateNumericAttribute('headingColumns', headingColumns + cellsToInsert, table, writer);
                }
            }
        });
    }
    /**
	 * Divides a table cell horizontally into several ones.
	 *
	 * The cell will be visually split into more cells by updating rowspans of other cells in the row and inserting rows with a single cell
	 * below.
	 *
	 * If in the table below cell "b" is split into 3 cells:
	 *
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +---+---+---+
	 *  | d | e | f |
	 *  +---+---+---+
	 *
	 * It will result in the table below:
	 *
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +   +---+   +
	 *  |   |   |   |
	 *  +   +---+   +
	 *  |   |   |   |
	 *  +---+---+---+
	 *  | d | e | f |
	 *  +---+---+---+
	 *
	 * So cells "a" and "b" will get their `rowspan` updated to `3` and 2 rows with a single cell will be added.
	 *
	 * Splitting a cell that already has a `rowspan` attribute set will distribute the cell `rowspan` evenly and the remainder
	 * will be left to the original cell:
	 *
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +   +---+---+
	 *  |   | d | e |
	 *  +   +---+---+
	 *  |   | f | g |
	 *  +   +---+---+
	 *  |   | h | i |
	 *  +---+---+---+
	 *
	 * Splitting cell "a" with `rowspan=4` into 3 cells will create 2 cells with a `rowspan=1` and cell "a" will have `rowspan=2`:
	 *
	 *  +---+---+---+
	 *  | a | b | c |
	 *  +   +---+---+
	 *  |   | d | e |
	 *  +---+---+---+
	 *  |   | f | g |
	 *  +---+---+---+
	 *  |   | h | i |
	 *  +---+---+---+
	 */ splitCellHorizontally(tableCell, numberOfCells = 2) {
        const model = this.editor.model;
        const tableRow = tableCell.parent;
        const table = tableRow.parent;
        const splitCellRow = table.getChildIndex(tableRow);
        const rowspan = parseInt(tableCell.getAttribute('rowspan') || '1');
        const colspan = parseInt(tableCell.getAttribute('colspan') || '1');
        model.change((writer)=>{
            // First check - the cell spans over multiple rows so before doing anything else just split this cell.
            if (rowspan > 1) {
                // Cache table map before updating table.
                const tableMap = [
                    ...new TableWalker(table, {
                        startRow: splitCellRow,
                        endRow: splitCellRow + rowspan - 1,
                        includeAllSlots: true
                    })
                ];
                // Get spans of new (inserted) cells and span to update of split cell.
                const { newCellsSpan, updatedSpan } = breakSpanEvenly(rowspan, numberOfCells);
                updateNumericAttribute('rowspan', updatedSpan, tableCell, writer);
                const { column: cellColumn } = tableMap.find(({ cell })=>cell === tableCell);
                // Each inserted cell will have the same attributes:
                const newCellsAttributes = {};
                // Do not store default value in the model.
                if (newCellsSpan > 1) {
                    newCellsAttributes.rowspan = newCellsSpan;
                }
                // Copy colspan of split cell.
                if (colspan > 1) {
                    newCellsAttributes.colspan = colspan;
                }
                // Accumulator that stores distance from the last inserted cell span.
                // It helps with evenly splitting larger cell spans (for example 10 cells collapsing into 3 cells).
                // We split these cells into 3, 3, 4 cells and we have to call `createCells` only when distance between
                // these cells is equal or greater than the new cells span size.
                let distanceFromLastCellSpan = 0;
                for (const tableSlot of tableMap){
                    const { column, row } = tableSlot;
                    // As both newly created cells and the split cell might have rowspan,
                    // the insertion of new cells must go to appropriate rows:
                    //
                    // 1. It's a row after split cell + it's height.
                    const isAfterSplitCell = row >= splitCellRow + updatedSpan;
                    // 2. Is on the same column.
                    const isOnSameColumn = column === cellColumn;
                    // Reset distance from the last cell span if we are on the same column and we exceeded the new cells span size.
                    if (distanceFromLastCellSpan >= newCellsSpan && isOnSameColumn) {
                        distanceFromLastCellSpan = 0;
                    }
                    if (isAfterSplitCell && isOnSameColumn) {
                        // Create new cells only if the distance from the last cell span is equal or greater than the new cells span.
                        if (!distanceFromLastCellSpan) {
                            createCells(1, writer, tableSlot.getPositionBefore(), newCellsAttributes);
                        }
                        // Increase the distance from the last cell span.
                        distanceFromLastCellSpan++;
                    }
                }
            }
            // Second check - the cell has rowspan of 1 or we need to create more cells than the current cell spans over.
            if (rowspan < numberOfCells) {
                // We already split the cell in check one so here we split to the remaining number of cells only.
                const cellsToInsert = numberOfCells - rowspan;
                // This check is needed since we need to check if there are any cells from previous rows than spans over this cell's row.
                const tableMap = [
                    ...new TableWalker(table, {
                        startRow: 0,
                        endRow: splitCellRow
                    })
                ];
                // First step: expand cells.
                for (const { cell, cellHeight, row } of tableMap){
                    // Expand rowspan of cells that are either:
                    // - on the same row as current cell,
                    // - or are below split cell row and overlaps that row.
                    if (cell !== tableCell && row + cellHeight > splitCellRow) {
                        const rowspanToSet = cellHeight + cellsToInsert;
                        writer.setAttribute('rowspan', rowspanToSet, cell);
                    }
                }
                // Second step: create rows with single cell below split cell.
                const newCellsAttributes = {};
                // Copy colspan of split cell.
                if (colspan > 1) {
                    newCellsAttributes.colspan = colspan;
                }
                createEmptyRows(writer, table, splitCellRow + 1, cellsToInsert, 1, newCellsAttributes);
                // Update heading section if split cell is in heading section.
                const headingRows = table.getAttribute('headingRows') || 0;
                if (headingRows > splitCellRow) {
                    updateNumericAttribute('headingRows', headingRows + cellsToInsert, table, writer);
                }
            }
        });
    }
    /**
	 * Returns the number of columns for a given table.
	 *
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).getColumns( table );
	 * ```
	 *
	 * @param table The table to analyze.
	 */ getColumns(table) {
        // Analyze first row only as all the rows should have the same width.
        // Using the first row without checking if it's a tableRow because we expect
        // that table will have only tableRow model elements at the beginning.
        const row = table.getChild(0);
        return [
            ...row.getChildren()
        ]// $marker elements can also be children of a row too (when TrackChanges is on). Don't include them in the count.
        .filter((node)=>node.is('element', 'tableCell')).reduce((columns, row)=>{
            const columnWidth = parseInt(row.getAttribute('colspan') || '1');
            return columns + columnWidth;
        }, 0);
    }
    /**
	 * Returns the number of rows for a given table. Any other element present in the table model is omitted.
	 *
	 * ```ts
	 * editor.plugins.get( 'TableUtils' ).getRows( table );
	 * ```
	 *
	 * @param table The table to analyze.
	 */ getRows(table) {
        // Rowspan not included due to #6427.
        return Array.from(table.getChildren()).reduce((rowCount, child)=>child.is('element', 'tableRow') ? rowCount + 1 : rowCount, 0);
    }
    /**
	 * Creates an instance of the table walker.
	 *
	 * The table walker iterates internally by traversing the table from row index = 0 and column index = 0.
	 * It walks row by row and column by column in order to output values defined in the options.
	 * By default it will output only the locations that are occupied by a cell. To include also spanned rows and columns,
	 * pass the `includeAllSlots` option.
	 *
	 * @internal
	 * @param table A table over which the walker iterates.
	 * @param options An object with configuration.
	 */ createTableWalker(table, options = {}) {
        return new TableWalker(table, options);
    }
    /**
	 * Returns all model table cells that are fully selected (from the outside)
	 * within the provided model selection's ranges.
	 *
	 * To obtain the cells selected from the inside, use
	 * {@link #getTableCellsContainingSelection}.
	 */ getSelectedTableCells(selection) {
        const cells = [];
        for (const range of this.sortRanges(selection.getRanges())){
            const element = range.getContainedElement();
            if (element && element.is('element', 'tableCell')) {
                cells.push(element);
            }
        }
        return cells;
    }
    /**
	 * Sets the number of heading rows for the given `table`.
	 *
	 * @param writer The model writer.
	 * @param table The table model element.
	 * @param headingRows The number of heading rows to set.
	 * @param options Additional options.
	 * @param options.shallow If set to `true` it will only update the `headingRows` attribute
	 * without updating the cell types in the table. Default is `false`.
	 * @param options.resetFormerHeadingCells If set to `true`, it will check if the rows that are no longer in the heading section
	 * should be updated to body cells. Default is `true`.
	 * @param options.autoExpand If set to `true`, it will check if the following rows look like a header and expand the heading section.
	 * Default is `true`.
	 */ setHeadingRowsCount(writer, table, headingRows, options = {}) {
        const { shallow, resetFormerHeadingCells = true, autoExpand = true } = options;
        const oldHeadingRows = table.getAttribute('headingRows') || 0;
        if (headingRows === oldHeadingRows) {
            return;
        }
        updateNumericAttribute('headingRows', headingRows, table, writer, 0);
        if (shallow || !isTableCellTypeEnabled(this.editor)) {
            return;
        }
        // Set header type to all cells in new heading rows.
        for (const { cell, row, column } of new TableWalker(table, {
            endRow: headingRows - 1
        })){
            updateTableCellType({
                table,
                writer,
                cell,
                row,
                column
            });
        }
        // If heading rows were reduced, set body type to all cells in rows that are no longer in heading section.
        if (resetFormerHeadingCells && headingRows < oldHeadingRows) {
            for(let row = headingRows; row < oldHeadingRows; row++){
                // Handle edge case when some cells were already changed to body type manually,
                // before changing heading rows count.
                if (!isEntireCellsLineHeader({
                    table,
                    row
                })) {
                    break;
                }
                for (const { cell, row: cellRow, column } of new TableWalker(table, {
                    row
                })){
                    updateTableCellType({
                        table,
                        writer,
                        cell,
                        row: cellRow,
                        column
                    });
                }
            }
        }
        // If following rows looks like header, expand heading rows to cover them.
        if (autoExpand && headingRows > oldHeadingRows) {
            const totalRows = this.getRows(table);
            while(headingRows < totalRows && isEntireCellsLineHeader({
                table,
                row: headingRows
            })){
                headingRows++;
            }
            updateNumericAttribute('headingRows', headingRows, table, writer, 0);
        }
    }
    /**
	 * Sets the number of heading columns for the given `table`.
	 *
	 * @param writer The model writer to use.
	 * @param table The table model element.
	 * @param headingColumns The number of heading columns to set.
	 * @param options Additional options.
	 * @param options.shallow If set to `true` it will only update the `headingColumns` attribute
	 * without updating the cell types in the table. Default is `false`.
	 * @param options.resetFormerHeadingCells If set to `true`, it will check if the columns that are no longer in the heading section
	 * should be updated to body cells. Default is `true`.
	 * @param options.autoExpand If set to `true`, it will check if the following columns look like a header and expand the heading section.
	 * Default is `true`.
	 */ setHeadingColumnsCount(writer, table, headingColumns, options = {}) {
        const { shallow, resetFormerHeadingCells = true, autoExpand = true } = options;
        const oldHeadingColumns = table.getAttribute('headingColumns') || 0;
        if (headingColumns === oldHeadingColumns) {
            return;
        }
        updateNumericAttribute('headingColumns', headingColumns, table, writer, 0);
        if (shallow || !isTableCellTypeEnabled(this.editor)) {
            return;
        }
        // Set header type to all cells in new heading columns.
        for (const { cell, row, column } of new TableWalker(table, {
            endColumn: headingColumns - 1
        })){
            updateTableCellType({
                table,
                writer,
                cell,
                row,
                column
            });
        }
        // If heading columns were reduced, set body type to all cells in columns that are no longer in heading section.
        if (resetFormerHeadingCells && headingColumns < oldHeadingColumns) {
            for(let column = headingColumns; column < oldHeadingColumns; column++){
                // Handle edge case when some cells were already changed to body type manually,
                // before changing heading columns count.
                if (!isEntireCellsLineHeader({
                    table,
                    column
                })) {
                    break;
                }
                for (const { cell, row, column: cellColumn } of new TableWalker(table, {
                    column
                })){
                    updateTableCellType({
                        table,
                        writer,
                        cell,
                        row,
                        column: cellColumn
                    });
                }
            }
        }
        // If following columns looks like header, expand heading columns to cover them.
        if (autoExpand && headingColumns > oldHeadingColumns) {
            const totalColumns = this.getColumns(table);
            while(headingColumns < totalColumns && isEntireCellsLineHeader({
                table,
                column: headingColumns
            })){
                headingColumns++;
            }
            updateNumericAttribute('headingColumns', headingColumns, table, writer, 0);
        }
    }
    /**
	 * Returns all model table cells that the provided model selection's ranges
	 * {@link module:engine/model/range~ModelRange#start} inside.
	 *
	 * To obtain the cells selected from the outside, use
	 * {@link #getSelectedTableCells}.
	 */ getTableCellsContainingSelection(selection) {
        const cells = [];
        for (const range of selection.getRanges()){
            const cellWithSelection = range.start.findAncestor('tableCell');
            if (cellWithSelection) {
                cells.push(cellWithSelection);
            }
        }
        return cells;
    }
    /**
	 * Returns all model table cells that are either completely selected
	 * by selection ranges or host selection range
	 * {@link module:engine/model/range~ModelRange#start start positions} inside them.
	 *
	 * Combines {@link #getTableCellsContainingSelection} and
	 * {@link #getSelectedTableCells}.
	 */ getSelectionAffectedTableCells(selection) {
        const selectedCells = this.getSelectedTableCells(selection);
        if (selectedCells.length) {
            return selectedCells;
        }
        return this.getTableCellsContainingSelection(selection);
    }
    /**
	 * Returns an object with the `first` and `last` row index contained in the given `tableCells`.
	 *
	 * ```ts
	 * const selectedTableCells = getSelectedTableCells( editor.model.document.selection );
	 *
	 * const { first, last } = getRowIndexes( selectedTableCells );
	 *
	 * console.log( `Selected rows: ${ first } to ${ last }` );
	 * ```
	 *
	 * @returns Returns an object with the `first` and `last` table row indexes.
	 */ getRowIndexes(tableCells) {
        const indexes = tableCells.map((cell)=>cell.parent.index);
        return this._getFirstLastIndexesObject(indexes);
    }
    /**
	 * Returns an object with the `first` and `last` column index contained in the given `tableCells`.
	 *
	 * ```ts
	 * const selectedTableCells = getSelectedTableCells( editor.model.document.selection );
	 *
	 * const { first, last } = getColumnIndexes( selectedTableCells );
	 *
	 * console.log( `Selected columns: ${ first } to ${ last }` );
	 * ```
	 *
	 * @returns Returns an object with the `first` and `last` table column indexes.
	 */ getColumnIndexes(tableCells) {
        const table = tableCells[0].findAncestor('table');
        const tableMap = [
            ...new TableWalker(table)
        ];
        const indexes = tableMap.filter((entry)=>tableCells.includes(entry.cell)).map((entry)=>entry.column);
        return this._getFirstLastIndexesObject(indexes);
    }
    /**
	 * Checks if the selection contains cells that do not exceed rectangular selection.
	 *
	 * In a table below:
	 *
	 *  ┌───┬───┬───┬───┐
	 *  │ a │ b │ c │ d │
	 *  ├───┴───┼───┤   │
	 *  │ e     │ f │   │
	 *  │       ├───┼───┤
	 *  │       │ g │ h │
	 *  └───────┴───┴───┘
	 *
	 * Valid selections are these which create a solid rectangle (without gaps), such as:
	 *   - a, b (two horizontal cells)
	 *   - c, f (two vertical cells)
	 *   - a, b, e (cell "e" spans over four cells)
	 *   - c, d, f (cell d spans over a cell in the row below)
	 *
	 * While an invalid selection would be:
	 *   - a, c (the unselected cell "b" creates a gap)
	 *   - f, g, h (cell "d" spans over a cell from the row of "f" cell - thus creates a gap)
	 */ isSelectionRectangular(selectedTableCells) {
        if (selectedTableCells.length < 2 || !this._areCellInTheSameTableSection(selectedTableCells)) {
            return false;
        }
        // A valid selection is a fully occupied rectangle composed of table cells.
        // Below we will calculate the area of a selected table cells and the area of valid selection.
        // The area of a valid selection is defined by top-left and bottom-right cells.
        const rows = new Set();
        const columns = new Set();
        let areaOfSelectedCells = 0;
        for (const tableCell of selectedTableCells){
            const { row, column } = this.getCellLocation(tableCell);
            const rowspan = parseInt(tableCell.getAttribute('rowspan')) || 1;
            const colspan = parseInt(tableCell.getAttribute('colspan')) || 1;
            // Record row & column indexes of current cell.
            rows.add(row);
            columns.add(column);
            // For cells that spans over multiple rows add also the last row that this cell spans over.
            if (rowspan > 1) {
                rows.add(row + rowspan - 1);
            }
            // For cells that spans over multiple columns add also the last column that this cell spans over.
            if (colspan > 1) {
                columns.add(column + colspan - 1);
            }
            areaOfSelectedCells += rowspan * colspan;
        }
        // We can only merge table cells that are in adjacent rows...
        const areaOfValidSelection = getBiggestRectangleArea(rows, columns);
        return areaOfValidSelection == areaOfSelectedCells;
    }
    /**
	 * Returns array of sorted ranges.
	 */ sortRanges(ranges) {
        return Array.from(ranges).sort(compareRangeOrder);
    }
    /**
	 * Helper method to get an object with `first` and `last` indexes from an unsorted array of indexes.
	 */ _getFirstLastIndexesObject(indexes) {
        const allIndexesSorted = indexes.sort((indexA, indexB)=>indexA - indexB);
        const first = allIndexesSorted[0];
        const last = allIndexesSorted[allIndexesSorted.length - 1];
        return {
            first,
            last
        };
    }
    /**
	 * Checks if the selection does not mix a header (column or row) with other cells.
	 *
	 * For instance, in the table below valid selections consist of cells with the same letter only.
	 * So, a-a (same heading row and column) or d-d (body cells) are valid while c-d or a-b are not.
	 *
	 * header columns
	 *    ↓   ↓
	 *  ┌───┬───┬───┬───┐
	 *  │ a │ a │ b │ b │  ← header row
	 *  ├───┼───┼───┼───┤
	 *  │ c │ c │ d │ d │
	 *  ├───┼───┼───┼───┤
	 *  │ c │ c │ d │ d │
	 *  └───┴───┴───┴───┘
	 */ _areCellInTheSameTableSection(tableCells) {
        const table = tableCells[0].findAncestor('table');
        const rowIndexes = this.getRowIndexes(tableCells);
        const headingRows = parseInt(table.getAttribute('headingRows')) || 0;
        // Calculating row indexes is a bit cheaper so if this check fails we can't merge.
        if (!this._areIndexesInSameSection(rowIndexes, headingRows)) {
            return false;
        }
        const columnIndexes = this.getColumnIndexes(tableCells);
        const headingColumns = parseInt(table.getAttribute('headingColumns')) || 0;
        // Similarly cells must be in same column section.
        return this._areIndexesInSameSection(columnIndexes, headingColumns);
    }
    /**
	 * Unified check if table rows/columns indexes are in the same heading/body section.
	 */ _areIndexesInSameSection({ first, last }, headingSectionSize) {
        const firstCellIsInHeading = first < headingSectionSize;
        const lastCellIsInHeading = last < headingSectionSize;
        return firstCellIsInHeading === lastCellIsInHeading;
    }
}
/**
 * Creates empty rows at the given index in an existing table.
 *
 * @param insertAt The row index of row insertion.
 * @param rows The number of rows to create.
 * @param tableCellToInsert The number of cells to insert in each row.
 */ function createEmptyRows(writer, table, insertAt, rows, tableCellToInsert, attributes = {}) {
    const insertedRows = [];
    for(let i = 0; i < rows; i++){
        const tableRow = writer.createElement('tableRow');
        writer.insert(tableRow, table, insertAt);
        insertedRows.push(createCells(tableCellToInsert, writer, writer.createPositionAt(tableRow, 'end'), attributes));
    }
    return insertedRows;
}
/**
 * Creates cells at a given position.
 *
 * @param cells The number of cells to create
 */ function createCells(cells, writer, insertPosition, attributes = {}) {
    const createdCells = [];
    let currentPosition = insertPosition;
    for(let i = 0; i < cells; i++){
        const cell = createEmptyTableCell(writer, currentPosition, attributes);
        createdCells.push(cell);
        currentPosition = writer.createPositionAfter(cell);
    }
    return createdCells;
}
/**
 * Evenly distributes the span of a cell to a number of provided cells.
 * The resulting spans will always be integer values.
 *
 * For instance breaking a span of 7 into 3 cells will return:
 *
 * ```ts
 * { newCellsSpan: 2, updatedSpan: 3 }
 * ```
 *
 * as two cells will have a span of 2 and the remainder will go the first cell so its span will change to 3.
 *
 * @param span The span value do break.
 * @param numberOfCells The number of resulting spans.
 */ function breakSpanEvenly(span, numberOfCells) {
    if (span < numberOfCells) {
        return {
            newCellsSpan: 1,
            updatedSpan: 1
        };
    }
    const newCellsSpan = Math.floor(span / numberOfCells);
    const updatedSpan = span - newCellsSpan * numberOfCells + newCellsSpan;
    return {
        newCellsSpan,
        updatedSpan
    };
}
/**
 * Updates heading columns attribute if removing a row from head section.
 */ function adjustHeadingColumns(table, removedColumnIndexes, writer) {
    const headingColumns = table.getAttribute('headingColumns') || 0;
    if (headingColumns && removedColumnIndexes.first < headingColumns) {
        const headingsRemoved = Math.min(headingColumns - 1 /* Other numbers are 0-based */ , removedColumnIndexes.last) - removedColumnIndexes.first + 1;
        writer.setAttribute('headingColumns', headingColumns - headingsRemoved, table);
    }
}
/**
 * Calculates a new heading rows value for removing rows from heading section.
 */ function updateHeadingRows(table, { first, last }, writer) {
    const headingRows = table.getAttribute('headingRows') || 0;
    if (first < headingRows) {
        const newRows = last < headingRows ? headingRows - (last - first + 1) : first;
        updateNumericAttribute('headingRows', newRows, table, writer, 0);
    }
}
/**
 * Finds cells that will be:
 * - trimmed - Cells that are "above" removed rows sections and overlap the removed section - their rowspan must be trimmed.
 * - moved - Cells from removed rows section might stick out of. These cells are moved to the next row after a removed section.
 *
 * Sample table with overlapping & sticking out cells:
 *
 *      +----+----+----+----+----+
 *      | 00 | 01 | 02 | 03 | 04 |
 *      +----+    +    +    +    +
 *      | 10 |    |    |    |    |
 *      +----+----+    +    +    +
 *      | 20 | 21 |    |    |    | <-- removed row
 *      +    +    +----+    +    +
 *      |    |    | 32 |    |    | <-- removed row
 *      +----+    +    +----+    +
 *      | 40 |    |    | 43 |    |
 *      +----+----+----+----+----+
 *
 * In a table above:
 * - cells to trim: '02', '03' & '04'.
 * - cells to move: '21' & '32'.
 */ function getCellsToMoveAndTrimOnRemoveRow(table, { first, last }) {
    const cellsToMove = new Map();
    const cellsToTrim = [];
    for (const { row, column, cellHeight, cell } of new TableWalker(table, {
        endRow: last
    })){
        const lastRowOfCell = row + cellHeight - 1;
        const isCellStickingOutFromRemovedRows = row >= first && row <= last && lastRowOfCell > last;
        if (isCellStickingOutFromRemovedRows) {
            const rowspanInRemovedSection = last - row + 1;
            const rowSpanToSet = cellHeight - rowspanInRemovedSection;
            cellsToMove.set(column, {
                cell,
                rowspan: rowSpanToSet
            });
        }
        const isCellOverlappingRemovedRows = row < first && lastRowOfCell >= first;
        if (isCellOverlappingRemovedRows) {
            let rowspanAdjustment;
            // Cell fully covers removed section - trim it by removed rows count.
            if (lastRowOfCell >= last) {
                rowspanAdjustment = last - first + 1;
            } else {
                rowspanAdjustment = lastRowOfCell - first + 1;
            }
            cellsToTrim.push({
                cell,
                rowspan: cellHeight - rowspanAdjustment
            });
        }
    }
    return {
        cellsToMove,
        cellsToTrim
    };
}
function moveCellsToRow(table, targetRowIndex, cellsToMove, writer) {
    const tableWalker = new TableWalker(table, {
        includeAllSlots: true,
        row: targetRowIndex
    });
    const tableRowMap = [
        ...tableWalker
    ];
    const row = table.getChild(targetRowIndex);
    let previousCell;
    for (const { column, cell, isAnchor } of tableRowMap){
        if (cellsToMove.has(column)) {
            const { cell: cellToMove, rowspan } = cellsToMove.get(column);
            const targetPosition = previousCell ? writer.createPositionAfter(previousCell) : writer.createPositionAt(row, 0);
            writer.move(writer.createRangeOn(cellToMove), targetPosition);
            updateNumericAttribute('rowspan', rowspan, cellToMove, writer);
            previousCell = cellToMove;
        } else if (isAnchor) {
            // If cell is spanned then `cell` holds reference to overlapping cell. See ckeditor/ckeditor5#6502.
            previousCell = cell;
        }
    }
}
function compareRangeOrder(rangeA, rangeB) {
    // Since table cell ranges are disjoint, it's enough to check their start positions.
    const posA = rangeA.start;
    const posB = rangeB.start;
    // Checking for equal position (returning 0) is not needed because this would be either:
    // a. Intersecting range (not allowed by model)
    // b. Collapsed range on the same position (allowed by model but should not happen).
    return posA.isBefore(posB) ? -1 : 1;
}
/**
 * Calculates the area of a maximum rectangle that can span over the provided row & column indexes.
 */ function getBiggestRectangleArea(rows, columns) {
    const rowsIndexes = Array.from(rows.values());
    const columnIndexes = Array.from(columns.values());
    const lastRow = Math.max(...rowsIndexes);
    const firstRow = Math.min(...rowsIndexes);
    const lastColumn = Math.max(...columnIndexes);
    const firstColumn = Math.min(...columnIndexes);
    return (lastRow - firstRow + 1) * (lastColumn - firstColumn + 1);
}
/**
 * Updates the `tableCellType` attribute of a table cell based on its position in the table
 * and the table's `headingRows` and `headingColumns` attributes.
 */ function updateTableCellType({ writer, table, row, column, cell }) {
    const headingRows = table.getAttribute('headingRows') || 0;
    const headingColumns = table.getAttribute('headingColumns') || 0;
    if (row >= headingRows && column >= headingColumns) {
        writer.removeAttribute('tableCellType', cell);
    } else {
        writer.setAttribute('tableCellType', 'header', cell);
    }
}

/**
 * The merge cells command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'mergeTableCells'` editor command.
 *
 * For example, to merge selected table cells:
 *
 * ```ts
 * editor.execute( 'mergeTableCells' );
 * ```
 */ class MergeCellsCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const tableUtils = this.editor.plugins.get(TableUtils);
        const selectedTableCells = tableUtils.getSelectedTableCells(this.editor.model.document.selection);
        this.isEnabled = tableUtils.isSelectionRectangular(selectedTableCells);
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 */ execute() {
        const model = this.editor.model;
        const tableUtils = this.editor.plugins.get(TableUtils);
        model.change((writer)=>{
            const selectedTableCells = tableUtils.getSelectedTableCells(model.document.selection);
            // All cells will be merged into the first one.
            const firstTableCell = selectedTableCells.shift();
            // Update target cell dimensions.
            const { mergeWidth, mergeHeight } = getMergeDimensions(firstTableCell, selectedTableCells, tableUtils);
            updateNumericAttribute('colspan', mergeWidth, firstTableCell, writer);
            updateNumericAttribute('rowspan', mergeHeight, firstTableCell, writer);
            for (const tableCell of selectedTableCells){
                mergeTableCells(tableCell, firstTableCell, writer);
            }
            const table = firstTableCell.findAncestor('table');
            // Remove rows and columns that become empty (have no anchored cells).
            removeEmptyRowsColumns(table, tableUtils);
            writer.setSelection(firstTableCell, 'in');
        });
    }
}
/**
 *  Merges two table cells. It will ensure that after merging cells with empty paragraphs the resulting table cell will only have one
 * paragraph. If one of the merged table cells is empty, the merged table cell will have contents of the non-empty table cell.
 * If both are empty, the merged table cell will have only one empty paragraph.
 */ function mergeTableCells(cellBeingMerged, targetCell, writer) {
    if (!isEmpty$1(cellBeingMerged)) {
        if (isEmpty$1(targetCell)) {
            writer.remove(writer.createRangeIn(targetCell));
        }
        writer.move(writer.createRangeIn(cellBeingMerged), writer.createPositionAt(targetCell, 'end'));
    }
    // Remove merged table cell.
    writer.remove(cellBeingMerged);
}
/**
 * Checks if the passed table cell contains an empty paragraph.
 */ function isEmpty$1(tableCell) {
    const firstTableChild = tableCell.getChild(0);
    return tableCell.childCount == 1 && firstTableChild.is('element', 'paragraph') && firstTableChild.isEmpty;
}
function getMergeDimensions(firstTableCell, selectedTableCells, tableUtils) {
    let maxWidthOffset = 0;
    let maxHeightOffset = 0;
    for (const tableCell of selectedTableCells){
        const { row, column } = tableUtils.getCellLocation(tableCell);
        maxWidthOffset = getMaxOffset(tableCell, column, maxWidthOffset, 'colspan');
        maxHeightOffset = getMaxOffset(tableCell, row, maxHeightOffset, 'rowspan');
    }
    // Update table cell span attribute and merge set selection on a merged contents.
    const { row: firstCellRow, column: firstCellColumn } = tableUtils.getCellLocation(firstTableCell);
    const mergeWidth = maxWidthOffset - firstCellColumn;
    const mergeHeight = maxHeightOffset - firstCellRow;
    return {
        mergeWidth,
        mergeHeight
    };
}
function getMaxOffset(tableCell, start, currentMaxOffset, which) {
    const dimensionValue = parseInt(tableCell.getAttribute(which) || '1');
    return Math.max(currentMaxOffset, start + dimensionValue);
}

/**
 * The select row command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'selectTableRow'` editor command.
 *
 * To select the rows containing the selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'selectTableRow' );
 * ```
 */ class SelectRowCommand extends Command {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        // It does not affect data so should be enabled in read-only mode.
        this.affectsData = false;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const selectedCells = tableUtils.getSelectionAffectedTableCells(this.editor.model.document.selection);
        this.isEnabled = selectedCells.length > 0;
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const model = this.editor.model;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const referenceCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        const rowIndexes = tableUtils.getRowIndexes(referenceCells);
        const table = referenceCells[0].findAncestor('table');
        const rangesToSelect = [];
        for(let rowIndex = rowIndexes.first; rowIndex <= rowIndexes.last; rowIndex++){
            for (const cell of table.getChild(rowIndex).getChildren()){
                rangesToSelect.push(model.createRangeOn(cell));
            }
        }
        model.change((writer)=>{
            writer.setSelection(rangesToSelect);
        });
    }
}

/**
 * The select column command.
 *
 * The command is registered by {@link module:table/tableediting~TableEditing} as the `'selectTableColumn'` editor command.
 *
 * To select the columns containing the selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'selectTableColumn' );
 * ```
 */ class SelectColumnCommand extends Command {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        // It does not affect data so should be enabled in read-only mode.
        this.affectsData = false;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const selectedCells = tableUtils.getSelectionAffectedTableCells(this.editor.model.document.selection);
        this.isEnabled = selectedCells.length > 0;
    }
    /**
	 * @inheritDoc
	 */ execute() {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const model = this.editor.model;
        const referenceCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        const firstCell = referenceCells[0];
        const lastCell = referenceCells.pop();
        const table = firstCell.findAncestor('table');
        const startLocation = tableUtils.getCellLocation(firstCell);
        const endLocation = tableUtils.getCellLocation(lastCell);
        const startColumn = Math.min(startLocation.column, endLocation.column);
        const endColumn = Math.max(startLocation.column, endLocation.column);
        const rangesToSelect = [];
        for (const cellInfo of new TableWalker(table, {
            startColumn,
            endColumn
        })){
            rangesToSelect.push(model.createRangeOn(cellInfo.cell));
        }
        model.change((writer)=>{
            writer.setSelection(rangesToSelect);
        });
    }
}

/**
 * Injects a table layout post-fixer into the model.
 *
 * The role of the table layout post-fixer is to ensure that the table rows have the correct structure
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * The correct structure means that:
 *
 * * All table rows have the same size.
 * * None of the table cells extend vertically beyond their section (either header or body).
 * * A table cell has always at least one element as a child.
 *
 * If the table structure is not correct, the post-fixer will automatically correct it in two steps:
 *
 * 1. It will clip table cells that extend beyond their section.
 * 2. It will add empty table cells to the rows that are narrower than the widest table row.
 *
 * ## Clipping overlapping table cells
 *
 * Such situation may occur when pasting a table (or a part of a table) to the editor from external sources.
 *
 * For example, see the following table which has a cell (FOO) with the rowspan attribute (2):
 *
 * ```xml
 * <table headingRows="1">
 *   <tableRow>
 *     <tableCell rowspan="2"><paragraph>FOO</paragraph></tableCell>
 *     <tableCell colspan="2"><paragraph>BAR</paragraph></tableCell>
 *   </tableRow>
 *   <tableRow>
 *     <tableCell><paragraph>BAZ</paragraph></tableCell>
 *     <tableCell><paragraph>XYZ</paragraph></tableCell>
 *   </tableRow>
 * </table>
 * ```
 *
 * It will be rendered in the view as:
 *
 * ```xml
 * <table>
 *   <thead>
 *     <tr>
 *       <td rowspan="2">FOO</td>
 *       <td colspan="2">BAR</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>BAZ</td>
 *       <td>XYZ</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 *
 * In the above example the table will be rendered as a table with two rows: one in the header and second one in the body.
 * The table cell (FOO) cannot span over multiple rows as it would extend from the header to the body section.
 * The `rowspan` attribute must be changed to (1). The value (1) is the default value of the `rowspan` attribute
 * so the `rowspan` attribute will be removed from the model.
 *
 * The table cell with BAZ in the content will be in the first column of the table.
 *
 * ## Adding missing table cells
 *
 * The table post-fixer will insert empty table cells to equalize table row sizes (the number of columns).
 * The size of a table row is calculated by counting column spans of table cells, both horizontal (from the same row) and
 * vertical (from the rows above).
 *
 * In the above example, the table row in the body section of the table is narrower then the row from the header: it has two cells
 * with the default colspan (1). The header row has one cell with colspan (1) and the second with colspan (2).
 * The table cell (FOO) does not extend beyond the head section (and as such will be fixed in the first step of this post-fixer).
 * The post-fixer will add a missing table cell to the row in the body section of the table.
 *
 * The table from the above example will be fixed and rendered to the view as below:
 *
 * ```xml
 * <table>
 *   <thead>
 *     <tr>
 *       <td rowspan="2">FOO</td>
 *       <td colspan="2">BAR</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>BAZ</td>
 *       <td>XYZ</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 *
 * ## Collaboration and undo - Expectations vs post-fixer results
 *
 * The table post-fixer only ensures proper structure without a deeper analysis of the nature of the change. As such, it might lead
 * to a structure which was not intended by the user. In particular, it will also fix undo steps (in conjunction with collaboration)
 * in which the editor content might not return to the original state.
 *
 * This will usually happen when one or more users change the size of the table.
 *
 * As an example see the table below:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>11</td>
 *       <td>12</td>
 *     </tr>
 *     <tr>
 *       <td>21</td>
 *       <td>22</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 *
 * and the user actions:
 *
 * 1. Both users have a table with two rows and two columns.
 * 2. User A adds a column at the end of the table. This will insert empty table cells to two rows.
 * 3. User B adds a row at the end of the table. This will insert a row with two empty table cells.
 * 4. Both users will have a table as below:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>11</td>
 *       <td>12</td>
 *       <td>(empty, inserted by A)</td>
 *     </tr>
 *     <tr>
 *       <td>21</td>
 *       <td>22</td>
 *       <td>(empty, inserted by A)</td>
 *     </tr>
 *     <tr>
 *       <td>(empty, inserted by B)</td>
 *       <td>(empty, inserted by B)</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 *
 * The last row is shorter then others so the table post-fixer will add an empty row to the last row:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>11</td>
 *       <td>12</td>
 *       <td>(empty, inserted by A)</td>
 *     </tr>
 *     <tr>
 *       <td>21</td>
 *       <td>22</td>
 *       <td>(empty, inserted by A)</td>
 *     </tr>
 *     <tr>
 *       <td>(empty, inserted by B)</td>
 *       <td>(empty, inserted by B)</td>
 *       <td>(empty, inserted by the post-fixer)</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 *
 * Unfortunately undo does not know the nature of the changes and depending on which user applies the post-fixer changes, undoing them
 * might lead to a broken table. If User B undoes inserting the column to the table, the undo engine will undo only the operations of
 * inserting empty cells to rows from the initial table state (row 1 and 2) but the cell in the post-fixed row will remain:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>11</td>
 *       <td>12</td>
 *     </tr>
 *     <tr>
 *       <td>21</td>
 *       <td>22</td>
 *     </tr>
 *     <tr>
 *       <td>(empty, inserted by B)</td>
 *       <td>(empty, inserted by B)</td>
 *       <td>(empty, inserted by a post-fixer)</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 *
 * After undo, the table post-fixer will detect that two rows are shorter than others and will fix the table to:
 *
 * ```xml
 * <table>
 *   <tbody>
 *     <tr>
 *       <td>11</td>
 *       <td>12</td>
 *       <td>(empty, inserted by a post-fixer after undo)</td>
 *     </tr>
 *     <tr>
 *       <td>21</td>
 *       <td>22</td>
 *       <td>(empty, inserted by a post-fixer after undo)</td>
 *     </tr>
 *     <tr>
 *       <td>(empty, inserted by B)</td>
 *       <td>(empty, inserted by B)</td>
 *       <td>(empty, inserted by a post-fixer)</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 *
 * @internal
 */ function injectTableLayoutPostFixer(model) {
    model.document.registerPostFixer((writer)=>tableLayoutPostFixer(writer, model));
}
/**
 * The table layout post-fixer.
 */ function tableLayoutPostFixer(writer, model) {
    const changes = model.document.differ.getChanges();
    let wasFixed = false;
    // Do not analyze the same table more then once - may happen for multiple changes in the same table.
    const analyzedTables = new Set();
    for (const entry of changes){
        let table = null;
        if (entry.type == 'insert' && entry.name == 'table') {
            table = entry.position.nodeAfter;
        }
        // Fix table on adding/removing table cells and rows.
        if ((entry.type == 'insert' || entry.type == 'remove') && (entry.name == 'tableRow' || entry.name == 'tableCell')) {
            table = entry.position.findAncestor('table');
        }
        // Fix table on any table's attribute change - including attributes of table cells.
        if (isTableAttributeEntry(entry)) {
            table = entry.range.start.findAncestor('table');
        }
        if (table && !analyzedTables.has(table)) {
            // Step 1: correct rowspans of table cells if necessary.
            // The wasFixed flag should be true if any of tables in batch was fixed - might be more then one.
            wasFixed = fixTableCellsRowspan(table, writer) || wasFixed;
            // Step 2: fix table rows sizes.
            wasFixed = fixTableRowsSizes(table, writer) || wasFixed;
            analyzedTables.add(table);
        }
    }
    return wasFixed;
}
/**
 * Fixes the invalid value of the `rowspan` attribute because a table cell cannot vertically extend beyond the table section it belongs to.
 *
 * @returns Returns `true` if the table was fixed.
 */ function fixTableCellsRowspan(table, writer) {
    let wasFixed = false;
    const cellsToTrim = findCellsToTrim(table);
    if (cellsToTrim.length) {
        // @if CK_DEBUG_TABLE // console.log( `Post-fixing table: trimming cells row-spans (${ cellsToTrim.length }).` );
        wasFixed = true;
        for (const data of cellsToTrim){
            updateNumericAttribute('rowspan', data.rowspan, data.cell, writer, 1);
        }
    }
    return wasFixed;
}
/**
 * Makes all table rows in a table the same size.
 *
 * @returns Returns `true` if the table was fixed.
 */ function fixTableRowsSizes(table, writer) {
    let wasFixed = false;
    const childrenLengths = getChildrenLengths(table);
    const rowsToRemove = [];
    // Find empty rows.
    for (const [rowIndex, size] of childrenLengths.entries()){
        // Ignore all non-row models.
        if (!size && table.getChild(rowIndex).is('element', 'tableRow')) {
            rowsToRemove.push(rowIndex);
        }
    }
    // Remove empty rows.
    if (rowsToRemove.length) {
        // @if CK_DEBUG_TABLE // console.log( `Post-fixing table: remove empty rows (${ rowsToRemove.length }).` );
        wasFixed = true;
        for (const rowIndex of rowsToRemove.reverse()){
            writer.remove(table.getChild(rowIndex));
            childrenLengths.splice(rowIndex, 1);
        }
    }
    // Filter out everything that's not a table row.
    const rowsLengths = childrenLengths.filter((row, rowIndex)=>table.getChild(rowIndex).is('element', 'tableRow'));
    // Verify if all the rows have the same number of columns.
    const tableSize = rowsLengths[0];
    const isValid = rowsLengths.every((length)=>length === tableSize);
    if (!isValid) {
        // @if CK_DEBUG_TABLE // console.log( 'Post-fixing table: adding missing cells.' );
        // Find the maximum number of columns.
        const maxColumns = rowsLengths.reduce((prev, current)=>current > prev ? current : prev, 0);
        for (const [rowIndex, size] of rowsLengths.entries()){
            const columnsToInsert = maxColumns - size;
            if (columnsToInsert) {
                for(let i = 0; i < columnsToInsert; i++){
                    createEmptyTableCell(writer, writer.createPositionAt(table.getChild(rowIndex), 'end'));
                }
                wasFixed = true;
            }
        }
    }
    return wasFixed;
}
/**
 * Searches for table cells that extend beyond the table section to which they belong to. It will return an array of objects
 * that stores table cells to be trimmed and the correct value of the `rowspan` attribute to set.
 */ function findCellsToTrim(table) {
    const headingRows = parseInt(table.getAttribute('headingRows') || '0');
    const maxRows = Array.from(table.getChildren()).reduce((count, row)=>row.is('element', 'tableRow') ? count + 1 : count, 0);
    const cellsToTrim = [];
    for (const { row, cell, cellHeight } of new TableWalker(table)){
        // Skip cells that do not expand over its row.
        if (cellHeight < 2) {
            continue;
        }
        const isInHeader = row < headingRows;
        // Row limit is either end of header section or whole table as table body is after the header.
        const rowLimit = isInHeader ? headingRows : maxRows;
        // If table cell expands over its limit reduce it height to proper value.
        if (row + cellHeight > rowLimit) {
            const newRowspan = rowLimit - row;
            cellsToTrim.push({
                cell,
                rowspan: newRowspan
            });
        }
    }
    return cellsToTrim;
}
/**
 * Returns an array with lengths of rows assigned to the corresponding row index.
 */ function getChildrenLengths(table) {
    // TableWalker will not provide items for the empty rows, we need to pre-fill this array.
    const lengths = new Array(table.childCount).fill(0);
    for (const { rowIndex } of new TableWalker(table, {
        includeAllSlots: true
    })){
        lengths[rowIndex]++;
    }
    return lengths;
}
/**
 * Checks if the differ entry for an attribute change is one of the table's attributes.
 */ function isTableAttributeEntry(entry) {
    if (entry.type !== 'attribute') {
        return false;
    }
    const key = entry.attributeKey;
    return key === 'headingRows' || key === 'colspan' || key === 'rowspan';
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module table/converters/table-cell-paragraph-post-fixer
 */ /**
 * Injects a table cell post-fixer into the model which inserts a `paragraph` element into empty table cells.
 *
 * A table cell must contain at least one block element as a child. An empty table cell will have an empty `paragraph` as a child.
 *
 * ```xml
 * <table>
 *   <tableRow>
 *      <tableCell></tableCell>
 *   </tableRow>
 * </table>
 * ```
 *
 * Will be fixed to:
 *
 * ```xml
 * <table>
 *   <tableRow>
 *      <tableCell><paragraph></paragraph></tableCell>
 *   </tableRow>
 * </table>
 * ```
 *
 * @internal
 */ function injectTableCellParagraphPostFixer(model) {
    model.document.registerPostFixer((writer)=>tableCellContentsPostFixer(writer, model));
}
/**
 * The table cell contents post-fixer.
 */ function tableCellContentsPostFixer(writer, model) {
    const changes = model.document.differ.getChanges();
    let wasFixed = false;
    for (const entry of changes){
        if (entry.type == 'insert' && entry.name == 'table') {
            wasFixed = fixTable(entry.position.nodeAfter, writer) || wasFixed;
        }
        if (entry.type == 'insert' && entry.name == 'tableRow') {
            wasFixed = fixTableRow(entry.position.nodeAfter, writer) || wasFixed;
        }
        if (entry.type == 'insert' && entry.name == 'tableCell') {
            wasFixed = fixTableCellContent(entry.position.nodeAfter, writer) || wasFixed;
        }
        if ((entry.type == 'remove' || entry.type == 'insert') && checkTableCellChange(entry)) {
            wasFixed = fixTableCellContent(entry.position.parent, writer) || wasFixed;
        }
    }
    return wasFixed;
}
/**
 * Fixes all table cells in a table.
 */ function fixTable(table, writer) {
    let wasFixed = false;
    for (const row of table.getChildren()){
        if (row.is('element', 'tableRow')) {
            wasFixed = fixTableRow(row, writer) || wasFixed;
        }
    }
    return wasFixed;
}
/**
 * Fixes all table cells in a table row.
 */ function fixTableRow(tableRow, writer) {
    let wasFixed = false;
    for (const tableCell of tableRow.getChildren()){
        wasFixed = fixTableCellContent(tableCell, writer) || wasFixed;
    }
    return wasFixed;
}
/**
 * Fixes all table cell content by:
 * - Adding a paragraph to a table cell without any child.
 * - Wrapping direct $text in a `<paragraph>`.
 */ function fixTableCellContent(tableCell, writer) {
    // Insert paragraph to an empty table cell.
    if (tableCell.childCount == 0) {
        // @if CK_DEBUG_TABLE // console.log( 'Post-fixing table: insert paragraph in empty cell.' );
        writer.insertElement('paragraph', tableCell);
        return true;
    }
    // Check table cell children for directly placed text nodes.
    // Temporary solution. See https://github.com/ckeditor/ckeditor5/issues/1464.
    const textNodes = Array.from(tableCell.getChildren()).filter((child)=>child.is('$text'));
    // @if CK_DEBUG_TABLE // textNodes.length && console.log( 'Post-fixing table: wrap cell content with paragraph.' );
    for (const child of textNodes){
        writer.wrap(writer.createRangeOn(child), 'paragraph');
    }
    // Return true when there were text nodes to fix.
    return !!textNodes.length;
}
/**
 * Checks if a differ change should fix the table cell. This happens on:
 * - Removing content from the table cell (i.e. `tableCell` can be left empty).
 * - Adding a text node directly into a table cell.
 */ function checkTableCellChange(entry) {
    if (!entry.position.parent.is('element', 'tableCell')) {
        return false;
    }
    return entry.type == 'insert' && entry.name == '$text' || entry.type == 'remove';
}

/**
 * A table headings refresh handler which marks the table cells or rows in the differ to have it re-rendered
 * if the headings attribute changed.
 *
 * Table heading rows and heading columns are represented in the model by a `headingRows` and `headingColumns` attributes.
 *
 * When table headings attribute changes, all the cells/rows are marked to re-render to change between `<td>` and `<th>`.
 *
 * @internal
 */ function tableHeadingsRefreshHandler(model, editing) {
    const differ = model.document.differ;
    for (const change of differ.getChanges()){
        let table;
        let isRowChange = false;
        if (change.type == 'attribute') {
            const element = change.range.start.nodeAfter;
            if (!element || !element.is('element', 'table')) {
                continue;
            }
            if (change.attributeKey != 'headingRows' && change.attributeKey != 'headingColumns') {
                continue;
            }
            table = element;
            isRowChange = change.attributeKey == 'headingRows';
        } else if (change.name == 'tableRow' || change.name == 'tableCell') {
            table = change.position.findAncestor('table');
            isRowChange = change.name == 'tableRow';
        }
        if (!table) {
            continue;
        }
        const headingRows = table.getAttribute('headingRows') || 0;
        const headingColumns = table.getAttribute('headingColumns') || 0;
        const tableWalker = new TableWalker(table);
        for (const tableSlot of tableWalker){
            const isHeading = tableSlot.row < headingRows || tableSlot.column < headingColumns;
            const expectedElementName = isHeading ? 'th' : 'td';
            const viewElement = editing.mapper.toViewElement(tableSlot.cell);
            if (viewElement && viewElement.is('element') && viewElement.name != expectedElementName) {
                editing.reconvertItem(isRowChange ? tableSlot.cell.parent : tableSlot.cell);
            }
        }
    }
}

/**
 * A table cell refresh handler which marks the table cell in the differ to have it re-rendered.
 *
 * Model `paragraph` inside a table cell can be rendered as `<span>` or `<p>`. It is rendered as `<span>` if this is the only block
 * element in that table cell and it does not have any attributes. It is rendered as `<p>` otherwise.
 *
 * When table cell content changes, for example a second `paragraph` element is added, we need to ensure that the first `paragraph` is
 * re-rendered so it changes from `<span>` to `<p>`. The easiest way to do it is to re-render the entire table cell.
 *
 * @internal
 */ function tableCellRefreshHandler(model, editing) {
    const differ = model.document.differ;
    // Stores cells to be refreshed, so the table cell will be refreshed once for multiple changes.
    const cellsToCheck = new Set();
    for (const change of differ.getChanges()){
        const parent = change.type == 'attribute' ? change.range.start.parent : change.position.parent;
        if (parent.is('element', 'tableCell')) {
            cellsToCheck.add(parent);
        }
    }
    for (const tableCell of cellsToCheck.values()){
        const paragraphsToRefresh = Array.from(tableCell.getChildren()).filter((child)=>shouldRefresh(child, editing.mapper));
        for (const paragraph of paragraphsToRefresh){
            editing.reconvertItem(paragraph);
        }
    }
}
/**
 * Check if given model element needs refreshing.
 */ function shouldRefresh(child, mapper) {
    if (!child.is('element', 'paragraph')) {
        return false;
    }
    const viewElement = mapper.toViewElement(child);
    if (!viewElement) {
        return false;
    }
    return isSingleParagraphWithoutAttributes(child) !== viewElement.is('element', 'span');
}

/**
 * The table editing feature.
 */ class TableEditing extends Plugin {
    /**
	 * Handlers for creating additional slots in the table.
	 */ _additionalSlots;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._additionalSlots = [];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const schema = model.schema;
        const conversion = editor.conversion;
        const tableUtils = editor.plugins.get(TableUtils);
        schema.register('table', {
            inheritAllFrom: '$blockObject',
            allowAttributes: [
                'headingRows',
                'headingColumns'
            ]
        });
        schema.register('tableRow', {
            allowIn: 'table',
            isLimit: true
        });
        schema.register('tableCell', {
            allowContentOf: '$container',
            allowIn: 'tableRow',
            allowAttributes: [
                'colspan',
                'rowspan'
            ],
            isLimit: true,
            isSelectable: true
        });
        // Figure conversion.
        conversion.for('upcast').add(upcastTableFigure());
        // Table conversion.
        conversion.for('upcast').add(upcastTable());
        conversion.for('editingDowncast').elementToStructure({
            model: {
                name: 'table',
                attributes: [
                    'headingRows'
                ]
            },
            view: downcastTable(tableUtils, {
                asWidget: true,
                additionalSlots: this._additionalSlots
            })
        });
        conversion.for('dataDowncast').elementToStructure({
            model: {
                name: 'table',
                attributes: [
                    'headingRows'
                ]
            },
            view: downcastTable(tableUtils, {
                additionalSlots: this._additionalSlots
            })
        });
        // Table row conversion.
        conversion.for('upcast').elementToElement({
            model: 'tableRow',
            view: 'tr'
        });
        conversion.for('upcast').add(skipEmptyTableRow());
        conversion.for('downcast').elementToElement({
            model: 'tableRow',
            view: downcastRow()
        });
        // Table cell conversion.
        conversion.for('upcast').elementToElement({
            model: 'tableCell',
            view: 'td'
        });
        conversion.for('upcast').elementToElement({
            model: 'tableCell',
            view: 'th'
        });
        conversion.for('upcast').add(ensureParagraphInTableCell('td'));
        conversion.for('upcast').add(ensureParagraphInTableCell('th'));
        conversion.for('editingDowncast').elementToElement({
            model: 'tableCell',
            view: downcastCell({
                asWidget: true,
                cellTypeEnabled: ()=>isTableCellTypeEnabled(this.editor)
            })
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'tableCell',
            view: downcastCell({
                cellTypeEnabled: ()=>isTableCellTypeEnabled(this.editor)
            })
        });
        // Duplicates code - needed to properly refresh paragraph inside a table cell.
        conversion.for('editingDowncast').elementToElement({
            model: 'paragraph',
            view: convertParagraphInTableCell({
                asWidget: true
            }),
            converterPriority: 'high'
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'paragraph',
            view: convertParagraphInTableCell(),
            converterPriority: 'high'
        });
        // Table attributes conversion.
        conversion.for('downcast').attributeToAttribute({
            model: 'colspan',
            view: 'colspan'
        });
        conversion.for('upcast').attributeToAttribute({
            model: {
                key: 'colspan',
                value: upcastCellSpan('colspan')
            },
            view: 'colspan'
        });
        conversion.for('downcast').attributeToAttribute({
            model: 'rowspan',
            view: 'rowspan'
        });
        conversion.for('upcast').attributeToAttribute({
            model: {
                key: 'rowspan',
                value: upcastCellSpan('rowspan')
            },
            view: 'rowspan'
        });
        // Plain table output converters (also used in the clipboard pipeline).
        this._addPlainTableOutputConverters();
        // Define the config.
        editor.config.define('table.defaultHeadings.rows', 0);
        editor.config.define('table.defaultHeadings.columns', 0);
        editor.config.define('table.showHiddenBorders', true);
        if (editor.config.get('table.showHiddenBorders')) {
            editor.editing.view.change((writer)=>{
                for (const root of editor.editing.view.document.roots){
                    writer.addClass('ck-table-show-hidden-borders', root);
                }
            });
        }
        // Define all the commands.
        editor.commands.add('insertTable', new InsertTableCommand(editor));
        editor.commands.add('insertTableRowAbove', new InsertRowCommand(editor, {
            order: 'above'
        }));
        editor.commands.add('insertTableRowBelow', new InsertRowCommand(editor, {
            order: 'below'
        }));
        editor.commands.add('insertTableColumnLeft', new InsertColumnCommand(editor, {
            order: 'left'
        }));
        editor.commands.add('insertTableColumnRight', new InsertColumnCommand(editor, {
            order: 'right'
        }));
        editor.commands.add('removeTableRow', new RemoveRowCommand(editor));
        editor.commands.add('removeTableColumn', new RemoveColumnCommand(editor));
        editor.commands.add('splitTableCellVertically', new SplitCellCommand(editor, {
            direction: 'vertically'
        }));
        editor.commands.add('splitTableCellHorizontally', new SplitCellCommand(editor, {
            direction: 'horizontally'
        }));
        editor.commands.add('mergeTableCells', new MergeCellsCommand(editor));
        editor.commands.add('mergeTableCellRight', new MergeCellCommand(editor, {
            direction: 'right'
        }));
        editor.commands.add('mergeTableCellLeft', new MergeCellCommand(editor, {
            direction: 'left'
        }));
        editor.commands.add('mergeTableCellDown', new MergeCellCommand(editor, {
            direction: 'down'
        }));
        editor.commands.add('mergeTableCellUp', new MergeCellCommand(editor, {
            direction: 'up'
        }));
        editor.commands.add('setTableColumnHeader', new SetHeaderColumnCommand(editor));
        editor.commands.add('setTableRowHeader', new SetHeaderRowCommand(editor));
        editor.commands.add('selectTableRow', new SelectRowCommand(editor));
        editor.commands.add('selectTableColumn', new SelectColumnCommand(editor));
        injectTableLayoutPostFixer(model);
        injectTableCellParagraphPostFixer(model);
        this.listenTo(model.document, 'change:data', ()=>{
            // It's no longer needed to refresh table headings on every data change if table cell type feature is enabled.
            // It's because headings rows / columns are updated based on cell types which triggers their own refresh handler.
            if (!isTableCellTypeEnabled(editor)) {
                tableHeadingsRefreshHandler(model, editor.editing);
            }
            tableCellRefreshHandler(model, editor.editing);
        });
    }
    /**
	 * Registers downcast handler for the additional table slot.
	 */ registerAdditionalSlot(slotHandler) {
        this._additionalSlots.push(slotHandler);
    }
    /**
	 * Adds converters for plain table output. These converters are used either when the `PlainTableOutput` plugin is loaded
	 * or when content is processed by the clipboard pipeline, ensuring that pasted tables are not wrapped in a <figure> element.
	 */ _addPlainTableOutputConverters() {
        const editor = this.editor;
        // Override default table data downcast converter.
        editor.conversion.for('dataDowncast').elementToStructure({
            model: 'table',
            view: convertPlainTable(editor),
            converterPriority: 'high'
        });
        // Make sure table <caption> is downcasted into <caption> in the data pipeline when necessary.
        if (editor.plugins.has('TableCaptionEditing')) {
            editor.conversion.for('dataDowncast').elementToElement({
                model: 'caption',
                view: convertPlainTableCaption(editor),
                converterPriority: 'high'
            });
        }
        // Handle border-style, border-color, border-width and background-color table attributes.
        if (editor.plugins.has('TablePropertiesEditing')) {
            downcastTableBorderAndBackgroundAttributes(editor);
        }
    }
}
/**
 * Returns fixed colspan and rowspan attrbutes values.
 *
 * @param type colspan or rowspan.
 * @returns conversion value function.
 */ function upcastCellSpan(type) {
    return (cell)=>{
        const span = parseInt(cell.getAttribute(type));
        if (Number.isNaN(span) || span <= 0) {
            return null;
        }
        return span;
    };
}

/**
 * The table size view.
 *
 * It renders a 10x10 grid to choose the inserted table size.
 *
 * @internal
 */ class InsertTableView extends View {
    /**
	 * A collection of table size box items.
	 */ items;
    /**
	 * Listen to `keydown` events fired in this view's main element.
	 */ keystrokes;
    /**
	 * Tracks information about the DOM focus in the grid.
	 */ focusTracker;
    /**
	 * @inheritDoc
	 */ constructor(locale){
        super(locale);
        const bind = this.bindTemplate;
        this.items = this._createGridCollection();
        this.keystrokes = new KeystrokeHandler();
        this.focusTracker = new FocusTracker();
        this.set('rows', 0);
        this.set('columns', 0);
        this.bind('label').to(this, 'columns', this, 'rows', (columns, rows)=>`${rows} × ${columns}`);
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck'
                ]
            },
            children: [
                {
                    tag: 'div',
                    attributes: {
                        class: [
                            'ck-insert-table-dropdown__grid'
                        ]
                    },
                    on: {
                        'mouseover@.ck-insert-table-dropdown-grid-box': bind.to('boxover')
                    },
                    children: this.items
                },
                {
                    tag: 'div',
                    attributes: {
                        class: [
                            'ck',
                            'ck-insert-table-dropdown__label'
                        ],
                        'aria-hidden': true
                    },
                    children: [
                        {
                            text: bind.to('label')
                        }
                    ]
                }
            ],
            on: {
                mousedown: bind.to((evt)=>{
                    evt.preventDefault();
                }),
                click: bind.to(()=>{
                    this.fire('execute');
                })
            }
        });
        // #rows and #columns are set via changes to #focusTracker on mouse over.
        this.on('boxover', (evt, domEvt)=>{
            const { row, column } = domEvt.target.dataset;
            this.items.get((parseInt(row, 10) - 1) * 10 + (parseInt(column, 10) - 1)).focus();
        });
        // This allows the #rows and #columns to be updated when:
        // * the user navigates the grid using the keyboard,
        // * the user moves the mouse over grid items.
        this.focusTracker.on('change:focusedElement', (evt, name, focusedElement)=>{
            if (!focusedElement) {
                return;
            }
            const { row, column } = focusedElement.dataset;
            // As row & column indexes are zero-based transform it to number of selected rows & columns.
            this.set({
                rows: parseInt(row),
                columns: parseInt(column)
            });
        });
        this.on('change:columns', ()=>this._highlightGridBoxes());
        this.on('change:rows', ()=>this._highlightGridBoxes());
    }
    render() {
        super.render();
        addKeyboardHandlingForGrid({
            keystrokeHandler: this.keystrokes,
            focusTracker: this.focusTracker,
            gridItems: this.items,
            numberOfColumns: 10,
            uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
        });
        for (const item of this.items){
            this.focusTracker.add(item.element);
        }
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * Resets the rows and columns selection.
	 */ reset() {
        this.set({
            rows: 1,
            columns: 1
        });
    }
    /**
	 * @inheritDoc
	 */ focus() {
        this.items.get(0).focus();
    }
    /**
	 * @inheritDoc
	 */ focusLast() {
        this.items.get(0).focus();
    }
    /**
	 * Highlights grid boxes depending on rows and columns selected.
	 */ _highlightGridBoxes() {
        const rows = this.rows;
        const columns = this.columns;
        this.items.map((boxView, index)=>{
            // Translate box index to the row & column index.
            const itemRow = Math.floor(index / 10);
            const itemColumn = index % 10;
            // Grid box is highlighted when its row & column index belongs to selected number of rows & columns.
            const isOn = itemRow < rows && itemColumn < columns;
            boxView.set('isOn', isOn);
        });
    }
    /**
	 * Creates a new Button for the grid.
	 *
	 * @param locale The locale instance.
	 * @param row Row number.
	 * @param column Column number.
	 * @param label The grid button label.
	 */ _createGridButton(locale, row, column, label) {
        const button = new ButtonView(locale);
        button.set({
            label,
            class: 'ck-insert-table-dropdown-grid-box'
        });
        button.extendTemplate({
            attributes: {
                'data-row': row,
                'data-column': column
            }
        });
        return button;
    }
    /**
	 * @returns A view collection containing boxes to be placed in a table grid.
	 */ _createGridCollection() {
        const boxes = [];
        // Add grid boxes to table selection view.
        for(let index = 0; index < 100; index++){
            const row = Math.floor(index / 10);
            const column = index % 10;
            const label = `${row + 1} × ${column + 1}`;
            boxes.push(this._createGridButton(this.locale, row + 1, column + 1, label));
        }
        return this.createCollection(boxes);
    }
}

/**
 * The table UI plugin. It introduces:
 *
 * * The `'insertTable'` dropdown,
 * * The `'menuBar:insertTable'` menu bar menu,
 * * The `'tableColumn'` dropdown,
 * * The `'tableRow'` dropdown,
 * * The `'mergeTableCells'` split button.
 *
 * The `'tableColumn'`, `'tableRow'` and `'mergeTableCells'` dropdowns work best with {@link module:table/tabletoolbar~TableToolbar}.
 */ class TableUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = this.editor.t;
        const contentLanguageDirection = editor.locale.contentLanguageDirection;
        const isContentLtr = contentLanguageDirection === 'ltr';
        editor.ui.componentFactory.add('insertTable', (locale)=>{
            const command = editor.commands.get('insertTable');
            const dropdownView = createDropdown(locale);
            dropdownView.bind('isEnabled').to(command);
            // Decorate dropdown's button.
            dropdownView.buttonView.set({
                icon: IconTable,
                label: t('Insert table'),
                tooltip: true
            });
            let insertTableView;
            dropdownView.on('change:isOpen', ()=>{
                if (insertTableView) {
                    return;
                }
                // Prepare custom view for dropdown's panel.
                insertTableView = new InsertTableView(locale);
                dropdownView.panelView.children.add(insertTableView);
                insertTableView.delegate('execute').to(dropdownView);
                dropdownView.on('execute', ()=>{
                    editor.execute('insertTable', {
                        rows: insertTableView.rows,
                        columns: insertTableView.columns
                    });
                    editor.editing.view.focus();
                });
            });
            return dropdownView;
        });
        editor.ui.componentFactory.add('menuBar:insertTable', (locale)=>{
            const command = editor.commands.get('insertTable');
            const menuView = new MenuBarMenuView(locale);
            const insertTableView = new InsertTableView(locale);
            insertTableView.delegate('execute').to(menuView);
            menuView.on('change:isOpen', (event, name, isOpen)=>{
                if (!isOpen) {
                    insertTableView.reset();
                }
            });
            insertTableView.on('execute', ()=>{
                editor.execute('insertTable', {
                    rows: insertTableView.rows,
                    columns: insertTableView.columns
                });
                editor.editing.view.focus();
            });
            menuView.buttonView.set({
                label: t('Table'),
                icon: IconTable
            });
            menuView.panelView.children.add(insertTableView);
            menuView.bind('isEnabled').to(command);
            return menuView;
        });
        editor.ui.componentFactory.add('tableColumn', (locale)=>{
            const options = [
                {
                    type: 'switchbutton',
                    model: {
                        commandName: 'setTableColumnHeader',
                        label: t('Header column'),
                        bindIsOn: true
                    }
                },
                {
                    type: 'separator'
                },
                {
                    type: 'button',
                    model: {
                        commandName: isContentLtr ? 'insertTableColumnLeft' : 'insertTableColumnRight',
                        label: t('Insert column left')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: isContentLtr ? 'insertTableColumnRight' : 'insertTableColumnLeft',
                        label: t('Insert column right')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'removeTableColumn',
                        label: t('Delete column')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'selectTableColumn',
                        label: t('Select column')
                    }
                }
            ];
            return this._prepareDropdown(t('Column'), IconTableColumn, options, locale);
        });
        editor.ui.componentFactory.add('tableRow', (locale)=>{
            const options = [
                {
                    type: 'switchbutton',
                    model: {
                        commandName: 'setTableRowHeader',
                        label: t('Header row'),
                        bindIsOn: true
                    }
                },
                {
                    type: 'separator'
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'insertTableRowAbove',
                        label: t('Insert row above')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'insertTableRowBelow',
                        label: t('Insert row below')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'removeTableRow',
                        label: t('Delete row')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'selectTableRow',
                        label: t('Select row')
                    }
                }
            ];
            return this._prepareDropdown(t('Row'), IconTableRow, options, locale);
        });
        editor.ui.componentFactory.add('mergeTableCells', (locale)=>{
            const options = [
                {
                    type: 'button',
                    model: {
                        commandName: 'mergeTableCellUp',
                        label: t('Merge cell up')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: isContentLtr ? 'mergeTableCellRight' : 'mergeTableCellLeft',
                        label: t('Merge cell right')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'mergeTableCellDown',
                        label: t('Merge cell down')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: isContentLtr ? 'mergeTableCellLeft' : 'mergeTableCellRight',
                        label: t('Merge cell left')
                    }
                },
                {
                    type: 'separator'
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'splitTableCellVertically',
                        label: t('Split cell vertically')
                    }
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'splitTableCellHorizontally',
                        label: t('Split cell horizontally')
                    }
                }
            ];
            return this._prepareMergeSplitButtonDropdown(t('Merge cells'), IconTableMergeCell, options, locale);
        });
    }
    /**
	 * Creates a dropdown view from a set of options.
	 *
	 * @param label The dropdown button label.
	 * @param icon An icon for the dropdown button.
	 * @param options The list of options for the dropdown.
	 */ _prepareDropdown(label, icon, options, locale) {
        const editor = this.editor;
        const dropdownView = createDropdown(locale);
        const commands = this._fillDropdownWithListOptions(dropdownView, options);
        // Decorate dropdown's button.
        dropdownView.buttonView.set({
            label,
            icon,
            tooltip: true
        });
        // Make dropdown button disabled when all options are disabled.
        dropdownView.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>{
            return areEnabled.some((isEnabled)=>isEnabled);
        });
        this.listenTo(dropdownView, 'execute', (evt)=>{
            editor.execute(evt.source.commandName);
            // Toggling a switch button view should not move the focus to the editable.
            if (!(evt.source instanceof SwitchButtonView)) {
                editor.editing.view.focus();
            }
        });
        return dropdownView;
    }
    /**
	 * Creates a dropdown view with a {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} for
	 * merge (and split)–related commands.
	 *
	 * @param label The dropdown button label.
	 * @param icon An icon for the dropdown button.
	 * @param options The list of options for the dropdown.
	 */ _prepareMergeSplitButtonDropdown(label, icon, options, locale) {
        const editor = this.editor;
        const dropdownView = createDropdown(locale, SplitButtonView);
        const mergeCommandName = 'mergeTableCells';
        // Main command.
        const mergeCommand = editor.commands.get(mergeCommandName);
        // Subcommands in the dropdown.
        const commands = this._fillDropdownWithListOptions(dropdownView, options);
        dropdownView.buttonView.set({
            label,
            icon,
            tooltip: true,
            isEnabled: true
        });
        // Make dropdown button disabled when all options are disabled together with the main command.
        dropdownView.bind('isEnabled').toMany([
            mergeCommand,
            ...commands
        ], 'isEnabled', (...areEnabled)=>{
            return areEnabled.some((isEnabled)=>isEnabled);
        });
        // Merge selected table cells when the main part of the split button is clicked.
        this.listenTo(dropdownView.buttonView, 'execute', ()=>{
            editor.execute(mergeCommandName);
            editor.editing.view.focus();
        });
        // Execute commands for events coming from the list in the dropdown panel.
        this.listenTo(dropdownView, 'execute', (evt)=>{
            editor.execute(evt.source.commandName);
            editor.editing.view.focus();
        });
        return dropdownView;
    }
    /**
	 * Injects a {@link module:ui/list/listview~ListView} into the passed dropdown with buttons
	 * which execute editor commands as configured in passed options.
	 *
	 * @param options The list of options for the dropdown.
	 * @returns Commands the list options are interacting with.
	 */ _fillDropdownWithListOptions(dropdownView, options) {
        const editor = this.editor;
        const commands = [];
        const itemDefinitions = new Collection();
        for (const option of options){
            addListOption(option, editor, commands, itemDefinitions);
        }
        addListToDropdown(dropdownView, itemDefinitions);
        return commands;
    }
}
/**
 * Adds an option to a list view.
 *
 * @param option A configuration option.
 * @param commands The list of commands to update.
 * @param itemDefinitions A collection of dropdown items to update with the given option.
 */ function addListOption(option, editor, commands, itemDefinitions) {
    if (option.type === 'button' || option.type === 'switchbutton') {
        const model = option.model = new UIModel(option.model);
        const { commandName, bindIsOn } = option.model;
        const command = editor.commands.get(commandName);
        commands.push(command);
        model.set({
            commandName
        });
        model.bind('isEnabled').to(command);
        if (bindIsOn) {
            model.bind('isOn').to(command, 'value');
        }
        model.set({
            withText: true
        });
    }
    itemDefinitions.add(option);
}

/**
 * This plugin enables the advanced table cells, rows and columns selection.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 */ class TableSelection extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableSelection';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableUtils,
            TableUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const model = editor.model;
        const view = editor.editing.view;
        this.listenTo(model, 'deleteContent', (evt, args)=>this._handleDeleteContent(evt, args), {
            priority: 'high'
        });
        this.listenTo(view.document, 'insertText', (evt, data)=>this._handleInsertTextEvent(evt, data), {
            priority: 'high'
        });
        this._defineSelectionConverter();
        this._enablePluginDisabling(); // sic!
    }
    /**
	 * Returns the currently selected table cells or `null` if it is not a table cells selection.
	 */ getSelectedTableCells() {
        const tableUtils = this.editor.plugins.get(TableUtils);
        const selection = this.editor.model.document.selection;
        const selectedCells = tableUtils.getSelectedTableCells(selection);
        if (selectedCells.length == 0) {
            return null;
        }
        // This should never happen, but let's know if it ever happens.
        // @if CK_DEBUG //	if ( selectedCells.length != selection.rangeCount ) {
        // @if CK_DEBUG //		console.warn( 'Mixed selection warning. The selection contains table cells and some other ranges.' );
        // @if CK_DEBUG //	}
        return selectedCells;
    }
    /**
	 * Returns the selected table fragment as a document fragment.
	 */ getSelectionAsFragment() {
        const tableUtils = this.editor.plugins.get(TableUtils);
        const selectedCells = this.getSelectedTableCells();
        if (!selectedCells) {
            return null;
        }
        return this.editor.model.change((writer)=>{
            const documentFragment = writer.createDocumentFragment();
            const { first: firstColumn, last: lastColumn } = tableUtils.getColumnIndexes(selectedCells);
            const { first: firstRow, last: lastRow } = tableUtils.getRowIndexes(selectedCells);
            const sourceTable = selectedCells[0].findAncestor('table');
            let adjustedLastRow = lastRow;
            let adjustedLastColumn = lastColumn;
            // If the selection is rectangular there could be a case of all cells in the last row/column spanned over
            // next row/column so the real lastRow/lastColumn should be updated.
            if (tableUtils.isSelectionRectangular(selectedCells)) {
                const dimensions = {
                    firstColumn,
                    lastColumn,
                    firstRow,
                    lastRow
                };
                adjustedLastRow = adjustLastRowIndex(sourceTable, dimensions);
                adjustedLastColumn = adjustLastColumnIndex(sourceTable, dimensions);
            }
            const cropDimensions = {
                startRow: firstRow,
                startColumn: firstColumn,
                endRow: adjustedLastRow,
                endColumn: adjustedLastColumn
            };
            const table = cropTableToDimensions(sourceTable, cropDimensions, writer);
            writer.insert(table, documentFragment, 0);
            return documentFragment;
        });
    }
    /**
	 * Sets the model selection based on given anchor and target cells (can be the same cell).
	 * Takes care of setting the backward flag.
	 *
	 * ```ts
	 * const modelRoot = editor.model.document.getRoot();
	 * const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
	 * const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );
	 *
	 * const tableSelection = editor.plugins.get( 'TableSelection' );
	 * tableSelection.setCellSelection( firstCell, lastCell );
	 * ```
	 */ setCellSelection(anchorCell, targetCell) {
        const cellsToSelect = this._getCellsToSelect(anchorCell, targetCell);
        this.editor.model.change((writer)=>{
            writer.setSelection(cellsToSelect.cells.map((cell)=>writer.createRangeOn(cell)), {
                backward: cellsToSelect.backward
            });
        });
    }
    /**
	 * Returns the focus cell from the current selection.
	 */ getFocusCell() {
        const selection = this.editor.model.document.selection;
        const focusCellRange = [
            ...selection.getRanges()
        ].pop();
        const element = focusCellRange.getContainedElement();
        if (element && element.is('element', 'tableCell')) {
            return element;
        }
        return null;
    }
    /**
	 * Returns the anchor cell from the current selection.
	 */ getAnchorCell() {
        const selection = this.editor.model.document.selection;
        const anchorCellRange = first(selection.getRanges());
        const element = anchorCellRange.getContainedElement();
        if (element && element.is('element', 'tableCell')) {
            return element;
        }
        return null;
    }
    /**
	 * Defines a selection converter which marks the selected cells with a specific class.
	 *
	 * The real DOM selection is put in the last cell. Since the order of ranges is dependent on whether the
	 * selection is backward or not, the last cell will usually be close to the "focus" end of the selection
	 * (a selection has anchor and focus).
	 *
	 * The real DOM selection is then hidden with CSS.
	 */ _defineSelectionConverter() {
        const editor = this.editor;
        const highlighted = new Set();
        editor.conversion.for('editingDowncast').add((dispatcher)=>dispatcher.on('selection', (evt, data, conversionApi)=>{
                const viewWriter = conversionApi.writer;
                clearHighlightedTableCells(viewWriter);
                const selectedCells = this.getSelectedTableCells();
                if (!selectedCells) {
                    return;
                }
                for (const tableCell of selectedCells){
                    const viewElement = conversionApi.mapper.toViewElement(tableCell);
                    viewWriter.addClass('ck-editor__editable_selected', viewElement);
                    highlighted.add(viewElement);
                }
                const lastViewCell = conversionApi.mapper.toViewElement(selectedCells[selectedCells.length - 1]);
                viewWriter.setSelection(lastViewCell, 0);
            }, {
                priority: 'lowest'
            }));
        function clearHighlightedTableCells(viewWriter) {
            for (const previouslyHighlighted of highlighted){
                viewWriter.removeClass('ck-editor__editable_selected', previouslyHighlighted);
            }
            highlighted.clear();
        }
    }
    /**
	 * Creates a listener that reacts to changes in {@link #isEnabled} and, if the plugin was disabled,
	 * it collapses the multi-cell selection to a regular selection placed inside a table cell.
	 *
	 * This listener helps features that disable the table selection plugin bring the selection
	 * to a clear state they can work with (for instance, because they don't support multiple cell selection).
	 */ _enablePluginDisabling() {
        const editor = this.editor;
        this.on('change:isEnabled', ()=>{
            if (!this.isEnabled) {
                const selectedCells = this.getSelectedTableCells();
                if (!selectedCells) {
                    return;
                }
                editor.model.change((writer)=>{
                    const position = writer.createPositionAt(selectedCells[0], 0);
                    const range = editor.model.schema.getNearestSelectionRange(position);
                    writer.setSelection(range);
                });
            }
        });
    }
    /**
	 * Overrides the default `model.deleteContent()` behavior over a selected table fragment.
	 *
	 * @param args Delete content method arguments.
	 */ _handleDeleteContent(event, args) {
        const tableUtils = this.editor.plugins.get(TableUtils);
        const selection = args[0];
        const options = args[1];
        const model = this.editor.model;
        const isBackward = !options || options.direction == 'backward';
        const selectedTableCells = tableUtils.getSelectedTableCells(selection);
        if (!selectedTableCells.length) {
            return;
        }
        event.stop();
        model.change((writer)=>{
            const tableCellToSelect = selectedTableCells[isBackward ? selectedTableCells.length - 1 : 0];
            model.change((writer)=>{
                for (const tableCell of selectedTableCells){
                    model.deleteContent(writer.createSelection(tableCell, 'in'));
                }
            });
            const rangeToSelect = model.schema.getNearestSelectionRange(writer.createPositionAt(tableCellToSelect, 0));
            // Note: we ignore the case where rangeToSelect may be null because deleteContent() will always (unless someone broke it)
            // create an empty paragraph to accommodate the selection.
            if (selection.is('documentSelection')) {
                writer.setSelection(rangeToSelect);
            } else {
                selection.setTo(rangeToSelect);
            }
        });
    }
    /**
	 * This handler makes it possible to remove the content of all selected cells by starting to type.
	 * If you take a look at {@link #_defineSelectionConverter} you will find out that despite the multi-cell selection being set
	 * in the model, the view selection is collapsed in the last cell (because most browsers are unable to render multi-cell selections;
	 * yes, it's a hack).
	 *
	 * When multiple cells are selected in the model and the user starts to type, the
	 * {@link module:engine/view/document~ViewDocument#event:insertText} event carries information provided by the
	 * beforeinput DOM  event, that in turn only knows about this collapsed DOM selection in the last cell.
	 *
	 * As a result, the selected cells have no chance to be cleaned up. To fix this, this listener intercepts
	 * the event and injects the custom view selection in the data that translates correctly to the actual state
	 * of the multi-cell selection in the model.
	 *
	 * @param data Insert text event data.
	 */ _handleInsertTextEvent(evt, data) {
        const editor = this.editor;
        const selectedCells = this.getSelectedTableCells();
        if (!selectedCells) {
            return;
        }
        const view = editor.editing.view;
        const mapper = editor.editing.mapper;
        const viewRanges = selectedCells.map((tableCell)=>view.createRangeOn(mapper.toViewElement(tableCell)));
        data.selection = view.createSelection(viewRanges);
        // Do not let the browser handle it itself. We must modify the model and then apply changes to the view and DOM.
        data.preventDefault();
    }
    /**
	 * Returns an array of table cells that should be selected based on the
	 * given anchor cell and target (focus) cell.
	 *
	 * The cells are returned in a reverse direction if the selection is backward.
	 */ _getCellsToSelect(anchorCell, targetCell) {
        const tableUtils = this.editor.plugins.get('TableUtils');
        const startLocation = tableUtils.getCellLocation(anchorCell);
        const endLocation = tableUtils.getCellLocation(targetCell);
        const startRow = Math.min(startLocation.row, endLocation.row);
        const endRow = Math.max(startLocation.row, endLocation.row);
        const startColumn = Math.min(startLocation.column, endLocation.column);
        // Adjust the selection to include the entire row if a cell with colspan is selected.
        // This ensures that the selection covers the full width of the colspan cell.
        //
        // Example:
        // +---+---+---+---+
        // | A | B | C | D |
        // +---+---+---+---+
        // | E             |
        // +---+---+---+---+
        //
        // If the selection starts at `B` and ends at `E`, the entire first row should be selected.
        //
        // In other words, the selection will represent the following cells:
        // 	* Without this adjustment, only `B`, `A` and `E` would be selected.
        // 	* With this adjustment, `A`, `B`, `C`, `D`, and `E` are selected.
        //
        // See: https://github.com/ckeditor/ckeditor5/issues/17538
        const endColumnExtraColspan = parseInt(targetCell.getAttribute('colspan') || '1') - 1;
        const endColumn = Math.max(startLocation.column, endLocation.column + endColumnExtraColspan);
        // 2-dimensional array of the selected cells to ease flipping the order of cells for backward selections.
        const selectionMap = new Array(endRow - startRow + 1).fill(null).map(()=>[]);
        const walkerOptions = {
            startRow,
            endRow,
            startColumn,
            endColumn
        };
        for (const { row, cell } of new TableWalker(anchorCell.findAncestor('table'), walkerOptions)){
            selectionMap[row - startRow].push(cell);
        }
        const flipVertically = endLocation.row < startLocation.row;
        const flipHorizontally = endLocation.column < startLocation.column;
        if (flipVertically) {
            selectionMap.reverse();
        }
        if (flipHorizontally) {
            selectionMap.forEach((row)=>row.reverse());
        }
        return {
            cells: selectionMap.flat(),
            backward: flipVertically || flipHorizontally
        };
    }
}

/**
 * This plugin adds support for copying/cutting/pasting fragments of tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 */ class TableClipboard extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableClipboard';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ClipboardMarkersUtils,
            ClipboardPipeline,
            TableSelection,
            TableUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        this.listenTo(viewDocument, 'copy', (evt, data)=>this._onCopyCut(evt, data));
        this.listenTo(viewDocument, 'cut', (evt, data)=>this._onCopyCut(evt, data));
        this._listenToContentInsertion();
        this.decorate('_replaceTableSlotCell');
    }
    /**
	 * Sets up listening for events from the clipboard pipeline to properly handle
	 * table content merging during paste/drop operations.
	 *
	 * When a user is dragging and dropping a table, we want to insert the entire table into
	 * a table cell instead of merging table contents. For paste and other events,
	 * the normal table merge behavior is applied.
	 */ _listenToContentInsertion() {
        const { editor } = this;
        const clipboardPipeline = editor.plugins.get(ClipboardPipeline);
        const tableSelection = editor.plugins.get(TableSelection);
        let isPaste = false;
        clipboardPipeline.on('contentInsertion', (evt, data)=>{
            isPaste = data.method === 'paste';
        });
        this.listenTo(editor.model, 'insertContent', (evt, [content, selectable])=>{
            // Handles drag-and-drop of tables, where tables are inserted into selected cells rather than merged.
            // The `isPaste` flag handles scenarios where other features (e.g., Templates) insert tables into specific cells.
            if (isPaste || tableSelection.getSelectedTableCells() !== null) {
                this._onInsertContent(evt, content, selectable);
            }
        }, {
            priority: 'high'
        });
        clipboardPipeline.on('contentInsertion', ()=>{
            isPaste = false;
        }, {
            priority: 'lowest'
        });
    }
    /**
	 * Copies table content to a clipboard on "copy" & "cut" events.
	 *
	 * @param evt An object containing information about the handled event.
	 * @param data Clipboard event data.
	 */ _onCopyCut(evt, data) {
        const view = this.editor.editing.view;
        const tableSelection = this.editor.plugins.get(TableSelection);
        const clipboardMarkersUtils = this.editor.plugins.get(ClipboardMarkersUtils);
        if (!tableSelection.getSelectedTableCells()) {
            return;
        }
        if (evt.name == 'cut' && !this.editor.model.canEditAt(this.editor.model.document.selection)) {
            return;
        }
        data.preventDefault();
        evt.stop();
        this.editor.model.enqueueChange({
            isUndoable: evt.name === 'cut'
        }, ()=>{
            const documentFragment = clipboardMarkersUtils._copySelectedFragmentWithMarkers(evt.name, this.editor.model.document.selection, ()=>tableSelection.getSelectionAsFragment());
            view.document.fire('clipboardOutput', {
                dataTransfer: data.dataTransfer,
                content: this.editor.data.toView(documentFragment),
                method: evt.name
            });
        });
    }
    /**
	 * Overrides default {@link module:engine/model/model~Model#insertContent `model.insertContent()`} method to handle pasting table inside
	 * selected table fragment.
	 *
	 * Depending on selected table fragment:
	 * - If a selected table fragment is smaller than paste table it will crop pasted table to match dimensions.
	 * - If dimensions are equal it will replace selected table fragment with a pasted table contents.
	 *
	 * @param content The content to insert.
	 * @param selectable The selection into which the content should be inserted.
	 * If not provided the current model document selection will be used.
	 */ _onInsertContent(evt, content, selectable) {
        if (selectable && !selectable.is('documentSelection')) {
            return;
        }
        const model = this.editor.model;
        const tableUtils = this.editor.plugins.get(TableUtils);
        const clipboardMarkersUtils = this.editor.plugins.get(ClipboardMarkersUtils);
        // We might need to crop table before inserting so reference might change.
        const pastedTable = this.getTableIfOnlyTableInContent(content, model);
        if (!pastedTable) {
            return;
        }
        const selectedTableCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        if (!selectedTableCells.length) {
            removeEmptyRowsColumns(pastedTable, tableUtils);
            return;
        }
        // Override default model.insertContent() handling at this point.
        evt.stop();
        if (content.is('documentFragment')) {
            clipboardMarkersUtils._pasteMarkersIntoTransformedElement(content.markers, (writer)=>this._replaceSelectedCells(pastedTable, selectedTableCells, writer));
        } else {
            this.editor.model.change((writer)=>{
                this._replaceSelectedCells(pastedTable, selectedTableCells, writer);
            });
        }
    }
    /**
	 * Inserts provided `selectedTableCells` into `pastedTable`.
	 */ _replaceSelectedCells(pastedTable, selectedTableCells, writer) {
        const tableUtils = this.editor.plugins.get(TableUtils);
        const pastedDimensions = {
            width: tableUtils.getColumns(pastedTable),
            height: tableUtils.getRows(pastedTable)
        };
        // Prepare the table for pasting.
        const selection = prepareTableForPasting(selectedTableCells, pastedDimensions, writer, tableUtils);
        // Beyond this point we operate on a fixed content table with rectangular selection and proper last row/column values.
        const selectionHeight = selection.lastRow - selection.firstRow + 1;
        const selectionWidth = selection.lastColumn - selection.firstColumn + 1;
        // Crop pasted table if:
        // - Pasted table dimensions exceeds selection area.
        // - Pasted table has broken layout (ie some cells sticks out by the table dimensions established by the first and last row).
        //
        // Note: The table dimensions are established by the width of the first row and the total number of rows.
        // It is possible to programmatically create a table that has rows which would have cells anchored beyond first row width but
        // such table will not be created by other editing solutions.
        const cropDimensions = {
            startRow: 0,
            startColumn: 0,
            endRow: Math.min(selectionHeight, pastedDimensions.height) - 1,
            endColumn: Math.min(selectionWidth, pastedDimensions.width) - 1
        };
        pastedTable = cropTableToDimensions(pastedTable, cropDimensions, writer);
        // Content table to which we insert a pasted table.
        const selectedTable = selectedTableCells[0].findAncestor('table');
        const cellsToSelect = this._replaceSelectedCellsWithPasted(pastedTable, pastedDimensions, selectedTable, selection, writer);
        if (this.editor.plugins.get('TableSelection').isEnabled) {
            // Selection ranges must be sorted because the first and last selection ranges are considered
            // as anchor/focus cell ranges for multi-cell selection.
            const selectionRanges = tableUtils.sortRanges(cellsToSelect.map((cell)=>writer.createRangeOn(cell)));
            writer.setSelection(selectionRanges);
        } else {
            // Set selection inside first cell if multi-cell selection is disabled.
            writer.setSelection(cellsToSelect[0], 0);
        }
        return selectedTable;
    }
    /**
	 * Replaces the part of selectedTable with pastedTable.
	 */ _replaceSelectedCellsWithPasted(pastedTable, pastedDimensions, selectedTable, selection, writer) {
        const { width: pastedWidth, height: pastedHeight } = pastedDimensions;
        // Holds two-dimensional array that is addressed by [ row ][ column ] that stores cells anchored at given location.
        const pastedTableLocationMap = createLocationMap(pastedTable, pastedWidth, pastedHeight);
        const selectedTableMap = [
            ...new TableWalker(selectedTable, {
                startRow: selection.firstRow,
                endRow: selection.lastRow,
                startColumn: selection.firstColumn,
                endColumn: selection.lastColumn,
                includeAllSlots: true
            })
        ];
        // Selection must be set to pasted cells (some might be removed or new created).
        const cellsToSelect = [];
        // Store next cell insert position.
        let insertPosition;
        // Content table replace cells algorithm iterates over a selected table fragment and:
        //
        // - Removes existing table cells at current slot (location).
        // - Inserts cell from a pasted table for a matched slots.
        //
        // This ensures proper table geometry after the paste
        for (const tableSlot of selectedTableMap){
            const { row, column } = tableSlot;
            // Save the insert position for current row start.
            if (column === selection.firstColumn) {
                insertPosition = tableSlot.getPositionBefore();
            }
            // Map current table slot location to an pasted table slot location.
            const pastedRow = row - selection.firstRow;
            const pastedColumn = column - selection.firstColumn;
            const pastedCell = pastedTableLocationMap[pastedRow % pastedHeight][pastedColumn % pastedWidth];
            // Clone cell to insert (to duplicate its attributes and children).
            // Cloning is required to support repeating pasted table content when inserting to a bigger selection.
            const cellToInsert = pastedCell ? writer.cloneElement(pastedCell) : null;
            // Replace the cell from the current slot with new table cell.
            const newTableCell = this._replaceTableSlotCell(tableSlot, cellToInsert, insertPosition, writer);
            // The cell was only removed.
            if (!newTableCell) {
                continue;
            }
            // Trim the cell if it's row/col-spans would exceed selection area.
            trimTableCellIfNeeded(newTableCell, row, column, selection.lastRow, selection.lastColumn, writer);
            cellsToSelect.push(newTableCell);
            insertPosition = writer.createPositionAfter(newTableCell);
        }
        // If there are any headings, all the cells that overlap from heading must be splitted.
        const headingRows = parseInt(selectedTable.getAttribute('headingRows') || '0');
        const headingColumns = parseInt(selectedTable.getAttribute('headingColumns') || '0');
        const areHeadingRowsIntersectingSelection = selection.firstRow < headingRows && headingRows <= selection.lastRow;
        const areHeadingColumnsIntersectingSelection = selection.firstColumn < headingColumns && headingColumns <= selection.lastColumn;
        if (areHeadingRowsIntersectingSelection) {
            const columnsLimit = {
                first: selection.firstColumn,
                last: selection.lastColumn
            };
            const newCells = doHorizontalSplit(selectedTable, headingRows, columnsLimit, writer, selection.firstRow);
            cellsToSelect.push(...newCells);
        }
        if (areHeadingColumnsIntersectingSelection) {
            const rowsLimit = {
                first: selection.firstRow,
                last: selection.lastRow
            };
            const newCells = doVerticalSplit(selectedTable, headingColumns, rowsLimit, writer);
            cellsToSelect.push(...newCells);
        }
        return cellsToSelect;
    }
    /**
	 * Replaces a single table slot.
	 *
	 * @returns Inserted table cell or null if slot should remain empty.
	 * @private
	 */ _replaceTableSlotCell(tableSlot, cellToInsert, insertPosition, writer) {
        const { cell, isAnchor } = tableSlot;
        // If the slot is occupied by a cell in a selected table - remove it.
        // The slot of this cell will be either:
        // - Replaced by a pasted table cell.
        // - Spanned by a previously pasted table cell.
        if (isAnchor) {
            writer.remove(cell);
        }
        // There is no cell to insert (might be spanned by other cell in a pasted table) - advance to the next content table slot.
        if (!cellToInsert) {
            return null;
        }
        writer.insert(cellToInsert, insertPosition);
        return cellToInsert;
    }
    /**
	 * Extracts the table for pasting into a table.
	 *
	 * @param content The content to insert.
	 * @param model The editor model.
	 */ getTableIfOnlyTableInContent(content, model) {
        if (!content.is('documentFragment') && !content.is('element')) {
            return null;
        }
        // Table passed directly.
        if (content.is('element', 'table')) {
            return content;
        }
        // We do not support mixed content when pasting table into table.
        // See: https://github.com/ckeditor/ckeditor5/issues/6817.
        if (content.childCount == 1 && content.getChild(0).is('element', 'table')) {
            return content.getChild(0);
        }
        // If there are only whitespaces around a table then use that table for pasting.
        const contentRange = model.createRangeIn(content);
        for (const element of contentRange.getItems()){
            if (element.is('element', 'table')) {
                // Stop checking if there is some content before table.
                const rangeBefore = model.createRange(contentRange.start, model.createPositionBefore(element));
                if (model.hasContent(rangeBefore, {
                    ignoreWhitespaces: true
                })) {
                    return null;
                }
                // Stop checking if there is some content after table.
                const rangeAfter = model.createRange(model.createPositionAfter(element), contentRange.end);
                if (model.hasContent(rangeAfter, {
                    ignoreWhitespaces: true
                })) {
                    return null;
                }
                // There wasn't any content neither before nor after.
                return element;
            }
        }
        return null;
    }
}
/**
 * Prepares a table for pasting and returns adjusted selection dimensions.
 */ function prepareTableForPasting(selectedTableCells, pastedDimensions, writer, tableUtils) {
    const selectedTable = selectedTableCells[0].findAncestor('table');
    const columnIndexes = tableUtils.getColumnIndexes(selectedTableCells);
    const rowIndexes = tableUtils.getRowIndexes(selectedTableCells);
    const selection = {
        firstColumn: columnIndexes.first,
        lastColumn: columnIndexes.last,
        firstRow: rowIndexes.first,
        lastRow: rowIndexes.last
    };
    // Single cell selected - expand selection to pasted table dimensions.
    const shouldExpandSelection = selectedTableCells.length === 1;
    if (shouldExpandSelection) {
        selection.lastRow += pastedDimensions.height - 1;
        selection.lastColumn += pastedDimensions.width - 1;
        expandTableSize(selectedTable, selection.lastRow + 1, selection.lastColumn + 1, tableUtils);
    }
    // In case of expanding selection we do not reset the selection so in this case we will always try to fix selection
    // like in the case of a non-rectangular area. This might be fixed by re-setting selected cells array but this shortcut is safe.
    if (shouldExpandSelection || !tableUtils.isSelectionRectangular(selectedTableCells)) {
        // For a non-rectangular selection (ie in which some cells sticks out from a virtual selection rectangle) we need to create
        // a table layout that has a rectangular selection. This will split cells so the selection become rectangular.
        // Beyond this point we will operate on fixed content table.
        splitCellsToRectangularSelection(selectedTable, selection, writer);
    } else {
        selection.lastRow = adjustLastRowIndex(selectedTable, selection);
        selection.lastColumn = adjustLastColumnIndex(selectedTable, selection);
    }
    return selection;
}
/**
 * Expand table (in place) to expected size.
 */ function expandTableSize(table, expectedHeight, expectedWidth, tableUtils) {
    const tableWidth = tableUtils.getColumns(table);
    const tableHeight = tableUtils.getRows(table);
    if (expectedWidth > tableWidth) {
        tableUtils.insertColumns(table, {
            at: tableWidth,
            columns: expectedWidth - tableWidth
        });
    }
    if (expectedHeight > tableHeight) {
        tableUtils.insertRows(table, {
            at: tableHeight,
            rows: expectedHeight - tableHeight
        });
    }
}
/**
 * Returns two-dimensional array that is addressed by [ row ][ column ] that stores cells anchored at given location.
 *
 * At given row & column location it might be one of:
 *
 * * cell - cell from pasted table anchored at this location.
 * * null - if no cell is anchored at this location.
 *
 * For instance, from a table below:
 *
 *   +----+----+----+----+
 *   | 00 | 01 | 02 | 03 |
 *   +    +----+----+----+
 *   |    | 11      | 13 |
 *   +----+         +----+
 *   | 20 |         | 23 |
 *   +----+----+----+----+
 *
 * The method will return an array (numbers represents cell element):
 *
 * ```ts
 * const map = [
 *   [ '00', '01', '02', '03' ],
 *   [ null, '11', null, '13' ],
 *   [ '20', null, null, '23' ]
 * ]
 * ```
 *
 * This allows for a quick access to table at give row & column. For instance to access table cell "13" from pasted table call:
 *
 * ```ts
 * const cell = map[ 1 ][ 3 ]
 * ```
 */ function createLocationMap(table, width, height) {
    // Create height x width (row x column) two-dimensional table to store cells.
    const map = new Array(height).fill(null).map(()=>new Array(width).fill(null));
    for (const { column, row, cell } of new TableWalker(table)){
        map[row][column] = cell;
    }
    return map;
}
/**
 * Make selected cells rectangular by splitting the cells that stand out from a rectangular selection.
 *
 * In the table below a selection is shown with "::" and slots with anchor cells are named.
 *
 * +----+----+----+----+----+                    +----+----+----+----+----+
 * | 00 | 01 | 02 | 03      |                    | 00 | 01 | 02 | 03      |
 * +    +----+    +----+----+                    |    ::::::::::::::::----+
 * |    | 11 |    | 13 | 14 |                    |    ::11 |    | 13:: 14 |    <- first row
 * +----+----+    +    +----+                    +----::---|    |   ::----+
 * | 20 | 21 |    |    | 24 |   select cells:    | 20 ::21 |    |   :: 24 |
 * +----+----+    +----+----+     11 -> 33       +----::---|    |---::----+
 * | 30      |    | 33 | 34 |                    | 30 ::   |    | 33:: 34 |    <- last row
 * +         +    +----+    +                    |    ::::::::::::::::    +
 * |         |    | 43 |    |                    |         |    | 43 |    |
 * +----+----+----+----+----+                    +----+----+----+----+----+
 *                                                      ^          ^
 *                                                     first & last columns
 *
 * Will update table to:
 *
 *                       +----+----+----+----+----+
 *                       | 00 | 01 | 02 | 03      |
 *                       +    +----+----+----+----+
 *                       |    | 11 |    | 13 | 14 |
 *                       +----+----+    +    +----+
 *                       | 20 | 21 |    |    | 24 |
 *                       +----+----+    +----+----+
 *                       | 30 |    |    | 33 | 34 |
 *                       +    +----+----+----+    +
 *                       |    |    |    | 43 |    |
 *                       +----+----+----+----+----+
 *
 * In th example above:
 * - Cell "02" which have `rowspan = 4` must be trimmed at first and at after last row.
 * - Cell "03" which have `rowspan = 2` and `colspan = 2` must be trimmed at first column and after last row.
 * - Cells "00", "03" & "30" which cannot be cut by this algorithm as they are outside the trimmed area.
 * - Cell "13" cannot be cut as it is inside the trimmed area.
 */ function splitCellsToRectangularSelection(table, dimensions, writer) {
    const { firstRow, lastRow, firstColumn, lastColumn } = dimensions;
    const rowIndexes = {
        first: firstRow,
        last: lastRow
    };
    const columnIndexes = {
        first: firstColumn,
        last: lastColumn
    };
    // 1. Split cells vertically in two steps as first step might create cells that needs to split again.
    doVerticalSplit(table, firstColumn, rowIndexes, writer);
    doVerticalSplit(table, lastColumn + 1, rowIndexes, writer);
    // 2. Split cells horizontally in two steps as first step might create cells that needs to split again.
    doHorizontalSplit(table, firstRow, columnIndexes, writer);
    doHorizontalSplit(table, lastRow + 1, columnIndexes, writer, firstRow);
}
function doHorizontalSplit(table, splitRow, limitColumns, writer, startRow = 0) {
    // If selection starts at first row then no split is needed.
    if (splitRow < 1) {
        return;
    }
    const overlappingCells = getVerticallyOverlappingCells(table, splitRow, startRow);
    // Filter out cells that are not touching insides of the rectangular selection.
    const cellsToSplit = overlappingCells.filter(({ column, cellWidth })=>isAffectedBySelection(column, cellWidth, limitColumns));
    return cellsToSplit.map(({ cell })=>splitHorizontally(cell, splitRow, writer));
}
function doVerticalSplit(table, splitColumn, limitRows, writer) {
    // If selection starts at first column then no split is needed.
    if (splitColumn < 1) {
        return;
    }
    const overlappingCells = getHorizontallyOverlappingCells(table, splitColumn);
    // Filter out cells that are not touching insides of the rectangular selection.
    const cellsToSplit = overlappingCells.filter(({ row, cellHeight })=>isAffectedBySelection(row, cellHeight, limitRows));
    return cellsToSplit.map(({ cell, column })=>splitVertically(cell, column, splitColumn, writer));
}
/**
 * Checks if cell at given row (column) is affected by a rectangular selection defined by first/last column (row).
 *
 * The same check is used for row as for column.
 */ function isAffectedBySelection(index, span, limit) {
    const endIndex = index + span - 1;
    const { first, last } = limit;
    const isInsideSelection = index >= first && index <= last;
    const overlapsSelectionFromOutside = index < first && endIndex >= first;
    return isInsideSelection || overlapsSelectionFromOutside;
}

/**
 * This plugin enables keyboard navigation for tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 */ class TableKeyboard extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableKeyboard';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableSelection,
            TableUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const view = editor.editing.view;
        const viewDocument = view.document;
        const t = editor.t;
        this.listenTo(viewDocument, 'arrowKey', (...args)=>this._onArrowKey(...args), {
            context: 'table'
        });
        this.listenTo(viewDocument, 'tab', (...args)=>this._handleTabOnSelectedTable(...args), {
            context: 'figure'
        });
        this.listenTo(viewDocument, 'tab', (...args)=>this._handleTab(...args), {
            context: [
                'th',
                'td'
            ]
        });
        // Add the information about the keystrokes to the accessibility database.
        editor.accessibility.addKeystrokeInfoGroup({
            id: 'table',
            label: t('Keystrokes that can be used in a table cell'),
            keystrokes: [
                {
                    label: t('Move the selection to the next cell'),
                    keystroke: 'Tab'
                },
                {
                    label: t('Move the selection to the previous cell'),
                    keystroke: 'Shift+Tab'
                },
                {
                    label: t('Insert a new table row (when in the last cell of a table)'),
                    keystroke: 'Tab'
                },
                {
                    label: t('Navigate through the table'),
                    keystroke: [
                        [
                            'arrowup'
                        ],
                        [
                            'arrowright'
                        ],
                        [
                            'arrowdown'
                        ],
                        [
                            'arrowleft'
                        ]
                    ]
                }
            ]
        });
    }
    /**
	 * Handles {@link module:engine/view/document~ViewDocument#event:tab tab} events for the <kbd>Tab</kbd> key executed
	 * when the table widget is selected.
	 */ _handleTabOnSelectedTable(bubblingEventInfo, domEventData) {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const selectedElement = selection.getSelectedElement();
        if (!selectedElement || !selectedElement.is('element', 'table')) {
            return;
        }
        // For backward compatibility stop propagation of this DOM event.
        // The default tab handling from widgets handles navigation.
        domEventData.stopPropagation();
    }
    /**
	 * Handles {@link module:engine/view/document~ViewDocument#event:tab tab} events for the <kbd>Tab</kbd> key executed
	 * inside table cells.
	 */ _handleTab(bubblingEventInfo, domEventData) {
        const editor = this.editor;
        const tableUtils = this.editor.plugins.get(TableUtils);
        const tableSelection = this.editor.plugins.get('TableSelection');
        const selection = editor.model.document.selection;
        const isForward = !domEventData.shiftKey;
        let tableCell = tableUtils.getTableCellsContainingSelection(selection)[0];
        if (!tableCell) {
            tableCell = tableSelection.getFocusCell();
        }
        if (!tableCell) {
            return;
        }
        // For backward compatibility stop propagation of this DOM event.
        // The default tab handling from widgets handles navigation.
        domEventData.stopPropagation();
        const tableRow = tableCell.parent;
        const table = tableRow.parent;
        const currentRowIndex = table.getChildIndex(tableRow);
        const currentCellIndex = tableRow.getChildIndex(tableCell);
        const isLastCellInRow = currentCellIndex === tableRow.childCount - 1;
        const isLastRow = currentRowIndex === tableUtils.getRows(table) - 1;
        if (isForward && isLastRow && isLastCellInRow) {
            editor.execute('insertTableRowBelow');
        }
    }
    /**
	 * Handles {@link module:engine/view/document~ViewDocument#event:keydown keydown} events.
	 */ _onArrowKey(eventInfo, domEventData) {
        const editor = this.editor;
        const keyCode = domEventData.keyCode;
        const direction = getLocalizedArrowKeyCodeDirection(keyCode, editor.locale.contentLanguageDirection);
        const wasHandled = this._handleArrowKeys(direction, domEventData.shiftKey);
        if (wasHandled) {
            domEventData.preventDefault();
            domEventData.stopPropagation();
            eventInfo.stop();
        }
    }
    /**
	 * Handles arrow keys to move the selection around the table.
	 *
	 * @param direction The direction of the arrow key.
	 * @param expandSelection If the current selection should be expanded.
	 * @returns Returns `true` if key was handled.
	 */ _handleArrowKeys(direction, expandSelection) {
        const tableUtils = this.editor.plugins.get(TableUtils);
        const tableSelection = this.editor.plugins.get('TableSelection');
        const model = this.editor.model;
        const selection = model.document.selection;
        const isForward = [
            'right',
            'down'
        ].includes(direction);
        // In case one or more table cells are selected (from outside),
        // move the selection to a cell adjacent to the selected table fragment.
        const selectedCells = tableUtils.getSelectedTableCells(selection);
        if (selectedCells.length) {
            let focusCell;
            if (expandSelection) {
                focusCell = tableSelection.getFocusCell();
            } else {
                focusCell = isForward ? selectedCells[selectedCells.length - 1] : selectedCells[0];
            }
            this._navigateFromCellInDirection(focusCell, direction, expandSelection);
            return true;
        }
        // Abort if we're not in a table cell.
        const tableCell = selection.focus.findAncestor('tableCell');
        /* istanbul ignore if: paranoid check -- @preserve */ if (!tableCell) {
            return false;
        }
        // When the selection is not collapsed.
        if (!selection.isCollapsed) {
            if (expandSelection) {
                // Navigation is in the opposite direction than the selection direction so this is shrinking of the selection.
                // Selection for sure will not approach cell edge.
                //
                // With a special case when all cell content is selected - then selection should expand to the other cell.
                // Note: When the entire cell gets selected using CTRL+A, the selection is always forward.
                if (selection.isBackward == isForward && !selection.containsEntireContent(tableCell)) {
                    return false;
                }
            } else {
                const selectedElement = selection.getSelectedElement();
                // It will collapse for non-object selected so it's not going to move to other cell.
                if (!selectedElement || !model.schema.isObject(selectedElement)) {
                    return false;
                }
            }
        }
        // Let's check if the selection is at the beginning/end of the cell.
        if (this._isSelectionAtCellEdge(selection, tableCell, isForward)) {
            this._navigateFromCellInDirection(tableCell, direction, expandSelection);
            return true;
        }
        return false;
    }
    /**
	 * Returns `true` if the selection is at the boundary of a table cell according to the navigation direction.
	 *
	 * @param selection The current selection.
	 * @param tableCell The current table cell element.
	 * @param isForward The expected navigation direction.
	 */ _isSelectionAtCellEdge(selection, tableCell, isForward) {
        const model = this.editor.model;
        const schema = this.editor.model.schema;
        const focus = isForward ? selection.getLastPosition() : selection.getFirstPosition();
        // If the current limit element is not table cell we are for sure not at the cell edge.
        // Also `modifySelection` will not let us out of it.
        if (!schema.getLimitElement(focus).is('element', 'tableCell')) {
            const boundaryPosition = model.createPositionAt(tableCell, isForward ? 'end' : 0);
            return boundaryPosition.isTouching(focus);
        }
        const probe = model.createSelection(focus);
        model.modifySelection(probe, {
            direction: isForward ? 'forward' : 'backward'
        });
        // If there was no change in the focus position, then it's not possible to move the selection there.
        return focus.isEqual(probe.focus);
    }
    /**
	 * Moves the selection from the given table cell in the specified direction.
	 *
	 * @param focusCell The table cell that is current multi-cell selection focus.
	 * @param direction Direction in which selection should move.
	 * @param expandSelection If the current selection should be expanded. Default value is false.
	 */ _navigateFromCellInDirection(focusCell, direction, expandSelection = false) {
        const model = this.editor.model;
        const table = focusCell.findAncestor('table');
        const tableMap = [
            ...new TableWalker(table, {
                includeAllSlots: true
            })
        ];
        const { row: lastRow, column: lastColumn } = tableMap[tableMap.length - 1];
        const currentCellInfo = tableMap.find(({ cell })=>cell == focusCell);
        let { row, column } = currentCellInfo;
        switch(direction){
            case 'left':
                column--;
                break;
            case 'up':
                row--;
                break;
            case 'right':
                column += currentCellInfo.cellWidth;
                break;
            case 'down':
                row += currentCellInfo.cellHeight;
                break;
        }
        const isOutsideVertically = row < 0 || row > lastRow;
        const isBeforeFirstCell = column < 0 && row <= 0;
        const isAfterLastCell = column > lastColumn && row >= lastRow;
        // Note that if the table cell at the end of a row is row-spanned then isAfterLastCell will never be true.
        // However, we don't know if user was navigating on the last row or not, so let's stay in the table.
        if (isOutsideVertically || isBeforeFirstCell || isAfterLastCell) {
            model.change((writer)=>{
                writer.setSelection(writer.createRangeOn(table));
            });
            return;
        }
        if (column < 0) {
            column = expandSelection ? 0 : lastColumn;
            row--;
        } else if (column > lastColumn) {
            column = expandSelection ? lastColumn : 0;
            row++;
        }
        const cellToSelect = tableMap.find((cellInfo)=>cellInfo.row == row && cellInfo.column == column).cell;
        const isForward = [
            'right',
            'down'
        ].includes(direction);
        const tableSelection = this.editor.plugins.get('TableSelection');
        if (expandSelection && tableSelection.isEnabled) {
            const anchorCell = tableSelection.getAnchorCell() || focusCell;
            tableSelection.setCellSelection(anchorCell, cellToSelect);
        } else {
            const positionToSelect = model.createPositionAt(cellToSelect, isForward ? 0 : 'end');
            model.change((writer)=>{
                writer.setSelection(positionToSelect);
            });
        }
    }
}

/**
 * The mouse selection event observer.
 *
 * It registers listeners for the following DOM events:
 *
 * - `'mousemove'`
 * - `'mouseleave'`
 *
 * Note that this observer is disabled by default. To enable this observer, it needs to be added to
 * {@link module:engine/view/view~EditingView} using the {@link module:engine/view/view~EditingView#addObserver} method.
 *
 * The observer is registered by the {@link module:table/tableselection~TableSelection} plugin.
 *
 * @internal
 */ class MouseEventsObserver extends DomEventObserver {
    domEventType = [
        'mousemove',
        'mouseleave'
    ];
    /**
	 * @inheritDoc
	 */ onDomEvent(domEvent) {
        this.fire(domEvent.type, domEvent);
    }
}

/**
 * This plugin enables a table cells' selection with the mouse.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 */ class TableMouse extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableMouse';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableSelection,
            TableUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        // Currently the MouseObserver only handles `mousedown` and `mouseup` events.
        // TODO move to the engine?
        editor.editing.view.addObserver(MouseEventsObserver);
        this._enableShiftClickSelection();
        this._enableMouseDragSelection();
    }
    /**
	 * Enables making cells selection by <kbd>Shift</kbd>+click. Creates a selection from the cell which previously held
	 * the selection to the cell which was clicked. It can be the same cell, in which case it selects a single cell.
	 */ _enableShiftClickSelection() {
        const editor = this.editor;
        const tableUtils = editor.plugins.get(TableUtils);
        let blockSelectionChange = false;
        const tableSelection = editor.plugins.get(TableSelection);
        this.listenTo(editor.editing.view.document, 'mousedown', (evt, domEventData)=>{
            const selection = editor.model.document.selection;
            if (!this.isEnabled || !tableSelection.isEnabled) {
                return;
            }
            if (!domEventData.domEvent.shiftKey) {
                return;
            }
            const anchorCell = tableSelection.getAnchorCell() || tableUtils.getTableCellsContainingSelection(selection)[0];
            if (!anchorCell) {
                return;
            }
            const targetCell = this._getModelTableCellFromDomEvent(domEventData);
            if (targetCell && haveSameTableParent(anchorCell, targetCell)) {
                blockSelectionChange = true;
                tableSelection.setCellSelection(anchorCell, targetCell);
                domEventData.preventDefault();
            }
        });
        this.listenTo(editor.editing.view.document, 'mouseup', ()=>{
            blockSelectionChange = false;
        });
        // We need to ignore a `selectionChange` event that is fired after we render our new table cells selection.
        // When downcasting table cells selection to the view, we put the view selection in the last selected cell
        // in a place that may not be natively a "correct" location. This is – we put it directly in the `<td>` element.
        // All browsers fire the native `selectionchange` event.
        // However, all browsers except Safari return the selection in the exact place where we put it
        // (even though it's visually normalized). Safari returns `<td><p>^foo` that makes our selection observer
        // fire our `selectionChange` event (because the view selection that we set in the first step differs from the DOM selection).
        // Since `selectionChange` is fired, we automatically update the model selection that moves it that paragraph.
        // This breaks our dear cells selection.
        //
        // Theoretically this issue concerns only Safari that is the only browser that do normalize the selection.
        // However, to avoid code branching and to have a good coverage for this event blocker, I enabled it for all browsers.
        //
        // Note: I'm keeping the `blockSelectionChange` state separately for shift+click and mouse drag (exact same logic)
        // so I don't have to try to analyze whether they don't overlap in some weird cases. Probably they don't.
        // But I have other things to do, like writing this comment.
        this.listenTo(editor.editing.view.document, 'selectionChange', (evt)=>{
            if (blockSelectionChange) {
                // @if CK_DEBUG // console.log( 'Blocked selectionChange to avoid breaking table cells selection.' );
                evt.stop();
            }
        }, {
            priority: 'highest'
        });
    }
    /**
	 * Enables making cells selection by dragging.
	 *
	 * The selection is made only on mousemove. Mouse tracking is started on mousedown.
	 * However, the cells selection is enabled only after the mouse cursor left the anchor cell.
	 * Thanks to that normal text selection within one cell works just fine. However, you can still select
	 * just one cell by leaving the anchor cell and moving back to it.
	 */ _enableMouseDragSelection() {
        const editor = this.editor;
        let anchorCell, targetCell;
        let beganCellSelection = false;
        let blockSelectionChange = false;
        const tableSelection = editor.plugins.get(TableSelection);
        this.listenTo(editor.editing.view.document, 'mousedown', (evt, domEventData)=>{
            if (!this.isEnabled || !tableSelection.isEnabled) {
                return;
            }
            // Make sure to not conflict with the shift+click listener and any other possible handler.
            if (domEventData.domEvent.shiftKey || domEventData.domEvent.ctrlKey || domEventData.domEvent.altKey) {
                return;
            }
            anchorCell = this._getModelTableCellFromDomEvent(domEventData);
        });
        this.listenTo(editor.editing.view.document, 'mousemove', (evt, domEventData)=>{
            if (!domEventData.domEvent.buttons) {
                return;
            }
            if (!anchorCell) {
                return;
            }
            const newTargetCell = this._getModelTableCellFromDomEvent(domEventData);
            if (newTargetCell && haveSameTableParent(anchorCell, newTargetCell)) {
                targetCell = newTargetCell;
                // Switch to the cell selection mode after the mouse cursor left the anchor cell.
                // Switch off only on mouseup (makes selecting a single cell possible).
                if (!beganCellSelection && targetCell != anchorCell) {
                    beganCellSelection = true;
                }
            }
            // Yep, not making a cell selection yet. See method docs.
            if (!beganCellSelection) {
                return;
            }
            blockSelectionChange = true;
            tableSelection.setCellSelection(anchorCell, targetCell);
            domEventData.preventDefault();
        });
        this.listenTo(editor.editing.view.document, 'mouseup', ()=>{
            beganCellSelection = false;
            blockSelectionChange = false;
            anchorCell = null;
            targetCell = null;
        });
        // See the explanation in `_enableShiftClickSelection()`.
        this.listenTo(editor.editing.view.document, 'selectionChange', (evt)=>{
            if (blockSelectionChange) {
                // @if CK_DEBUG // console.log( 'Blocked selectionChange to avoid breaking table cells selection.' );
                evt.stop();
            }
        }, {
            priority: 'highest'
        });
    }
    /**
	 * Returns the model table cell element based on the target element of the passed DOM event.
	 *
	 * @returns Returns the table cell or `undefined`.
	 */ _getModelTableCellFromDomEvent(domEventData) {
        // Note: Work with positions (not element mapping) because the target element can be an attribute or other non-mapped element.
        const viewTargetElement = domEventData.target;
        const viewPosition = this.editor.editing.view.createPositionAt(viewTargetElement, 0);
        const modelPosition = this.editor.editing.mapper.toModelPosition(viewPosition);
        const modelElement = modelPosition.parent;
        return modelElement.findAncestor('tableCell', {
            includeSelf: true
        });
    }
}
function haveSameTableParent(cellA, cellB) {
    return cellA.parent.parent == cellB.parent.parent;
}

/**
 * The table plugin.
 *
 * For a detailed overview, check the {@glink features/tables/tables Table feature documentation}.
 *
 * This is a "glue" plugin that loads the following table features:
 *
 * * {@link module:table/tableediting~TableEditing editing feature},
 * * {@link module:table/tableselection~TableSelection selection feature},
 * * {@link module:table/tablekeyboard~TableKeyboard keyboard navigation feature},
 * * {@link module:table/tablemouse~TableMouse mouse selection feature},
 * * {@link module:table/tableclipboard~TableClipboard clipboard feature},
 * * {@link module:table/tableui~TableUI UI feature}.
 */ class Table extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableEditing,
            TableUI,
            TableSelection,
            TableMouse,
            TableKeyboard,
            TableClipboard,
            Widget
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Table';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The plain table output feature.
 *
 * This feature strips the `<figure>` tag from the table data. This is because this tag is not supported
 * by most popular email clients and removing it ensures compatibility.
 */ class PlainTableOutput extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'PlainTableOutput';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Table
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        editor.conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on('element:table', (evt, data, conversionApi)=>{
                // It's not necessary to upcast the `table` class. This class was only added in data downcast
                // to center a plain table in the editor output.
                // See: https://github.com/ckeditor/ckeditor5/issues/17888.
                conversionApi.consumable.consume(data.viewItem, {
                    classes: 'table'
                });
            });
        });
    }
}

/**
 * Depending on the position of the selection either return the selected table or the table higher in the hierarchy.
 *
 * @internal
 */ function getSelectionAffectedTableWidget(selection) {
    const selectedTable = getSelectedTableWidget(selection);
    if (selectedTable) {
        return selectedTable;
    }
    return getTableWidgetAncestor(selection);
}
/**
 * Returns a table widget editing view element if one is selected.
 *
 * @internal
 */ function getSelectedTableWidget(selection) {
    const viewElement = selection.getSelectedElement();
    if (viewElement && isTableWidget(viewElement)) {
        return viewElement;
    }
    return null;
}
/**
 * Returns a table widget editing view element if one is among the selection's ancestors.
 *
 * @internal
 */ function getTableWidgetAncestor(selection) {
    const selectionPosition = selection.getFirstPosition();
    if (!selectionPosition) {
        return null;
    }
    let parent = selectionPosition.parent;
    while(parent){
        if (parent.is('element') && isTableWidget(parent)) {
            return parent;
        }
        parent = parent.parent;
    }
    return null;
}
/**
 * Checks if a given view element is a table widget.
 *
 * @internal
 */ function isTableWidget(viewNode) {
    return viewNode.is('element') && !!viewNode.getCustomProperty('table') && isWidget(viewNode);
}

/**
 * The table toolbar class. It creates toolbars for the table feature and its content (for now only for the table cell content).
 *
 * The table toolbar shows up when a table widget is selected. Its components (e.g. buttons) are created based on the
 * {@link module:table/tableconfig~TableConfig#tableToolbar `table.tableToolbar` configuration option}.
 *
 * Table content toolbar shows up when the selection is inside the content of a table. It creates its component based on the
 * {@link module:table/tableconfig~TableConfig#contentToolbar `table.contentToolbar` configuration option}.
 */ class TableToolbar extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            WidgetToolbarRepository
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableToolbar';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const t = editor.t;
        const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);
        const tableContentToolbarItems = editor.config.get('table.contentToolbar');
        const tableToolbarItems = editor.config.get('table.tableToolbar');
        if (tableContentToolbarItems) {
            widgetToolbarRepository.register('tableContent', {
                ariaLabel: t('Table toolbar'),
                items: tableContentToolbarItems,
                getRelatedElement: getTableWidgetAncestor
            });
        }
        if (tableToolbarItems) {
            widgetToolbarRepository.register('table', {
                ariaLabel: t('Table toolbar'),
                items: tableToolbarItems,
                getRelatedElement: getSelectedTableWidget
            });
        }
    }
}

/**
 * The color input view class. It allows the user to type in a color (hex, rgb, etc.)
 * or choose it from the configurable color palette with a preview.
 *
 * @internal
 */ class ColorInputView extends View {
    /**
	 * A cached reference to the options passed to the constructor.
	 */ options;
    /**
	 * Tracks information about the DOM focus in the view.
	 */ focusTracker;
    /**
	 * Helps cycling over focusable children in the input view.
	 */ focusCycler;
    /**
	 * A collection of views that can be focused in the view.
	 */ _focusables;
    /**
	 * An instance of the dropdown allowing to select a color from a grid.
	 */ dropdownView;
    /**
	 * An instance of the input allowing the user to type a color value.
	 */ inputView;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * The flag that indicates whether the user is still typing.
	 * If set to true, it means that the text input field ({@link #inputView}) still has the focus.
	 * So, we should interrupt the user by replacing the input's value.
	 */ _stillTyping;
    /**
	 * Creates an instance of the color input view.
	 *
	 * @param locale The locale instance.
	 * @param options The input options.
	 * @param options.colorDefinitions The colors to be displayed in the palette inside the input's dropdown.
	 * @param options.columns The number of columns in which the colors will be displayed.
	 * @param options.defaultColorValue If specified, the color input view will replace the "Remove color" button with
	 * the "Restore default" button. Instead of clearing the input field, the default color value will be set.
	 */ constructor(locale, options){
        super(locale);
        this.set('value', '');
        this.set('isReadOnly', false);
        this.set('isFocused', false);
        this.set('isEmpty', true);
        this.options = options;
        this.focusTracker = new FocusTracker();
        this._focusables = new ViewCollection();
        this.dropdownView = this._createDropdownView();
        this.inputView = this._createInputTextView();
        this.keystrokes = new KeystrokeHandler();
        this._stillTyping = false;
        this.focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate items backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
                focusPrevious: 'shift + tab',
                // Navigate items forwards using the <kbd>Tab</kbd> key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-input-color'
                ]
            },
            children: [
                this.dropdownView,
                this.inputView
            ]
        });
        this.on('change:value', (evt, name, inputValue)=>this._setInputValue(inputValue));
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        [
            this.inputView,
            this.dropdownView.buttonView
        ].forEach((view)=>{
            this.focusTracker.add(view.element);
            this._focusables.add(view);
        });
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * Focuses the view.
	 */ focus(direction) {
        if (direction === -1) {
            this.focusCycler.focusLast();
        } else {
            this.focusCycler.focusFirst();
        }
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Creates and configures the {@link #dropdownView}.
	 */ _createDropdownView() {
        const locale = this.locale;
        const t = locale.t;
        const bind = this.bindTemplate;
        const colorSelector = this._createColorSelector(locale);
        const dropdown = createDropdown(locale);
        const colorPreview = new View();
        colorPreview.setTemplate({
            tag: 'span',
            attributes: {
                class: [
                    'ck',
                    'ck-input-color__button__preview'
                ],
                style: {
                    backgroundColor: bind.to('value')
                }
            },
            children: [
                {
                    tag: 'span',
                    attributes: {
                        class: [
                            'ck',
                            'ck-input-color__button__preview__no-color-indicator',
                            bind.if('value', 'ck-hidden', (value)=>value != '')
                        ]
                    }
                }
            ]
        });
        dropdown.buttonView.extendTemplate({
            attributes: {
                class: 'ck-input-color__button'
            }
        });
        dropdown.buttonView.children.add(colorPreview);
        dropdown.buttonView.label = t('Color picker');
        dropdown.buttonView.tooltip = true;
        dropdown.panelPosition = locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw';
        dropdown.panelView.children.add(colorSelector);
        dropdown.bind('isEnabled').to(this, 'isReadOnly', (value)=>!value);
        dropdown.on('change:isOpen', (evt, name, isVisible)=>{
            if (isVisible) {
                colorSelector.updateSelectedColors();
                colorSelector.showColorGridsFragment();
            }
        });
        return dropdown;
    }
    /**
	 * Creates and configures an instance of {@link module:ui/inputtext/inputtextview~InputTextView}.
	 *
	 * @returns A configured instance to be set as {@link #inputView}.
	 */ _createInputTextView() {
        const locale = this.locale;
        const inputView = new InputTextView(locale);
        inputView.extendTemplate({
            on: {
                blur: inputView.bindTemplate.to('blur')
            }
        });
        inputView.value = this.value;
        inputView.bind('isReadOnly', 'hasError').to(this);
        this.bind('isFocused', 'isEmpty').to(inputView);
        inputView.on('input', ()=>{
            const inputValue = inputView.element.value;
            // Check if the value matches one of our defined colors' label.
            const mappedColor = this.options.colorDefinitions.find((def)=>inputValue === def.label);
            this._stillTyping = true;
            this.value = mappedColor && mappedColor.color || inputValue;
        });
        inputView.on('blur', ()=>{
            this._stillTyping = false;
            this._setInputValue(inputView.element.value);
        });
        inputView.delegate('input').to(this);
        return inputView;
    }
    /**
	 * Creates and configures the panel with "color grid" and "color picker" inside the {@link #dropdownView}.
	 */ _createColorSelector(locale) {
        const t = locale.t;
        const defaultColor = this.options.defaultColorValue || '';
        const removeColorButtonLabel = defaultColor ? t('Restore default') : t('Remove color');
        const colorSelector = new ColorSelectorView(locale, {
            colors: this.options.colorDefinitions,
            columns: this.options.columns,
            removeButtonLabel: removeColorButtonLabel,
            colorPickerLabel: t('Color picker'),
            colorPickerViewConfig: this.options.colorPickerConfig === false ? false : {
                ...this.options.colorPickerConfig,
                hideInput: true
            }
        });
        colorSelector.appendUI();
        colorSelector.on('execute', (evt, data)=>{
            if (data.source === 'colorPickerSaveButton') {
                this.dropdownView.isOpen = false;
                return;
            }
            this.value = data.value || defaultColor;
            // Trigger the listener that actually applies the set value.
            this.fire('input');
            if (data.source !== 'colorPicker') {
                this.dropdownView.isOpen = false;
            }
        });
        /**
		 * Color is saved before changes in color picker. In case "cancel button" is pressed
		 * this color will be applied.
		 */ let backupColor = this.value;
        colorSelector.on('colorPicker:cancel', ()=>{
            /**
			 * Revert color to previous value before changes in color picker.
			 */ this.value = backupColor;
            this.fire('input');
            this.dropdownView.isOpen = false;
        });
        colorSelector.colorGridsFragmentView.colorPickerButtonView.on('execute', ()=>{
            /**
			 * Save color value before changes in color picker.
			 */ backupColor = this.value;
        });
        colorSelector.bind('selectedColor').to(this, 'value');
        return colorSelector;
    }
    /**
	 * Sets {@link #inputView}'s value property to the color value or color label,
	 * if there is one and the user is not typing.
	 *
	 * Handles cases like:
	 *
	 * * Someone picks the color in the grid.
	 * * The color is set from the plugin level.
	 *
	 * @param inputValue Color value to be set.
	 */ _setInputValue(inputValue) {
        if (!this._stillTyping) {
            const normalizedInputValue = normalizeColor(inputValue);
            // Check if the value matches one of our defined colors.
            const mappedColor = this.options.colorDefinitions.find((def)=>normalizedInputValue === normalizeColor(def.color));
            if (mappedColor) {
                this.inputView.value = mappedColor.label;
            } else {
                this.inputView.value = inputValue || '';
            }
        }
    }
}
/**
 * Normalizes color value, by stripping extensive whitespace.
 * For example., transforms:
 * * `   rgb(  25 50    0 )` to `rgb(25 50 0)`,
 * * "\t  rgb(  25 ,  50,0 )		" to `rgb(25 50 0)`.
 *
 * @param colorString The value to be normalized.
 */ function normalizeColor(colorString) {
    return colorString// Remove any whitespace right after `(` or `,`.
    .replace(/([(,])\s+/g, '$1')// Remove any whitespace at the beginning or right before the end, `)`, `,`, or another whitespace.
    .replace(/^\s+|\s+(?=[),\s]|$)/g, '')// Then, replace `,` or whitespace with a single space.
    .replace(/,|\s/g, ' ');
}

const isEmpty = (val)=>val === '';
/**
 * Returns an object containing pairs of CSS border style values and their localized UI
 * labels. Used by {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView}
 * and {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView}.
 *
 * @internal
 * @param t The "t" function provided by the editor that is used to localize strings.
 */ function getBorderStyleLabels$1(t) {
    return {
        none: t('None'),
        solid: t('Solid'),
        dotted: t('Dotted'),
        dashed: t('Dashed'),
        double: t('Double'),
        groove: t('Groove'),
        ridge: t('Ridge'),
        inset: t('Inset'),
        outset: t('Outset')
    };
}
/**
 * Returns a localized error string that can be displayed next to color (background, border)
 * fields that have an invalid value.
 *
 * @internal
 * @param t The "t" function provided by the editor that is used to localize strings.
 */ function getLocalizedColorErrorText(t) {
    return t('The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".');
}
/**
 * Returns a localized error string that can be displayed next to length (padding, border width)
 * fields that have an invalid value.
 *
 * @internal
 * @param t The "t" function provided by the editor that is used to localize strings.
 */ function getLocalizedLengthErrorText(t) {
    return t('The value is invalid. Try "10px" or "2em" or simply "2".');
}
/**
 * Returns `true` when the passed value is an empty string or a valid CSS color expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isColorStyleValue}.
 *
 * @internal
 */ function colorFieldValidator(value) {
    value = value.trim().toLowerCase();
    return isEmpty(value) || isColorStyleValue(value);
}
/**
 * Returns `true` when the passed value is an empty string, a number without a unit or a valid CSS length expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isLengthStyleValue}.
 * See {@link module:engine/view/styles/utils~isPercentageStyleValue}.
 *
 * @internal
 */ function lengthFieldValidator(value) {
    value = value.trim();
    return isEmpty(value) || isNumberString(value) || isLengthStyleValue(value) || isPercentageStyleValue(value);
}
/**
 * Returns `true` when the passed value is an empty string, a number without a unit or a valid CSS length expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isLengthStyleValue}.
 *
 * @internal
 */ function lineWidthFieldValidator(value) {
    value = value.trim();
    return isEmpty(value) || isNumberString(value) || isLengthStyleValue(value);
}
/**
 * Generates item definitions for a UI dropdown that allows changing the border style of a table or a table cell.
 *
 * @internal
 * @param defaultStyle The default border.
 */ function getBorderStyleDefinitions$1(view, defaultStyle) {
    const itemDefinitions = new Collection();
    const styleLabels = getBorderStyleLabels$1(view.t);
    for(const style in styleLabels){
        const definition = {
            type: 'button',
            model: new UIModel({
                _borderStyleValue: style,
                label: styleLabels[style],
                role: 'menuitemradio',
                withText: true
            })
        };
        if (style === 'none') {
            definition.model.bind('isOn').to(view, 'borderStyle', (value)=>{
                if (defaultStyle === 'none') {
                    return !value;
                }
                return value === style;
            });
        } else {
            definition.model.bind('isOn').to(view, 'borderStyle', (value)=>{
                return value === style;
            });
        }
        itemDefinitions.add(definition);
    }
    return itemDefinitions;
}
/**
 * A helper that fills a toolbar with buttons that:
 *
 * * have some labels,
 * * have some icons,
 * * set a certain UI view property value upon execution.
 *
 * @internal
 * @param options Configuration options
 * @param options.view The view that has the observable property.
 * @param options.icons Object with button icons.
 * @param options.toolbar The toolbar to fill with buttons.
 * @param options.labels Object with button labels.
 * @param options.propertyName The name of the observable property in the view.
 * @param options.nameToValue A function that maps a button name to a value. By default names are the same as values.
 * @param options.defaultValue Default value for the property.
 */ function fillToolbar$1(options) {
    const { view, icons, toolbar, labels, propertyName, nameToValue, defaultValue } = options;
    for(const name in labels){
        const button = new ButtonView(view.locale);
        button.set({
            role: 'radio',
            isToggleable: true,
            label: labels[name],
            icon: icons[name],
            tooltip: labels[name]
        });
        // If specified the `nameToValue()` callback, map the value based on the option's name.
        const buttonValue = nameToValue ? nameToValue(name) : name;
        button.bind('isOn').to(view, propertyName, (value)=>{
            // `value` comes from `view[ propertyName ]`.
            let valueToCompare = value;
            // If it's empty, and the `defaultValue` is specified, use it instead.
            if (value === '' && defaultValue) {
                valueToCompare = defaultValue;
            }
            return buttonValue === valueToCompare;
        });
        button.on('execute', ()=>{
            // Allow toggling alignment if there is no default value specified (especially for layout tables).
            if (!defaultValue && buttonValue && view[propertyName] === buttonValue) {
                view[propertyName] = undefined;
            } else {
                view[propertyName] = buttonValue;
            }
        });
        toolbar.items.add(button);
    }
}
/**
 * A default color palette used by various user interfaces related to tables, for instance,
 * by {@link module:table/tablecellproperties/tablecellpropertiesui~TableCellPropertiesUI} or
 * {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI}.
 *
 * The color palette follows the {@link module:table/tableconfig~TableColorConfig table color configuration format}
 * and contains the following color definitions:
 *
 * ```ts
 * const defaultColors = [
 *   {
 *     color: 'hsl(0, 0%, 0%)',
 *     label: 'Black'
 *   },
 *   {
 *     color: 'hsl(0, 0%, 30%)',
 *     label: 'Dim grey'
 *   },
 *   {
 *     color: 'hsl(0, 0%, 60%)',
 *     label: 'Grey'
 *   },
 *   {
 *     color: 'hsl(0, 0%, 90%)',
 *     label: 'Light grey'
 *   },
 *   {
 *     color: 'hsl(0, 0%, 100%)',
 *     label: 'White',
 *     hasBorder: true
 *   },
 *   {
 *     color: 'hsl(0, 75%, 60%)',
 *     label: 'Red'
 *   },
 *   {
 *     color: 'hsl(30, 75%, 60%)',
 *     label: 'Orange'
 *   },
 *   {
 *     color: 'hsl(60, 75%, 60%)',
 *     label: 'Yellow'
 *   },
 *   {
 *     color: 'hsl(90, 75%, 60%)',
 *     label: 'Light green'
 *   },
 *   {
 *     color: 'hsl(120, 75%, 60%)',
 *     label: 'Green'
 *   },
 *   {
 *     color: 'hsl(150, 75%, 60%)',
 *     label: 'Aquamarine'
 *   },
 *   {
 *     color: 'hsl(180, 75%, 60%)',
 *     label: 'Turquoise'
 *   },
 *   {
 *     color: 'hsl(210, 75%, 60%)',
 *     label: 'Light blue'
 *   },
 *   {
 *     color: 'hsl(240, 75%, 60%)',
 *     label: 'Blue'
 *   },
 *   {
 *     color: 'hsl(270, 75%, 60%)',
 *     label: 'Purple'
 *   }
 * ];
 * ```
 *
 * @internal
 */ const defaultColors = [
    {
        color: 'hsl(0, 0%, 0%)',
        label: 'Black'
    },
    {
        color: 'hsl(0, 0%, 30%)',
        label: 'Dim grey'
    },
    {
        color: 'hsl(0, 0%, 60%)',
        label: 'Grey'
    },
    {
        color: 'hsl(0, 0%, 90%)',
        label: 'Light grey'
    },
    {
        color: 'hsl(0, 0%, 100%)',
        label: 'White',
        hasBorder: true
    },
    {
        color: 'hsl(0, 75%, 60%)',
        label: 'Red'
    },
    {
        color: 'hsl(30, 75%, 60%)',
        label: 'Orange'
    },
    {
        color: 'hsl(60, 75%, 60%)',
        label: 'Yellow'
    },
    {
        color: 'hsl(90, 75%, 60%)',
        label: 'Light green'
    },
    {
        color: 'hsl(120, 75%, 60%)',
        label: 'Green'
    },
    {
        color: 'hsl(150, 75%, 60%)',
        label: 'Aquamarine'
    },
    {
        color: 'hsl(180, 75%, 60%)',
        label: 'Turquoise'
    },
    {
        color: 'hsl(210, 75%, 60%)',
        label: 'Light blue'
    },
    {
        color: 'hsl(240, 75%, 60%)',
        label: 'Blue'
    },
    {
        color: 'hsl(270, 75%, 60%)',
        label: 'Purple'
    }
];
/**
 * Returns a creator for a color input with a label.
 *
 * For given options, it returns a function that creates an instance of a
 * {@link module:table/ui/colorinputview~ColorInputView color input} logically related to
 * a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled view} in the DOM.
 *
 * The helper does the following:
 *
 * * It sets the color input `id` and `ariaDescribedById` attributes.
 * * It binds the color input `isReadOnly` to the labeled view.
 * * It binds the color input `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when the user starts typing in the color input.
 *
 * Usage:
 *
 * ```ts
 * const colorInputCreator = getLabeledColorInputCreator( {
 *   colorConfig: [ ... ],
 *   columns: 3,
 * } );
 *
 * const labeledInputView = new LabeledFieldView( locale, colorInputCreator );
 * console.log( labeledInputView.view ); // A color input instance.
 * ```
 *
 * @internal
 * @param options Color input options.
 * @param options.colorConfig The configuration of the color palette displayed in the input's dropdown.
 * @param options.columns The configuration of the number of columns the color palette consists of in the input's dropdown.
 * @param options.defaultColorValue If specified, the color input view will replace the "Remove color" button with
 * the "Restore default" button. Instead of clearing the input field, the default color value will be set.
 * @param options.colorPickerConfig The configuration of the color picker. You could disable it or define your output format.
 */ function getLabeledColorInputCreator$1(options) {
    return (labeledFieldView, viewUid, statusUid)=>{
        const colorInputView = new ColorInputView(labeledFieldView.locale, {
            colorDefinitions: colorConfigToColorGridDefinitions$1(options.colorConfig),
            columns: options.columns,
            defaultColorValue: options.defaultColorValue,
            colorPickerConfig: options.colorPickerConfig
        });
        colorInputView.inputView.set({
            id: viewUid,
            ariaDescribedById: statusUid
        });
        colorInputView.bind('isReadOnly').to(labeledFieldView, 'isEnabled', (value)=>!value);
        colorInputView.bind('hasError').to(labeledFieldView, 'errorText', (value)=>!!value);
        colorInputView.on('input', ()=>{
            // UX: Make the error text disappear and disable the error indicator as the user
            // starts fixing the errors.
            labeledFieldView.errorText = null;
        });
        labeledFieldView.bind('isEmpty', 'isFocused').to(colorInputView);
        return colorInputView;
    };
}
/**
 * A simple helper method to detect number strings.
 * I allows full number notation, so omitting 0 is not allowed:
 */ function isNumberString(value) {
    const parsedValue = parseFloat(value);
    return !Number.isNaN(parsedValue) && value === String(parsedValue);
}
function colorConfigToColorGridDefinitions$1(colorConfig) {
    return colorConfig.map((item)=>({
            color: item.model,
            label: item.label,
            options: {
                hasBorder: item.hasBorder
            }
        }));
}

/**
 * The class representing a table cell properties form, allowing users to customize
 * certain style aspects of a table cell, for instance, border, padding, text alignment, etc..
 */ class TableCellPropertiesView extends View {
    /**
	 * Options passed to the view. See {@link #constructor} to learn more.
	 */ options;
    /**
	 * Tracks information about the DOM focus in the form.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * A collection of child views in the form.
	 */ children;
    /**
	 * A dropdown that allows selecting the style of the table cell border.
	 */ borderStyleDropdown;
    /**
	 * An input that allows specifying the width of the table cell border.
	 */ borderWidthInput;
    /**
	 * An input that allows specifying the color of the table cell border.
	 */ borderColorInput;
    /**
	 * An input that allows specifying the table cell background color.
	 */ backgroundInput;
    /**
	 * An input that allows specifying the table cell padding.
	 */ paddingInput;
    /**
	 * An input that allows specifying the table cell width.
	 */ widthInput;
    /**
	 * An input that allows specifying the table cell height.
	 */ heightInput;
    /**
	 * A toolbar with buttons that allow changing the horizontal text alignment in a table cell.
	 */ horizontalAlignmentToolbar;
    /**
	 * A toolbar with buttons that allow changing the vertical text alignment in a table cell.
	 */ verticalAlignmentToolbar;
    /**
	 * The "Save" button view.
	 */ saveButtonView;
    /**
	 * The "Cancel" button view.
	 */ cancelButtonView;
    /**
	 * A collection of views that can be focused in the form.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param options Additional configuration of the view.
	 * @param options.borderColors A configuration of the border color palette used by the
	 * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#borderColorInput}.
	 * @param options.backgroundColors A configuration of the background color palette used by the
	 * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#backgroundInput}.
	 * @param options.defaultTableCellProperties The default table cell properties.
	 */ constructor(locale, options){
        super(locale);
        this.set({
            borderStyle: '',
            borderWidth: '',
            borderColor: '',
            padding: '',
            backgroundColor: '',
            width: '',
            height: '',
            horizontalAlignment: '',
            verticalAlignment: ''
        });
        this.options = options;
        const { borderStyleDropdown, borderWidthInput, borderColorInput, borderRowLabel } = this._createBorderFields();
        const { backgroundRowLabel, backgroundInput } = this._createBackgroundFields();
        const { widthInput, operatorLabel, heightInput, dimensionsLabel } = this._createDimensionFields();
        const { horizontalAlignmentToolbar, verticalAlignmentToolbar, alignmentLabel } = this._createAlignmentFields();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.children = this.createCollection();
        this.borderStyleDropdown = borderStyleDropdown;
        this.borderWidthInput = borderWidthInput;
        this.borderColorInput = borderColorInput;
        this.backgroundInput = backgroundInput;
        this.paddingInput = this._createPaddingField();
        this.widthInput = widthInput;
        this.heightInput = heightInput;
        this.horizontalAlignmentToolbar = horizontalAlignmentToolbar;
        this.verticalAlignmentToolbar = verticalAlignmentToolbar;
        // Defer creating to make sure other fields are present and the Save button can
        // bind its #isEnabled to their error messages so there's no way to save unless all
        // fields are valid.
        const { saveButtonView, cancelButtonView } = this._createActionButtons();
        this.saveButtonView = saveButtonView;
        this.cancelButtonView = cancelButtonView;
        this._focusables = new ViewCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        // Form header.
        this.children.add(new FormHeaderView(locale, {
            label: this.t('Cell properties')
        }));
        // Border row.
        this.children.add(new FormRowView(locale, {
            labelView: borderRowLabel,
            children: [
                borderRowLabel,
                borderStyleDropdown,
                borderColorInput,
                borderWidthInput
            ],
            class: 'ck-table-form__border-row'
        }));
        // Background.
        this.children.add(new FormRowView(locale, {
            labelView: backgroundRowLabel,
            children: [
                backgroundRowLabel,
                backgroundInput
            ],
            class: 'ck-table-form__background-row'
        }));
        // Dimensions row and padding.
        this.children.add(new FormRowView(locale, {
            children: [
                // Dimensions row.
                new FormRowView(locale, {
                    labelView: dimensionsLabel,
                    children: [
                        dimensionsLabel,
                        widthInput,
                        operatorLabel,
                        heightInput
                    ],
                    class: 'ck-table-form__dimensions-row'
                }),
                // Padding row.
                new FormRowView(locale, {
                    children: [
                        this.paddingInput
                    ],
                    class: 'ck-table-cell-properties-form__padding-row'
                })
            ]
        }));
        // Text alignment row.
        this.children.add(new FormRowView(locale, {
            labelView: alignmentLabel,
            children: [
                alignmentLabel,
                horizontalAlignmentToolbar,
                verticalAlignmentToolbar
            ],
            class: 'ck-table-cell-properties-form__alignment-row'
        }));
        // Action row.
        this.children.add(new FormRowView(locale, {
            children: [
                this.saveButtonView,
                this.cancelButtonView
            ],
            class: 'ck-table-form__action-row'
        }));
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-table-form',
                    'ck-table-cell-properties-form'
                ],
                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        // Enable the "submit" event for this view. It can be triggered by the #saveButtonView
        // which is of the "submit" DOM "type".
        submitHandler({
            view: this
        });
        // Maintain continuous focus cycling over views that have focusable children and focus cyclers themselves.
        [
            this.borderColorInput,
            this.backgroundInput
        ].forEach((view)=>{
            this._focusCycler.chain(view.fieldView.focusCycler);
        });
        [
            this.borderStyleDropdown,
            this.borderColorInput,
            this.borderWidthInput,
            this.backgroundInput,
            this.widthInput,
            this.heightInput,
            this.paddingInput,
            this.horizontalAlignmentToolbar,
            this.verticalAlignmentToolbar,
            this.saveButtonView,
            this.cancelButtonView
        ].forEach((view)=>{
            // Register the view as focusable.
            this._focusables.add(view);
            // Register the view in the focus tracker.
            this.focusTracker.add(view.element);
        });
        // Mainly for closing using "Esc" and navigation using "Tab".
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the fist focusable field in the form.
	 */ focus() {
        this._focusCycler.focusFirst();
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #borderStyleDropdown},
	 * * {@link #borderWidthInput},
	 * * {@link #borderColorInput}.
	 */ _createBorderFields() {
        const defaultTableCellProperties = this.options.defaultTableCellProperties;
        const defaultBorder = {
            style: defaultTableCellProperties.borderStyle,
            width: defaultTableCellProperties.borderWidth,
            color: defaultTableCellProperties.borderColor
        };
        const colorInputCreator = getLabeledColorInputCreator$1({
            colorConfig: this.options.borderColors,
            columns: 5,
            defaultColorValue: defaultBorder.color,
            colorPickerConfig: this.options.colorPickerConfig
        });
        const locale = this.locale;
        const t = this.t;
        const accessibleLabel = t('Style');
        // -- Group label ---------------------------------------------
        const borderRowLabel = new LabelView(locale);
        borderRowLabel.text = t('Border');
        // -- Style ---------------------------------------------------
        const styleLabels = getBorderStyleLabels$1(t);
        const borderStyleDropdown = new LabeledFieldView(locale, createLabeledDropdown);
        borderStyleDropdown.set({
            label: accessibleLabel,
            class: 'ck-table-form__border-style'
        });
        borderStyleDropdown.fieldView.buttonView.set({
            ariaLabel: accessibleLabel,
            ariaLabelledBy: undefined,
            isOn: false,
            withText: true,
            tooltip: accessibleLabel
        });
        borderStyleDropdown.fieldView.buttonView.bind('label').to(this, 'borderStyle', (value)=>{
            return styleLabels[value ? value : 'none'];
        });
        borderStyleDropdown.fieldView.on('execute', (evt)=>{
            this.borderStyle = evt.source._borderStyleValue;
        });
        borderStyleDropdown.bind('isEmpty').to(this, 'borderStyle', (value)=>!value);
        addListToDropdown(borderStyleDropdown.fieldView, getBorderStyleDefinitions$1(this, defaultBorder.style), {
            role: 'menu',
            ariaLabel: accessibleLabel
        });
        // -- Width ---------------------------------------------------
        const borderWidthInput = new LabeledFieldView(locale, createLabeledInputText);
        borderWidthInput.set({
            label: t('Width'),
            class: 'ck-table-form__border-width'
        });
        borderWidthInput.fieldView.bind('value').to(this, 'borderWidth');
        borderWidthInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet$3);
        borderWidthInput.fieldView.on('input', ()=>{
            this.borderWidth = borderWidthInput.fieldView.element.value;
        });
        // -- Color ---------------------------------------------------
        const borderColorInput = new LabeledFieldView(locale, colorInputCreator);
        borderColorInput.set({
            label: t('Color'),
            class: 'ck-table-form__border-color'
        });
        borderColorInput.fieldView.bind('value').to(this, 'borderColor');
        borderColorInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet$3);
        borderColorInput.fieldView.on('input', ()=>{
            this.borderColor = borderColorInput.fieldView.value;
        });
        // Reset the border color and width fields depending on the `border-style` value.
        this.on('change:borderStyle', (evt, name, newValue, oldValue)=>{
            // When removing the border (`border-style:none`), clear the remaining `border-*` properties.
            // See: https://github.com/ckeditor/ckeditor5/issues/6227.
            if (!isBorderStyleSet$3(newValue)) {
                this.borderColor = '';
                this.borderWidth = '';
            }
            // When setting the `border-style` from `none`, set the default `border-color` and `border-width` properties.
            if (!isBorderStyleSet$3(oldValue)) {
                this.borderColor = defaultBorder.color;
                this.borderWidth = defaultBorder.width;
            }
        });
        return {
            borderRowLabel,
            borderStyleDropdown,
            borderColorInput,
            borderWidthInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #backgroundInput}.
	 */ _createBackgroundFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Group label ---------------------------------------------
        const backgroundRowLabel = new LabelView(locale);
        backgroundRowLabel.text = t('Background');
        // -- Background color input -----------------------------------
        const colorInputCreator = getLabeledColorInputCreator$1({
            colorConfig: this.options.backgroundColors,
            columns: 5,
            defaultColorValue: this.options.defaultTableCellProperties.backgroundColor,
            colorPickerConfig: this.options.colorPickerConfig
        });
        const backgroundInput = new LabeledFieldView(locale, colorInputCreator);
        backgroundInput.set({
            label: t('Color'),
            class: 'ck-table-cell-properties-form__background'
        });
        backgroundInput.fieldView.bind('value').to(this, 'backgroundColor');
        backgroundInput.fieldView.on('input', ()=>{
            this.backgroundColor = backgroundInput.fieldView.value;
        });
        return {
            backgroundRowLabel,
            backgroundInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #widthInput}.
	 * * {@link #heightInput}.
	 */ _createDimensionFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Label ---------------------------------------------------
        const dimensionsLabel = new LabelView(locale);
        dimensionsLabel.text = t('Dimensions');
        // -- Width ---------------------------------------------------
        const widthInput = new LabeledFieldView(locale, createLabeledInputText);
        widthInput.set({
            label: t('Width'),
            class: 'ck-table-form__dimensions-row__width'
        });
        widthInput.fieldView.bind('value').to(this, 'width');
        widthInput.fieldView.on('input', ()=>{
            this.width = widthInput.fieldView.element.value;
        });
        // -- Operator ---------------------------------------------------
        const operatorLabel = new View(locale);
        operatorLabel.setTemplate({
            tag: 'span',
            attributes: {
                class: [
                    'ck-table-form__dimension-operator'
                ]
            },
            children: [
                {
                    text: '×'
                }
            ]
        });
        // -- Height ---------------------------------------------------
        const heightInput = new LabeledFieldView(locale, createLabeledInputText);
        heightInput.set({
            label: t('Height'),
            class: 'ck-table-form__dimensions-row__height'
        });
        heightInput.fieldView.bind('value').to(this, 'height');
        heightInput.fieldView.on('input', ()=>{
            this.height = heightInput.fieldView.element.value;
        });
        return {
            dimensionsLabel,
            widthInput,
            operatorLabel,
            heightInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #paddingInput}.
	 */ _createPaddingField() {
        const locale = this.locale;
        const t = this.t;
        const paddingInput = new LabeledFieldView(locale, createLabeledInputText);
        paddingInput.set({
            label: t('Padding'),
            class: 'ck-table-cell-properties-form__padding'
        });
        paddingInput.fieldView.bind('value').to(this, 'padding');
        paddingInput.fieldView.on('input', ()=>{
            this.padding = paddingInput.fieldView.element.value;
        });
        return paddingInput;
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #horizontalAlignmentToolbar},
	 * * {@link #verticalAlignmentToolbar}.
	 */ _createAlignmentFields() {
        const locale = this.locale;
        const t = this.t;
        const alignmentLabel = new LabelView(locale);
        const ALIGNMENT_ICONS = {
            left: IconAlignLeft,
            center: IconAlignCenter,
            right: IconAlignRight,
            justify: IconAlignJustify,
            top: IconAlignTop,
            middle: IconAlignMiddle,
            bottom: IconAlignBottom
        };
        alignmentLabel.text = t('Table cell text alignment');
        // -- Horizontal ---------------------------------------------------
        const horizontalAlignmentToolbar = new ToolbarView(locale);
        const isContentRTL = locale.contentLanguageDirection === 'rtl';
        horizontalAlignmentToolbar.set({
            isCompact: true,
            role: 'radiogroup',
            ariaLabel: t('Horizontal text alignment toolbar')
        });
        fillToolbar$1({
            view: this,
            icons: ALIGNMENT_ICONS,
            toolbar: horizontalAlignmentToolbar,
            labels: this._horizontalAlignmentLabels,
            propertyName: 'horizontalAlignment',
            nameToValue: (name)=>{
                // For the RTL content, we want to swap the buttons "align to the left" and "align to the right".
                if (isContentRTL) {
                    if (name === 'left') {
                        return 'right';
                    } else if (name === 'right') {
                        return 'left';
                    }
                }
                return name;
            },
            defaultValue: this.options.defaultTableCellProperties.horizontalAlignment
        });
        // -- Vertical -----------------------------------------------------
        const verticalAlignmentToolbar = new ToolbarView(locale);
        verticalAlignmentToolbar.set({
            isCompact: true,
            role: 'radiogroup',
            ariaLabel: t('Vertical text alignment toolbar')
        });
        fillToolbar$1({
            view: this,
            icons: ALIGNMENT_ICONS,
            toolbar: verticalAlignmentToolbar,
            labels: this._verticalAlignmentLabels,
            propertyName: 'verticalAlignment',
            defaultValue: this.options.defaultTableCellProperties.verticalAlignment
        });
        return {
            horizontalAlignmentToolbar,
            verticalAlignmentToolbar,
            alignmentLabel
        };
    }
    /**
	 * Creates the following form controls:
	 *
	 * * {@link #saveButtonView},
	 * * {@link #cancelButtonView}.
	 */ _createActionButtons() {
        const locale = this.locale;
        const t = this.t;
        const saveButtonView = new ButtonView(locale);
        const cancelButtonView = new ButtonView(locale);
        const fieldsThatShouldValidateToSave = [
            this.borderWidthInput,
            this.borderColorInput,
            this.backgroundInput,
            this.paddingInput
        ];
        saveButtonView.set({
            label: t('Save'),
            icon: IconCheck,
            class: 'ck-button-save',
            type: 'submit',
            withText: true
        });
        saveButtonView.bind('isEnabled').toMany(fieldsThatShouldValidateToSave, 'errorText', (...errorTexts)=>{
            return errorTexts.every((errorText)=>!errorText);
        });
        cancelButtonView.set({
            label: t('Cancel'),
            icon: IconCancel,
            class: 'ck-button-cancel',
            withText: true
        });
        cancelButtonView.delegate('execute').to(this, 'cancel');
        return {
            saveButtonView,
            cancelButtonView
        };
    }
    /**
	 * Provides localized labels for {@link #horizontalAlignmentToolbar} buttons.
	 */ get _horizontalAlignmentLabels() {
        const locale = this.locale;
        const t = this.t;
        const left = t('Align cell text to the left');
        const center = t('Align cell text to the center');
        const right = t('Align cell text to the right');
        const justify = t('Justify cell text');
        // Returns object with a proper order of labels.
        if (locale.uiLanguageDirection === 'rtl') {
            return {
                right,
                center,
                left,
                justify
            };
        } else {
            return {
                left,
                center,
                right,
                justify
            };
        }
    }
    /**
	 * Provides localized labels for {@link #verticalAlignmentToolbar} buttons.
	 */ get _verticalAlignmentLabels() {
        const t = this.t;
        return {
            top: t('Align cell text to the top'),
            middle: t('Align cell text to the middle'),
            bottom: t('Align cell text to the bottom')
        };
    }
}
function isBorderStyleSet$3(value) {
    return value !== 'none';
}

const BALLOON_POSITIONS = /* #__PURE__ */ (()=>[
        BalloonPanelView.defaultPositions.northArrowSouth,
        BalloonPanelView.defaultPositions.northArrowSouthWest,
        BalloonPanelView.defaultPositions.northArrowSouthEast,
        BalloonPanelView.defaultPositions.southArrowNorth,
        BalloonPanelView.defaultPositions.southArrowNorthWest,
        BalloonPanelView.defaultPositions.southArrowNorthEast,
        BalloonPanelView.defaultPositions.viewportStickyNorth
    ])();
/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the table in the editor content, if one is selected.
 *
 * @internal
 * @param editor The editor instance.
 * @param target Either "cell" or "table". Determines the target the balloon will be attached to.
 */ function repositionContextualBalloon(editor, target) {
    const balloon = editor.plugins.get('ContextualBalloon');
    const selection = editor.editing.view.document.selection;
    let position;
    if (target === 'cell') {
        if (getTableWidgetAncestor(selection)) {
            position = getBalloonCellPositionData(editor);
        }
    } else if (getSelectionAffectedTableWidget(selection)) {
        position = getBalloonTablePositionData(editor);
    }
    if (position) {
        balloon.updatePosition(position);
    }
}
/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table in the editor content.
 *
 * @param editor The editor instance.
 */ function getBalloonTablePositionData(editor) {
    const selection = editor.model.document.selection;
    const modelTable = getSelectionAffectedTable(selection);
    const viewTable = editor.editing.mapper.toViewElement(modelTable);
    return {
        target: editor.editing.view.domConverter.mapViewToDom(viewTable),
        positions: BALLOON_POSITIONS
    };
}
/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table cell in the editor content.
 *
 * @param editor The editor instance.
 * @internal
 */ function getBalloonCellPositionData(editor) {
    const mapper = editor.editing.mapper;
    const domConverter = editor.editing.view.domConverter;
    const selection = editor.model.document.selection;
    if (selection.rangeCount > 1) {
        return {
            target: ()=>createBoundingRect(selection.getRanges(), editor),
            positions: BALLOON_POSITIONS
        };
    }
    const modelTableCell = getTableCellAtPosition(selection.getFirstPosition());
    const viewTableCell = mapper.toViewElement(modelTableCell);
    return {
        target: domConverter.mapViewToDom(viewTableCell),
        positions: BALLOON_POSITIONS
    };
}
/**
 * Returns the first selected table cell from a multi-cell or in-cell selection.
 *
 * @param position Document position.
 */ function getTableCellAtPosition(position) {
    const isTableCellSelected = position.nodeAfter && position.nodeAfter.is('element', 'tableCell');
    return isTableCellSelected ? position.nodeAfter : position.findAncestor('tableCell');
}
/**
 * Returns bounding rectangle for given model ranges.
 *
 * @param ranges Model ranges that the bounding rect should be returned for.
 * @param editor The editor instance.
 */ function createBoundingRect(ranges, editor) {
    const mapper = editor.editing.mapper;
    const domConverter = editor.editing.view.domConverter;
    const rects = Array.from(ranges).map((range)=>{
        const modelTableCell = getTableCellAtPosition(range.start);
        const viewTableCell = mapper.toViewElement(modelTableCell);
        return new Rect(domConverter.mapViewToDom(viewTableCell));
    });
    return Rect.getBoundingRect(rects);
}

const ERROR_TEXT_TIMEOUT$3 = 500;
// Map of view properties and related commands.
const propertyToCommandMap$3 = {
    borderStyle: 'tableCellBorderStyle',
    borderColor: 'tableCellBorderColor',
    borderWidth: 'tableCellBorderWidth',
    height: 'tableCellHeight',
    width: 'tableCellWidth',
    padding: 'tableCellPadding',
    backgroundColor: 'tableCellBackgroundColor',
    horizontalAlignment: 'tableCellHorizontalAlignment',
    verticalAlignment: 'tableCellVerticalAlignment'
};
/**
 * The table cell properties UI plugin. It introduces the `'tableCellProperties'` button
 * that opens a form allowing to specify the visual styling of a table cell.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */ class TableCellPropertiesUI extends Plugin {
    /**
	 * The default table cell properties.
	 */ _defaultContentTableCellProperties;
    /**
	 * The default layout table cell properties.
	 */ _defaultLayoutTableCellProperties;
    /**
	 * The contextual balloon plugin instance.
	 */ _balloon;
    /**
	 * The cell properties form view displayed inside the balloon.
	 */ view;
    /**
	 * The cell properties form view displayed inside the balloon (content table).
	 */ _viewWithContentTableDefaults;
    /**
	 * The cell properties form view displayed inside the balloon (layout table).
	 */ _viewWithLayoutTableDefaults;
    /**
	 * The batch used to undo all changes made by the form (which are live, as the user types)
	 * when "Cancel" was pressed. Each time the view is shown, a new batch is created.
	 */ _undoStepBatch;
    /**
	 * Flag used to indicate whether view is ready to execute update commands
	 * (it finished loading initial data).
	 */ _isReady;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ContextualBalloon
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableCellPropertiesUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('table.tableCellProperties', {
            borderColors: defaultColors,
            backgroundColors: defaultColors
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = editor.t;
        this._defaultContentTableCellProperties = getNormalizedDefaultCellProperties(editor.config.get('table.tableCellProperties.defaultProperties'), {
            includeVerticalAlignmentProperty: true,
            includeHorizontalAlignmentProperty: true,
            includePaddingProperty: true,
            isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
        });
        this._defaultLayoutTableCellProperties = getNormalizedDefaultProperties(undefined, {
            includeVerticalAlignmentProperty: true,
            includeHorizontalAlignmentProperty: true,
            isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
        });
        this._balloon = editor.plugins.get(ContextualBalloon);
        this.view = null;
        this._isReady = false;
        editor.ui.componentFactory.add('tableCellProperties', (locale)=>{
            const view = new ButtonView(locale);
            view.set({
                label: t('Cell properties'),
                icon: IconTableCellProperties,
                tooltip: true
            });
            this.listenTo(view, 'execute', ()=>this._showView());
            const commands = Object.values(propertyToCommandMap$3).map((commandName)=>editor.commands.get(commandName));
            view.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>areEnabled.some((isCommandEnabled)=>isCommandEnabled));
            return view;
        });
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed.
        // See https://github.com/ckeditor/ckeditor5/issues/1341.
        if (this.view) {
            this.view.destroy();
        }
    }
    /**
	 * Creates the {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView} instance.
	 *
	 * @returns The cell properties form view instance.
	 */ _createPropertiesView(defaultTableCellProperties) {
        const editor = this.editor;
        const config = editor.config.get('table.tableCellProperties');
        const borderColorsConfig = normalizeColorOptions(config.borderColors);
        const localizedBorderColors = getLocalizedColorOptions(editor.locale, borderColorsConfig);
        const backgroundColorsConfig = normalizeColorOptions(config.backgroundColors);
        const localizedBackgroundColors = getLocalizedColorOptions(editor.locale, backgroundColorsConfig);
        const hasColorPicker = config.colorPicker !== false;
        const view = new TableCellPropertiesView(editor.locale, {
            borderColors: localizedBorderColors,
            backgroundColors: localizedBackgroundColors,
            defaultTableCellProperties,
            colorPickerConfig: hasColorPicker ? config.colorPicker || {} : false
        });
        const t = editor.t;
        // Render the view so its #element is available for the clickOutsideHandler.
        view.render();
        this.listenTo(view, 'submit', ()=>{
            this._hideView();
        });
        this.listenTo(view, 'cancel', ()=>{
            // https://github.com/ckeditor/ckeditor5/issues/6180
            if (this._undoStepBatch.operations.length) {
                editor.execute('undo', this._undoStepBatch);
            }
            this._hideView();
        });
        // Close the balloon on Esc key press.
        view.keystrokes.set('Esc', (data, cancel)=>{
            this._hideView();
            cancel();
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: view,
            activator: ()=>this._isViewInBalloon,
            contextElements: [
                this._balloon.view.element
            ],
            callback: ()=>this._hideView()
        });
        const colorErrorText = getLocalizedColorErrorText(t);
        const lengthErrorText = getLocalizedLengthErrorText(t);
        // Create the "UI -> editor data" binding.
        // These listeners update the editor data (via table commands) when any observable
        // property of the view has changed. They also validate the value and display errors in the UI
        // when necessary. This makes the view live, which means the changes are
        // visible in the editing as soon as the user types or changes fields' values.
        view.on('change:borderStyle', this._getPropertyChangeCallback('tableCellBorderStyle'));
        view.on('change:borderColor', this._getValidatedPropertyChangeCallback({
            viewField: view.borderColorInput,
            commandName: 'tableCellBorderColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:borderWidth', this._getValidatedPropertyChangeCallback({
            viewField: view.borderWidthInput,
            commandName: 'tableCellBorderWidth',
            errorText: lengthErrorText,
            validator: lineWidthFieldValidator
        }));
        view.on('change:padding', this._getValidatedPropertyChangeCallback({
            viewField: view.paddingInput,
            commandName: 'tableCellPadding',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:width', this._getValidatedPropertyChangeCallback({
            viewField: view.widthInput,
            commandName: 'tableCellWidth',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:height', this._getValidatedPropertyChangeCallback({
            viewField: view.heightInput,
            commandName: 'tableCellHeight',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:backgroundColor', this._getValidatedPropertyChangeCallback({
            viewField: view.backgroundInput,
            commandName: 'tableCellBackgroundColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:horizontalAlignment', this._getPropertyChangeCallback('tableCellHorizontalAlignment'));
        view.on('change:verticalAlignment', this._getPropertyChangeCallback('tableCellVerticalAlignment'));
        return view;
    }
    /**
	 * In this method the "editor data -> UI" binding is happening.
	 *
	 * When executed, this method obtains selected cell property values from various table commands
	 * and passes them to the {@link #view}.
	 *
	 * This way, the UI stays up–to–date with the editor data.
	 */ _fillViewFormFromCommandValues() {
        const commands = this.editor.commands;
        const borderStyleCommand = commands.get('tableCellBorderStyle');
        Object.entries(propertyToCommandMap$3).map(([property, commandName])=>{
            const propertyKey = property;
            const defaultValue = this.view === this._viewWithContentTableDefaults ? this._defaultContentTableCellProperties[propertyKey] || '' : this._defaultLayoutTableCellProperties[propertyKey] || '';
            return [
                property,
                commands.get(commandName).value || defaultValue
            ];
        }).forEach(([property, value])=>{
            // Do not set the `border-color` and `border-width` fields if `border-style:none`.
            if ((property === 'borderColor' || property === 'borderWidth') && borderStyleCommand.value === 'none') {
                return;
            }
            this.view.set(property, value);
        });
        this._isReady = true;
    }
    /**
	 * Shows the {@link #view} in the {@link #_balloon}.
	 *
	 * **Note**: Each time a view is shown, a new {@link #_undoStepBatch} is created. It contains
	 * all changes made to the document when the view is visible, allowing a single undo step
	 * for all of them.
	 */ _showView() {
        const editor = this.editor;
        const viewTable = getSelectionAffectedTableWidget(editor.editing.view.document.selection);
        const modelTable = viewTable && editor.editing.mapper.toModelElement(viewTable);
        const useDefaults = !modelTable || modelTable.getAttribute('tableType') !== 'layout';
        if (useDefaults && !this._viewWithContentTableDefaults) {
            this._viewWithContentTableDefaults = this._createPropertiesView(this._defaultContentTableCellProperties);
        } else if (!useDefaults && !this._viewWithLayoutTableDefaults) {
            this._viewWithLayoutTableDefaults = this._createPropertiesView(this._defaultLayoutTableCellProperties);
        }
        this.view = useDefaults ? this._viewWithContentTableDefaults : this._viewWithLayoutTableDefaults;
        this.listenTo(editor.ui, 'update', ()=>{
            this._updateView();
        });
        // Update the view with the model values.
        this._fillViewFormFromCommandValues();
        this._balloon.add({
            view: this.view,
            position: getBalloonCellPositionData(editor)
        });
        // Create a new batch. Clicking "Cancel" will undo this batch.
        this._undoStepBatch = editor.model.createBatch();
        // Basic a11y.
        this.view.focus();
    }
    /**
	 * Removes the {@link #view} from the {@link #_balloon}.
	 */ _hideView() {
        const editor = this.editor;
        this.stopListening(editor.ui, 'update');
        this._isReady = false;
        // Blur any input element before removing it from DOM to prevent issues in some browsers.
        // See https://github.com/ckeditor/ckeditor5/issues/1501.
        this.view.saveButtonView.focus();
        this._balloon.remove(this.view);
        // Make sure the focus is not lost in the process by putting it directly
        // into the editing view.
        this.editor.editing.view.focus();
    }
    /**
	 * Repositions the {@link #_balloon} or hides the {@link #view} if a table cell is no longer selected.
	 */ _updateView() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        if (!getTableWidgetAncestor(viewDocument.selection)) {
            this._hideView();
        } else if (this._isViewVisible) {
            repositionContextualBalloon(editor, 'cell');
        }
    }
    /**
	 * Returns `true` when the {@link #view} is visible in the {@link #_balloon}.
	 */ get _isViewVisible() {
        return !!this.view && this._balloon.visibleView === this.view;
    }
    /**
	 * Returns `true` when the {@link #view} is in the {@link #_balloon}.
	 */ get _isViewInBalloon() {
        return !!this.view && this._balloon.hasView(this.view);
    }
    /**
	 * Creates a callback that when executed upon the {@link #view view's} property change
	 * executes a related editor command with the new property value.
	 *
	 * @param commandName The default value of the command.
	 */ _getPropertyChangeCallback(commandName) {
        return (evt, propertyName, newValue)=>{
            if (!this._isReady) {
                return;
            }
            this.editor.execute(commandName, {
                value: newValue,
                batch: this._undoStepBatch
            });
        };
    }
    /**
	 * Creates a callback that when executed upon the {@link #view view's} property change:
	 * * Executes a related editor command with the new property value if the value is valid,
	 * * Or sets the error text next to the invalid field, if the value did not pass the validation.
	 */ _getValidatedPropertyChangeCallback(options) {
        const { commandName, viewField, validator, errorText } = options;
        const setErrorTextDebounced = debounce(()=>{
            viewField.errorText = errorText;
        }, ERROR_TEXT_TIMEOUT$3);
        return (evt, propertyName, newValue)=>{
            setErrorTextDebounced.cancel();
            // Do not execute the command on initial call (opening the table properties view).
            if (!this._isReady) {
                return;
            }
            if (validator(newValue)) {
                this.editor.execute(commandName, {
                    value: newValue,
                    batch: this._undoStepBatch
                });
                viewField.errorText = null;
            } else {
                setErrorTextDebounced();
            }
        };
    }
}

/**
 * The table cell attribute command.
 *
 * The command is a base command for other table cell property commands.
 */ class TableCellPropertyCommand extends Command {
    /**
	 * The attribute that will be set by the command.
	 */ attributeName;
    /**
	 * The default value for the attribute.
	 *
	 * @readonly
	 */ _defaultValue;
    /**
	 * The default value for the attribute for the content table.
	 */ _defaultContentTableValue;
    /**
	 * The default value for the attribute for the layout table.
	 */ _defaultLayoutTableValue;
    /**
	 * Creates a new `TableCellPropertyCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param attributeName Table cell attribute name.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, attributeName, defaultValue){
        super(editor);
        this.attributeName = attributeName;
        this._defaultContentTableValue = defaultValue;
        // Hardcoded defaults for layout table.
        switch(attributeName){
            case 'tableCellType':
                this._defaultLayoutTableValue = 'data';
                break;
            case 'tableCellBorderStyle':
                this._defaultLayoutTableValue = 'none';
                break;
            case 'tableCellHorizontalAlignment':
                this._defaultLayoutTableValue = 'left';
                break;
            case 'tableCellVerticalAlignment':
                this._defaultLayoutTableValue = 'middle';
                break;
            default:
                this._defaultLayoutTableValue = undefined;
        }
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const selectedTableCells = tableUtils.getSelectionAffectedTableCells(selection);
        const table = getSelectionAffectedTable(selection);
        this._defaultValue = !table || table.getAttribute('tableType') !== 'layout' ? this._defaultContentTableValue : this._defaultLayoutTableValue;
        this.isEnabled = !!selectedTableCells.length;
        this.value = this._getSingleValue(selectedTableCells);
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.value If set, the command will set the attribute on selected table cells.
	 * If it is not set, the command will remove the attribute from the selected table cells.
	 * @param options.batch Pass the model batch instance to the command to aggregate changes,
	 * for example to allow a single undo step for multiple executions.
	 */ execute(options = {}) {
        const { value, batch } = options;
        const model = this.editor.model;
        const tableUtils = this.editor.plugins.get('TableUtils');
        const tableCells = tableUtils.getSelectionAffectedTableCells(model.document.selection);
        const valueToSet = this._getValueToSet(value);
        model.enqueueChange(batch, (writer)=>{
            if (valueToSet) {
                tableCells.forEach((tableCell)=>writer.setAttribute(this.attributeName, valueToSet, tableCell));
            } else {
                tableCells.forEach((tableCell)=>writer.removeAttribute(this.attributeName, tableCell));
            }
            this.fire('afterExecute', {
                writer,
                tableCells,
                valueToSet
            });
        });
    }
    /**
	 * Returns the attribute value for a table cell.
	 */ _getAttribute(tableCell) {
        if (!tableCell) {
            return;
        }
        const value = tableCell.getAttribute(this.attributeName);
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
    /**
	 * Returns the proper model value. It can be used to add a default unit to numeric values.
	 */ _getValueToSet(value) {
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
    /**
	 * Returns a single value for all selected table cells. If the value is the same for all cells,
	 * it will be returned (`undefined` otherwise).
	 */ _getSingleValue(tableCells) {
        const firstCellValue = this._getAttribute(tableCells[0]);
        const everyCellHasAttribute = tableCells.every((tableCells)=>this._getAttribute(tableCells) === firstCellValue);
        return everyCellHasAttribute ? firstCellValue : undefined;
    }
}

/**
 * The table cell width command.
 *
 * The command is registered by the {@link module:table/tablecellwidth/tablecellwidthediting~TableCellWidthEditing} as
 * the `'tableCellWidth'` editor command.
 *
 * To change the width of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellWidth', {
 *   value: '50px'
 * } );
 * ```
 *
 * **Note**: This command adds a default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableCellWidth', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the `width` attribute to `'50px'` in the model.
 */ class TableCellWidthCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellWidthCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellWidth', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getValueToSet(value) {
        value = addDefaultUnitToNumericValue(value, 'px');
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}

/**
 * The table cell width editing feature.
 *
 * Introduces `tableCellWidth` table cell model attribute alongside with its converters
 * and a command.
 */ class TableCellWidthEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableCellWidthEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const defaultTableCellProperties = getNormalizedDefaultCellProperties(editor.config.get('table.tableCellProperties.defaultProperties'));
        enableProperty$1(editor.model.schema, editor.conversion, {
            modelAttribute: 'tableCellWidth',
            styleName: 'width',
            attributeName: 'width',
            attributeType: 'length',
            defaultValue: defaultTableCellProperties.width
        });
        editor.commands.add('tableCellWidth', new TableCellWidthCommand(editor, defaultTableCellProperties.width));
    }
}

/**
 * The table cell padding command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellPadding'` editor command.
 *
 * To change the padding of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellPadding', {
 *   value: '5px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableCellPadding', {
 *   value: '5'
 * } );
 * ```
 *
 * will set the `padding` attribute to `'5px'` in the model.
 */ class TableCellPaddingCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellPaddingCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellPadding', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getAttribute(tableCell) {
        if (!tableCell) {
            return;
        }
        const value = getSingleValue(tableCell.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
    /**
	 * @inheritDoc
	 */ _getValueToSet(value) {
        const newValue = addDefaultUnitToNumericValue(value, 'px');
        if (newValue === this._defaultValue) {
            return;
        }
        return newValue;
    }
}

/**
 * The table cell height command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellHeight'` editor command.
 *
 * To change the height of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellHeight', {
 *   value: '50px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableCellHeight', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the `height` attribute to `'50px'` in the model.
 */ class TableCellHeightCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellHeightCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellHeight', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getValueToSet(value) {
        const newValue = addDefaultUnitToNumericValue(value, 'px');
        if (newValue === this._defaultValue) {
            return;
        }
        return newValue;
    }
}

/**
 * The table cell background color command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBackgroundColor'` editor command.
 *
 * To change the background color of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBackgroundColor', {
 *   value: '#f00'
 * } );
 * ```
 */ class TableCellBackgroundColorCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellBackgroundColorCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellBackgroundColor', defaultValue);
    }
}

/**
 * The table cell vertical alignment command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellVerticalAlignment'` editor command.
 *
 * To change the vertical text alignment of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellVerticalAlignment', {
 *   value: 'top'
 * } );
 * ```
 *
 * The following values, corresponding to the
 * [`vertical-align` CSS attribute](https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align), are allowed:
 *
 * * `'top'`
 * * `'bottom'`
 *
 * The `'middle'` value is the default one so there is no need to set it.
 */ class TableCellVerticalAlignmentCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellVerticalAlignmentCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value for the "alignment" attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellVerticalAlignment', defaultValue);
    }
}

/**
 * The table cell horizontal alignment command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellHorizontalAlignment'` editor command.
 *
 * To change the horizontal text alignment of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellHorizontalAlignment', {
 *  value: 'right'
 * } );
 * ```
 */ class TableCellHorizontalAlignmentCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellHorizontalAlignmentCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value for the "alignment" attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellHorizontalAlignment', defaultValue);
    }
}

/**
 * The table cell border style command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderStyle'` editor command.
 *
 * To change the border style of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBorderStyle', {
 *   value: 'dashed'
 * } );
 * ```
 */ class TableCellBorderStyleCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellBorderStyleCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellBorderStyle', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getAttribute(tableCell) {
        if (!tableCell) {
            return;
        }
        const value = getSingleValue(tableCell.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}

/**
 * The table cell border color command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderColor'` editor command.
 *
 * To change the border color of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBorderColor', {
 *   value: '#f00'
 * } );
 * ```
 */ class TableCellBorderColorCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellBorderColorCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellBorderColor', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getAttribute(tableCell) {
        if (!tableCell) {
            return;
        }
        const value = getSingleValue(tableCell.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}

/**
 * The table cell border width command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellBorderWidth'` editor command.
 *
 * To change the border width of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellBorderWidth', {
 *   value: '5px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableCellBorderWidth', {
 *   value: '5'
 * } );
 * ```
 *
 * will set the `borderWidth` attribute to `'5px'` in the model.
 */ class TableCellBorderWidthCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellBorderWidthCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableCellBorderWidth', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getAttribute(tableCell) {
        if (!tableCell) {
            return;
        }
        const value = getSingleValue(tableCell.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
    /**
	 * @inheritDoc
	 */ _getValueToSet(value) {
        const newValue = addDefaultUnitToNumericValue(value, 'px');
        if (newValue === this._defaultValue) {
            return;
        }
        return newValue;
    }
}

/**
 * The table cell type command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellType'` editor command.
 *
 * To change the type of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellType', {
 *   value: 'header'
 * } );
 * ```
 *
 * The `value` can be either `'header'` or `'data'`.
 * It'll return `undefined` if multiple types are selected.
 */ class TableCellTypeCommand extends TableCellPropertyCommand {
    /**
	 * Creates a new `TableCellTypeCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 */ constructor(editor){
        super(editor, 'tableCellType', 'data');
        this.on('afterExecute', (_, data)=>{
            const { writer, tableCells } = data;
            const tableUtils = this.editor.plugins.get(TableUtils);
            const tablesMap = groupCellsByTable(tableCells);
            updateTablesHeadingAttributes(tableUtils, writer, tablesMap.keys());
        });
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        super.refresh();
        const table = getSelectionAffectedTable(this.editor.model.document.selection);
        if (this.isEnabled && table && table.getAttribute('tableType') === 'layout') {
            this.isEnabled = false;
        }
    }
    /**
	 * Returns the attribute value for a table cell.
	 */ _getAttribute(tableCell) {
        return tableCell?.getAttribute(this.attributeName) || 'data';
    }
}
/**
 * Updates the `headingRows` and `headingColumns` attributes of the given tables
 * based on the `tableCellType` of their cells.
 */ function updateTablesHeadingAttributes(tableUtils, writer, tables) {
    let changed = false;
    for (const table of tables){
        let headingRows = table.getAttribute('headingRows') || 0;
        let headingColumns = table.getAttribute('headingColumns') || 0;
        // Prioritize the dimension that is already larger to prevent the other dimension from
        // aggressively consuming "orphaned" header cells. In other words, if table has three
        // heading columns (which fills entire table), we should not count all rows as heading rows.
        // User might later add column to the right which should not be heading.
        //
        // The other example, in a 2x2 table where all cells are headers (e.g. due to concurrent edits),
        // if headingColumns=0 and headingRows=0 (but all cells are headers):
        // - Processing rows first would expand headingRows to 2 (covering all cells), leaving headingColumns at 0.
        // - Processing columns first expands headingColumns to 2, leaving headingRows at 0.
        //
        // It should be good enough to resolve conflicts in most cases.
        const processColumnsFirst = headingColumns > headingRows;
        if (processColumnsFirst) {
            const newHeadingColumns = getAdjustedHeadingSectionSize(tableUtils, table, 'column', headingColumns, headingRows);
            if (newHeadingColumns !== headingColumns) {
                tableUtils.setHeadingColumnsCount(writer, table, newHeadingColumns, {
                    shallow: true
                });
                headingColumns = newHeadingColumns;
                changed = true;
            }
        }
        const newHeadingRows = getAdjustedHeadingSectionSize(tableUtils, table, 'row', headingRows, headingColumns);
        if (newHeadingRows !== headingRows) {
            tableUtils.setHeadingRowsCount(writer, table, newHeadingRows, {
                shallow: true
            });
            headingRows = newHeadingRows;
            changed = true;
        }
        if (!processColumnsFirst) {
            const newHeadingColumns = getAdjustedHeadingSectionSize(tableUtils, table, 'column', headingColumns, headingRows);
            if (newHeadingColumns !== headingColumns) {
                tableUtils.setHeadingColumnsCount(writer, table, newHeadingColumns, {
                    shallow: true
                });
                changed = true;
            }
        }
    }
    return changed;
}
/**
 * Calculates the adjusted size of a heading section (rows or columns).
 *
 * The algorithm iterates through rows (or columns) to determine if they should be part of the heading section.
 * A row/column is included if:
 * 1. All its cells are of type 'header'.
 * 2. AND it contains at least one header cell that is NOT already covered by the perpendicular heading section.
 *
 * This check prevents the algorithm from aggressively expanding the heading section when cells are already
 * headers due to the other dimension.
 *
 * Consider a 2x2 table where all cells are headers:
 *
 * ```
 *    C0  C1
 *   +---+---+
 * R0| H | H |
 *   +---+---+
 * R1| H | H |
 *   +---+---+
 * ```
 *
 * If `headingColumns=2`, both C0 and C1 are heading columns.
 * If we want `headingRows=1` (only R0), the algorithm must NOT include R1, even though R1 consists of header cells.
 * R1's cells are headers because of C0 and C1.
 *
 * Without this check, the algorithm would see that R1 is all headers and force `headingRows` to 2.
 * This would prevent the user from reducing `headingRows` from 2 to 1 without converting R1 cells to 'data'
 * (which would incorrectly break C0 and C1).
 */ function getAdjustedHeadingSectionSize(tableUtils, table, mode, currentSize, perpendicularHeadingSize) {
    const totalRowsOrColumns = mode === 'row' ? tableUtils.getRows(table) : tableUtils.getColumns(table);
    let size = currentSize;
    // Iterate through each row/column to check if all cells are headers.
    for(let currentIndex = 0; currentIndex < totalRowsOrColumns; currentIndex++){
        const walker = new TableWalker(table, {
            [mode]: currentIndex
        });
        let allCellsAreHeaders = true;
        let hasHeaderOutsidePerpendicularSection = false;
        // Check each cell in the current row/column.
        for (const { cell, row, column } of walker){
            // If we find a non-header cell, this row/column can't be part of the heading section.
            if (cell.getAttribute('tableCellType') !== 'header') {
                allCellsAreHeaders = false;
                break;
            }
            // Check if this header cell extends beyond the perpendicular heading section.
            // E.g., when checking rows, see if the cell extends beyond headingColumns.
            const perpendicularIndex = mode === 'row' ? column : row;
            if (perpendicularIndex >= perpendicularHeadingSize) {
                hasHeaderOutsidePerpendicularSection = true;
            }
        }
        // If not all cells are headers, we can't extend the heading section any further.
        if (!allCellsAreHeaders) {
            // The section cannot extend beyond the last valid header row/column.
            return Math.min(size, currentIndex);
        }
        // If there's a header extending beyond the perpendicular section,
        // we must include this row/column in the heading section.
        if (hasHeaderOutsidePerpendicularSection) {
            size = Math.max(size, currentIndex + 1);
        }
    }
    return Math.min(size, totalRowsOrColumns);
}

const VALIGN_VALUES_REG_EXP = /^(top|middle|bottom)$/;
const ALIGN_VALUES_REG_EXP = /^(left|center|right|justify)$/;
/**
 * The table cell properties editing feature.
 *
 * Introduces table cell model attributes and their conversion:
 *
 * - border: `tableCellBorderStyle`, `tableCellBorderColor` and `tableCellBorderWidth`
 * - background color: `tableCellBackgroundColor`
 * - cell padding: `tableCellPadding`
 * - horizontal and vertical alignment: `tableCellHorizontalAlignment`, `tableCellVerticalAlignment`
 * - cell width and height: `tableCellWidth`, `tableCellHeight`
 *
 * It also registers commands used to manipulate the above attributes:
 *
 * - border: the `'tableCellBorderStyle'`, `'tableCellBorderColor'` and `'tableCellBorderWidth'` commands
 * - background color: the `'tableCellBackgroundColor'` command
 * - cell padding: the `'tableCellPadding'` command
 * - horizontal and vertical alignment: the `'tableCellHorizontalAlignment'` and `'tableCellVerticalAlignment'` commands
 * - width and height: the `'tableCellWidth'` and `'tableCellHeight'` commands
 */ class TableCellPropertiesEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableCellPropertiesEditing';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'TCP';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableEditing,
            TableCellWidthEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        editor.config.define('table.tableCellProperties.defaultProperties', {});
        const defaultTableCellProperties = getNormalizedDefaultCellProperties(editor.config.get('table.tableCellProperties.defaultProperties'), {
            includeVerticalAlignmentProperty: true,
            includeHorizontalAlignmentProperty: true,
            includePaddingProperty: true,
            isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
        });
        editor.data.addStyleProcessorRules(addBorderStylesRules);
        enableBorderProperties$1(editor, {
            color: defaultTableCellProperties.borderColor,
            style: defaultTableCellProperties.borderStyle,
            width: defaultTableCellProperties.borderWidth
        });
        editor.commands.add('tableCellBorderStyle', new TableCellBorderStyleCommand(editor, defaultTableCellProperties.borderStyle));
        editor.commands.add('tableCellBorderColor', new TableCellBorderColorCommand(editor, defaultTableCellProperties.borderColor));
        editor.commands.add('tableCellBorderWidth', new TableCellBorderWidthCommand(editor, defaultTableCellProperties.borderWidth));
        enableProperty$1(schema, conversion, {
            modelAttribute: 'tableCellHeight',
            styleName: 'height',
            attributeName: 'height',
            attributeType: 'length',
            defaultValue: defaultTableCellProperties.height
        });
        editor.commands.add('tableCellHeight', new TableCellHeightCommand(editor, defaultTableCellProperties.height));
        editor.data.addStyleProcessorRules(addPaddingStylesRules);
        enableProperty$1(schema, conversion, {
            modelAttribute: 'tableCellPadding',
            styleName: 'padding',
            reduceBoxSides: true,
            defaultValue: defaultTableCellProperties.padding
        });
        editor.commands.add('tableCellPadding', new TableCellPaddingCommand(editor, defaultTableCellProperties.padding));
        editor.data.addStyleProcessorRules(addBackgroundStylesRules);
        enableProperty$1(schema, conversion, {
            modelAttribute: 'tableCellBackgroundColor',
            styleName: 'background-color',
            attributeName: 'bgcolor',
            attributeType: 'color',
            defaultValue: defaultTableCellProperties.backgroundColor
        });
        editor.commands.add('tableCellBackgroundColor', new TableCellBackgroundColorCommand(editor, defaultTableCellProperties.backgroundColor));
        enableHorizontalAlignmentProperty(schema, conversion, defaultTableCellProperties.horizontalAlignment);
        editor.commands.add('tableCellHorizontalAlignment', new TableCellHorizontalAlignmentCommand(editor, defaultTableCellProperties.horizontalAlignment));
        enableVerticalAlignmentProperty(schema, conversion, defaultTableCellProperties.verticalAlignment);
        editor.commands.add('tableCellVerticalAlignment', new TableCellVerticalAlignmentCommand(editor, defaultTableCellProperties.verticalAlignment));
        if (editor.config.get('experimentalFlags.tableCellTypeSupport')) {
            enableCellTypeProperty(editor);
            editor.commands.add('tableCellType', new TableCellTypeCommand(editor));
        }
    }
}
/**
 * Enables the `'tableCellBorderStyle'`, `'tableCellBorderColor'` and `'tableCellBorderWidth'` attributes for table cells.
 *
 * @param editor The editor instance.
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `tableCellBorderColor` value.
 * @param defaultBorder.style The default `tableCellBorderStyle` value.
 * @param defaultBorder.width The default `tableCellBorderWidth` value.
 */ function enableBorderProperties$1(editor, defaultBorder) {
    const { conversion } = editor;
    const { schema } = editor.model;
    const modelAttributes = {
        width: 'tableCellBorderWidth',
        color: 'tableCellBorderColor',
        style: 'tableCellBorderStyle'
    };
    schema.extend('tableCell', {
        allowAttributes: Object.values(modelAttributes)
    });
    for (const modelAttribute of Object.values(modelAttributes)){
        schema.setAttributeProperties(modelAttribute, {
            isFormatting: true
        });
    }
    upcastBorderStyles(editor, 'td', modelAttributes, defaultBorder);
    upcastBorderStyles(editor, 'th', modelAttributes, defaultBorder);
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.style,
        styleName: 'border-style'
    });
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.color,
        styleName: 'border-color'
    });
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.width,
        styleName: 'border-width'
    });
}
/**
 * Enables the `'tableCellHorizontalAlignment'` attribute for table cells.
 *
 * @param defaultValue The default horizontal alignment value.
 */ function enableHorizontalAlignmentProperty(schema, conversion, defaultValue) {
    schema.extend('tableCell', {
        allowAttributes: [
            'tableCellHorizontalAlignment'
        ]
    });
    schema.setAttributeProperties('tableCellHorizontalAlignment', {
        isFormatting: true
    });
    conversion.for('downcast').attributeToAttribute({
        model: {
            name: 'tableCell',
            key: 'tableCellHorizontalAlignment'
        },
        view: (alignment)=>({
                key: 'style',
                value: {
                    'text-align': alignment
                }
            })
    });
    conversion.for('upcast')// Support for the `text-align:*;` CSS definition for the table cell alignment.
    .attributeToAttribute({
        view: {
            name: /^(td|th)$/,
            styles: {
                'text-align': ALIGN_VALUES_REG_EXP
            }
        },
        model: {
            key: 'tableCellHorizontalAlignment',
            value: (viewElement, conversionApi, data)=>{
                const localDefaultValue = getDefaultValueAdjusted(defaultValue, 'left', data);
                const align = viewElement.getStyle('text-align');
                if (align !== localDefaultValue) {
                    return align;
                }
                // Consume the style even if not applied to the element so it won't be processed by other converters.
                conversionApi.consumable.consume(viewElement, {
                    styles: 'text-align'
                });
            }
        }
    })// Support for the `align` attribute as the backward compatibility while pasting from other sources.
    .attributeToAttribute({
        view: {
            name: /^(td|th)$/,
            attributes: {
                align: ALIGN_VALUES_REG_EXP
            }
        },
        model: {
            key: 'tableCellHorizontalAlignment',
            value: (viewElement, conversionApi, data)=>{
                const localDefaultValue = getDefaultValueAdjusted(defaultValue, 'left', data);
                const align = viewElement.getAttribute('align');
                if (align !== localDefaultValue) {
                    return align;
                }
                // Consume the style even if not applied to the element so it won't be processed by other converters.
                conversionApi.consumable.consume(viewElement, {
                    attributes: 'align'
                });
            }
        }
    });
}
/**
 * Enables the `'verticalAlignment'` attribute for table cells.
 *
 * @param defaultValue The default vertical alignment value.
 */ function enableVerticalAlignmentProperty(schema, conversion, defaultValue) {
    schema.extend('tableCell', {
        allowAttributes: [
            'tableCellVerticalAlignment'
        ]
    });
    schema.setAttributeProperties('tableCellVerticalAlignment', {
        isFormatting: true
    });
    conversion.for('downcast').attributeToAttribute({
        model: {
            name: 'tableCell',
            key: 'tableCellVerticalAlignment'
        },
        view: (alignment)=>({
                key: 'style',
                value: {
                    'vertical-align': alignment
                }
            })
    });
    conversion.for('upcast')// Support for the `vertical-align:*;` CSS definition for the table cell alignment.
    .attributeToAttribute({
        view: {
            name: /^(td|th)$/,
            styles: {
                'vertical-align': VALIGN_VALUES_REG_EXP
            }
        },
        model: {
            key: 'tableCellVerticalAlignment',
            value: (viewElement, conversionApi, data)=>{
                const localDefaultValue = getDefaultValueAdjusted(defaultValue, 'middle', data);
                const align = viewElement.getStyle('vertical-align');
                if (align !== localDefaultValue) {
                    return align;
                }
                // Consume the style even if not applied to the element so it won't be processed by other converters.
                conversionApi.consumable.consume(viewElement, {
                    styles: 'vertical-align'
                });
            }
        }
    })// Support for the `align` attribute as the backward compatibility while pasting from other sources.
    .attributeToAttribute({
        view: {
            name: /^(td|th)$/,
            attributes: {
                valign: VALIGN_VALUES_REG_EXP
            }
        },
        model: {
            key: 'tableCellVerticalAlignment',
            value: (viewElement, conversionApi, data)=>{
                const localDefaultValue = getDefaultValueAdjusted(defaultValue, 'middle', data);
                const valign = viewElement.getAttribute('valign');
                if (valign !== localDefaultValue) {
                    return valign;
                }
                // Consume the attribute even if not applied to the element so it won't be processed by other converters.
                conversionApi.consumable.consume(viewElement, {
                    attributes: 'valign'
                });
            }
        }
    });
}
/**
 * Enables the `tableCellType` attribute for table cells.
 */ function enableCellTypeProperty(editor) {
    const { model, conversion, editing } = editor;
    const { schema } = model;
    const tableUtils = editor.plugins.get(TableUtils);
    schema.extend('tableCell', {
        allowAttributes: [
            'tableCellType'
        ]
    });
    schema.setAttributeProperties('tableCellType', {
        isFormatting: true
    });
    // Do not allow setting `tableCellType` in layout tables.
    schema.addAttributeCheck((context)=>{
        const nearestTable = Array.from(context).reverse().find((item)=>item.name === 'table');
        if (nearestTable?.getAttribute('tableType') === 'layout') {
            return false;
        }
    }, 'tableCellType');
    // Upcast conversion for td/th elements.
    conversion.for('upcast').add((dispatcher)=>{
        dispatcher.on('element:th', (evt, data, conversionApi)=>{
            const { writer } = conversionApi;
            const { modelRange } = data;
            const modelElement = modelRange?.start.nodeAfter;
            if (modelElement?.is('element', 'tableCell')) {
                writer.setAttribute('tableCellType', 'header', modelElement);
            }
        });
        // Table type is examined after all other cell converters, on low priority, so
        // we double check if there is any `th` left in the table. If so, the table is converted to a content table.
        dispatcher.on('element:table', (evt, data, conversionApi)=>{
            const { writer } = conversionApi;
            const { modelRange } = data;
            const modelElement = modelRange?.start.nodeAfter;
            if (modelElement?.is('element', 'table') && modelElement.getAttribute('tableType') === 'layout') {
                for (const { cell } of new TableWalker(modelElement)){
                    if (cell.getAttribute('tableCellType') === 'header') {
                        writer.setAttribute('tableType', 'content', modelElement);
                        break;
                    }
                }
            }
        }, {
            priority: priorities.low - 1
        });
    });
    // Registers a post-fixer that ensures the `headingRows` and `headingColumns` attributes
    // are consistent with the `tableCellType` attribute of the cells. `tableCellType` has priority
    // over `headingRows` and `headingColumns` and we use it to adjust the heading sections of the table.
    model.document.registerPostFixer((writer)=>{
        // 1. Collect all tables that need to be checked.
        const changes = model.document.differ.getChanges();
        const tablesToCheck = new Set();
        for (const change of changes){
            // Check if headingRows or headingColumns changed.
            if (change.type === 'attribute' && (change.attributeKey === 'headingRows' || change.attributeKey === 'headingColumns')) {
                const table = change.range.start.nodeAfter;
                if (table?.is('element', 'table') && table.root.rootName !== '$graveyard') {
                    tablesToCheck.add(table);
                }
            }
            // Check if tableCellType changed.
            if (change.type === 'attribute' && change.attributeKey === 'tableCellType') {
                const cell = change.range.start.nodeAfter;
                if (cell?.is('element', 'tableCell') && cell.root.rootName !== '$graveyard') {
                    const table = cell.findAncestor('table');
                    if (table) {
                        tablesToCheck.add(table);
                    }
                }
            }
            // Check if new headers were inserted.
            if (change.type === 'insert' && change.position.nodeAfter) {
                for (const { item } of model.createRangeOn(change.position.nodeAfter)){
                    if (item.is('element', 'tableCell') && item.getAttribute('tableCellType') && item.root.rootName !== '$graveyard') {
                        const table = item.findAncestor('table');
                        if (table) {
                            tablesToCheck.add(table);
                        }
                    }
                }
            }
        }
        // 2. Update the attributes of the collected tables.
        return updateTablesHeadingAttributes(tableUtils, writer, tablesToCheck);
    });
    // Refresh the table cells in the editing view when their `tableCellType` attribute changes.
    model.document.on('change:data', ()=>{
        const { differ } = model.document;
        const cellsToReconvert = new Set();
        for (const change of differ.getChanges()){
            // If the `tableCellType` attribute changed, the entire cell needs to be re-rendered.
            if (change.type === 'attribute' && change.attributeKey === 'tableCellType') {
                const tableCell = change.range.start.nodeAfter;
                if (tableCell.is('element', 'tableCell')) {
                    cellsToReconvert.add(tableCell);
                }
            }
        }
        // Reconvert table cells that had their `tableCellType` attribute changed.
        for (const tableCell of cellsToReconvert){
            const viewElement = editing.mapper.toViewElement(tableCell);
            const cellType = tableCell.getAttribute('tableCellType');
            const expectedElementName = cellType === 'header' ? 'th' : 'td';
            if (viewElement?.name !== expectedElementName) {
                editing.reconvertItem(tableCell);
            }
        }
    });
}

/**
 * The table cell properties feature. Enables support for setting properties of table cells (size, border, background, etc.).
 *
 * Read more in the {@glink features/tables/tables-styling Table and cell styling tools} section.
 * See also the {@link module:table/tableproperties~TableProperties} plugin.
 *
 * This is a "glue" plugin that loads the
 * {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing table cell properties editing feature} and
 * the {@link module:table/tablecellproperties/tablecellpropertiesui~TableCellPropertiesUI table cell properties UI feature}.
 */ class TableCellProperties extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableCellProperties';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableCellPropertiesEditing,
            TableCellPropertiesUI
        ];
    }
}

/**
 * The table layout UI plugin. It introduces:
 *
 * * The `'insertTableLayout'` dropdown,
 * * The `'menuBar:insertTableLayout'` menu bar menu.
 */ class TableLayoutUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableLayoutUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = this.editor.t;
        editor.ui.componentFactory.add('insertTableLayout', (locale)=>{
            const command = editor.commands.get('insertTableLayout');
            const dropdownView = createDropdown(locale);
            dropdownView.bind('isEnabled').to(command);
            // Decorate dropdown's button.
            dropdownView.buttonView.set({
                icon: IconTableLayout,
                label: t('Insert table layout'),
                tooltip: true
            });
            let insertTableLayoutView;
            dropdownView.on('change:isOpen', ()=>{
                if (insertTableLayoutView) {
                    return;
                }
                // Prepare custom view for dropdown's panel.
                insertTableLayoutView = new InsertTableView(locale);
                dropdownView.panelView.children.add(insertTableLayoutView);
                insertTableLayoutView.delegate('execute').to(dropdownView);
                dropdownView.on('execute', ()=>{
                    editor.execute('insertTableLayout', {
                        rows: insertTableLayoutView.rows,
                        columns: insertTableLayoutView.columns
                    });
                    editor.editing.view.focus();
                });
            });
            return dropdownView;
        });
        editor.ui.componentFactory.add('menuBar:insertTableLayout', (locale)=>{
            const command = editor.commands.get('insertTableLayout');
            const menuView = new MenuBarMenuView(locale);
            const insertTableLayoutView = new InsertTableView(locale);
            insertTableLayoutView.delegate('execute').to(menuView);
            menuView.on('change:isOpen', (event, name, isOpen)=>{
                if (!isOpen) {
                    insertTableLayoutView.reset();
                }
            });
            insertTableLayoutView.on('execute', ()=>{
                editor.execute('insertTableLayout', {
                    rows: insertTableLayoutView.rows,
                    columns: insertTableLayoutView.columns
                });
                editor.editing.view.focus();
            });
            menuView.buttonView.set({
                label: t('Table layout'),
                icon: IconTableLayout
            });
            menuView.panelView.children.add(insertTableLayoutView);
            menuView.bind('isEnabled').to(command);
            return menuView;
        });
        // Create table type dropdown button.
        editor.ui.componentFactory.add('tableType', ()=>{
            const editor = this.editor;
            const t = editor.t;
            const button = new DropdownButtonView(editor.locale);
            button.set({
                label: t('Table type'),
                icon: IconTableProperties,
                tooltip: true
            });
            return createTableTypeDropdown(editor, button);
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const { editor } = this;
        const { ui, plugins } = editor;
        let tablePropertiesUI;
        if (plugins.has('TablePropertiesUIExperimental')) {
            tablePropertiesUI = plugins.get('TablePropertiesUIExperimental');
        } else if (plugins.has('TablePropertiesUI')) {
            tablePropertiesUI = plugins.get('TablePropertiesUI');
        } else {
            return;
        }
        // Override the default table properties button to include the table type dropdown.
        // It needs to be done in `afterInit()` to make sure that `tableProperties` button is
        // registered after the initialization of the `TablePropertiesUI`. Otherwise, the
        // button will be overridden by the default one if the `TablePropertiesUI` is
        // initialized after the `TableLayoutUI`.
        ui.componentFactory.add('tableProperties', (locale)=>{
            const baseButton = tablePropertiesUI._createTablePropertiesButton();
            const splitButtonView = new SplitButtonView(locale, baseButton);
            return createTableTypeDropdown(editor, splitButtonView);
        });
    }
}
/**
 * Creates a dropdown for the table type selection.
 *
 * @param editor The editor instance.
 * @param dropdownButton The button view that will be used as the dropdown trigger.
 * @returns A dropdown view containing table type options.
 */ function createTableTypeDropdown(editor, dropdownButton) {
    const t = editor.t;
    const locale = editor.locale;
    const tableTypeCommand = editor.commands.get('tableType');
    // Wrap the original button in a SplitButtonView.
    const dropdownView = createDropdown(locale, dropdownButton);
    const itemsDefinitions = createTableLayoutTypeDropdownItems(editor);
    // Add table types to the dropdown.
    addListToDropdown(dropdownView, itemsDefinitions, {
        ariaLabel: t('Table type options'),
        role: 'menu'
    });
    dropdownButton.tooltip = t('Choose table type');
    dropdownView.on('execute', (evt)=>{
        const tableType = evt.source.tableType;
        if (tableType) {
            tableTypeCommand.execute(tableType);
        }
    });
    return dropdownView;
}
/**
 * Creates dropdown items for table type selection.
 *
 * @param editor The editor instance.
 * @returns A collection of dropdown items for the table type dropdown.
 */ function createTableLayoutTypeDropdownItems(editor) {
    const t = editor.t;
    const tableTypeCommand = editor.commands.get('tableType');
    const itemDefinitions = new Collection();
    itemDefinitions.add(createTableTypeDropdownItem(tableTypeCommand, 'layout', t('Layout table')));
    itemDefinitions.add(createTableTypeDropdownItem(tableTypeCommand, 'content', t('Content table')));
    return itemDefinitions;
}
/**
 * Creates a dropdown item for a specific table type.
 *
 * @param tableTypeCommand The table type command.
 * @param type The table type value ('layout' or 'content').
 * @param label The localized label for the dropdown item.
 * @returns The dropdown item definition.
 */ function createTableTypeDropdownItem(tableTypeCommand, type, label) {
    const model = new UIModel({
        label,
        role: 'menuitemradio',
        withText: true,
        tableType: type
    });
    model.bind('isEnabled').to(tableTypeCommand, 'isEnabled');
    model.bind('isOn').to(tableTypeCommand, 'value', (value)=>value === type);
    return {
        type: 'button',
        model
    };
}

/**
 * The insert table layout command.
 *
 * The command is registered by {@link module:table/tablelayout/tablelayoutediting~TableLayoutEditing}
 * as the `'insertTableLayout'` editor command.
 *
 * To insert a layout table at the current selection, execute the command and specify the dimensions:
 *
 * ```ts
 * editor.execute( 'insertTableLayout', { rows: 20, columns: 5 } );
 * ```
 */ class InsertTableLayoutCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const schema = model.schema;
        this.isEnabled = isAllowedInParent(selection, schema);
    }
    /**
	 * Executes the command.
	 *
	 * Inserts a layout table with the given number of rows and columns into the editor.
	 *
	 * @param options.rows The number of rows to create in the inserted table. Default value is 2.
	 * @param options.columns The number of columns to create in the inserted table. Default value is 2.
	 * @fires execute
	 */ execute(options = {}) {
        const editor = this.editor;
        const model = editor.model;
        const tableUtils = editor.plugins.get('TableUtils');
        model.change((writer)=>{
            const normalizedOptions = {
                rows: options.rows || 2,
                columns: options.columns || 2
            };
            const table = tableUtils.createTable(writer, normalizedOptions);
            writer.setAttribute('tableType', 'layout', table);
            model.insertObject(table, null, null, {
                findOptimalPosition: 'auto'
            });
            const singleColumnWidth = `${100 / normalizedOptions.columns}%`;
            const columnWidths = Array(normalizedOptions.columns).fill(singleColumnWidth);
            const tableWidthsCommand = editor.commands.get('resizeColumnWidths');
            // Make the table full-width with equal columns width.
            tableWidthsCommand.execute({
                tableWidth: '100%',
                columnWidths,
                table
            });
            writer.setSelection(writer.createPositionAt(table.getNodeByPath([
                0,
                0,
                0
            ]), 0));
        });
    }
}
/**
 * Checks if the table is allowed in the parent.
 */ function isAllowedInParent(selection, schema) {
    const positionParent = selection.getFirstPosition().parent;
    const validParent = positionParent === positionParent.root ? positionParent : positionParent.parent;
    return schema.checkChild(validParent, 'table');
}

/**
 * Command used by the {@link module:table/tablecolumnresize~TableColumnResize Table column resize feature} that
 * updates the width of the whole table as well as its individual columns.
 */ class TableWidthsCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        // The command is always enabled as it doesn't care about the actual selection - table can be resized
        // even if the selection is elsewhere.
        this.isEnabled = true;
    }
    /**
	 * Updated the `tableWidth` attribute of the table and the `columnWidth` attribute of the columns of that table.
	 */ execute(options = {}) {
        const { model, plugins } = this.editor;
        let { table = model.document.selection.getSelectedElement(), columnWidths, tableWidth } = options;
        if (columnWidths) {
            // For backwards compatibility, columnWidths might be an array or a string of comma-separated values.
            columnWidths = Array.isArray(columnWidths) ? columnWidths : columnWidths.split(',');
        }
        model.change((writer)=>{
            if (tableWidth) {
                writer.setAttribute('tableWidth', tableWidth, table);
            } else {
                writer.removeAttribute('tableWidth', table);
            }
            const tableColumnGroup = plugins.get('TableColumnResizeEditing').getColumnGroupElement(table);
            if (!columnWidths && !tableColumnGroup) {
                return;
            }
            if (!columnWidths) {
                return writer.remove(tableColumnGroup);
            }
            const widths = normalizeColumnWidths(columnWidths);
            if (!tableColumnGroup) {
                const colGroupElement = writer.createElement('tableColumnGroup');
                widths.forEach((columnWidth)=>writer.appendElement('tableColumn', {
                        columnWidth
                    }, colGroupElement));
                writer.append(colGroupElement, table);
            } else {
                Array.from(tableColumnGroup.getChildren()).forEach((column, index)=>writer.setAttribute('columnWidth', widths[index], column));
            }
        });
    }
}

/**
 * Returns a upcast helper that ensures the number of `<tableColumn>` elements corresponds to the actual number of columns in the table,
 * because the input data might have too few or too many <col> elements.
 *
 * @internal
 */ function upcastColgroupElement(tableUtilsPlugin) {
    return (dispatcher)=>dispatcher.on('element:colgroup', (evt, data, conversionApi)=>{
            const modelTable = data.modelCursor.findAncestor('table');
            const tableColumnGroup = getColumnGroupElement(modelTable);
            if (!tableColumnGroup) {
                return;
            }
            const columnElements = getTableColumnElements(tableColumnGroup);
            const columnsCount = tableUtilsPlugin.getColumns(modelTable);
            let columnWidths = translateColSpanAttribute(tableColumnGroup, conversionApi.writer);
            // Fill the array with 'auto' values if the number of columns is higher than number of declared values.
            columnWidths = Array.from({
                length: columnsCount
            }, (_, index)=>columnWidths[index] || 'auto');
            if (columnWidths.length != columnElements.length || columnWidths.includes('auto')) {
                updateColumnElements(columnElements, tableColumnGroup, normalizeColumnWidths(columnWidths), conversionApi.writer);
            }
        }, {
            priority: 'low'
        });
}
/**
 * Returns downcast helper for adding `ck-table-resized` class if there is a `<tableColumnGroup>` element inside the table.
 *
 * @internal
 */ function downcastTableResizedClass() {
    return (dispatcher)=>dispatcher.on('insert:table', (evt, data, conversionApi)=>{
            const viewWriter = conversionApi.writer;
            const modelTable = data.item;
            const viewElement = conversionApi.mapper.toViewElement(modelTable);
            const viewTable = viewElement.is('element', 'table') ? viewElement : Array.from(viewElement.getChildren()).find((viewChild)=>viewChild.is('element', 'table'));
            const tableColumnGroup = getColumnGroupElement(modelTable);
            if (tableColumnGroup) {
                viewWriter.addClass('ck-table-resized', viewTable);
            } else {
                viewWriter.removeClass('ck-table-resized', viewTable);
            }
        }, {
            priority: 'low'
        });
}
/**
 * Returns a upcast helper that removes the `ck-table-resized` class from the table element.
 *
 * @internal
 */ function upcastTableResizedClass() {
    return (dispatcher)=>{
        dispatcher.on('element:table', (evt, data, conversionApi)=>{
            conversionApi.consumable.consume(data.viewItem, {
                classes: 'ck-table-resized'
            });
        });
    };
}

const toPx = /* #__PURE__ */ toUnit('px');
/**
 * The table column resize editing plugin.
 */ class TableColumnResizeEditing extends Plugin {
    /**
	 * A flag indicating if the column resizing is in progress.
	 */ _isResizingActive;
    /**
	 * A temporary storage for the required data needed to correctly calculate the widths of the resized columns. This storage is
	 * initialized when column resizing begins, and is purged upon completion.
	 */ _resizingData;
    /**
	 * DOM emitter.
	 */ _domEmitter;
    /**
	 * A local reference to the {@link module:table/tableutils~TableUtils} plugin.
	 */ _tableUtilsPlugin;
    /**
	 * Starting mouse position data used to add a threshold to the resizing process.
	 */ _initialMouseEventData = null;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableEditing,
            TableUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableColumnResizeEditing';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'TCR';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._isResizingActive = false;
        this.set('_isResizingAllowed', true);
        this._resizingData = null;
        this._domEmitter = new (DomEmitterMixin())();
        this._tableUtilsPlugin = editor.plugins.get('TableUtils');
        this.on('change:_isResizingAllowed', (evt, name, value)=>{
            // Toggling the `ck-column-resize_disabled` class shows and hides the resizers through CSS.
            const classAction = value ? 'removeClass' : 'addClass';
            editor.editing.view.change((writer)=>{
                for (const root of editor.editing.view.document.roots){
                    writer[classAction]('ck-column-resize_disabled', editor.editing.view.document.getRoot(root.rootName));
                }
            });
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        this._extendSchema();
        this._registerPostFixer();
        this._registerConverters();
        this._registerResizingListeners();
        this._registerResizerInserter();
        const editor = this.editor;
        const columnResizePlugin = editor.plugins.get('TableColumnResize');
        const tableEditing = editor.plugins.get('TableEditing');
        tableEditing.registerAdditionalSlot({
            filter: (element)=>element.is('element', 'tableColumnGroup'),
            positionOffset: 0
        });
        const tableWidthsCommand = new TableWidthsCommand(editor);
        // For backwards compatibility we have two commands that perform exactly the same operation.
        editor.commands.add('resizeTableWidth', tableWidthsCommand);
        editor.commands.add('resizeColumnWidths', tableWidthsCommand);
        // Currently the states of column resize and table resize (which is actually the last column resize) features
        // are bound together. They can be separated in the future by adding distinct listeners and applying
        // different CSS classes (e.g. `ck-column-resize_disabled` and `ck-table-resize_disabled`) to the editor root.
        // See #12148 for the details.
        this.bind('_isResizingAllowed').to(editor, 'isReadOnly', columnResizePlugin, 'isEnabled', tableWidthsCommand, 'isEnabled', (isEditorReadOnly, isPluginEnabled, isTableWidthsCommandCommandEnabled)=>!isEditorReadOnly && isPluginEnabled && isTableWidthsCommandCommandEnabled);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        this._domEmitter.stopListening();
        super.destroy();
    }
    /**
	 * Returns a 'tableColumnGroup' element from the 'table'.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns A 'tableColumnGroup' element.
	 */ getColumnGroupElement(element) {
        return getColumnGroupElement(element);
    }
    /**
	 * Returns an array of 'tableColumn' elements.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns An array of 'tableColumn' elements.
	 */ getTableColumnElements(element) {
        return getTableColumnElements(element);
    }
    /**
	 * Returns an array of table column widths.
	 *
	 * @param element A 'table' or 'tableColumnGroup' element.
	 * @returns An array of table column widths.
	 */ getTableColumnsWidths(element) {
        return getTableColumnsWidths(element);
    }
    /**
	 * Registers new attributes for a table model element.
	 */ _extendSchema() {
        const schema = this.editor.model.schema;
        schema.extend('table', {
            allowAttributes: [
                'tableWidth'
            ]
        });
        schema.register('tableColumnGroup', {
            allowIn: 'table',
            isLimit: true
        });
        schema.register('tableColumn', {
            allowIn: 'tableColumnGroup',
            allowAttributes: [
                'columnWidth',
                'colSpan'
            ],
            isLimit: true
        });
        schema.setAttributeProperties('columnWidth', {
            isFormatting: true
        });
    }
    /**
	 * Registers table column resize post-fixer.
	 *
	 * It checks if the change from the differ concerns a table-related element or attribute. For detected changes it:
	 *  * Adjusts the `columnWidths` attribute to guarantee that the sum of the widths from all columns is 100%.
	 *  * Checks if the `columnWidths` attribute gets updated accordingly after columns have been added or removed.
	 */ _registerPostFixer() {
        const editor = this.editor;
        const model = editor.model;
        model.document.registerPostFixer((writer)=>{
            let changed = false;
            for (const table of getChangedResizedTables(model)){
                const tableColumnGroup = this.getColumnGroupElement(table);
                const columns = this.getTableColumnElements(tableColumnGroup);
                const columnWidths = this.getTableColumnsWidths(tableColumnGroup);
                // Adjust the `columnWidths` attribute to guarantee that the sum of the widths from all columns is 100%.
                let normalizedWidths = normalizeColumnWidths(columnWidths);
                // If the number of columns has changed, then we need to adjust the widths of the affected columns.
                normalizedWidths = adjustColumnWidths(normalizedWidths, table, this);
                if (isEqual(columnWidths, normalizedWidths)) {
                    continue;
                }
                updateColumnElements(columns, tableColumnGroup, normalizedWidths, writer);
                changed = true;
            }
            return changed;
        });
        /**
		 * Adjusts if necessary the `columnWidths` in case if the number of column has changed.
		 *
		 * @param columnWidths Note: this array **may be modified** by the function.
		 * @param table Table to be checked.
		 */ function adjustColumnWidths(columnWidths, table, plugin) {
            const newTableColumnsCount = plugin._tableUtilsPlugin.getColumns(table);
            const columnsCountDelta = newTableColumnsCount - columnWidths.length;
            if (columnsCountDelta === 0) {
                return columnWidths;
            }
            const widths = columnWidths.map((width)=>Number(width.replace('%', '')));
            // Collect all cells that are affected by the change.
            const cellSet = getAffectedCells(plugin.editor.model.document.differ, table);
            for (const cell of cellSet){
                const currentColumnsDelta = newTableColumnsCount - widths.length;
                if (currentColumnsDelta === 0) {
                    continue;
                }
                // If the column count in the table changed, adjust the widths of the affected columns.
                const hasMoreColumns = currentColumnsDelta > 0;
                const currentColumnIndex = plugin._tableUtilsPlugin.getCellLocation(cell).column;
                if (hasMoreColumns) {
                    const columnMinWidthAsPercentage = getColumnMinWidthAsPercentage(table, plugin.editor);
                    const columnWidthsToInsert = createFilledArray(currentColumnsDelta, columnMinWidthAsPercentage);
                    widths.splice(currentColumnIndex, 0, ...columnWidthsToInsert);
                } else {
                    // Moves the widths of the removed columns to the preceding one.
                    // Other editors either reduce the width of the whole table or adjust the widths
                    // proportionally, so change of this behavior can be considered in the future.
                    const removedColumnWidths = widths.splice(currentColumnIndex, Math.abs(currentColumnsDelta));
                    widths[currentColumnIndex] += sumArray(removedColumnWidths);
                }
            }
            return widths.map((width)=>width + '%');
        }
        /**
		 * Returns a set of cells that have been changed in a given table.
		 */ function getAffectedCells(differ, table) {
            const cellSet = new Set();
            for (const change of differ.getChanges()){
                if (change.type == 'insert' && change.position.nodeAfter && change.position.nodeAfter.name == 'tableCell' && change.position.nodeAfter.getAncestors().includes(table)) {
                    cellSet.add(change.position.nodeAfter);
                } else if (change.type == 'remove') {
                    // If the first cell was removed, use the node after the change position instead.
                    const referenceNode = change.position.nodeBefore || change.position.nodeAfter;
                    if (referenceNode.name == 'tableCell' && referenceNode.getAncestors().includes(table)) {
                        cellSet.add(referenceNode);
                    }
                }
            }
            return cellSet;
        }
    }
    /**
	 * Registers table column resize converters.
	 */ _registerConverters() {
        const editor = this.editor;
        const conversion = editor.conversion;
        // Table width style
        conversion.for('upcast').attributeToAttribute({
            view: {
                name: /^(figure|table)$/,
                styles: {
                    width: /[\s\S]+/
                }
            },
            model: {
                key: 'tableWidth',
                value: (viewElement)=>{
                    const parent = viewElement.parent;
                    if (parent.is('element', 'figure')) {
                        return;
                    }
                    return viewElement.getStyle('width');
                }
            }
        });
        conversion.for('downcast').attributeToAttribute({
            model: {
                name: 'table',
                key: 'tableWidth'
            },
            view: (width)=>({
                    name: 'figure',
                    key: 'style',
                    value: {
                        width
                    }
                })
        });
        conversion.elementToElement({
            model: 'tableColumnGroup',
            view: 'colgroup'
        });
        conversion.elementToElement({
            model: 'tableColumn',
            view: 'col'
        });
        conversion.for('downcast').add(downcastTableResizedClass());
        conversion.for('upcast').add(upcastTableResizedClass());
        conversion.for('upcast').add(upcastColgroupElement(this._tableUtilsPlugin));
        conversion.for('upcast').attributeToAttribute({
            view: {
                name: 'col',
                styles: {
                    width: /.*/
                }
            },
            model: {
                key: 'columnWidth',
                value: (viewElement)=>{
                    const viewColWidth = viewElement.getStyle('width');
                    // 'pt' is the default unit for table column width pasted from MS Office.
                    // See https://github.com/ckeditor/ckeditor5/issues/14521#issuecomment-1662102889 for more details.
                    if (!viewColWidth || !viewColWidth.endsWith('%') && !viewColWidth.endsWith('pt')) {
                        return 'auto';
                    }
                    return viewColWidth;
                }
            }
        });
        // The `col[span]` attribute is present in tables pasted from MS Excel. We use it to set the temporary `colSpan` model attribute,
        // which is consumed during the `colgroup` element upcast.
        // See https://github.com/ckeditor/ckeditor5/issues/14521#issuecomment-1662102889 for more details.
        conversion.for('upcast').attributeToAttribute({
            view: {
                name: 'col',
                key: 'span'
            },
            model: 'colSpan'
        });
        conversion.for('downcast').attributeToAttribute({
            model: {
                name: 'tableColumn',
                key: 'columnWidth'
            },
            view: (width)=>({
                    key: 'style',
                    value: {
                        width
                    }
                })
        });
    }
    /**
	 * Registers listeners to handle resizing process.
	 */ _registerResizingListeners() {
        const editingView = this.editor.editing.view;
        editingView.addObserver(MouseEventsObserver);
        editingView.document.on('mouseover', this._onMouseOverHandler.bind(this), {
            priority: 'high'
        });
        editingView.document.on('mousedown', this._onMouseDownHandler.bind(this), {
            priority: 'high'
        });
        editingView.document.on('mouseout', this._onMouseOutHandler.bind(this), {
            priority: 'high'
        });
        this._domEmitter.listenTo(global.window.document, 'mousemove', throttle(this._onMouseMoveHandler.bind(this), 50));
        this._domEmitter.listenTo(global.window.document, 'mouseup', this._onMouseUpHandler.bind(this));
    }
    /**
	 * Calculate and set `top` and `bottom` styles to the column resizer element to fit the height of the table.
	 *
	 * @param viewResizer The column resizer element.
	 */ _recalculateResizerElement(viewResizer) {
        const editor = this.editor;
        const domConverter = editor.editing.view.domConverter;
        // Get DOM target figure ancestor element.
        const domTable = domConverter.mapViewToDom(viewResizer.findAncestor('table'));
        // Get DOM table cell element.
        const domCell = domConverter.mapViewToDom(viewResizer.findAncestor((item)=>[
                'td',
                'th'
            ].includes(item.name)));
        const rectTable = new Rect(domTable);
        const rectCell = new Rect(domCell);
        // Calculate the top, and bottom positions of the column resizer element.
        const targetTopPosition = toPx(Number((rectTable.top - rectCell.top).toFixed(4)));
        const targetBottomPosition = toPx(Number((rectCell.bottom - rectTable.bottom).toFixed(4)));
        // Set `top` and `bottom` styles to the column resizer element.
        editor.editing.view.change((viewWriter)=>{
            viewWriter.setStyle('top', targetTopPosition, viewResizer);
            viewWriter.setStyle('bottom', targetBottomPosition, viewResizer);
        });
    }
    /**
	 * Remove `top` and `bottom` styles of the column resizer element.
	 *
	 * @param viewResizer The column resizer element.
	 */ _resetResizerStyles(viewResizer) {
        this.editor.editing.view.change((viewWriter)=>{
            viewWriter.removeStyle('top', viewResizer);
            viewWriter.removeStyle('bottom', viewResizer);
        });
    }
    /**
	 * Handles the `mouseover` event on column resizer element.
	 * Recalculates the `top` and `bottom` styles of the column resizer element to fit the height of the table.
	 *
	 * @param eventInfo An object containing information about the fired event.
	 * @param domEventData The data related to the DOM event.
	 */ _onMouseOverHandler(eventInfo, domEventData) {
        const target = domEventData.target;
        if (!target.hasClass('ck-table-column-resizer')) {
            return;
        }
        if (!this._isResizingAllowed) {
            return;
        }
        this._recalculateResizerElement(target);
    }
    /**
	 * Handles the `mouseout` event on column resizer element.
	 * When resizing is not active, it resets the `top` and `bottom` styles of the column resizer element.
	 *
	 * @param eventInfo An object containing information about the fired event.
	 * @param domEventData The data related to the DOM event.
	 */ _onMouseOutHandler(eventInfo, domEventData) {
        const target = domEventData.target;
        if (!target.hasClass('ck-table-column-resizer')) {
            return;
        }
        if (!this._isResizingAllowed) {
            return;
        }
        if (this._isResizingActive) {
            return;
        }
        this._resetResizerStyles(target);
    }
    /**
	 * Handles the `mousedown` event on column resizer element:
	 *  * calculates the initial column pixel widths,
	 *  * inserts the `<colgroup>` element if it is not present in the `<table>`,
	 *  * puts the necessary data in the temporary storage,
	 *  * applies the attributes to the `<table>` view element.
	 *
	 * @param eventInfo An object containing information about the fired event.
	 * @param domEventData The data related to the DOM event.
	 */ _onMouseDownHandler(eventInfo, domEventData) {
        const target = domEventData.target;
        if (!target.hasClass('ck-table-column-resizer')) {
            return;
        }
        if (!this._isResizingAllowed) {
            return;
        }
        const editor = this.editor;
        const modelTable = editor.editing.mapper.toModelElement(target.findAncestor('figure'));
        // Do not resize if table model is in non-editable place.
        if (!editor.model.canEditAt(modelTable)) {
            return;
        }
        domEventData.preventDefault();
        eventInfo.stop();
        this._initialMouseEventData = domEventData;
    }
    /**
	 * Starts the resizing process after the threshold is reached.
	 */ _startResizingAfterThreshold() {
        const domEventData = this._initialMouseEventData;
        const { target } = domEventData;
        const modelTable = this.editor.editing.mapper.toModelElement(target.findAncestor('figure'));
        const viewTable = target.findAncestor('table');
        // Calculate the initial column widths in pixels.
        const columnWidthsInPx = _calculateDomColumnWidths(modelTable, this._tableUtilsPlugin, this.editor);
        // Insert colgroup for the table that is resized for the first time.
        if (!Array.from(viewTable.getChildren()).find((viewCol)=>viewCol.is('element', 'colgroup'))) {
            this.editor.editing.view.change((viewWriter)=>{
                _insertColgroupElement(viewWriter, columnWidthsInPx, viewTable);
            });
        }
        this._isResizingActive = true;
        this._resizingData = this._getResizingData(domEventData, columnWidthsInPx);
        // At this point we change only the editor view - we don't want other users to see our changes yet,
        // so we can't apply them in the model.
        this.editor.editing.view.change((writer)=>_applyResizingAttributesToTable(writer, viewTable, this._resizingData));
        /**
		 * Calculates the DOM columns' widths. It is done by taking the width of the widest cell
		 * from each table column (we rely on the  {@link module:table/tablewalker~TableWalker}
		 * to determine which column the cell belongs to).
		 *
		 * @param modelTable A table which columns should be measured.
		 * @param tableUtils The Table Utils plugin instance.
		 * @param editor The editor instance.
		 * @returns Columns' widths expressed in pixels (without unit).
		 */ function _calculateDomColumnWidths(modelTable, tableUtilsPlugin, editor) {
            const columnWidthsInPx = Array(tableUtilsPlugin.getColumns(modelTable));
            const tableWalker = new TableWalker(modelTable);
            for (const cellSlot of tableWalker){
                const viewCell = editor.editing.mapper.toViewElement(cellSlot.cell);
                const domCell = editor.editing.view.domConverter.mapViewToDom(viewCell);
                const domCellWidth = getDomCellOuterWidth(domCell);
                if (!columnWidthsInPx[cellSlot.column] || domCellWidth < columnWidthsInPx[cellSlot.column]) {
                    columnWidthsInPx[cellSlot.column] = toPrecision(domCellWidth);
                }
            }
            return columnWidthsInPx;
        }
        /**
		 * Creates a `<colgroup>` element with `<col>`s and inserts it into a given view table.
		 *
		 * @param viewWriter A writer instance.
		 * @param columnWidthsInPx Column widths.
		 * @param viewTable A table view element.
		 */ function _insertColgroupElement(viewWriter, columnWidthsInPx, viewTable) {
            const colgroup = viewWriter.createContainerElement('colgroup');
            for(let i = 0; i < columnWidthsInPx.length; i++){
                const viewColElement = viewWriter.createEmptyElement('col');
                const columnWidthInPc = `${toPrecision(columnWidthsInPx[i] / sumArray(columnWidthsInPx) * 100)}%`;
                viewWriter.setStyle('width', columnWidthInPc, viewColElement);
                viewWriter.insert(viewWriter.createPositionAt(colgroup, 'end'), viewColElement);
            }
            viewWriter.insert(viewWriter.createPositionAt(viewTable, 0), colgroup);
        }
        /**
		 * Applies the style and classes to the view table as the resizing begun.
		 *
		 * @param viewWriter A writer instance.
		 * @param viewTable A table containing the clicked resizer.
		 * @param resizingData Data related to the resizing.
		 */ function _applyResizingAttributesToTable(viewWriter, viewTable, resizingData) {
            const figureInitialPcWidth = resizingData.widths.viewFigureWidth / resizingData.widths.viewFigureParentWidth;
            viewWriter.addClass('ck-table-resized', viewTable);
            viewWriter.addClass('ck-table-column-resizer__active', resizingData.elements.viewResizer);
            viewWriter.setStyle('width', `${toPrecision(figureInitialPcWidth * 100)}%`, viewTable.findAncestor('figure'));
        }
    }
    /**
	 * Handles the `mousemove` event.
	 *  * If resizing process is not in progress, it does nothing.
	 *  * If resizing is active but not allowed, it stops the resizing process instantly calling the `mousedown` event handler.
	 *  * Otherwise it dynamically updates the widths of the resized columns.
	 *
	 * @param eventInfo An object containing information about the fired event.
	 * @param mouseEventData The native DOM event.
	 */ _onMouseMoveHandler(eventInfo, mouseEventData) {
        if (this._initialMouseEventData) {
            const mouseEvent = this._initialMouseEventData.domEvent;
            const distanceX = Math.abs(mouseEventData.clientX - mouseEvent.clientX);
            if (distanceX >= COLUMN_RESIZE_DISTANCE_THRESHOLD) {
                this._startResizingAfterThreshold();
                this._initialMouseEventData = null;
            } else {
                return;
            }
        }
        if (!this._isResizingActive) {
            return;
        }
        if (!this._isResizingAllowed) {
            this._onMouseUpHandler();
            return;
        }
        const { columnPosition, flags: { isRightEdge, isTableCentered, isLtrContent }, elements: { viewFigure, viewLeftColumn, viewRightColumn, viewResizer }, widths: { viewFigureParentWidth, tableWidth, leftColumnWidth, rightColumnWidth } } = this._resizingData;
        const dxLowerBound = -leftColumnWidth + COLUMN_MIN_WIDTH_IN_PIXELS;
        const dxUpperBound = isRightEdge ? viewFigureParentWidth - tableWidth : rightColumnWidth - COLUMN_MIN_WIDTH_IN_PIXELS;
        // The multiplier is needed for calculating the proper movement offset:
        // - it should negate the sign if content language direction is right-to-left,
        // - it should double the offset if the table edge is resized and table is centered.
        const multiplier = (isLtrContent ? 1 : -1) * (isRightEdge && isTableCentered ? 2 : 1);
        const dx = clamp((mouseEventData.clientX - columnPosition) * multiplier, Math.min(dxLowerBound, 0), Math.max(dxUpperBound, 0));
        if (dx === 0) {
            return;
        }
        this.editor.editing.view.change((writer)=>{
            const leftColumnWidthAsPercentage = toPrecision((leftColumnWidth + dx) * 100 / tableWidth);
            writer.setStyle('width', `${leftColumnWidthAsPercentage}%`, viewLeftColumn);
            if (isRightEdge) {
                const tableWidthAsPercentage = toPrecision((tableWidth + dx) * 100 / viewFigureParentWidth);
                writer.setStyle('width', `${tableWidthAsPercentage}%`, viewFigure);
            } else {
                const rightColumnWidthAsPercentage = toPrecision((rightColumnWidth - dx) * 100 / tableWidth);
                writer.setStyle('width', `${rightColumnWidthAsPercentage}%`, viewRightColumn);
            }
        });
        this._recalculateResizerElement(viewResizer);
    }
    /**
	 * Handles the `mouseup` event.
	 *  * If resizing process is not in progress, it does nothing.
	 *  * If resizing is active but not allowed, it cancels the resizing process restoring the original widths.
	 *  * Otherwise it propagates the changes from view to the model by executing the adequate commands.
	 */ _onMouseUpHandler() {
        this._initialMouseEventData = null;
        if (!this._isResizingActive) {
            return;
        }
        const { viewResizer, modelTable, viewFigure, viewColgroup } = this._resizingData.elements;
        const editor = this.editor;
        const editingView = editor.editing.view;
        const tableColumnGroup = this.getColumnGroupElement(modelTable);
        const viewColumns = Array.from(viewColgroup.getChildren()).filter((column)=>column.is('view:element'));
        const columnWidthsAttributeOld = tableColumnGroup ? this.getTableColumnsWidths(tableColumnGroup) : null;
        const columnWidthsAttributeNew = viewColumns.map((column)=>column.getStyle('width'));
        const isColumnWidthsAttributeChanged = !isEqual(columnWidthsAttributeOld, columnWidthsAttributeNew);
        const tableWidthAttributeOld = modelTable.getAttribute('tableWidth');
        const tableWidthAttributeNew = viewFigure.getStyle('width');
        const isTableWidthAttributeChanged = tableWidthAttributeOld !== tableWidthAttributeNew;
        if (isColumnWidthsAttributeChanged || isTableWidthAttributeChanged) {
            if (this._isResizingAllowed) {
                editor.execute('resizeTableWidth', {
                    table: modelTable,
                    tableWidth: `${toPrecision(tableWidthAttributeNew)}%`,
                    columnWidths: columnWidthsAttributeNew
                });
            } else {
                // In read-only mode revert all changes in the editing view. The model is not touched so it does not need to be restored.
                // This case can occur if the read-only mode kicks in during the resizing process.
                editingView.change((writer)=>{
                    // If table had resized columns before, restore the previous column widths.
                    // Otherwise clean up the view from the temporary column resizing markup.
                    if (columnWidthsAttributeOld) {
                        for (const viewCol of viewColumns){
                            writer.setStyle('width', columnWidthsAttributeOld.shift(), viewCol);
                        }
                    } else {
                        writer.remove(viewColgroup);
                    }
                    if (isTableWidthAttributeChanged) {
                        // If the whole table was already resized before, restore the previous table width.
                        // Otherwise clean up the view from the temporary table resizing markup.
                        if (tableWidthAttributeOld) {
                            writer.setStyle('width', tableWidthAttributeOld, viewFigure);
                        } else {
                            writer.removeStyle('width', viewFigure);
                        }
                    }
                    // If a table and its columns weren't resized before,
                    // prune the remaining common resizing markup.
                    if (!columnWidthsAttributeOld && !tableWidthAttributeOld) {
                        writer.removeClass('ck-table-resized', [
                            ...viewFigure.getChildren()
                        ].find((element)=>element.name === 'table'));
                    }
                });
            }
        }
        editingView.change((writer)=>{
            writer.removeClass('ck-table-column-resizer__active', viewResizer);
        });
        const element = editingView.domConverter.mapViewToDom(viewResizer);
        if (!element.matches(':hover')) {
            this._resetResizerStyles(viewResizer);
        }
        this._isResizingActive = false;
        this._resizingData = null;
    }
    /**
	 * Retrieves and returns required data needed for the resizing process.
	 *
	 * @param domEventData The data of the `mousedown` event.
	 * @param columnWidths The current widths of the columns.
	 * @returns The data needed for the resizing process.
	 */ _getResizingData(domEventData, columnWidths) {
        const editor = this.editor;
        const columnPosition = domEventData.domEvent.clientX;
        const viewResizer = domEventData.target;
        const viewLeftCell = viewResizer.findAncestor('td') || viewResizer.findAncestor('th');
        const modelLeftCell = editor.editing.mapper.toModelElement(viewLeftCell);
        const modelTable = modelLeftCell.findAncestor('table');
        const leftColumnIndex = getColumnEdgesIndexes(modelLeftCell, this._tableUtilsPlugin).rightEdge;
        const lastColumnIndex = this._tableUtilsPlugin.getColumns(modelTable) - 1;
        let tableAlignment = modelTable.getAttribute('tableAlignment');
        if (modelTable.getAttribute('tableType') !== 'layout') {
            tableAlignment ||= editor.config.get('table.tableProperties.defaultProperties.alignment');
            tableAlignment ||= 'center';
        }
        const isRightEdge = leftColumnIndex === lastColumnIndex;
        const isLtrContent = editor.locale.contentLanguageDirection !== 'rtl';
        const isTableCentered = tableAlignment === 'center';
        const viewTable = viewLeftCell.findAncestor('table');
        const viewFigure = viewTable.findAncestor('figure');
        const viewColgroup = [
            ...viewTable.getChildren()
        ].find((viewCol)=>viewCol.is('element', 'colgroup'));
        const viewLeftColumn = viewColgroup.getChild(leftColumnIndex);
        const viewRightColumn = isRightEdge ? undefined : viewColgroup.getChild(leftColumnIndex + 1);
        const viewFigureParentWidth = getElementWidthInPixels(editor.editing.view.domConverter.mapViewToDom(viewFigure.parent));
        const viewFigureWidth = getElementWidthInPixels(editor.editing.view.domConverter.mapViewToDom(viewFigure));
        const tableWidth = getTableWidthInPixels(modelTable, editor);
        const leftColumnWidth = columnWidths[leftColumnIndex];
        const rightColumnWidth = isRightEdge ? undefined : columnWidths[leftColumnIndex + 1];
        return {
            columnPosition,
            flags: {
                isRightEdge,
                isTableCentered,
                isLtrContent
            },
            elements: {
                viewResizer,
                modelTable,
                viewFigure,
                viewColgroup,
                viewLeftColumn,
                viewRightColumn
            },
            widths: {
                viewFigureParentWidth,
                viewFigureWidth,
                tableWidth,
                leftColumnWidth,
                rightColumnWidth
            }
        };
    }
    /**
	 * Registers a listener ensuring that each resizable cell have a resizer handle.
	 */ _registerResizerInserter() {
        this.editor.conversion.for('editingDowncast').add((dispatcher)=>{
            dispatcher.on('insert:tableCell', (evt, data, conversionApi)=>{
                const modelElement = data.item;
                const viewElement = conversionApi.mapper.toViewElement(modelElement);
                const viewWriter = conversionApi.writer;
                viewWriter.insert(viewWriter.createPositionAt(viewElement, 'end'), viewWriter.createUIElement('div', {
                    class: 'ck-table-column-resizer'
                }));
            }, {
                priority: 'lowest'
            });
        });
    }
}

/**
 * The table column resize feature.
 *
 * It provides the possibility to set the width of each column in a table using a resize handler.
 */ class TableColumnResize extends Plugin {
    /**
	 * @inheritDoc
 	 */ static get requires() {
        return [
            TableColumnResizeEditing,
            TableCellWidthEditing
        ];
    }
    /**
	 * @inheritDoc
 	 */ static get pluginName() {
        return 'TableColumnResize';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The set table type command.
 *
 * The command is registered by {@link module:table/tablelayout/tablelayoutediting~TableLayoutEditing}
 * as the `'tableType'` editor command.
 *
 * To set the table type at the current selection, execute the command and specify the table type:
 *
 * ```ts
 * editor.execute( 'tableType', 'layout' );
 * ```
 */ class TableTypeCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedTable = getSelectionAffectedTable(selection);
        if (selectedTable) {
            this.isEnabled = true;
            this.value = selectedTable.getAttribute('tableType');
        } else {
            this.isEnabled = false;
            this.value = null;
        }
    }
    /**
	 * Executes the command.
	 *
	 * Set table type by the given table type parameter.
	 *
	 * @param tableType The type of table it should become.
	 * @fires execute
	 */ execute(tableType) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const table = getSelectionAffectedTable(selection);
        const currentTableType = table.getAttribute('tableType');
        if (currentTableType === tableType) {
            return;
        }
        model.change((writer)=>{
            writer.setAttribute('tableType', tableType, table);
            model.schema.removeDisallowedAttributes([
                table
            ], writer);
            const tableChildren = table.getChildren();
            // Check if all children are allowed for the new table type.
            for (const child of tableChildren){
                if (!model.schema.checkChild(table, child)) {
                    writer.remove(child);
                }
            }
        });
    }
}

const TABLE_TYPES = [
    'content',
    'layout'
];
/**
 * The table layout editing plugin.
 */ class TableLayoutEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableLayoutEditing';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'TL';
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableColumnResize
        ];
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        this._defineSchema();
        this._defineConverters();
        this._defineClipboardPasteHandlers();
        this._registerTableTypeAttributePostfixer();
        this.editor.commands.add('insertTableLayout', new InsertTableLayoutCommand(this.editor));
        this.editor.commands.add('tableType', new TableTypeCommand(this.editor));
    }
    /**
	 * Defines the schema for the table layout feature.
	 */ _defineSchema() {
        const { schema } = this.editor.model;
        schema.extend('table', {
            allowAttributes: 'tableType'
        });
        // Disallow adding `caption` to layout table.
        schema.addChildCheck(layoutTableCheck, 'caption');
        // Disallow adding `headingRows` attribute to layout table.
        schema.addAttributeCheck(layoutTableCheck, 'headingRows');
        // Disallow adding `headingColumns` attribute to layout table.
        schema.addAttributeCheck(layoutTableCheck, 'headingColumns');
    }
    /**
	 * Defines the converters for the table layout feature.
	 */ _defineConverters() {
        const { editor } = this;
        const { conversion } = editor;
        const preferredExternalTableType = editor.config.get('table.tableLayout.preferredExternalTableType');
        conversion.for('upcast').add(upcastLayoutTable(editor, preferredExternalTableType));
        conversion.for('dataDowncast').add(dataDowncastLayoutTable());
        conversion.for('editingDowncast').attributeToAttribute({
            model: {
                key: 'tableType',
                values: [
                    'layout',
                    'content'
                ]
            },
            view: {
                layout: {
                    key: 'class',
                    value: [
                        'layout-table'
                    ]
                },
                content: {
                    key: 'class',
                    value: [
                        'content-table'
                    ]
                }
            }
        });
    }
    /**
	 * Handles the clipboard content insertion events.
	 *
	 * - If the content is from another editor, do not override the table type.
	 * - If the content is from another source, set the table type to 'content'.
	 *
	 * It handles the scenario when user copies `<table></table>` from Word. We do not want to
	 * change the table type to `layout` because it is really `content` table.
	 */ _defineClipboardPasteHandlers() {
        const { plugins } = this.editor;
        if (!plugins.has('ClipboardPipeline')) {
            return;
        }
        const clipboardPipeline = plugins.get('ClipboardPipeline');
        this.listenTo(clipboardPipeline, 'contentInsertion', (evt, data)=>{
            // If content is pasted from the other editor, skip overriding table type.
            if (data.sourceEditorId) {
                return;
            }
            // For content from other sources, always set table type to 'content'.
            this.editor.model.change((writer)=>{
                for (const { item } of writer.createRangeIn(data.content)){
                    if (item.is('element', 'table')) {
                        writer.setAttribute('tableType', 'content', item);
                    }
                }
            });
        });
    }
    /**
	 * Registers a post-fixer that sets the `tableType` attribute to `content` for inserted "default" tables.
	 * Also fixes potential issues with the table structure when the `tableType` attribute has been changed.
	 */ _registerTableTypeAttributePostfixer() {
        const editor = this.editor;
        editor.model.document.registerPostFixer((writer)=>{
            const changes = editor.model.document.differ.getChanges();
            let hasChanged = false;
            for (const entry of changes){
                if (entry.type == 'insert' && entry.name != '$text') {
                    const element = entry.position.nodeAfter;
                    const range = writer.createRangeOn(element);
                    for (const item of range.getItems()){
                        if (item.is('element', 'table') && !item.hasAttribute('tableType')) {
                            writer.setAttribute('tableType', 'content', item);
                            hasChanged = true;
                        }
                    }
                }
                // Remove disallowed attributes and children for layout tables
                // when `tableType` attribute has been changed by `TableTypeCommand`.
                if (entry.type == 'attribute' && entry.attributeKey == 'tableType') {
                    for (const item of entry.range.getItems()){
                        if (item.is('element', 'table')) {
                            editor.model.schema.removeDisallowedAttributes([
                                item
                            ], writer);
                            const tableChildren = item.getChildren();
                            // Check if all children are allowed for the new table type.
                            for (const child of tableChildren){
                                if (!editor.model.schema.checkChild(item, child)) {
                                    writer.remove(child);
                                    hasChanged = true;
                                }
                            }
                        }
                    }
                }
            }
            return hasChanged;
        });
    }
}
/**
 * View table element to model table element conversion helper.
 *
 * This conversion helper overrides the default table converter to meet table layout conditions.
 *
 * @param editor Editor instance.
 * @returns Conversion helper.
 */ function upcastLayoutTable(editor, preferredExternalTableType) {
    return (dispatcher)=>{
        dispatcher.on('element:table', (evt, data, conversionApi)=>{
            const viewTable = data.viewItem;
            if (!conversionApi.consumable.test(viewTable, {
                name: true
            })) {
                return;
            }
            const resolvedTableType = resolveTableType(viewTable, preferredExternalTableType);
            // When an element is a content table, then skip it.
            if (resolvedTableType == 'content') {
                return;
            }
            const table = conversionApi.writer.createElement('table', {
                tableType: 'layout'
            });
            if (!conversionApi.safeInsert(table, data.modelCursor)) {
                return;
            }
            conversionApi.consumable.consume(viewTable, {
                name: true
            });
            conversionApi.consumable.consume(viewTable, {
                attributes: [
                    'role'
                ]
            });
            conversionApi.consumable.consume(viewTable, {
                classes: [
                    'layout-table'
                ]
            });
            // Layout tables have no border, so it's equitable to consume the border="0" attribute.
            if (editor.config.get('experimentalFlags.upcastTableBorderZeroAttributes') && viewTable.getAttribute('border') === '0') {
                conversionApi.consumable.consume(viewTable, {
                    attributes: [
                        'border'
                    ]
                });
            }
            // Get all rows from the table and convert them.
            // While looping over the children of `<table>` we can be sure that first will be `<tbody>`
            // and optionally `<thead>` and `<tfoot>`, and in these elements are the table rows found.
            // We can be sure of that because of `DomParser` handle it.
            for (const tableChild of viewTable.getChildren()){
                if (tableChild.is('element')) {
                    for (const row of tableChild.getChildren()){
                        if (row.is('element', 'tr')) {
                            conversionApi.convertItem(row, conversionApi.writer.createPositionAt(table, 'end'));
                        }
                    }
                }
            }
            // Convert everything else.
            conversionApi.convertChildren(viewTable, conversionApi.writer.createPositionAt(table, 'end'));
            // Create one row and one table cell for empty table.
            if (table.isEmpty) {
                const row = conversionApi.writer.createElement('tableRow');
                conversionApi.writer.insert(row, conversionApi.writer.createPositionAt(table, 'end'));
                createEmptyTableCell(conversionApi.writer, conversionApi.writer.createPositionAt(row, 'end'));
            }
            conversionApi.updateConversionResult(table, data);
        }, {
            priority: 'high'
        });
        // Sets only the table type attribute.
        dispatcher.on('element:table', (evt, data, conversionApi)=>{
            const { viewItem, modelRange } = data;
            if (modelRange) {
                conversionApi.writer.setAttribute('tableType', resolveTableType(viewItem, preferredExternalTableType), modelRange);
                conversionApi.consumable.consume(viewItem, {
                    classes: [
                        'layout-table'
                    ]
                });
                conversionApi.consumable.consume(viewItem, {
                    classes: [
                        'content-table'
                    ]
                });
            }
        }, {
            priority: 'low'
        });
    };
}
/**
 * Model table container element to view table element conversion helper.
 *
 * @returns Conversion helper.
 */ function dataDowncastLayoutTable() {
    return (dispatcher)=>{
        return dispatcher.on('attribute:tableType:table', (evt, data, conversionApi)=>{
            const { item, attributeNewValue } = data;
            const { mapper, writer } = conversionApi;
            if (!conversionApi.consumable.test(item, evt.name)) {
                return;
            }
            const table = mapper.toViewElement(item);
            writer.addClass(`${attributeNewValue}-table`, table);
            if (attributeNewValue == 'layout') {
                writer.setAttribute('role', 'presentation', table);
            }
            conversionApi.consumable.consume(item, evt.name);
        });
    };
}
/**
 * Resolves the table type based on the view table element and the preferred external table type.
 */ function resolveTableType(viewTable, preferredExternalTableType) {
    if (viewTable.hasClass('content-table')) {
        return 'content';
    }
    if (viewTable.hasClass('layout-table')) {
        return 'layout';
    }
    if (preferredExternalTableType && TABLE_TYPES.includes(preferredExternalTableType)) {
        return preferredExternalTableType;
    }
    const parent = viewTable.parent;
    /**
	 * Checks if the table is a content table if any of the following conditions are met:
	 * - the `<table>` is wrapped with `<figure>`,
	 * - the `<table>` has a `<caption>` element.
	 */ if (parent.is('element', 'figure') || Array.from(viewTable.getChildren()).some((child)=>child.is('element', 'caption'))) {
        return 'content';
    }
    return 'layout';
}
/**
 * Checks if the element is a layout table.
 * It is used to disallow attributes or children that is managed by `Schema`.
 */ function layoutTableCheck(context) {
    if (context.endsWith('table') && context.last.getAttribute('tableType') == 'layout') {
        return false;
    }
}

/**
 * The table plugin.
 *
 * For a detailed overview, check the {@glink features/tables/layout-tables Layout table feature documentation}.
 */ class TableLayout extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableLayout';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableColumnResize,
            TableLayoutEditing,
            TableLayoutUI
        ];
    }
}

/**
 * The table cell attribute command.
 *
 * This command is a base command for other table property commands.
 */ class TablePropertyCommand extends Command {
    /**
	 * The attribute that will be set by the command.
	 */ attributeName;
    /**
	 * The default value for the attribute.
	 *
	 * @readonly
	 */ _defaultValue;
    /**
	 * The default value for the attribute for the content table.
	 */ _defaultContentTableValue;
    /**
	 * The default value for the attribute for the layout table.
	 */ _defaultLayoutTableValue;
    /**
	 * Creates a new `TablePropertyCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param attributeName Table cell attribute name.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, attributeName, defaultValue){
        super(editor);
        this.attributeName = attributeName;
        this._defaultContentTableValue = defaultValue;
        this._defaultLayoutTableValue = attributeName === 'tableBorderStyle' ? 'none' : undefined;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const table = getSelectionAffectedTable(selection);
        this._defaultValue = !table || table.getAttribute('tableType') !== 'layout' ? this._defaultContentTableValue : this._defaultLayoutTableValue;
        this.isEnabled = !!table;
        this.value = this._getValue(table);
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.value If set, the command will set the attribute on the selected table.
	 * If not set, the command will remove the attribute from the selected table.
	 * @param options.batch Pass the model batch instance to the command to aggregate changes,
	 * for example, to allow a single undo step for multiple executions.
	 */ execute(options = {}) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const { value, batch } = options;
        const table = getSelectionAffectedTable(selection);
        const valueToSet = this._getValueToSet(value);
        model.enqueueChange(batch, (writer)=>{
            if (valueToSet) {
                writer.setAttribute(this.attributeName, valueToSet, table);
            } else {
                writer.removeAttribute(this.attributeName, table);
            }
        });
    }
    /**
	 * Returns the attribute value for a table.
	 */ _getValue(table) {
        if (!table) {
            return;
        }
        const value = table.getAttribute(this.attributeName);
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
    /**
	 * Returns the proper model value. It can be used to add a default unit to numeric values.
	 */ _getValueToSet(value) {
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}

/**
 * The table background color command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBackgroundColor'` editor command.
 *
 * To change the background color of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBackgroundColor', {
 *   value: '#f00'
 * } );
 * ```
 */ class TableBackgroundColorCommand extends TablePropertyCommand {
    /**
	 * Creates a new `TableBackgroundColorCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableBackgroundColor', defaultValue);
    }
}

/**
 * The table border color command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderColor'` editor command.
 *
 * To change the border color of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBorderColor', {
 *   value: '#f00'
 * } );
 * ```
 */ class TableBorderColorCommand extends TablePropertyCommand {
    /**
	 * Creates a new `TableBorderColorCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableBorderColor', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getValue(table) {
        if (!table) {
            return;
        }
        const value = getSingleValue(table.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}

/**
 * The table style border command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderStyle'` editor command.
 *
 * To change the border style of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBorderStyle', {
 *   value: 'dashed'
 * } );
 * ```
 */ class TableBorderStyleCommand extends TablePropertyCommand {
    /**
	 * Creates a new `TableBorderStyleCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableBorderStyle', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getValue(table) {
        if (!table) {
            return;
        }
        const value = getSingleValue(table.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}

/**
 * The table width border command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderWidth'` editor command.
 *
 * To change the border width of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableBorderWidth', {
 *   value: '5px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableBorderWidth', {
 *   value: '5'
 * } );
 * ```
 *
 * will set the `borderWidth` attribute to `'5px'` in the model.
 */ class TableBorderWidthCommand extends TablePropertyCommand {
    /**
	 * Creates a new `TableBorderWidthCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableBorderWidth', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getValue(table) {
        if (!table) {
            return;
        }
        const value = getSingleValue(table.getAttribute(this.attributeName));
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
    /**
	 * @inheritDoc
	 */ _getValueToSet(value) {
        const newValue = addDefaultUnitToNumericValue(value, 'px');
        if (newValue === this._defaultValue) {
            return;
        }
        return newValue;
    }
}

/**
 * The table width command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableWidth'` editor command.
 *
 * To change the width of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableWidth', {
 *   value: '400px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableWidth', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the `width` attribute to `'50px'` in the model.
 */ class TableWidthCommand extends TablePropertyCommand {
    /**
	 * Creates a new `TableWidthCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableWidth', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getValueToSet(value) {
        value = addDefaultUnitToNumericValue(value, 'px');
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}

/**
 * The table height command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableHeight'` editor command.
 *
 * To change the height of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableHeight', {
 *   value: '500px'
 * } );
 * ```
 *
 * **Note**: This command adds the default `'px'` unit to numeric values. Executing:
 *
 * ```ts
 * editor.execute( 'tableHeight', {
 *   value: '50'
 * } );
 * ```
 *
 * will set the `height` attribute to `'50px'` in the model.
 */ class TableHeightCommand extends TablePropertyCommand {
    /**
	 * Creates a new `TableHeightCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value of the attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableHeight', defaultValue);
    }
    /**
	 * @inheritDoc
	 */ _getValueToSet(value) {
        value = addDefaultUnitToNumericValue(value, 'px');
        if (value === this._defaultValue) {
            return;
        }
        return value;
    }
}

/**
 * The table alignment command.
 *
 * The command is registered by the {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableAlignment'` editor command.
 *
 * To change the alignment of the selected table, execute the command:
 *
 * ```ts
 * editor.execute( 'tableAlignment', {
 *   value: 'right'
 * } );
 * ```
 */ class TableAlignmentCommand extends TablePropertyCommand {
    /**
	 * Creates a new `TableAlignmentCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param defaultValue The default value for the "alignment" attribute.
	 */ constructor(editor, defaultValue){
        super(editor, 'tableAlignment', defaultValue);
    }
}

/**
 * The table properties editing feature.
 *
 * Introduces table's model attributes and their conversion:
 *
 * - border: `tableBorderStyle`, `tableBorderColor` and `tableBorderWidth`
 * - background color: `tableBackgroundColor`
 * - horizontal alignment: `tableAlignment`
 * - width & height: `tableWidth` & `tableHeight`
 *
 * It also registers commands used to manipulate the above attributes:
 *
 * - border: `'tableBorderStyle'`, `'tableBorderColor'` and `'tableBorderWidth'` commands
 * - background color: `'tableBackgroundColor'`
 * - horizontal alignment: `'tableAlignment'`
 * - width & height: `'tableWidth'` & `'tableHeight'`
 */ class TablePropertiesEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TablePropertiesEditing';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'TCP';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        editor.config.define('table.tableProperties.defaultProperties', {});
        const defaultTableProperties = getNormalizedDefaultTableProperties(editor.config.get('table.tableProperties.defaultProperties'), {
            includeAlignmentProperty: true
        });
        const useInlineStyles = editor.config.get('table.tableProperties.alignment.useInlineStyles') !== false;
        editor.data.addStyleProcessorRules(addMarginStylesRules);
        editor.data.addStyleProcessorRules(addBorderStylesRules);
        enableBorderProperties(editor, {
            color: defaultTableProperties.borderColor,
            style: defaultTableProperties.borderStyle,
            width: defaultTableProperties.borderWidth
        });
        editor.commands.add('tableBorderColor', new TableBorderColorCommand(editor, defaultTableProperties.borderColor));
        editor.commands.add('tableBorderStyle', new TableBorderStyleCommand(editor, defaultTableProperties.borderStyle));
        editor.commands.add('tableBorderWidth', new TableBorderWidthCommand(editor, defaultTableProperties.borderWidth));
        if (editor.config.get('experimentalFlags.useExtendedTableBlockAlignment')) {
            enableExtendedAlignmentProperty(schema, conversion, defaultTableProperties.alignment, useInlineStyles);
        } else {
            enableAlignmentProperty(schema, conversion, defaultTableProperties.alignment);
        }
        editor.commands.add('tableAlignment', new TableAlignmentCommand(editor, defaultTableProperties.alignment));
        enableTableToFigureProperty(schema, conversion, {
            modelAttribute: 'tableWidth',
            styleName: 'width',
            attributeName: 'width',
            attributeType: 'length',
            defaultValue: defaultTableProperties.width
        });
        editor.commands.add('tableWidth', new TableWidthCommand(editor, defaultTableProperties.width));
        enableTableToFigureProperty(schema, conversion, {
            modelAttribute: 'tableHeight',
            styleName: 'height',
            attributeName: 'height',
            attributeType: 'length',
            defaultValue: defaultTableProperties.height
        });
        editor.commands.add('tableHeight', new TableHeightCommand(editor, defaultTableProperties.height));
        editor.data.addStyleProcessorRules(addBackgroundStylesRules);
        enableProperty(schema, conversion, {
            modelAttribute: 'tableBackgroundColor',
            styleName: 'background-color',
            attributeName: 'bgcolor',
            attributeType: 'color',
            defaultValue: defaultTableProperties.backgroundColor
        });
        editor.commands.add('tableBackgroundColor', new TableBackgroundColorCommand(editor, defaultTableProperties.backgroundColor));
        if (editor.config.get('experimentalFlags.useExtendedTableBlockAlignment')) {
            const viewDoc = editor.editing.view.document;
            // Adjust clipboard output to wrap tables in divs if needed (for alignment).
            this.listenTo(viewDoc, 'clipboardOutput', (evt, data)=>{
                editor.editing.view.change((writer)=>{
                    for (const { item } of writer.createRangeIn(data.content)){
                        wrapInDivIfNeeded(item, writer);
                    }
                    data.dataTransfer.setData('text/html', this.editor.data.htmlProcessor.toData(data.content));
                });
            }, {
                priority: 'lowest'
            });
        }
    }
}
/**
 * Checks whether the view element is a table and if it needs to be wrapped in a div for alignment purposes.
 * If so, it wraps it in a div and inserts it into the data content.
 */ function wrapInDivIfNeeded(viewItem, writer) {
    if (!viewItem.is('element', 'table')) {
        return;
    }
    const alignAttribute = viewItem.getAttribute('align');
    const floatAttribute = viewItem.getStyle('float');
    const marginLeft = viewItem.getStyle('margin-left');
    const marginRight = viewItem.getStyle('margin-right');
    if (// Align center.
    alignAttribute && alignAttribute === 'center' || // Align right with text wrapping.
    floatAttribute && floatAttribute === 'right' && alignAttribute && alignAttribute === 'right') {
        insertWrapperWithAlignment(writer, alignAttribute, viewItem);
        return;
    }
    // Align right with no text wrapping.
    if (floatAttribute === undefined && marginLeft === 'auto' && marginRight === '0') {
        insertWrapperWithAlignment(writer, 'right', viewItem);
    }
}
function insertWrapperWithAlignment(writer, align, table) {
    const position = writer.createPositionBefore(table);
    const wrapper = writer.createContainerElement('div', {
        align
    }, table);
    writer.insert(position, wrapper);
}
/**
 * Enables `tableBorderStyle'`, `tableBorderColor'` and `tableBorderWidth'` attributes for table.
 *
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `tableBorderColor` value.
 * @param defaultBorder.style The default `tableBorderStyle` value.
 * @param defaultBorder.width The default `tableBorderWidth` value.
 */ function enableBorderProperties(editor, defaultBorder) {
    const { conversion } = editor;
    const { schema } = editor.model;
    const modelAttributes = {
        width: 'tableBorderWidth',
        color: 'tableBorderColor',
        style: 'tableBorderStyle'
    };
    schema.extend('table', {
        allowAttributes: Object.values(modelAttributes)
    });
    for (const modelAttribute of Object.values(modelAttributes)){
        schema.setAttributeProperties(modelAttribute, {
            isFormatting: true
        });
    }
    upcastBorderStyles(editor, 'table', modelAttributes, defaultBorder);
    downcastTableAttribute(conversion, {
        modelAttribute: modelAttributes.color,
        styleName: 'border-color'
    });
    downcastTableAttribute(conversion, {
        modelAttribute: modelAttributes.style,
        styleName: 'border-style'
    });
    downcastTableAttribute(conversion, {
        modelAttribute: modelAttributes.width,
        styleName: 'border-width'
    });
}
/**
 * Enables the extended block`'alignment'` attribute for table.
 *
 * @param defaultValue The default alignment value.
 */ function enableExtendedAlignmentProperty(schema, conversion, defaultValue, useInlineStyles) {
    schema.extend('table', {
        allowAttributes: [
            'tableAlignment'
        ]
    });
    schema.setAttributeProperties('tableAlignment', {
        isFormatting: true
    });
    conversion.for('downcast').attributeToAttribute({
        model: {
            name: 'table',
            key: 'tableAlignment',
            values: [
                'left',
                'center',
                'right',
                'blockLeft',
                'blockRight'
            ]
        },
        view: {
            left: useInlineStyles ? {
                key: 'style',
                value: {
                    float: 'left',
                    'margin-right': 'var(--ck-content-table-style-spacing, 1.5em)'
                }
            } : {
                key: 'class',
                value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.left.className
            },
            right: useInlineStyles ? {
                key: 'style',
                value: {
                    float: 'right',
                    'margin-left': 'var(--ck-content-table-style-spacing, 1.5em)'
                }
            } : {
                key: 'class',
                value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.right.className
            },
            center: useInlineStyles ? {
                key: 'style',
                value: {
                    'margin-left': 'auto',
                    'margin-right': 'auto'
                }
            } : {
                key: 'class',
                value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.center.className
            },
            blockLeft: useInlineStyles ? {
                key: 'style',
                value: {
                    'margin-left': '0',
                    'margin-right': 'auto'
                }
            } : {
                key: 'class',
                value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className
            },
            blockRight: useInlineStyles ? {
                key: 'style',
                value: {
                    'margin-left': 'auto',
                    'margin-right': '0'
                }
            } : {
                key: 'class',
                value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className
            }
        },
        converterPriority: 'high'
    });
    /**
	 * Enables upcasting of the `tableAlignment` attribute.
	 */ upcastTableAlignmentConfig.forEach((config)=>{
        conversion.for('upcast').attributeToAttribute({
            view: config.view,
            model: {
                key: 'tableAlignment',
                value: (viewElement, conversionApi, data)=>{
                    if (isNonTableFigureElement(viewElement)) {
                        return;
                    }
                    const localDefaultValue = getDefaultValueAdjusted(defaultValue, '', data);
                    const align = config.getAlign(viewElement);
                    const consumables = config.getConsumables(viewElement);
                    conversionApi.consumable.consume(viewElement, consumables);
                    if (align !== localDefaultValue) {
                        return align;
                    }
                }
            }
        });
    });
    conversion.for('upcast').add(upcastTableAlignedDiv(defaultValue));
}
/**
 * Enables the `'alignment'` attribute for table.
 *
 * @param defaultValue The default alignment value.
 */ function enableAlignmentProperty(schema, conversion, defaultValue) {
    const ALIGN_VALUES_REG_EXP = /^(left|center|right)$/;
    const FLOAT_VALUES_REG_EXP = /^(left|none|right)$/;
    schema.extend('table', {
        allowAttributes: [
            'tableAlignment'
        ]
    });
    schema.setAttributeProperties('tableAlignment', {
        isFormatting: true
    });
    conversion.for('downcast').attributeToAttribute({
        model: {
            name: 'table',
            key: 'tableAlignment',
            values: [
                'left',
                'center',
                'right'
            ]
        },
        view: {
            left: {
                key: 'style',
                value: {
                    float: 'left'
                }
            },
            right: {
                key: 'style',
                value: {
                    float: 'right'
                }
            },
            center: (alignment, conversionApi, data)=>{
                const value = data.item.getAttribute('tableType') !== 'layout' ? {
                    // Model: `alignment:center` => CSS: `float:none`.
                    float: 'none'
                } : {
                    'margin-left': 'auto',
                    'margin-right': 'auto'
                };
                return {
                    key: 'style',
                    value
                };
            }
        },
        converterPriority: 'high'
    });
    conversion.for('upcast')// Support for the `float:*;` CSS definition for the table alignment.
    .attributeToAttribute({
        view: {
            name: /^(table|figure)$/,
            styles: {
                float: FLOAT_VALUES_REG_EXP
            }
        },
        model: {
            key: 'tableAlignment',
            value: (viewElement, conversionApi, data)=>{
                // Ignore other figure elements.
                if (viewElement.name == 'figure' && !viewElement.hasClass('table')) {
                    return;
                }
                const localDefaultValue = getDefaultValueAdjusted(defaultValue, '', data);
                let align = viewElement.getStyle('float');
                // CSS: `float:none` => Model: `alignment:center`.
                if (align === 'none') {
                    align = 'center';
                }
                if (align !== localDefaultValue) {
                    return align;
                }
                // Consume the style even if not applied to the element so it won't be processed by other converters.
                conversionApi.consumable.consume(viewElement, {
                    styles: 'float'
                });
            }
        }
    })// Support for the `margin-left:auto; margin-right:auto;` CSS definition for the table alignment.
    .attributeToAttribute({
        view: {
            name: /^(table|figure)$/,
            styles: {
                'margin-left': 'auto',
                'margin-right': 'auto'
            }
        },
        model: {
            key: 'tableAlignment',
            value: (viewElement, conversionApi, data)=>{
                // Ignore other figure elements.
                if (viewElement.name == 'figure' && !viewElement.hasClass('table')) {
                    return;
                }
                const localDefaultValue = getDefaultValueAdjusted(defaultValue, '', data);
                const align = 'center';
                if (align !== localDefaultValue) {
                    return align;
                }
                // Consume the styles even if not applied to the element so it won't be processed by other converters.
                conversionApi.consumable.consume(viewElement, {
                    styles: [
                        'margin-left',
                        'margin-right'
                    ]
                });
            }
        }
    })// Support for the `align` attribute as the backward compatibility while pasting from other sources.
    .attributeToAttribute({
        view: {
            name: 'table',
            attributes: {
                align: ALIGN_VALUES_REG_EXP
            }
        },
        model: {
            key: 'tableAlignment',
            value: (viewElement, conversionApi, data)=>{
                const localDefaultValue = getDefaultValueAdjusted(defaultValue, '', data);
                const align = viewElement.getAttribute('align');
                if (align !== localDefaultValue) {
                    return align;
                }
                // Consume the attribute even if not applied to the element so it won't be processed by other converters.
                conversionApi.consumable.consume(viewElement, {
                    attributes: 'align'
                });
            }
        }
    });
}
/**
 * Returns a function that converts the table view representation:
 *
 * ```html
 * <div align="right"><table>...</table></div>
 * <!-- or -->
 * <div align="center"><table>...</table></div>
 * <!-- or -->
 * <div align="left"><table>...</table></div>
 * ```
 *
 * to the model representation:
 *
 * ```xml
 * <table tableAlignment="right|center|left"></table>
 * ```
 *
 * @internal
 */ function upcastTableAlignedDiv(defaultValue) {
    return (dispatcher)=>{
        dispatcher.on('element:div', (evt, data, conversionApi)=>{
            // Do not convert if this is not a "table wrapped in div with align attribute".
            if (!conversionApi.consumable.test(data.viewItem, {
                name: true,
                attributes: 'align'
            })) {
                return;
            }
            // Find a table element inside the div element.
            const viewTable = getViewTableFromWrapper(data.viewItem);
            // Do not convert if table element is absent or was already converted.
            if (!viewTable || !conversionApi.consumable.test(viewTable, {
                name: true
            })) {
                return;
            }
            // Consume the div to prevent other converters from processing it again.
            conversionApi.consumable.consume(data.viewItem, {
                name: true,
                attributes: 'align'
            });
            // Convert view table to model table.
            const conversionResult = conversionApi.convertItem(viewTable, data.modelCursor);
            // Get table element from conversion result.
            const modelTable = first(conversionResult.modelRange.getItems());
            // When table wasn't successfully converted then finish conversion.
            if (!modelTable || !modelTable.is('element', 'table')) {
                // Revert consumed div so other features can convert it.
                conversionApi.consumable.revert(data.viewItem, {
                    name: true,
                    attributes: 'align'
                });
                // If anyway some table content was converted, we have to pass the model range and cursor.
                if (conversionResult.modelRange && !conversionResult.modelRange.isCollapsed) {
                    data.modelRange = conversionResult.modelRange;
                    data.modelCursor = conversionResult.modelCursor;
                }
                return;
            }
            const alignAttributeFromDiv = data.viewItem.getAttribute('align');
            const alignAttributeFromTable = viewTable.getAttribute('align');
            const localDefaultValue = getDefaultValueAdjusted(defaultValue, '', data);
            const align = convertToTableAlignment(alignAttributeFromDiv, alignAttributeFromTable, localDefaultValue);
            if (align) {
                conversionApi.writer.setAttribute('tableAlignment', align, modelTable);
            }
            conversionApi.convertChildren(data.viewItem, conversionApi.writer.createPositionAt(modelTable, 'end'));
            conversionApi.updateConversionResult(modelTable, data);
        });
    };
}
/**
 * Converts div `align` and table `align` attributes to the model `tableAlignment` attribute.
 *
 * @param divAlign The value of the div `align` attribute.
 * @param tableAlign The value of the table `align` attribute.
 * @param defaultValue The default alignment value.
 * @returns The model `tableAlignment` value or `undefined` if no conversion is needed.
 */ function convertToTableAlignment(divAlign, tableAlign, defaultValue) {
    if (divAlign) {
        switch(divAlign){
            case 'right':
                if (tableAlign === 'right') {
                    return 'right';
                } else if (tableAlign === 'left') {
                    return 'left';
                } else {
                    return 'blockRight';
                }
            case 'center':
                return 'center';
            case 'left':
                return tableAlign === undefined ? 'blockLeft' : 'left';
            default:
                return defaultValue;
        }
    }
    return undefined;
}
/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */ function enableProperty(schema, conversion, options) {
    const { modelAttribute } = options;
    schema.extend('table', {
        allowAttributes: [
            modelAttribute
        ]
    });
    schema.setAttributeProperties(modelAttribute, {
        isFormatting: true
    });
    upcastStyleToAttribute(conversion, {
        viewElement: 'table',
        ...options
    });
    downcastTableAttribute(conversion, options);
}
/**
 * Enables conversion for an attribute for simple view (figure) to model (table) mappings.
 */ function enableTableToFigureProperty(schema, conversion, options) {
    const { modelAttribute } = options;
    schema.extend('table', {
        allowAttributes: [
            modelAttribute
        ]
    });
    schema.setAttributeProperties(modelAttribute, {
        isFormatting: true
    });
    upcastStyleToAttribute(conversion, {
        viewElement: /^(table|figure)$/,
        shouldUpcast: (viewElement)=>!(viewElement.name == 'table' && viewElement.parent.name == 'figure' || viewElement.name == 'figure' && !viewElement.hasClass('table')),
        ...options
    });
    downcastAttributeToStyle(conversion, {
        modelElement: 'table',
        ...options
    });
}
/**
 * Checks whether a given figure element should be ignored when upcasting table properties.
 */ function isNonTableFigureElement(viewElement) {
    return viewElement.name == 'figure' && !viewElement.hasClass('table');
}

/**
 * The class representing a table properties form, allowing users to customize
 * certain style aspects of a table, for instance, border, background color, alignment, etc..
 */ class TablePropertiesView extends View {
    /**
	 * Options passed to the view. See {@link #constructor} to learn more.
	 */ options;
    /**
	 * Tracks information about the DOM focus in the form.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * A collection of child views in the form.
	 */ children;
    /**
	 * A dropdown that allows selecting the style of the table border.
	 */ borderStyleDropdown;
    /**
	 * An input that allows specifying the width of the table border.
	 */ borderWidthInput;
    /**
	 * An input that allows specifying the color of the table border.
	 */ borderColorInput;
    /**
	 * An input that allows specifying the table background color.
	 */ backgroundInput;
    /**
	 * An input that allows specifying the table width.
	 */ widthInput;
    /**
	 * An input that allows specifying the table height.
	 */ heightInput;
    /**
	 * A toolbar with buttons that allow changing the alignment of an entire table.
	 */ alignmentToolbar;
    /**
	 * The "Save" button view.
	 */ saveButtonView;
    /**
	 * The "Cancel" button view.
	 */ cancelButtonView;
    /**
	 * A collection of views that can be focused in the form.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param options Additional configuration of the view.
	 */ constructor(locale, options){
        super(locale);
        this.set({
            borderStyle: '',
            borderWidth: '',
            borderColor: '',
            backgroundColor: '',
            width: '',
            height: '',
            alignment: ''
        });
        this.options = options;
        const { borderStyleDropdown, borderWidthInput, borderColorInput, borderRowLabel } = this._createBorderFields();
        const { backgroundRowLabel, backgroundInput } = this._createBackgroundFields();
        const { widthInput, operatorLabel, heightInput, dimensionsLabel } = this._createDimensionFields();
        const { alignmentToolbar, alignmentLabel } = this._createAlignmentFields();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.children = this.createCollection();
        this.borderStyleDropdown = borderStyleDropdown;
        this.borderWidthInput = borderWidthInput;
        this.borderColorInput = borderColorInput;
        this.backgroundInput = backgroundInput;
        this.widthInput = widthInput;
        this.heightInput = heightInput;
        this.alignmentToolbar = alignmentToolbar;
        // Defer creating to make sure other fields are present and the Save button can
        // bind its #isEnabled to their error messages so there's no way to save unless all
        // fields are valid.
        const { saveButtonView, cancelButtonView } = this._createActionButtons();
        this.saveButtonView = saveButtonView;
        this.cancelButtonView = cancelButtonView;
        this._focusables = new ViewCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        // Form header.
        this.children.add(new FormHeaderView(locale, {
            label: this.t('Table properties')
        }));
        // Border row.
        this.children.add(new FormRowView(locale, {
            labelView: borderRowLabel,
            children: [
                borderRowLabel,
                borderStyleDropdown,
                borderColorInput,
                borderWidthInput
            ],
            class: 'ck-table-form__border-row'
        }));
        // Background row.
        this.children.add(new FormRowView(locale, {
            labelView: backgroundRowLabel,
            children: [
                backgroundRowLabel,
                backgroundInput
            ],
            class: 'ck-table-form__background-row'
        }));
        this.children.add(new FormRowView(locale, {
            children: [
                // Dimensions row.
                new FormRowView(locale, {
                    labelView: dimensionsLabel,
                    children: [
                        dimensionsLabel,
                        widthInput,
                        operatorLabel,
                        heightInput
                    ],
                    class: 'ck-table-form__dimensions-row'
                }),
                // Alignment row.
                new FormRowView(locale, {
                    labelView: alignmentLabel,
                    children: [
                        alignmentLabel,
                        alignmentToolbar
                    ],
                    class: 'ck-table-properties-form__alignment-row'
                })
            ]
        }));
        // Action row.
        this.children.add(new FormRowView(locale, {
            children: [
                this.saveButtonView,
                this.cancelButtonView
            ],
            class: 'ck-table-form__action-row'
        }));
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-table-form',
                    'ck-table-properties-form'
                ],
                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        // Enable the "submit" event for this view. It can be triggered by the #saveButtonView
        // which is of the "submit" DOM "type".
        submitHandler({
            view: this
        });
        // Maintain continuous focus cycling over views that have focusable children and focus cyclers themselves.
        [
            this.borderColorInput,
            this.backgroundInput
        ].forEach((view)=>{
            this._focusCycler.chain(view.fieldView.focusCycler);
        });
        [
            this.borderStyleDropdown,
            this.borderColorInput,
            this.borderWidthInput,
            this.backgroundInput,
            this.widthInput,
            this.heightInput,
            this.alignmentToolbar,
            this.saveButtonView,
            this.cancelButtonView
        ].forEach((view)=>{
            // Register the view as focusable.
            this._focusables.add(view);
            // Register the view in the focus tracker.
            this.focusTracker.add(view.element);
        });
        // Mainly for closing using "Esc" and navigation using "Tab".
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the fist focusable field in the form.
	 */ focus() {
        this._focusCycler.focusFirst();
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #borderStyleDropdown},
	 * * {@link #borderWidthInput},
	 * * {@link #borderColorInput}.
	 */ _createBorderFields() {
        const defaultTableProperties = this.options.defaultTableProperties;
        const defaultBorder = {
            style: defaultTableProperties.borderStyle,
            width: defaultTableProperties.borderWidth,
            color: defaultTableProperties.borderColor
        };
        const colorInputCreator = getLabeledColorInputCreator$1({
            colorConfig: this.options.borderColors,
            columns: 5,
            defaultColorValue: defaultBorder.color,
            colorPickerConfig: this.options.colorPickerConfig
        });
        const locale = this.locale;
        const t = this.t;
        const accessibleLabel = t('Style');
        // -- Group label ---------------------------------------------
        const borderRowLabel = new LabelView(locale);
        borderRowLabel.text = t('Border');
        // -- Style ---------------------------------------------------
        const styleLabels = getBorderStyleLabels$1(t);
        const borderStyleDropdown = new LabeledFieldView(locale, createLabeledDropdown);
        borderStyleDropdown.set({
            label: accessibleLabel,
            class: 'ck-table-form__border-style'
        });
        borderStyleDropdown.fieldView.buttonView.set({
            ariaLabel: accessibleLabel,
            ariaLabelledBy: undefined,
            isOn: false,
            withText: true,
            tooltip: accessibleLabel
        });
        borderStyleDropdown.fieldView.buttonView.bind('label').to(this, 'borderStyle', (value)=>{
            return styleLabels[value ? value : 'none'];
        });
        borderStyleDropdown.fieldView.on('execute', (evt)=>{
            this.borderStyle = evt.source._borderStyleValue;
        });
        borderStyleDropdown.bind('isEmpty').to(this, 'borderStyle', (value)=>!value);
        addListToDropdown(borderStyleDropdown.fieldView, getBorderStyleDefinitions$1(this, defaultBorder.style), {
            role: 'menu',
            ariaLabel: accessibleLabel
        });
        // -- Width ---------------------------------------------------
        const borderWidthInput = new LabeledFieldView(locale, createLabeledInputText);
        borderWidthInput.set({
            label: t('Width'),
            class: 'ck-table-form__border-width'
        });
        borderWidthInput.fieldView.bind('value').to(this, 'borderWidth');
        borderWidthInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet$2);
        borderWidthInput.fieldView.on('input', ()=>{
            this.borderWidth = borderWidthInput.fieldView.element.value;
        });
        // -- Color ---------------------------------------------------
        const borderColorInput = new LabeledFieldView(locale, colorInputCreator);
        borderColorInput.set({
            label: t('Color'),
            class: 'ck-table-form__border-color'
        });
        borderColorInput.fieldView.bind('value').to(this, 'borderColor');
        borderColorInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet$2);
        borderColorInput.fieldView.on('input', ()=>{
            this.borderColor = borderColorInput.fieldView.value;
        });
        // Reset the border color and width fields depending on the `border-style` value.
        this.on('change:borderStyle', (evt, name, newValue, oldValue)=>{
            // When removing the border (`border-style:none`), clear the remaining `border-*` properties.
            // See: https://github.com/ckeditor/ckeditor5/issues/6227.
            if (!isBorderStyleSet$2(newValue)) {
                this.borderColor = '';
                this.borderWidth = '';
            }
            // When setting the `border-style` from `none`, set the default `border-color` and `border-width` properties.
            if (!isBorderStyleSet$2(oldValue)) {
                this.borderColor = defaultBorder.color;
                this.borderWidth = defaultBorder.width;
            }
        });
        return {
            borderRowLabel,
            borderStyleDropdown,
            borderColorInput,
            borderWidthInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #backgroundInput}.
	 */ _createBackgroundFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Group label ---------------------------------------------
        const backgroundRowLabel = new LabelView(locale);
        backgroundRowLabel.text = t('Background');
        // -- Background color input -----------------------------------
        const backgroundInputCreator = getLabeledColorInputCreator$1({
            colorConfig: this.options.backgroundColors,
            columns: 5,
            defaultColorValue: this.options.defaultTableProperties.backgroundColor,
            colorPickerConfig: this.options.colorPickerConfig
        });
        const backgroundInput = new LabeledFieldView(locale, backgroundInputCreator);
        backgroundInput.set({
            label: t('Color'),
            class: 'ck-table-properties-form__background'
        });
        backgroundInput.fieldView.bind('value').to(this, 'backgroundColor');
        backgroundInput.fieldView.on('input', ()=>{
            this.backgroundColor = backgroundInput.fieldView.value;
        });
        return {
            backgroundRowLabel,
            backgroundInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #widthInput},
	 * * {@link #heightInput}.
	 */ _createDimensionFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Label ---------------------------------------------------
        const dimensionsLabel = new LabelView(locale);
        dimensionsLabel.text = t('Dimensions');
        // -- Width ---------------------------------------------------
        const widthInput = new LabeledFieldView(locale, createLabeledInputText);
        widthInput.set({
            label: t('Width'),
            class: 'ck-table-form__dimensions-row__width'
        });
        widthInput.fieldView.bind('value').to(this, 'width');
        widthInput.fieldView.on('input', ()=>{
            this.width = widthInput.fieldView.element.value;
        });
        // -- Operator ---------------------------------------------------
        const operatorLabel = new View(locale);
        operatorLabel.setTemplate({
            tag: 'span',
            attributes: {
                class: [
                    'ck-table-form__dimension-operator'
                ]
            },
            children: [
                {
                    text: '×'
                }
            ]
        });
        // -- Height ---------------------------------------------------
        const heightInput = new LabeledFieldView(locale, createLabeledInputText);
        heightInput.set({
            label: t('Height'),
            class: 'ck-table-form__dimensions-row__height'
        });
        heightInput.fieldView.bind('value').to(this, 'height');
        heightInput.fieldView.on('input', ()=>{
            this.height = heightInput.fieldView.element.value;
        });
        return {
            dimensionsLabel,
            widthInput,
            operatorLabel,
            heightInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #alignmentToolbar}.
	 */ _createAlignmentFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Label ---------------------------------------------------
        const alignmentLabel = new LabelView(locale);
        alignmentLabel.text = t('Alignment');
        // -- Toolbar ---------------------------------------------------
        const alignmentToolbar = new ToolbarView(locale);
        alignmentToolbar.set({
            role: 'radiogroup',
            isCompact: true,
            ariaLabel: t('Table alignment toolbar')
        });
        fillToolbar$1({
            view: this,
            icons: {
                left: IconObjectInlineLeft,
                center: IconObjectCenter,
                right: IconObjectInlineRight
            },
            toolbar: alignmentToolbar,
            labels: this._alignmentLabels,
            propertyName: 'alignment',
            defaultValue: this.options.defaultTableProperties.alignment
        });
        return {
            alignmentLabel,
            alignmentToolbar
        };
    }
    /**
	 * Creates the following form controls:
	 *
	 * * {@link #saveButtonView},
	 * * {@link #cancelButtonView}.
	 */ _createActionButtons() {
        const locale = this.locale;
        const t = this.t;
        const saveButtonView = new ButtonView(locale);
        const cancelButtonView = new ButtonView(locale);
        const fieldsThatShouldValidateToSave = [
            this.borderWidthInput,
            this.borderColorInput,
            this.backgroundInput,
            this.widthInput,
            this.heightInput
        ];
        saveButtonView.set({
            label: t('Save'),
            icon: IconCheck,
            class: 'ck-button-save',
            type: 'submit',
            withText: true
        });
        saveButtonView.bind('isEnabled').toMany(fieldsThatShouldValidateToSave, 'errorText', (...errorTexts)=>{
            return errorTexts.every((errorText)=>!errorText);
        });
        cancelButtonView.set({
            label: t('Cancel'),
            icon: IconCancel,
            class: 'ck-button-cancel',
            withText: true
        });
        cancelButtonView.delegate('execute').to(this, 'cancel');
        return {
            saveButtonView,
            cancelButtonView
        };
    }
    /**
	 * Provides localized labels for {@link #alignmentToolbar} buttons.
	 */ get _alignmentLabels() {
        const locale = this.locale;
        const t = this.t;
        const left = t('Align table to the left');
        const center = t('Center table');
        const right = t('Align table to the right');
        // Returns object with a proper order of labels.
        if (locale.uiLanguageDirection === 'rtl') {
            return {
                right,
                center,
                left
            };
        } else {
            return {
                left,
                center,
                right
            };
        }
    }
}
function isBorderStyleSet$2(value) {
    return value !== 'none';
}

const ERROR_TEXT_TIMEOUT$2 = 500;
// Map of view properties and related commands.
const propertyToCommandMap$2 = {
    borderStyle: 'tableBorderStyle',
    borderColor: 'tableBorderColor',
    borderWidth: 'tableBorderWidth',
    backgroundColor: 'tableBackgroundColor',
    width: 'tableWidth',
    height: 'tableHeight',
    alignment: 'tableAlignment'
};
/**
 * The table properties UI plugin. It introduces the `'tableProperties'` button
 * that opens a form allowing to specify visual styling of an entire table.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */ class TablePropertiesUI extends Plugin {
    /**
	 * The default table properties.
	 */ _defaultContentTableProperties;
    /**
	 * The default layout table properties.
	 */ _defaultLayoutTableProperties;
    /**
	 * The contextual balloon plugin instance.
	 */ _balloon;
    /**
	 * The properties form view displayed inside the balloon.
	 */ view = null;
    /**
	 * The properties form view displayed inside the balloon (content table).
	 */ _viewWithContentTableDefaults = null;
    /**
	 * The properties form view displayed inside the balloon (layout table).
	 */ _viewWithLayoutTableDefaults = null;
    /**
	 * The batch used to undo all changes made by the form (which are live, as the user types)
	 * when "Cancel" was pressed. Each time the view is shown, a new batch is created.
	 */ _undoStepBatch;
    /**
	 * Flag used to indicate whether view is ready to execute update commands
	 * (it finished loading initial data).
	 */ _isReady;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ContextualBalloon
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TablePropertiesUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('table.tableProperties', {
            borderColors: defaultColors,
            backgroundColors: defaultColors
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        this._defaultContentTableProperties = getNormalizedDefaultTableProperties(editor.config.get('table.tableProperties.defaultProperties'), {
            includeAlignmentProperty: true
        });
        this._defaultLayoutTableProperties = getNormalizedDefaultProperties();
        this._balloon = editor.plugins.get(ContextualBalloon);
        editor.ui.componentFactory.add('tableProperties', ()=>this._createTablePropertiesButton());
    }
    /**
	 * Creates the table properties button.
	 *
	 * @internal
	 */ _createTablePropertiesButton() {
        const editor = this.editor;
        const t = editor.t;
        const view = new ButtonView(editor.locale);
        view.set({
            label: t('Table properties'),
            icon: IconTableProperties,
            tooltip: true
        });
        this.listenTo(view, 'execute', ()=>this._showView());
        const commands = Object.values(propertyToCommandMap$2).map((commandName)=>editor.commands.get(commandName));
        view.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>areEnabled.some((isCommandEnabled)=>isCommandEnabled));
        return view;
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed.
        // See https://github.com/ckeditor/ckeditor5/issues/1341.
        if (this.view) {
            this.view.destroy();
        }
    }
    /**
	 * Creates the {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView} instance.
	 *
	 * @returns The table properties form view instance.
	 */ _createPropertiesView(defaultTableProperties) {
        const editor = this.editor;
        const config = editor.config.get('table.tableProperties');
        const borderColorsConfig = normalizeColorOptions(config.borderColors);
        const localizedBorderColors = getLocalizedColorOptions(editor.locale, borderColorsConfig);
        const backgroundColorsConfig = normalizeColorOptions(config.backgroundColors);
        const localizedBackgroundColors = getLocalizedColorOptions(editor.locale, backgroundColorsConfig);
        const hasColorPicker = config.colorPicker !== false;
        const view = new TablePropertiesView(editor.locale, {
            borderColors: localizedBorderColors,
            backgroundColors: localizedBackgroundColors,
            defaultTableProperties,
            colorPickerConfig: hasColorPicker ? config.colorPicker || {} : false
        });
        const t = editor.t;
        // Render the view so its #element is available for the clickOutsideHandler.
        view.render();
        this.listenTo(view, 'submit', ()=>{
            this._hideView();
        });
        this.listenTo(view, 'cancel', ()=>{
            // https://github.com/ckeditor/ckeditor5/issues/6180
            if (this._undoStepBatch.operations.length) {
                editor.execute('undo', this._undoStepBatch);
            }
            this._hideView();
        });
        // Close the balloon on Esc key press.
        view.keystrokes.set('Esc', (data, cancel)=>{
            this._hideView();
            cancel();
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: view,
            activator: ()=>this._isViewInBalloon,
            contextElements: [
                this._balloon.view.element
            ],
            callback: ()=>this._hideView()
        });
        const colorErrorText = getLocalizedColorErrorText(t);
        const lengthErrorText = getLocalizedLengthErrorText(t);
        // Create the "UI -> editor data" binding.
        // These listeners update the editor data (via table commands) when any observable
        // property of the view has changed. They also validate the value and display errors in the UI
        // when necessary. This makes the view live, which means the changes are
        // visible in the editing as soon as the user types or changes fields' values.
        view.on('change:borderStyle', this._getPropertyChangeCallback('tableBorderStyle'));
        view.on('change:borderColor', this._getValidatedPropertyChangeCallback({
            viewField: view.borderColorInput,
            commandName: 'tableBorderColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:borderWidth', this._getValidatedPropertyChangeCallback({
            viewField: view.borderWidthInput,
            commandName: 'tableBorderWidth',
            errorText: lengthErrorText,
            validator: lineWidthFieldValidator
        }));
        view.on('change:backgroundColor', this._getValidatedPropertyChangeCallback({
            viewField: view.backgroundInput,
            commandName: 'tableBackgroundColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:width', this._getValidatedPropertyChangeCallback({
            viewField: view.widthInput,
            commandName: 'tableWidth',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:height', this._getValidatedPropertyChangeCallback({
            viewField: view.heightInput,
            commandName: 'tableHeight',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:alignment', this._getPropertyChangeCallback('tableAlignment'));
        return view;
    }
    /**
	 * In this method the "editor data -> UI" binding is happening.
	 *
	 * When executed, this method obtains selected table property values from various table commands
	 * and passes them to the {@link #view}.
	 *
	 * This way, the UI stays up–to–date with the editor data.
	 */ _fillViewFormFromCommandValues() {
        const commands = this.editor.commands;
        const borderStyleCommand = commands.get('tableBorderStyle');
        Object.entries(propertyToCommandMap$2).map(([property, commandName])=>{
            const propertyKey = property;
            const defaultValue = this.view === this._viewWithContentTableDefaults ? this._defaultContentTableProperties[propertyKey] || '' : this._defaultLayoutTableProperties[propertyKey] || '';
            return [
                propertyKey,
                commands.get(commandName).value || defaultValue
            ];
        }).forEach(([property, value])=>{
            // Do not set the `border-color` and `border-width` fields if `border-style:none`.
            if ((property === 'borderColor' || property === 'borderWidth') && borderStyleCommand.value === 'none') {
                return;
            }
            this.view.set(property, value);
        });
        this._isReady = true;
    }
    /**
	 * Shows the {@link #view} in the {@link #_balloon}.
	 *
	 * **Note**: Each time a view is shown, the new {@link #_undoStepBatch} is created that contains
	 * all changes made to the document when the view is visible, allowing a single undo step
	 * for all of them.
	 */ _showView() {
        const editor = this.editor;
        const viewTable = getSelectionAffectedTableWidget(editor.editing.view.document.selection);
        const modelTable = viewTable && editor.editing.mapper.toModelElement(viewTable);
        const useDefaults = !modelTable || modelTable.getAttribute('tableType') !== 'layout';
        if (useDefaults && !this._viewWithContentTableDefaults) {
            this._viewWithContentTableDefaults = this._createPropertiesView(this._defaultContentTableProperties);
        } else if (!useDefaults && !this._viewWithLayoutTableDefaults) {
            this._viewWithLayoutTableDefaults = this._createPropertiesView(this._defaultLayoutTableProperties);
        }
        this.view = useDefaults ? this._viewWithContentTableDefaults : this._viewWithLayoutTableDefaults;
        this.listenTo(editor.ui, 'update', ()=>{
            this._updateView();
        });
        // Update the view with the model values.
        this._fillViewFormFromCommandValues();
        this._balloon.add({
            view: this.view,
            position: getBalloonTablePositionData(editor)
        });
        // Create a new batch. Clicking "Cancel" will undo this batch.
        this._undoStepBatch = editor.model.createBatch();
        // Basic a11y.
        this.view.focus();
    }
    /**
	 * Removes the {@link #view} from the {@link #_balloon}.
	 */ _hideView() {
        const editor = this.editor;
        this.stopListening(editor.ui, 'update');
        this._isReady = false;
        // Blur any input element before removing it from DOM to prevent issues in some browsers.
        // See https://github.com/ckeditor/ckeditor5/issues/1501.
        this.view.saveButtonView.focus();
        this._balloon.remove(this.view);
        // Make sure the focus is not lost in the process by putting it directly
        // into the editing view.
        this.editor.editing.view.focus();
    }
    /**
	 * Repositions the {@link #_balloon} or hides the {@link #view} if a table is no longer selected.
	 */ _updateView() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        if (!getSelectionAffectedTableWidget(viewDocument.selection)) {
            this._hideView();
        } else if (this._isViewVisible) {
            repositionContextualBalloon(editor, 'table');
        }
    }
    /**
	 * Returns `true` when the {@link #view} is the visible in the {@link #_balloon}.
	 */ get _isViewVisible() {
        return !!this.view && this._balloon.visibleView === this.view;
    }
    /**
	 * Returns `true` when the {@link #view} is in the {@link #_balloon}.
	 */ get _isViewInBalloon() {
        return !!this.view && this._balloon.hasView(this.view);
    }
    /**
	 * Creates a callback that when executed upon {@link #view view's} property change
	 * executes a related editor command with the new property value.
	 *
	 * If new value will be set to the default value, the command will not be executed.
	 *
	 * @param commandName The command that will be executed.
	 */ _getPropertyChangeCallback(commandName) {
        return (evt, propertyName, newValue)=>{
            // Do not execute the command on initial call (opening the table properties view).
            if (!this._isReady) {
                return;
            }
            this.editor.execute(commandName, {
                value: newValue,
                batch: this._undoStepBatch
            });
        };
    }
    /**
	 * Creates a callback that when executed upon {@link #view view's} property change:
	 * * executes a related editor command with the new property value if the value is valid,
	 * * or sets the error text next to the invalid field, if the value did not pass the validation.
	 */ _getValidatedPropertyChangeCallback(options) {
        const { commandName, viewField, validator, errorText } = options;
        const setErrorTextDebounced = debounce(()=>{
            viewField.errorText = errorText;
        }, ERROR_TEXT_TIMEOUT$2);
        return (evt, propertyName, newValue)=>{
            setErrorTextDebounced.cancel();
            // Do not execute the command on initial call (opening the table properties view).
            if (!this._isReady) {
                return;
            }
            if (validator(newValue)) {
                this.editor.execute(commandName, {
                    value: newValue,
                    batch: this._undoStepBatch
                });
                viewField.errorText = null;
            } else {
                setErrorTextDebounced();
            }
        };
    }
}

/**
 * The table properties feature. Enables support for setting properties of tables (size, border, background, etc.).
 *
 * Read more in the {@glink features/tables/tables-styling Table and cell styling tools} section.
 * See also the {@link module:table/tablecellproperties~TableCellProperties} plugin.
 *
 * This is a "glue" plugin that loads the
 * {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing table properties editing feature} and
 * the {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI table properties UI feature}.
 */ class TableProperties extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableProperties';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TablePropertiesEditing,
            TablePropertiesUI
        ];
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module table/converters/table-caption-post-fixer
 */ /**
 * Injects a table caption post-fixer into the model.
 *
 * The role of the table caption post-fixer is to ensure that the table with caption have the correct structure
 * after a {@link module:engine/model/model~Model#change `change()`} block was executed.
 *
 * The correct structure means that:
 *
 * * If there are many caption model element, they are merged into one model.
 * * A final, merged caption model is placed at the end of the table.
 *
 * @internal
 */ function injectTableCaptionPostFixer(model) {
    model.document.registerPostFixer((writer)=>tableCaptionPostFixer(writer, model));
}
/**
 * The table caption post-fixer.
 */ function tableCaptionPostFixer(writer, model) {
    const changes = model.document.differ.getChanges();
    let wasFixed = false;
    for (const entry of changes){
        if (entry.type != 'insert') {
            continue;
        }
        const positionParent = entry.position.parent;
        if (positionParent.is('element', 'table') || entry.name == 'table') {
            const table = entry.name == 'table' ? entry.position.nodeAfter : positionParent;
            const captionsToMerge = Array.from(table.getChildren()).filter((child)=>child.is('element', 'caption'));
            const firstCaption = captionsToMerge.shift();
            if (!firstCaption) {
                continue;
            }
            // Move all the contents of the captions to the first one.
            for (const caption of captionsToMerge){
                writer.move(writer.createRangeIn(caption), firstCaption, 'end');
                writer.remove(caption);
            }
            // Make sure the final caption is at the end of the table.
            if (firstCaption.nextSibling) {
                writer.move(writer.createRangeOn(firstCaption), table, 'end');
                wasFixed = true;
            }
            // Do we merged captions and/or moved the single caption to the end of the table?
            wasFixed = !!captionsToMerge.length || wasFixed;
        }
    }
    return wasFixed;
}

/**
 * Checks if the provided model element is a `table`.
 *
 * @param modelElement Element to check if it is a table.
 * @internal
 */ function isTable(modelElement) {
    return !!modelElement && modelElement.is('element', 'table');
}
/**
 * Returns the caption model element from a given table element. Returns `null` if no caption is found.
 *
 * @param tableModelElement Table element in which we will try to find a caption element.
 * @internal
 */ function getCaptionFromTableModelElement(tableModelElement) {
    for (const node of tableModelElement.getChildren()){
        if (node.is('element', 'caption')) {
            return node;
        }
    }
    return null;
}
/**
 * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
 *
 * @param selection The selection checked for caption presence.
 * @internal
 */ function getCaptionFromModelSelection(selection) {
    const tableElement = getSelectionAffectedTable(selection);
    if (!tableElement) {
        return null;
    }
    return getCaptionFromTableModelElement(tableElement);
}
/**
 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a caption.
 *
 * There are two possible forms of the valid caption:
 *  - A `<figcaption>` element inside a `<figure class="table">` element.
 *  - A `<caption>` inside a <table>.
 *
 * @returns Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element cannot be matched.
 * @internal
 */ function matchTableCaptionViewElement(element) {
    const parent = element.parent;
    if (element.name == 'figcaption' && parent && parent.is('element', 'figure') && parent.hasClass('table')) {
        return {
            name: true
        };
    }
    if (element.name == 'caption' && parent && parent.is('element', 'table')) {
        return {
            name: true
        };
    }
    return null;
}

/**
 * The toggle table caption command.
 *
 * This command is registered by {@link module:table/tablecaption/tablecaptionediting~TableCaptionEditing} as the
 * `'toggleTableCaption'` editor command.
 *
 * Executing this command:
 *
 * * either adds or removes the table caption of a selected table (depending on whether the caption is present or not),
 * * removes the table caption if the selection is anchored in one.
 *
 * ```ts
 * // Toggle the presence of the caption.
 * editor.execute( 'toggleTableCaption' );
 * ```
 *
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using
 * the `focusCaptionOnShow` option:
 *
 * ```ts
 * editor.execute( 'toggleTableCaption', { focusCaptionOnShow: true } );
 * ```
 */ class ToggleTableCaptionCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const tableElement = getSelectionAffectedTable(editor.model.document.selection);
        this.isEnabled = !!tableElement && editor.model.schema.checkChild(tableElement, 'caption');
        if (!this.isEnabled) {
            this.value = false;
        } else {
            this.value = !!getCaptionFromTableModelElement(tableElement);
        }
    }
    /**
	 * Executes the command.
	 *
	 * ```ts
	 * editor.execute( 'toggleTableCaption' );
	 * ```
	 *
	 * @param options Options for the executed command.
	 * @param options.focusCaptionOnShow When true and the caption shows up, the selection will be moved into it straight away.
	 * @fires execute
	 */ execute({ focusCaptionOnShow = false } = {}) {
        this.editor.model.change((writer)=>{
            if (this.value) {
                this._hideTableCaption(writer);
            } else {
                this._showTableCaption(writer, focusCaptionOnShow);
            }
        });
    }
    /**
	 * Shows the table caption. Also:
	 *
	 * * it attempts to restore the caption content from the `TableCaptionEditing` caption registry,
	 * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
	 *
	 * @param focusCaptionOnShow Default focus behavior when showing the caption.
	 */ _showTableCaption(writer, focusCaptionOnShow) {
        const model = this.editor.model;
        const tableElement = getSelectionAffectedTable(model.document.selection);
        const tableCaptionEditing = this.editor.plugins.get('TableCaptionEditing');
        const savedCaptionElement = tableCaptionEditing._getSavedCaption(tableElement);
        // Try restoring the caption from the TableCaptionEditing plugin storage.
        const newCaptionElement = savedCaptionElement || writer.createElement('caption');
        model.insertContent(newCaptionElement, tableElement, 'end');
        if (focusCaptionOnShow) {
            writer.setSelection(newCaptionElement, 'in');
        }
    }
    /**
	 * Hides the caption of a selected table (or an table caption the selection is anchored to).
	 *
	 * The content of the caption is stored in the `TableCaptionEditing` caption registry to make this
	 * a reversible action.
	 */ _hideTableCaption(writer) {
        const model = this.editor.model;
        const tableElement = getSelectionAffectedTable(model.document.selection);
        const tableCaptionEditing = this.editor.plugins.get('TableCaptionEditing');
        const captionElement = getCaptionFromTableModelElement(tableElement);
        // Store the caption content so it can be restored quickly if the user changes their mind.
        tableCaptionEditing._saveCaption(tableElement, captionElement);
        model.deleteContent(writer.createSelection(captionElement, 'on'));
    }
}

/**
 * The table caption editing plugin.
 */ class TableCaptionEditing extends Plugin {
    /**
	 * A map that keeps saved JSONified table captions and table model elements they are
	 * associated with.
	 *
	 * To learn more about this system, see {@link #_saveCaption}.
	 */ _savedCaptionsMap = new WeakMap();
    /**
	 * A map that keeps generated ids for table captions to reuse them if the same caption is rendered again.
	 */ _captionIdsMapping = new WeakMap();
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableCaptionEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const view = editor.editing.view;
        const t = editor.t;
        const useCaptionElement = editor.config.get('table.tableCaption.useCaptionElement');
        if (!schema.isRegistered('caption')) {
            schema.register('caption', {
                allowIn: 'table',
                allowContentOf: '$block',
                isLimit: true
            });
        } else {
            schema.extend('caption', {
                allowIn: 'table'
            });
        }
        editor.commands.add('toggleTableCaption', new ToggleTableCaptionCommand(this.editor));
        if (useCaptionElement) {
            const tableEditing = editor.plugins.get('TableEditing');
            tableEditing.registerAdditionalSlot({
                filter: (element)=>element.is('element', 'caption'),
                positionOffset: 'end'
            });
        }
        // View -> model converter for the data pipeline.
        editor.conversion.for('upcast').elementToElement({
            view: matchTableCaptionViewElement,
            model: 'caption'
        });
        // Model -> view converter for the data pipeline.
        editor.conversion.for('dataDowncast').elementToElement({
            model: 'caption',
            view: (modelElement, { writer })=>{
                if (!isTable(modelElement.parent)) {
                    return null;
                }
                return writer.createContainerElement(useCaptionElement ? 'caption' : 'figcaption');
            }
        });
        // Model -> view converter for the editing pipeline.
        editor.conversion.for('editingDowncast').elementToElement({
            model: 'caption',
            view: (modelElement, { writer })=>{
                if (!isTable(modelElement.parent)) {
                    return null;
                }
                const captionElement = writer.createEditableElement(useCaptionElement ? 'caption' : 'figcaption');
                writer.setCustomProperty('tableCaption', true, captionElement);
                captionElement.placeholder = t('Enter table caption');
                enableViewPlaceholder({
                    view,
                    element: captionElement,
                    keepOnFocus: true
                });
                return toWidgetEditable(captionElement, writer);
            }
        });
        editor.conversion.for('editingDowncast').add((dispatcher)=>{
            dispatcher.on('insert:table', (evt, data, { writer, mapper })=>{
                const modelTable = data.item;
                const viewFigure = mapper.toViewElement(modelTable);
                if (!viewFigure) {
                    return;
                }
                const viewTable = Array.from(viewFigure.getChildren()).find((child)=>child.is('element', 'table'));
                if (!viewTable) {
                    return;
                }
                const modelCaption = getCaptionFromTableModelElement(modelTable);
                // Remove `aria-labelledby` from the table if there is no caption.
                if (!modelCaption) {
                    writer.removeAttribute('aria-labelledby', viewTable);
                    return;
                }
                const viewCaption = mapper.toViewElement(modelCaption);
                if (!viewCaption) {
                    return;
                }
                // Try reusing the same id for the caption if it was already created for the given model caption.
                // If it was not created before, generate a new one and save it in the mapping to reuse it in the future if needed.
                let captionId;
                if (viewCaption.hasAttribute('id')) {
                    captionId = viewCaption.getAttribute('id');
                } else {
                    captionId = this._captionIdsMapping.get(modelCaption) ?? `ck-editor__caption_${uid()}`;
                }
                this._captionIdsMapping.set(modelCaption, captionId);
                writer.setAttribute('id', captionId, viewCaption);
                writer.setAttribute('aria-labelledby', captionId, viewTable);
            }, {
                priority: 'low'
            });
        });
        injectTableCaptionPostFixer(editor.model);
    }
    /**
	 * Returns the saved {@link module:engine/model/element~ModelElement#toJSON JSONified} caption
	 * of a table model element.
	 *
	 * See {@link #_saveCaption}.
	 *
	 * @internal
	 * @param tableModelElement The model element the caption should be returned for.
	 * @returns The model caption element or `null` if there is none.
	 */ _getSavedCaption(tableModelElement) {
        const jsonObject = this._savedCaptionsMap.get(tableModelElement);
        return jsonObject ? ModelElement.fromJSON(jsonObject) : null;
    }
    /**
	 * Saves a {@link module:engine/model/element~ModelElement#toJSON JSONified} caption for
	 * a table element to allow restoring it in the future.
	 *
	 * A caption is saved every time it gets hidden. The
	 * user should be able to restore it on demand.
	 *
	 * **Note**: The caption cannot be stored in the table model element attribute because,
	 * for instance, when the model state propagates to collaborators, the attribute would get
	 * lost (mainly because it does not convert to anything when the caption is hidden) and
	 * the states of collaborators' models would de-synchronize causing numerous issues.
	 *
	 * See {@link #_getSavedCaption}.
	 *
	 * @internal
	 * @param tableModelElement The model element the caption is saved for.
	 * @param caption The caption model element to be saved.
	 */ _saveCaption(tableModelElement, caption) {
        this._savedCaptionsMap.set(tableModelElement, caption.toJSON());
    }
}

/**
  * The table caption UI plugin. It introduces the `'toggleTableCaption'` UI button.
  */ class TableCaptionUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableCaptionUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const editingView = editor.editing.view;
        const t = editor.t;
        editor.ui.componentFactory.add('toggleTableCaption', (locale)=>{
            const command = editor.commands.get('toggleTableCaption');
            const view = new ButtonView(locale);
            view.set({
                icon: IconCaption,
                tooltip: true,
                isToggleable: true
            });
            view.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');
            view.bind('label').to(command, 'value', (value)=>value ? t('Toggle caption off') : t('Toggle caption on'));
            this.listenTo(view, 'execute', ()=>{
                editor.execute('toggleTableCaption', {
                    focusCaptionOnShow: true
                });
                // Scroll to the selection and highlight the caption if the caption showed up.
                if (command.value) {
                    const modelCaptionElement = getCaptionFromModelSelection(editor.model.document.selection);
                    const figcaptionElement = editor.editing.mapper.toViewElement(modelCaptionElement);
                    if (!figcaptionElement) {
                        return;
                    }
                    editingView.scrollToTheSelection();
                    editingView.change((writer)=>{
                        writer.addClass('table__caption_highlighted', figcaptionElement);
                    });
                }
                editor.editing.view.focus();
            });
            return view;
        });
    }
}

/**
 * The table caption plugin.
 */ class TableCaption extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableCaption';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            TableCaptionEditing,
            TableCaptionUI
        ];
    }
}

/**
 * Returns an object containing pairs of CSS border style values and their localized UI
 * labels. Used by {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView}
 * and {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView}.
 *
 * @internal
 * @param t The "t" function provided by the editor that is used to localize strings.
 */ function getBorderStyleLabels(t) {
    return {
        none: t('None'),
        solid: t('Solid'),
        dotted: t('Dotted'),
        dashed: t('Dashed'),
        double: t('Double'),
        groove: t('Groove'),
        ridge: t('Ridge'),
        inset: t('Inset'),
        outset: t('Outset')
    };
}
/**
 * Generates item definitions for a UI dropdown that allows changing the border style of a table or a table cell.
 *
 * @internal
 * @param defaultStyle The default border.
 */ function getBorderStyleDefinitions(view, defaultStyle) {
    const itemDefinitions = new Collection();
    const styleLabels = getBorderStyleLabels(view.t);
    for(const style in styleLabels){
        const definition = {
            type: 'button',
            model: new UIModel({
                _borderStyleValue: style,
                label: styleLabels[style],
                role: 'menuitemradio',
                withText: true
            })
        };
        if (style === 'none') {
            definition.model.bind('isOn').to(view, 'borderStyle', (value)=>{
                if (defaultStyle === 'none') {
                    return !value;
                }
                return value === style;
            });
        } else {
            definition.model.bind('isOn').to(view, 'borderStyle', (value)=>{
                return value === style;
            });
        }
        itemDefinitions.add(definition);
    }
    return itemDefinitions;
}
/**
 * A helper that fills a toolbar with buttons that:
 *
 * * have some labels,
 * * have some icons,
 * * set a certain UI view property value upon execution.
 *
 * @internal
 * @param options Configuration options
 * @param options.view The view that has the observable property.
 * @param options.icons Object with button icons.
 * @param options.toolbar The toolbar to fill with buttons.
 * @param options.labels Object with button labels.
 * @param options.propertyName The name of the observable property in the view.
 * @param options.nameToValue A function that maps a button name to a value. By default names are the same as values.
 * @param options.defaultValue Default value for the property.
 */ function fillToolbar(options) {
    const { view, icons, toolbar, labels, propertyName, nameToValue, defaultValue } = options;
    for(const name in labels){
        const button = new ButtonView(view.locale);
        button.set({
            role: 'radio',
            isToggleable: true,
            label: labels[name],
            icon: icons[name],
            tooltip: labels[name]
        });
        // If specified the `nameToValue()` callback, map the value based on the option's name.
        const buttonValue = nameToValue ? nameToValue(name) : name;
        button.bind('isOn').to(view, propertyName, (value)=>{
            // `value` comes from `view[ propertyName ]`.
            let valueToCompare = value;
            // If it's empty, and the `defaultValue` is specified, use it instead.
            if (value === '' && defaultValue) {
                valueToCompare = defaultValue;
            }
            return buttonValue === valueToCompare;
        });
        button.on('execute', ()=>{
            // Allow toggling alignment if there is no default value specified (especially for layout tables).
            if (!defaultValue && buttonValue && view[propertyName] === buttonValue) {
                view[propertyName] = undefined;
            } else {
                view[propertyName] = buttonValue;
            }
        });
        toolbar.items.add(button);
    }
}
/**
 * Returns a creator for a color input with a label.
 *
 * For given options, it returns a function that creates an instance of a
 * {@link module:table/ui/colorinputview~ColorInputView color input} logically related to
 * a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled view} in the DOM.
 *
 * The helper does the following:
 *
 * * It sets the color input `id` and `ariaDescribedById` attributes.
 * * It binds the color input `isReadOnly` to the labeled view.
 * * It binds the color input `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when the user starts typing in the color input.
 *
 * Usage:
 *
 * ```ts
 * const colorInputCreator = getLabeledColorInputCreator( {
 *   colorConfig: [ ... ],
 *   columns: 3,
 * } );
 *
 * const labeledInputView = new LabeledFieldView( locale, colorInputCreator );
 * console.log( labeledInputView.view ); // A color input instance.
 * ```
 *
 * @internal
 * @param options Color input options.
 * @param options.colorConfig The configuration of the color palette displayed in the input's dropdown.
 * @param options.columns The configuration of the number of columns the color palette consists of in the input's dropdown.
 * @param options.defaultColorValue If specified, the color input view will replace the "Remove color" button with
 * the "Restore default" button. Instead of clearing the input field, the default color value will be set.
 * @param options.colorPickerConfig The configuration of the color picker. You could disable it or define your output format.
 */ function getLabeledColorInputCreator(options) {
    return (labeledFieldView, viewUid, statusUid)=>{
        const colorInputView = new ColorInputView(labeledFieldView.locale, {
            colorDefinitions: colorConfigToColorGridDefinitions(options.colorConfig),
            columns: options.columns,
            defaultColorValue: options.defaultColorValue,
            colorPickerConfig: options.colorPickerConfig
        });
        colorInputView.inputView.set({
            id: viewUid,
            ariaDescribedById: statusUid
        });
        colorInputView.bind('isReadOnly').to(labeledFieldView, 'isEnabled', (value)=>!value);
        colorInputView.bind('hasError').to(labeledFieldView, 'errorText', (value)=>!!value);
        colorInputView.on('input', ()=>{
            // UX: Make the error text disappear and disable the error indicator as the user
            // starts fixing the errors.
            labeledFieldView.errorText = null;
        });
        labeledFieldView.bind('isEmpty', 'isFocused').to(colorInputView);
        return colorInputView;
    };
}
function colorConfigToColorGridDefinitions(colorConfig) {
    return colorConfig.map((item)=>({
            color: item.model,
            label: item.label,
            options: {
                hasBorder: item.hasBorder
            }
        }));
}

/**
 * The class representing a table properties form, allowing users to customize
 * certain style aspects of a table, for instance, border, background color, alignment, etc..
 */ class TablePropertiesViewExperimental extends View {
    /**
	 * Options passed to the view. See {@link #constructor} to learn more.
	 */ options;
    /**
	 * Tracks information about the DOM focus in the form.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * A collection of child views in the form.
	 */ children;
    /**
	 * A dropdown that allows selecting the style of the table border.
	 */ borderStyleDropdown;
    /**
	 * An input that allows specifying the width of the table border.
	 */ borderWidthInput;
    /**
	 * An input that allows specifying the color of the table border.
	 */ borderColorInput;
    /**
	 * An input that allows specifying the table background color.
	 */ backgroundInput;
    /**
	 * An input that allows specifying the table width.
	 */ widthInput;
    /**
	 * An input that allows specifying the table height.
	 */ heightInput;
    /**
	 * A toolbar with buttons that allow changing the alignment of an entire table.
	 */ alignmentToolbar;
    /**
	 * The "Save" button view.
	 */ saveButtonView;
    /**
	 * The "Cancel" button view.
	 */ cancelButtonView;
    /**
	 * The Back button view displayed in the header.
	 */ backButtonView;
    /**
	 * A collection of views that can be focused in the form.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param options Additional configuration of the view.
	 */ constructor(locale, options){
        super(locale);
        this.set({
            borderStyle: '',
            borderWidth: '',
            borderColor: '',
            backgroundColor: '',
            width: '',
            height: '',
            alignment: ''
        });
        this.options = options;
        const { borderStyleDropdown, borderWidthInput, borderColorInput, borderRowLabel } = this._createBorderFields();
        const { backgroundRowLabel, backgroundInput } = this._createBackgroundFields();
        const { widthInput, operatorLabel, heightInput, dimensionsLabel } = this._createDimensionFields();
        const { alignmentToolbar, alignmentLabel } = this._createAlignmentFields();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.children = this.createCollection();
        this.borderStyleDropdown = borderStyleDropdown;
        this.borderWidthInput = borderWidthInput;
        this.borderColorInput = borderColorInput;
        this.backgroundInput = backgroundInput;
        this.widthInput = widthInput;
        this.heightInput = heightInput;
        this.alignmentToolbar = alignmentToolbar;
        // Defer creating to make sure other fields are present and the Save button can
        // bind its #isEnabled to their error messages so there's no way to save unless all
        // fields are valid.
        const { saveButtonView, cancelButtonView } = this._createActionButtons();
        this.saveButtonView = saveButtonView;
        this.cancelButtonView = cancelButtonView;
        this.backButtonView = this._createBackButton();
        this._focusables = new ViewCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        // Form header.
        const headerView = new FormHeaderView(locale, {
            label: this.t('Table properties')
        });
        headerView.children.add(this.backButtonView, 0);
        this.children.add(headerView);
        // Border row.
        this.children.add(new FormRowView(locale, {
            labelView: borderRowLabel,
            children: [
                borderRowLabel,
                borderStyleDropdown,
                borderWidthInput,
                borderColorInput
            ],
            class: 'ck-table-form__border-row'
        }));
        this.children.add(new FormRowView(locale, {
            children: [
                // Dimensions row.
                new FormRowView(locale, {
                    labelView: dimensionsLabel,
                    children: [
                        dimensionsLabel,
                        widthInput,
                        operatorLabel,
                        heightInput
                    ],
                    class: 'ck-table-form__dimensions-row'
                }),
                // Background row.
                new FormRowView(locale, {
                    labelView: backgroundRowLabel,
                    children: [
                        backgroundRowLabel,
                        backgroundInput
                    ],
                    class: 'ck-table-form__background-row'
                })
            ]
        }));
        // Alignment row.
        this.children.add(new FormRowView(locale, {
            labelView: alignmentLabel,
            children: [
                alignmentLabel,
                alignmentToolbar
            ],
            class: 'ck-table-properties-form__alignment-row'
        }));
        // Action row.
        this.children.add(new FormRowView(locale, {
            children: [
                this.cancelButtonView,
                this.saveButtonView
            ],
            class: 'ck-table-form__action-row'
        }));
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-table-form',
                    'ck-table-properties-form',
                    'ck-table-properties-form_experimental'
                ],
                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        // Enable the "submit" event for this view. It can be triggered by the #saveButtonView
        // which is of the "submit" DOM "type".
        submitHandler({
            view: this
        });
        // Maintain continuous focus cycling over views that have focusable children and focus cyclers themselves.
        [
            this.borderColorInput,
            this.backgroundInput
        ].forEach((view)=>{
            this._focusCycler.chain(view.fieldView.focusCycler);
        });
        [
            this.borderStyleDropdown,
            this.borderWidthInput,
            this.borderColorInput,
            this.widthInput,
            this.heightInput,
            this.backgroundInput,
            this.alignmentToolbar,
            this.cancelButtonView,
            this.saveButtonView,
            this.backButtonView
        ].forEach((view)=>{
            // Register the view as focusable.
            this._focusables.add(view);
            // Register the view in the focus tracker.
            this.focusTracker.add(view.element);
        });
        // Mainly for closing using "Esc" and navigation using "Tab".
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the fist focusable field in the form.
	 */ focus() {
        this._focusCycler.focusFirst();
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #borderStyleDropdown},
	 * * {@link #borderWidthInput},
	 * * {@link #borderColorInput}.
	 */ _createBorderFields() {
        const defaultTableProperties = this.options.defaultTableProperties;
        const defaultBorder = {
            style: defaultTableProperties.borderStyle,
            width: defaultTableProperties.borderWidth,
            color: defaultTableProperties.borderColor
        };
        const colorInputCreator = getLabeledColorInputCreator({
            colorConfig: this.options.borderColors,
            columns: 5,
            defaultColorValue: defaultBorder.color,
            colorPickerConfig: this.options.colorPickerConfig
        });
        const locale = this.locale;
        const t = this.t;
        const accessibleLabel = t('Style');
        // -- Group label ---------------------------------------------
        const borderRowLabel = new LabelView(locale);
        borderRowLabel.text = t('Border');
        // -- Style ---------------------------------------------------
        const styleLabels = getBorderStyleLabels(t);
        const borderStyleDropdown = new LabeledFieldView(locale, createLabeledDropdown);
        borderStyleDropdown.set({
            label: accessibleLabel,
            class: 'ck-table-form__border-style'
        });
        borderStyleDropdown.fieldView.buttonView.set({
            ariaLabel: accessibleLabel,
            ariaLabelledBy: undefined,
            isOn: false,
            withText: true,
            tooltip: accessibleLabel
        });
        borderStyleDropdown.fieldView.buttonView.bind('label').to(this, 'borderStyle', (value)=>{
            return styleLabels[value ? value : 'none'];
        });
        borderStyleDropdown.fieldView.on('execute', (evt)=>{
            this.borderStyle = evt.source._borderStyleValue;
        });
        borderStyleDropdown.bind('isEmpty').to(this, 'borderStyle', (value)=>!value);
        addListToDropdown(borderStyleDropdown.fieldView, getBorderStyleDefinitions(this, defaultBorder.style), {
            role: 'menu',
            ariaLabel: accessibleLabel
        });
        // -- Width ---------------------------------------------------
        const borderWidthInput = new LabeledFieldView(locale, createLabeledInputText);
        borderWidthInput.set({
            label: t('Width'),
            class: 'ck-table-form__border-width'
        });
        borderWidthInput.fieldView.bind('value').to(this, 'borderWidth');
        borderWidthInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet$1);
        borderWidthInput.fieldView.on('input', ()=>{
            this.borderWidth = borderWidthInput.fieldView.element.value;
        });
        // -- Color ---------------------------------------------------
        const borderColorInput = new LabeledFieldView(locale, colorInputCreator);
        borderColorInput.set({
            label: t('Color'),
            class: 'ck-table-form__border-color'
        });
        borderColorInput.fieldView.bind('value').to(this, 'borderColor');
        borderColorInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet$1);
        borderColorInput.fieldView.on('input', ()=>{
            this.borderColor = borderColorInput.fieldView.value;
        });
        // Reset the border color and width fields depending on the `border-style` value.
        this.on('change:borderStyle', (evt, name, newValue, oldValue)=>{
            // When removing the border (`border-style:none`), clear the remaining `border-*` properties.
            // See: https://github.com/ckeditor/ckeditor5/issues/6227.
            if (!isBorderStyleSet$1(newValue)) {
                this.borderColor = '';
                this.borderWidth = '';
            }
            // When setting the `border-style` from `none`, set the default `border-color` and `border-width` properties.
            if (!isBorderStyleSet$1(oldValue)) {
                this.borderColor = defaultBorder.color;
                this.borderWidth = defaultBorder.width;
            }
        });
        return {
            borderRowLabel,
            borderStyleDropdown,
            borderColorInput,
            borderWidthInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #backgroundInput}.
	 */ _createBackgroundFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Group label ---------------------------------------------
        const backgroundRowLabel = new LabelView(locale);
        backgroundRowLabel.text = t('Background');
        // -- Background color input -----------------------------------
        const backgroundInputCreator = getLabeledColorInputCreator({
            colorConfig: this.options.backgroundColors,
            columns: 5,
            defaultColorValue: this.options.defaultTableProperties.backgroundColor,
            colorPickerConfig: this.options.colorPickerConfig
        });
        const backgroundInput = new LabeledFieldView(locale, backgroundInputCreator);
        backgroundInput.set({
            label: t('Color'),
            class: 'ck-table-properties-form__background'
        });
        backgroundInput.fieldView.bind('value').to(this, 'backgroundColor');
        backgroundInput.fieldView.on('input', ()=>{
            this.backgroundColor = backgroundInput.fieldView.value;
        });
        return {
            backgroundRowLabel,
            backgroundInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #widthInput},
	 * * {@link #heightInput}.
	 */ _createDimensionFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Label ---------------------------------------------------
        const dimensionsLabel = new LabelView(locale);
        dimensionsLabel.text = t('Dimensions');
        // -- Width ---------------------------------------------------
        const widthInput = new LabeledFieldView(locale, createLabeledInputText);
        widthInput.set({
            label: t('Width'),
            class: 'ck-table-form__dimensions-row__width'
        });
        widthInput.fieldView.bind('value').to(this, 'width');
        widthInput.fieldView.on('input', ()=>{
            this.width = widthInput.fieldView.element.value;
        });
        // -- Operator ---------------------------------------------------
        const operatorLabel = new View(locale);
        operatorLabel.setTemplate({
            tag: 'span',
            attributes: {
                class: [
                    'ck-table-form__dimension-operator'
                ]
            },
            children: [
                {
                    text: '×'
                }
            ]
        });
        // -- Height ---------------------------------------------------
        const heightInput = new LabeledFieldView(locale, createLabeledInputText);
        heightInput.set({
            label: t('Height'),
            class: 'ck-table-form__dimensions-row__height'
        });
        heightInput.fieldView.bind('value').to(this, 'height');
        heightInput.fieldView.on('input', ()=>{
            this.height = heightInput.fieldView.element.value;
        });
        return {
            dimensionsLabel,
            widthInput,
            operatorLabel,
            heightInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #alignmentToolbar}.
	 */ _createAlignmentFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Label ---------------------------------------------------
        const alignmentLabel = new LabelView(locale);
        alignmentLabel.text = t('Table Alignment');
        // -- Toolbar ---------------------------------------------------
        const alignmentToolbar = new ToolbarView(locale);
        alignmentToolbar.set({
            role: 'radiogroup',
            isCompact: true,
            ariaLabel: t('Table alignment toolbar')
        });
        fillToolbar({
            view: this,
            icons: {
                left: IconObjectInlineLeft,
                center: IconObjectCenter,
                right: IconObjectInlineRight,
                blockLeft: IconObjectLeft,
                blockRight: IconObjectRight
            },
            toolbar: alignmentToolbar,
            labels: this._alignmentLabels,
            propertyName: 'alignment',
            defaultValue: this.options.defaultTableProperties.alignment
        });
        return {
            alignmentLabel,
            alignmentToolbar
        };
    }
    /**
	 * Creates the following form controls:
	 *
	 * * {@link #saveButtonView},
	 * * {@link #cancelButtonView}.
	 */ _createActionButtons() {
        const locale = this.locale;
        const t = this.t;
        const saveButtonView = new ButtonView(locale);
        const cancelButtonView = new ButtonView(locale);
        const fieldsThatShouldValidateToSave = [
            this.borderWidthInput,
            this.borderColorInput,
            this.backgroundInput,
            this.widthInput,
            this.heightInput
        ];
        saveButtonView.set({
            label: t('Save'),
            class: 'ck-button-action',
            type: 'submit',
            withText: true
        });
        saveButtonView.bind('isEnabled').toMany(fieldsThatShouldValidateToSave, 'errorText', (...errorTexts)=>{
            return errorTexts.every((errorText)=>!errorText);
        });
        cancelButtonView.set({
            label: t('Cancel'),
            withText: true
        });
        cancelButtonView.delegate('execute').to(this, 'cancel');
        return {
            saveButtonView,
            cancelButtonView
        };
    }
    /**
	 * Creates a back button view that cancels the form.
	 */ _createBackButton() {
        const t = this.locale.t;
        const backButton = new ButtonView(this.locale);
        backButton.set({
            class: 'ck-button-back',
            label: t('Back'),
            icon: IconPreviousArrow,
            tooltip: true
        });
        backButton.delegate('execute').to(this, 'cancel');
        return backButton;
    }
    /**
	 * Provides localized labels for {@link #alignmentToolbar} buttons.
	 */ get _alignmentLabels() {
        const locale = this.locale;
        const t = this.t;
        const blockLeft = t('Align table to the left with no text wrapping');
        const blockRight = t('Align table to the right with no text wrapping');
        const left = t('Align table to the left with text wrapping');
        const center = t('Center table with no text wrapping');
        const right = t('Align table to the right with text wrapping');
        // Returns object with a proper order of labels.
        if (locale.uiLanguageDirection === 'rtl') {
            return {
                right,
                left,
                blockRight,
                center,
                blockLeft
            };
        }
        return {
            blockLeft,
            center,
            blockRight,
            left,
            right
        };
    }
}
function isBorderStyleSet$1(value) {
    return value !== 'none';
}

const ERROR_TEXT_TIMEOUT$1 = 500;
// Map of view properties and related commands.
const propertyToCommandMap$1 = {
    borderStyle: 'tableBorderStyle',
    borderColor: 'tableBorderColor',
    borderWidth: 'tableBorderWidth',
    backgroundColor: 'tableBackgroundColor',
    width: 'tableWidth',
    height: 'tableHeight',
    alignment: 'tableAlignment'
};
/**
 * The table properties UI plugin. It introduces the `'tableProperties'` button
 * that opens a form allowing to specify visual styling of an entire table.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */ class TablePropertiesUIExperimental extends Plugin {
    /**
	 * The default table properties.
	 */ _defaultContentTableProperties;
    /**
	 * The default layout table properties.
	 */ _defaultLayoutTableProperties;
    /**
	 * The contextual balloon plugin instance.
	 */ _balloon;
    /**
	 * The properties form view displayed inside the balloon.
	 */ view = null;
    /**
	 * The properties form view displayed inside the balloon (content table).
	 */ _viewWithContentTableDefaults = null;
    /**
	 * The properties form view displayed inside the balloon (layout table).
	 */ _viewWithLayoutTableDefaults = null;
    /**
	 * The batch used to undo all changes made by the form (which are live, as the user types)
	 * when "Cancel" was pressed. Each time the view is shown, a new batch is created.
	 */ _undoStepBatch;
    /**
	 * Flag used to indicate whether view is ready to execute update commands
	 * (it finished loading initial data).
	 */ _isReady;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ContextualBalloon
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TablePropertiesUIExperimental';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('table.tableProperties', {
            borderColors: defaultColors,
            backgroundColors: defaultColors
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        this._defaultContentTableProperties = getNormalizedDefaultTableProperties(editor.config.get('table.tableProperties.defaultProperties'), {
            includeAlignmentProperty: true
        });
        this._defaultLayoutTableProperties = getNormalizedDefaultProperties();
        this._balloon = editor.plugins.get(ContextualBalloon);
        editor.ui.componentFactory.add('tableProperties', ()=>this._createTablePropertiesButton());
    }
    /**
	 * Creates the table properties button.
	 *
	 * @internal
	 */ _createTablePropertiesButton() {
        const editor = this.editor;
        const t = editor.t;
        const view = new ButtonView(editor.locale);
        view.set({
            label: t('Table properties'),
            icon: IconTableProperties,
            tooltip: true
        });
        this.listenTo(view, 'execute', ()=>this._showView());
        const commands = Object.values(propertyToCommandMap$1).map((commandName)=>editor.commands.get(commandName));
        view.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>areEnabled.some((isCommandEnabled)=>isCommandEnabled));
        return view;
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed.
        // See https://github.com/ckeditor/ckeditor5/issues/1341.
        if (this.view) {
            this.view.destroy();
        }
    }
    /**
	 * Creates the {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView} instance.
	 *
	 * @returns The table properties form view instance.
	 */ _createPropertiesView(defaultTableProperties) {
        const editor = this.editor;
        const config = editor.config.get('table.tableProperties');
        const borderColorsConfig = normalizeColorOptions(config.borderColors);
        const localizedBorderColors = getLocalizedColorOptions(editor.locale, borderColorsConfig);
        const backgroundColorsConfig = normalizeColorOptions(config.backgroundColors);
        const localizedBackgroundColors = getLocalizedColorOptions(editor.locale, backgroundColorsConfig);
        const hasColorPicker = config.colorPicker !== false;
        const view = new TablePropertiesViewExperimental(editor.locale, {
            borderColors: localizedBorderColors,
            backgroundColors: localizedBackgroundColors,
            defaultTableProperties,
            colorPickerConfig: hasColorPicker ? config.colorPicker || {} : false
        });
        const t = editor.t;
        // Render the view so its #element is available for the clickOutsideHandler.
        view.render();
        this.listenTo(view, 'submit', ()=>{
            this._hideView();
        });
        this.listenTo(view, 'cancel', ()=>{
            // https://github.com/ckeditor/ckeditor5/issues/6180
            if (this._undoStepBatch.operations.length) {
                editor.execute('undo', this._undoStepBatch);
            }
            this._hideView();
        });
        // Close the balloon on Esc key press.
        view.keystrokes.set('Esc', (data, cancel)=>{
            this._hideView();
            cancel();
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: view,
            activator: ()=>this._isViewInBalloon,
            contextElements: [
                this._balloon.view.element
            ],
            callback: ()=>this._hideView()
        });
        const colorErrorText = getLocalizedColorErrorText(t);
        const lengthErrorText = getLocalizedLengthErrorText(t);
        // Create the "UI -> editor data" binding.
        // These listeners update the editor data (via table commands) when any observable
        // property of the view has changed. They also validate the value and display errors in the UI
        // when necessary. This makes the view live, which means the changes are
        // visible in the editing as soon as the user types or changes fields' values.
        view.on('change:borderStyle', this._getPropertyChangeCallback('tableBorderStyle'));
        view.on('change:borderColor', this._getValidatedPropertyChangeCallback({
            viewField: view.borderColorInput,
            commandName: 'tableBorderColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:borderWidth', this._getValidatedPropertyChangeCallback({
            viewField: view.borderWidthInput,
            commandName: 'tableBorderWidth',
            errorText: lengthErrorText,
            validator: lineWidthFieldValidator
        }));
        view.on('change:backgroundColor', this._getValidatedPropertyChangeCallback({
            viewField: view.backgroundInput,
            commandName: 'tableBackgroundColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:width', this._getValidatedPropertyChangeCallback({
            viewField: view.widthInput,
            commandName: 'tableWidth',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:height', this._getValidatedPropertyChangeCallback({
            viewField: view.heightInput,
            commandName: 'tableHeight',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:alignment', this._getPropertyChangeCallback('tableAlignment'));
        return view;
    }
    /**
	 * In this method the "editor data -> UI" binding is happening.
	 *
	 * When executed, this method obtains selected table property values from various table commands
	 * and passes them to the {@link #view}.
	 *
	 * This way, the UI stays up–to–date with the editor data.
	 */ _fillViewFormFromCommandValues() {
        const commands = this.editor.commands;
        const borderStyleCommand = commands.get('tableBorderStyle');
        Object.entries(propertyToCommandMap$1).map(([property, commandName])=>{
            const propertyKey = property;
            const defaultValue = this.view === this._viewWithContentTableDefaults ? this._defaultContentTableProperties[propertyKey] || '' : this._defaultLayoutTableProperties[propertyKey] || '';
            return [
                propertyKey,
                commands.get(commandName).value || defaultValue
            ];
        }).forEach(([property, value])=>{
            // Do not set the `border-color` and `border-width` fields if `border-style:none`.
            if ((property === 'borderColor' || property === 'borderWidth') && borderStyleCommand.value === 'none') {
                return;
            }
            this.view.set(property, value);
        });
        this._isReady = true;
    }
    /**
	 * Shows the {@link #view} in the {@link #_balloon}.
	 *
	 * **Note**: Each time a view is shown, the new {@link #_undoStepBatch} is created that contains
	 * all changes made to the document when the view is visible, allowing a single undo step
	 * for all of them.
	 */ _showView() {
        const editor = this.editor;
        const viewTable = getSelectionAffectedTableWidget(editor.editing.view.document.selection);
        const modelTable = viewTable && editor.editing.mapper.toModelElement(viewTable);
        const useDefaults = !modelTable || modelTable.getAttribute('tableType') !== 'layout';
        if (useDefaults && !this._viewWithContentTableDefaults) {
            this._viewWithContentTableDefaults = this._createPropertiesView(this._defaultContentTableProperties);
        } else if (!useDefaults && !this._viewWithLayoutTableDefaults) {
            this._viewWithLayoutTableDefaults = this._createPropertiesView(this._defaultLayoutTableProperties);
        }
        this.view = useDefaults ? this._viewWithContentTableDefaults : this._viewWithLayoutTableDefaults;
        this.listenTo(editor.ui, 'update', ()=>{
            this._updateView();
        });
        // Update the view with the model values.
        this._fillViewFormFromCommandValues();
        this._balloon.add({
            view: this.view,
            position: getBalloonTablePositionData(editor)
        });
        // Create a new batch. Clicking "Cancel" will undo this batch.
        this._undoStepBatch = editor.model.createBatch();
        // Basic a11y.
        this.view.focus();
    }
    /**
	 * Removes the {@link #view} from the {@link #_balloon}.
	 */ _hideView() {
        const editor = this.editor;
        this.stopListening(editor.ui, 'update');
        this._isReady = false;
        // Blur any input element before removing it from DOM to prevent issues in some browsers.
        // See https://github.com/ckeditor/ckeditor5/issues/1501.
        this.view.saveButtonView.focus();
        this._balloon.remove(this.view);
        // Make sure the focus is not lost in the process by putting it directly
        // into the editing view.
        this.editor.editing.view.focus();
    }
    /**
	 * Repositions the {@link #_balloon} or hides the {@link #view} if a table is no longer selected.
	 */ _updateView() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        if (!getSelectionAffectedTableWidget(viewDocument.selection)) {
            this._hideView();
        } else if (this._isViewVisible) {
            repositionContextualBalloon(editor, 'table');
        }
    }
    /**
	 * Returns `true` when the {@link #view} is the visible in the {@link #_balloon}.
	 */ get _isViewVisible() {
        return !!this.view && this._balloon.visibleView === this.view;
    }
    /**
	 * Returns `true` when the {@link #view} is in the {@link #_balloon}.
	 */ get _isViewInBalloon() {
        return !!this.view && this._balloon.hasView(this.view);
    }
    /**
	 * Creates a callback that when executed upon {@link #view view's} property change
	 * executes a related editor command with the new property value.
	 *
	 * If new value will be set to the default value, the command will not be executed.
	 *
	 * @param commandName The command that will be executed.
	 */ _getPropertyChangeCallback(commandName) {
        return (evt, propertyName, newValue)=>{
            // Do not execute the command on initial call (opening the table properties view).
            if (!this._isReady) {
                return;
            }
            this.editor.execute(commandName, {
                value: newValue,
                batch: this._undoStepBatch
            });
        };
    }
    /**
	 * Creates a callback that when executed upon {@link #view view's} property change:
	 * * executes a related editor command with the new property value if the value is valid,
	 * * or sets the error text next to the invalid field, if the value did not pass the validation.
	 */ _getValidatedPropertyChangeCallback(options) {
        const { commandName, viewField, validator, errorText } = options;
        const setErrorTextDebounced = debounce(()=>{
            viewField.errorText = errorText;
        }, ERROR_TEXT_TIMEOUT$1);
        return (evt, propertyName, newValue)=>{
            setErrorTextDebounced.cancel();
            // Do not execute the command on initial call (opening the table properties view).
            if (!this._isReady) {
                return;
            }
            if (validator(newValue)) {
                this.editor.execute(commandName, {
                    value: newValue,
                    batch: this._undoStepBatch
                });
                viewField.errorText = null;
            } else {
                setErrorTextDebounced();
            }
        };
    }
}

/**
 * The class representing a table cell properties form, allowing users to customize
 * certain style aspects of a table cell, for instance, border, padding, text alignment, etc..
 */ class TableCellPropertiesViewExperimental extends View {
    /**
	 * Options passed to the view. See {@link #constructor} to learn more.
	 */ options;
    /**
	 * Tracks information about the DOM focus in the form.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * A collection of child views in the form.
	 */ children;
    /**
	 * A dropdown that allows selecting the style of the table cell border.
	 */ borderStyleDropdown;
    /**
	 * An input that allows specifying the width of the table cell border.
	 */ borderWidthInput;
    /**
	 * An input that allows specifying the color of the table cell border.
	 */ borderColorInput;
    /**
	 * An input that allows specifying the table cell background color.
	 */ backgroundInput;
    /**
	 * A dropdown that allows selecting the type of the table cell (data or header).
	 */ cellTypeDropdown;
    /**
	 * An input that allows specifying the table cell padding.
	 */ paddingInput;
    /**
	 * An input that allows specifying the table cell width.
	 */ widthInput;
    /**
	 * An input that allows specifying the table cell height.
	 */ heightInput;
    /**
	 * A toolbar with buttons that allow changing the horizontal text alignment in a table cell.
	 */ horizontalAlignmentToolbar;
    /**
	 * A toolbar with buttons that allow changing the vertical text alignment in a table cell.
	 */ verticalAlignmentToolbar;
    /**
	 * The "Save" button view.
	 */ saveButtonView;
    /**
	 * The "Cancel" button view.
	 */ cancelButtonView;
    /**
	 * The "Back" button view.
	 */ backButtonView;
    /**
	 * A collection of views that can be focused in the form.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param options Additional configuration of the view.
	 * @param options.borderColors A configuration of the border color palette used by the
	 * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#borderColorInput}.
	 * @param options.backgroundColors A configuration of the background color palette used by the
	 * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#backgroundInput}.
	 * @param options.defaultTableCellProperties The default table cell properties.
	 * @param options.isTableCellTypeSupported A flag indicating whether the table cell type is supported.
	 */ constructor(locale, options){
        super(locale);
        this.set({
            borderStyle: '',
            borderWidth: '',
            borderColor: '',
            padding: '',
            backgroundColor: '',
            width: '',
            height: '',
            horizontalAlignment: '',
            verticalAlignment: '',
            cellType: ''
        });
        this.options = options;
        const { borderStyleDropdown, borderWidthInput, borderColorInput, borderRowLabel } = this._createBorderFields();
        const { backgroundRowLabel, backgroundInput } = this._createBackgroundFields();
        const { cellTypeRowLabel, cellTypeDropdown } = this._createCellTypeField();
        const { widthInput, operatorLabel, heightInput, dimensionsLabel } = this._createDimensionFields();
        const { horizontalAlignmentToolbar, verticalAlignmentToolbar, alignmentLabel } = this._createAlignmentFields();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.children = this.createCollection();
        this.borderStyleDropdown = borderStyleDropdown;
        this.borderWidthInput = borderWidthInput;
        this.borderColorInput = borderColorInput;
        this.backgroundInput = backgroundInput;
        this.cellTypeDropdown = cellTypeDropdown;
        this.paddingInput = this._createPaddingField();
        this.widthInput = widthInput;
        this.heightInput = heightInput;
        this.horizontalAlignmentToolbar = horizontalAlignmentToolbar;
        this.verticalAlignmentToolbar = verticalAlignmentToolbar;
        // Defer creating to make sure other fields are present and the Save button can
        // bind its #isEnabled to their error messages so there's no way to save unless all
        // fields are valid.
        const { saveButtonView, cancelButtonView } = this._createActionButtons();
        this.saveButtonView = saveButtonView;
        this.cancelButtonView = cancelButtonView;
        this.backButtonView = this._createBackButton();
        this._focusables = new ViewCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        // Form header.
        const header = new FormHeaderView(locale, {
            label: this.t('Cell properties')
        });
        header.children.add(this.backButtonView, 0);
        this.children.add(header);
        // Border row.
        this.children.add(new FormRowView(locale, {
            labelView: borderRowLabel,
            children: this.options.isTableCellTypeSupported ? [
                borderRowLabel,
                borderStyleDropdown,
                borderWidthInput,
                borderColorInput
            ] : [
                borderRowLabel,
                borderStyleDropdown,
                borderColorInput,
                borderWidthInput
            ],
            class: `ck-table-form__border-row${this.options.isTableCellTypeSupported ? ' ck-table-form__border-row_experimental' : ''}`
        }));
        // Background and cell type.
        this.children.add(new FormRowView(locale, {
            children: this.options.isTableCellTypeSupported ? [
                new FormRowView(locale, {
                    labelView: cellTypeRowLabel,
                    children: [
                        cellTypeRowLabel,
                        cellTypeDropdown
                    ],
                    class: 'ck-table-form__cell-type-row'
                }),
                new FormRowView(locale, {
                    labelView: backgroundRowLabel,
                    children: [
                        backgroundRowLabel,
                        backgroundInput
                    ],
                    class: 'ck-table-form__background-row'
                })
            ] : [
                new FormRowView(locale, {
                    labelView: backgroundRowLabel,
                    children: [
                        backgroundRowLabel,
                        backgroundInput
                    ],
                    class: 'ck-table-form__background-row'
                })
            ]
        }));
        // Dimensions row and padding.
        this.children.add(new FormRowView(locale, {
            children: [
                // Dimensions row.
                new FormRowView(locale, {
                    labelView: dimensionsLabel,
                    children: [
                        dimensionsLabel,
                        widthInput,
                        operatorLabel,
                        heightInput
                    ],
                    class: 'ck-table-form__dimensions-row'
                }),
                // Padding row.
                new FormRowView(locale, {
                    children: [
                        this.paddingInput
                    ],
                    class: 'ck-table-cell-properties-form__padding-row'
                })
            ]
        }));
        // Text alignment row.
        this.children.add(new FormRowView(locale, {
            labelView: alignmentLabel,
            children: [
                alignmentLabel,
                horizontalAlignmentToolbar,
                verticalAlignmentToolbar
            ],
            class: 'ck-table-cell-properties-form__alignment-row'
        }));
        // Action row.
        this.children.add(new FormRowView(locale, {
            children: [
                this.cancelButtonView,
                this.saveButtonView
            ],
            class: 'ck-table-form__action-row'
        }));
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-table-form',
                    'ck-table-cell-properties-form',
                    'ck-table-cell-properties-form_experimental',
                    this.options.isTableCellTypeSupported ? 'ck-table-cell-properties-form_experimental-no-cell-type' : ''
                ],
                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        // Enable the "submit" event for this view. It can be triggered by the #saveButtonView
        // which is of the "submit" DOM "type".
        submitHandler({
            view: this
        });
        // Maintain continuous focus cycling over views that have focusable children and focus cyclers themselves.
        [
            this.borderColorInput,
            this.backgroundInput
        ].forEach((view)=>{
            this._focusCycler.chain(view.fieldView.focusCycler);
        });
        [
            this.borderStyleDropdown,
            this.borderColorInput,
            this.borderWidthInput,
            this.cellTypeDropdown,
            this.backgroundInput,
            this.widthInput,
            this.heightInput,
            this.paddingInput,
            this.horizontalAlignmentToolbar,
            this.verticalAlignmentToolbar,
            this.cancelButtonView,
            this.saveButtonView,
            this.backButtonView
        ].forEach((view)=>{
            // Register the view as focusable.
            this._focusables.add(view);
            // Register the view in the focus tracker.
            this.focusTracker.add(view.element);
        });
        // Mainly for closing using "Esc" and navigation using "Tab".
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the fist focusable field in the form.
	 */ focus() {
        this._focusCycler.focusFirst();
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #borderStyleDropdown},
	 * * {@link #borderWidthInput},
	 * * {@link #borderColorInput}.
	 */ _createBorderFields() {
        const defaultTableCellProperties = this.options.defaultTableCellProperties;
        const defaultBorder = {
            style: defaultTableCellProperties.borderStyle,
            width: defaultTableCellProperties.borderWidth,
            color: defaultTableCellProperties.borderColor
        };
        const colorInputCreator = getLabeledColorInputCreator({
            colorConfig: this.options.borderColors,
            columns: 5,
            defaultColorValue: defaultBorder.color,
            colorPickerConfig: this.options.colorPickerConfig
        });
        const locale = this.locale;
        const t = this.t;
        const accessibleLabel = t('Style');
        // -- Group label ---------------------------------------------
        const borderRowLabel = new LabelView(locale);
        borderRowLabel.text = t('Border');
        // -- Style ---------------------------------------------------
        const styleLabels = getBorderStyleLabels(t);
        const borderStyleDropdown = new LabeledFieldView(locale, createLabeledDropdown);
        borderStyleDropdown.set({
            label: accessibleLabel,
            class: 'ck-table-form__border-style'
        });
        borderStyleDropdown.fieldView.buttonView.set({
            ariaLabel: accessibleLabel,
            ariaLabelledBy: undefined,
            isOn: false,
            withText: true,
            tooltip: accessibleLabel
        });
        borderStyleDropdown.fieldView.buttonView.bind('label').to(this, 'borderStyle', (value)=>{
            return styleLabels[value ? value : 'none'];
        });
        borderStyleDropdown.fieldView.on('execute', (evt)=>{
            this.borderStyle = evt.source._borderStyleValue;
        });
        borderStyleDropdown.bind('isEmpty').to(this, 'borderStyle', (value)=>!value);
        addListToDropdown(borderStyleDropdown.fieldView, getBorderStyleDefinitions(this, defaultBorder.style), {
            role: 'menu',
            ariaLabel: accessibleLabel
        });
        // -- Width ---------------------------------------------------
        const borderWidthInput = new LabeledFieldView(locale, createLabeledInputText);
        borderWidthInput.set({
            label: t('Width'),
            class: 'ck-table-form__border-width'
        });
        borderWidthInput.fieldView.bind('value').to(this, 'borderWidth');
        borderWidthInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet);
        borderWidthInput.fieldView.on('input', ()=>{
            this.borderWidth = borderWidthInput.fieldView.element.value;
        });
        // -- Color ---------------------------------------------------
        const borderColorInput = new LabeledFieldView(locale, colorInputCreator);
        borderColorInput.set({
            label: t('Color'),
            class: 'ck-table-form__border-color'
        });
        borderColorInput.fieldView.bind('value').to(this, 'borderColor');
        borderColorInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet);
        borderColorInput.fieldView.on('input', ()=>{
            this.borderColor = borderColorInput.fieldView.value;
        });
        // Reset the border color and width fields depending on the `border-style` value.
        this.on('change:borderStyle', (evt, name, newValue, oldValue)=>{
            // When removing the border (`border-style:none`), clear the remaining `border-*` properties.
            // See: https://github.com/ckeditor/ckeditor5/issues/6227.
            if (!isBorderStyleSet(newValue)) {
                this.borderColor = '';
                this.borderWidth = '';
            }
            // When setting the `border-style` from `none`, set the default `border-color` and `border-width` properties.
            if (!isBorderStyleSet(oldValue)) {
                this.borderColor = defaultBorder.color;
                this.borderWidth = defaultBorder.width;
            }
        });
        return {
            borderRowLabel,
            borderStyleDropdown,
            borderColorInput,
            borderWidthInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #backgroundInput}.
	 */ _createBackgroundFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Group label ---------------------------------------------
        const backgroundRowLabel = new LabelView(locale);
        backgroundRowLabel.text = t('Background');
        // -- Background color input -----------------------------------
        const colorInputCreator = getLabeledColorInputCreator({
            colorConfig: this.options.backgroundColors,
            columns: 5,
            defaultColorValue: this.options.defaultTableCellProperties.backgroundColor,
            colorPickerConfig: this.options.colorPickerConfig
        });
        const backgroundInput = new LabeledFieldView(locale, colorInputCreator);
        backgroundInput.set({
            label: t('Color'),
            class: 'ck-table-cell-properties-form__background'
        });
        backgroundInput.fieldView.bind('value').to(this, 'backgroundColor');
        backgroundInput.fieldView.on('input', ()=>{
            this.backgroundColor = backgroundInput.fieldView.value;
        });
        return {
            backgroundRowLabel,
            backgroundInput
        };
    }
    /**
	 * Create cell type field.
	 *
	 * * {@link #cellTypeDropdown}.
	 *
	 * @internal
	 */ _createCellTypeField() {
        const locale = this.locale;
        const t = this.t;
        const cellTypeRowLabel = new LabelView(locale);
        cellTypeRowLabel.text = t('Cell type');
        const cellTypeLabels = this._cellTypeLabels;
        const cellTypeDropdown = new LabeledFieldView(locale, createLabeledDropdown);
        cellTypeDropdown.set({
            label: t('Cell type'),
            class: 'ck-table-cell-properties-form__cell-type'
        });
        cellTypeDropdown.fieldView.buttonView.set({
            ariaLabel: t('Cell type'),
            ariaLabelledBy: undefined,
            isOn: false,
            withText: true,
            tooltip: t('Cell type')
        });
        cellTypeDropdown.fieldView.buttonView.bind('label').to(this, 'cellType', (value)=>{
            return cellTypeLabels[value || 'data'];
        });
        cellTypeDropdown.fieldView.on('execute', (evt)=>{
            this.cellType = evt.source._cellTypeValue;
        });
        cellTypeDropdown.bind('isEmpty').to(this, 'cellType', (value)=>!value);
        addListToDropdown(cellTypeDropdown.fieldView, this._getCellTypeDefinitions(), {
            role: 'menu',
            ariaLabel: t('Cell type')
        });
        return {
            cellTypeRowLabel,
            cellTypeDropdown
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #widthInput}.
	 * * {@link #heightInput}.
	 */ _createDimensionFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Label ---------------------------------------------------
        const dimensionsLabel = new LabelView(locale);
        dimensionsLabel.text = t('Dimensions');
        // -- Width ---------------------------------------------------
        const widthInput = new LabeledFieldView(locale, createLabeledInputText);
        widthInput.set({
            label: t('Width'),
            class: 'ck-table-form__dimensions-row__width'
        });
        widthInput.fieldView.bind('value').to(this, 'width');
        widthInput.fieldView.on('input', ()=>{
            this.width = widthInput.fieldView.element.value;
        });
        // -- Operator ---------------------------------------------------
        const operatorLabel = new View(locale);
        operatorLabel.setTemplate({
            tag: 'span',
            attributes: {
                class: [
                    'ck-table-form__dimension-operator'
                ]
            },
            children: [
                {
                    text: '×'
                }
            ]
        });
        // -- Height ---------------------------------------------------
        const heightInput = new LabeledFieldView(locale, createLabeledInputText);
        heightInput.set({
            label: t('Height'),
            class: 'ck-table-form__dimensions-row__height'
        });
        heightInput.fieldView.bind('value').to(this, 'height');
        heightInput.fieldView.on('input', ()=>{
            this.height = heightInput.fieldView.element.value;
        });
        return {
            dimensionsLabel,
            widthInput,
            operatorLabel,
            heightInput
        };
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #paddingInput}.
	 */ _createPaddingField() {
        const locale = this.locale;
        const t = this.t;
        const paddingInput = new LabeledFieldView(locale, createLabeledInputText);
        paddingInput.set({
            label: t('Padding'),
            class: 'ck-table-cell-properties-form__padding'
        });
        paddingInput.fieldView.bind('value').to(this, 'padding');
        paddingInput.fieldView.on('input', ()=>{
            this.padding = paddingInput.fieldView.element.value;
        });
        return paddingInput;
    }
    /**
	 * Creates the following form fields:
	 *
	 * * {@link #horizontalAlignmentToolbar},
	 * * {@link #verticalAlignmentToolbar}.
	 */ _createAlignmentFields() {
        const locale = this.locale;
        const t = this.t;
        const alignmentLabel = new LabelView(locale);
        const ALIGNMENT_ICONS = {
            left: IconAlignLeft,
            center: IconAlignCenter,
            right: IconAlignRight,
            justify: IconAlignJustify,
            top: IconAlignTop,
            middle: IconAlignMiddle,
            bottom: IconAlignBottom
        };
        alignmentLabel.text = t('Table cell text alignment');
        // -- Horizontal ---------------------------------------------------
        const horizontalAlignmentToolbar = new ToolbarView(locale);
        const isContentRTL = locale.contentLanguageDirection === 'rtl';
        horizontalAlignmentToolbar.set({
            isCompact: true,
            role: 'radiogroup',
            ariaLabel: t('Horizontal text alignment toolbar'),
            class: 'ck-table-cell-properties-form__horizontal-alignment-toolbar'
        });
        fillToolbar({
            view: this,
            icons: ALIGNMENT_ICONS,
            toolbar: horizontalAlignmentToolbar,
            labels: this._horizontalAlignmentLabels,
            propertyName: 'horizontalAlignment',
            nameToValue: (name)=>{
                // For the RTL content, we want to swap the buttons "align to the left" and "align to the right".
                if (isContentRTL) {
                    if (name === 'left') {
                        return 'right';
                    } else if (name === 'right') {
                        return 'left';
                    }
                }
                return name;
            },
            defaultValue: this.options.defaultTableCellProperties.horizontalAlignment
        });
        // -- Vertical -----------------------------------------------------
        const verticalAlignmentToolbar = new ToolbarView(locale);
        verticalAlignmentToolbar.set({
            isCompact: true,
            role: 'radiogroup',
            ariaLabel: t('Vertical text alignment toolbar'),
            class: 'ck-table-cell-properties-form__vertical-alignment-toolbar'
        });
        fillToolbar({
            view: this,
            icons: ALIGNMENT_ICONS,
            toolbar: verticalAlignmentToolbar,
            labels: this._verticalAlignmentLabels,
            propertyName: 'verticalAlignment',
            defaultValue: this.options.defaultTableCellProperties.verticalAlignment
        });
        return {
            horizontalAlignmentToolbar,
            verticalAlignmentToolbar,
            alignmentLabel
        };
    }
    /**
	 * Creates the following form controls:
	 *
	 * * {@link #saveButtonView},
	 * * {@link #cancelButtonView}.
	 */ _createActionButtons() {
        const locale = this.locale;
        const t = this.t;
        const saveButtonView = new ButtonView(locale);
        const cancelButtonView = new ButtonView(locale);
        const fieldsThatShouldValidateToSave = [
            this.borderWidthInput,
            this.borderColorInput,
            this.backgroundInput,
            this.paddingInput
        ];
        saveButtonView.set({
            label: t('Save'),
            class: 'ck-button-action',
            type: 'submit',
            withText: true
        });
        saveButtonView.bind('isEnabled').toMany(fieldsThatShouldValidateToSave, 'errorText', (...errorTexts)=>{
            return errorTexts.every((errorText)=>!errorText);
        });
        cancelButtonView.set({
            label: t('Cancel'),
            withText: true
        });
        cancelButtonView.delegate('execute').to(this, 'cancel');
        return {
            saveButtonView,
            cancelButtonView
        };
    }
    /**
	 * Creates a back button view that cancels the form.
	 */ _createBackButton() {
        const t = this.locale.t;
        const backButton = new ButtonView(this.locale);
        backButton.set({
            class: 'ck-button-back',
            label: t('Back'),
            icon: IconPreviousArrow,
            tooltip: true
        });
        backButton.delegate('execute').to(this, 'cancel');
        return backButton;
    }
    /**
	 * Creates the cell type dropdown definitions.
	 */ _getCellTypeDefinitions() {
        const itemDefinitions = new Collection();
        const cellTypeLabels = this._cellTypeLabels;
        for (const type of [
            'data',
            'header'
        ]){
            const definition = {
                type: 'button',
                model: new UIModel({
                    _cellTypeValue: type,
                    label: cellTypeLabels[type],
                    role: 'menuitemradio',
                    withText: true
                })
            };
            definition.model.bind('isOn').to(this, 'cellType', (value)=>value === type);
            itemDefinitions.add(definition);
        }
        return itemDefinitions;
    }
    /**
	 * Provides localized labels for {@link #horizontalAlignmentToolbar} buttons.
	 */ get _horizontalAlignmentLabels() {
        const locale = this.locale;
        const t = this.t;
        const left = t('Align cell text to the left');
        const center = t('Align cell text to the center');
        const right = t('Align cell text to the right');
        const justify = t('Justify cell text');
        // Returns object with a proper order of labels.
        if (locale.uiLanguageDirection === 'rtl') {
            return {
                right,
                center,
                left,
                justify
            };
        } else {
            return {
                left,
                center,
                right,
                justify
            };
        }
    }
    /**
	 * Provides localized labels for {@link #verticalAlignmentToolbar} buttons.
	 */ get _verticalAlignmentLabels() {
        const t = this.t;
        return {
            top: t('Align cell text to the top'),
            middle: t('Align cell text to the middle'),
            bottom: t('Align cell text to the bottom')
        };
    }
    /**
	 * Provides localized labels for {@link #cellTypeDropdown}.
	 */ get _cellTypeLabels() {
        const t = this.t;
        return {
            data: t('Data cell'),
            header: t('Header cell')
        };
    }
}
function isBorderStyleSet(value) {
    return value !== 'none';
}

const ERROR_TEXT_TIMEOUT = 500;
// Map of view properties and related commands.
const propertyToCommandMap = {
    borderStyle: 'tableCellBorderStyle',
    borderColor: 'tableCellBorderColor',
    borderWidth: 'tableCellBorderWidth',
    height: 'tableCellHeight',
    width: 'tableCellWidth',
    padding: 'tableCellPadding',
    backgroundColor: 'tableCellBackgroundColor',
    horizontalAlignment: 'tableCellHorizontalAlignment',
    verticalAlignment: 'tableCellVerticalAlignment',
    cellType: 'tableCellType'
};
/**
 * The table cell properties UI plugin. It introduces the `'tableCellProperties'` button
 * that opens a form allowing to specify the visual styling of a table cell.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */ class TableCellPropertiesUIExperimental extends Plugin {
    /**
	 * The default table cell properties.
	 */ _defaultContentTableCellProperties;
    /**
	 * The default layout table cell properties.
	 */ _defaultLayoutTableCellProperties;
    /**
	 * The contextual balloon plugin instance.
	 */ _balloon;
    /**
	 * The cell properties form view displayed inside the balloon.
	 */ view;
    /**
	 * The cell properties form view displayed inside the balloon (content table).
	 */ _viewWithContentTableDefaults;
    /**
	 * The cell properties form view displayed inside the balloon (layout table).
	 */ _viewWithLayoutTableDefaults;
    /**
	 * The batch used to undo all changes made by the form (which are live, as the user types)
	 * when "Cancel" was pressed. Each time the view is shown, a new batch is created.
	 */ _undoStepBatch;
    /**
	 * Flag used to indicate whether view is ready to execute update commands
	 * (it finished loading initial data).
	 */ _isReady;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ContextualBalloon
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'TableCellPropertiesUIExperimental';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('table.tableCellProperties', {
            borderColors: defaultColors,
            backgroundColors: defaultColors
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const t = editor.t;
        this._defaultContentTableCellProperties = getNormalizedDefaultCellProperties(editor.config.get('table.tableCellProperties.defaultProperties'), {
            includeVerticalAlignmentProperty: true,
            includeHorizontalAlignmentProperty: true,
            includePaddingProperty: true,
            isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
        });
        this._defaultLayoutTableCellProperties = getNormalizedDefaultProperties(undefined, {
            includeVerticalAlignmentProperty: true,
            includeHorizontalAlignmentProperty: true,
            isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl'
        });
        this._balloon = editor.plugins.get(ContextualBalloon);
        this.view = null;
        this._isReady = false;
        editor.ui.componentFactory.add('tableCellProperties', (locale)=>{
            const view = new ButtonView(locale);
            view.set({
                label: t('Cell properties'),
                icon: IconTableCellProperties,
                tooltip: true
            });
            this.listenTo(view, 'execute', ()=>this._showView());
            const commands = Object.values(propertyToCommandMap).map((commandName)=>editor.commands.get(commandName)).filter((val)=>!!val);
            view.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled)=>areEnabled.some((isCommandEnabled)=>isCommandEnabled));
            return view;
        });
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed.
        // See https://github.com/ckeditor/ckeditor5/issues/1341.
        if (this.view) {
            this.view.destroy();
        }
    }
    /**
	 * Creates the {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView} instance.
	 *
	 * @returns The cell properties form view instance.
	 */ _createPropertiesView(defaultTableCellProperties) {
        const editor = this.editor;
        const config = editor.config.get('table.tableCellProperties');
        const borderColorsConfig = normalizeColorOptions(config.borderColors);
        const localizedBorderColors = getLocalizedColorOptions(editor.locale, borderColorsConfig);
        const backgroundColorsConfig = normalizeColorOptions(config.backgroundColors);
        const localizedBackgroundColors = getLocalizedColorOptions(editor.locale, backgroundColorsConfig);
        const hasColorPicker = config.colorPicker !== false;
        const isTableCellTypeSupported = !!editor.config.get('experimentalFlags.tableCellTypeSupport');
        const view = new TableCellPropertiesViewExperimental(editor.locale, {
            borderColors: localizedBorderColors,
            backgroundColors: localizedBackgroundColors,
            defaultTableCellProperties,
            colorPickerConfig: hasColorPicker ? config.colorPicker || {} : false,
            isTableCellTypeSupported
        });
        const t = editor.t;
        // Render the view so its #element is available for the clickOutsideHandler.
        view.render();
        this.listenTo(view, 'submit', ()=>{
            this._hideView();
        });
        this.listenTo(view, 'cancel', ()=>{
            // https://github.com/ckeditor/ckeditor5/issues/6180
            if (this._undoStepBatch.operations.length) {
                editor.execute('undo', this._undoStepBatch);
            }
            this._hideView();
        });
        // Close the balloon on Esc key press.
        view.keystrokes.set('Esc', (data, cancel)=>{
            this._hideView();
            cancel();
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: view,
            activator: ()=>this._isViewInBalloon,
            contextElements: [
                this._balloon.view.element
            ],
            callback: ()=>this._hideView()
        });
        const colorErrorText = getLocalizedColorErrorText(t);
        const lengthErrorText = getLocalizedLengthErrorText(t);
        // Create the "UI -> editor data" binding.
        // These listeners update the editor data (via table commands) when any observable
        // property of the view has changed. They also validate the value and display errors in the UI
        // when necessary. This makes the view live, which means the changes are
        // visible in the editing as soon as the user types or changes fields' values.
        view.on('change:borderStyle', this._getPropertyChangeCallback('tableCellBorderStyle'));
        view.on('change:borderColor', this._getValidatedPropertyChangeCallback({
            viewField: view.borderColorInput,
            commandName: 'tableCellBorderColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:borderWidth', this._getValidatedPropertyChangeCallback({
            viewField: view.borderWidthInput,
            commandName: 'tableCellBorderWidth',
            errorText: lengthErrorText,
            validator: lineWidthFieldValidator
        }));
        view.on('change:padding', this._getValidatedPropertyChangeCallback({
            viewField: view.paddingInput,
            commandName: 'tableCellPadding',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:width', this._getValidatedPropertyChangeCallback({
            viewField: view.widthInput,
            commandName: 'tableCellWidth',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:height', this._getValidatedPropertyChangeCallback({
            viewField: view.heightInput,
            commandName: 'tableCellHeight',
            errorText: lengthErrorText,
            validator: lengthFieldValidator
        }));
        view.on('change:backgroundColor', this._getValidatedPropertyChangeCallback({
            viewField: view.backgroundInput,
            commandName: 'tableCellBackgroundColor',
            errorText: colorErrorText,
            validator: colorFieldValidator
        }));
        view.on('change:horizontalAlignment', this._getPropertyChangeCallback('tableCellHorizontalAlignment'));
        view.on('change:verticalAlignment', this._getPropertyChangeCallback('tableCellVerticalAlignment'));
        const cellTypeCommand = editor.commands.get('tableCellType');
        if (cellTypeCommand) {
            view.cellTypeDropdown.bind('isEnabled').to(cellTypeCommand, 'isEnabled');
            view.on('change:cellType', this._getPropertyChangeCallback('tableCellType'));
        }
        return view;
    }
    /**
	 * In this method the "editor data -> UI" binding is happening.
	 *
	 * When executed, this method obtains selected cell property values from various table commands
	 * and passes them to the {@link #view}.
	 *
	 * This way, the UI stays up–to–date with the editor data.
	 */ _fillViewFormFromCommandValues() {
        const commands = this.editor.commands;
        const borderStyleCommand = commands.get('tableCellBorderStyle');
        Object.entries(propertyToCommandMap).flatMap(([property, commandName])=>{
            const command = commands.get(commandName);
            if (!command) {
                return [];
            }
            const propertyKey = property;
            let defaultValue;
            if (propertyKey === 'cellType') {
                defaultValue = '';
            } else {
                defaultValue = this.view === this._viewWithContentTableDefaults ? this._defaultContentTableCellProperties[propertyKey] || '' : this._defaultLayoutTableCellProperties[propertyKey] || '';
            }
            const entry = [
                property,
                command.value || defaultValue
            ];
            return [
                entry
            ];
        }).forEach(([property, value])=>{
            // Do not set the `border-color` and `border-width` fields if `border-style:none`.
            if ((property === 'borderColor' || property === 'borderWidth') && borderStyleCommand.value === 'none') {
                return;
            }
            this.view.set(property, value);
        });
        this._isReady = true;
    }
    /**
	 * Shows the {@link #view} in the {@link #_balloon}.
	 *
	 * **Note**: Each time a view is shown, a new {@link #_undoStepBatch} is created. It contains
	 * all changes made to the document when the view is visible, allowing a single undo step
	 * for all of them.
	 */ _showView() {
        const editor = this.editor;
        const viewTable = getSelectionAffectedTableWidget(editor.editing.view.document.selection);
        const modelTable = viewTable && editor.editing.mapper.toModelElement(viewTable);
        const useDefaults = !modelTable || modelTable.getAttribute('tableType') !== 'layout';
        if (useDefaults && !this._viewWithContentTableDefaults) {
            this._viewWithContentTableDefaults = this._createPropertiesView(this._defaultContentTableCellProperties);
        } else if (!useDefaults && !this._viewWithLayoutTableDefaults) {
            this._viewWithLayoutTableDefaults = this._createPropertiesView(this._defaultLayoutTableCellProperties);
        }
        this.view = useDefaults ? this._viewWithContentTableDefaults : this._viewWithLayoutTableDefaults;
        this.listenTo(editor.ui, 'update', ()=>{
            this._updateView();
        });
        // Update the view with the model values.
        this._fillViewFormFromCommandValues();
        this._balloon.add({
            view: this.view,
            position: getBalloonCellPositionData(editor)
        });
        // Create a new batch. Clicking "Cancel" will undo this batch.
        this._undoStepBatch = editor.model.createBatch();
        // Basic a11y.
        this.view.focus();
    }
    /**
	 * Removes the {@link #view} from the {@link #_balloon}.
	 */ _hideView() {
        const editor = this.editor;
        this.stopListening(editor.ui, 'update');
        this._isReady = false;
        // Blur any input element before removing it from DOM to prevent issues in some browsers.
        // See https://github.com/ckeditor/ckeditor5/issues/1501.
        this.view.saveButtonView.focus();
        this._balloon.remove(this.view);
        // Make sure the focus is not lost in the process by putting it directly
        // into the editing view.
        this.editor.editing.view.focus();
    }
    /**
	 * Repositions the {@link #_balloon} or hides the {@link #view} if a table cell is no longer selected.
	 */ _updateView() {
        const editor = this.editor;
        const viewDocument = editor.editing.view.document;
        if (!getTableWidgetAncestor(viewDocument.selection)) {
            this._hideView();
        } else if (this._isViewVisible) {
            repositionContextualBalloon(editor, 'cell');
        }
    }
    /**
	 * Returns `true` when the {@link #view} is visible in the {@link #_balloon}.
	 */ get _isViewVisible() {
        return !!this.view && this._balloon.visibleView === this.view;
    }
    /**
	 * Returns `true` when the {@link #view} is in the {@link #_balloon}.
	 */ get _isViewInBalloon() {
        return !!this.view && this._balloon.hasView(this.view);
    }
    /**
	 * Creates a callback that when executed upon the {@link #view view's} property change
	 * executes a related editor command with the new property value.
	 *
	 * @param commandName The default value of the command.
	 */ _getPropertyChangeCallback(commandName) {
        return (evt, propertyName, newValue)=>{
            if (!this._isReady) {
                return;
            }
            this.editor.execute(commandName, {
                value: newValue,
                batch: this._undoStepBatch
            });
        };
    }
    /**
	 * Creates a callback that when executed upon the {@link #view view's} property change:
	 * * Executes a related editor command with the new property value if the value is valid,
	 * * Or sets the error text next to the invalid field, if the value did not pass the validation.
	 */ _getValidatedPropertyChangeCallback(options) {
        const { commandName, viewField, validator, errorText } = options;
        const setErrorTextDebounced = debounce(()=>{
            viewField.errorText = errorText;
        }, ERROR_TEXT_TIMEOUT);
        return (evt, propertyName, newValue)=>{
            setErrorTextDebounced.cancel();
            // Do not execute the command on initial call (opening the table properties view).
            if (!this._isReady) {
                return;
            }
            if (validator(newValue)) {
                this.editor.execute(commandName, {
                    value: newValue,
                    batch: this._undoStepBatch
                });
                viewField.errorText = null;
            } else {
                setErrorTextDebounced();
            }
        };
    }
}

export { InsertColumnCommand, InsertRowCommand, InsertTableCommand, InsertTableLayoutCommand, MergeCellCommand, MergeCellsCommand, PlainTableOutput, RemoveColumnCommand, RemoveRowCommand, SelectColumnCommand, SelectRowCommand, SetHeaderColumnCommand, SetHeaderRowCommand, SplitCellCommand, Table, TableAlignmentCommand, TableBackgroundColorCommand, TableBorderColorCommand, TableBorderStyleCommand, TableBorderWidthCommand, TableCaption, TableCaptionEditing, TableCaptionUI, TableCellBackgroundColorCommand, TableCellBorderColorCommand, TableCellBorderStyleCommand, TableCellBorderWidthCommand, TableCellHeightCommand, TableCellHorizontalAlignmentCommand, TableCellPaddingCommand, TableCellProperties, TableCellPropertiesEditing, TableCellPropertiesUI, TableCellPropertiesUIExperimental, TableCellPropertiesView, TableCellPropertiesViewExperimental, TableCellPropertyCommand, TableCellTypeCommand, TableCellVerticalAlignmentCommand, TableCellWidthCommand, TableCellWidthEditing, TableClipboard, TableColumnResize, TableColumnResizeEditing, TableEditing, TableHeightCommand, TableKeyboard, TableLayout, TableLayoutEditing, TableLayoutUI, TableMouse, TableProperties, TablePropertiesEditing, TablePropertiesUI, TablePropertiesUIExperimental, TablePropertiesView, TablePropertiesViewExperimental, TablePropertyCommand, TableSelection, TableToolbar, TableTypeCommand, TableUI, TableUtils, TableWalker, TableWidthCommand, TableWidthsCommand, ToggleTableCaptionCommand, InsertTableView as _InsertTableView, COLUMN_MIN_WIDTH_AS_PERCENTAGE as _TABLE_COLUMN_MIN_WIDTH_AS_PERCENTAGE, COLUMN_MIN_WIDTH_IN_PIXELS as _TABLE_COLUMN_MIN_WIDTH_IN_PIXELS, COLUMN_RESIZE_DISTANCE_THRESHOLD as _TABLE_COLUMN_RESIZE_DISTANCE_THRESHOLD, COLUMN_WIDTH_PRECISION as _TABLE_COLUMN_WIDTH_PRECISION, defaultColors as _TABLE_DEFAULT_COLORS, ColorInputView as _TableColorInputView, MouseEventsObserver as _TableMouseEventsObserver, addDefaultUnitToNumericValue as _addDefaultUnitToNumericValue, adjustLastColumnIndex as _adjustLastTableColumnIndex, adjustLastRowIndex as _adjustLastTableRowIndex, clamp as _clamp, colorFieldValidator as _colorTableFieldValidator, convertParagraphInTableCell as _convertParagraphInTableCell, createEmptyTableCell as _createEmptyTableCell, createFilledArray as _createFilledArray, cropTableToDimensions as _cropTableToDimensions, downcastTable as _downcastTable, downcastTableAttribute as _downcastTableAttribute, downcastAttributeToStyle as _downcastTableAttributeToStyle, downcastCell as _downcastTableCell, downcastTableResizedClass as _downcastTableResizedClass, downcastRow as _downcastTableRow, enableProperty$1 as _enableTableCellProperty, ensureParagraphInTableCell as _ensureParagraphInTableCell, fillToolbar$1 as _fillTableOrCellToolbar, getBalloonCellPositionData as _getBalloonTableCellPositionData, getBalloonTablePositionData as _getBalloonTablePositionData, getBorderStyleLabels$1 as _getBorderTableStyleLabels, getChangedResizedTables as _getChangedResizedTables, getDefaultValueAdjusted as _getDefaultTableValueAdjusted, getDomCellOuterWidth as _getDomTableCellOuterWidth, getElementWidthInPixels as _getElementWidthInPixels, getHorizontallyOverlappingCells as _getHorizontallyOverlappingTableCells, getLabeledColorInputCreator$1 as _getLabeledTableColorInputCreator, getLocalizedColorErrorText as _getLocalizedTableColorErrorText, getLocalizedLengthErrorText as _getLocalizedTableLengthErrorText, getNormalizedDefaultProperties as _getNormalizedDefaultTableBaseProperties, getNormalizedDefaultCellProperties as _getNormalizedDefaultTableCellProperties, getNormalizedDefaultTableProperties as _getNormalizedDefaultTableProperties, getSelectedTableWidget as _getSelectedTableWidget, getSelectionAffectedTable as _getSelectionAffectedTable, getSelectionAffectedTableWidget as _getSelectionAffectedTableWidget, getSingleValue as _getTableBorderBoxSingleValue, getCaptionFromTableModelElement as _getTableCaptionFromModelElement, getCaptionFromModelSelection as _getTableCaptionFromModelSelection, getColumnEdgesIndexes as _getTableColumnEdgesIndexes, getTableColumnElements as _getTableColumnElements, getColumnGroupElement as _getTableColumnGroupElement, getColumnMinWidthAsPercentage as _getTableColumnMinWidthAsPercentage, getTableColumnsWidths as _getTableColumnsWidths, getBorderStyleDefinitions$1 as _getTableOrCellBorderStyleDefinitions, getTableWidgetAncestor as _getTableWidgetAncestor, getTableWidthInPixels as _getTableWidthInPixels, getVerticallyOverlappingCells as _getVerticallyOverlappingTableCells, injectTableCaptionPostFixer as _injectTableCaptionPostFixer, injectTableCellParagraphPostFixer as _injectTableCellParagraphPostFixer, injectTableLayoutPostFixer as _injectTableLayoutPostFixer, isSingleParagraphWithoutAttributes as _isSingleTableParagraphWithoutAttributes, isHeadingColumnCell as _isTableHeadingColumnCell, isTable as _isTableModelElement, lengthFieldValidator as _lengthTableFieldValidator, lineWidthFieldValidator as _lineWidthTableFieldValidator, matchTableCaptionViewElement as _matchTableCaptionViewElement, normalizeColumnWidths as _normalizeTableColumnWidths, removeEmptyColumns as _removeEmptyTableColumns, removeEmptyRows as _removeEmptyTableRows, removeEmptyRowsColumns as _removeEmptyTableRowsColumns, repositionContextualBalloon as _repositionTableContextualBalloon, skipEmptyTableRow as _skipEmptyTableRow, splitHorizontally as _splitTableCellHorizontally, splitVertically as _splitTableCellVertically, sumArray as _sumArray, tableCellRefreshHandler as _tableCellRefreshHandler, tableHeadingsRefreshHandler as _tableHeadingsRefreshHandler, toPrecision as _toPrecision, translateColSpanAttribute as _translateTableColspanAttribute, trimTableCellIfNeeded as _trimTableCellIfNeeded, upcastStyleToAttribute as _upcastNormalizedTableStyleToAttribute, upcastTable as _upcastTable, upcastBorderStyles as _upcastTableBorderStyles, upcastColgroupElement as _upcastTableColgroupElement, upcastTableFigure as _upcastTableFigure, updateColumnElements as _updateTableColumnElements, updateNumericAttribute as _updateTableNumericAttribute };
//# sourceMappingURL=index.js.map

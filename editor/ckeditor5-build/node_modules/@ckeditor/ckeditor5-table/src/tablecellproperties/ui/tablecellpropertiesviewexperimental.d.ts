/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellproperties/ui/tablecellpropertiesviewexperimental
 */
import { ButtonView, FocusCycler, LabeledFieldView, ToolbarView, View, ViewCollection, type FocusableView, type NormalizedColorOption, type ColorPickerConfig } from 'ckeditor5/src/ui.js';
import { KeystrokeHandler, FocusTracker, type Locale } from 'ckeditor5/src/utils.js';
import { type ColorInputView } from '../../ui/colorinputview.js';
import type { TableCellPropertiesOptions } from '../../tableconfig.js';
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../../theme/formrow-experimental.css';
import '../../../theme/tableform-experimental.css';
import '../../../theme/tablecellproperties-experimental.css';
export interface TableCellPropertiesViewOptionsExperimental {
    borderColors: Array<NormalizedColorOption>;
    backgroundColors: Array<NormalizedColorOption>;
    defaultTableCellProperties: TableCellPropertiesOptions;
    colorPickerConfig: false | ColorPickerConfig;
    isTableCellTypeSupported: boolean;
}
/**
 * The class representing a table cell properties form, allowing users to customize
 * certain style aspects of a table cell, for instance, border, padding, text alignment, etc..
 */
export declare class TableCellPropertiesViewExperimental extends View {
    /**
     * The value of the cell border style.
     *
     * @observable
     * @default ''
     */
    borderStyle: string;
    /**
     * The value of the cell border width style.
     *
     * @observable
     * @default ''
     */
    borderWidth: string;
    /**
     * The value of the cell border color style.
     *
     * @observable
     * @default ''
     */
    borderColor: string;
    /**
     * The value of the cell padding style.
     *
     * @observable
     * @default ''
     */
    padding: string;
    /**
     * The value of the cell background color style.
     *
     * @observable
     * @default ''
     */
    backgroundColor: string;
    /**
     * The value of the table cell width style.
     *
     * @observable
     * @default ''
     */
    width: string;
    /**
     * The value of the table cell height style.
     *
     * @observable
     * @default ''
     */
    height: string;
    /**
     * The value of the horizontal text alignment style.
     *
     * @observable
     * @default ''
     */
    horizontalAlignment: string;
    /**
     * The value of the vertical text alignment style.
     *
     * @observable
     * @default ''
     */
    verticalAlignment: string;
    /**
     * The type of the table cell ('data' or 'header').
     *
     * @observable
     * @default ''
     */
    cellType: string;
    /**
     * Options passed to the view. See {@link #constructor} to learn more.
     */
    readonly options: TableCellPropertiesViewOptionsExperimental;
    /**
     * Tracks information about the DOM focus in the form.
     */
    readonly focusTracker: FocusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    readonly keystrokes: KeystrokeHandler;
    /**
     * A collection of child views in the form.
     */
    readonly children: ViewCollection;
    /**
     * A dropdown that allows selecting the style of the table cell border.
     */
    readonly borderStyleDropdown: LabeledFieldView<FocusableView>;
    /**
     * An input that allows specifying the width of the table cell border.
     */
    readonly borderWidthInput: LabeledFieldView<FocusableView>;
    /**
     * An input that allows specifying the color of the table cell border.
     */
    readonly borderColorInput: LabeledFieldView<ColorInputView>;
    /**
     * An input that allows specifying the table cell background color.
     */
    readonly backgroundInput: LabeledFieldView<ColorInputView>;
    /**
     * A dropdown that allows selecting the type of the table cell (data or header).
     */
    readonly cellTypeDropdown: LabeledFieldView<FocusableView>;
    /**
     * An input that allows specifying the table cell padding.
     */
    readonly paddingInput: LabeledFieldView;
    /**
     * An input that allows specifying the table cell width.
     */
    readonly widthInput: LabeledFieldView<FocusableView>;
    /**
     * An input that allows specifying the table cell height.
     */
    readonly heightInput: LabeledFieldView<FocusableView>;
    /**
     * A toolbar with buttons that allow changing the horizontal text alignment in a table cell.
     */
    readonly horizontalAlignmentToolbar: ToolbarView;
    /**
     * A toolbar with buttons that allow changing the vertical text alignment in a table cell.
     */
    readonly verticalAlignmentToolbar: ToolbarView;
    /**
     * The "Save" button view.
     */
    saveButtonView: ButtonView;
    /**
     * The "Cancel" button view.
     */
    cancelButtonView: ButtonView;
    /**
     * The "Back" button view.
     */
    backButtonView: ButtonView;
    /**
     * A collection of views that can be focused in the form.
     */
    protected readonly _focusables: ViewCollection<FocusableView>;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    protected readonly _focusCycler: FocusCycler;
    /**
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param options Additional configuration of the view.
     * @param options.borderColors A configuration of the border color palette used by the
     * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#borderColorInput}.
     * @param options.backgroundColors A configuration of the background color palette used by the
     * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#backgroundInput}.
     * @param options.defaultTableCellProperties The default table cell properties.
     * @param options.isTableCellTypeSupported A flag indicating whether the table cell type is supported.
     */
    constructor(locale: Locale, options: TableCellPropertiesViewOptionsExperimental);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Focuses the fist focusable field in the form.
     */
    focus(): void;
    /**
     * Creates the following form fields:
     *
     * * {@link #borderStyleDropdown},
     * * {@link #borderWidthInput},
     * * {@link #borderColorInput}.
     */
    private _createBorderFields;
    /**
     * Creates the following form fields:
     *
     * * {@link #backgroundInput}.
     */
    private _createBackgroundFields;
    /**
     * Create cell type field.
     *
     * * {@link #cellTypeDropdown}.
     *
     * @internal
     */
    private _createCellTypeField;
    /**
     * Creates the following form fields:
     *
     * * {@link #widthInput}.
     * * {@link #heightInput}.
     */
    private _createDimensionFields;
    /**
     * Creates the following form fields:
     *
     * * {@link #paddingInput}.
     */
    private _createPaddingField;
    /**
     * Creates the following form fields:
     *
     * * {@link #horizontalAlignmentToolbar},
     * * {@link #verticalAlignmentToolbar}.
     */
    private _createAlignmentFields;
    /**
     * Creates the following form controls:
     *
     * * {@link #saveButtonView},
     * * {@link #cancelButtonView}.
     */
    private _createActionButtons;
    /**
     * Creates a back button view that cancels the form.
     */
    private _createBackButton;
    /**
     * Creates the cell type dropdown definitions.
     */
    private _getCellTypeDefinitions;
    /**
     * Provides localized labels for {@link #horizontalAlignmentToolbar} buttons.
     */
    private get _horizontalAlignmentLabels();
    /**
     * Provides localized labels for {@link #verticalAlignmentToolbar} buttons.
     */
    private get _verticalAlignmentLabels();
    /**
     * Provides localized labels for {@link #cellTypeDropdown}.
     */
    private get _cellTypeLabels();
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tableproperties/ui/tablepropertiesview
 */
import { ButtonView, FocusCycler, LabeledFieldView, ToolbarView, View, ViewCollection, type DropdownView, type InputTextView, type NormalizedColorOption, type ColorPickerConfig, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import { type ColorInputView } from '../../ui/colorinputview.js';
import type { TablePropertiesOptions } from '../../tableconfig.js';
import '@ckeditor/ckeditor5-ui/theme/components/form/form.css';
import '../../../theme/formrow.css';
import '../../../theme/tableform.css';
import '../../../theme/tableproperties.css';
/**
 * Additional configuration of the view.
 */
export interface TablePropertiesViewOptions {
    /**
     * A configuration of the border color palette used by the
     * {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView#borderColorInput}.
     */
    borderColors: Array<NormalizedColorOption>;
    /**
     * A configuration of the background color palette used by the
     * {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView#backgroundInput}.
     */
    backgroundColors: Array<NormalizedColorOption>;
    /**
     * The default table properties.
     */
    defaultTableProperties: TablePropertiesOptions;
    /**
     * The default color picker config.
     */
    colorPickerConfig: false | ColorPickerConfig;
}
/**
 * The class representing a table properties form, allowing users to customize
 * certain style aspects of a table, for instance, border, background color, alignment, etc..
 */
export declare class TablePropertiesView extends View {
    /**
     * The value of the border style.
     *
     * @observable
     * @default ''
     */
    borderStyle: string;
    /**
     * The value of the border width style.
     *
     * @observable
     * @default ''
     */
    borderWidth: string;
    /**
     * The value of the border color style.
     *
     * @observable
     * @default ''
     */
    borderColor: string;
    /**
     * The value of the background color style.
     *
     * @observable
     * @default ''
     */
    backgroundColor: string;
    /**
     * The value of the table width style.
     *
     * @observable
     * @default ''
     */
    width: string;
    /**
     * The value of the table height style.
     *
     * @observable
     * @default ''
     */
    height: string;
    /**
     * The value of the table alignment style.
     *
     * @observable
     * @default ''
     */
    alignment: string;
    /**
     * Options passed to the view. See {@link #constructor} to learn more.
     */
    readonly options: TablePropertiesViewOptions;
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
     * A dropdown that allows selecting the style of the table border.
     */
    readonly borderStyleDropdown: LabeledFieldView<DropdownView>;
    /**
     * An input that allows specifying the width of the table border.
     */
    readonly borderWidthInput: LabeledFieldView<InputTextView>;
    /**
     * An input that allows specifying the color of the table border.
     */
    readonly borderColorInput: LabeledFieldView<ColorInputView>;
    /**
     * An input that allows specifying the table background color.
     */
    readonly backgroundInput: LabeledFieldView<ColorInputView>;
    /**
     * An input that allows specifying the table width.
     */
    readonly widthInput: LabeledFieldView<InputTextView>;
    /**
     * An input that allows specifying the table height.
     */
    readonly heightInput: LabeledFieldView<InputTextView>;
    /**
     * A toolbar with buttons that allow changing the alignment of an entire table.
     */
    readonly alignmentToolbar: ToolbarView;
    /**
     * The "Save" button view.
     */
    saveButtonView: ButtonView;
    /**
     * The "Cancel" button view.
     */
    cancelButtonView: ButtonView;
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
     */
    constructor(locale: Locale, options: TablePropertiesViewOptions);
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
     * Creates the following form fields:
     *
     * * {@link #widthInput},
     * * {@link #heightInput}.
     */
    private _createDimensionFields;
    /**
     * Creates the following form fields:
     *
     * * {@link #alignmentToolbar}.
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
     * Provides localized labels for {@link #alignmentToolbar} buttons.
     */
    private get _alignmentLabels();
}

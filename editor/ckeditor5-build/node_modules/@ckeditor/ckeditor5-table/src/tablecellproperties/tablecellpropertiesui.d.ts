/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tablecellproperties/tablecellpropertiesui
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { ContextualBalloon } from 'ckeditor5/src/ui.js';
import { TableCellPropertiesView } from './ui/tablecellpropertiesview.js';
/**
 * The table cell properties UI plugin. It introduces the `'tableCellProperties'` button
 * that opens a form allowing to specify the visual styling of a table cell.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export declare class TableCellPropertiesUI extends Plugin {
    /**
     * The default table cell properties.
     */
    private _defaultContentTableCellProperties;
    /**
     * The default layout table cell properties.
     */
    private _defaultLayoutTableCellProperties;
    /**
     * The contextual balloon plugin instance.
     */
    private _balloon?;
    /**
     * The cell properties form view displayed inside the balloon.
     */
    view?: TableCellPropertiesView | null;
    /**
     * The cell properties form view displayed inside the balloon (content table).
     */
    private _viewWithContentTableDefaults?;
    /**
     * The cell properties form view displayed inside the balloon (layout table).
     */
    private _viewWithLayoutTableDefaults?;
    /**
     * The batch used to undo all changes made by the form (which are live, as the user types)
     * when "Cancel" was pressed. Each time the view is shown, a new batch is created.
     */
    private _undoStepBatch?;
    /**
     * Flag used to indicate whether view is ready to execute update commands
     * (it finished loading initial data).
     */
    private _isReady?;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ContextualBalloon];
    /**
     * @inheritDoc
     */
    static get pluginName(): "TableCellPropertiesUI";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates the {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView} instance.
     *
     * @returns The cell properties form view instance.
     */
    private _createPropertiesView;
    /**
     * In this method the "editor data -> UI" binding is happening.
     *
     * When executed, this method obtains selected cell property values from various table commands
     * and passes them to the {@link #view}.
     *
     * This way, the UI stays up–to–date with the editor data.
     */
    private _fillViewFormFromCommandValues;
    /**
     * Shows the {@link #view} in the {@link #_balloon}.
     *
     * **Note**: Each time a view is shown, a new {@link #_undoStepBatch} is created. It contains
     * all changes made to the document when the view is visible, allowing a single undo step
     * for all of them.
     */
    protected _showView(): void;
    /**
     * Removes the {@link #view} from the {@link #_balloon}.
     */
    protected _hideView(): void;
    /**
     * Repositions the {@link #_balloon} or hides the {@link #view} if a table cell is no longer selected.
     */
    protected _updateView(): void;
    /**
     * Returns `true` when the {@link #view} is visible in the {@link #_balloon}.
     */
    private get _isViewVisible();
    /**
     * Returns `true` when the {@link #view} is in the {@link #_balloon}.
     */
    private get _isViewInBalloon();
    /**
     * Creates a callback that when executed upon the {@link #view view's} property change
     * executes a related editor command with the new property value.
     *
     * @param commandName The default value of the command.
     */
    private _getPropertyChangeCallback;
    /**
     * Creates a callback that when executed upon the {@link #view view's} property change:
     * * Executes a related editor command with the new property value if the value is valid,
     * * Or sets the error text next to the invalid field, if the value did not pass the validation.
     */
    private _getValidatedPropertyChangeCallback;
}

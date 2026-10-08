/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module table/tableproperties/tablepropertiesuiexperimental
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { ButtonView, ContextualBalloon } from 'ckeditor5/src/ui.js';
import { TablePropertiesViewExperimental } from './ui/tablepropertiesviewexperimental.js';
/**
 * The table properties UI plugin. It introduces the `'tableProperties'` button
 * that opens a form allowing to specify visual styling of an entire table.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export declare class TablePropertiesUIExperimental extends Plugin {
    /**
     * The default table properties.
     */
    private _defaultContentTableProperties;
    /**
     * The default layout table properties.
     */
    private _defaultLayoutTableProperties;
    /**
     * The contextual balloon plugin instance.
     */
    private _balloon;
    /**
     * The properties form view displayed inside the balloon.
     */
    view: TablePropertiesViewExperimental | null;
    /**
     * The properties form view displayed inside the balloon (content table).
     */
    private _viewWithContentTableDefaults;
    /**
     * The properties form view displayed inside the balloon (layout table).
     */
    private _viewWithLayoutTableDefaults;
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
    static get pluginName(): "TablePropertiesUIExperimental";
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
     * Creates the table properties button.
     *
     * @internal
     */
    _createTablePropertiesButton(): ButtonView;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates the {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView} instance.
     *
     * @returns The table properties form view instance.
     */
    private _createPropertiesView;
    /**
     * In this method the "editor data -> UI" binding is happening.
     *
     * When executed, this method obtains selected table property values from various table commands
     * and passes them to the {@link #view}.
     *
     * This way, the UI stays up–to–date with the editor data.
     */
    private _fillViewFormFromCommandValues;
    /**
     * Shows the {@link #view} in the {@link #_balloon}.
     *
     * **Note**: Each time a view is shown, the new {@link #_undoStepBatch} is created that contains
     * all changes made to the document when the view is visible, allowing a single undo step
     * for all of them.
     */
    protected _showView(): void;
    /**
     * Removes the {@link #view} from the {@link #_balloon}.
     */
    protected _hideView(): void;
    /**
     * Repositions the {@link #_balloon} or hides the {@link #view} if a table is no longer selected.
     */
    protected _updateView(): void;
    /**
     * Returns `true` when the {@link #view} is the visible in the {@link #_balloon}.
     */
    private get _isViewVisible();
    /**
     * Returns `true` when the {@link #view} is in the {@link #_balloon}.
     */
    private get _isViewInBalloon();
    /**
     * Creates a callback that when executed upon {@link #view view's} property change
     * executes a related editor command with the new property value.
     *
     * If new value will be set to the default value, the command will not be executed.
     *
     * @param commandName The command that will be executed.
     */
    private _getPropertyChangeCallback;
    /**
     * Creates a callback that when executed upon {@link #view view's} property change:
     * * executes a related editor command with the new property value if the value is valid,
     * * or sets the error text next to the invalid field, if the value did not pass the validation.
     */
    private _getValidatedPropertyChangeCallback;
}

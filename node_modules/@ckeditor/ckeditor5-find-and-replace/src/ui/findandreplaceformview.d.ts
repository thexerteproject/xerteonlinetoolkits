/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module find-and-replace/ui/findandreplaceformview
 */
import { View, LabeledFieldView, FocusCycler, ViewCollection, type InputView } from 'ckeditor5/src/ui.js';
import { type Locale } from 'ckeditor5/src/utils.js';
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/findandreplaceform.css';
/**
 * The find and replace form view class.
 *
 * See {@link module:find-and-replace/ui/findandreplaceformview~FindAndReplaceFormView}.
 */
export declare class FindAndReplaceFormView extends View {
    /**
     * A collection of child views.
     */
    children: ViewCollection;
    /**
     * Stores the number of matched search results.
     *
     * @readonly
     * @observable
     */
    matchCount: number;
    /**
     * The offset of currently highlighted search result in {@link #matchCount matched results}.
     *
     * @observable
     */
    readonly highlightOffset: number;
    /**
     * `true` when the search params (find text, options) has been changed by the user since
     * the last time find was executed. `false` otherwise.
     *
     * @readonly
     * @observable
     */
    isDirty: boolean;
    /**
     * A live object with the aggregated `isEnabled` states of editor commands related to find and
     * replace. For instance, it may look as follows:
     *
     * ```json
     * {
     * 	findNext: true,
     * 	findPrevious: true,
     * 	replace: false,
     * 	replaceAll: false
     * }
     * ```
     *
     * @internal
     * @observable
     */
    readonly _areCommandsEnabled: Record<string, boolean>;
    /**
     * The content of the counter label displaying the index of the current highlighted match
     * on top of the find input, for instance "3 of 50".
     *
     * @internal
     * @readonly
     * @observable
     */
    _resultsCounterText: string;
    /**
     * The flag reflecting the state of the "Match case" switch button in the search options
     * dropdown.
     *
     * @internal
     * @readonly
     * @observable
     */
    _matchCase: boolean;
    /**
     * The flag reflecting the state of the "Whole words only" switch button in the search options
     * dropdown.
     *
     * @internal
     * @readonly
     * @observable
     */
    _wholeWordsOnly: boolean;
    /**
     * This flag is set `true` when some matches were found and the user didn't change the search
     * params (text to find, options) yet. This is only possible immediately after hitting the "Find" button.
     * `false` when there were no matches (see {@link #matchCount}) or the user changed the params (see {@link #isDirty}).
     *
     * It is used to control the enabled state of the replace UI (input and buttons); replacing text is only possible
     * if this flag is `true`.
     *
     * @internal
     * @observable
     */
    readonly _searchResultsFound: boolean;
    /**
     * The find in text input view that stores the searched string.
     *
     * @internal
     */
    readonly _findInputView: LabeledFieldView<InputView>;
    /**
     * The replace input view.
     */
    private readonly _replaceInputView;
    /**
     * The find button view that initializes the search process.
     */
    private readonly _findButtonView;
    /**
     * The find previous button view.
     */
    private readonly _findPrevButtonView;
    /**
     * The find next button view.
     */
    private readonly _findNextButtonView;
    /**
     * A collapsible view aggregating the advanced search options.
     */
    private readonly _advancedOptionsCollapsibleView;
    /**
     * A switch button view controlling the "Match case" option.
     */
    private readonly _matchCaseSwitchView;
    /**
     * A switch button view controlling the "Whole words only" option.
     */
    private readonly _wholeWordsOnlySwitchView;
    /**
     * The replace button view.
     */
    private readonly _replaceButtonView;
    /**
     * The replace all button view.
     */
    private readonly _replaceAllButtonView;
    /**
     * The `div` aggregating the inputs.
     */
    private readonly _inputsDivView;
    /**
     * The `div` aggregating the action buttons.
     */
    private readonly _actionButtonsDivView;
    /**
     * Tracks information about the DOM focus in the form.
     */
    private readonly _focusTracker;
    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     */
    private readonly _keystrokes;
    /**
     * A collection of views that can be focused in the form.
     */
    private readonly _focusables;
    /**
     * Helps cycling over {@link #_focusables} in the form.
     */
    readonly focusCycler: FocusCycler;
    locale: Locale;
    /**
     * Creates a view of find and replace form.
     *
     * @param locale The localization services instance.
     */
    constructor(locale: Locale);
    /**
     * @inheritDoc
     */
    render(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * @inheritDoc
     */
    focus(direction?: 1 | -1): void;
    /**
     * Resets the form before re-appearing.
     *
     * It clears error messages, hides the match counter and disables the replace feature
     * until the next hit of the "Find" button.
     *
     * **Note**: It does not reset inputs and options, though. This way the form works better in editors with
     * disappearing toolbar (e.g. BalloonEditor): hiding the toolbar by accident (together with the find and replace UI)
     * does not require filling the entire form again.
     */
    reset(): void;
    /**
     * Returns the value of the find input.
     */
    private get _textToFind();
    /**
     * Returns the value of the replace input.
     */
    private get _textToReplace();
    /**
     * Configures and returns the `<div>` aggregating all form inputs.
     */
    private _createInputsDiv;
    /**
     * The action performed when the {@link #_findButtonView} is pressed.
     */
    private _onFindButtonExecute;
    /**
     * Configures an injects the find results counter displaying a "N of M" label of the {@link #_findInputView}.
     */
    private _injectFindResultsCounter;
    /**
     * Creates the collapsible view aggregating the advanced search options.
     */
    private _createAdvancedOptionsCollapsible;
    /**
     * Configures and returns the `<div>` element aggregating all form action buttons.
     */
    private _createActionButtonsDiv;
    /**
     * Creates, configures and returns and instance of a dropdown allowing users to narrow
     * the search criteria down. The dropdown has a list with switch buttons for each option.
     */
    private _createMatchCaseSwitch;
    /**
     * Creates, configures and returns and instance of a dropdown allowing users to narrow
     * the search criteria down. The dropdown has a list with switch buttons for each option.
     */
    private _createWholeWordsOnlySwitch;
    /**
     * Initializes the {@link #_focusables} and {@link #_focusTracker} to allow navigation
     * using <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keystrokes in the right order.
     */
    private _initFocusCycling;
    /**
     * Initializes the keystroke handling in the form.
     */
    private _initKeystrokeHandling;
    /**
     * Creates a button view.
     *
     * @param options The properties of the `ButtonView`.
     * @returns The button view instance.
     */
    private _createButton;
    /**
     * Creates a labeled input view.
     *
     * @param label The input label.
     * @returns The labeled input view instance.
     */
    private _createInputField;
}
/**
 * Fired when the find next button is triggered.
 *
 * @eventName ~FindAndReplaceFormView#findNext
 * @param data The event data.
 */
export type FindNextEvent = {
    name: 'findNext';
    args: [data?: FindNextEventData];
};
export type FindNextEventData = FindEventBaseData & {
    matchCase: boolean;
    wholeWords: boolean;
};
/**
 * Fired when the find previous button is triggered.
 *
 * @eventName ~FindAndReplaceFormView#findPrevious
 * @param data The event data.
 */
export type FindPreviousEvent = {
    name: 'findPrevious';
    args: [data?: FindEventBaseData];
};
/**
 * Base type for all find/replace events.
 */
export type FindEventBaseData = {
    searchText: string;
};
/**
 * Fired when the replace button is triggered.
 *
 * @eventName ~FindAndReplaceFormView#replace
 * @param data The event data.
 */
export type ReplaceEvent = {
    name: 'replace';
    args: [data: ReplaceEventData];
};
export type ReplaceEventData = FindEventBaseData & {
    replaceText: string;
};
/**
 * Fired when the replaceAll button is triggered.
 *
 * @eventName ~FindAndReplaceFormView#replaceAll
 * @param data The event data.
 */
export type ReplaceAllEvent = {
    name: 'replaceAll';
    args: [data: ReplaceEventData];
};

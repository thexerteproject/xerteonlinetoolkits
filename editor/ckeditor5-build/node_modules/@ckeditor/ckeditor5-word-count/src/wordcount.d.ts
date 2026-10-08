/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
/**
 * The word count plugin.
 *
 * This plugin calculates all words and characters in all {@link module:engine/model/text~ModelText text nodes} available in the model.
 * It also provides an HTML element that updates its state whenever the editor content is changed.
 *
 * The model's data is first converted to plain text using {@link module:word-count/utils~modelElementToPlainText}.
 * The number of words and characters in your text are determined based on the created plain text. Please keep in mind
 * that every block in the editor is separated with a newline character, which is included in the calculation.
 *
 * Here are some examples of how the word and character calculations are made:
 *
 * ```html
 * <paragraph>foo</paragraph>
 * <paragraph>bar</paragraph>
 * // Words: 2, Characters: 7
 *
 * <paragraph><$text bold="true">foo</$text>bar</paragraph>
 * // Words: 1, Characters: 6
 *
 * <paragraph>*&^%)</paragraph>
 * // Words: 0, Characters: 5
 *
 * <paragraph>foo(bar)</paragraph>
 * //Words: 1, Characters: 8
 *
 * <paragraph>12345</paragraph>
 * // Words: 1, Characters: 5
 * ```
 */
export declare class WordCount extends Plugin {
    /**
     * The number of characters in the editor.
     *
     * @observable
     * @readonly
     */
    characters: number;
    /**
     * The number of words in the editor.
     *
     * @observable
     * @readonly
     */
    words: number;
    /**
     * The label used to display the words value in the {@link #wordCountContainer output container}.
     *
     * @observable
     * @private
     * @readonly
     */
    _wordsLabel: string | undefined;
    /**
     * The label used to display the characters value in the {@link #wordCountContainer output container}.
     *
     * @observable
     * @private
     * @readonly
     */
    _charactersLabel: string | undefined;
    /**
     * The configuration of this plugin.
     */
    private _config;
    /**
     * The reference to a {@link module:ui/view~View view object} that contains the self-updating HTML container.
     */
    private _outputView;
    /**
     * A regular expression used to recognize words in the editor's content.
     */
    private readonly _wordsMatchRegExp;
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    static get pluginName(): "WordCount";
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode(): string;
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin(): true;
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
    /**
     * Creates a self-updating HTML element. Repeated executions return the same element.
     * The returned element has the following HTML structure:
     *
     * ```html
     * <div class="ck ck-word-count">
     * 	<div class="ck-word-count__words">Words: 4</div>
     * 	<div class="ck-word-count__characters">Characters: 28</div>
     * </div>
     * ```
     */
    get wordCountContainer(): HTMLElement;
    private _getText;
    /**
     * Determines the number of characters in the current editor's model.
     */
    private _getCharacters;
    /**
     * Determines the number of words in the current editor's model.
     */
    private _getWords;
    /**
     * Determines the number of words and characters in the current editor's model and assigns it to {@link #characters} and {@link #words}.
     * It also fires the {@link #event:update}.
     *
     * @fires update
     */
    private _refreshStats;
}
/**
 * An event fired after {@link ~WordCount#words} and {@link ~WordCount#characters} are updated.
 *
 * @eventName ~WordCount#update
 */
export type WordCountUpdateEvent = {
    name: 'update';
    args: [{
        words: number;
        characters: number;
    }];
};

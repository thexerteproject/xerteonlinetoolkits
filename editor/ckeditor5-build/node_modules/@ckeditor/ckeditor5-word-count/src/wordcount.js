/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { Template, View } from 'ckeditor5/src/ui.js';
import { env } from 'ckeditor5/src/utils.js';
import { modelElementToPlainText } from './utils.js';
import { throttle, isElement } from 'es-toolkit/compat';
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
export class WordCount extends Plugin {
    /**
     * The configuration of this plugin.
     */
    _config;
    /**
     * The reference to a {@link module:ui/view~View view object} that contains the self-updating HTML container.
     */
    _outputView;
    /**
     * A regular expression used to recognize words in the editor's content.
     */
    _wordsMatchRegExp;
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        this.set('characters', 0);
        this.set('words', 0);
        // Don't wait for the #update event to set the value of the properties but obtain it right away.
        // This way, accessing the properties directly returns precise numbers, e.g. for validation, etc.
        // If not accessed directly, the properties will be refreshed upon #update anyway.
        Object.defineProperties(this, {
            characters: {
                get() {
                    return (this.characters = this._getCharacters(this._getText()));
                }
            },
            words: {
                get() {
                    return (this.words = this._getWords(this._getText()));
                }
            }
        });
        this.set('_wordsLabel', undefined);
        this.set('_charactersLabel', undefined);
        this._config = editor.config.get('wordCount') || {};
        this._outputView = undefined;
        this._wordsMatchRegExp = env.features.isRegExpUnicodePropertySupported ?
            // Usage of regular expression literal cause error during build (ckeditor/ckeditor5-dev#534).
            // Groups:
            // {L} - Any kind of letter from any language.
            // {N} - Any kind of numeric character in any script.
            new RegExp('([\\p{L}\\p{N}]+\\S?)+', 'gu') :
            /([a-zA-Z0-9À-ž]+\S?)+/gu;
    }
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'WordCount';
    }
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode() {
        return 'WC';
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
    static get isPremiumPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        editor.model.document.on('change:data', throttle(this._refreshStats.bind(this), 250));
        if (typeof this._config.onUpdate == 'function') {
            this.on('update', (evt, data) => {
                this._config.onUpdate(data);
            });
        }
        if (isElement(this._config.container)) {
            this._config.container.appendChild(this.wordCountContainer);
        }
    }
    /**
     * @inheritDoc
     */
    destroy() {
        if (this._outputView) {
            this._outputView.element.remove();
            this._outputView.destroy();
        }
        super.destroy();
    }
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
    get wordCountContainer() {
        const editor = this.editor;
        const t = editor.t;
        const displayWords = editor.config.get('wordCount.displayWords');
        const displayCharacters = editor.config.get('wordCount.displayCharacters');
        const bind = Template.bind(this, this);
        const children = [];
        if (!this._outputView) {
            this._outputView = new View();
            if (displayWords || displayWords === undefined) {
                this.bind('_wordsLabel').to(this, 'words', words => {
                    return t('Words: %0', words);
                });
                children.push({
                    tag: 'div',
                    children: [
                        {
                            text: [bind.to('_wordsLabel')]
                        }
                    ],
                    attributes: {
                        class: 'ck-word-count__words'
                    }
                });
            }
            if (displayCharacters || displayCharacters === undefined) {
                this.bind('_charactersLabel').to(this, 'characters', words => {
                    return t('Characters: %0', words);
                });
                children.push({
                    tag: 'div',
                    children: [
                        {
                            text: [bind.to('_charactersLabel')]
                        }
                    ],
                    attributes: {
                        class: 'ck-word-count__characters'
                    }
                });
            }
            this._outputView.setTemplate({
                tag: 'div',
                attributes: {
                    class: [
                        'ck',
                        'ck-word-count'
                    ]
                },
                children
            });
            this._outputView.render();
        }
        return this._outputView.element;
    }
    _getText() {
        let txt = '';
        for (const root of this.editor.model.document.getRoots()) {
            if (txt !== '') {
                // Add a delimiter, so words from each root are treated independently.
                txt += '\n';
            }
            txt += modelElementToPlainText(root);
        }
        return txt;
    }
    /**
     * Determines the number of characters in the current editor's model.
     */
    _getCharacters(txt) {
        return txt.replace(/\n/g, '').length;
    }
    /**
     * Determines the number of words in the current editor's model.
     */
    _getWords(txt) {
        const detectedWords = txt.match(this._wordsMatchRegExp) || [];
        return detectedWords.length;
    }
    /**
     * Determines the number of words and characters in the current editor's model and assigns it to {@link #characters} and {@link #words}.
     * It also fires the {@link #event:update}.
     *
     * @fires update
     */
    _refreshStats() {
        const txt = this._getText();
        const words = this.words = this._getWords(txt);
        const characters = this.characters = this._getCharacters(txt);
        this.fire('update', {
            words,
            characters
        });
    }
}

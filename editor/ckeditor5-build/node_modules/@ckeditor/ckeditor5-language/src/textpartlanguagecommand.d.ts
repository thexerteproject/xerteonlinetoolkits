/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module language/textpartlanguagecommand
 */
import type { LanguageDirection } from 'ckeditor5/src/utils.js';
import { Command } from 'ckeditor5/src/core.js';
/**
 * The text part language command plugin.
 */
export declare class TextPartLanguageCommand extends Command {
    /**
     * If the selection starts in a language attribute, the value is set to
     * the value of that language in the following format:
     *
     * ```
     * <languageCode>:<textDirection>
     * ```
     *
     * * `languageCode` - The language code used for the `lang` attribute in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
     *    format.
     * * `textDirection` - One of the following values: `rtl` or `ltr`, indicating the reading direction of the language.
     *
     * See the {@link module:core/editor/editorconfig~LanguageConfig#textPartLanguage text part language configuration}
     * for more information about language properties.
     *
     * It is set to `false` otherwise.
     *
     * @observable
     * @readonly
     */
    value: false | string;
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command. Applies the attribute to the selection or removes it from the selection.
     *
     * If `languageCode` is set to `false` or a `null` value, it will remove attributes. Otherwise, it will set
     * the attribute in the `{@link #value value}` format.
     *
     * The execution result differs, depending on the {@link module:engine/model/document~ModelDocument#selection}:
     *
     * * If the selection is on a range, the command applies the attribute to all nodes in that range
     * (if they are allowed to have this attribute by the {@link module:engine/model/schema~ModelSchema schema}).
     * * If the selection is collapsed in a non-empty node, the command applies the attribute to the
     * {@link module:engine/model/document~ModelDocument#selection} itself (note that typed characters copy attributes from the selection).
     * * If the selection is collapsed in an empty node, the command applies the attribute to the parent node of the selection (note
     * that the selection inherits all attributes from a node if it is in an empty node).
     *
     * @fires execute
     * @param options Command options.
     * @param options.languageCode The language code to be applied to the model.
     * @param options.textDirection The language text direction.
     */
    execute({ languageCode, textDirection }?: {
        languageCode?: string | false;
        textDirection?: LanguageDirection;
    }): void;
    /**
     * Returns the attribute value of the first node in the selection that allows the attribute.
     * For a collapsed selection it returns the selection attribute.
     *
     * @returns The attribute value.
     */
    private _getValueFromFirstAllowedNode;
}

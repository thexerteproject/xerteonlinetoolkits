/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { type NormalizedStyleDefinitions } from './styleutils.js';
/**
 * Style command.
 *
 * Applies and removes styles from selection and elements.
 */
export declare class StyleCommand extends Command {
    /**
     * Set of currently applied styles on the current selection.
     *
     * Names of styles correspond to the `name` property of
     * {@link module:style/styleconfig~StyleDefinition configured definitions}.
     *
     * @observable
     */
    value: Array<string>;
    /**
     * Names of enabled styles (styles that can be applied to the current selection).
     *
     * Names of enabled styles correspond to the `name` property of
     * {@link module:style/styleconfig~StyleDefinition configured definitions}.
     *
     * @observable
     */
    enabledStyles: Array<string>;
    /**
     * Normalized definitions of the styles.
     */
    private readonly _styleDefinitions;
    /**
     * The StyleUtils plugin.
     */
    private _styleUtils;
    /**
     * Creates an instance of the command.
     *
     * @param editor Editor on which this command will be used.
     * @param styleDefinitions Normalized definitions of the styles.
     */
    constructor(editor: Editor, styleDefinitions: NormalizedStyleDefinitions);
    /**
     * @inheritDoc
     */
    refresh(): void;
    /**
     * Executes the command &ndash; applies the style classes to the selection or removes it from the selection.
     *
     * If the command value already contains the requested style, it will remove the style classes. Otherwise, it will set it.
     *
     * The execution result differs, depending on the {@link module:engine/model/document~ModelDocument#selection} and the
     * style type (inline or block):
     *
     * * When applying inline styles:
     *   * If the selection is on a range, the command applies the style classes to all nodes in that range.
     *   * If the selection is collapsed in a non-empty node, the command applies the style classes to the
     * {@link module:engine/model/document~ModelDocument#selection}.
     *
     * * When applying block styles:
     *   * If the selection is on a range, the command applies the style classes to the nearest block parent element.
     *
     * @fires execute
     * @param options Command options.
     * @param options.styleName Style name matching the one defined in the
     * {@link module:style/styleconfig~StyleConfig#definitions configuration}.
     * @param options.forceValue Whether the command should add given style (`true`) or remove it (`false`) from the selection.
     * If not set (default), the command will toggle the style basing on the first selected node. Note, that this will not force
     * setting a style on an element that cannot receive given style.
     */
    execute({ styleName, forceValue }: {
        styleName: string;
        forceValue?: boolean;
    }): void;
    /**
     * Returns a set of elements that should be affected by the block-style change.
     */
    private _findAffectedBlocks;
}

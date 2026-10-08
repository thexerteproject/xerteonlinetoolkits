/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module style/styleutils
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { ModelElement, ModelDocumentSelection, ModelSelectable } from 'ckeditor5/src/engine.js';
import type { DecoratedMethodEvent } from 'ckeditor5/src/utils.js';
import type { TemplateDefinition } from 'ckeditor5/src/ui.js';
import type { DataSchema } from '@ckeditor/ckeditor5-html-support';
import type { StyleDefinition } from './styleconfig.js';
export declare class StyleUtils extends Plugin {
    private _htmlSupport;
    /**
     * @inheritDoc
     */
    static get pluginName(): "StyleUtils";
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
     * Normalizes {@link module:style/styleconfig~StyleConfig#definitions} in the configuration of the styles feature.
     * The structure of normalized styles looks as follows:
     *
     * ```ts
     * {
     * 	block: [
     * 		<module:style/style~StyleDefinition>,
     * 		<module:style/style~StyleDefinition>,
     * 		...
     * 	],
     * 	inline: [
     * 		<module:style/style~StyleDefinition>,
     * 		<module:style/style~StyleDefinition>,
     * 		...
     * 	]
     * }
     * ```
     *
     * @returns An object with normalized style definitions grouped into `block` and `inline` categories (arrays).
     */
    normalizeConfig(dataSchema: DataSchema, styleDefinitions?: Array<StyleDefinition>): NormalizedStyleDefinitions;
    /**
     * Verifies if the given style is applicable to the provided block element.
     *
     * @internal
     */
    isStyleEnabledForBlock(definition: BlockStyleDefinition, block: ModelElement): boolean;
    /**
     * Returns true if the given style is applied to the specified block element.
     *
     * @internal
     */
    isStyleActiveForBlock(definition: BlockStyleDefinition, block: ModelElement): boolean;
    /**
     * Returns an array of block elements that style should be applied to.
     *
     * @internal
     */
    getAffectedBlocks(definition: BlockStyleDefinition, block: ModelElement): Array<ModelElement> | null;
    /**
     * Verifies if the given style is applicable to the provided document selection.
     *
     * @internal
     */
    isStyleEnabledForInlineSelection(definition: InlineStyleDefinition, selection: ModelDocumentSelection): boolean;
    /**
     * Returns true if the given style is applied to the specified document selection.
     *
     * @internal
     */
    isStyleActiveForInlineSelection(definition: InlineStyleDefinition, selection: ModelDocumentSelection): boolean;
    /**
     * Returns a selectable that given style should be applied to.
     *
     * @internal
     */
    getAffectedInlineSelectable(definition: InlineStyleDefinition, selection: ModelDocumentSelection): ModelSelectable;
    /**
     * Returns the `TemplateDefinition` used by styles dropdown to render style preview.
     *
     * @internal
     */
    getStylePreview(definition: StyleDefinition, children: Iterable<TemplateDefinition>): TemplateDefinition;
    /**
     * Verifies if all classes are present in the given GHS attribute.
     *
     * @internal
     */
    hasAllClasses(ghsAttributeValue: unknown, classes: Array<string>): boolean;
    /**
     * This is where the styles feature configures the GHS feature. This method translates normalized
     * {@link module:style/styleconfig~StyleDefinition style definitions} to
     * {@link module:engine/view/matcher~MatcherObjectPattern matcher patterns} and feeds them to the GHS
     * {@link module:html-support/datafilter~DataFilter} plugin.
     *
     * @internal
     */
    configureGHSDataFilter({ block, inline }: NormalizedStyleDefinitions): void;
    /**
     * Checks the attribute value of the first node in the selection that allows the attribute.
     * For the collapsed selection, returns the selection attribute.
     *
     * @param selection The document selection.
     * @param attributeName Name of the GHS attribute.
     * @returns The attribute value.
     */
    private _getValueFromFirstAllowedNode;
}
export interface NormalizedStyleDefinitions {
    block: Array<BlockStyleDefinition>;
    inline: Array<InlineStyleDefinition>;
}
export interface BlockStyleDefinition extends StyleDefinition {
    isBlock: true;
    modelElements: Array<string>;
    previewTemplate: TemplateDefinition;
}
export interface InlineStyleDefinition extends StyleDefinition {
    ghsAttributes: Array<string>;
    previewTemplate: TemplateDefinition;
}
export type NormalizedStyleDefinition = BlockStyleDefinition | InlineStyleDefinition;
export type StyleUtilsIsEnabledForBlockEvent = DecoratedMethodEvent<StyleUtils, 'isStyleEnabledForBlock'>;
export type StyleUtilsIsActiveForBlockEvent = DecoratedMethodEvent<StyleUtils, 'isStyleActiveForBlock'>;
export type StyleUtilsGetAffectedBlocksEvent = DecoratedMethodEvent<StyleUtils, 'getAffectedBlocks'>;
export type StyleUtilsIsStyleEnabledForInlineSelectionEvent = DecoratedMethodEvent<StyleUtils, 'isStyleEnabledForInlineSelection'>;
export type StyleUtilsIsStyleActiveForInlineSelectionEvent = DecoratedMethodEvent<StyleUtils, 'isStyleActiveForInlineSelection'>;
export type StyleUtilsGetAffectedInlineSelectableEvent = DecoratedMethodEvent<StyleUtils, 'getAffectedInlineSelectable'>;
export type StyleUtilsGetStylePreviewEvent = DecoratedMethodEvent<StyleUtils, 'getStylePreview'>;
export type StyleUtilsConfigureGHSDataFilterEvent = DecoratedMethodEvent<StyleUtils, 'configureGHSDataFilter'>;

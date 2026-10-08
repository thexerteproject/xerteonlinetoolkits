/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/linkediting
 */
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { Input, TwoStepCaretMovement } from 'ckeditor5/src/typing.js';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard.js';
import '../theme/link.css';
/**
 * The link engine feature.
 *
 * It introduces the `linkHref="url"` attribute in the model which renders to the view as a `<a href="url">` element
 * as well as `'link'` and `'unlink'` commands.
 */
export declare class LinkEditing extends Plugin {
    /**
     * A list of functions that handles opening links. If any of them returns `true`, the link is considered to be opened.
     */
    private readonly _linkOpeners;
    /**
     * @inheritDoc
     */
    static get pluginName(): "LinkEditing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof TwoStepCaretMovement, typeof Input, typeof ClipboardPipeline];
    /**
     * @inheritDoc
     */
    constructor(editor: Editor);
    /**
     * @inheritDoc
     */
    init(): void;
    /**
     * Registers a function that opens links in a new browser tab.
     *
     * @param linkOpener The function that opens a link in a new browser tab.
     * @internal
     */
    _registerLinkOpener(linkOpener: LinkOpener): void;
    /**
     * Processes an array of configured {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorators}
     * and registers a {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher downcast dispatcher}
     * for each one of them. Downcast dispatchers are obtained using the
     * {@link module:link/utils/automaticdecorators~AutomaticLinkDecorators#getDispatcher} method.
     *
     * **Note**: This method also activates the automatic external link decorator if enabled with
     * {@link module:link/linkconfig~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}.
     */
    private _enableAutomaticDecorators;
    /**
     * Processes an array of configured {@link module:link/linkconfig~LinkDecoratorManualDefinition manual decorators},
     * transforms them into {@link module:link/utils/manualdecorator~LinkManualDecorator} instances and stores them in the
     * {@link module:link/linkcommand~LinkCommand#manualDecorators} collection (a model for manual decorators state).
     *
     * Also registers an {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement attribute-to-element}
     * converter for each manual decorator and extends the {@link module:engine/model/schema~ModelSchema model's schema}
     * with adequate model attributes.
     */
    private _enableManualDecorators;
    /**
     * Attaches handlers for {@link module:engine/view/document~ViewDocument#event:enter} and
     * {@link module:engine/view/document~ViewDocument#event:click} to enable link following.
     */
    private _enableLinkOpen;
    /**
     * Watches the ModelDocumentSelection attribute changes and removes link decorator attributes when the linkHref attribute is removed.
     *
     * This is to ensure that there is no left-over link decorator attributes on the document selection that is no longer in a link.
     */
    private _enableSelectionAttributesFixer;
    /**
     * Enables URL fixing on pasting.
     */
    private _enableClipboardIntegration;
    /**
     * Registers a postfixer that resolves conflicting decorator attributes on elements.
     */
    private _enableDecoratorConflictPostfixer;
}
/**
 * A function that handles opening links. It may be used to define custom link handlers.
 *
 * @returns `true` if the link was opened successfully.
 */
type LinkOpener = (url: string) => boolean;
export {};

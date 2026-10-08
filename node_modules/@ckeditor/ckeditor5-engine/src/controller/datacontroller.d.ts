/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Mapper } from '../conversion/mapper.js';
import { DowncastDispatcher } from '../conversion/downcastdispatcher.js';
import { UpcastDispatcher } from '../conversion/upcastdispatcher.js';
import { ViewDocumentFragment } from '../view/documentfragment.js';
import { ViewDocument } from '../view/document.js';
import { type ViewElement } from '../view/element.js';
import type { StylesProcessor } from '../view/stylesmap.js';
import type { MatcherPattern } from '../view/matcher.js';
import { type Model } from '../model/model.js';
import { type ModelElement } from '../model/element.js';
import { type ModelDocumentFragment } from '../model/documentfragment.js';
import type { ModelSchemaContextDefinition } from '../model/schema.js';
import type { BatchType } from '../model/batch.js';
import { HtmlDataProcessor } from '../dataprocessor/htmldataprocessor.js';
import { type DataProcessor } from '../dataprocessor/dataprocessor.js';
declare const DataController_base: {
    new (): import("@ckeditor/ckeditor5-utils").Emitter;
    prototype: import("@ckeditor/ckeditor5-utils").Emitter;
};
/**
 * Controller for the data pipeline. The data pipeline controls how data is retrieved from the document
 * and set inside it. Hence, the controller features two methods which allow to {@link ~DataController#get get}
 * and {@link ~DataController#set set} data of the {@link ~DataController#model model}
 * using the given:
 *
 * * {@link module:engine/dataprocessor/dataprocessor~DataProcessor data processor},
 * * downcast converters,
 * * upcast converters.
 *
 * An instance of the data controller is always available in the {@link module:core/editor/editor~Editor#data `editor.data`}
 * property:
 *
 * ```ts
 * editor.data.get( { rootName: 'customRoot' } ); // -> '<p>Hello!</p>'
 * ```
 */
export declare class DataController extends /* #__PURE__ */ DataController_base {
    /**
     * Data model.
     */
    readonly model: Model;
    /**
     * Mapper used for the conversion. It has no permanent bindings, because these are created while getting data and
     * are cleared directly after the data are converted. However, the mapper is defined as a class property, because
     * it needs to be passed to the `DowncastDispatcher` as a conversion API.
     */
    readonly mapper: Mapper;
    /**
     * Downcast dispatcher used by the {@link #get get method}. Downcast converters should be attached to it.
     */
    readonly downcastDispatcher: DowncastDispatcher;
    /**
     * Upcast dispatcher used by the {@link #set set method}. Upcast converters should be attached to it.
     */
    readonly upcastDispatcher: UpcastDispatcher;
    /**
     * The view document used by the data controller.
     */
    readonly viewDocument: ViewDocument;
    /**
     * Styles processor used during the conversion.
     */
    readonly stylesProcessor: StylesProcessor;
    /**
     * Data processor used specifically for HTML conversion.
     */
    readonly htmlProcessor: HtmlDataProcessor;
    /**
     * Data processor used during the conversion.
     * Same instance as {@link #htmlProcessor} by default. Can be replaced at run time to handle different format, e.g. XML or Markdown.
     */
    processor: DataProcessor;
    /**
     * The view downcast writer just for data conversion purposes, i.e. to modify
     * the {@link #viewDocument}.
     */
    private readonly _viewWriter;
    /**
     * Creates a data controller instance.
     *
     * @param model Data model.
     * @param stylesProcessor The styles processor instance.
     */
    constructor(model: Model, stylesProcessor: StylesProcessor);
    /**
     * Returns the model's data converted by downcast dispatchers attached to {@link #downcastDispatcher} and
     * formatted by the {@link #processor data processor}.
     *
     * A warning is logged when you try to retrieve data for a detached root, as most probably this is a mistake. A detached root should
     * be treated like it is removed, and you should not save its data. Note, that the detached root data is always an empty string.
     *
     * @fires get
     * @param options Additional configuration for the retrieved data. `DataController` provides two optional
     * properties: `rootName` and `trim`. Other properties of this object are specified by various editor features.
     * @param options.rootName Root name. Default 'main'.
     * @param options.trim Whether returned data should be trimmed. This option is set to `empty` by default,
     * which means whenever editor content is considered empty, an empty string will be returned. To turn off trimming completely
     * use `'none'`. In such cases the exact content will be returned (for example a `<p>&nbsp;</p>` for an empty editor).
     * @returns Output data.
     */
    get(options?: {
        rootName?: string;
        trim?: 'empty' | 'none';
        [key: string]: unknown;
    }): string;
    /**
     * Returns the content of the given {@link module:engine/model/element~ModelElement model's element} or
     * {@link module:engine/model/documentfragment~ModelDocumentFragment model document fragment} converted by the downcast converters
     * attached to the {@link #downcastDispatcher} and formatted by the {@link #processor data processor}.
     *
     * @param modelElementOrFragment The element whose content will be stringified.
     * @param options Additional configuration passed to the conversion process.
     * @returns Output data.
     */
    stringify(modelElementOrFragment: ModelElement | ModelDocumentFragment, options?: Record<string, unknown>): string;
    /**
     * Returns the content of the given {@link module:engine/model/element~ModelElement model element} or
     * {@link module:engine/model/documentfragment~ModelDocumentFragment model document fragment} converted by the downcast
     * converters attached to {@link #downcastDispatcher} into a
     * {@link module:engine/view/documentfragment~ViewDocumentFragment view document fragment}.
     *
     * @fires toView
     * @param modelElementOrFragment Element or document fragment whose content will be converted.
     * @param options Additional configuration that will be available through the
     * {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi#options} during the conversion process.
     * @returns Output view ModelDocumentFragment.
     */
    toView(modelElementOrFragment: ModelElement | ModelDocumentFragment, options?: Record<string, unknown>): ViewDocumentFragment;
    /**
     * Sets the initial input data parsed by the {@link #processor data processor} and
     * converted by the {@link #upcastDispatcher view-to-model converters}.
     * Initial data can be only set to a document whose {@link module:engine/model/document~ModelDocument#version} is equal 0.
     *
     * **Note** This method is {@link module:utils/observablemixin~Observable#decorate decorated} which is
     * used by e.g. collaborative editing plugin that syncs remote data on init.
     *
     * When data is passed as a string, it is initialized on the default `main` root:
     *
     * ```ts
     * dataController.init( '<p>Foo</p>' ); // Initializes data on the `main` root only, as no other is specified.
     * ```
     *
     * To initialize data on a different root or multiple roots at once, an object containing `rootName` - `data` pairs should be passed:
     *
     * ```ts
     * dataController.init( { main: '<p>Foo</p>', title: '<h1>Bar</h1>' } ); // Initializes data on both the `main` and `title` roots.
     * ```
     *
     * @fires init
     * @param data Input data as a string or an object containing the `rootName` - `data`
     * pairs to initialize data on multiple roots at once.
     * @returns Promise that is resolved after the data is set on the editor.
     */
    init(data: string | Record<string, string>): Promise<void>;
    /**
     * Sets the input data parsed by the {@link #processor data processor} and
     * converted by the {@link #upcastDispatcher view-to-model converters}.
     * This method can be used any time to replace existing editor data with the new one without clearing the
     * {@link module:engine/model/document~ModelDocument#history document history}.
     *
     * This method also creates a batch with all the changes applied. If all you need is to parse data, use
     * the {@link #parse} method.
     *
     * When data is passed as a string it is set on the default `main` root:
     *
     * ```ts
     * dataController.set( '<p>Foo</p>' ); // Sets data on the `main` root, as no other is specified.
     * ```
     *
     * To set data on a different root or multiple roots at once, an object containing `rootName` - `data` pairs should be passed:
     *
     * ```ts
     * dataController.set( { main: '<p>Foo</p>', title: '<h1>Bar</h1>' } ); // Sets data on the `main` and `title` roots as specified.
     * ```
     *
     * To set the data with a preserved undo stack and add the change to the undo stack, set `{ isUndoable: true }` as a `batchType` option.
     *
     * ```ts
     * dataController.set( '<p>Foo</p>', { batchType: { isUndoable: true } } );
     * ```
     *
     * @fires set
     * @param data Input data as a string or an object containing the `rootName` - `data`
     * pairs to set data on multiple roots at once.
     * @param options Options for setting data.
     * @param options.batchType The batch type that will be used to create a batch for the changes applied by this method.
     * By default, the batch will be set as {@link module:engine/model/batch~Batch#isUndoable not undoable} and the undo stack will be
     * cleared after the new data is applied (all undo steps will be removed). If the batch type `isUndoable` flag is be set to `true`,
     * the undo stack will be preserved instead and not cleared when new data is applied.
     */
    set(data: string | Record<string, string>, options?: {
        batchType?: BatchType;
        [key: string]: unknown;
    }): void;
    /**
     * Returns the data parsed by the {@link #processor data processor} and then converted by upcast converters
     * attached to the {@link #upcastDispatcher}.
     *
     * @see #set
     * @param data Data to parse.
     * @param context Base context in which the view will be converted to the model.
     * See: {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#convert}.
     * @returns Parsed data.
     */
    parse(data: string, context?: ModelSchemaContextDefinition): ModelDocumentFragment;
    /**
     * Returns the result of the given {@link module:engine/view/element~ViewElement view element} or
     * {@link module:engine/view/documentfragment~ViewDocumentFragment view document fragment} converted by the
     * {@link #upcastDispatcher view-to-model converters}, wrapped by {@link module:engine/model/documentfragment~ModelDocumentFragment}.
     *
     * When marker elements were converted during the conversion process, it will be set as a document fragment's
     * {@link module:engine/model/documentfragment~ModelDocumentFragment#markers static markers map}.
     *
     * @fires toModel
     * @param viewElementOrFragment The element or document fragment whose content will be converted.
     * @param context Base context in which the view will be converted to the model.
     * See: {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#convert}.
     * @returns Output document fragment.
     */
    toModel(viewElementOrFragment: ViewElement | ViewDocumentFragment, context?: ModelSchemaContextDefinition): ModelDocumentFragment;
    /**
     * Adds the style processor normalization rules.
     *
     * You can implement your own rules as well as use one of the available processor rules:
     *
     * * background: {@link module:engine/view/styles/background~addBackgroundStylesRules}
     * * border: {@link module:engine/view/styles/border~addBorderStylesRules}
     * * margin: {@link module:engine/view/styles/margin~addMarginStylesRules}
     * * padding: {@link module:engine/view/styles/padding~addPaddingStylesRules}
     */
    addStyleProcessorRules(callback: (stylesProcessor: StylesProcessor) => void): void;
    /**
     * Registers a {@link module:engine/view/matcher~MatcherPattern} on an {@link #htmlProcessor htmlProcessor}
     * and a {@link #processor processor} for view elements whose content should be treated as raw data
     * and not processed during the conversion from DOM to view elements.
     *
     * The raw data can be later accessed by the
     * {@link module:engine/view/element~ViewElement#getCustomProperty view element custom property}
     * `"$rawContent"`.
     *
     * @param pattern Pattern matching all view elements whose content should be treated as a raw data.
     */
    registerRawContentMatcher(pattern: MatcherPattern): void;
    /**
     * Removes all event listeners set by the DataController.
     */
    destroy(): void;
    /**
     * Checks whether all provided root names are actually existing editor roots.
     *
     * @param rootNames Root names to check.
     * @returns Whether all provided root names are existing editor roots.
     */
    private _checkIfRootsExists;
}
/**
 * Event fired once the data initialization has finished.
 *
 * @eventName ~DataController#ready
 */
export type DataControllerReadyEvent = {
    name: 'ready';
    args: [];
};
/**
 * An event fired after the {@link ~DataController#init `init()` method} was run. It can be {@link ~DataController#listenTo listened to} in
 * order to adjust or modify the initialization flow. However, if the `init` event is stopped or prevented,
 * the {@link ~DataController#event:ready `ready` event} should be fired manually.
 *
 * The `init` event is fired by the decorated {@link ~DataController#init} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#init
 */
export type DataControllerInitEvent = {
    name: 'init';
    args: [Parameters<DataController['init']>];
    return: ReturnType<DataController['init']>;
};
/**
 * An event fired after {@link ~DataController#set set() method} has been run.
 *
 * The `set` event is fired by the decorated {@link ~DataController#set} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#set
 */
export type DataControllerSetEvent = {
    name: 'set';
    args: [Parameters<DataController['set']>];
    return: ReturnType<DataController['set']>;
};
/**
 * Event fired after the {@link ~DataController#get get() method} has been run.
 *
 * The `get` event is fired by the decorated {@link ~DataController#get} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#get
 */
export type DataControllerGetEvent = {
    name: 'get';
    args: [Parameters<DataController['get']>];
    return: ReturnType<DataController['get']>;
};
/**
 * Event fired after the {@link ~DataController#toView toView() method} has been run.
 *
 * The `toView` event is fired by the decorated {@link ~DataController#toView} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#toView
 */
export type DataControllerToViewEvent = {
    name: 'toView';
    args: [Parameters<DataController['toView']>];
    return: ReturnType<DataController['toView']>;
};
/**
 * Event fired after the {@link ~DataController#toModel toModel() method} has been run.
 *
 * The `toModel` event is fired by the decorated {@link ~DataController#toModel} method.
 * See {@link module:utils/observablemixin~Observable#decorate} for more information and samples.
 *
 * @eventName ~DataController#toModel
 */
export type DataControllerToModelEvent = {
    name: 'toModel';
    args: [Parameters<DataController['toModel']>];
    return: ReturnType<DataController['toModel']>;
};
export {};

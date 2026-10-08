/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/utils/manualdecorator
 */
import { type ArrayOrItem } from 'ckeditor5/src/utils.js';
import type { MatcherObjectPattern } from 'ckeditor5/src/engine.js';
import type { NormalizedLinkDecoratorManualDefinition } from '../utils.js';
declare const LinkManualDecorator_base: {
    new (): import("ckeditor5/src/utils.js").Observable;
    prototype: import("ckeditor5/src/utils.js").Observable;
};
/**
 * Helper class that stores manual decorators with observable {@link module:link/utils/manualdecorator~LinkManualDecorator#value}
 * to support integration with the UI state. An instance of this class is a model with the state of individual manual decorators.
 * These decorators are kept as collections in {@link module:link/linkcommand~LinkCommand#manualDecorators}.
 */
export declare class LinkManualDecorator extends /* #__PURE__ */ LinkManualDecorator_base {
    /**
     * An ID of a manual decorator which is the name of the attribute in the model, for example: 'linkManualDecorator0'.
     */
    id: string;
    /**
     * The value of the current manual decorator. It reflects its state from the UI.
     *
     * @observable
     */
    value: boolean | undefined;
    /**
     * The default value of manual decorator.
     */
    defaultValue?: boolean;
    /**
     * The label used in the user interface to toggle the manual decorator.
     */
    label: string;
    /**
     * A set of attributes added to downcasted data when the decorator is activated for a specific link.
     * Attributes should be added in a form of attributes defined in {@link module:engine/view/elementdefinition~ViewElementDefinition}.
     */
    attributes?: Record<string, string>;
    /**
     * A set of classes added to downcasted data when the decorator is activated for a specific link.
     * Classes should be added in a form of classes defined in {@link module:engine/view/elementdefinition~ViewElementDefinition}.
     */
    classes?: ArrayOrItem<string>;
    /**
     * A set of styles added to downcasted data when the decorator is activated for a specific link.
     * Styles should be added in a form of styles defined in {@link module:engine/view/elementdefinition~ViewElementDefinition}.
     */
    styles?: Record<string, string>;
    /**
     * Creates a new instance of {@link module:link/utils/manualdecorator~LinkManualDecorator}.
     *
     * @param options The configuration object.
     */
    constructor({ id, label, attributes, classes, styles, defaultValue }: NormalizedLinkDecoratorManualDefinition);
    /**
     * Returns {@link module:engine/view/matcher~MatcherPattern} with decorator attributes.
     *
     * @internal
     */
    _createPattern(): MatcherObjectPattern;
}
export {};

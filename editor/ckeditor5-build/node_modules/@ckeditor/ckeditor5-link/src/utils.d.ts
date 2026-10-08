/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module link/utils
 */
import type { DowncastConversionApi, ModelElement, ModelSchema, ViewAttributeElement, ViewNode, ViewDocumentFragment, ModelRange } from 'ckeditor5/src/engine.js';
import type { LocaleTranslate } from 'ckeditor5/src/utils.js';
import type { LinkDecoratorAutomaticDefinition, LinkDecoratorDefinition, LinkDecoratorManualDefinition } from './linkconfig.js';
/**
 * A keystroke used by the {@link module:link/linkui~LinkUI link UI feature}.
 */
export declare const LINK_KEYSTROKE = "Ctrl+K";
/**
 * Returns `true` if a given view node is the link element.
 */
export declare function isLinkElement(node: ViewNode | ViewDocumentFragment): boolean;
/**
 * Creates a link {@link module:engine/view/attributeelement~ViewAttributeElement} with the provided `href` attribute.
 */
export declare function createLinkElement(href: string, { writer }: DowncastConversionApi): ViewAttributeElement;
/**
 * Returns a safe URL based on a given value.
 *
 * A URL is considered safe if it is safe for the user (does not contain any malicious code).
 *
 * If a URL is considered unsafe, a simple `"#"` is returned.
 *
 * @internal
 */
export declare function ensureSafeUrl(url: unknown, allowedProtocols?: Array<string>): string;
/**
 * Returns the {@link module:link/linkconfig~LinkConfig#decorators `config.link.decorators`} configuration processed
 * to respect the locale of the editor, i.e. to display the {@link module:link/linkconfig~LinkDecoratorManualDefinition label}
 * in the correct language.
 *
 * **Note**: Only the few most commonly used labels are translated automatically. Other labels should be manually
 * translated in the {@link module:link/linkconfig~LinkConfig#decorators `config.link.decorators`} configuration.
 *
 * @param t Shorthand for {@link module:utils/locale~Locale#t Locale#t}.
 * @param decorators The decorator reference where the label values should be localized.
 * @internal
 */
export declare function getLocalizedDecorators(t: LocaleTranslate, decorators: Array<NormalizedLinkDecoratorDefinition>): Array<NormalizedLinkDecoratorDefinition>;
/**
 * Converts an object with defined decorators to a normalized array of decorators. The `id` key is added for each decorator and
 * is used as the attribute's name in the model.
 *
 * @internal
 */
export declare function normalizeDecorators(decorators?: Record<string, LinkDecoratorDefinition>): Array<NormalizedLinkDecoratorDefinition>;
/**
 * Returns `true` if the specified `element` can be linked (the element allows the `linkHref` attribute).
 */
export declare function isLinkableElement(element: ModelElement | null, schema: ModelSchema): element is ModelElement;
/**
 * Returns `true` if the specified `value` is an email.
 *
 * @internal
 */
export declare function isEmail(value: string): boolean;
/**
 * Adds the protocol prefix to the specified `link` when:
 *
 * * it does not contain it already, and there is a {@link module:link/linkconfig~LinkConfig#defaultProtocol `defaultProtocol` }
 * configuration value provided,
 * * or the link is an email address.
 */
export declare function addLinkProtocolIfApplicable(link: string, defaultProtocol?: string): string;
/**
 * Checks if protocol is already included in the link.
 *
 * @internal
 */
export declare function linkHasProtocol(link: string): boolean;
/**
 * Opens the link in a new browser tab.
 */
export declare function openLink(link: string): void;
/**
 * Returns a text of a link range.
 *
 * If the returned value is `undefined`, the range contains elements other than text nodes.
 */
export declare function extractTextFromLinkRange(range: ModelRange): string | undefined;
export type NormalizedLinkDecoratorAutomaticDefinition = LinkDecoratorAutomaticDefinition & {
    id: string;
};
export type NormalizedLinkDecoratorManualDefinition = LinkDecoratorManualDefinition & {
    id: string;
};
export type NormalizedLinkDecoratorDefinition = NormalizedLinkDecoratorAutomaticDefinition | NormalizedLinkDecoratorManualDefinition;

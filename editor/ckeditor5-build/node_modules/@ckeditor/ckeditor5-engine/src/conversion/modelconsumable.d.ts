/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module engine/conversion/modelconsumable
 */
import { ModelTextProxy } from '../model/textproxy.js';
import { type ModelItem } from '../model/item.js';
import { type ModelSelection } from '../model/selection.js';
import { type ModelDocumentSelection } from '../model/documentselection.js';
import { type ModelRange } from '../model/range.js';
/**
 * Manages a list of consumable values for the {@link module:engine/model/item~ModelItem model items}.
 *
 * Consumables are various aspects of the model. A model item can be broken down into separate, single properties that might be
 * taken into consideration when converting that item.
 *
 * `ModelConsumable` is used by {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} while analyzing the changed
 * parts of {@link module:engine/model/document~ModelDocument the document}. The added / changed / removed model items are broken down
 * into singular properties (the item itself and its attributes). All those parts are saved in `ModelConsumable`. Then,
 * during conversion, when the given part of a model item is converted (i.e. the view element has been inserted into the view,
 * but without attributes), the consumable value is removed from `ModelConsumable`.
 *
 * For model items, `ModelConsumable` stores consumable values of one of following types: `insert`, `addattribute:<attributeKey>`,
 * `changeattributes:<attributeKey>`, `removeattributes:<attributeKey>`.
 *
 * In most cases, it is enough to let th {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}
 * gather consumable values, so there is no need to use
 * the {@link module:engine/conversion/modelconsumable~ModelConsumable#add add method} directly.
 * However, it is important to understand how consumable values can be
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed}.
 * See {@link module:engine/conversion/downcasthelpers default downcast converters} for more information.
 *
 * Keep in mind that one conversion event may have multiple callbacks (converters) attached to it. Each of those is
 * able to convert one or more parts of the model. However, when one of those callbacks actually converts
 * something, the others should not, because they would duplicate the results. Using `ModelConsumable` helps to avoid
 * this situation, because callbacks should only convert these values that were not yet consumed from `ModelConsumable`.
 *
 * Consuming multiple values in a single callback:
 *
 * ```ts
 * // Converter for custom `imageBlock` element that might have a `caption` element inside which changes
 * // how the image is displayed in the view:
 * //
 * // Model:
 * //
 * // [imageBlock]
 * //   └─ [caption]
 * //       └─ foo
 * //
 * // View:
 * //
 * // <figure>
 * //   ├─ <img />
 * //   └─ <caption>
 * //       └─ foo
 * modelConversionDispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
 * 	// First, consume the `imageBlock` element.
 * 	conversionApi.consumable.consume( data.item, 'insert' );
 *
 * 	// Just create normal image element for the view.
 * 	// Maybe it will be "decorated" later.
 * 	const viewImage = new ViewElement( 'img' );
 * 	const insertPosition = conversionApi.mapper.toViewPosition( data.range.start );
 * 	const viewWriter = conversionApi.writer;
 *
 * 	// Check if the `imageBlock` element has children.
 * 	if ( data.item.childCount > 0 ) {
 * 		const modelCaption = data.item.getChild( 0 );
 *
 * 		// `modelCaption` insertion change is consumed from consumable values.
 * 		// It will not be converted by other converters, but it's children (probably some text) will be.
 * 		// Through mapping, converters for text will know where to insert contents of `modelCaption`.
 * 		if ( conversionApi.consumable.consume( modelCaption, 'insert' ) ) {
 * 			const viewCaption = new ViewElement( 'figcaption' );
 *
 * 			const viewImageHolder = new ViewElement( 'figure', null, [ viewImage, viewCaption ] );
 *
 * 			conversionApi.mapper.bindElements( modelCaption, viewCaption );
 * 			conversionApi.mapper.bindElements( data.item, viewImageHolder );
 * 			viewWriter.insert( insertPosition, viewImageHolder );
 * 		}
 * 	} else {
 * 		conversionApi.mapper.bindElements( data.item, viewImage );
 * 		viewWriter.insert( insertPosition, viewImage );
 * 	}
 *
 * 	evt.stop();
 * } );
 * ```
 */
export declare class ModelConsumable {
    /**
     * Contains list of consumable values.
     */
    private _consumable;
    /**
     * For each {@link module:engine/model/textproxy~ModelTextProxy} added to `ModelConsumable`, this registry holds a parent
     * of that `ModelTextProxy` and the start and end indices of that `ModelTextProxy`. This allows identification of the `ModelTextProxy`
     * instances that point to the same part of the model but are different instances. Each distinct `ModelTextProxy`
     * is given a unique `Symbol` which is then registered as consumable. This process is transparent for the `ModelConsumable`
     * API user because whenever `ModelTextProxy` is added, tested, consumed or reverted, the internal mechanisms of
     * `ModelConsumable` translate `ModelTextProxy` to that unique `Symbol`.
     */
    private _textProxyRegistry;
    /**
     * Adds a consumable value to the consumables list and links it with a given model item.
     *
     * ```ts
     * modelConsumable.add( modelElement, 'insert' ); // Add `modelElement` insertion change to consumable values.
     * modelConsumable.add( modelElement, 'addAttribute:bold' ); // Add `bold` attribute insertion on `modelElement` change.
     * modelConsumable.add( modelElement, 'removeAttribute:bold' ); // Add `bold` attribute removal on `modelElement` change.
     * modelConsumable.add( modelSelection, 'selection' ); // Add `modelSelection` to consumable values.
     * modelConsumable.add( modelRange, 'range' ); // Add `modelRange` to consumable values.
     * ```
     *
     * @param item Model item, range or selection that has the consumable.
     * @param type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
     * Second colon and everything after will be cut. Passing event name is a safe and good practice.
     */
    add(item: ModelItem | ModelSelection | ModelDocumentSelection | ModelRange, type: string): void;
    /**
     * Removes a given consumable value from a given model item.
     *
     * ```ts
     * modelConsumable.consume( modelElement, 'insert' ); // Remove `modelElement` insertion change from consumable values.
     * modelConsumable.consume( modelElement, 'addAttribute:bold' ); // Remove `bold` attribute insertion on `modelElement` change.
     * modelConsumable.consume( modelElement, 'removeAttribute:bold' ); // Remove `bold` attribute removal on `modelElement` change.
     * modelConsumable.consume( modelSelection, 'selection' ); // Remove `modelSelection` from consumable values.
     * modelConsumable.consume( modelRange, 'range' ); // Remove 'modelRange' from consumable values.
     * ```
     *
     * @param item Model item, range or selection from which consumable will be consumed.
     * @param type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
     * Second colon and everything after will be cut. Passing event name is a safe and good practice.
     * @returns `true` if consumable value was available and was consumed, `false` otherwise.
     */
    consume(item: ModelItem | ModelSelection | ModelDocumentSelection | ModelRange, type: string): boolean;
    /**
     * Tests whether there is a consumable value of a given type connected with a given model item.
     *
     * ```ts
     * modelConsumable.test( modelElement, 'insert' ); // Check for `modelElement` insertion change.
     * modelConsumable.test( modelElement, 'addAttribute:bold' ); // Check for `bold` attribute insertion on `modelElement` change.
     * modelConsumable.test( modelElement, 'removeAttribute:bold' ); // Check for `bold` attribute removal on `modelElement` change.
     * modelConsumable.test( modelSelection, 'selection' ); // Check if `modelSelection` is consumable.
     * modelConsumable.test( modelRange, 'range' ); // Check if `modelRange` is consumable.
     * ```
     *
     * @param item Model item, range or selection to be tested.
     * @param type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
     * Second colon and everything after will be cut. Passing event name is a safe and good practice.
     * @returns `null` if such consumable was never added, `false` if the consumable values was
     * already consumed or `true` if it was added and not consumed yet.
     */
    test(item: ModelItem | ModelSelection | ModelDocumentSelection | ModelRange, type: string): boolean | null;
    /**
     * Reverts consuming of a consumable value.
     *
     * ```ts
     * modelConsumable.revert( modelElement, 'insert' ); // Revert consuming `modelElement` insertion change.
     * modelConsumable.revert( modelElement, 'addAttribute:bold' ); // Revert consuming `bold` attribute insert from `modelElement`.
     * modelConsumable.revert( modelElement, 'removeAttribute:bold' ); // Revert consuming `bold` attribute remove from `modelElement`.
     * modelConsumable.revert( modelSelection, 'selection' ); // Revert consuming `modelSelection`.
     * modelConsumable.revert( modelRange, 'range' ); // Revert consuming `modelRange`.
     * ```
     *
     * @param item Model item, range or selection to be reverted.
     * @param type Consumable type.
     * @returns `true` if consumable has been reversed, `false` otherwise. `null` if the consumable has
     * never been added.
     */
    revert(item: ModelItem | ModelSelection | ModelDocumentSelection | ModelRange, type: string): boolean | null;
    /**
     * Verifies if all events from the specified group were consumed.
     *
     * @param eventGroup The events group to verify.
     */
    verifyAllConsumed(eventGroup: string): void;
    /**
     * Gets a unique symbol for the passed {@link module:engine/model/textproxy~ModelTextProxy} instance.
     * All `ModelTextProxy` instances that have same parent, same start index and same end index will get the same symbol.
     *
     * Used internally to correctly consume `ModelTextProxy` instances.
     *
     * @internal
     * @param textProxy `ModelTextProxy` instance to get a symbol for.
     * @returns Symbol representing all equal instances of `ModelTextProxy`.
     */
    _getSymbolForTextProxy(textProxy: ModelTextProxy): symbol;
    /**
     * Adds a symbol for the given {@link module:engine/model/textproxy~ModelTextProxy} instance.
     *
     * Used internally to correctly consume `ModelTextProxy` instances.
     *
     * @param textProxy Text proxy instance.
     * @returns Symbol generated for given `ModelTextProxy`.
     */
    private _addSymbolForTextProxy;
}

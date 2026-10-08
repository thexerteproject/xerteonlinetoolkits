/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module ui/template
 */
import { View } from './view.js';
import { ViewCollection } from './viewcollection.js';
import { type ArrayOrItem, type Emitter, type Observable } from '@ckeditor/ckeditor5-utils';
declare const Template_base: {
    new (): Emitter;
    prototype: Emitter;
};
/**
 * A basic Template class. It renders a DOM HTML element or text from a
 * {@link module:ui/template~TemplateDefinition definition} and supports element attributes, children,
 * bindings to {@link module:utils/observablemixin~Observable observables} and DOM event propagation.
 *
 * A simple template can look like this:
 *
 * ```ts
 * const bind = Template.bind( observable, emitter );
 *
 * new Template( {
 * 	tag: 'p',
 * 	attributes: {
 * 		class: 'foo',
 * 		style: {
 * 			backgroundColor: 'yellow'
 * 		}
 * 	},
 * 	on: {
 * 		click: bind.to( 'clicked' )
 * 	},
 * 	children: [
 * 		'A paragraph.'
 * 	]
 * } ).render();
 * ```
 *
 * and it will render the following HTML element:
 *
 * ```html
 * <p class="foo" style="background-color: yellow;">A paragraph.</p>
 * ```
 *
 * Additionally, the `observable` will always fire `clicked` upon clicking `<p>` in the DOM.
 *
 * See {@link module:ui/template~TemplateDefinition} to know more about templates and complex
 * template definitions.
 */
export declare class Template extends /* #__PURE__ */ Template_base {
    ns?: string;
    /**
     * The tag (`tagName`) of this template, e.g. `div`. It also indicates that the template
     * renders to an HTML element.
     */
    tag?: string;
    /**
     * The text of the template. It also indicates that the template renders to a DOM text node.
     */
    text?: Array<TemplateSimpleValue | TemplateBinding>;
    /**
     * The attributes of the template, e.g. `{ id: [ 'ck-id' ] }`, corresponding with
     * the attributes of an HTML element.
     *
     * **Note**: This property only makes sense when {@link #tag} is defined.
     */
    attributes?: Record<string, AttributeValues>;
    /**
     * The children of the template. They can be either:
     * * independent instances of {@link ~Template} (sub–templates),
     * * native DOM Nodes.
     *
     * **Note**: This property only makes sense when {@link #tag} is defined.
     */
    children?: Array<ViewCollection | View | Node | Template>;
    /**
     * The DOM event listeners of the template.
     */
    eventListeners?: Record<string, Array<TemplateToBinding>>;
    /**
     * Indicates whether this particular Template instance has been
     * {@link #render rendered}.
     */
    private _isRendered;
    /**
     * The data used by the {@link #revert} method to restore a node to its original state.
     *
     * See: {@link #apply}.
     */
    private _revertData;
    /**
     * Creates an instance of the {@link ~Template} class.
     *
     * @param def The definition of the template.
     */
    constructor(def: TemplateDefinition);
    /**
     * Renders a DOM Node (an HTML element or text) out of the template.
     *
     * ```ts
     * const domNode = new Template( { ... } ).render();
     * ```
     *
     * See: {@link #apply}.
     */
    render(): HTMLElement | Text;
    /**
     * Applies the template to an existing DOM Node, either HTML element or text.
     *
     * **Note:** No new DOM nodes will be created. Applying extends:
     *
     * {@link module:ui/template~TemplateDefinition attributes},
     * {@link module:ui/template~TemplateDefinition event listeners}, and
     * `textContent` of {@link module:ui/template~TemplateDefinition children} only.
     *
     * **Note:** Existing `class` and `style` attributes are extended when a template
     * is applied to an HTML element, while other attributes and `textContent` are overridden.
     *
     * **Note:** The process of applying a template can be easily reverted using the
     * {@link module:ui/template~Template#revert} method.
     *
     * ```ts
     * const element = document.createElement( 'div' );
     * const observable = new Model( { divClass: 'my-div' } );
     * const emitter = Object.create( EmitterMixin );
     * const bind = Template.bind( observable, emitter );
     *
     * new Template( {
     * 	attributes: {
     * 		id: 'first-div',
     * 		class: bind.to( 'divClass' )
     * 	},
     * 	on: {
     * 		click: bind( 'elementClicked' ) // Will be fired by the observable.
     * 	},
     * 	children: [
     * 		'Div text.'
     * 	]
     * } ).apply( element );
     *
     * console.log( element.outerHTML ); // -> '<div id="first-div" class="my-div"></div>'
     * ```
     *
     * @see module:ui/template~Template#render
     * @see module:ui/template~Template#revert
     * @param node Root node for the template to apply.
     */
    apply(node: HTMLElement | Text): HTMLElement | Text;
    /**
     * Reverts a template {@link module:ui/template~Template#apply applied} to a DOM node.
     *
     * @param node The root node for the template to revert. In most of the cases, it is the
     * same node used by {@link module:ui/template~Template#apply}.
     */
    revert(node: HTMLElement | Text): void;
    /**
     * Returns an iterator which traverses the template in search of {@link module:ui/view~View}
     * instances and returns them one by one.
     *
     * ```ts
     * const viewFoo = new View();
     * const viewBar = new View();
     * const viewBaz = new View();
     * const template = new Template( {
     * 	tag: 'div',
     * 	children: [
     * 		viewFoo,
     * 		{
     * 			tag: 'div',
     * 			children: [
     * 				viewBar
     * 			]
     * 		},
     * 		viewBaz
     * 	]
     * } );
     *
     * // Logs: viewFoo, viewBar, viewBaz
     * for ( const view of template.getViews() ) {
     * 	console.log( view );
     * }
     * ```
     */
    getViews(): IterableIterator<View>;
    /**
     * An entry point to the interface which binds DOM nodes to
     * {@link module:utils/observablemixin~Observable observables}.
     * There are two types of bindings:
     *
     * * HTML element attributes or text `textContent` synchronized with attributes of an
     * {@link module:utils/observablemixin~Observable}. Learn more about {@link module:ui/template~BindChain#to}
     * and {@link module:ui/template~BindChain#if}.
     *
     * ```ts
     * const bind = Template.bind( observable, emitter );
     *
     * new Template( {
     * 	attributes: {
     * 		// Binds the element "class" attribute to observable#classAttribute.
     * 		class: bind.to( 'classAttribute' )
     * 	}
     * } ).render();
     * ```
     *
     * * DOM events fired on HTML element propagated through
     * {@link module:utils/observablemixin~Observable}. Learn more about {@link module:ui/template~BindChain#to}.
     *
     * ```ts
     * const bind = Template.bind( observable, emitter );
     *
     * new Template( {
     * 	on: {
     * 		// Will be fired by the observable.
     * 		click: bind( 'elementClicked' )
     * 	}
     * } ).render();
     * ```
     *
     * Also see {@link module:ui/view~View#bindTemplate}.
     *
     * @param observable An observable which provides boundable attributes.
     * @param emitter An emitter that listens to observable attribute
     * changes or DOM Events (depending on the kind of the binding). Usually, a {@link module:ui/view~View} instance.
     */
    static bind<TObservable extends Observable>(observable: TObservable, emitter: Emitter): BindChain<TObservable>;
    /**
     * Extends an existing {@link module:ui/template~Template} instance with some additional content
     * from another {@link module:ui/template~TemplateDefinition}.
     *
     * ```ts
     * const bind = Template.bind( observable, emitter );
     *
     * const template = new Template( {
     * 	tag: 'p',
     * 	attributes: {
     * 		class: 'a',
     * 		data-x: bind.to( 'foo' )
     * 	},
     * 	children: [
     * 		{
     * 			tag: 'span',
     * 			attributes: {
     * 				class: 'b'
     * 			},
     * 			children: [
     * 				'Span'
     * 			]
     * 		}
     * 	]
     *  } );
     *
     * // Instance-level extension.
     * Template.extend( template, {
     * 	attributes: {
     * 		class: 'b',
     * 		data-x: bind.to( 'bar' )
     * 	},
     * 	children: [
     * 		{
     * 			attributes: {
     * 				class: 'c'
     * 			}
     * 		}
     * 	]
     * } );
     *
     * // Child extension.
     * Template.extend( template.children[ 0 ], {
     * 	attributes: {
     * 		class: 'd'
     * 	}
     * } );
     * ```
     *
     * the `outerHTML` of `template.render()` is:
     *
     * ```html
     * <p class="a b" data-x="{ observable.foo } { observable.bar }">
     * 	<span class="b c d">Span</span>
     * </p>
     * ```
     *
     * @param template An existing template instance to be extended.
     * @param def Additional definition to be applied to a template.
     */
    static extend(template: Template, def: Partial<TemplateDefinition>): void;
    /**
     * Renders a DOM Node (either an HTML element or text) out of the template.
     *
     * @param data Rendering data.
     */
    private _renderNode;
    /**
     * Renders an HTML element out of the template.
     *
     * @param data Rendering data.
     */
    private _renderElement;
    /**
     * Renders a text node out of {@link module:ui/template~Template#text}.
     *
     * @param data Rendering data.
     */
    private _renderText;
    /**
     * Renders HTML element attributes out of {@link module:ui/template~Template#attributes}.
     *
     * @param data Rendering data.
     */
    private _renderAttributes;
    /**
     * Renders the `style` attribute of an HTML element based on
     * {@link module:ui/template~Template#attributes}.
     *
     * A style attribute is an object with static values:
     *
     * ```ts
     * attributes: {
     * 	style: {
     * 		color: 'red',
     * 		'--color': 'red'
     * 	}
     * }
     * ```
     *
     * or values bound to {@link module:ui/model~UIModel} properties:
     *
     * ```ts
     * attributes: {
     * 	style: {
     * 		color: bind.to( ... ),
     * 		'--color': bind.to( ... )
     * 	}
     * }
     * ```
     *
     * Note: The `style` attribute is rendered without setting the namespace. It does not seem to be
     * needed.
     *
     * @param styles Styles located in `attributes.style` of {@link module:ui/template~TemplateDefinition}.
     * @param data Rendering data.
     */
    private _renderStyleAttribute;
    /**
     * Recursively renders HTML element's children from {@link module:ui/template~Template#children}.
     *
     * @param data Rendering data.
     */
    private _renderElementChildren;
    /**
     * Activates `on` event listeners from the {@link module:ui/template~TemplateDefinition}
     * on an HTML element.
     *
     * @param data Rendering data.
     */
    private _setUpListeners;
    /**
     * For a given {@link module:ui/template~TemplateValueSchema} containing {@link module:ui/template~TemplateBinding}
     * activates the binding and sets its initial value.
     *
     * Note: {@link module:ui/template~TemplateValueSchema} can be for HTML element attributes or
     * text node `textContent`.
     *
     * @param options Binding options.
     * @param options.updater A function which updates the DOM (like attribute or text).
     * @param options.data Rendering data.
     */
    private _bindToObservable;
    /**
     * Reverts {@link module:ui/template~RenderData#revertData template data} from a node to
     * return it to the original state.
     *
     * @param node A node to be reverted.
     * @param revertData An object that stores information about what changes have been made by
     * {@link #apply} to the node. See {@link module:ui/template~RenderData#revertData} for more information.
     */
    private _revertTemplateFromNode;
}
export type AttributeValues = Array<TemplateSimpleValue | TemplateBinding> | [
    NamespacedValue<Array<TemplateSimpleValue | TemplateBinding>>
];
/**
 * Describes a binding created by the {@link module:ui/template~Template.bind} interface.
 *
 * @internal
 */
export declare abstract class TemplateBinding {
    /**
     * The name of the {@link module:ui/template~TemplateBinding#observable observed attribute}.
     */
    readonly attribute: string;
    /**
     * An observable instance of the binding. It either:
     *
     * * provides the attribute with the value,
     * * or passes the event when a corresponding DOM event is fired.
     */
    readonly observable: Observable;
    /**
     * An {@link module:utils/emittermixin~Emitter} used by the binding to:
     *
     * * listen to the attribute change in the {@link module:ui/template~TemplateBinding#observable},
     * * or listen to the event in the DOM.
     */
    readonly emitter: Emitter;
    /**
     * A custom function to process the value of the {@link module:ui/template~TemplateBinding#attribute}.
     */
    readonly callback?: (value: any, node: Node) => TemplateSimpleValue;
    /**
     * Creates an instance of the {@link module:ui/template~TemplateBinding} class.
     *
     * @param def The definition of the binding.
     */
    constructor(def: {
        attribute: string;
        observable: Observable;
        emitter: Emitter;
        callback?: (value: any, node: Node) => TemplateSimpleValue;
    });
    /**
     * Returns the value of the binding. It is the value of the {@link module:ui/template~TemplateBinding#attribute} in
     * {@link module:ui/template~TemplateBinding#observable}. The value may be processed by the
     * {@link module:ui/template~TemplateBinding#callback}, if such has been passed to the binding.
     *
     * @param node A native DOM node, passed to the custom {@link module:ui/template~TemplateBinding#callback}.
     * @returns The value of {@link module:ui/template~TemplateBinding#attribute} in
     * {@link module:ui/template~TemplateBinding#observable}.
     */
    getValue(node: Node): TemplateSimpleValue;
    /**
     * Activates the listener which waits for changes of the {@link module:ui/template~TemplateBinding#attribute} in
     * {@link module:ui/template~TemplateBinding#observable}, then updates the DOM with the aggregated
     * value of {@link module:ui/template~TemplateValueSchema}.
     *
     * @param schema A full schema to generate an attribute or text in the DOM.
     * @param updater A DOM updater function used to update the native DOM attribute or text.
     * @param data Rendering data.
     * @returns A function to sever the listener binding.
     */
    activateAttributeListener(schema: Array<TemplateSimpleValue | TemplateBinding>, updater: Updater, data: RenderData): () => void;
}
/**
 * Describes either:
 *
 * * a binding to an {@link module:utils/observablemixin~Observable},
 * * or a native DOM event binding.
 *
 * It is created by the {@link module:ui/template~BindChain#to} method.
 *
 * @internal
 */
export declare class TemplateToBinding extends TemplateBinding {
    readonly eventNameOrFunction: string | ((domEvent: Event) => void);
    constructor(def: ConstructorParameters<typeof TemplateBinding>[0] & {
        eventNameOrFunction: string | ((domEvent: Event) => void);
    });
    /**
     * Activates the listener for the native DOM event, which when fired, is propagated by
     * the {@link module:ui/template~TemplateBinding#emitter}.
     *
     * @param domEvtName The name of the native DOM event.
     * @param domSelector The selector in the DOM to filter delegated events.
     * @param data Rendering data.
     * @returns A function to sever the listener binding.
     */
    activateDomEventListener(domEvtName: string, domSelector: string, data: {
        node: any;
    }): () => void;
}
/**
 * Describes a binding to {@link module:utils/observablemixin~Observable} created by the {@link module:ui/template~BindChain#if}
 * method.
 *
 * @internal
 */
export declare class TemplateIfBinding extends TemplateBinding {
    /**
     * The value of the DOM attribute or text to be set if the {@link module:ui/template~TemplateBinding#attribute} in
     * {@link module:ui/template~TemplateBinding#observable} is `true`.
     */
    readonly valueIfTrue?: string;
    constructor(def: ConstructorParameters<typeof TemplateBinding>[0] & {
        valueIfTrue?: string;
    });
    /**
     * @inheritDoc
     */
    getValue(node: Node): TemplateSimpleValue;
}
interface Updater {
    set(value: any): void;
    remove(): void;
}
/**
 * A definition of the {@link module:ui/template~Template}. It describes what kind of
 * node a template will render (HTML element or text), attributes of an element, DOM event
 * listeners and children.
 *
 * Also see:
 * * {@link module:ui/template~TemplateValueSchema} to learn about HTML element attributes,
 * * {@link module:ui/template~TemplateListenerSchema} to learn about DOM event listeners.
 *
 * A sample definition on an HTML element can look like this:
 *
 * ```ts
 * new Template( {
 * 	tag: 'p',
 * 	children: [
 * 		{
 * 			tag: 'span',
 * 			attributes: { ... },
 * 			children: [ ... ],
 * 		},
 * 		{
 * 			text: 'static–text'
 * 		},
 * 		'also-static–text',
 * 	],
 * 	attributes: {
 * 		class: {@link module:ui/template~TemplateValueSchema},
 * 		id: {@link module:ui/template~TemplateValueSchema},
 * 		style: {@link module:ui/template~TemplateValueSchema}
 *
 * 		// ...
 * 	},
 * 	on: {
 * 		'click': {@link module:ui/template~TemplateListenerSchema}
 *
 * 		// Document.querySelector format is also accepted.
 * 		'keyup@a.some-class': {@link module:ui/template~TemplateListenerSchema}
 *
 * 		// ...
 * 	}
 * } );
 * ```
 *
 * A {@link module:ui/view~View}, another {@link module:ui/template~Template} or a native DOM node
 * can also become a child of a template. When a view is passed, its {@link module:ui/view~View#element} is used:
 *
 * ```ts
 * const view = new SomeView();
 * const childTemplate = new Template( { ... } );
 * const childNode = document.createElement( 'b' );
 *
 * new Template( {
 * 	tag: 'p',
 *
 * 	children: [
 * 		// view#element will be added as a child of this <p>.
 * 		view,
 *
 * 		// The output of childTemplate.render() will be added here.
 * 		childTemplate,
 *
 * 		// Native DOM nodes are included directly in the rendered output.
 * 		childNode
 * 	]
 * } );
 * ```
 *
 * An entire {@link module:ui/viewcollection~ViewCollection} can be used as a child in the definition:
 *
 * ```ts
 * const collection = new ViewCollection();
 * collection.add( someView );
 *
 * new Template( {
 * 	tag: 'p',
 *
 * 	children: collection
 * } );
 * ```
 */
export type TemplateDefinition = string | Template | TemplateElementDefinition | TemplateTextDefinition;
export type TemplateElementDefinition = {
    /**
     * See the template {@link module:ui/template~Template#tag} property.
     */
    tag: string;
    /**
     * See the template {@link module:ui/template~Template#attributes} property.
     */
    attributes?: Record<string, TemplateValueSchema>;
    /**
     * See the template {@link module:ui/template~Template#children} property.
     */
    children?: Iterable<View | Node | Template | TemplateDefinition>;
    /**
     * See the template {@link module:ui/template~Template#eventListeners} property.
     */
    on?: Record<string, TemplateListenerSchema>;
};
export type TemplateTextDefinition = {
    /**
     * See the template {@link module:ui/template~Template#text} property.
     */
    text: ArrayOrItem<TemplateSimpleValueSchema>;
};
export type FalsyValue = false | null | undefined | '';
export type NamespacedValue<T> = {
    ns: string;
    value: T;
};
export type TemplateSimpleValue = string | boolean | number | null | undefined;
export type TemplateSimpleValueSchema = TemplateSimpleValue | AttributeBinding;
/**
 * Describes a value of an HTML element attribute or `textContent`. It allows combining multiple
 * data sources like static values and {@link module:utils/observablemixin~Observable} attributes.
 *
 * Also see:
 * * {@link module:ui/template~TemplateDefinition} to learn where to use it,
 * * {@link module:ui/template~Template.bind} to learn how to configure
 * {@link module:utils/observablemixin~Observable} attribute bindings,
 * * {@link module:ui/template~Template#render} to learn how to render a template,
 * * {@link module:ui/template~BindChain#to `to()`} and {@link module:ui/template~BindChain#if `if()`}
 * methods to learn more about bindings.
 *
 * Attribute values can be described in many different ways:
 *
 * ```ts
 * // Bind helper will create bindings to attributes of the observable.
 * const bind = Template.bind( observable, emitter );
 *
 * new Template( {
 * 	tag: 'p',
 * 	attributes: {
 * 		// A plain string schema.
 * 		'class': 'static-text',
 *
 * 		// An object schema, binds to the "foo" attribute of the
 * 		// observable and follows its value.
 * 		'class': bind.to( 'foo' ),
 *
 * 		// An array schema, combines the above.
 * 		'class': [
 * 			'static-text',
 * 			bind.to( 'bar', () => { ... } ),
 *
 * 			// Bindings can also be conditional.
 * 			bind.if( 'baz', 'class-when-baz-is-true' )
 * 		],
 *
 * 		// An array schema, with a custom namespace, e.g. useful for creating SVGs.
 * 		'class': {
 * 			ns: 'http://ns.url',
 * 			value: [
 * 				bind.if( 'baz', 'value-when-true' ),
 * 				'static-text'
 * 			]
 * 		},
 *
 * 		// An object schema, specific for styles.
 * 		style: {
 * 			color: 'red',
 * 			'--color': 'red',
 * 			backgroundColor: bind.to( 'qux', () => { ... } )
 * 		}
 * 	}
 * } );
 * ```
 *
 * Text nodes can also have complex values:
 *
 * ```ts
 * const bind = Template.bind( observable, emitter );
 *
 * // Will render a "foo" text node.
 * new Template( {
 * 	text: 'foo'
 * } );
 *
 * // Will render a "static text: {observable.foo}" text node.
 * // The text of the node will be updated as the "foo" attribute changes.
 * new Template( {
 * 	text: [
 * 		'static text: ',
 * 		bind.to( 'foo', () => { ... } )
 * 	]
 * } );
 * ```
 */
export type TemplateValueSchema = ArrayOrItem<TemplateSimpleValueSchema | NamespacedValue<TemplateSimpleValueSchema>> | Record<string, TemplateSimpleValueSchema>;
/**
 * Describes an event listener attached to an HTML element. Such listener can propagate DOM events
 * through an {@link module:utils/observablemixin~Observable} instance, execute custom callbacks
 * or both, if necessary.
 *
 * Also see:
 * * {@link module:ui/template~TemplateDefinition} to learn more about template definitions,
 * * {@link module:ui/template~BindChain#to `to()`} method to learn more about bindings.
 *
 * Check out different ways of attaching event listeners below:
 *
 * ```ts
 * // Bind helper will propagate events through the observable.
 * const bind = Template.bind( observable, emitter );
 *
 * new Template( {
 * 	tag: 'p',
 * 	on: {
 * 		// An object schema. The observable will fire the "clicked" event upon DOM "click".
 * 		click: bind.to( 'clicked' )
 *
 * 		// An object schema. It will work for "click" event on "a.foo" children only.
 * 		'click@a.foo': bind.to( 'clicked' )
 *
 * 		// An array schema, makes the observable propagate multiple events.
 * 		click: [
 * 			bind.to( 'clicked' ),
 * 			bind.to( 'executed' )
 * 		],
 *
 * 		// An array schema with a custom callback.
 * 		'click@a.foo': {
 * 			bind.to( 'clicked' ),
 * 			bind.to( evt => {
 * 				console.log( `${ evt.target } has been clicked!` );
 * 			} }
 * 		}
 * 	}
 * } );
 * ```
 */
export type TemplateListenerSchema = ArrayOrItem<ListenerBinding>;
declare const AttributeBindingSymbol: unique symbol;
declare const ListenerBindingSymbol: unique symbol;
export interface AttributeBinding {
    _opaqueAttributeBinding: typeof AttributeBindingSymbol;
}
export interface ListenerBinding {
    _opaqueListenerBinding: typeof ListenerBindingSymbol;
}
/**
 * The return value of {@link ~Template.bind `Template.bind()`}. It provides `to()` and `if()`
 * methods to create the {@link module:utils/observablemixin~Observable observable} attribute and event bindings.
 */
export interface BindChain<TObservable> {
    /**
     * Binds an {@link module:utils/observablemixin~Observable observable} to either:
     *
     * * an HTML element attribute or a text node `textContent`, so it remains in sync with the observable
     * attribute as it changes,
     * * or an HTML element DOM event, so the DOM events are propagated through an observable.
     *
     * Some common use cases of `to()` bindings are presented below:
     *
     * ```ts
     * const bind = Template.bind( observable, emitter );
     *
     * new Template( {
     * 	tag: 'p',
     * 	attributes: {
     * 		// class="..." attribute gets bound to `observable#a`
     * 		class: bind.to( 'a' )
     * 	},
     * 	children: [
     * 		// <p>...</p> gets bound to observable#b; always `toUpperCase()`.
     * 		{
     * 			text: bind.to( 'b', ( value, node ) => value.toUpperCase() )
     * 		}
     * 	],
     * 	on: {
     * 		click: [
     * 			// An observable will fire "clicked" upon "click" in the DOM.
     * 			bind.to( 'clicked' ),
     *
     * 			// A custom callback will be executed upon "click" in the DOM.
     * 			bind.to( () => {
     * 				...
     * 			} )
     * 		]
     * 	}
     * } ).render();
     * ```
     *
     * Learn more about using `to()` in the {@link module:ui/template~TemplateValueSchema} and
     * {@link module:ui/template~TemplateListenerSchema}.
     *
     * @label ATTRIBUTE
     * @param attribute An attribute name of {@link module:utils/observablemixin~Observable}.
     */
    to<TAttribute extends keyof TObservable & string>(attribute: TAttribute): AttributeBinding & ListenerBinding;
    /**
     * Binds an {@link module:utils/observablemixin~Observable observable} to either:
     *
     * * an HTML element attribute or a text node `textContent`, so it remains in sync with the observable
     * attribute as it changes,
     * * or an HTML element DOM event, so the DOM events are propagated through an observable.
     *
     * Some common use cases of `to()` bindings are presented below:
     *
     * ```ts
     * const bind = Template.bind( observable, emitter );
     *
     * new Template( {
     * 	tag: 'p',
     * 	attributes: {
     * 		// class="..." attribute gets bound to `observable#a`
     * 		class: bind.to( 'a' )
     * 	},
     * 	children: [
     * 		// <p>...</p> gets bound to observable#b; always `toUpperCase()`.
     * 		{
     * 			text: bind.to( 'b', ( value, node ) => value.toUpperCase() )
     * 		}
     * 	],
     * 	on: {
     * 		click: [
     * 			// An observable will fire "clicked" upon "click" in the DOM.
     * 			bind.to( 'clicked' ),
     *
     * 			// A custom callback will be executed upon "click" in the DOM.
     * 			bind.to( () => {
     * 				...
     * 			} )
     * 		]
     * 	}
     * } ).render();
     * ```
     *
     * Learn more about using `to()` in the {@link module:ui/template~TemplateValueSchema} and
     * {@link module:ui/template~TemplateListenerSchema}.
     *
     * @label ATTRIBUTE_CALLBACK
     * @param attribute An attribute name of {@link module:utils/observablemixin~Observable}.
     * @param callback Allows for processing of the value. Accepts `Node` and `value` as arguments.
     */
    to<TAttribute extends keyof TObservable & string>(attribute: TAttribute, callback: (value: TObservable[TAttribute], node: Node) => (TemplateSimpleValue)): AttributeBinding;
    /**
     * Binds an {@link module:utils/observablemixin~Observable observable} to either:
     *
     * * an HTML element attribute or a text node `textContent`, so it remains in sync with the observable
     * attribute as it changes,
     * * or an HTML element DOM event, so the DOM events are propagated through an observable.
     *
     * Some common use cases of `to()` bindings are presented below:
     *
     * ```ts
     * const bind = Template.bind( observable, emitter );
     *
     * new Template( {
     * 	tag: 'p',
     * 	attributes: {
     * 		// class="..." attribute gets bound to `observable#a`
     * 		class: bind.to( 'a' )
     * 	},
     * 	children: [
     * 		// <p>...</p> gets bound to observable#b; always `toUpperCase()`.
     * 		{
     * 			text: bind.to( 'b', ( value, node ) => value.toUpperCase() )
     * 		}
     * 	],
     * 	on: {
     * 		click: [
     * 			// An observable will fire "clicked" upon "click" in the DOM.
     * 			bind.to( 'clicked' ),
     *
     * 			// A custom callback will be executed upon "click" in the DOM.
     * 			bind.to( () => {
     * 				...
     * 			} )
     * 		]
     * 	}
     * } ).render();
     * ```
     *
     * Learn more about using `to()` in the {@link module:ui/template~TemplateValueSchema} and
     * {@link module:ui/template~TemplateListenerSchema}.
     *
     * @label EVENT
     * @param eventNameOrCallback A DOM event name or an event callback.
     */
    to(eventNameOrCallback: string | ((domEvent: Event) => void)): ListenerBinding;
    /**
     * Binds an {@link module:utils/observablemixin~Observable observable} to an HTML element attribute or a text
     * node `textContent` so it remains in sync with the observable attribute as it changes.
     *
     * Unlike {@link module:ui/template~BindChain#to}, it controls the presence of the attribute or `textContent`
     * depending on the "falseness" of an {@link module:utils/observablemixin~Observable} attribute.
     *
     * ```ts
     * const bind = Template.bind( observable, emitter );
     *
     * new Template( {
     * 	tag: 'input',
     * 	attributes: {
     * 		// <input checked> when `observable#a` is not undefined/null/false/''
     * 		// <input> when `observable#a` is undefined/null/false
     * 		checked: bind.if( 'a' )
     * 	},
     * 	children: [
     * 		{
     * 			// <input>"b-is-not-set"</input> when `observable#b` is undefined/null/false/''
     * 			// <input></input> when `observable#b` is not "falsy"
     * 			text: bind.if( 'b', 'b-is-not-set', ( value, node ) => !value )
     * 		}
     * 	]
     * } ).render();
     * ```
     *
     * Learn more about using `if()` in the {@link module:ui/template~TemplateValueSchema}.
     *
     * @param attribute An attribute name of {@link module:utils/observablemixin~Observable} used in the binding.
     * @param valueIfTrue Value set when the {@link module:utils/observablemixin~Observable} attribute is not
     * undefined/null/false/'' (empty string).
     * @param callback Allows for processing of the value. Accepts `Node` and `value` as arguments.
     */
    if<TAttribute extends keyof TObservable & string>(attribute: TAttribute, valueIfTrue?: unknown, callback?: (value: TObservable[TAttribute], node: Node) => (boolean | FalsyValue)): AttributeBinding;
}
/**
 * The {@link module:ui/template~Template#_renderNode} configuration.
 * @internal
 */
export interface RenderData {
    /**
     * A node which is being rendered.
     */
    node: HTMLElement | Text;
    /**
     * Tells {@link module:ui/template~Template#_renderNode} to render
     * children into `DocumentFragment` first and then append the fragment
     * to the parent element. It is a speed optimization.
     */
    intoFragment: boolean;
    /**
     * Indicates whether the {@link #node} has been provided by {@link module:ui/template~Template#apply}.
     */
    isApplying: boolean;
    /**
     * An object storing the data that helps {@link module:ui/template~Template#revert}
     * bringing back an element to its initial state, i.e. before
     * {@link module:ui/template~Template#apply} was called.
     */
    revertData?: RevertData;
}
interface RevertData {
    text?: string | null;
    children: Array<RevertData>;
    bindings: Array<Array<() => void>>;
    attributes: Record<string, string | null>;
}
export {};

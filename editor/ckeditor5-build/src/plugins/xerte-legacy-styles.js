import { Plugin } from '@ckeditor/ckeditor5-core';
import '../xerte-legacy-styles.css';

const variants = [ 1, 2, 3, 4, 5, 6 ];
const mediaSizes = { 240: 426, 360: 640, 480: 854, 720: 1280, 1080: 1920 };

export const legacyStyles = [
	{ name: 'Italic Title', element: 'h2', classes: [], heading: 'heading1', styles: { 'font-style': 'italic' } },
	{ name: 'Subtitle', element: 'h3', classes: [], heading: 'heading2', styles: { color: '#aaa', 'font-style': 'italic' } },
	{
		name: 'Special Container', element: 'div', classes: [], wrap: 'htmlDiv',
		styles: { padding: '5px 10px', 'background-color': '#eee', color: '#000', border: '1px solid #ccc' }
	},
	{ name: 'Block Panel', element: 'div', classes: [ 'panel', 'editorStyle' ], wrap: 'htmlDiv', existingOnly: true },
	...variants.map( number => ( {
		name: 'Blockquote ' + number, element: 'blockquote', classes: [ 'bq' + number ], wrap: 'blockQuote', family: 'quotes'
	} ) ),
	...variants.map( number => ( {
		name: 'Speech Bubble ' + number, element: 'div', classes: [ 'speech-bubble' + number ], wrap: 'htmlDiv', family: 'bubbles'
	} ) ),
	{ name: 'Marker', element: 'span', classes: [ 'marker' ] },
	...[ [ 'Big', 'big' ], [ 'Small', 'small' ], [ 'Typewriter', 'tt' ], [ 'Computer Code', 'code' ],
		[ 'Keyboard Phrase', 'kbd' ], [ 'Sample Text', 'samp' ], [ 'Variable', 'var' ], [ 'Deleted Text', 'del' ],
		[ 'Inserted Text', 'ins' ], [ 'Cited Work', 'cite' ], [ 'Inline Quotation', 'q' ] ]
		.map( ( [ name, element ] ) => ( {
			name, element, classes: [], textStyle: true, nativeCommand: element === 'code' ? 'code' : undefined
		} ) ),
	...[ 'rtl', 'ltr' ].map( dir => ( {
		name: 'Language: ' + dir.toUpperCase(), element: 'span', classes: [], textStyle: true, attributes: { dir }
	} ) ),
	{ name: 'Styled Image (left)', element: 'img', classes: [ 'left' ], models: [ 'imageBlock', 'imageInline' ], family: 'imageAlign' },
	{ name: 'Styled Image (right)', element: 'img', classes: [ 'right' ], models: [ 'imageBlock', 'imageInline' ], family: 'imageAlign' },
	{
		name: 'Compact Table', element: 'table', classes: [], models: [ 'table' ],
		attributes: { cellpadding: '5', cellspacing: '0', border: '1', bordercolor: '#ccc' },
		styles: { 'border-collapse': 'collapse' }, family: 'tables'
	},
	{
		name: 'Borderless Table', element: 'table', classes: [], models: [ 'table' ],
		styles: { 'border-style': 'hidden', 'background-color': '#E6E6FA' }, family: 'tables'
	},
	{ name: 'Square Bulleted List', element: 'ul', classes: [], list: 'square', styles: { 'list-style-type': 'square' } },
	{ name: 'Clean Image', element: 'figure', classes: [ 'image-clean' ], models: [ 'imageBlock', 'imageInline' ] },
	{ name: 'Grayscale Image', element: 'figure', classes: [ 'image-grayscale' ], models: [ 'imageBlock', 'imageInline' ] },
	{ name: 'Featured Snippet', element: 'pre', classes: [ 'code-featured' ], models: [ 'codeBlock' ] },
	{ name: 'Featured Formula', element: 'span', classes: [ 'math-featured' ], models: [ 'xerteMathJax' ], preset: 'formulaStyle' },
	...Object.entries( mediaSizes ).map( ( [ height, width ] ) => ( {
		name: height + 'p', element: 'figure', classes: [ 'embed-' + height + 'p' ], models: [ 'media' ],
		preset: 'mediaStyle', existingOnly: true, dimensions: { mediaWidth: width + 'px', mediaHeight: height + 'px' }
	} ) )
];

const usesCustomCommand = style => style.wrap || style.heading || style.textStyle || style.models || style.list;
const sameValue = ( left, right ) => String( left ).toLowerCase() === String( right ).toLowerCase();
const tableStyles = { 'border-style': 'tableBorderStyle', 'background-color': 'tableBackgroundColor' };
const families = new Map();
for ( const style of legacyStyles ) {
	if ( !style.family ) continue;
	if ( !families.has( style.family ) ) families.set( style.family, [] );
	families.get( style.family ).push( style );
}

function matchesStyle( value, style ) {
	return value != null && style.classes.every( name => value.classes?.includes( name ) ) &&
		Object.entries( style.attributes || {} ).every( ( [ name, expected ] ) => sameValue( value.attributes?.[ name ], expected ) ) &&
		Object.entries( style.styles || {} ).every( ( [ name, expected ] ) => sameValue( value.styles?.[ name ], expected ) );
}

function updateHtmlStyle( html, style, target, apply, element = style.element ) {
	if ( style.classes.length ) {
		if ( apply ) html.addModelHtmlClass( element, style.classes, target );
		else html.removeModelHtmlClass( element, style.classes, target );
	}
	const current = apply ? null : target.getAttribute( html.getGhsAttributeNameForElement( element ) );
	const matchingKeys = ( values, expected ) => Object.keys( expected ).filter( key => sameValue( values?.[ key ], expected[ key ] ) );
	if ( style.attributes ) {
		if ( apply ) html.setModelHtmlAttributes( element, style.attributes, target );
		else if ( target.is( 'documentSelection' ) ) html.removeModelHtmlAttributes( element, Object.keys( style.attributes ), target );
		else html.removeModelHtmlAttributes( element, matchingKeys( current?.attributes, style.attributes ), target );
	}
	if ( style.styles ) {
		if ( apply ) html.setModelHtmlStyles( element, style.styles, target );
		else html.removeModelHtmlStyles( element, matchingKeys( current?.styles, style.styles ), target );
	}
}

function relatedStyles( style ) {
	return families.get( style.family ) || [ style ];
}

function findWrapper( block, style ) {
	const attribute = style.wrap === 'blockQuote' ? 'htmlBlockquoteAttributes' : 'htmlDivAttributes';
	return block.getAncestors( { parentFirst: true } ).find( ancestor =>
		ancestor.name === style.wrap && ( style.wrap === 'blockQuote' ||
			relatedStyles( style ).some( variant => matchesStyle( ancestor.getAttribute( attribute ), variant ) ) )
	);
}

function canWrap( schema, block, wrapper ) {
	const context = block.getAncestors();
	return schema.checkChild( block.parent, wrapper ) && schema.checkChild( [ ...context, wrapper ], block );
}

function wrapBlocks( writer, html, style, targets, apply ) {
	const existing = new Set( targets.filter( target => target.name === style.wrap ) );
	for ( const wrapper of existing ) {
		if ( apply ) {
			for ( const variant of relatedStyles( style ) ) {
				if ( variant.name !== style.name ) updateHtmlStyle( html, variant, wrapper, false );
			}
			updateHtmlStyle( html, style, wrapper, true );
		} else if ( matchesStyle( wrapper.getAttribute( html.getGhsAttributeNameForElement( style.element ) ), style ) ) {
			updateHtmlStyle( html, style, wrapper, false );
			if ( style.wrap === 'htmlDiv' ) html.removeModelHtmlClass( 'div', 'style-wrap', wrapper );
			if ( !Array.from( wrapper.getAttributeKeys() ).length ) writer.unwrap( wrapper );
		}
	}
	if ( !apply ) return;

	const groups = [];
	for ( const block of targets ) {
		if ( existing.has( block ) ) continue;
		const group = groups.at( -1 );
		if ( group?.at( -1 ).nextSibling === block ) group.push( block );
		else groups.push( [ block ] );
	}
	for ( const group of groups ) {
		const wrapper = writer.createElement( style.wrap );
		writer.wrap( writer.createRange( writer.createPositionBefore( group[ 0 ] ), writer.createPositionAfter( group.at( -1 ) ) ), wrapper );
		updateHtmlStyle( html, style, wrapper, true );
		if ( style.wrap === 'htmlDiv' && style.classes.length ) html.addModelHtmlClass( 'div', 'style-wrap', wrapper );
	}
}

function applyTextTag( model, writer, key, apply ) {
	const selection = model.document.selection;
	if ( selection.isCollapsed ) {
		if ( apply ) writer.setSelectionAttribute( key, selection.getAttribute( key ) || {} );
		else writer.removeSelectionAttribute( key );
	} else {
		for ( const range of model.schema.getValidRanges( selection.getRanges(), key ) ) {
			if ( !apply ) {
				writer.removeAttribute( key, range );
				continue;
			}
			const missing = Array.from( range.getWalker( { shallow: true } ) )
				.filter( ( { item } ) => !item.hasAttribute( key ) )
				.map( step => writer.createRange( step.previousPosition, step.nextPosition ) );
			for ( const part of missing ) writer.setAttribute( key, {}, part );
		}
	}
}

function getStyleState( editor, html, style, blocks ) {
	const { model, commands } = editor;
	const { selection } = model.document;
	const key = html.getGhsAttributeNameForElement( style.element );
	if ( style.textStyle ) {
		if ( style.nativeCommand ) {
			const command = commands.get( style.nativeCommand );
			return { enabled: command?.isEnabled, active: !!command?.value };
		}
		let value = selection.getAttribute( key );
		if ( !selection.isCollapsed ) {
			for ( const item of selection.getFirstRange().getItems() ) {
				if ( !model.schema.checkAttribute( item, key ) ) continue;
				value = item.getAttribute( key );
				break;
			}
		}
		return { enabled: model.schema.checkAttributeInSelection( selection, key ), active: matchesStyle( value, style ) };
	}
	if ( style.list ) {
		const command = commands.get( 'listStyle' );
		return { enabled: command?.isEnabled, active: command?.value === style.list };
	}
	if ( style.heading ) {
		return {
			enabled: commands.get( 'heading' )?.isEnabled && model.schema.checkChild( blocks[ 0 ]?.parent || '$root', style.heading ),
			active: blocks[ 0 ]?.name === style.heading && matchesStyle( blocks[ 0 ].getAttribute( key ), style )
		};
	}

	let targets;
	if ( style.wrap ) {
		targets = blocks.map( block => findWrapper( block, style ) || ( canWrap( model.schema, block, style.wrap ) ? block : null ) );
	} else {
		const selected = selection.getSelectedElement();
		targets = [ selected, ...blocks, selection.getFirstPosition().parent ].filter( Boolean ).map( block =>
			block.getAncestors( { includeSelf: true, parentFirst: true } ).find( node => style.models.includes( node.name ) )
		);
	}
	targets = [ ...new Set( targets.filter( Boolean ) ) ];
	const target = targets[ 0 ];
	const targetKey = target?.name === 'imageInline' || style.element === 'img' ? 'htmlImgAttributes' : key;
	let value = target?.getAttribute( targetKey );
	if ( target?.name === 'table' ) {
		const nativeStyles = Object.fromEntries( Object.entries( tableStyles ).map( ( [ css, key ] ) => [ css, target.getAttribute( key ) ] ) );
		value = { ...value, styles: { ...nativeStyles, ...value?.styles } };
	}
	const legacyImageStyle = target?.name === 'imageBlock' && style.element === 'figure' &&
		matchesStyle( target.getAttribute( 'htmlImgAttributes' ), style );
	const active = style.preset ? target?.getAttribute( style.preset ) === style.classes[ 0 ] : matchesStyle( value, style ) || legacyImageStyle;
	return { enabled: !!target, active, targets };
}

function updateImageClasses( writer, target, style, apply ) {
	const key = 'htmlImgAttributes';
	const { classes, ...attributes } = target.getAttribute( key ) || {};
	const updated = new Set( classes );
	for ( const variant of apply ? relatedStyles( style ) : [ style ] ) {
		for ( const name of variant.classes ) updated.delete( name );
	}
	if ( apply ) for ( const name of style.classes ) updated.add( name );
	if ( updated.size ) attributes.classes = [ ...updated ];
	if ( Object.keys( attributes ).length ) writer.setAttribute( key, attributes, target );
	else writer.removeAttribute( key, target );
}

function updateObject( writer, html, style, target, apply ) {
	if ( style.preset ) {
		if ( !apply && target.getAttribute( style.preset ) !== style.classes[ 0 ] ) return;
		if ( apply ) writer.setAttribute( style.preset, style.classes[ 0 ], target );
		else writer.removeAttribute( style.preset, target );
		for ( const [ key, value ] of Object.entries( style.dimensions || {} ) ) {
			if ( apply ) writer.setAttribute( key, value, target );
			else if ( target.getAttribute( key ) === value ) writer.removeAttribute( key, target );
		}
		return;
	}

	const element = target.name === 'imageInline' ? 'img' : style.element;
	if ( element === 'img' ) {
		// The image integration stores attributes of the inner IMG separately from its figure.
		updateImageClasses( writer, target, style, apply );
		return;
	}
	if ( !apply && element === 'figure' && target.name === 'imageBlock' ) updateImageClasses( writer, target, style, false );
	for ( const variant of relatedStyles( style ) ) {
		const selected = variant.name === style.name;
		const add = apply && selected;
		if ( !selected && !apply ) continue;
		let htmlStyle = variant;
		if ( element === 'table' && variant.styles ) {
			const styles = { ...variant.styles };
			for ( const [ property, key ] of Object.entries( tableStyles ) ) {
				if ( !( property in styles ) ) continue;
				if ( add ) writer.setAttribute( key, styles[ property ], target );
				else if ( sameValue( target.getAttribute( key ), styles[ property ] ) ) writer.removeAttribute( key, target );
				delete styles[ property ];
			}
			htmlStyle = { ...variant, styles };
		}
		updateHtmlStyle( html, htmlStyle, target, add, element );
	}
}

export class XerteLegacyStyles extends Plugin {
	static get pluginName() { return 'XerteLegacyStyles'; }

	afterInit() {
		const { editor } = this;
		const { model } = editor;
		const html = editor.plugins.get( 'GeneralHtmlSupport' );
		const command = editor.commands.get( 'style' );
		const custom = new Map( ( editor.config.get( 'style.definitions' ) || [] )
			.filter( usesCustomCommand ).map( style => [ style.name, style ] ) );
		if ( !command || !custom.size ) return;

		// The ordinary DIV heading option would split a styled container into text blocks.
		// Consume just the element name so GHS still preserves all of its attributes.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'div',
			model: ( element, { writer } ) => {
				const classes = Array.from( element.getClassNames() );
				const background = element.getStyle( 'background-color' ) || element.getStyle( 'background' );
				const special = sameValue( background, '#eee' ) && sameValue( element.getStyle( 'color' ), '#000' );
				if ( special || classes.some( name => name === 'style-wrap' || /^speech-bubble[1-6]$/.test( name ) ) ||
					( classes.includes( 'panel' ) && classes.includes( 'editorStyle' ) ) ) {
					return writer.createElement( 'htmlDiv' );
				}
				return null;
			},
			converterPriority: 'high'
		} );
		// Retain the semantic DEL tag instead of the basic-styles conversion to S.
		const dataFilter = editor.plugins.get( 'DataFilter' );
		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: 'del',
			model: { key: 'htmlDel', value: ( element, api ) => dataFilter.processViewAttributes( element, api ) || {} },
			converterPriority: 'high'
		} );

		const refresh = command.refresh.bind( command );
		command.refresh = () => {
			refresh();
			const firstBlock = model.document.selection.getSelectedBlocks().next().value;
			const blocks = firstBlock ? [ firstBlock ] : [];
			const enabled = command.enabledStyles.filter( name => !custom.has( name ) );
			const active = command.value.filter( name => !custom.has( name ) );
			for ( const style of custom.values() ) {
				const state = getStyleState( editor, html, style, blocks );
				if ( state.enabled ) enabled.push( style.name );
				if ( state.active ) active.push( style.name );
			}
			command.enabledStyles = enabled.sort();
			command.isEnabled = !!enabled.length;
			command.value = command.isEnabled ? active.sort() : [];
		};

		this.listenTo( command, 'execute', ( event, [ { styleName, forceValue } ] ) => {
			const style = custom.get( styleName );
			if ( !style ) return;
			event.stop();
			const { selection } = model.document;
			const state = getStyleState( editor, html, style, [ ...selection.getSelectedBlocks() ] );
			if ( !state.enabled ) return;
			const apply = forceValue ?? !state.active;
			model.change( writer => {
				if ( style.wrap ) {
					wrapBlocks( writer, html, style, state.targets, apply );
				} else if ( style.list ) {
					editor.execute( 'listStyle', { type: apply ? style.list : null } );
				} else if ( style.heading ) {
					if ( apply ) editor.execute( 'heading', { value: style.heading } );
					for ( const block of selection.getSelectedBlocks() ) {
						if ( block.name === style.heading ) updateHtmlStyle( html, style, block, apply );
					}
				} else if ( style.textStyle ) {
					if ( style.nativeCommand ) editor.execute( style.nativeCommand, { forceValue: apply } );
					else if ( style.attributes ) updateHtmlStyle( html, style, selection, apply );
					else applyTextTag( model, writer, html.getGhsAttributeNameForElement( style.element ), apply );
				} else {
					for ( const target of state.targets ) updateObject( writer, html, style, target, apply );
				}
			} );
		}, { priority: 'high' } );
	}
}

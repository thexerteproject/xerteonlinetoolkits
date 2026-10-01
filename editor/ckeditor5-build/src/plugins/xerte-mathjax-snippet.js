/**
 * Editable MathJax widget compatible with CKEditor 4's extmathjax HTML.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconHtml } from 'ckeditor5/src/icons.js';
import { toWidget } from '@ckeditor/ckeditor5-widget';
import { normalizeMathJaxInput, parseMathJaxValue, serializeMathJaxValue } from './xerte-mathjax-utils.js';

let mathJaxPromise;

function loadMathJax( library ) {
	if ( window.MathJax && window.MathJax.Hub ) return Promise.resolve( window.MathJax );
	if ( mathJaxPromise ) return mathJaxPromise;
	mathJaxPromise = new Promise( ( resolve, reject ) => {
		const script = document.createElement( 'script' );
		script.src = library;
		script.async = true;
		script.onload = () => resolve( window.MathJax );
		script.onerror = () => reject( new Error( `Unable to load MathJax from ${ library }` ) );
		document.head.appendChild( script );
	} );
	return mathJaxPromise;
}

function typesetMath( element, value, library ) {
	setMathSource( element, value );
	return loadMathJax( library ).then( mathJax => {
		if ( mathJax && mathJax.Hub ) {
			mathJax.Hub.Queue( [ 'Typeset', mathJax.Hub, element ] );
		}
	} ).catch( () => {
		// Keeping the source visible is a usable fallback when the library fails.
	} );
}

function setMathSource( element, value ) {
	if ( /^<math(?:\s|>)/i.test( value ) ) {
		const documentNode = new DOMParser().parseFromString( value, 'application/xml' );
		const root = documentNode.documentElement;
		const elements = Array.from( root.querySelectorAll( '*' ) );
		const unsafe = root.localName !== 'math' || documentNode.querySelector( 'parsererror' ) ||
			[ root, ...elements ].some( node => [ ...node.attributes ].some( attribute => /^(?:on|href|src|style)/i.test( attribute.name ) ) );
		if ( !unsafe ) {
			element.replaceChildren( document.importNode( root, true ) );
			return;
		}
	}
	element.textContent = value;
}

function viewSource( node ) {
	let source = '';
	for ( const child of node.getChildren() ) {
		if ( child.is( '$text' ) ) {
			source += child.data;
		} else if ( child.is( 'element' ) ) {
			source += serializeViewElement( child );
		}
	}
	return source;
}

function serializeViewElement( element ) {
	const attributes = Array.from( element.getAttributes() )
		.map( ( [ key, value ] ) => ` ${ key }="${ escapeAttribute( value ) }"` )
		.join( '' );
	return `<${ element.name }${ attributes }>${ viewSource( element ) }</${ element.name }>`;
}

function escapeAttribute( value ) {
	return String( value ).replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' );
}

function equationValue( element ) {
	return serializeMathJaxValue( {
		source: element.getAttribute( 'source' ),
		syntax: element.getAttribute( 'syntax' ),
		display: element.getAttribute( 'display' )
	} );
}

function createEquationView( writer, modelElement, editing, t, library ) {
	if ( editing ) {
		const value = equationValue( modelElement );
		const widget = writer.createContainerElement( 'span', {
			class: modelElement.getAttribute( 'display' ) === 'block' ?
				'xerte-mathjax-widget mathjax-block' : 'xerte-mathjax-widget',
			'aria-label': t( 'Math equation' )
		} );
		const preview = writer.createRawElement( 'span', { class: 'xerte-mathjax-preview' }, domElement => {
			typesetMath( domElement, value, library );
		} );
		writer.insert( writer.createPositionAt( widget, 0 ), preview );
		return toWidget( widget, writer, { label: t( 'Math equation' ) } );
	}
	const span = writer.createContainerElement( 'span', { class: 'mathjax' } );
	writer.insert( writer.createPositionAt( span, 0 ), writer.createText( equationValue( modelElement ) ) );
	return span;
}

export class XerteMathJaxSnippet extends Plugin {
	static get pluginName() {
		return 'XerteMathJaxSnippet';
	}

	init() {
		const editor = this.editor;
		const library = editor.config.get( 'xerteMathJaxLib' );
		editor.model.schema.register( 'xerteMathJax', {
			isInline: true,
			isObject: true,
			allowWhere: '$text',
			allowAttributes: [ 'source', 'syntax', 'display' ]
		} );

		for ( const className of [ 'mathjax', 'math-tex' ] ) {
			editor.conversion.for( 'upcast' ).elementToElement( {
				view: { name: 'span', classes: className },
				model: ( viewElement, { writer } ) => writer.createElement( 'xerteMathJax', parseMathJaxValue( viewSource( viewElement ) ) ),
				converterPriority: 'high'
			} );
		}
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: { name: 'xerteMathJax', attributes: [ 'source', 'syntax', 'display' ] },
			view: ( modelElement, { writer } ) => createEquationView( writer, modelElement, false, editor.t, library )
		} );
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: { name: 'xerteMathJax', attributes: [ 'source', 'syntax', 'display' ] },
			view: ( modelElement, { writer } ) => createEquationView( writer, modelElement, true, editor.t, library )
		} );

		const openEditor = async equation => {
			const values = await editEquation( equation && {
				source: equation.getAttribute( 'source' ),
				syntax: equation.getAttribute( 'syntax' ),
				display: equation.getAttribute( 'display' )
			}, editor.t, library );
			if ( !values ) return;

			editor.model.change( writer => {
				if ( equation ) {
					for ( const [ key, value ] of Object.entries( values ) ) writer.setAttribute( key, value, equation );
					writer.setSelection( equation, 'on' );
				} else {
					editor.model.insertObject( writer.createElement( 'xerteMathJax', values ), null, null, { setSelection: 'on' } );
				}
			} );
			editor.editing.view.focus();
		};

		editor.ui.componentFactory.add( 'xerteMathJax', locale => {
			const button = new ButtonView( locale );
			button.set( { label: editor.t( 'Math' ), icon: IconHtml, tooltip: true } );
			button.on( 'execute', async () => {
				const selected = editor.model.document.selection.getSelectedElement();
				const equation = selected && selected.is( 'element', 'xerteMathJax' ) ? selected : null;
				await openEditor( equation );
			} );
			return button;
		} );

		let doubleClickBound = false;
		const bindDoubleClick = () => {
			if ( doubleClickBound ) return;
			const editable = editor.ui.getEditableElement ? editor.ui.getEditableElement() : editor.editing.view.getDomRoot();
			if ( !editable ) return;
			doubleClickBound = true;
			const onDoubleClick = event => {
				const widgetDom = event.target.nodeType === Node.ELEMENT_NODE ?
					event.target.closest( '.xerte-mathjax-widget' ) : event.target.parentElement?.closest( '.xerte-mathjax-widget' );
				if ( !widgetDom || !editable.contains( widgetDom ) ) return;
				const viewElement = editor.editing.view.domConverter.domToView( widgetDom );
				const modelElement = viewElement && editor.editing.mapper.toModelElement( viewElement );
				if ( !modelElement || !modelElement.is( 'element', 'xerteMathJax' ) ) return;
				event.preventDefault();
				editor.model.change( writer => writer.setSelection( modelElement, 'on' ) );
				openEditor( modelElement );
			};
			editable.addEventListener( 'dblclick', onDoubleClick );
			editor.once( 'destroy', () => editable.removeEventListener( 'dblclick', onDoubleClick ) );
		};
		editor.ui.once( 'ready', bindDoubleClick );
		editor.once( 'ready', bindDoubleClick );
	}
}

function editEquation( current, t, library ) {
	return new Promise( resolve => {
		const values = current || { source: '', syntax: 'tex', display: 'block' };
		const overlay = document.createElement( 'div' );
		overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:#0f172a8c;display:flex;align-items:center;justify-content:center;padding:20px';
		const form = document.createElement( 'form' );
		form.setAttribute( 'role', 'dialog' ); form.setAttribute( 'aria-modal', 'true' ); form.setAttribute( 'aria-label', t( 'Mathematics' ) );
		form.style.cssText = 'box-sizing:border-box;width:560px;max-width:95vw;padding:20px;border-radius:10px;background:#fff;color:#172033;font:14px system-ui,sans-serif';
		const title = document.createElement( 'h2' ); title.textContent = t( 'Mathematics' ); title.style.cssText = 'margin:0 0 16px;font-size:19px'; form.appendChild( title );
		const options = document.createElement( 'div' ); options.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px';
		const syntax = selectField( t( 'Syntax' ), [ [ 'tex', 'TeX' ], [ 'asciimath', 'AsciiMath' ], [ 'mathml', 'MathML' ] ], values.syntax );
		const display = selectField( t( 'Display' ), [ [ 'inline', t( 'Inline' ) ], [ 'block', t( 'Block' ) ] ], values.display );
		options.append( syntax.label, display.label ); form.appendChild( options );
		const sourceLabel = document.createElement( 'label' ); sourceLabel.textContent = t( 'Equation source' ); sourceLabel.style.cssText = 'display:block;margin-top:16px;font-weight:600';
		const source = document.createElement( 'textarea' ); source.value = values.source || ''; source.rows = 6; source.style.cssText = 'box-sizing:border-box;width:100%;margin-top:6px;padding:10px;border:1px solid #94a3b8;border-radius:6px;font:14px ui-monospace,monospace';
		sourceLabel.appendChild( source ); form.appendChild( sourceLabel );
		const help = document.createElement( 'div' );
		help.style.cssText = 'display:flex;justify-content:space-between;gap:12px;margin-top:8px;color:#475569;font-size:13px';
		const helpText = document.createElement( 'span' );
		helpText.textContent = t( 'Enter the equation without outer delimiters; they are added automatically.' );
		const documentation = document.createElement( 'a' );
		documentation.href = 'https://en.wikibooks.org/wiki/LaTeX/Mathematics';
		documentation.target = '_blank';
		documentation.rel = 'noopener noreferrer';
		documentation.textContent = t( 'TeX documentation' );
		help.append( helpText, documentation );
		form.appendChild( help );
		const previewTitle = document.createElement( 'div' ); previewTitle.textContent = t( 'Preview' ); previewTitle.style.cssText = 'margin-top:14px;color:#475569';
		const preview = document.createElement( 'div' ); preview.style.cssText = 'min-height:44px;margin:5px 0 0;padding:10px;overflow:auto;background:#f1f5f9;border-radius:6px;text-align:center'; form.append( previewTitle, preview );
		const actions = document.createElement( 'div' ); actions.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:18px';
		const cancel = dialogButton( t( 'Cancel' ) ); const save = dialogButton( current ? t( 'Update' ) : t( 'Insert' ) ); save.type = 'submit'; save.style.background = '#2563eb'; save.style.color = '#fff';
		actions.append( cancel, save ); form.appendChild( actions ); overlay.appendChild( form ); document.body.appendChild( overlay );
		let updateTimer;
		const update = () => {
			clearTimeout( updateTimer );
			const value = serializeMathJaxValue( { source: source.value, syntax: syntax.input.value, display: display.input.value } );
			preview.textContent = value;
			updateTimer = setTimeout( () => typesetMath( preview, value, library ), 150 );
			save.disabled = !source.value.trim();
		};
		const close = result => { overlay.remove(); resolve( result ); };
		for ( const input of [ source, syntax.input, display.input ] ) input.addEventListener( 'input', update );
		cancel.addEventListener( 'click', () => close( null ) ); overlay.addEventListener( 'click', event => { if ( event.target === overlay ) close( null ); } );
		overlay.addEventListener( 'keydown', event => { if ( event.key === 'Escape' ) close( null ); } );
		form.addEventListener( 'submit', event => {
			event.preventDefault();
			close( normalizeMathJaxInput( source.value, syntax.input.value, display.input.value ) );
		} );
		update(); source.focus();
	} );
}

function selectField( text, choices, value ) {
	const label = document.createElement( 'label' ); label.textContent = text; label.style.cssText = 'font-weight:600';
	const input = document.createElement( 'select' ); input.style.cssText = 'display:block;box-sizing:border-box;width:100%;margin-top:6px;padding:8px;border:1px solid #94a3b8;border-radius:6px';
	for ( const [ key, caption ] of choices ) { const option = document.createElement( 'option' ); option.value = key; option.textContent = caption; input.appendChild( option ); }
	input.value = value; label.appendChild( input ); return { label, input };
}

function dialogButton( text ) {
	const element = document.createElement( 'button' ); element.type = 'button'; element.textContent = text;
	element.style.cssText = 'padding:8px 14px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;cursor:pointer'; return element;
}

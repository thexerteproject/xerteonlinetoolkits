/**
 * Accessibility checks for authored content using axe-core.
 *
 * This Xerte integration is Apache-2.0. axe-core is MPL-2.0; see the
 * distribution notice next to the generated CKEditor bundle.
 */
import axe from 'axe-core';
import { Command, Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconAccessibility } from '@ckeditor/ckeditor5-icons';

const CHECKER_RULES = [
	'image-alt',
	'image-redundant-alt',
	'link-name',
	'link-in-text-block',
	'list',
	'listitem',
	'heading-order',
	'empty-heading',
	'empty-table-header',
	'th-has-data-cells',
	'scope-attr-valid',
	'valid-lang',
	'p-as-heading',
	'table-fake-caption',
	'td-has-header'
];

const HIGHLIGHT_CLASS = 'xerte-axe-highlight';

function getEditableElement( editor ) {
	if ( editor.ui && typeof editor.ui.getEditableElement === 'function' ) {
		return editor.ui.getEditableElement();
	}
	return editor.editing.view.getDomRoot();
}

function injectStyles() {
	if ( document.getElementById( 'xerte-axe-checker-styles' ) ) {
		return;
	}

	const style = document.createElement( 'style' );
	style.id = 'xerte-axe-checker-styles';
	style.textContent = `
		.${ HIGHLIGHT_CLASS } { outline: 3px solid #d63638 !important; outline-offset: 2px !important; }
		.xerte-axe-overlay { position:fixed; right:18px; bottom:18px; z-index:2147483645; pointer-events:none; }
		.xerte-axe-dialog { box-sizing:border-box; width:560px; height:70vh; min-width:340px; min-height:240px; max-width:calc(100vw - 36px); max-height:calc(100vh - 36px); overflow:auto; resize:both; padding:0 18px 18px; border:1px solid #94a3b8; border-radius:10px; background:#fff; color:#172033; box-shadow:0 16px 48px rgba(15,23,42,.32); font:14px system-ui,-apple-system,Segoe UI,Arial,sans-serif; pointer-events:auto; }
		.xerte-axe-dialog-header { position:sticky; top:0; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:12px; margin:0 -18px 14px; padding:12px 14px; border-bottom:1px solid #cbd5e1; border-radius:10px 10px 0 0; background:#f8fafc; cursor:move; user-select:none; }
		.xerte-axe-dialog-header h2 { margin:0; font-size:18px; }
		.xerte-axe-header-close { flex:0 0 auto; width:30px; height:30px; padding:0; border:1px solid transparent; border-radius:5px; background:transparent; color:#334155; font-size:22px; line-height:26px; cursor:pointer; }
		.xerte-axe-header-close:hover, .xerte-axe-header-close:focus { border-color:#94a3b8; background:#fff; }
		.xerte-axe-summary { margin:0 0 16px; color:#475569; }
		.xerte-axe-list { display:grid; gap:10px; margin:0; padding:0; list-style:none; }
		.xerte-axe-item { border:1px solid #cbd5e1; border-left:5px solid #d63638; border-radius:8px; padding:12px; }
		.xerte-axe-item--review { border-left-color:#996800; }
		.xerte-axe-item h3 { margin:0 0 5px; font-size:15px; }
		.xerte-axe-meta { margin:0 0 7px; color:#64748b; font-size:12px; }
		.xerte-axe-item p { margin:5px 0; }
		.xerte-axe-item code { display:block; overflow:auto; padding:6px; background:#f1f5f9; border-radius:5px; white-space:pre-wrap; font-size:12px; }
		.xerte-axe-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; }
		.xerte-axe-button { padding:8px 13px; border:1px solid #94a3b8; border-radius:7px; background:#fff; color:#172033; cursor:pointer; font:inherit; }
		.xerte-axe-button:hover, .xerte-axe-button:focus { background:#f1f5f9; }
		.xerte-axe-locate { margin-top:7px; }
	`;
	document.head.appendChild( style );
}

function clearHighlights( editable ) {
	if ( !editable ) {
		return;
	}
	for ( const element of editable.querySelectorAll( `.${ HIGHLIGHT_CLASS }` ) ) {
		element.classList.remove( HIGHLIGHT_CLASS );
	}
}

function resolveTarget( editable, target ) {
	const selector = Array.isArray( target ) ? target[ target.length - 1 ] : target;
	if ( !selector || typeof selector !== 'string' ) {
		return null;
	}
	try {
		return editable.matches( selector ) ? editable : editable.querySelector( selector );
	} catch ( error ) {
		return null;
	}
}

function locateIssue( editor, node ) {
	const editable = getEditableElement( editor );
	clearHighlights( editable );
	const element = editable && resolveTarget( editable, node.target );
	if ( !element ) {
		return false;
	}

	element.classList.add( HIGHLIGHT_CLASS );
	element.scrollIntoView( { behavior: 'smooth', block: 'center' } );

	try {
		const viewElement = editor.editing.view.domConverter.domToView( element );
		if ( viewElement ) {
			const modelElement = editor.editing.mapper.toModelElement( viewElement );
			if ( modelElement ) {
				editor.model.change( writer => writer.setSelection( modelElement, 'on' ) );
			}
		}
	} catch ( error ) {
		// Highlighting is still useful when an editing wrapper has no model element.
	}
	return true;
}

function flattenResults( results ) {
	const issues = [];
	for ( const [ resultType, entries ] of [
		[ 'violation', results.violations || [] ],
		[ 'review', results.incomplete || [] ]
	] ) {
		for ( const entry of entries ) {
			for ( const node of entry.nodes ) {
				issues.push( { resultType, entry, node } );
			}
		}
	}
	return issues;
}

function showResultsDialog( editor, results ) {
	injectStyles();
	const t = editor.t;
	const editable = getEditableElement( editor );
	const issues = flattenResults( results );
	const previouslyFocused = document.activeElement;

	const overlay = document.createElement( 'div' );
	overlay.className = 'xerte-axe-overlay';
	const dialog = document.createElement( 'section' );
	dialog.className = 'xerte-axe-dialog';
	dialog.setAttribute( 'role', 'dialog' );
	dialog.setAttribute( 'aria-labelledby', 'xerte-axe-title' );

	const dialogHeader = document.createElement( 'header' );
	dialogHeader.className = 'xerte-axe-dialog-header';
	const heading = document.createElement( 'h2' );
	heading.id = 'xerte-axe-title';
	heading.textContent = t( 'Accessibility checker' );
	dialogHeader.appendChild( heading );
	const headerClose = document.createElement( 'button' );
	headerClose.type = 'button';
	headerClose.className = 'xerte-axe-header-close';
	headerClose.setAttribute( 'aria-label', t( 'Close' ) );
	headerClose.title = t( 'Close' );
	headerClose.textContent = '×';
	dialogHeader.appendChild( headerClose );
	dialog.appendChild( dialogHeader );

	const summary = document.createElement( 'p' );
	summary.className = 'xerte-axe-summary';
	if ( issues.length ) {
		const violations = issues.filter( issue => issue.resultType === 'violation' ).length;
		const reviews = issues.length - violations;
		summary.textContent = `${ violations } ${ t( 'issues' ) }; ${ reviews } ${ t( 'items need manual review' ) }.`;
	} else {
		summary.textContent = t( 'No automated accessibility issues were found. Manual testing is still required.' );
	}
	dialog.appendChild( summary );

	if ( issues.length ) {
		const list = document.createElement( 'ol' );
		list.className = 'xerte-axe-list';
		for ( const issue of issues ) {
			const item = document.createElement( 'li' );
			item.className = `xerte-axe-item${ issue.resultType === 'review' ? ' xerte-axe-item--review' : '' }`;

			const title = document.createElement( 'h3' );
			title.textContent = issue.entry.help;
			item.appendChild( title );

			const meta = document.createElement( 'p' );
			meta.className = 'xerte-axe-meta';
			meta.textContent = `${ issue.resultType === 'review' ? t( 'Needs review' ) : t( 'Issue' ) } · ${ issue.entry.impact || t( 'unknown impact' ) } · ${ issue.entry.id }`;
			item.appendChild( meta );

			const message = document.createElement( 'p' );
			message.textContent = issue.node.failureSummary || issue.entry.description;
			item.appendChild( message );

			const html = document.createElement( 'code' );
			html.textContent = issue.node.html;
			item.appendChild( html );

			const locate = document.createElement( 'button' );
			locate.type = 'button';
			locate.className = 'xerte-axe-button xerte-axe-locate';
			locate.textContent = t( 'Locate in editor' );
			locate.addEventListener( 'click', () => locateIssue( editor, issue.node ) );
			item.appendChild( locate );

			const help = document.createElement( 'a' );
			help.href = issue.entry.helpUrl;
			help.target = '_blank';
			help.rel = 'noopener noreferrer';
			help.textContent = t( 'More information' );
			help.style.marginLeft = '10px';
			item.appendChild( help );
			list.appendChild( item );
		}
		dialog.appendChild( list );
	}

	const actions = document.createElement( 'div' );
	actions.className = 'xerte-axe-actions';
	const close = document.createElement( 'button' );
	close.type = 'button';
	close.className = 'xerte-axe-button';
	close.textContent = t( 'Close' );
	actions.appendChild( close );
	dialog.appendChild( actions );
	overlay.appendChild( dialog );
	document.body.appendChild( overlay );

	let dragCleanup = null;
	const startDrag = event => {
		if ( event.button !== 0 || event.target.closest( 'button, a, input, select, textarea' ) ) {
			return;
		}
		event.preventDefault();
		const panelRect = overlay.getBoundingClientRect();
		const offsetX = event.clientX - panelRect.left;
		const offsetY = event.clientY - panelRect.top;
		overlay.style.left = panelRect.left + 'px';
		overlay.style.top = panelRect.top + 'px';
		overlay.style.right = 'auto';
		overlay.style.bottom = 'auto';

		const move = moveEvent => {
			const maxLeft = Math.max( 0, window.innerWidth - overlay.offsetWidth );
			const maxTop = Math.max( 0, window.innerHeight - 44 );
			overlay.style.left = Math.min( maxLeft, Math.max( 0, moveEvent.clientX - offsetX ) ) + 'px';
			overlay.style.top = Math.min( maxTop, Math.max( 0, moveEvent.clientY - offsetY ) ) + 'px';
		};
		const stop = () => {
			document.removeEventListener( 'pointermove', move, true );
			document.removeEventListener( 'pointerup', stop, true );
			dragCleanup = null;
		};
		dragCleanup = stop;
		document.addEventListener( 'pointermove', move, true );
		document.addEventListener( 'pointerup', stop, true );
	};
	dialogHeader.addEventListener( 'pointerdown', startDrag );

	const dismiss = () => {
		if ( dragCleanup ) {
			dragCleanup();
		}
		clearHighlights( editable );
		overlay.remove();
		document.removeEventListener( 'keydown', onKeydown, true );
		if ( previouslyFocused && typeof previouslyFocused.focus === 'function' ) {
			previouslyFocused.focus();
		}
	};
	const onKeydown = event => {
		if ( event.key === 'Escape' ) {
			event.preventDefault();
			dismiss();
		}
	};
	close.addEventListener( 'click', dismiss );
	headerClose.addEventListener( 'click', dismiss );
	document.addEventListener( 'keydown', onKeydown, true );
	close.focus();
}

class XerteAccessibilityCheckerCommand extends Command {
	refresh() {
		this.isEnabled = !this.editor.isReadOnly;
	}

	async execute() {
		const editable = getEditableElement( this.editor );
		if ( !editable ) {
			throw new Error( 'CKEditor editable element is unavailable.' );
		}

		clearHighlights( editable );
		const results = await axe.run( editable, {
			runOnly: { type: 'rule', values: CHECKER_RULES },
			resultTypes: [ 'violations', 'incomplete' ]
		} );
		showResultsDialog( this.editor, results );
	}
}

export class XerteAccessibilityChecker extends Plugin {
	static get pluginName() {
		return 'XerteAccessibilityChecker';
	}

	init() {
		const editor = this.editor;
		editor.commands.add( 'accessibilityChecker', new XerteAccessibilityCheckerCommand( editor ) );
		editor.ui.componentFactory.add( 'accessibilityChecker', locale => {
			const command = editor.commands.get( 'accessibilityChecker' );
			const button = new ButtonView( locale );
			button.set( {
				label: editor.t( 'Check accessibility' ),
				icon: IconAccessibility,
				tooltip: true
			} );
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			button.on( 'execute', () => {
				command.execute().catch( error => {
					console.error( '[XerteAccessibilityChecker]', error );
					window.alert( editor.t( 'The accessibility check could not be completed.' ) );
				} );
			} );
			return button;
		} );
	}
}

/**
 * Right-click context menu (legacy CKEditor 4 parity).
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { runXertePageLink } from './xerte-page-link.js';
import { parseXertePageId } from './xerte-page-link-utils.js';
import { runAutocolumnsDialog } from './xerte-autocolumns-dialog.js';
import { runXerteMarkWord } from './xerte-mark-word.js';

const boundEditables = new WeakSet();

function injectStyles() {
	if ( document.getElementById( 'xerte-ck5-context-menu-style' ) ) {
		return;
	}
	const style = document.createElement( 'style' );
	style.id = 'xerte-ck5-context-menu-style';
	style.textContent = `
		.xerte-ck5-context-menu {
			position: fixed;
			z-index: 2147483646;
			min-width: 180px;
			padding: 4px 0;
			margin: 0;
			list-style: none;
			background: #fff;
			border: 1px solid #b6b6b6;
			box-shadow: 0 2px 6px rgba(0,0,0,0.2);
			font: 12px Arial, Helvetica, sans-serif;
			color: #333;
			pointer-events: auto;
		}
		.xerte-ck5-context-menu button {
			display: block;
			width: 100%;
			padding: 4px 12px;
			border: 0;
			background: transparent;
			color: inherit;
			font: inherit;
			text-align: left;
			cursor: pointer;
		}
		.xerte-ck5-context-menu button:hover { background: #e9e9e9; }
		.xerte-ck5-context-menu button[disabled] { color: #aaa; pointer-events: none; }
		.xerte-ck5-context-menu .xerte-ctx-sep { height: 1px; margin: 4px 0; background: #d1d1d1; }
	`;
	document.head.appendChild( style );
}

function getEditableElement( editor ) {
	if ( editor.ui && typeof editor.ui.getEditableElement === 'function' ) {
		const el = editor.ui.getEditableElement();
		if ( el ) {
			return el;
		}
	}
	const view = editor.ui && editor.ui.view;
	if ( view && view.editable && view.editable.element ) {
		return view.editable.element;
	}
	return editor.editing.view.getDomRoot();
}

function saveModelSelection( editor ) {
	return Array.from( editor.model.document.selection.getRanges() ).map( range => range.clone() );
}

function restoreModelSelection( editor, savedRanges ) {
	if ( !savedRanges || !savedRanges.length ) {
		return;
	}
	editor.model.change( writer => {
		writer.setSelection( savedRanges );
	} );
}

function cutOrCopy( editor, command, savedRanges ) {
	restoreModelSelection( editor, savedRanges );
	editor.editing.view.focus();
	const editable = getEditableElement( editor );
	if ( !editable ) {
		return;
	}
	editable.focus();
	try {
		document.execCommand( command );
	} catch ( e ) {
		console.error( '[XerteContextMenu]', command, e );
	}
}

async function pasteClipboard( editor, savedRanges ) {
	restoreModelSelection( editor, savedRanges );
	editor.editing.view.focus();

	try {
		const text = await navigator.clipboard.readText();
		if ( text ) {
			editor.model.change( writer => {
				writer.setSelection( savedRanges );
				const position = editor.model.document.selection.getFirstPosition();
				writer.insertText( text, position );
			} );
			return;
		}
	} catch ( e ) {
		// Clipboard API may be blocked; try native paste below.
	}

	const editable = getEditableElement( editor );
	if ( editable ) {
		editable.focus();
		try {
			document.execCommand( 'paste' );
		} catch ( err ) {
			console.error( '[XerteContextMenu] paste', err );
		}
	}
}

function getXertePageLink( editor, target ) {
	const domRoot = editor.editing.view.getDomRoot();
	if ( !domRoot || !target ) {
		return null;
	}
	let node = target.nodeType === Node.TEXT_NODE ? target.parentElement : target;
	while ( node && node !== domRoot ) {
		if ( node.nodeName === 'A' ) {
			const id = parseXertePageId(
				node.getAttribute( 'onclick' ) ||
				node.getAttribute( 'data-ck-unsafe-attribute-onclick' ) ||
				node.getAttribute( 'data-cke-pa-onclick' )
			);
			if ( !id ) {
				return null;
			}
			const viewLink = editor.editing.view.domConverter.domToView( node );
			if ( !viewLink ) {
				return null;
			}
			const viewRange = editor.editing.view.createRangeIn( viewLink );
			const range = editor.editing.mapper.toModelRange( viewRange );
			return range && !range.isCollapsed ? { id, range } : null;
		}
		node = node.parentElement;
	}
	return null;
}

function selectionHasText( savedRanges, editor ) {
	if ( savedRanges && savedRanges.length ) {
		try {
			let text = '';
			for ( const range of savedRanges ) {
				for ( const item of range.getItems() ) {
					if ( item.is( '$textProxy' ) ) {
						text += item.data;
					}
				}
			}
			if ( text.trim() ) {
				return true;
			}
		} catch ( e ) { /* ignore */ }
	}
	try {
		if ( editor.model.document.selection.getSelectedText() ) {
			return true;
		}
	} catch ( e ) { /* ignore */ }
	return false;
}

export class XerteContextMenu extends Plugin {
	static get pluginName() {
		return 'XerteContextMenu';
	}

	init() {
		const editor = this.editor;
		injectStyles();

		let menuEl = null;
		let dismissCleanup = null;
		let savedSelectionRanges = null;
		let savedSelectionText = null;
		let savedPageLink = null;

		const hideMenu = () => {
			if ( dismissCleanup ) {
				dismissCleanup();
				dismissCleanup = null;
			}
			if ( menuEl && menuEl.parentNode ) {
				menuEl.parentNode.removeChild( menuEl );
			}
			menuEl = null;
		};

		const runMenuAction = action => {
			const ranges = savedSelectionRanges;
			hideMenu();
			editor.editing.view.focus();
			restoreModelSelection( editor, ranges );
			window.requestAnimationFrame( () => {
				try {
					const result = action( ranges );
					if ( result && typeof result.then === 'function' ) {
						result.catch( error => console.error( '[XerteContextMenu]', error ) );
					}
				} catch ( error ) {
					console.error( '[XerteContextMenu]', error );
				}
			} );
		};

		const addItem = ( parent, label, action, enabled = true, runSync = false ) => {
			const li = document.createElement( 'li' );
			const btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.textContent = label;
			btn.disabled = !enabled;
			btn.addEventListener( 'mousedown', event => {
				// Keep editor/model selection until the click runs.
				event.preventDefault();
			} );
			btn.addEventListener( 'click', event => {
				event.preventDefault();
				event.stopPropagation();
				if ( !enabled ) {
					return;
				}
				if ( runSync ) {
					hideMenu();
					try {
						action();
					} catch ( error ) {
						console.error( '[XerteContextMenu]', error );
					}
				} else {
					runMenuAction( action );
				}
			} );
			li.appendChild( btn );
			parent.appendChild( li );
		};

		const showMenu = ( clientX, clientY, ownerDocument ) => {
			hideMenu();

			const doc = ownerDocument || document;
			menuEl = doc.createElement( 'ul' );
			menuEl.className = 'xerte-ck5-context-menu';

			const hasText = selectionHasText( savedSelectionRanges, editor );
			const editLink = savedPageLink;

			addItem( menuEl, editor.t( 'Cut' ), ranges => cutOrCopy( editor, 'cut', ranges ), hasText );
			addItem( menuEl, editor.t( 'Copy' ), ranges => cutOrCopy( editor, 'copy', ranges ), hasText );
			addItem( menuEl, editor.t( 'Paste' ), ranges => pasteClipboard( editor, ranges ) );

			const sep = document.createElement( 'li' );
			sep.className = 'xerte-ctx-sep';
			menuEl.appendChild( sep );

			addItem( menuEl, editLink ? editor.t( 'Edit Xerte Page Link' ) : editor.t( 'Xerte Page Link' ), () => runXertePageLink( editor, editLink ) );
			addItem( menuEl, editor.t( 'Mark Word' ), () => {
				runXerteMarkWord( editor, savedSelectionRanges, savedSelectionText );
			}, hasText, true );
			addItem( menuEl, editor.t( 'Autocolumns' ), () => runAutocolumnsDialog( editor ) );

			menuEl.style.left = clientX + 'px';
			menuEl.style.top = clientY + 'px';
			doc.body.appendChild( menuEl );

			const rect = menuEl.getBoundingClientRect();
			if ( clientX + rect.width > doc.documentElement.clientWidth ) {
				menuEl.style.left = Math.max( 0, doc.documentElement.clientWidth - rect.width - 4 ) + 'px';
			}
			if ( clientY + rect.height > doc.documentElement.clientHeight ) {
				menuEl.style.top = Math.max( 0, doc.documentElement.clientHeight - rect.height - 4 ) + 'px';
			}

			const onDocClick = event => {
				if ( menuEl && !menuEl.contains( event.target ) ) {
					hideMenu();
				}
			};
			const onKeyDown = event => {
				if ( event.key === 'Escape' ) {
					hideMenu();
				}
			};

			doc.addEventListener( 'click', onDocClick, true );
			doc.addEventListener( 'keydown', onKeyDown, true );
			dismissCleanup = () => {
				doc.removeEventListener( 'click', onDocClick, true );
				doc.removeEventListener( 'keydown', onKeyDown, true );
			};
		};

		const onContextMenu = domEvent => {
			const editable = getEditableElement( editor );
			if ( !editable || !editable.contains( domEvent.target ) ) {
				return;
			}
			if ( editor.isReadOnly ) {
				return;
			}

			savedSelectionRanges = saveModelSelection( editor );
			savedPageLink = getXertePageLink( editor, domEvent.target );
			try {
				savedSelectionText = editor.model.document.selection.getSelectedText() || '';
			} catch ( e ) {
				savedSelectionText = '';
			}

			domEvent.preventDefault();

			const x = domEvent.clientX;
			const y = domEvent.clientY;
			const ownerDoc = domEvent.currentTarget.ownerDocument;

			window.setTimeout( () => {
				try {
					showMenu( x, y, ownerDoc );
				} catch ( error ) {
					console.error( '[XerteContextMenu]', error );
				}
			}, 0 );
		};

		const bind = () => {
			const editable = getEditableElement( editor );
			if ( !editable || boundEditables.has( editable ) ) {
				return;
			}
			boundEditables.add( editable );
			editable.addEventListener( 'contextmenu', onContextMenu, false );
		};

		const unbind = () => {
			const editable = getEditableElement( editor );
			if ( editable ) {
				editable.removeEventListener( 'contextmenu', onContextMenu, false );
				boundEditables.delete( editable );
			}
		};

		editor.ui.once( 'ready', bind );
		editor.once( 'ready', bind );

		editor.on( 'destroy', () => {
			hideMenu();
			unbind();
			savedSelectionRanges = null;
			savedSelectionText = null;
			savedPageLink = null;
		} );
	}
}

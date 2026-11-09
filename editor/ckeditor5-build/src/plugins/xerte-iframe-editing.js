/**
 * Experimental editable-only iframe. The editor, toolbar and plugins stay in the
 * wizard window; only the editable HTML lives in the child document. This keeps
 * theme CSS away from wizard controls, and wizard CSS away from authored content.
 * There is still one editor/model: saving, undo and custom plugins use the same
 * instance as before. The frame is not another editor or a rendered preview.
 *
 * Maintenance: the UI-init wrapper and the resize/badge/fullscreen bridges below
 * depend on CKEditor 47 behavior. Recheck them when upgrading CKEditor.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { DomEmitterMixin } from 'ckeditor5/src/utils.js';
import '../xerte-iframe-editing.css';

export class XerteIframeEditing extends Plugin {
	static get pluginName() { return 'XerteIframeEditing'; }

	init() {
		if ( !this.editor.config.get( 'xerteIframeEditing' ) ) return;
		const ui = this.editor.ui;
		ui.view.extendTemplate( { attributes: { class: 'xerte-iframe-editor' } } );
		const init = ui.init.bind( ui );
		// ClassicEditor.create() awaits UI initialization before loading initial data.
		// Keep that ordering so no wizard callback sees a half-attached editing root.
		ui.init = async ( ...args ) => {
			init( ...args );
			try {
				await this._mount();
			} catch ( error ) {
				this._restoreEditable();
				// CKEditor's destroy() waits for ready while state is initializing.
				// Initialization has failed, so release that wait without publishing
				// a misleading ready event or running wizard callbacks.
				// This state change is a cleanup workaround, not a successful startup.
				this.editor.state = 'ready';
				await this.editor.destroy();
				throw error;
			}
		};
	}

	async _mount() {
		const editor = this.editor;
		const isSite = editor.config.get( 'xerteIframeFramework' ) === 'site';
		const editable = editor.ui.getEditableElement();
		const parentDocument = editable.ownerDocument;
		this.editable = editable;
		// Remember the editable's original slot so cleanup can return the same node.
		this.placeholder = parentDocument.createComment( 'Xerte iframe editable' );
		editable.before( this.placeholder );
		const frame = this.frame = parentDocument.createElement( 'iframe' );
		frame.className = 'xerte-cke5-content-frame';
		frame.title = editable.getAttribute( 'aria-label' ) || editor.t( 'Rich Text Editor' );
		frame.style.cssText = 'display:block;width:100%;height:250px;min-width:0;box-sizing:border-box;';
		const loaded = new Promise( ( resolve, reject ) => {
			const timeout = setTimeout( () => reject( new Error( 'CKEditor content frame did not load.' ) ), 10000 );
			frame.addEventListener( 'load', () => { clearTimeout( timeout ); resolve(); }, { once: true } );
			this._cancelFrameLoad = () => clearTimeout( timeout );
		} );
		// Same-origin srcdoc lets the existing editor access the child DOM directly.
		// Keep each player's content ancestors for theme selectors: Nottingham uses
		// #x_pageHolder, Site uses #mainContent/section inside its Bootstrap grid.
		// No scripts or authored HTML are interpolated into these fixed skeletons.
		const content = isSite ?
			'<div id="aboveFooter"><div class="container"><div class="row-fluid"><div class="span9" id="mainContent" role="main"><section data-xerte-content-root></section></div></div></div></div>' :
			'<div id="x_mainHolder"><div id="x_pageHolder"><div id="x_pageDiv" data-xerte-content-root></div></div></div>';
		frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + content + '</body></html>';
		editable.before( frame );
		// Changing wizard fields can remove this editor while the frame/CSS loads.
		// Stop initialization in that case instead of returning an orphan editor.
		const removed = new Promise( ( resolve, reject ) => {
			this._initializationObserver = new MutationObserver( () => {
				if ( !frame.isConnected ) reject( new Error( 'CKEditor content frame was removed during initialization.' ) );
			} );
			this._initializationObserver.observe( parentDocument, { childList: true, subtree: true } );
		} );
		await Promise.race( [ loaded, removed ] );
		if ( !frame.isConnected ) throw new Error( 'CKEditor content frame was removed during initialization.' );
		const doc = frame.contentDocument;
		const base = doc.createElement( 'base' );
		// Authored relative image/link URLs must resolve from the wizard's location.
		base.href = parentDocument.baseURI;
		doc.head.prepend( base );
		doc.documentElement.lang = editor.locale.contentLanguage;
		doc.documentElement.dir = editor.locale.contentLanguageDirection;
		// Copy CKEditor's existing bundle styles, never the wizard's broad CSS.
		for ( const style of parentDocument.querySelectorAll( 'style[data-cke]' ) ) {
			doc.head.appendChild( style.cloneNode( true ) );
		}
		this.themeAnchor = doc.createElement( 'style' );
		// Load theme links BEFORE these final layout corrections. Keep theme fonts,
		// colours and backgrounds, but remove the player's fixed page dimensions.
		// Otherwise the fake player wrappers can clip or offset the editing surface.
		// The frame owns the border; the editable fills it and lets the theme show
		// through. Keep ck-hidden working so source mode hides the rich text view.
		// Inherit text size/line spacing too: CKEditor's own 16px/1.5 defaults would
		// otherwise override Site's Bootstrap 14px/20px (and custom theme defaults).
		this.themeAnchor.textContent = `
			html, body { margin:0; min-height:100%; }
			body { padding:0; }
			#x_mainHolder, #x_pageHolder, #x_pageDiv {
				position:static!important; display:block!important; float:none!important;
				width:auto!important; height:auto!important; min-width:0!important; min-height:0!important;
				max-width:none!important; max-height:none!important; margin:0!important;
				padding:0!important; border:0!important; overflow:visible!important; transform:none!important;
			}
			.ck.ck-editor__editable.xerte-iframe-editable {
				min-height:100vh!important; height:auto!important; box-sizing:border-box;
				border:0!important; box-shadow:none!important; outline:none!important;
				background:transparent!important; padding:8px;
				font-family:inherit; font-size:inherit; line-height:inherit; color:inherit;
			}
			.ck.ck-editor__editable.xerte-iframe-editable.ck-hidden { display:none!important; }
			.ck-source-editing-area { min-height:100vh; }
			.ck-source-editing-area textarea { min-height:100vh; }
		`;
		if ( isSite ) {
			// Site's grid reserves space for navigation; its body uses a sticky-footer
			// flex layout. Here the editable fills the field, with neither of those.
			// sectionpages hides sections until player JS reveals them: keep only our
			// host section visible, without overriding sections inside authored HTML.
			this.themeAnchor.textContent += `
				html, body { height:auto!important; }
				body { display:block!important; }
				#aboveFooter, #aboveFooter > .container, #aboveFooter > .container > .row-fluid,
				#mainContent, #mainContent > section[data-xerte-content-root] {
					position:static!important; display:block!important; float:none!important;
					width:auto!important; height:auto!important; min-width:0!important; min-height:0!important;
					max-width:none!important; max-height:none!important; margin:0!important;
					padding:0!important; border:0!important; overflow:visible!important; transform:none!important;
				}
			`;
		}
		doc.head.appendChild( this.themeAnchor );
		await Promise.race( [ this.setStylesheets( editor.config.get( 'xerteIframeStylesheets' ) || [] ), removed ] );
		if ( !frame.isConnected ) throw new Error( 'CKEditor content frame was removed during initialization.' );
		this._initializationObserver.disconnect();

		const view = editor.editing.view;
		// Tell CKEditor's engine to release and then observe the same editable in
		// its new document. Moving the node alone leaves old document observers.
		// Do this once at startup; themes/fullscreen never recreate the editor.
		view.detachDomRoot( 'main' );
		doc.querySelector( '[data-xerte-content-root]' ).appendChild( editable );
		view.attachDomRoot( editable );
		// Add persistent editable classes through the view writer. Direct DOM
		// class changes can be overwritten by CKEditor's next render.
		view.change( writer => writer.addClass( 'xerte-iframe-editable', view.document.getRoot() ) );
		view.forceRender();
		// FocusTracker's blur guard checks the wizard's document.activeElement.
		// While editing in the child document that element is the iframe, not
		// the editable, so include both in the same editor focus area.
		editor.ui.focusTracker.add( frame );
		// Native scroll/mouse events need a DOM emitter. Plugin.listenTo() alone
		// listens for CKEditor events and does not wire these browser events up.
		this._domEmitter = new ( DomEmitterMixin() )();
		this._bridgeBalloons();
		this._bridgeBadges();
		this._bridgeWidgetResize();
		this._bridgeFullscreen();
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, focused ) => {
			frame.classList.toggle( 'ck-focused', focused );
		} );
		// Child scrolling does not bubble into the wizard. Reposition parent-side
		// floating toolbars when the content scrolls or the frame changes size.
		this._domEmitter.listenTo( doc, 'scroll', () => editor.ui.update(), { useCapture: true } );
		this._domEmitter.listenTo( frame.contentWindow, 'resize', () => editor.ui.update() );
	}

	setStylesheets( urls ) {
		if ( !this.frame?.contentDocument || !this.themeAnchor ) return;
		const doc = this.frame.contentDocument;
		// Use the original CSS URLs, including their normal @imports and asset
		// paths. Imported/custom themes need no generated CKEditor-specific copy.
		// Retain the old links until the replacements finish loading to reduce flicker.
		const links = Array.from( doc.querySelectorAll( 'link[data-xerte-content-style]' ) );
		const loading = urls.map( url => {
			const link = doc.createElement( 'link' );
			link.rel = 'stylesheet';
			link.href = url;
			link.dataset.xerteContentStyle = 'true';
			const loaded = new Promise( resolve => {
				const timeout = setTimeout( () => finish( false ), 10000 );
				const finish = success => {
					clearTimeout( timeout );
					link.onload = link.onerror = null;
					if ( !success ) console.warn( '[XerteIframeEditing] Unable to load content stylesheet:', url );
					resolve( success );
				};
				link.onload = () => finish( true );
				link.onerror = () => finish( false );
			} );
			this.themeAnchor.before( link );
			return loaded;
		} );
		return this.stylesReady = Promise.all( loading ).then( result => {
			for ( const link of links ) link.remove();
			return result;
		} );
	}

	setHeight( height ) {
		// Size the window onto the content, not the document inside it. Long content
		// scrolls within the frame; fullscreen temporarily overrides this height.
		if ( this.frame ) this.frame.style.height = `${ parseInt( height, 10 ) || 250 }px`;
	}

	/**
	 * The child reports positions from its own top-left corner. Parent-side popups
	 * need the frame's position added; targets already in the wizard stay unchanged.
	 * This also accepts a DOM Range, which is how a text selection is positioned.
	 */
	toParentRect( target ) {
		if ( typeof target === 'function' ) target = target();
		const doc = target?.ownerDocument || target?.startContainer?.ownerDocument;
		if ( doc !== this.frame.contentDocument ) return target;
		const rect = target.getBoundingClientRect();
		const frameRect = this.frame.getBoundingClientRect();
		return {
			top: rect.top + frameRect.top, bottom: rect.bottom + frameRect.top,
			left: rect.left + frameRect.left, right: rect.right + frameRect.left,
			width: rect.width, height: rect.height
		};
	}

	_bridgeBalloons() {
		const editor = this.editor;
		if ( !editor.plugins.has( 'ContextualBalloon' ) ) return;
		const balloon = editor.plugins.get( 'ContextualBalloon' );
		// Adjust the final options after image/table/link plugins choose their target.
		// Use the visible frame as the boundary for placing the floating toolbar.
		this.listenTo( balloon, 'getPositionOptions', evt => {
			if ( !evt.return ) return;
			const options = evt.return;
			evt.return = {
				...options,
				target: () => this.toParentRect( options.target ),
				limiter: this.frame
			};
		}, { priority: 'lowest' } );
	}

	_bridgeWidgetResize() {
		if ( !this.editor.plugins.has( 'WidgetResize' ) ) return;
		const resize = this.editor.plugins.get( 'WidgetResize' );
		const childDocument = this.frame.contentDocument;
		const parentDocument = this.frame.ownerDocument;
		// CKEditor 47 listens for resize drags on the global document. Add the
		// editable document and translate the pointer when it leaves the frame.
		// These underscored members are private CKEditor APIs: review on upgrades.
		// Keep its existing parent mouseup listener so releasing outside still ends
		// a drag; child mouseup needs its own listener because events do not cross.
		resize._observer.stopListening( parentDocument, 'mousemove' );
		this._domEmitter.listenTo( childDocument, 'mousemove', ( evt, event ) => resize._mouseMoveListener( evt, event ) );
		this._domEmitter.listenTo( childDocument, 'mouseup', () => resize._mouseUpListener() );
		this._domEmitter.listenTo( parentDocument, 'mousemove', ( evt, event ) => {
			const rect = this.frame.getBoundingClientRect();
			// The resizer expects child-document page coordinates, including scroll.
			resize._mouseMoveListener( evt, {
				pageX: event.clientX - rect.left + this.frame.contentWindow.scrollX,
				pageY: event.clientY - rect.top + this.frame.contentWindow.scrollY
			} );
		} );
	}

	_bridgeBadges() {
		// Keep CKEditor's attribution/evaluation badges at the visible frame edge,
		// rather than using a rectangle relative to the child document's viewport.
		// Private CKEditor API: temporarily give its position helper the frame, then
		// restore the actual editable. This changes placement, not badge visibility.
		for ( const badge of [ this.editor.ui.poweredBy, this.editor.ui.evaluationBadge ] ) {
			if ( !badge?._getBalloonAttachOptions ) continue;
			const getOptions = badge._getBalloonAttachOptions.bind( badge );
			badge._getBalloonAttachOptions = () => {
				const editable = badge._lastFocusedEditableElement;
				if ( editable?.ownerDocument !== this.frame.contentDocument ) return getOptions();
				badge._lastFocusedEditableElement = this.frame;
				try { return getOptions(); }
				finally { badge._lastFocusedEditableElement = editable; }
			};
		}
	}

	_bridgeFullscreen() {
		const command = this.editor.commands.get( 'toggleFullscreen' );
		if ( !command ) return;
		// Native fullscreen moves editor DOM into a fullscreen container. Moving a
		// live iframe (or its ancestor) reloads its document and loses the editable.
		// Replace that handler with CSS classes which expand the editor in place.
		const root = this.editor.ui.view.element;
		const originalHandler = command.fullscreenHandler;
		const doc = root.ownerDocument;
		const stickyPanel = this.editor.ui.view.stickyPanel;
		if ( stickyPanel ) {
			// The native binding reactivates stickiness on refocus. Its geometry
			// still includes the wizard's scroll ancestors, even though this root
			// is now fixed to the viewport, which can place the toolbar below text.
			stickyPanel.unbind( 'isActive' );
			stickyPanel.bind( 'isActive' ).to(
				this.editor.ui.focusTracker, 'isFocused', command, 'value',
				( focused, fullscreen ) => focused && !fullscreen &&
					!this.editor.ui.view.toolbar.element.classList.contains( 'xerte-fixed-toolbar' )
			);
		}
		const disable = () => {
			root.classList.remove( 'xerte-iframe-fullscreen' );
			// Only restore wizard scrolling/controls once no editor is fullscreen.
			if ( !doc.querySelector( '.xerte-iframe-fullscreen' ) ) {
				doc.documentElement.classList.remove( 'xerte-iframe-fullscreen-open' );
				doc.body.classList.remove( 'xerte-iframe-fullscreen-open' );
			}
		};
		command.fullscreenHandler = {
			enable: () => {
				root.classList.add( 'xerte-iframe-fullscreen' );
				doc.documentElement.classList.add( 'xerte-iframe-fullscreen-open' );
				doc.body.classList.add( 'xerte-iframe-fullscreen-open' );
			},
			disable,
			destroy: () => { disable(); originalHandler.destroy(); }
		};
		this.listenTo( command, 'change:value', () => {
			stickyPanel?.checkIfShouldBeSticky();
			this.editor.ui.update();
		} );
		this._disableFullscreen = disable;
	}

	_restoreEditable() {
		if ( this.frame ) this.editor.ui.focusTracker.remove( this.frame );
		this._domEmitter?.stopListening();
		this._initializationObserver?.disconnect();
		this._cancelFrameLoad?.();
		this._disableFullscreen?.();
		// Return the same node to its original container, even if that container
		// was already detached during teardown. The iframe must not own it when
		// removed. No second editor or model/data conversion is introduced.
		if ( this.placeholder?.parentNode && this.editable ) {
			this.placeholder.replaceWith( this.editable );
		}
		this.frame?.remove();
	}

	destroy() {
		this._restoreEditable();
		super.destroy();
	}
}

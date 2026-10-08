/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { toUnit, global, Rect, findClosestScrollableAncestor } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { IframeView, View } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { ViewDomConverter, ViewRenderer } from '@ckeditor/ckeditor5-engine/dist/index.js';

const toPx$1 = /* #__PURE__ */ toUnit('px');
/**
 * The internal `<iframe>` view that hosts the minimap content.
 *
 * @internal
 */ class MinimapIframeView extends IframeView {
    /**
	 * Cached view constructor options for re-use in other methods.
	 */ _options;
    /**
	 * Creates an instance of the internal minimap iframe.
	 */ constructor(locale, options){
        super(locale);
        const bind = this.bindTemplate;
        this.set('top', 0);
        this.set('height', 0);
        this._options = options;
        this.extendTemplate({
            attributes: {
                tabindex: -1,
                'aria-hidden': 'true',
                class: [
                    'ck-minimap__iframe'
                ],
                style: {
                    top: bind.to('top', (top)=>toPx$1(top)),
                    height: bind.to('height', (height)=>toPx$1(height))
                }
            }
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        return super.render().then(()=>{
            this._prepareDocument();
        });
    }
    /**
	 * Sets the new height of the iframe.
	 */ setHeight(newHeight) {
        this.height = newHeight;
    }
    /**
	 * Sets the top offset of the iframe to move it around vertically.
	 */ setTopOffset(newOffset) {
        this.top = newOffset;
    }
    /**
	 * Sets the internal structure of the `<iframe>` readying it to display the
	 * minimap element.
	 */ _prepareDocument() {
        const iframeDocument = this.element.contentWindow.document;
        const domRootClone = iframeDocument.adoptNode(this._options.domRootClone);
        const boxStyles = this._options.useSimplePreview ? `
			.ck.ck-editor__editable_inline img {
				filter: contrast( 0 );
			}

			p, li, a, figcaption, span {
				background: hsl(0, 0%, 80%) !important;
				color: hsl(0, 0%, 80%) !important;
			}

			h1, h2, h3, h4 {
				background: hsl(0, 0%, 60%) !important;
				color: hsl(0, 0%, 60%) !important;
			}
		` : '';
        const pageStyles = this._options.pageStyles.map((definition)=>{
            if (typeof definition === 'string') {
                return `<style>${definition}</style>`;
            } else {
                return `<link rel="stylesheet" type="text/css" href="${definition.href}">`;
            }
        }).join('\n');
        const html = `<!DOCTYPE html><html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				${pageStyles}
				<style>
					html, body {
						margin: 0 !important;
						padding: 0 !important;
					}

					html {
						overflow: hidden;
					}

					body {
						transform: scale( ${this._options.scaleRatio} );
						transform-origin: 0 0;
						overflow: visible;
					}

					.ck.ck-editor__editable_inline {
						margin: 0 !important;
						border-color: transparent !important;
						outline-color: transparent !important;
						box-shadow: none !important;
					}

					.ck.ck-content {
						background: white;
					}

					${boxStyles}
				</style>
			</head>
			<body class="${this._options.extraClasses || ''}"></body>
		</html>`;
        iframeDocument.open();
        iframeDocument.write(html);
        iframeDocument.close();
        iframeDocument.body.appendChild(domRootClone);
    }
}

const toPx = /* #__PURE__ */ toUnit('px');
/**
 * The position tracker visualizing the visible subset of the content. Displayed over the minimap.
 *
 * @internal
 */ class MinimapPositionTrackerView extends View {
    constructor(locale){
        super(locale);
        const bind = this.bindTemplate;
        this.set('height', 0);
        this.set('top', 0);
        this.set('scrollProgress', 0);
        this.set('_isDragging', false);
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-minimap__position-tracker',
                    bind.if('_isDragging', 'ck-minimap__position-tracker_dragging')
                ],
                style: {
                    top: bind.to('top', (top)=>toPx(top)),
                    height: bind.to('height', (height)=>toPx(height))
                },
                'data-progress': bind.to('scrollProgress')
            },
            on: {
                mousedown: bind.to(()=>{
                    this._isDragging = true;
                })
            }
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this.listenTo(global.document, 'mousemove', (evt, data)=>{
            if (!this._isDragging) {
                return;
            }
            this.fire('drag', data.movementY);
        }, {
            useCapture: true
        });
        this.listenTo(global.document, 'mouseup', ()=>{
            this._isDragging = false;
        }, {
            useCapture: true
        });
    }
    /**
	 * Sets the new height of the tracker to visualize the subset of the content visible to the user.
	 */ setHeight(newHeight) {
        this.height = newHeight;
    }
    /**
	 * Sets the top offset of the tracker to move it around vertically.
	 */ setTopOffset(newOffset) {
        this.top = newOffset;
    }
    /**
	 * Sets the scroll progress (in %) to inform the user using a label when the tracker is being dragged.
	 */ setScrollProgress(newProgress) {
        this.scrollProgress = newProgress;
    }
}

/**
 * The main view of the minimap. It renders the original content but scaled down with a tracker element
 * visualizing the subset of the content visible to the user and allowing interactions (scrolling, dragging).
 *
 * @internal
 */ class MinimapView extends View {
    /**
	 * An instance of the tracker view displayed over the minimap.
	 */ _positionTrackerView;
    /**
	 * The scale ratio of the minimap relative to the original editing DOM root with the content.
	 */ _scaleRatio;
    /**
	 * An instance of the iframe view that hosts the minimap.
	 */ _minimapIframeView;
    /**
	 * Creates an instance of the minimap view.
	 */ constructor({ locale, scaleRatio, pageStyles, extraClasses, useSimplePreview, domRootClone }){
        super(locale);
        const bind = this.bindTemplate;
        this._positionTrackerView = new MinimapPositionTrackerView(locale);
        this._positionTrackerView.delegate('drag').to(this);
        this._scaleRatio = scaleRatio;
        this._minimapIframeView = new MinimapIframeView(locale, {
            useSimplePreview,
            pageStyles,
            extraClasses,
            scaleRatio,
            domRootClone
        });
        this.setTemplate({
            tag: 'div',
            attributes: {
                class: [
                    'ck',
                    'ck-minimap'
                ]
            },
            children: [
                this._positionTrackerView
            ],
            on: {
                click: bind.to(this._handleMinimapClick.bind(this)),
                wheel: bind.to(this._handleMinimapMouseWheel.bind(this))
            }
        });
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        this._minimapIframeView.destroy();
        super.destroy();
    }
    /**
	 * Returns the DOM {@link module:utils/dom/rect~Rect} height of the minimap.
	 */ get height() {
        return new Rect(this.element).height;
    }
    /**
	 * Returns the number of available space (pixels) the position tracker (visible subset of the content) can use to scroll vertically.
	 */ get scrollHeight() {
        return Math.max(0, Math.min(this.height, this._minimapIframeView.height) - this._positionTrackerView.height);
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this._minimapIframeView.render();
        this.element.appendChild(this._minimapIframeView.element);
    }
    /**
	 * Sets the new height of the minimap (in px) to respond to the changes in the original editing DOM root.
	 *
	 * **Note**:The provided value should be the `offsetHeight` of the original editing DOM root.
	 */ setContentHeight(newHeight) {
        this._minimapIframeView.setHeight(newHeight * this._scaleRatio);
    }
    /**
	 * Sets the minimap scroll progress.
	 *
	 * The minimap scroll progress is linked to the original editing DOM root and its scrollable container (ancestor).
	 * Changing the progress will alter the vertical position of the minimap (and its position tracker) and give the user an accurate
	 * overview of the visible document.
	 *
	 * **Note**: The value should be between 0 and 1. 0 when the DOM root has not been scrolled, 1 when the
	 * scrolling has reached the end.
	 */ setScrollProgress(newScrollProgress) {
        const iframeView = this._minimapIframeView;
        const positionTrackerView = this._positionTrackerView;
        // The scrolling should end when the bottom edge of the iframe touches the bottom edge of the minimap.
        if (iframeView.height < this.height) {
            iframeView.setTopOffset(0);
            positionTrackerView.setTopOffset((iframeView.height - positionTrackerView.height) * newScrollProgress);
        } else {
            const totalOffset = iframeView.height - this.height;
            iframeView.setTopOffset(-totalOffset * newScrollProgress);
            positionTrackerView.setTopOffset((this.height - positionTrackerView.height) * newScrollProgress);
        }
        positionTrackerView.setScrollProgress(Math.round(newScrollProgress * 100));
    }
    /**
	 * Sets the new height of the tracker (in px) to visualize the subset of the content visible to the user.
	 */ setPositionTrackerHeight(trackerHeight) {
        this._positionTrackerView.setHeight(trackerHeight * this._scaleRatio);
    }
    /**
	 * @param data DOM event data
	 */ _handleMinimapClick(data) {
        const positionTrackerView = this._positionTrackerView;
        if (data.target === positionTrackerView.element) {
            return;
        }
        const trackerViewRect = new Rect(positionTrackerView.element);
        const diff = data.clientY - trackerViewRect.top - trackerViewRect.height / 2;
        const percentage = diff / this._minimapIframeView.height;
        this.fire('click', percentage);
    }
    /**
	 * @param data DOM event data
	 */ _handleMinimapMouseWheel(data) {
        this.fire('drag', data.deltaY * this._scaleRatio);
    }
}

/**
 * Clones the editing view DOM root by using a dedicated pair of {@link module:engine/view/renderer~ViewRenderer} and
 * {@link module:engine/view/domconverter~ViewDomConverter}. The DOM root clone updates incrementally to stay in sync with the
 * source root.
 *
 * @internal
 * @param editor The editor instance the original editing root belongs to.
 * @param rootName The name of the root to clone.
 * @returns The editing root DOM clone element.
 */ function cloneEditingViewDomRoot(editor, rootName) {
    const viewDocument = editor.editing.view.document;
    const viewRoot = viewDocument.getRoot(rootName);
    const domConverter = new ViewDomConverter(viewDocument);
    const renderer = new ViewRenderer(domConverter, viewDocument.selection);
    const domRootClone = editor.editing.view.getDomRoot().cloneNode();
    domConverter.bindElements(domRootClone, viewRoot);
    renderer.markToSync('children', viewRoot);
    renderer.markToSync('attributes', viewRoot);
    viewRoot.on('change:children', (evt, node)=>renderer.markToSync('children', node));
    viewRoot.on('change:attributes', (evt, node)=>renderer.markToSync('attributes', node));
    viewRoot.on('change:text', (evt, node)=>renderer.markToSync('text', node));
    renderer.render();
    editor.editing.view.on('render', ()=>renderer.render());
    // TODO: Cleanup after destruction.
    editor.on('destroy', ()=>{
        domConverter.unbindDomElement(domRootClone);
    });
    return domRootClone;
}
/**
 * Harvests all web page styles, for instance, to allow re-using them in an `<iframe>` preserving the look of the content.
 *
 * The returned data format is as follows:
 *
 * ```ts
 * [
 * 	'p { color: red; ... } h2 { font-size: 2em; ... } ...',
 * 	'.spacing { padding: 1em; ... }; ...',
 * 	'...',
 * 	{ href: 'http://link.to.external.stylesheet' },
 * 	{ href: '...' }
 * ]
 * ```
 *
 * **Note**: For stylesheets with `href` different than window origin, an object is returned because
 * accessing rules of these styles may cause CORS errors (depending on the configuration of the web page).
 *
 * @internal
 */ function getPageStyles() {
    return Array.from(global.document.styleSheets).map((styleSheet)=>{
        // CORS
        if (styleSheet.href && !styleSheet.href.startsWith(global.window.location.origin)) {
            return {
                href: styleSheet.href
            };
        }
        return Array.from(styleSheet.cssRules).filter((rule)=>!(rule instanceof CSSMediaRule)).map((rule)=>rule.cssText).join(' \n');
    });
}
/**
 * Gets dimensions rectangle according to passed DOM element. Returns whole window's size for `body` element.
 *
 * @internal
 */ function getDomElementRect(domElement) {
    return new Rect(domElement === global.document.body ? global.window : domElement);
}
/**
 * Gets client height according to passed DOM element. Returns window's height for `body` element.
 *
 * @internal
 */ function getClientHeight(domElement) {
    return domElement === global.document.body ? global.window.innerHeight : domElement.clientHeight;
}
/**
 * Returns the DOM element itself if it's not a `body` element, whole window otherwise.
 *
 * @internal
 */ function getScrollable(domElement) {
    return domElement === global.document.body ? global.window : domElement;
}

/**
 * The content minimap feature.
 */ class Minimap extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Minimap';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * The reference to the view of the minimap.
	 */ _minimapView;
    /**
	 * The DOM element closest to the editable element of the editor as returned
	 * by {@link module:ui/editorui/editorui~EditorUI#getEditableElement}.
	 */ _scrollableRootAncestor;
    /**
	 * The DOM element closest to the editable element of the editor as returned
	 * by {@link module:ui/editorui/editorui~EditorUI#getEditableElement}.
	 */ _editingRootElement;
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        this._minimapView = null;
        this._scrollableRootAncestor = null;
        this.listenTo(editor.ui, 'ready', this._onUiReady.bind(this));
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this._minimapView.destroy();
        this._minimapView.element.remove();
    }
    /**
	 * Initializes the minimap view element and starts the layout synchronization
	 * on the editing view `render` event.
	 */ _onUiReady() {
        const editor = this.editor;
        // TODO: This will not work with the multi-root editor.
        const editingRootElement = this._editingRootElement = editor.ui.getEditableElement();
        this._scrollableRootAncestor = findClosestScrollableAncestor(editingRootElement);
        // DOM root element is not yet attached to the document.
        if (!editingRootElement.ownerDocument.body.contains(editingRootElement)) {
            editor.ui.once('update', this._onUiReady.bind(this));
            return;
        }
        this._initializeMinimapView();
        this.listenTo(editor.editing.view, 'render', ()=>{
            if (editor.state !== 'ready') {
                return;
            }
            this._syncMinimapToEditingRootScrollPosition();
        });
        this._syncMinimapToEditingRootScrollPosition();
    }
    /**
	 * Initializes the minimap view and attaches listeners that make it responsive to the environment (document)
	 * but also allow the minimap to control the document (scroll position).
	 */ _initializeMinimapView() {
        const editor = this.editor;
        const locale = editor.locale;
        const useSimplePreview = editor.config.get('minimap.useSimplePreview');
        // TODO: Throw an error if there is no `minimap` in config.
        const minimapContainerElement = editor.config.get('minimap.container');
        const scrollableRootAncestor = this._scrollableRootAncestor;
        // TODO: This should be dynamic, the root width could change as the viewport scales if not fixed unit.
        const editingRootElementWidth = getDomElementRect(this._editingRootElement).width;
        const minimapContainerWidth = getDomElementRect(minimapContainerElement).width;
        const minimapScaleRatio = minimapContainerWidth / editingRootElementWidth;
        const minimapView = this._minimapView = new MinimapView({
            locale,
            scaleRatio: minimapScaleRatio,
            pageStyles: getPageStyles(),
            extraClasses: editor.config.get('minimap.extraClasses'),
            useSimplePreview,
            domRootClone: cloneEditingViewDomRoot(editor)
        });
        minimapView.render();
        // Scrollable ancestor scroll -> minimap position update.
        minimapView.listenTo(global.document, 'scroll', (evt, data)=>{
            if (scrollableRootAncestor === global.document.body) {
                if (data.target !== global.document) {
                    return;
                }
            } else if (data.target !== scrollableRootAncestor) {
                return;
            }
            this._syncMinimapToEditingRootScrollPosition();
        }, {
            useCapture: true,
            usePassive: true
        });
        // Viewport resize -> minimap position update.
        minimapView.listenTo(global.window, 'resize', ()=>{
            this._syncMinimapToEditingRootScrollPosition();
        });
        // Dragging the visible content area -> document (scrollable) position update.
        minimapView.on('drag', (evt, movementY)=>{
            let movementYPercentage;
            if (minimapView.scrollHeight === 0) {
                movementYPercentage = 0;
            } else {
                movementYPercentage = movementY / minimapView.scrollHeight;
            }
            const absoluteScrollProgress = movementYPercentage * (scrollableRootAncestor.scrollHeight - getClientHeight(scrollableRootAncestor));
            const scrollable = getScrollable(scrollableRootAncestor);
            scrollable.scrollBy(0, Math.round(absoluteScrollProgress));
        });
        // Clicking the minimap -> center the document (scrollable) to the corresponding position.
        minimapView.on('click', (evt, percentage)=>{
            const absoluteScrollProgress = percentage * scrollableRootAncestor.scrollHeight;
            const scrollable = getScrollable(scrollableRootAncestor);
            scrollable.scrollBy(0, Math.round(absoluteScrollProgress));
        });
        minimapContainerElement.appendChild(minimapView.element);
    }
    /**
	 * @private
	 */ _syncMinimapToEditingRootScrollPosition() {
        const editingRootElement = this._editingRootElement;
        const minimapView = this._minimapView;
        minimapView.setContentHeight(editingRootElement.offsetHeight);
        const editingRootRect = getDomElementRect(editingRootElement);
        const scrollableRootAncestorRect = getDomElementRect(this._scrollableRootAncestor);
        let scrollProgress;
        // It's possible that at some point elements do not intersect, e.g. when entering the fullscreen mode.
        // Prevent the minimap from being updated in such case.
        if (!scrollableRootAncestorRect.getIntersection(editingRootRect)) {
            return;
        }
        // @if CK_DEBUG_MINIMAP // RectDrawer.clear();
        // @if CK_DEBUG_MINIMAP // RectDrawer.draw( scrollableRootAncestorRect, { outlineColor: 'red' }, 'scrollableRootAncestor' );
        // @if CK_DEBUG_MINIMAP // RectDrawer.draw( editingRootRect, { outlineColor: 'green' }, 'editingRoot' );
        // The root is completely visible in the scrollable ancestor.
        if (scrollableRootAncestorRect.contains(editingRootRect)) {
            scrollProgress = 0;
        } else {
            if (editingRootRect.top > scrollableRootAncestorRect.top) {
                scrollProgress = 0;
            } else {
                scrollProgress = (editingRootRect.top - scrollableRootAncestorRect.top) / (scrollableRootAncestorRect.height - editingRootRect.height);
                scrollProgress = Math.max(0, Math.min(scrollProgress, 1));
            }
        }
        // The intersection helps to change the tracker height when there is a lot of padding around the root.
        // Note: It is **essential** that the height is set first because the progress depends on the correct tracker height.
        minimapView.setPositionTrackerHeight(scrollableRootAncestorRect.getIntersection(editingRootRect).height);
        minimapView.setScrollProgress(scrollProgress);
    }
}

export { Minimap, MinimapIframeView as _MinimapIframeView, MinimapPositionTrackerView as _MinimapPositionTrackerView, MinimapView as _MinimapView, cloneEditingViewDomRoot as _cloneMinimapEditingViewDomRoot, getClientHeight as _getMinimapClientHeight, getDomElementRect as _getMinimapDomElementRect, getPageStyles as _getMinimapPageStyles, getScrollable as _getMinimapScrollable };
//# sourceMappingURL=index.js.map

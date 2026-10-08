/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { EditorUI, normalizeToolbarConfig, DialogView, BoxedEditorUIView, StickyPanelView, ToolbarView, MenuBarView, InlineEditableUIView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { enableViewPlaceholder } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { ElementReplacer, Rect, CKEditorError, getDataFromElement } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { ElementApiMixin, Editor, attachToForm } from '@ckeditor/ckeditor5-core/dist/index.js';
import { isElement as isElement$1 } from 'es-toolkit/compat';

/**
 * The classic editor UI class.
 */ class ClassicEditorUI extends EditorUI {
    /**
	 * The main (top–most) view of the editor UI.
	 */ view;
    /**
	 * A normalized `config.toolbar` object.
	 */ _toolbarConfig;
    /**
	 * The element replacer instance used to hide the editor's source element.
	 */ _elementReplacer;
    /**
	 * Creates an instance of the classic editor UI class.
	 *
	 * @param editor The editor instance.
	 * @param view The view of the UI.
	 */ constructor(editor, view){
        super(editor);
        this.view = view;
        this._toolbarConfig = normalizeToolbarConfig(editor.config.get('toolbar'));
        this._elementReplacer = new ElementReplacer();
        this.listenTo(editor.editing.view, 'scrollToTheSelection', this._handleScrollToTheSelectionWithStickyPanel.bind(this));
    }
    /**
	 * @inheritDoc
	 */ get element() {
        return this.view.element;
    }
    /**
	 * Initializes the UI.
	 *
	 * @param replacementElement The DOM element that will be the source for the created editor.
	 */ init(replacementElement) {
        const editor = this.editor;
        const view = this.view;
        const editingView = editor.editing.view;
        const editable = view.editable;
        const editingRoot = editingView.document.getRoot();
        // The editable UI and editing root should share the same name. Then name is used
        // to recognize the particular editable, for instance in ARIA attributes.
        editable.name = editingRoot.rootName;
        view.render();
        // The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
        // But it can be available earlier if a DOM element has been passed to BalloonEditor.create().
        const editableElement = editable.element;
        // Register the editable UI view in the editor. A single editor instance can aggregate multiple
        // editable areas (roots) but the classic editor has only one.
        this.setEditableElement(editable.name, editableElement);
        // Let the editable UI element respond to the changes in the global editor focus
        // tracker. It has been added to the same tracker a few lines above but, in reality, there are
        // many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
        // as they have focus, the editable should act like it is focused too (although technically
        // it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
        // Doing otherwise will result in editable focus styles disappearing, once e.g. the
        // toolbar gets focused.
        view.editable.bind('isFocused').to(this.focusTracker);
        // Bind the editable UI element to the editing view, making it an end– and entry–point
        // of the editor's engine. This is where the engine meets the UI.
        editingView.attachDomRoot(editableElement);
        // If an element containing the initial data of the editor was provided, replace it with
        // an editor instance's UI in DOM until the editor is destroyed. For instance, a <textarea>
        // can be such element.
        if (replacementElement) {
            this._elementReplacer.replace(replacementElement, this.element);
        }
        this._initPlaceholder();
        this._initToolbar();
        if (view.menuBarView) {
            this.initMenuBar(view.menuBarView);
        }
        this._initDialogPluginIntegration();
        this._initContextualBalloonIntegration();
        this.fire('ready');
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        const view = this.view;
        const editingView = this.editor.editing.view;
        this._elementReplacer.restore();
        if (editingView.getDomRoot(view.editable.name)) {
            editingView.detachDomRoot(view.editable.name);
        }
        view.destroy();
    }
    /**
	 * Initializes the editor toolbar.
	 */ _initToolbar() {
        const view = this.view;
        // Set–up the sticky panel with toolbar.
        view.stickyPanel.bind('isActive').to(this.focusTracker, 'isFocused');
        view.stickyPanel.limiterElement = view.element;
        view.stickyPanel.bind('viewportTopOffset').to(this, 'viewportOffset', ({ visualTop })=>visualTop || 0);
        view.toolbar.fillFromConfig(this._toolbarConfig, this.componentFactory);
        // Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
        this.addToolbar(view.toolbar);
    }
    /**
	 * Enable the placeholder text on the editing root.
	 */ _initPlaceholder() {
        const editor = this.editor;
        const editingView = editor.editing.view;
        const editingRoot = editingView.document.getRoot();
        const sourceElement = editor.sourceElement;
        let placeholderText;
        const placeholder = editor.config.get('placeholder');
        if (placeholder) {
            placeholderText = typeof placeholder === 'string' ? placeholder : placeholder[this.view.editable.name];
        }
        if (!placeholderText && sourceElement && sourceElement.tagName.toLowerCase() === 'textarea') {
            placeholderText = sourceElement.getAttribute('placeholder');
        }
        if (placeholderText) {
            editingRoot.placeholder = placeholderText;
        }
        enableViewPlaceholder({
            view: editingView,
            element: editingRoot,
            isDirectHost: false,
            keepOnFocus: true
        });
    }
    /**
	 * Provides an integration between the sticky toolbar and {@link module:ui/panel/balloon/contextualballoon contextual balloon plugin}.
	 * It allows the contextual balloon to consider the height of the
	 * {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#stickyPanel}. It prevents the balloon from overlapping
	 * the sticky toolbar by adjusting the balloon's position using viewport offset configuration.
	 */ _initContextualBalloonIntegration() {
        if (!this.editor.plugins.has('ContextualBalloon')) {
            return;
        }
        const { stickyPanel } = this.view;
        const contextualBalloon = this.editor.plugins.get('ContextualBalloon');
        contextualBalloon.on('getPositionOptions', (evt)=>{
            const position = evt.return;
            if (!position || !stickyPanel.isSticky || !stickyPanel.element) {
                return;
            }
            // Measure toolbar (and menu bar) height.
            const stickyPanelHeight = new Rect(stickyPanel.element).height;
            // Handle edge case when the target element is larger than the limiter.
            // It's an issue because the contextual balloon can overlap top table cells when the table is larger than the viewport
            // and it's placed at the top of the editor. It's better to overlap toolbar in that situation.
            // Check this issue: https://github.com/ckeditor/ckeditor5/issues/15744
            const target = typeof position.target === 'function' ? position.target() : position.target;
            const limiter = typeof position.limiter === 'function' ? position.limiter() : position.limiter;
            if (target && limiter && new Rect(target).height >= new Rect(limiter).height - stickyPanelHeight) {
                return;
            }
            // Ensure that viewport offset is present, it can be undefined according to the typing.
            const viewportOffsetConfig = {
                ...position.viewportOffsetConfig
            };
            const newTopViewportOffset = (viewportOffsetConfig.top || 0) + stickyPanelHeight;
            evt.return = {
                ...position,
                viewportOffsetConfig: {
                    ...viewportOffsetConfig,
                    top: newTopViewportOffset
                }
            };
        }, {
            priority: 'low'
        });
        // Update balloon position when the toolbar becomes sticky or when ui viewportOffset changes.
        const updateBalloonPosition = ()=>{
            if (contextualBalloon.visibleView) {
                contextualBalloon.updatePosition();
            }
        };
        this.listenTo(stickyPanel, 'change:isSticky', updateBalloonPosition);
        this.listenTo(this.editor.ui, 'change:viewportOffset', updateBalloonPosition);
    }
    /**
	 * Provides an integration between the sticky toolbar and {@link module:utils/dom/scroll~scrollViewportToShowTarget}.
	 * It allows the UI-agnostic engine method to consider the geometry of the
	 * {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#stickyPanel} that pins to the
	 * edge of the viewport and can obscure the user caret after scrolling the window.
	 *
	 * @param evt The `scrollToTheSelection` event info.
	 * @param data The payload carried by the `scrollToTheSelection` event.
	 * @param originalArgs The original arguments passed to `scrollViewportToShowTarget()` method (see implementation to learn more).
	 */ _handleScrollToTheSelectionWithStickyPanel(evt, data, originalArgs) {
        const stickyPanel = this.view.stickyPanel;
        if (stickyPanel.isSticky) {
            const stickyPanelHeight = new Rect(stickyPanel.element).height;
            data.viewportOffset.top += stickyPanelHeight;
        } else {
            const scrollViewportOnPanelGettingSticky = ()=>{
                this.editor.editing.view.scrollToTheSelection(originalArgs);
            };
            this.listenTo(stickyPanel, 'change:isSticky', scrollViewportOnPanelGettingSticky);
            // This works as a post-scroll-fixer because it's impossible predict whether the panel will be sticky after scrolling or not.
            // Listen for a short period of time only and if the toolbar does not become sticky very soon, cancel the listener.
            setTimeout(()=>{
                this.stopListening(stickyPanel, 'change:isSticky', scrollViewportOnPanelGettingSticky);
            }, 20);
        }
    }
    /**
	 * Provides an integration between the sticky toolbar and {@link module:ui/dialog/dialog the Dialog plugin}.
	 *
	 * It moves the dialog down to ensure that the
	 * {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#stickyPanel sticky panel}
	 * used by the editor UI will not get obscured by the dialog when the dialog uses one of its automatic positions.
	 */ _initDialogPluginIntegration() {
        if (!this.editor.plugins.has('Dialog')) {
            return;
        }
        const stickyPanel = this.view.stickyPanel;
        const dialogPlugin = this.editor.plugins.get('Dialog');
        dialogPlugin.on('show', ()=>{
            const dialogView = dialogPlugin.view;
            dialogView.on('moveTo', (evt, data)=>{
                // Engage only when the panel is sticky, and the dialog is using one of default positions.
                // Ignore modals because they are displayed on top of the page (and overlay) and they do not collide with anything
                // See (https://github.com/ckeditor/ckeditor5/issues/17339).
                if (!stickyPanel.isSticky || dialogView.wasMoved || dialogView.isModal) {
                    return;
                }
                const stickyPanelContentRect = new Rect(stickyPanel.contentPanelElement);
                if (data[1] < stickyPanelContentRect.bottom + DialogView.defaultOffset) {
                    data[1] = stickyPanelContentRect.bottom + DialogView.defaultOffset;
                }
            }, {
                priority: 'high'
            });
        }, {
            priority: 'low'
        });
    }
}

/**
 * Classic editor UI view. Uses an inline editable and a sticky toolbar, all
 * enclosed in a boxed UI view.
 */ class ClassicEditorUIView extends BoxedEditorUIView {
    /**
	 * Sticky panel view instance. This is a parent view of a {@link #toolbar}
	 * that makes toolbar sticky.
	 */ stickyPanel;
    /**
	 * Toolbar view instance.
	 */ toolbar;
    /**
	 * Editable UI view.
	 */ editable;
    /**
	 * Creates an instance of the classic editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param options Configuration options for the view instance.
	 * @param options.shouldToolbarGroupWhenFull When set `true` enables automatic items grouping
	 * in the main {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 * @param options.label When set, this value will be used as an accessible `aria-label` of the
	 * {@link module:ui/editableui/editableuiview~EditableUIView editable view}.
	 */ constructor(locale, editingView, options = {}){
        super(locale);
        this.stickyPanel = new StickyPanelView(locale);
        this.toolbar = new ToolbarView(locale, {
            shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
        });
        if (options.useMenuBar) {
            this.menuBarView = new MenuBarView(locale);
        }
        this.editable = new InlineEditableUIView(locale, editingView, undefined, {
            label: options.label
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        if (this.menuBarView) {
            // Set toolbar as a child of a stickyPanel and makes toolbar sticky.
            this.stickyPanel.content.addMany([
                this.menuBarView,
                this.toolbar
            ]);
        } else {
            this.stickyPanel.content.add(this.toolbar);
        }
        this.top.add(this.stickyPanel);
        this.main.add(this.editable);
    }
}

/**
 * The classic editor implementation. It uses an inline editable and a sticky toolbar, all enclosed in a boxed UI.
 * See the {@glink examples/builds/classic-editor demo}.
 *
 * In order to create a classic editor instance, use the static
 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`} method.
 */ class ClassicEditor extends /* #__PURE__ */ ElementApiMixin(Editor) {
    /**
	 * @inheritDoc
	 */ static get editorName() {
        return 'ClassicEditor';
    }
    /**
	 * @inheritDoc
	 */ ui;
    /**
	 * Creates an instance of the classic editor.
	 *
	 * **Note:** do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`} method instead.
	 *
	 * @param sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data. For more information see
	 * {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}.
	 * @param config The editor configuration.
	 */ constructor(sourceElementOrData, config = {}){
        // If both `config.initialData` is set and initial data is passed as the constructor parameter, then throw.
        if (!isElement(sourceElementOrData) && config.initialData !== undefined) {
            // Documented in core/editor/editorconfig.jsdoc.
            // eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
            throw new CKEditorError('editor-create-initial-data', null);
        }
        super(config);
        this.config.define('menuBar.isVisible', false);
        if (this.config.get('initialData') === undefined) {
            this.config.set('initialData', getInitialData(sourceElementOrData));
        }
        if (isElement(sourceElementOrData)) {
            this.sourceElement = sourceElementOrData;
        }
        this.model.document.createRoot();
        const shouldToolbarGroupWhenFull = !this.config.get('toolbar.shouldNotGroupWhenFull');
        const menuBarConfig = this.config.get('menuBar');
        const view = new ClassicEditorUIView(this.locale, this.editing.view, {
            shouldToolbarGroupWhenFull,
            useMenuBar: menuBarConfig.isVisible,
            label: this.config.get('label')
        });
        this.ui = new ClassicEditorUI(this, view);
        attachToForm(this);
    }
    /**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
	 * configuration option is set to `true`.
	 */ destroy() {
        if (this.sourceElement) {
            this.updateSourceElement();
        }
        this.ui.destroy();
        return super.destroy();
    }
    /**
	 * Creates a new classic editor instance.
	 *
	 * There are three ways how the editor can be initialized.
	 *
	 * # Replacing a DOM element (and loading data from it)
	 *
	 * You can initialize the editor using an existing DOM element:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ) )
	 * 	.then( editor => {
	 * 		console.log( 'Editor was initialized', editor );
	 * 	} )
	 * 	.catch( err => {
	 * 		console.error( err.stack );
	 * 	} );
	 * ```
	 *
	 * The element's content will be used as the editor data and the element will be replaced by the editor UI.
	 *
	 * # Creating a detached editor
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as a string.
	 * In this case, the editor will render an element that must be inserted into the DOM:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( '<p>Hello world!</p>' )
	 * 	.then( editor => {
	 * 		console.log( 'Editor was initialized', editor );
	 *
	 * 		// Initial data was provided so the editor UI element needs to be added manually to the DOM.
	 * 		document.body.appendChild( editor.ui.element );
	 * 	} )
	 * 	.catch( err => {
	 * 		console.error( err.stack );
	 * 	} );
	 * ```
	 *
	 * This lets you dynamically append the editor to your web page whenever it is convenient for you. You may use this method if your
	 * web page content is generated on the client side and the DOM structure is not ready at the moment when you initialize the editor.
	 *
	 * # Replacing a DOM element (and data provided in `config.initialData`)
	 *
	 * You can also mix these two ways by providing a DOM element to be used and passing the initial data through the configuration:
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		initialData: '<h2>Initial data</h2><p>Foo bar.</p>'
	 * 	} )
	 * 	.then( editor => {
	 * 		console.log( 'Editor was initialized', editor );
	 * 	} )
	 * 	.catch( err => {
	 * 		console.error( err.stack );
	 * 	} );
	 * ```
	 *
	 * This method can be used to initialize the editor on an existing element with the specified content in case if your integration
	 * makes it difficult to set the content of the source element.
	 *
	 * Note that an error will be thrown if you pass the initial data both as the first parameter and also in the configuration.
	 *
	 * # Configuring the editor
	 *
	 * See the {@link module:core/editor/editorconfig~EditorConfig editor configuration documentation} to learn more about
	 * customizing plugins, toolbar and more.
	 *
	 * @param sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data.
	 *
	 * If a DOM element is passed, its content will be automatically loaded to the editor upon initialization
	 * and the {@link module:editor-classic/classiceditorui~ClassicEditorUI#element editor element} will replace the passed element
	 * in the DOM (the original one will be hidden and the editor will be injected next to it).
	 *
	 * If the {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy updateSourceElementOnDestroy}
	 * option is set to `true`, the editor data will be set back to the original element once the editor is destroyed and when a form,
	 * in which this element is contained, is submitted (if the original element is a `<textarea>`). This ensures seamless integration
	 * with native web forms.
	 *
	 * If the initial data is passed, a detached editor will be created. In this case you need to insert it into the DOM manually.
	 * It is available under the {@link module:editor-classic/classiceditorui~ClassicEditorUI#element `editor.ui.element`} property.
	 *
	 * @param config The editor configuration.
	 * @returns A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */ static create(sourceElementOrData, config = {}) {
        return new Promise((resolve)=>{
            const editor = new this(sourceElementOrData, config);
            resolve(editor.initPlugins().then(()=>editor.ui.init(isElement(sourceElementOrData) ? sourceElementOrData : null)).then(()=>editor.data.init(editor.config.get('initialData'))).then(()=>editor.fire('ready')).then(()=>editor));
        });
    }
}
function getInitialData(sourceElementOrData) {
    return isElement(sourceElementOrData) ? getDataFromElement(sourceElementOrData) : sourceElementOrData;
}
function isElement(value) {
    return isElement$1(value);
}

export { ClassicEditor, ClassicEditorUI, ClassicEditorUIView };
//# sourceMappingURL=index.js.map

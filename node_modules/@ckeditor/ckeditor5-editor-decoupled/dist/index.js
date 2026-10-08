/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ElementApiMixin, Editor, secureSourceElement } from '@ckeditor/ckeditor5-core/dist/index.js';
import { CKEditorError, getDataFromElement } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { EditorUI, EditorUIView, ToolbarView, MenuBarView, InlineEditableUIView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { enableViewPlaceholder } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { isElement as isElement$1 } from 'es-toolkit/compat';

/**
 * The decoupled editor UI class.
 */ class DecoupledEditorUI extends EditorUI {
    /**
	 * The main (top–most) view of the editor UI.
	 */ view;
    /**
	 * Creates an instance of the decoupled editor UI class.
	 *
	 * @param editor The editor instance.
	 * @param view The view of the UI.
	 */ constructor(editor, view){
        super(editor);
        this.view = view;
    }
    /**
	 * Initializes the UI.
	 */ init() {
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
        // But it can be available earlier if a DOM element has been passed to DecoupledEditor.create().
        const editableElement = editable.element;
        // Register the editable UI view in the editor. A single editor instance can aggregate multiple
        // editable areas (roots) but the decoupled editor has only one.
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
        this._initPlaceholder();
        this._initToolbar();
        this.initMenuBar(this.view.menuBarView);
        this.fire('ready');
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        const view = this.view;
        const editingView = this.editor.editing.view;
        if (editingView.getDomRoot(view.editable.name)) {
            editingView.detachDomRoot(view.editable.name);
        }
        view.destroy();
    }
    /**
	 * Initializes the inline editor toolbar and its panel.
	 */ _initToolbar() {
        const editor = this.editor;
        const view = this.view;
        const toolbar = view.toolbar;
        toolbar.fillFromConfig(editor.config.get('toolbar'), this.componentFactory);
        // Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
        this.addToolbar(view.toolbar);
    }
    /**
	 * Enable the placeholder text on the editing root.
	 */ _initPlaceholder() {
        const editor = this.editor;
        const editingView = editor.editing.view;
        const editingRoot = editingView.document.getRoot();
        const placeholder = editor.config.get('placeholder');
        if (placeholder) {
            const placeholderText = typeof placeholder === 'string' ? placeholder : placeholder[editingRoot.rootName];
            if (placeholderText) {
                editingRoot.placeholder = placeholderText;
            }
        }
        enableViewPlaceholder({
            view: editingView,
            element: editingRoot,
            isDirectHost: false,
            keepOnFocus: true
        });
    }
}

/**
 * The decoupled editor UI view. It is a virtual view providing an inline
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#editable},
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar}, and a
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#menuBarView} but without any
 * specific arrangement of the components in the DOM.
 *
 * See {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
 * to learn more about this view.
 */ class DecoupledEditorUIView extends EditorUIView {
    /**
	 * The main toolbar of the decoupled editor UI.
	 */ toolbar;
    /**
	 * The editable of the decoupled editor UI.
	 */ editable;
    /**
	 * Menu bar view instance.
	 */ menuBarView;
    /**
	 * Creates an instance of the decoupled editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param options Configuration options for the view instance.
	 * @param options.editableElement The editable element. If not specified, it will be automatically created by
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 * @param options.shouldToolbarGroupWhenFull When set `true` enables automatic items grouping
	 * in the main {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 * @param options.label When set, this value will be used as an accessible `aria-label` of the
	 * {@link module:ui/editableui/editableuiview~EditableUIView editable view}.
	 */ constructor(locale, editingView, options = {}){
        super(locale);
        this.toolbar = new ToolbarView(locale, {
            shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
        });
        this.menuBarView = new MenuBarView(locale);
        this.editable = new InlineEditableUIView(locale, editingView, options.editableElement, {
            label: options.label
        });
        // This toolbar may be placed anywhere in the page so things like font size need to be reset in it.
        // Because of the above, make sure the toolbar supports rounded corners.
        // Also, make sure the toolbar has the proper dir attribute because its ancestor may not have one
        // and some toolbar item styles depend on this attribute.
        this.toolbar.extendTemplate({
            attributes: {
                class: [
                    'ck-reset_all',
                    'ck-rounded-corners'
                ],
                dir: locale.uiLanguageDirection
            }
        });
        this.menuBarView.extendTemplate({
            attributes: {
                class: [
                    'ck-reset_all',
                    'ck-rounded-corners'
                ],
                dir: locale.uiLanguageDirection
            }
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this.registerChild([
            this.menuBarView,
            this.toolbar,
            this.editable
        ]);
    }
}

/**
 * The decoupled editor implementation. It provides an inline editable and a toolbar. However, unlike other editors,
 * it does not render these components anywhere in the DOM unless configured.
 *
 * This type of an editor is dedicated to integrations which require a customized UI with an open
 * structure, allowing developers to specify the exact location of the interface.
 *
 * See the document editor {@glink examples/builds/document-editor demo} to learn about possible use cases
 * for the decoupled editor.
 *
 * In order to create a decoupled editor instance, use the static
 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method.
 *
 * Note that you will need to attach the editor toolbar and menu bar to your web page manually, in a desired place,
 * after the editor is initialized.
 */ class DecoupledEditor extends /* #__PURE__ */ ElementApiMixin(Editor) {
    /**
	 * @inheritDoc
	 */ static get editorName() {
        return 'DecoupledEditor';
    }
    /**
	 * @inheritDoc
	 */ ui;
    /**
	 * Creates an instance of the decoupled editor.
	 *
	 * **Note:** Do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method instead.
	 *
	 * @param sourceElementOrData The DOM element that will be the source for the created editor
	 * (on which the editor will be initialized) or initial data for the editor. For more information see
	 * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`}.
	 * @param config The editor configuration.
	 */ constructor(sourceElementOrData, config = {}){
        // If both `config.initialData` is set and initial data is passed as the constructor parameter, then throw.
        if (!isElement(sourceElementOrData) && config.initialData !== undefined) {
            // Documented in core/editor/editorconfig.jsdoc.
            // eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
            throw new CKEditorError('editor-create-initial-data', null);
        }
        super(config);
        if (this.config.get('initialData') === undefined) {
            this.config.set('initialData', getInitialData(sourceElementOrData));
        }
        if (isElement(sourceElementOrData)) {
            this.sourceElement = sourceElementOrData;
            secureSourceElement(this, sourceElementOrData);
        }
        this.model.document.createRoot();
        const shouldToolbarGroupWhenFull = !this.config.get('toolbar.shouldNotGroupWhenFull');
        const view = new DecoupledEditorUIView(this.locale, this.editing.view, {
            editableElement: this.sourceElement,
            shouldToolbarGroupWhenFull,
            label: this.config.get('label')
        });
        this.ui = new DecoupledEditorUI(this, view);
    }
    /**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
	 * configuration option is set to `true`.
	 *
	 * **Note**: The decoupled editor does not remove the toolbar and editable when destroyed. You can
	 * do that yourself in the destruction chain:
	 *
	 * ```ts
	 * editor.destroy()
	 * 	.then( () => {
	 * 		// Remove the toolbar from DOM.
	 * 		editor.ui.view.toolbar.element.remove();
	 *
	 * 		// Remove the editable from DOM.
	 * 		editor.ui.view.editable.element.remove();
	 *
	 * 		console.log( 'Editor was destroyed' );
	 * 	} );
	 * ```
	 */ destroy() {
        // Cache the data, then destroy.
        // It's safe to assume that the model->view conversion will not work after super.destroy().
        const data = this.getData();
        this.ui.destroy();
        return super.destroy().then(()=>{
            if (this.sourceElement) {
                this.updateSourceElement(data);
            }
        });
    }
    /**
	 * Creates a new decoupled editor instance.
	 *
	 * **Note:** remember that `DecoupledEditor` does not append the toolbar element to your web page, so you have to do it manually
	 * after the editor has been initialized.
	 *
	 * There are two ways how the editor can be initialized.
	 *
	 * # Using an existing DOM element (and loading data from it)
	 *
	 * You can initialize the editor using an existing DOM element:
	 *
	 * ```ts
	 * DecoupledEditor
	 * 	.create( document.querySelector( '#editor' ) )
	 * 	.then( editor => {
	 * 		console.log( 'Editor was initialized', editor );
	 *
	 * 		// Append the toolbar to the <body> element.
	 * 		document.body.appendChild( editor.ui.view.toolbar.element );
	 * 	} )
	 * 	.catch( err => {
	 * 		console.error( err.stack );
	 * 	} );
	 * ```
	 *
	 * The element's content will be used as the editor data and the element will become the editable element.
	 *
	 * # Creating a detached editor
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as a string.
	 * In this case, you will have to manually append both the toolbar element and the editable element to your web page.
	 *
	 * ```ts
	 * DecoupledEditor
	 * 	.create( '<p>Hello world!</p>' )
	 * 	.then( editor => {
	 * 		console.log( 'Editor was initialized', editor );
	 *
	 * 		// Append the toolbar to the <body> element.
	 * 		document.body.appendChild( editor.ui.view.toolbar.element );
	 *
	 * 		// Initial data was provided so the editor UI element needs to be added manually to the DOM.
	 * 		document.body.appendChild( editor.ui.getEditableElement() );
	 * 	} )
	 * 	.catch( err => {
	 * 		console.error( err.stack );
	 * 	} );
	 * ```
	 *
	 * This lets you dynamically append the editor to your web page whenever it is convenient for you. You may use this method if your
	 * web page content is generated on the client side and the DOM structure is not ready at the moment when you initialize the editor.
	 *
	 * # Using an existing DOM element (and data provided in `config.initialData`)
	 *
	 * You can also mix these two ways by providing a DOM element to be used and passing the initial data through the configuration:
	 *
	 * ```ts
	 * DecoupledEditor
	 * 	.create( document.querySelector( '#editor' ), {
	 * 		initialData: '<h2>Initial data</h2><p>Foo bar.</p>'
	 * 	} )
	 * 	.then( editor => {
	 * 		console.log( 'Editor was initialized', editor );
	 *
	 * 		// Append the toolbar to the <body> element.
	 * 		document.body.appendChild( editor.ui.view.toolbar.element );
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
	 * If a DOM element is passed, its content will be automatically loaded to the editor upon initialization.
	 * The editor data will be set back to the original element once the editor is destroyed only if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy updateSourceElementOnDestroy}
	 * option is set to `true`.
	 *
	 * If the initial data is passed, a detached editor will be created. In this case you need to insert it into the DOM manually.
	 * It is available via
	 * {@link module:editor-decoupled/decouplededitorui~DecoupledEditorUI#getEditableElement `editor.ui.getEditableElement()`}.
	 *
	 * @param config The editor configuration.
	 * @returns A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */ static create(sourceElementOrData, config = {}) {
        return new Promise((resolve)=>{
            if (isElement(sourceElementOrData) && sourceElementOrData.tagName === 'TEXTAREA') {
                // Documented in core/editor/editor.js
                // eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
                throw new CKEditorError('editor-wrong-element', null);
            }
            const editor = new this(sourceElementOrData, config);
            resolve(editor.initPlugins().then(()=>editor.ui.init()).then(()=>editor.data.init(editor.config.get('initialData'))).then(()=>editor.fire('ready')).then(()=>editor));
        });
    }
}
function getInitialData(sourceElementOrData) {
    return isElement(sourceElementOrData) ? getDataFromElement(sourceElementOrData) : sourceElementOrData;
}
function isElement(value) {
    return isElement$1(value);
}

export { DecoupledEditor, DecoupledEditorUI, DecoupledEditorUIView };
//# sourceMappingURL=index.js.map

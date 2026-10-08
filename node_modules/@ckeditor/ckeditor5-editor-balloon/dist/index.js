/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { ElementApiMixin, Editor, secureSourceElement, attachToForm } from '@ckeditor/ckeditor5-core/dist/index.js';
import { EditorUI, EditorUIView, InlineEditableUIView, MenuBarView, BalloonToolbar } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { CKEditorError, getDataFromElement } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { enableViewPlaceholder } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { isElement as isElement$1 } from 'es-toolkit/compat';

/**
 * The balloon editor UI class.
 */ class BalloonEditorUI extends EditorUI {
    /**
	 * The main (top–most) view of the editor UI.
	 */ view;
    /**
	 * Creates an instance of the balloon editor UI class.
	 *
	 * @param editor The editor instance.
	 * @param view The view of the UI.
	 */ constructor(editor, view){
        super(editor);
        this.view = view;
    }
    /**
	 * @inheritDoc
	 */ get element() {
        return this.view.editable.element;
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
        // But it can be available earlier if a DOM element has been passed to BalloonEditor.create().
        const editableElement = editable.element;
        // Register the editable UI view in the editor. A single editor instance can aggregate multiple
        // editable areas (roots) but the balloon editor has only one.
        this.setEditableElement(editable.name, editableElement);
        // Let the editable UI element respond to the changes in the global editor focus
        // tracker. It has been added to the same tracker a few lines above but, in reality, there are
        // many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
        // as they have focus, the editable should act like it is focused too (although technically
        // it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
        // Doing otherwise will result in editable focus styles disappearing, once e.g. the
        // toolbar gets focused.
        editable.bind('isFocused').to(this.focusTracker);
        // Bind the editable UI element to the editing view, making it an end– and entry–point
        // of the editor's engine. This is where the engine meets the UI.
        editingView.attachDomRoot(editableElement);
        this._initPlaceholder();
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
 * Contextual editor UI view. Uses the {@link module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}.
 */ class BalloonEditorUIView extends EditorUIView {
    /**
	 * Editable UI view.
	 */ editable;
    /**
	 * Menu bar view instance.
	 */ menuBarView;
    /**
	 * Creates an instance of the balloon editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param editableElement The editable element. If not specified, it will be automatically created by
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 * @param label When set, this value will be used as an accessible `aria-label` of the
	 * {@link module:ui/editableui/editableuiview~EditableUIView editable view}.
	 */ constructor(locale, editingView, editableElement, label){
        super(locale);
        this.editable = new InlineEditableUIView(locale, editingView, editableElement, {
            label
        });
        this.menuBarView = new MenuBarView(locale);
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
        this.registerChild(this.editable);
        this.registerChild(this.menuBarView);
    }
}

/**
 * The balloon editor implementation (Medium-like editor).
 * It uses an inline editable and a toolbar based on the {@link module:ui/toolbar/balloon/balloontoolbar~BalloonToolbar}.
 * See the {@glink examples/builds/balloon-editor demo}.
 *
 * In order to create a balloon editor instance, use the static
 * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`} method.
 */ class BalloonEditor extends /* #__PURE__ */ ElementApiMixin(Editor) {
    /**
	 * @inheritDoc
	 */ static get editorName() {
        return 'BalloonEditor';
    }
    /**
	 * @inheritDoc
	 */ ui;
    /**
	 * Creates an instance of the balloon editor.
	 *
	 * **Note:** do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-balloon/ballooneditor~BalloonEditor.create `BalloonEditor.create()`} method instead.
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
        const plugins = this.config.get('plugins');
        plugins.push(BalloonToolbar);
        this.config.set('plugins', plugins);
        this.config.define('balloonToolbar', this.config.get('toolbar'));
        this.model.document.createRoot();
        const view = new BalloonEditorUIView(this.locale, this.editing.view, this.sourceElement, this.config.get('label'));
        this.ui = new BalloonEditorUI(this, view);
        attachToForm(this);
    }
    /**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
	 * configuration option is set to `true`.
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
	 * Creates a new balloon editor instance.
	 *
	 * There are three general ways how the editor can be initialized.
	 *
	 * # Using an existing DOM element (and loading data from it)
	 *
	 * You can initialize the editor using an existing DOM element:
	 *
	 * ```ts
	 * BalloonEditor
	 * 	.create( document.querySelector( '#editor' ) )
	 * 	.then( editor => {
	 * 		console.log( 'Editor was initialized', editor );
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
	 * In this case, the editor will render an element that must be inserted into the DOM for the editor to work properly:
	 *
	 * ```ts
	 * BalloonEditor
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
	 * # Using an existing DOM element (and data provided in `config.initialData`)
	 *
	 * You can also mix these two ways by providing a DOM element to be used and passing the initial data through the configuration:
	 *
	 * ```ts
	 * BalloonEditor
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
	 * # Using the editor from source
	 *
	 * If you want to use the balloon editor,
	 * you need to define the list of
	 * {@link module:core/editor/editorconfig~EditorConfig#plugins plugins to be initialized} and
	 * {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar items}.
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
	 * It is available under the {@link module:editor-balloon/ballooneditorui~BalloonEditorUI#element `editor.ui.element`} property.
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

export { BalloonEditor, BalloonEditorUI, BalloonEditorUIView };
//# sourceMappingURL=index.js.map

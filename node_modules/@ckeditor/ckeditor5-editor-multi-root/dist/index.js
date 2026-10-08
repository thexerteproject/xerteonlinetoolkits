/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Editor, secureSourceElement } from '@ckeditor/ckeditor5-core/dist/index.js';
import { CKEditorError, logWarning, decodeLicenseKey, isFeatureBlockedByLicenseKey, setDataInElement, getDataFromElement } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { EditorUI, EditorUIView, ToolbarView, MenuBarView, InlineEditableUIView } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { enableViewPlaceholder } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { isElement as isElement$1 } from 'es-toolkit/compat';

/**
 * The multi-root editor UI class.
 */ class MultiRootEditorUI extends EditorUI {
    /**
	 * The main (top–most) view of the editor UI.
	 */ view;
    /**
	 * The editable element that was focused the last time when any of the editables had focus.
	 */ _lastFocusedEditableElement;
    /**
	 * Creates an instance of the multi-root editor UI class.
	 *
	 * @param editor The editor instance.
	 * @param view The view of the UI.
	 */ constructor(editor, view){
        super(editor);
        this.view = view;
        this._lastFocusedEditableElement = null;
    }
    /**
	 * Initializes the UI.
	 */ init() {
        const view = this.view;
        view.render();
        // Keep track of the last focused editable element. Knowing which one was focused
        // is useful when the focus moves from editable to other UI components like balloons
        // (especially inputs) but the editable remains the "focus context" (e.g. link balloon
        // attached to a link in an editable). In this case, the editable should preserve visual
        // focus styles.
        this.focusTracker.on('change:focusedElement', (evt, name, focusedElement)=>{
            for (const editable of Object.values(this.view.editables)){
                if (focusedElement === editable.element) {
                    this._lastFocusedEditableElement = editable.element;
                }
            }
        });
        // If the focus tracker loses focus, stop tracking the last focused editable element.
        // Wherever the focus is restored, it will no longer be in the context of that editable
        // because the focus "came from the outside", as opposed to the focus moving from one element
        // to another within the editor UI.
        this.focusTracker.on('change:isFocused', (evt, name, isFocused)=>{
            if (!isFocused) {
                this._lastFocusedEditableElement = null;
            }
        });
        for (const editable of Object.values(this.view.editables)){
            this.addEditable(editable);
        }
        this._initToolbar();
        this.initMenuBar(this.view.menuBarView);
        this.fire('ready');
    }
    /**
	 * Adds the editable to the editor UI.
	 *
	 * After the editable is added to the editor UI it can be considered "active".
	 *
	 * The editable is attached to the editor editing pipeline, which means that it will be updated as the editor model updates and
	 * changing its content will be reflected in the editor model. Keystrokes, focus handling and placeholder are initialized.
	 *
	 * @param editable The editable instance to add.
	 * @param placeholder Placeholder for the editable element. If not set, placeholder value from the
	 * {@link module:core/editor/editorconfig~EditorConfig#placeholder editor configuration} will be used (if it was provided).
	 */ addEditable(editable, placeholder) {
        // The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
        // But it can be available earlier if a DOM element has been passed to `MultiRootEditor.create()`.
        const editableElement = editable.element;
        // Bind the editable UI element to the editing view, making it an end– and entry–point
        // of the editor's engine. This is where the engine meets the UI.
        this.editor.editing.view.attachDomRoot(editableElement, editable.name);
        // Register each editable UI view in the editor.
        this.setEditableElement(editable.name, editableElement);
        // Let the editable UI element respond to the changes in the global editor focus
        // tracker. It has been added to the same tracker a few lines above but, in reality, there are
        // many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
        // as they have focus, the editable should act like it is focused too (although technically
        // it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
        // Doing otherwise will result in editable focus styles disappearing, once e.g. the
        // toolbar gets focused.
        editable.bind('isFocused').to(this.focusTracker, 'isFocused', this.focusTracker, 'focusedElement', (isFocused, focusedElement)=>{
            // When the focus tracker is blurred, it means the focus moved out of the editor UI.
            // No editable will maintain focus then.
            if (!isFocused) {
                return false;
            }
            // If the focus tracker says the editor UI is focused and currently focused element
            // is the editable, then the editable should be visually marked as focused too.
            if (focusedElement === editableElement) {
                return true;
            } else {
                return this._lastFocusedEditableElement === editableElement;
            }
        });
        this._initPlaceholder(editable, placeholder);
    }
    /**
	 * Removes the editable instance from the editor UI.
	 *
	 * Removed editable can be considered "deactivated".
	 *
	 * The editable is detached from the editing pipeline, so model changes are no longer reflected in it. All handling added in
	 * {@link #addEditable} is removed.
	 *
	 * @param editable Editable to remove from the editor UI.
	 */ removeEditable(editable) {
        const editingView = this.editor.editing.view;
        if (editingView.getDomRoot(editable.name)) {
            editingView.detachDomRoot(editable.name);
        }
        editable.unbind('isFocused');
        this.removeEditableElement(editable.name);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        for (const editable of Object.values(this.view.editables)){
            this.removeEditable(editable);
        }
        this.view.destroy();
    }
    /**
	 * Initializes the editor main toolbar and its panel.
	 */ _initToolbar() {
        const editor = this.editor;
        const view = this.view;
        const toolbar = view.toolbar;
        toolbar.fillFromConfig(editor.config.get('toolbar'), this.componentFactory);
        // Register the toolbar, so it becomes available for Alt+F10 and Esc navigation.
        this.addToolbar(view.toolbar);
    }
    /**
	 * Enables the placeholder text on a given editable.
	 *
	 * @param editable Editable on which the placeholder should be set.
	 * @param placeholder Placeholder for the editable element. If not set, placeholder value from the
	 * {@link module:core/editor/editorconfig~EditorConfig#placeholder editor configuration} will be used (if it was provided).
	 */ _initPlaceholder(editable, placeholder) {
        if (!placeholder) {
            const configPlaceholder = this.editor.config.get('placeholder');
            if (configPlaceholder) {
                placeholder = typeof configPlaceholder === 'string' ? configPlaceholder : configPlaceholder[editable.name];
            }
        }
        const editingView = this.editor.editing.view;
        const editingRoot = editingView.document.getRoot(editable.name);
        if (placeholder) {
            editingRoot.placeholder = placeholder;
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
 * The multi-root editor UI view. It is a virtual view providing an inline
 * {@link module:editor-multi-root/multirooteditoruiview~MultiRootEditorUIView#editable} and a
 * {@link module:editor-multi-root/multirooteditoruiview~MultiRootEditorUIView#toolbar}, but without any
 * specific arrangement of the components in the DOM.
 *
 * See {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`}
 * to learn more about this view.
 */ class MultiRootEditorUIView extends EditorUIView {
    /**
	 * The main toolbar of the multi-root editor UI.
	 */ toolbar;
    /**
	 * Editable elements used by the multi-root editor UI.
	 */ editables;
    editable;
    /**
	 * Menu bar view instance.
	 */ menuBarView;
    /**
	 * The editing view instance this view is related to.
	 */ _editingView;
    /**
	 * Creates an instance of the multi-root editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param editableNames Names for all editable views. For each name, one
	 * {@link module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView `InlineEditableUIView`} instance will be initialized.
	 * @param options Configuration options for the view instance.
	 * @param options.editableElements The editable elements to be used, assigned to their names. If not specified, they will be
	 * automatically created by {@link module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView `InlineEditableUIView`}
	 * instances.
	 * @param options.shouldToolbarGroupWhenFull When set to `true` enables automatic items grouping
	 * in the main {@link module:editor-multi-root/multirooteditoruiview~MultiRootEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 * @param options.label When set, this value will be used as an accessible `aria-label` of the
	 * {@link module:ui/editableui/editableuiview~EditableUIView editable view} elements.
	 */ constructor(locale, editingView, editableNames, options = {}){
        super(locale);
        this._editingView = editingView;
        this.toolbar = new ToolbarView(locale, {
            shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
        });
        this.menuBarView = new MenuBarView(locale);
        this.editables = {};
        // Create `InlineEditableUIView` instance for each editable.
        for (const editableName of editableNames){
            const editableElement = options.editableElements ? options.editableElements[editableName] : undefined;
            let { label } = options;
            if (typeof label === 'object') {
                label = label[editableName];
            }
            this.createEditable(editableName, editableElement, label);
        }
        this.editable = Object.values(this.editables)[0];
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
	 * Creates an editable instance with given name and registers it in the editor UI view.
	 *
	 * If `editableElement` is provided, the editable instance will be created on top of it. Otherwise, the editor will create a new
	 * DOM element and use it instead.
	 *
	 * @param editableName The name for the editable.
	 * @param editableElement DOM element for which the editable should be created.
	 * @param label The accessible editable label used by assistive technologies.
	 * @returns The created editable instance.
	 */ createEditable(editableName, editableElement, label) {
        const editable = new InlineEditableUIView(this.locale, this._editingView, editableElement, {
            label
        });
        this.editables[editableName] = editable;
        editable.name = editableName;
        if (this.isRendered) {
            this.registerChild(editable);
        }
        return editable;
    }
    /**
	 * Destroys and removes the editable from the editor UI view.
	 *
	 * @param editableName The name of the editable that should be removed.
	 */ removeEditable(editableName) {
        const editable = this.editables[editableName];
        if (this.isRendered) {
            this.deregisterChild(editable);
        }
        delete this.editables[editableName];
        editable.destroy();
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        this.registerChild(Object.values(this.editables));
        this.registerChild(this.toolbar);
        this.registerChild(this.menuBarView);
    }
}

/**
 * The multi-root editor implementation.
 *
 * The multi-root editor provides multiple inline editable elements and a toolbar. All editable areas are controlled by one editor
 * instance, which means that they share common configuration, document ID, or undo stack.
 *
 * This type of editor is dedicated to integrations which require a customized UI with an open structure, featuring multiple editable areas,
 * allowing developers to have a control over the exact location of these editable areas.
 *
 * In order to create a multi-root editor instance, use the static
 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`} method.
 *
 * Note that you will need to attach the editor toolbar to your web page manually, in a desired place, after the editor is initialized.
 */ class MultiRootEditor extends Editor {
    /**
	 * @inheritDoc
	 */ static get editorName() {
        return 'MultiRootEditor';
    }
    /**
	 * @inheritDoc
	 */ ui;
    /**
	 * The elements on which the editor has been initialized.
	 */ sourceElements;
    /**
	 * Holds attributes keys that were passed in {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes `rootsAttributes`}
	 * config property and should be returned by {@link #getRootsAttributes}.
	 */ _registeredRootsAttributesKeys = new Set();
    /**
	 * A set of lock IDs for enabling or disabling particular root.
	 */ _readOnlyRootLocks = new Map();
    /**
	 * Creates an instance of the multi-root editor.
	 *
	 * **Note:** Do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`} method instead.
	 *
	 * @param sourceElementsOrData The DOM elements that will be the source for the created editor
	 * or the editor's initial data. The editor will initialize multiple roots with names according to the keys in the passed object.
	 * For more information see {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`}.
	 * @param config The editor configuration.
	 */ constructor(sourceElementsOrData, config = {}){
        const rootNames = Object.keys(sourceElementsOrData);
        const sourceIsData = rootNames.length === 0 || typeof sourceElementsOrData[rootNames[0]] === 'string';
        if (sourceIsData && config.initialData !== undefined && Object.keys(config.initialData).length > 0) {
            // Documented in core/editor/editorconfig.jsdoc.
            // eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
            throw new CKEditorError('editor-create-initial-data', null);
        }
        super(config);
        if (!sourceIsData) {
            this.sourceElements = sourceElementsOrData;
        } else {
            this.sourceElements = {};
        }
        if (this.config.get('initialData') === undefined) {
            // Create initial data object containing data from all roots.
            const initialData = {};
            for (const rootName of rootNames){
                initialData[rootName] = getInitialData(sourceElementsOrData[rootName]);
            }
            this.config.set('initialData', initialData);
        }
        if (!sourceIsData) {
            for (const rootName of rootNames){
                secureSourceElement(this, sourceElementsOrData[rootName]);
            }
        }
        this.editing.view.document.roots.on('add', (evt, viewRoot)=>{
            // Here we change the standard binding of readOnly flag by adding
            // additional constraint that multi-root has (enabling / disabling particular root).
            viewRoot.unbind('isReadOnly');
            viewRoot.bind('isReadOnly').to(this.editing.view.document, 'isReadOnly', (isReadOnly)=>{
                return isReadOnly || this._readOnlyRootLocks.has(viewRoot.rootName);
            });
            // Hacky solution to nested editables.
            // Nested editables should be managed each separately and do not base on view document or view root.
            viewRoot.on('change:isReadOnly', (evt, prop, value)=>{
                const viewRange = this.editing.view.createRangeIn(viewRoot);
                for (const viewItem of viewRange.getItems()){
                    if (viewItem.is('editableElement')) {
                        viewItem.unbind('isReadOnly');
                        viewItem.isReadOnly = value;
                    }
                }
            });
        });
        for (const rootName of rootNames){
            // Create root and `UIView` element for each editable container.
            this.model.document.createRoot('$root', rootName);
        }
        if (this.config.get('lazyRoots')) {
            for (const rootName of this.config.get('lazyRoots')){
                const root = this.model.document.createRoot('$root', rootName);
                root._isLoaded = false;
            }
        }
        if (this.config.get('rootsAttributes')) {
            const rootsAttributes = this.config.get('rootsAttributes');
            for (const [rootName, attributes] of Object.entries(rootsAttributes)){
                if (!this.model.document.getRoot(rootName)) {
                    /**
					 * Trying to set attributes on a non-existing root.
					 *
					 * Roots specified in {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes} do not match initial
					 * editor roots.
					 *
					 * @error multi-root-editor-root-attributes-no-root
					 */ throw new CKEditorError('multi-root-editor-root-attributes-no-root', null);
                }
                for (const key of Object.keys(attributes)){
                    this.registerRootAttribute(key);
                }
            }
            this.data.on('init', ()=>{
                this.model.enqueueChange({
                    isUndoable: false
                }, (writer)=>{
                    for (const [name, attributes] of Object.entries(rootsAttributes)){
                        const root = this.model.document.getRoot(name);
                        for (const [key, value] of Object.entries(attributes)){
                            if (value !== null) {
                                writer.setAttribute(key, value, root);
                            }
                        }
                    }
                });
            });
        }
        const options = {
            shouldToolbarGroupWhenFull: !this.config.get('toolbar.shouldNotGroupWhenFull'),
            editableElements: sourceIsData ? undefined : sourceElementsOrData,
            label: this.config.get('label')
        };
        const view = new MultiRootEditorUIView(this.locale, this.editing.view, rootNames, options);
        this.ui = new MultiRootEditorUI(this, view);
        this.model.document.on('change:data', ()=>{
            const changedRoots = this.model.document.differ.getChangedRoots();
            // Fire detaches first. If there are multiple roots removed and added in one batch, it should be easier to handle if
            // changes aren't mixed. Detaching will usually lead to just removing DOM elements. Detaching first will lead to a clean DOM
            // when new editables are added in `addRoot` event.
            for (const changes of changedRoots){
                const root = this.model.document.getRoot(changes.name);
                if (changes.state == 'detached') {
                    this.fire('detachRoot', root);
                }
            }
            for (const changes of changedRoots){
                const root = this.model.document.getRoot(changes.name);
                if (changes.state == 'attached') {
                    this.fire('addRoot', root);
                }
            }
        });
        // Overwrite `Model#canEditAt()` decorated method.
        // Check if the provided selection is inside a read-only root. If so, return `false`.
        this.listenTo(this.model, 'canEditAt', (evt, [selection])=>{
            // Skip empty selections.
            if (!selection) {
                return;
            }
            let selectionInReadOnlyRoot = false;
            for (const range of selection.getRanges()){
                const root = range.root;
                if (this._readOnlyRootLocks.has(root.rootName)) {
                    selectionInReadOnlyRoot = true;
                    break;
                }
            }
            // If selection is in read-only root, return `false` and prevent further processing.
            // Otherwise, allow for other callbacks (or default callback) to evaluate.
            if (selectionInReadOnlyRoot) {
                evt.return = false;
                evt.stop();
            }
        }, {
            priority: 'high'
        });
        this.decorate('loadRoot');
        this.on('loadRoot', (evt, [rootName])=>{
            const root = this.model.document.getRoot(rootName);
            if (!root) {
                /**
				 * The root to load does not exist.
				 *
				 * @error multi-root-editor-load-root-no-root
				 */ throw new CKEditorError('multi-root-editor-load-root-no-root', this, {
                    rootName
                });
            }
            if (root._isLoaded) {
                /**
				 * The root to load was already loaded before. The `loadRoot()` call has no effect.
				 *
				 * @error multi-root-editor-load-root-already-loaded
				 */ logWarning('multi-root-editor-load-root-already-loaded');
                evt.stop();
            }
        }, {
            priority: 'highest'
        });
        verifyLicenseKey(this);
        function verifyLicenseKey(editor) {
            const licenseKey = editor.config.get('licenseKey');
            const decodedPayload = decodeLicenseKey(licenseKey);
            if (!decodedPayload) {
                return;
            }
            if (isFeatureBlockedByLicenseKey(decodedPayload, 'MRE')) {
                editor.enableReadOnlyMode(Symbol('invalidLicense'));
                editor._showLicenseError('featureNotAllowed', 'Multi-root editor');
            }
        }
    }
    /**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
	 * configuration option is set to `true`.
	 *
	 * **Note**: The multi-root editor does not remove the toolbar and editable when destroyed. You can
	 * do that yourself in the destruction chain, if you need to:
	 *
	 * ```ts
	 * editor.destroy().then( () => {
	 * 	// Remove the toolbar from DOM.
	 * 	editor.ui.view.toolbar.element.remove();
	 *
	 * 	// Remove editable elements from DOM.
	 * 	for ( const editable of Object.values( editor.ui.view.editables ) ) {
	 * 	    editable.element.remove();
	 * 	}
	 *
	 * 	console.log( 'Editor was destroyed' );
	 * } );
	 * ```
	 */ destroy() {
        const shouldUpdateSourceElement = this.config.get('updateSourceElementOnDestroy');
        // Cache the data and editable DOM elements, then destroy.
        // It's safe to assume that the model->view conversion will not work after `super.destroy()`,
        // same as `ui.getEditableElement()` method will not return editables.
        const data = {};
        for (const rootName of Object.keys(this.sourceElements)){
            data[rootName] = shouldUpdateSourceElement ? this.getData({
                rootName
            }) : '';
        }
        this.ui.destroy();
        return super.destroy().then(()=>{
            for (const rootName of Object.keys(this.sourceElements)){
                setDataInElement(this.sourceElements[rootName], data[rootName]);
            }
        });
    }
    /**
	 * Adds a new root to the editor.
	 *
	 * ```ts
	 * editor.addRoot( 'myRoot', { data: '<p>Initial root data.</p>' } );
	 * ```
	 *
	 * After a root is added, you will be able to modify and retrieve its data.
	 *
	 * All root names must be unique. An error will be thrown if you will try to create a root with the name same as
	 * an already existing, attached root. However, you can call this method for a detached root. See also {@link #detachRoot}.
	 *
	 * Whenever a root is added, the editor instance will fire {@link #event:addRoot `addRoot` event}. The event is also called when
	 * the root is added indirectly, e.g. by the undo feature or on a remote client during real-time collaboration.
	 *
	 * Note, that this method only adds a root to the editor model. It **does not** create a DOM editable element for the new root.
	 * Until such element is created (and attached to the root), the root is "virtual": it is not displayed anywhere and its data can
	 * be changed only using the editor API.
	 *
	 * To create a DOM editable element for the root, listen to {@link #event:addRoot `addRoot` event} and call {@link #createEditable}.
	 * Then, insert the DOM element in a desired place, that will depend on the integration with your application and your requirements.
	 *
	 * ```ts
	 * editor.on( 'addRoot', ( evt, root ) => {
	 * 	const editableElement = editor.createEditable( root );
	 *
	 * 	// You may want to create a more complex DOM structure here.
	 * 	//
	 * 	// Alternatively, you may want to create a DOM structure before
	 * 	// calling `editor.addRoot()` and only append `editableElement` at
	 * 	// a proper place.
	 *
	 * 	document.querySelector( '#editors' ).appendChild( editableElement );
	 * } );
	 *
	 * // ...
	 *
	 * editor.addRoot( 'myRoot' ); // Will create a root, a DOM editable element and append it to `#editors` container element.
	 * ```
	 *
	 * You can set root attributes on the new root while you add it:
	 *
	 * ```ts
	 * // Add a collapsed root at fourth position from top.
	 * // Keep in mind that these are just examples of attributes. You need to provide your own features that will handle the attributes.
	 * editor.addRoot( 'myRoot', { attributes: { isCollapsed: true, index: 4 } } );
	 * ```
	 *
	 * Note that attributes added together with a root are automatically registered.
	 *
	 * See also {@link ~MultiRootEditor#registerRootAttribute `MultiRootEditor#registerRootAttribute()`} and
	 * {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes `config.rootsAttributes` configuration option}.
	 *
	 * By setting `isUndoable` flag to `true`, you can allow for detaching the root using the undo feature.
	 *
	 * Additionally, you can group adding multiple roots in one undo step. This can be useful if you add multiple roots that are
	 * combined into one, bigger UI element, and want them all to be undone together.
	 *
	 * ```ts
	 * let rowId = 0;
	 *
	 * editor.model.change( () => {
	 * 	editor.addRoot( 'left-row-' + rowId, { isUndoable: true } );
	 * 	editor.addRoot( 'center-row-' + rowId, { isUndoable: true } );
	 * 	editor.addRoot( 'right-row-' + rowId, { isUndoable: true } );
	 *
	 * 	rowId++;
	 * } );
	 * ```
	 *
	 * @param rootName Name of the root to add.
	 * @param options Additional options for the added root.
	 */ addRoot(rootName, { data = '', attributes = {}, elementName = '$root', isUndoable = false } = {}) {
        const _addRoot = (writer)=>{
            const root = writer.addRoot(rootName, elementName);
            if (data) {
                writer.insert(this.data.parse(data, root), root, 0);
            }
            for (const key of Object.keys(attributes)){
                this.registerRootAttribute(key);
                writer.setAttribute(key, attributes[key], root);
            }
        };
        if (isUndoable) {
            this.model.change(_addRoot);
        } else {
            this.model.enqueueChange({
                isUndoable: false
            }, _addRoot);
        }
    }
    /**
	 * Detaches a root from the editor.
	 *
	 * ```ts
	 * editor.detachRoot( 'myRoot' );
	 * ```
	 *
	 * A detached root is not entirely removed from the editor model, however it can be considered removed.
	 *
	 * After a root is detached all its children are removed, all markers inside it are removed, and whenever something is inserted to it,
	 * it is automatically removed as well. Finally, a detached root is not returned by
	 * {@link module:engine/model/document~ModelDocument#getRootNames} by default.
	 *
	 * It is possible to re-add a previously detached root calling {@link #addRoot}.
	 *
	 * Whenever a root is detached, the editor instance will fire {@link #event:detachRoot `detachRoot` event}. The event is also
	 * called when the root is detached indirectly, e.g. by the undo feature or on a remote client during real-time collaboration.
	 *
	 * Note, that this method only detached a root in the editor model. It **does not** destroy the DOM editable element linked with
	 * the root and it **does not** remove the DOM element from the DOM structure of your application.
	 *
	 * To properly remove a DOM editable element after a root was detached, listen to {@link #event:detachRoot `detachRoot` event}
	 * and call {@link #detachEditable}. Then, remove the DOM element from your application.
	 *
	 * ```ts
	 * editor.on( 'detachRoot', ( evt, root ) => {
	 * 	const editableElement = editor.detachEditable( root );
	 *
	 * 	// You may want to do an additional DOM clean-up here.
	 *
	 * 	editableElement.remove();
	 * } );
	 *
	 * // ...
	 *
	 * editor.detachRoot( 'myRoot' ); // Will detach the root, and remove the DOM editable element.
	 * ```
	 *
	 * By setting `isUndoable` flag to `true`, you can allow for re-adding the root using the undo feature.
	 *
	 * Additionally, you can group detaching multiple roots in one undo step. This can be useful if the roots are combined into one,
	 * bigger UI element, and you want them all to be re-added together.
	 *
	 * ```ts
	 * editor.model.change( () => {
	 * 	editor.detachRoot( 'left-row-3', true );
	 * 	editor.detachRoot( 'center-row-3', true );
	 * 	editor.detachRoot( 'right-row-3', true );
	 * } );
	 * ```
	 *
	 * @param rootName Name of the root to detach.
	 * @param isUndoable Whether detaching the root can be undone (using the undo feature) or not.
	 */ detachRoot(rootName, isUndoable = false) {
        if (isUndoable) {
            this.model.change((writer)=>writer.detachRoot(rootName));
        } else {
            this.model.enqueueChange({
                isUndoable: false
            }, (writer)=>writer.detachRoot(rootName));
        }
    }
    /**
	 * Creates and returns a new DOM editable element for the given root element.
	 *
	 * The new DOM editable is attached to the model root and can be used to modify the root content.
	 *
	 * @param root Root for which the editable element should be created.
	 * @param placeholder Placeholder for the editable element. If not set, placeholder value from the
	 * {@link module:core/editor/editorconfig~EditorConfig#placeholder editor configuration} will be used (if it was provided).
	 * @param label The accessible label text describing the editable to the assistive technologies.
	 * @returns The created DOM element. Append it in a desired place in your application.
	 */ createEditable(root, placeholder, label) {
        const editable = this.ui.view.createEditable(root.rootName, undefined, label);
        this.ui.addEditable(editable, placeholder);
        this.editing.view.forceRender();
        return editable.element;
    }
    /**
	 * Detaches the DOM editable element that was attached to the given root.
	 *
	 * @param root Root for which the editable element should be detached.
	 * @returns The DOM element that was detached. You may want to remove it from your application DOM structure.
	 */ detachEditable(root) {
        const rootName = root.rootName;
        const editable = this.ui.view.editables[rootName];
        this.ui.removeEditable(editable);
        this.ui.view.removeEditable(rootName);
        return editable.element;
    }
    /**
	 * Loads a root that has previously been declared in {@link module:core/editor/editorconfig~EditorConfig#lazyRoots `lazyRoots`}
	 * configuration option.
	 *
	 * **Important! Lazy roots loading is an experimental feature, and may become deprecated. Be advised of the following
	 * known limitations:**
	 *
	 * * **Real-time collaboration integrations that use
	 * [uploaded editor bundles](https://ckeditor.com/docs/cs/latest/guides/collaboration/editor-bundle.html) are not supported. Using
	 * lazy roots will lead to unexpected behavior and data loss.**
	 * * **Revision history feature will read and process the whole document on editor initialization, possibly defeating the purpose
	 * of using the lazy roots loading. Additionally, when the document is loaded for the first time, all roots need to be loaded,
	 * to make sure that the initial revision data includes all roots. Otherwise, you may experience data loss.**
	 * * **Multiple features, that require full document data to be loaded, will produce incorrect or confusing results if not all
	 * roots are loaded. These include: bookmarks, find and replace, word count, pagination, document exports, document outline,
	 * and table of contents.**
	 *
	 * Only roots specified in the editor config can be loaded. A root cannot be loaded multiple times. A root cannot be unloaded and
	 * loading a root cannot be reverted using the undo feature.
	 *
	 * When a root becomes loaded, it will be treated by the editor as though it was just added. This, among others, means that all
	 * related events and mechanisms will be fired, including {@link ~MultiRootEditor#event:addRoot `addRoot` event},
	 * {@link module:engine/model/document~ModelDocument#event:change `model.Document` `change` event}, model post-fixers and conversion.
	 *
	 * Until the root becomes loaded, all above mechanisms are suppressed.
	 *
	 * This method is {@link module:utils/observablemixin~Observable#decorate decorated}.
	 *
	 * Note that attributes loaded together with a root are automatically registered.
	 *
	 * See also {@link ~MultiRootEditor#registerRootAttribute `MultiRootEditor#registerRootAttribute()`} and
	 * {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes `config.rootsAttributes` configuration option}.
	 *
	 * When this method is used in real-time collaboration environment, its effects become asynchronous as the editor will first synchronize
	 * with the remote editing session, before the root is added to the editor.
	 *
	 * If the root has been already loaded by any other client, the additional data passed in `loadRoot()` parameters will be ignored.
	 *
	 * @param rootName Name of the root to load.
	 * @param options Additional options for the loaded root.
	 * @fires loadRoot
	 */ loadRoot(rootName, { data = '', attributes = {} } = {}) {
        // `root` will be defined as it is guaranteed by a check in a higher priority callback.
        const root = this.model.document.getRoot(rootName);
        this.model.enqueueChange({
            isUndoable: false
        }, (writer)=>{
            if (data) {
                writer.insert(this.data.parse(data, root), root, 0);
            }
            for (const key of Object.keys(attributes)){
                this.registerRootAttribute(key);
                writer.setAttribute(key, attributes[key], root);
            }
            root._isLoaded = true;
            this.model.document.differ._bufferRootLoad(root);
        });
    }
    /**
	 * Returns the document data for all attached roots.
	 *
	 * @param options Additional configuration for the retrieved data.
	 * Editor features may introduce more configuration options that can be set through this parameter.
	 * @param options.trim Whether returned data should be trimmed. This option is set to `'empty'` by default,
	 * which means that whenever editor content is considered empty, an empty string is returned. To turn off trimming
	 * use `'none'`. In such cases exact content will be returned (for example `'<p>&nbsp;</p>'` for an empty editor).
	 * @returns The full document data.
	 */ getFullData(options) {
        const data = {};
        for (const rootName of this.model.document.getRootNames()){
            data[rootName] = this.data.get({
                ...options,
                rootName
            });
        }
        return data;
    }
    /**
	 * Returns attributes for all attached roots.
	 *
	 * Note: all and only {@link ~MultiRootEditor#registerRootAttribute registered} roots attributes will be returned.
	 * If a registered root attribute is not set for a given root, `null` will be returned.
	 *
	 * @returns Object with roots attributes. Keys are roots names, while values are attributes set on given root.
	 */ getRootsAttributes() {
        const rootsAttributes = {};
        for (const rootName of this.model.document.getRootNames()){
            rootsAttributes[rootName] = this.getRootAttributes(rootName);
        }
        return rootsAttributes;
    }
    /**
	 * Returns attributes for the specified root.
	 *
	 * Note: all and only {@link ~MultiRootEditor#registerRootAttribute registered} roots attributes will be returned.
	 * If a registered root attribute is not set for a given root, `null` will be returned.
	 */ getRootAttributes(rootName) {
        const rootAttributes = {};
        const root = this.model.document.getRoot(rootName);
        for (const key of this._registeredRootsAttributesKeys){
            rootAttributes[key] = root.hasAttribute(key) ? root.getAttribute(key) : null;
        }
        return rootAttributes;
    }
    /**
	 * Registers given string as a root attribute key. Registered root attributes are added to
	 * {@link module:engine/model/schema~ModelSchema schema}, and also returned by
	 * {@link ~MultiRootEditor#getRootAttributes `getRootAttributes()`} and
	 * {@link ~MultiRootEditor#getRootsAttributes `getRootsAttributes()`}.
	 *
	 * Note: attributes passed in {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes `config.rootsAttributes`} are
	 * automatically registered as the editor is initialized. However, registering the same attribute twice does not have any negative
	 * impact, so it is recommended to use this method in any feature that uses roots attributes.
	 */ registerRootAttribute(key) {
        if (this._registeredRootsAttributesKeys.has(key)) {
            return;
        }
        this._registeredRootsAttributesKeys.add(key);
        this.editing.model.schema.extend('$root', {
            allowAttributes: key
        });
    }
    /**
	 * Switches given editor root to the read-only mode.
	 *
	 * In contrary to {@link module:core/editor/editor~Editor#enableReadOnlyMode `enableReadOnlyMode()`}, which switches the whole editor
	 * to the read-only mode, this method turns only a particular root to the read-only mode. This can be useful when you want to prevent
	 * editing only a part of the editor content.
	 *
	 * When you switch a root to the read-only mode, you need provide a unique identifier (`lockId`) that will identify this request. You
	 * will need to provide the same `lockId` when you will want to
	 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#enableRoot re-enable} the root.
	 *
	 * ```ts
	 * const model = editor.model;
	 * const myRoot = model.document.getRoot( 'myRoot' );
	 *
	 * editor.disableRoot( 'myRoot', 'my-lock' );
	 * model.canEditAt( myRoot ); // `false`
	 *
	 * editor.disableRoot( 'myRoot', 'other-lock' );
	 * editor.disableRoot( 'myRoot', 'other-lock' ); // Multiple locks with the same ID have no effect.
	 * model.canEditAt( myRoot ); // `false`
	 *
	 * editor.enableRoot( 'myRoot', 'my-lock' );
	 * model.canEditAt( myRoot ); // `false`
	 *
	 * editor.enableRoot( 'myRoot', 'other-lock' );
	 * model.canEditAt( myRoot ); // `true`
	 * ```
	 *
	 * See also {@link module:core/editor/editor~Editor#enableReadOnlyMode `Editor#enableReadOnlyMode()`} and
	 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#enableRoot `MultiRootEditor#enableRoot()`}.
	 *
	 * @param rootName Name of the root to switch to read-only mode.
	 * @param lockId A unique ID for setting the editor to the read-only state.
	 */ disableRoot(rootName, lockId) {
        if (rootName == '$graveyard') {
            /**
			 * You cannot disable the `$graveyard` root.
			 *
			 * @error multi-root-editor-cannot-disable-graveyard-root
			 */ throw new CKEditorError('multi-root-editor-cannot-disable-graveyard-root', this);
        }
        const locksForGivenRoot = this._readOnlyRootLocks.get(rootName);
        if (locksForGivenRoot) {
            locksForGivenRoot.add(lockId);
        } else {
            this._readOnlyRootLocks.set(rootName, new Set([
                lockId
            ]));
            const editableRootElement = this.editing.view.document.getRoot(rootName);
            editableRootElement.isReadOnly = true;
            // Since one of the roots has changed read-only state, we need to refresh all commands that affect data.
            Array.from(this.commands.commands()).forEach((command)=>command.affectsData && command.refresh());
        }
    }
    /**
	 * Removes given read-only lock from the given root.
	 *
	 * See {@link module:editor-multi-root/multirooteditor~MultiRootEditor#disableRoot `disableRoot()`}.
	 *
	 * @param rootName Name of the root to switch back from the read-only mode.
	 * @param lockId A unique ID for setting the editor to the read-only state.
	 */ enableRoot(rootName, lockId) {
        const locksForGivenRoot = this._readOnlyRootLocks.get(rootName);
        if (!locksForGivenRoot || !locksForGivenRoot.has(lockId)) {
            return;
        }
        if (locksForGivenRoot.size === 1) {
            this._readOnlyRootLocks.delete(rootName);
            const editableRootElement = this.editing.view.document.getRoot(rootName);
            editableRootElement.isReadOnly = this.isReadOnly;
            // Since one of the roots has changed read-only state, we need to refresh all commands that affect data.
            Array.from(this.commands.commands()).forEach((command)=>command.affectsData && command.refresh());
        } else {
            locksForGivenRoot.delete(lockId);
        }
    }
    /**
	 * Creates a new multi-root editor instance.
	 *
	 * **Note:** remember that `MultiRootEditor` does not append the toolbar element to your web page, so you have to do it manually
	 * after the editor has been initialized.
	 *
	 * There are a few different ways to initialize the multi-root editor.
	 *
	 * # Using existing DOM elements:
	 *
	 * ```ts
	 * MultiRootEditor.create( {
	 * 	intro: document.querySelector( '#editor-intro' ),
	 * 	content: document.querySelector( '#editor-content' ),
	 * 	sidePanelLeft: document.querySelector( '#editor-side-left' ),
	 * 	sidePanelRight: document.querySelector( '#editor-side-right' ),
	 * 	outro: document.querySelector( '#editor-outro' )
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
	 * ```
	 *
	 * The elements' content will be used as the editor data and elements will become editable elements.
	 *
	 * # Creating a detached editor
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as strings.
	 * In this case, you will have to manually append both the toolbar element and the editable elements to your web page.
	 *
	 * ```ts
	 * MultiRootEditor.create( {
	 * 	intro: '<p><strong>Exciting</strong> intro text to an article.</p>',
	 * 	content: '<p>Lorem ipsum dolor sit amet.</p>',
	 * 	sidePanelLeft: '<blockquote>Strong quotation from article.</blockquote>',
	 * 	sidePanelRight: '<p>List of similar articles...</p>',
	 * 	outro: '<p>Closing text.</p>'
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 *
	 * 	// Append DOM editable elements created by the editor.
	 * 	const editables = editor.ui.view.editables;
	 * 	const container = document.querySelector( '#editable-container' );
	 *
	 * 	container.appendChild( editables.intro.element );
	 * 	container.appendChild( editables.content.element );
	 * 	container.appendChild( editables.outro.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
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
	 * MultiRootEditor.create( {
	 * 	intro: document.querySelector( '#editor-intro' ),
	 * 	content: document.querySelector( '#editor-content' ),
	 * 	sidePanelLeft: document.querySelector( '#editor-side-left' ),
	 * 	sidePanelRight: document.querySelector( '#editor-side-right' ),
	 * 	outro: document.querySelector( '#editor-outro' )
	 * }, {
	 * 	initialData: {
	 * 		intro: '<p><strong>Exciting</strong> intro text to an article.</p>',
	 * 		content: '<p>Lorem ipsum dolor sit amet.</p>',
	 * 		sidePanelLeft '<blockquote>Strong quotation from article.</blockquote>':
	 * 		sidePanelRight '<p>List of similar articles...</p>':
	 * 		outro: '<p>Closing text.</p>'
	 * 	}
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
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
	 * @param sourceElementsOrData The DOM elements that will be the source for the created editor
	 * or the editor's initial data. The editor will initialize multiple roots with names according to the keys in the passed object.
	 *
	 * If DOM elements are passed, their content will be automatically loaded to the editor upon initialization and the elements will be
	 * used as the editor's editable areas. The editor data will be set back to the original element once the editor is destroyed if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy updateSourceElementOnDestroy} option
	 * is set to `true`.
	 *
	 * If the initial data is passed, a detached editor will be created. For each entry in the passed object, one editor root and one
	 * editable DOM element will be created. You will need to attach the editable elements into the DOM manually. The elements are available
	 * through the {@link module:editor-multi-root/multirooteditorui~MultiRootEditorUI#getEditableElement `editor.ui.getEditableElement()`}
	 * method.
	 * @param config The editor configuration.
	 * @returns A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */ static create(sourceElementsOrData, config = {}) {
        return new Promise((resolve)=>{
            for (const sourceItem of Object.values(sourceElementsOrData)){
                if (isElement(sourceItem) && sourceItem.tagName === 'TEXTAREA') {
                    // Documented in core/editor/editor.js
                    // eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
                    throw new CKEditorError('editor-wrong-element', null);
                }
            }
            const editor = new this(sourceElementsOrData, config);
            resolve(editor.initPlugins().then(()=>editor.ui.init()).then(()=>{
                // This is checked directly before setting the initial data,
                // as plugins may change `EditorConfig#initialData` value.
                editor._verifyRootsWithInitialData();
                return editor.data.init(editor.config.get('initialData'));
            }).then(()=>editor.fire('ready')).then(()=>editor));
        });
    }
    /**
	 * @internal
	 */ _verifyRootsWithInitialData() {
        const initialData = this.config.get('initialData');
        // Roots that are not in the initial data.
        for (const rootName of this.model.document.getRootNames()){
            if (!(rootName in initialData)) {
                /**
				 * Editor roots do not match the
				 * {@link module:core/editor/editorconfig~EditorConfig#initialData `initialData` configuration}.
				 *
				 * This may happen for one of the two reasons:
				 *
				 * * Configuration error. The `sourceElementsOrData` parameter in
				 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`} contains different
				 * roots than {@link module:core/editor/editorconfig~EditorConfig#initialData `initialData` configuration}.
				 * * As the editor was initialized, the {@link module:core/editor/editorconfig~EditorConfig#initialData `initialData`}
				 * configuration value or the state of the editor roots has been changed.
				 *
				 * @error multi-root-editor-root-initial-data-mismatch
				 */ throw new CKEditorError('multi-root-editor-root-initial-data-mismatch', null);
            }
        }
        // Roots that are not in the editor.
        for (const rootName of Object.keys(initialData)){
            const root = this.model.document.getRoot(rootName);
            if (!root || !root.isAttached()) {
                throw new CKEditorError('multi-root-editor-root-initial-data-mismatch', null);
            }
        }
    }
}
function getInitialData(sourceElementOrData) {
    return isElement(sourceElementOrData) ? getDataFromElement(sourceElementOrData) : sourceElementOrData;
}
function isElement(value) {
    return isElement$1(value);
}

export { MultiRootEditor, MultiRootEditorUI, MultiRootEditorUIView };
//# sourceMappingURL=index.js.map

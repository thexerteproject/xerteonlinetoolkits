/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, Command } from '@ckeditor/ckeditor5-core/dist/index.js';
import { Clipboard, ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard/dist/index.js';
import { ModelLivePosition, ModelLiveRange, Observer, ViewUpcastWriter, enableViewPlaceholder, ModelElement } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { Undo } from '@ckeditor/ckeditor5-undo/dist/index.js';
import { Delete } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { first, DomEmitterMixin, global, FocusTracker, KeystrokeHandler, logWarning, toArray, env, CKEditorError, Collection, Rect } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { toWidget, isWidget, findOptimalInsertionRange, Widget, toWidgetEditable, WidgetResize, calculateResizeHostAncestorWidth, WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget/dist/index.js';
import { View, FormRowView, ViewCollection, FocusCycler, submitHandler, ButtonView, FormHeaderView, LabeledFieldView, createLabeledInputText, BalloonPanelView, ContextualBalloon, CssTransitionDisablerMixin, clickOutsideHandler, CollapsibleView, SplitButtonView, createDropdown, MenuBarMenuView, MenuBarMenuListView, MenuBarMenuListItemView, FileDialogButtonView, MenuBarMenuListItemFileDialogButtonView, Notification, Dialog, MenuBarMenuListItemButtonView, UIModel, DropdownButtonView, addListToDropdown, createLabeledInputNumber, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconPreviousArrow, IconTextAlternative, IconImage, IconCaption, IconImageUpload, IconImageUrl, IconObjectSizeFull, IconObjectSizeCustom, IconObjectSizeLarge, IconObjectSizeMedium, IconObjectSizeSmall, IconObjectInline, IconObjectInlineRight, IconObjectInlineLeft, IconObjectCenter, IconObjectRight, IconObjectLeft, IconObjectFullWidth } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { FileRepository } from '@ckeditor/ckeditor5-upload/dist/index.js';
import isEqual from 'es-toolkit/compat/isEqual';
import { isObject, identity } from 'es-toolkit/compat';

/**
 * Creates a view element representing the inline image.
 *
 * ```html
 * <span class="image-inline"><img></img></span>
 * ```
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @internal
 */ function createInlineImageViewElement(writer) {
    return writer.createContainerElement('span', {
        class: 'image-inline'
    }, writer.createEmptyElement('img'));
}
/**
 * Creates a view element representing the block image.
 *
 * ```html
 * <figure class="image"><img></img></figure>
 * ```
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @internal
 */ function createBlockImageViewElement(writer) {
    return writer.createContainerElement('figure', {
        class: 'image'
    }, [
        writer.createEmptyElement('img'),
        writer.createSlot('children')
    ]);
}
/**
 * A function returning a `MatcherPattern` for a particular type of View images.
 *
 * @internal
 * @param matchImageType The type of created image.
 */ function getImgViewElementMatcher(editor, matchImageType) {
    const imageUtils = editor.plugins.get('ImageUtils');
    const areBothImagePluginsLoaded = editor.plugins.has('ImageInlineEditing') && editor.plugins.has('ImageBlockEditing');
    return (element)=>{
        // Check if the matched view element is an <img>.
        if (!imageUtils.isInlineImageView(element)) {
            return null;
        }
        // If just one of the plugins is loaded (block or inline), it will match all kinds of images.
        if (!areBothImagePluginsLoaded) {
            return getPositiveMatchPattern(element);
        }
        // The <img> can be standalone, wrapped in <figure>...</figure> (ImageBlock plugin) or
        // wrapped in <figure><a>...</a></figure> (LinkImage plugin).
        const imageType = element.getStyle('display') == 'block' || element.findAncestor(imageUtils.isBlockImageView) ? 'imageBlock' : 'imageInline';
        if (imageType !== matchImageType) {
            return null;
        }
        return getPositiveMatchPattern(element);
    };
    function getPositiveMatchPattern(element) {
        const pattern = {
            name: true
        };
        // This will trigger src consumption (See https://github.com/ckeditor/ckeditor5/issues/11530).
        if (element.hasAttribute('src')) {
            pattern.attributes = [
                'src'
            ];
        }
        return pattern;
    }
}
/**
 * Considering the current model selection, it returns the name of the model image element
 * (`'imageBlock'` or `'imageInline'`) that will make most sense from the UX perspective if a new
 * image was inserted (also: uploaded, dropped, pasted) at that selection.
 *
 * The assumption is that inserting images into empty blocks or on other block widgets should
 * produce block images. Inline images should be inserted in other cases, e.g. in paragraphs
 * that already contain some text.
 *
 * @internal
 */ function determineImageTypeForInsertionAtSelection(schema, selection) {
    const firstBlock = first(selection.getSelectedBlocks());
    // Insert a block image if the selection is not in/on block elements or it's on a block widget.
    if (!firstBlock || schema.isObject(firstBlock)) {
        return 'imageBlock';
    }
    // A block image should also be inserted into an empty block element
    // (that is not an empty list item so the list won't get split).
    if (firstBlock.isEmpty && firstBlock.name != 'listItem') {
        return 'imageBlock';
    }
    // Otherwise insert an inline image.
    return 'imageInline';
}
/**
 * Returns parsed value of the size, but only if it contains unit: px.
 *
 * @internal
 */ function getSizeValueIfInPx(size) {
    if (size && size.endsWith('px')) {
        return parseInt(size);
    }
    return null;
}
/**
 * Returns true if both styles (width and height) are set.
 *
 * If both image styles: width & height are set, they will override the image width & height attributes in the
 * browser. In this case, the image looks the same as if these styles were applied to attributes instead of styles.
 * That's why we can upcast these styles to width & height attributes instead of resizedWidth and resizedHeight.
 *
 * @internal
 */ function widthAndHeightStylesAreBothSet(viewElement) {
    const widthStyle = getSizeValueIfInPx(viewElement.getStyle('width'));
    const heightStyle = getSizeValueIfInPx(viewElement.getStyle('height'));
    return !!(widthStyle && heightStyle);
}

const IMAGE_WIDGETS_CLASSES_MATCH_REGEXP = /^(image|image-inline)$/;
/**
 * A set of helpers related to images.
 */ class ImageUtils extends Plugin {
    /**
	 * DOM Emitter.
	 */ _domEmitter = new (DomEmitterMixin())();
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageUtils';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * Checks if the provided model element is an `image` or `imageInline`.
	 */ isImage(modelElement) {
        return this.isInlineImage(modelElement) || this.isBlockImage(modelElement);
    }
    /**
	 * Checks if the provided view element represents an inline image.
	 *
	 * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
	 */ isInlineImageView(element) {
        return !!element && element.is('element', 'img');
    }
    /**
	 * Checks if the provided view element represents a block image.
	 *
	 * Also, see {@link module:image/imageutils~ImageUtils#isImageWidget}.
	 */ isBlockImageView(element) {
        return !!element && element.is('element', 'figure') && element.hasClass('image');
    }
    /**
	 * Handles inserting single file. This method unifies image insertion using {@link module:widget/utils~findOptimalInsertionRange}
	 * method.
	 *
	 * ```ts
	 * const imageUtils = editor.plugins.get( 'ImageUtils' );
	 *
	 * imageUtils.insertImage( { src: 'path/to/image.jpg' } );
	 * ```
	 *
	 * @param attributes Attributes of the inserted image.
	 * This method filters out the attributes which are disallowed by the {@link module:engine/model/schema~ModelSchema}.
	 * @param selectable Place to insert the image. If not specified,
	 * the {@link module:widget/utils~findOptimalInsertionRange} logic will be applied for the block images
	 * and `model.document.selection` for the inline images.
	 *
	 * **Note**: If `selectable` is passed, this helper will not be able to set selection attributes (such as `linkHref`)
	 * and apply them to the new image. In this case, make sure all selection attributes are passed in `attributes`.
	 *
	 * @param imageType Image type of inserted image. If not specified,
	 * it will be determined automatically depending of editor config or place of the insertion.
	 * @param options.setImageSizes Specifies whether the image `width` and `height` attributes should be set automatically.
	 * The default is `true`.
	 * @return The inserted model image element.
	 */ insertImage(attributes = {}, selectable = null, imageType = null, options = {}) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const determinedImageType = determineImageTypeForInsertion(editor, selectable || selection, imageType);
        // Mix declarative attributes with selection attributes because the new image should "inherit"
        // the latter for best UX. For instance, inline images inserted into existing links
        // should not split them. To do that, they need to have "linkHref" inherited from the selection.
        attributes = {
            ...Object.fromEntries(selection.getAttributes()),
            ...attributes
        };
        for(const attributeName in attributes){
            if (!model.schema.checkAttribute(determinedImageType, attributeName)) {
                delete attributes[attributeName];
            }
        }
        return model.change((writer)=>{
            const { setImageSizes = true } = options;
            const imageElement = writer.createElement(determinedImageType, attributes);
            model.insertObject(imageElement, selectable, null, {
                setSelection: 'on',
                // If we want to insert a block image (for whatever reason) then we don't want to split text blocks.
                // This applies only when we don't have the selectable specified (i.e., we insert multiple block images at once).
                findOptimalPosition: !selectable && determinedImageType != 'imageInline' ? 'auto' : undefined
            });
            // Inserting an image might've failed due to schema regulations.
            if (imageElement.parent) {
                if (setImageSizes) {
                    this.setImageNaturalSizeAttributes(imageElement);
                }
                return imageElement;
            }
            return null;
        });
    }
    /**
	 * Reads original image sizes and sets them as `width` and `height`.
	 *
	 * The `src` attribute may not be available if the user is using an upload adapter. In such a case,
	 * this method is called again after the upload process is complete and the `src` attribute is available.
	 */ setImageNaturalSizeAttributes(imageElement) {
        const src = imageElement.getAttribute('src');
        if (!src) {
            return;
        }
        if (imageElement.getAttribute('width') || imageElement.getAttribute('height')) {
            return;
        }
        this.editor.model.change((writer)=>{
            const img = new global.window.Image();
            this._domEmitter.listenTo(img, 'load', ()=>{
                if (!imageElement.getAttribute('width') && !imageElement.getAttribute('height')) {
                    // We use writer.batch to be able to undo (in a single step) width and height setting
                    // along with any change that triggered this action (e.g. image resize or image style change).
                    this.editor.model.enqueueChange(writer.batch, (writer)=>{
                        writer.setAttribute('width', img.naturalWidth, imageElement);
                        writer.setAttribute('height', img.naturalHeight, imageElement);
                    });
                }
                this._domEmitter.stopListening(img, 'load');
            });
            img.src = src;
        });
    }
    /**
	 * Returns an image widget editing view element if one is selected or is among the selection's ancestors.
	 */ getClosestSelectedImageWidget(selection) {
        const selectionPosition = selection.getFirstPosition();
        if (!selectionPosition) {
            return null;
        }
        const viewElement = selection.getSelectedElement();
        if (viewElement && this.isImageWidget(viewElement)) {
            return viewElement;
        }
        let parent = selectionPosition.parent;
        while(parent){
            if (parent.is('element') && this.isImageWidget(parent)) {
                return parent;
            }
            parent = parent.parent;
        }
        return null;
    }
    /**
	 * Returns a image model element if one is selected or is among the selection's ancestors.
	 */ getClosestSelectedImageElement(selection) {
        const selectedElement = selection.getSelectedElement();
        return this.isImage(selectedElement) ? selectedElement : selection.getFirstPosition().findAncestor('imageBlock');
    }
    /**
	 * Returns an image widget editing view based on the passed image view.
	 */ getImageWidgetFromImageView(imageView) {
        return imageView.findAncestor({
            classes: IMAGE_WIDGETS_CLASSES_MATCH_REGEXP
        });
    }
    /**
	 * Checks if image can be inserted at current model selection.
	 *
	 * @internal
	 */ isImageAllowed() {
        const model = this.editor.model;
        const selection = model.document.selection;
        return isImageAllowedInParent(this.editor, selection) && isNotInsideImage(selection);
    }
    /**
	 * Converts a given {@link module:engine/view/element~ViewElement} to an image widget:
	 * * Adds a {@link module:engine/view/element~ViewElement#_setCustomProperty custom property} allowing to recognize the image widget
	 * element.
	 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
	 *
	 * @param writer An instance of the view writer.
	 * @param label The element's label. It will be concatenated with the image `alt` attribute if one is present.
	 */ toImageWidget(viewElement, writer, label) {
        writer.setCustomProperty('image', true, viewElement);
        const labelCreator = ()=>{
            const imgElement = this.findViewImgElement(viewElement);
            const altText = imgElement.getAttribute('alt');
            return altText ? `${altText} ${label}` : label;
        };
        return toWidget(viewElement, writer, {
            label: labelCreator
        });
    }
    /**
	 * Checks if a given view element is an image widget.
	 */ isImageWidget(viewElement) {
        return !!viewElement.getCustomProperty('image') && isWidget(viewElement);
    }
    /**
	 * Checks if the provided model element is an `image`.
	 */ isBlockImage(modelElement) {
        return !!modelElement && modelElement.is('element', 'imageBlock');
    }
    /**
	 * Checks if the provided model element is an `imageInline`.
	 */ isInlineImage(modelElement) {
        return !!modelElement && modelElement.is('element', 'imageInline');
    }
    /**
	 * Get the view `<img>` from another view element, e.g. a widget (`<figure class="image">`), a link (`<a>`).
	 *
	 * The `<img>` can be located deep in other elements, so this helper performs a deep tree search.
	 */ findViewImgElement(figureView) {
        if (this.isInlineImageView(figureView)) {
            return figureView;
        }
        const editingView = this.editor.editing.view;
        for (const { item } of editingView.createRangeIn(figureView)){
            if (this.isInlineImageView(item)) {
                return item;
            }
        }
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        this._domEmitter.stopListening();
        return super.destroy();
    }
}
/**
 * Checks if image is allowed by schema in optimal insertion parent.
 */ function isImageAllowedInParent(editor, selection) {
    const imageType = determineImageTypeForInsertion(editor, selection, null);
    if (imageType == 'imageBlock') {
        const parent = getInsertImageParent(selection, editor.model);
        if (editor.model.schema.checkChild(parent, 'imageBlock')) {
            return true;
        }
    } else if (editor.model.schema.checkChild(selection.focus, 'imageInline')) {
        return true;
    }
    return false;
}
/**
 * Checks if selection is not placed inside an image (e.g. its caption).
 */ function isNotInsideImage(selection) {
    return [
        ...selection.focus.getAncestors()
    ].every((ancestor)=>!ancestor.is('element', 'imageBlock'));
}
/**
 * Returns a node that will be used to insert image with `model.insertContent`.
 */ function getInsertImageParent(selection, model) {
    const insertionRange = findOptimalInsertionRange(selection, model);
    const parent = insertionRange.start.parent;
    if (parent.isEmpty && !parent.is('element', '$root')) {
        return parent.parent;
    }
    return parent;
}
/**
 * Determine image element type name depending on editor config or place of insertion.
 *
 * @param imageType Image element type name. Used to force return of provided element name,
 * but only if there is proper plugin enabled.
 */ function determineImageTypeForInsertion(editor, selectable, imageType) {
    const schema = editor.model.schema;
    const configImageInsertType = editor.config.get('image.insert.type');
    if (!editor.plugins.has('ImageBlockEditing')) {
        return 'imageInline';
    }
    if (!editor.plugins.has('ImageInlineEditing')) {
        return 'imageBlock';
    }
    if (imageType) {
        return imageType;
    }
    if (configImageInsertType === 'inline') {
        return 'imageInline';
    }
    if (configImageInsertType !== 'auto') {
        return 'imageBlock';
    }
    // Try to replace the selected widget (e.g. another image).
    if (selectable.is('selection')) {
        return determineImageTypeForInsertionAtSelection(schema, selectable);
    }
    return schema.checkChild(selectable, 'imageInline') ? 'imageInline' : 'imageBlock';
}

// Implements the pattern: http(s)://(www.)example.com/path/to/resource.ext?query=params&maybe=too.
const IMAGE_URL_REGEXP = new RegExp(String(/^(http(s)?:\/\/)?[\w-]+\.[\w.~:/[\]@!$&'()*+,;=%-]+/.source + /\.(jpg|jpeg|png|gif|ico|webp|JPG|JPEG|PNG|GIF|ICO|WEBP)/.source + /(\?[\w.~:/[\]@!$&'()*+,;=%-]*)?/.source + /(#[\w.~:/[\]@!$&'()*+,;=%-]*)?$/.source));
/**
 * The auto-image plugin. It recognizes image links in the pasted content and embeds
 * them shortly after they are injected into the document.
 */ class AutoImage extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Clipboard,
            ImageUtils,
            Undo,
            Delete
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'AutoImage';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * The paste–to–embed `setTimeout` ID. Stored as a property to allow
	 * cleaning of the timeout.
	 */ _timeoutId;
    /**
	 * The position where the `<imageBlock>` element will be inserted after the timeout,
	 * determined each time a new content is pasted into the document.
	 */ _positionToInsert;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._timeoutId = null;
        this._positionToInsert = null;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const modelDocument = editor.model.document;
        const clipboardPipeline = editor.plugins.get('ClipboardPipeline');
        // We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
        // After pasting, the content between those positions will be checked for a URL that could be transformed
        // into an image.
        this.listenTo(clipboardPipeline, 'inputTransformation', ()=>{
            const firstRange = modelDocument.selection.getFirstRange();
            const leftLivePosition = ModelLivePosition.fromPosition(firstRange.start);
            leftLivePosition.stickiness = 'toPrevious';
            const rightLivePosition = ModelLivePosition.fromPosition(firstRange.end);
            rightLivePosition.stickiness = 'toNext';
            modelDocument.once('change:data', ()=>{
                this._embedImageBetweenPositions(leftLivePosition, rightLivePosition);
                leftLivePosition.detach();
                rightLivePosition.detach();
            }, {
                priority: 'high'
            });
        });
        editor.commands.get('undo').on('execute', ()=>{
            if (this._timeoutId) {
                global.window.clearTimeout(this._timeoutId);
                this._positionToInsert.detach();
                this._timeoutId = null;
                this._positionToInsert = null;
            }
        }, {
            priority: 'high'
        });
    }
    /**
	 * Analyzes the part of the document between provided positions in search for a URL representing an image.
	 * When the URL is found, it is automatically converted into an image.
	 *
	 * @param leftPosition Left position of the selection.
	 * @param rightPosition Right position of the selection.
	 */ _embedImageBetweenPositions(leftPosition, rightPosition) {
        const editor = this.editor;
        // TODO: Use a marker instead of ModelLiveRange & LivePositions.
        const urlRange = new ModelLiveRange(leftPosition, rightPosition);
        const walker = urlRange.getWalker({
            ignoreElementEnd: true
        });
        const selectionAttributes = Object.fromEntries(editor.model.document.selection.getAttributes());
        const imageUtils = this.editor.plugins.get('ImageUtils');
        let src = '';
        for (const node of walker){
            if (node.item.is('$textProxy')) {
                src += node.item.data;
            }
        }
        src = src.trim();
        // If the URL does not match the image URL regexp, let's skip that.
        if (!src.match(IMAGE_URL_REGEXP)) {
            urlRange.detach();
            return;
        }
        // Position will not be available in the `setTimeout` function so let's clone it.
        this._positionToInsert = ModelLivePosition.fromPosition(leftPosition);
        // This action mustn't be executed if undo was called between pasting and auto-embedding.
        this._timeoutId = setTimeout(()=>{
            // Do nothing if image element cannot be inserted at the current position.
            // See https://github.com/ckeditor/ckeditor5/issues/2763.
            // Condition must be checked after timeout - pasting may take place on an element, replacing it. The final position matters.
            const imageCommand = editor.commands.get('insertImage');
            if (!imageCommand.isEnabled) {
                urlRange.detach();
                return;
            }
            editor.model.change((writer)=>{
                this._timeoutId = null;
                writer.remove(urlRange);
                urlRange.detach();
                let insertionPosition;
                // Check if the position where the element should be inserted is still valid.
                // Otherwise leave it as undefined to use the logic of insertImage().
                if (this._positionToInsert.root.rootName !== '$graveyard') {
                    insertionPosition = this._positionToInsert.toPosition();
                }
                imageUtils.insertImage({
                    ...selectionAttributes,
                    src
                }, insertionPosition);
                this._positionToInsert.detach();
                this._positionToInsert = null;
            });
            const deletePlugin = editor.plugins.get('Delete');
            deletePlugin.requestUndoOnBackspace();
        }, 100);
    }
}

/**
 * The image text alternative command. It is used to change the `alt` attribute of `<imageBlock>` and `<imageInline>` model elements.
 */ class ImageTextAlternativeCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const element = imageUtils.getClosestSelectedImageElement(this.editor.model.document.selection);
        this.isEnabled = !!element;
        if (this.isEnabled && element.hasAttribute('alt')) {
            this.value = element.getAttribute('alt');
        } else {
            this.value = false;
        }
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options
	 * @param options.newValue The new value of the `alt` attribute to set.
	 */ execute(options) {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const model = editor.model;
        const imageElement = imageUtils.getClosestSelectedImageElement(model.document.selection);
        model.change((writer)=>{
            writer.setAttribute('alt', options.newValue, imageElement);
        });
    }
}

/**
 * The image text alternative editing plugin.
 *
 * Registers the `'imageTextAlternative'` command.
 */ class ImageTextAlternativeEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageTextAlternativeEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        this.editor.commands.add('imageTextAlternative', new ImageTextAlternativeCommand(this.editor));
    }
}

/**
 * The TextAlternativeFormView class.
 *
 * @internal
 */ class TextAlternativeFormView extends View {
    /**
	 * Tracks information about the DOM focus in the form.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * An input with a label.
	 */ labeledInput;
    /**
	 * The Back button view displayed in the header.
	 */ backButtonView;
    /**
	 * A button used to submit the form.
	 */ saveButtonView;
    /**
	 * A collection of child views.
	 */ children;
    /**
	 * A collection of views which can be focused in the form.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * @inheritDoc
	 */ constructor(locale){
        super(locale);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        // Create buttons.
        this.backButtonView = this._createBackButton();
        this.saveButtonView = this._createSaveButton();
        // Create input fields.
        this.labeledInput = this._createLabeledInputView();
        this.children = this.createCollection([
            this._createHeaderView()
        ]);
        this.children.add(new FormRowView(locale, {
            children: [
                this.labeledInput,
                this.saveButtonView
            ],
            class: [
                'ck-form__row_with-submit',
                'ck-form__row_large-top-padding'
            ]
        }));
        this._focusables = new ViewCollection();
        // Close the panel on esc key press when the **form has focus**.
        this.keystrokes.set('Esc', (data, cancel)=>{
            this.fire('cancel');
            cancel();
        });
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-text-alternative-form',
                    'ck-responsive-form'
                ],
                // https://github.com/ckeditor/ckeditor5-image/issues/40
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        submitHandler({
            view: this
        });
        const childViews = [
            this.backButtonView,
            this.labeledInput,
            this.saveButtonView
        ];
        childViews.forEach((v)=>{
            // Register the view as focusable.
            this._focusables.add(v);
            // Register the view in the focus tracker.
            this.focusTracker.add(v.element);
        });
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Creates a back button view that cancels the form.
	 */ _createBackButton() {
        const t = this.locale.t;
        const backButton = new ButtonView(this.locale);
        backButton.set({
            class: 'ck-button-back',
            label: t('Back'),
            icon: IconPreviousArrow,
            tooltip: true
        });
        backButton.delegate('execute').to(this, 'cancel');
        return backButton;
    }
    /**
	 * Creates a save button view that text alternative the image.
	 */ _createSaveButton() {
        const t = this.locale.t;
        const saveButton = new ButtonView(this.locale);
        saveButton.set({
            label: t('Save'),
            withText: true,
            type: 'submit',
            class: 'ck-button-action ck-button-bold'
        });
        return saveButton;
    }
    /**
	 * Creates a header view for the form.
	 */ _createHeaderView() {
        const t = this.locale.t;
        const header = new FormHeaderView(this.locale, {
            label: t('Text Alternative')
        });
        header.children.add(this.backButtonView, 0);
        return header;
    }
    /**
	 * Creates an input with a label.
	 *
	 * @returns Labeled field view instance.
	 */ _createLabeledInputView() {
        const t = this.locale.t;
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
        labeledInput.label = t('Text alternative');
        labeledInput.class = 'ck-labeled-field-view_full-width';
        return labeledInput;
    }
}

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the image in the editor content, if one is selected.
 *
 * @param editor The editor instance.
 * @internal
 */ function repositionContextualBalloon(editor) {
    const balloon = editor.plugins.get('ContextualBalloon');
    const imageUtils = editor.plugins.get('ImageUtils');
    if (imageUtils.getClosestSelectedImageWidget(editor.editing.view.document.selection)) {
        const position = getBalloonPositionData(editor);
        balloon.updatePosition(position);
    }
}
/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected element in the editor content.
 *
 * @param editor The editor instance.
 * @internal
 */ function getBalloonPositionData(editor) {
    const editingView = editor.editing.view;
    const defaultPositions = BalloonPanelView.defaultPositions;
    const imageUtils = editor.plugins.get('ImageUtils');
    return {
        target: editingView.domConverter.mapViewToDom(imageUtils.getClosestSelectedImageWidget(editingView.document.selection)),
        positions: [
            defaultPositions.northArrowSouth,
            defaultPositions.northArrowSouthWest,
            defaultPositions.northArrowSouthEast,
            defaultPositions.southArrowNorth,
            defaultPositions.southArrowNorthWest,
            defaultPositions.southArrowNorthEast,
            defaultPositions.viewportStickyNorth
        ]
    };
}

/**
 * The image text alternative UI plugin.
 *
 * The plugin uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 */ class ImageTextAlternativeUI extends Plugin {
    /**
	 * The contextual balloon plugin instance.
	 */ _balloon;
    /**
	 * A form containing a textarea and buttons, used to change the `alt` text value.
	 */ _form;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ContextualBalloon
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageTextAlternativeUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        this._createButton();
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
        if (this._form) {
            this._form.destroy();
        }
    }
    /**
	 * Creates a button showing the balloon panel for changing the image text alternative and
	 * registers it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 */ _createButton() {
        const editor = this.editor;
        const t = editor.t;
        editor.ui.componentFactory.add('imageTextAlternative', (locale)=>{
            const command = editor.commands.get('imageTextAlternative');
            const view = new ButtonView(locale);
            view.set({
                label: t('Change image text alternative'),
                icon: IconTextAlternative,
                tooltip: true
            });
            view.bind('isEnabled').to(command, 'isEnabled');
            view.bind('isOn').to(command, 'value', (value)=>!!value);
            this.listenTo(view, 'execute', ()=>{
                this._showForm();
            });
            return view;
        });
    }
    /**
	 * Creates the {@link module:image/imagetextalternative/ui/textalternativeformview~TextAlternativeFormView}
	 * form.
	 */ _createForm() {
        const editor = this.editor;
        const view = editor.editing.view;
        const viewDocument = view.document;
        const imageUtils = editor.plugins.get('ImageUtils');
        this._balloon = this.editor.plugins.get('ContextualBalloon');
        this._form = new (CssTransitionDisablerMixin(TextAlternativeFormView))(editor.locale);
        // Render the form so its #element is available for clickOutsideHandler.
        this._form.render();
        this.listenTo(this._form, 'submit', ()=>{
            editor.execute('imageTextAlternative', {
                newValue: this._form.labeledInput.fieldView.element.value
            });
            this._hideForm(true);
        });
        this.listenTo(this._form, 'cancel', ()=>{
            this._hideForm(true);
        });
        // Reposition the balloon or hide the form if an image widget is no longer selected.
        this.listenTo(editor.ui, 'update', ()=>{
            if (!imageUtils.getClosestSelectedImageWidget(viewDocument.selection)) {
                this._hideForm(true);
            } else if (this._isVisible) {
                repositionContextualBalloon(editor);
            }
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: this._form,
            activator: ()=>this._isVisible,
            contextElements: ()=>[
                    this._balloon.view.element
                ],
            callback: ()=>this._hideForm()
        });
    }
    /**
	 * Shows the {@link #_form} in the {@link #_balloon}.
	 */ _showForm() {
        if (this._isVisible) {
            return;
        }
        if (!this._form) {
            this._createForm();
        }
        const editor = this.editor;
        const command = editor.commands.get('imageTextAlternative');
        const labeledInput = this._form.labeledInput;
        this._form.disableCssTransitions();
        if (!this._isInBalloon) {
            this._balloon.add({
                view: this._form,
                position: getBalloonPositionData(editor)
            });
        }
        // Make sure that each time the panel shows up, the field remains in sync with the value of
        // the command. If the user typed in the input, then canceled the balloon (`labeledInput#value`
        // stays unaltered) and re-opened it without changing the value of the command, they would see the
        // old value instead of the actual value of the command.
        // https://github.com/ckeditor/ckeditor5-image/issues/114
        labeledInput.fieldView.value = labeledInput.fieldView.element.value = command.value || '';
        this._form.labeledInput.fieldView.select();
        this._form.enableCssTransitions();
    }
    /**
	 * Removes the {@link #_form} from the {@link #_balloon}.
	 *
	 * @param focusEditable Controls whether the editing view is focused afterwards.
	 */ _hideForm(focusEditable = false) {
        if (!this._isInBalloon) {
            return;
        }
        // Blur the input element before removing it from DOM to prevent issues in some browsers.
        // See https://github.com/ckeditor/ckeditor5/issues/1501.
        if (this._form.focusTracker.isFocused) {
            this._form.saveButtonView.focus();
        }
        this._balloon.remove(this._form);
        if (focusEditable) {
            this.editor.editing.view.focus();
        }
    }
    /**
	 * Returns `true` when the {@link #_form} is the visible view in the {@link #_balloon}.
	 */ get _isVisible() {
        return !!this._balloon && this._balloon.visibleView === this._form;
    }
    /**
	 * Returns `true` when the {@link #_form} is in the {@link #_balloon}.
	 */ get _isInBalloon() {
        return !!this._balloon && this._balloon.hasView(this._form);
    }
}

/**
 * The image text alternative plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-styles image styles} documentation.
 *
 * This is a "glue" plugin which loads the
 *  {@link module:image/imagetextalternative/imagetextalternativeediting~ImageTextAlternativeEditing}
 * and {@link module:image/imagetextalternative/imagetextalternativeui~ImageTextAlternativeUI} plugins.
 */ class ImageTextAlternative extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageTextAlternativeEditing,
            ImageTextAlternativeUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageTextAlternative';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * Returns a function that converts the image view representation:
 *
 * ```html
 * <figure class="image"><img src="..." alt="..."></img></figure>
 * ```
 *
 * to the model representation:
 *
 * ```html
 * <imageBlock src="..." alt="..."></imageBlock>
 * ```
 *
 * The entire content of the `<figure>` element except the first `<img>` is being converted as children
 * of the `<imageBlock>` model element.
 *
 * @internal
 */ function upcastImageFigure(imageUtils) {
    const converter = (evt, data, conversionApi)=>{
        // Do not convert if this is not an "image figure".
        if (!conversionApi.consumable.test(data.viewItem, {
            name: true,
            classes: 'image'
        })) {
            return;
        }
        // Find an image element inside the figure element.
        const viewImage = imageUtils.findViewImgElement(data.viewItem);
        // Do not convert if image element is absent or was already converted.
        if (!viewImage || !conversionApi.consumable.test(viewImage, {
            name: true
        })) {
            return;
        }
        // Consume the figure to prevent other converters from processing it again.
        conversionApi.consumable.consume(data.viewItem, {
            name: true,
            classes: 'image'
        });
        // Convert view image to model image.
        const conversionResult = conversionApi.convertItem(viewImage, data.modelCursor);
        // Get image element from conversion result.
        const modelImage = first(conversionResult.modelRange.getItems());
        // When image wasn't successfully converted then finish conversion.
        if (!modelImage) {
            // Revert consumed figure so other features can convert it.
            conversionApi.consumable.revert(data.viewItem, {
                name: true,
                classes: 'image'
            });
            return;
        }
        // Convert rest of the figure element's children as an image children.
        conversionApi.convertChildren(data.viewItem, modelImage);
        conversionApi.updateConversionResult(modelImage, data);
    };
    return (dispatcher)=>{
        dispatcher.on('element:figure', converter);
    };
}
/**
 * Returns a function that converts the image view representation:
 *
 * ```html
 * <picture><source ... /><source ... />...<img ... /></picture>
 * ```
 *
 * to the model representation as the `sources` attribute:
 *
 * ```html
 * <image[Block|Inline] ... sources="..."></image[Block|Inline]>
 * ```
 *
 * @internal
 */ function upcastPicture(imageUtils) {
    const sourceAttributeNames = [
        'srcset',
        'media',
        'type',
        'sizes'
    ];
    const converter = (evt, data, conversionApi)=>{
        const pictureViewElement = data.viewItem;
        // Do not convert <picture> if already consumed.
        if (!conversionApi.consumable.test(pictureViewElement, {
            name: true
        })) {
            return;
        }
        const sources = new Map();
        // Collect all <source /> elements attribute values.
        for (const childSourceElement of pictureViewElement.getChildren()){
            if (childSourceElement.is('element', 'source')) {
                const attributes = {};
                for (const name of sourceAttributeNames){
                    if (childSourceElement.hasAttribute(name)) {
                        // Don't collect <source /> attribute if already consumed somewhere else.
                        if (conversionApi.consumable.test(childSourceElement, {
                            attributes: name
                        })) {
                            attributes[name] = childSourceElement.getAttribute(name);
                        }
                    }
                }
                if (Object.keys(attributes).length) {
                    sources.set(childSourceElement, attributes);
                }
            }
        }
        const imgViewElement = imageUtils.findViewImgElement(pictureViewElement);
        // Don't convert when a picture has no <img/> inside (it is broken).
        if (!imgViewElement) {
            return;
        }
        let modelImage = data.modelCursor.parent;
        // - In case of an inline image (cursor parent in a <paragraph>), the <img/> must be converted right away
        // because no converter handled it yet and otherwise there would be no model element to set the sources attribute on.
        // - In case of a block image, the <figure class="image"> converter (in ImageBlockEditing) converts the
        // <img/> right away on its own and the modelCursor is already inside an imageBlock and there's nothing special
        // to do here.
        if (!modelImage.is('element', 'imageBlock')) {
            const conversionResult = conversionApi.convertItem(imgViewElement, data.modelCursor);
            // Set image range as conversion result.
            data.modelRange = conversionResult.modelRange;
            // Continue conversion where image conversion ends.
            data.modelCursor = conversionResult.modelCursor;
            modelImage = first(conversionResult.modelRange.getItems());
        }
        conversionApi.consumable.consume(pictureViewElement, {
            name: true
        });
        // Consume only these <source/> attributes that were actually collected and will be passed on
        // to the image model element.
        for (const [sourceElement, attributes] of sources){
            conversionApi.consumable.consume(sourceElement, {
                attributes: Object.keys(attributes)
            });
        }
        if (sources.size) {
            conversionApi.writer.setAttribute('sources', Array.from(sources.values()), modelImage);
        }
        // Convert rest of the <picture> children as an image children. Other converters may want to consume them.
        conversionApi.convertChildren(pictureViewElement, modelImage);
    };
    return (dispatcher)=>{
        dispatcher.on('element:picture', converter);
    };
}
/**
 * Converter used to convert the `srcset` model image attribute to the `srcset` and `sizes` attributes in the view.
 *
 * @internal
 * @param imageType The type of the image.
 */ function downcastSrcsetAttribute(imageUtils, imageType) {
    const converter = (evt, data, conversionApi)=>{
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }
        const writer = conversionApi.writer;
        const element = conversionApi.mapper.toViewElement(data.item);
        const img = imageUtils.findViewImgElement(element);
        if (data.attributeNewValue === null) {
            writer.removeAttribute('srcset', img);
            writer.removeAttribute('sizes', img);
        } else {
            if (data.attributeNewValue) {
                writer.setAttribute('srcset', data.attributeNewValue, img);
                // Always outputting `100vw`. See https://github.com/ckeditor/ckeditor5-image/issues/2.
                writer.setAttribute('sizes', '100vw', img);
            }
        }
    };
    return (dispatcher)=>{
        dispatcher.on(`attribute:srcset:${imageType}`, converter);
    };
}
/**
 * Converts the `source` model attribute to the `<picture><source /><source />...<img /></picture>`
 * view structure.
 *
 * @internal
 */ function downcastSourcesAttribute(imageUtils) {
    const converter = (evt, data, conversionApi)=>{
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }
        const viewWriter = conversionApi.writer;
        const element = conversionApi.mapper.toViewElement(data.item);
        const imgElement = imageUtils.findViewImgElement(element);
        const attributeNewValue = data.attributeNewValue;
        if (attributeNewValue && attributeNewValue.length) {
            // Collect all wrapping attribute elements.
            const attributeElements = [];
            let viewElement = imgElement.parent;
            while(viewElement && viewElement.is('attributeElement')){
                const parentElement = viewElement.parent;
                viewWriter.unwrap(viewWriter.createRangeOn(imgElement), viewElement);
                attributeElements.unshift(viewElement);
                viewElement = parentElement;
            }
            const hasPictureElement = imgElement.parent.is('element', 'picture');
            // Reuse existing <picture> element (ckeditor5#17192) or create a new one.
            const pictureElement = hasPictureElement ? imgElement.parent : viewWriter.createContainerElement('picture', null);
            if (!hasPictureElement) {
                viewWriter.insert(viewWriter.createPositionBefore(imgElement), pictureElement);
            }
            viewWriter.remove(viewWriter.createRangeIn(pictureElement));
            viewWriter.insert(viewWriter.createPositionAt(pictureElement, 'end'), attributeNewValue.map((sourceAttributes)=>{
                return viewWriter.createEmptyElement('source', sourceAttributes);
            }));
            viewWriter.move(viewWriter.createRangeOn(imgElement), viewWriter.createPositionAt(pictureElement, 'end'));
            // Apply collected attribute elements over the new picture element.
            for (const attributeElement of attributeElements){
                viewWriter.wrap(viewWriter.createRangeOn(pictureElement), attributeElement);
            }
        } else if (imgElement.parent.is('element', 'picture')) {
            const pictureElement = imgElement.parent;
            viewWriter.move(viewWriter.createRangeOn(imgElement), viewWriter.createPositionBefore(pictureElement));
            viewWriter.remove(pictureElement);
        }
    };
    return (dispatcher)=>{
        dispatcher.on('attribute:sources:imageBlock', converter);
        dispatcher.on('attribute:sources:imageInline', converter);
    };
}
/**
 * Converter used to convert a given image attribute from the model to the view.
 *
 * @internal
 * @param imageType The type of the image.
 * @param attributeKey The name of the attribute to convert.
 */ function downcastImageAttribute(imageUtils, imageType, attributeKey) {
    const converter = (evt, data, conversionApi)=>{
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }
        const viewWriter = conversionApi.writer;
        const element = conversionApi.mapper.toViewElement(data.item);
        const img = imageUtils.findViewImgElement(element);
        viewWriter.setAttribute(data.attributeKey, data.attributeNewValue || '', img);
    };
    return (dispatcher)=>{
        dispatcher.on(`attribute:${attributeKey}:${imageType}`, converter);
    };
}

/**
 * Observes all new images added to the {@link module:engine/view/document~ViewDocument},
 * fires {@link module:engine/view/document~ViewDocument#event:imageLoaded} and
 * {@link module:engine/view/document~ViewDocument#event:layoutChanged} event every time when the new image
 * has been loaded.
 *
 * **Note:** This event is not fired for images that has been added to the document and rendered as `complete` (already loaded).
 */ class ImageLoadObserver extends Observer {
    /**
	 * @inheritDoc
	 */ observe(domRoot) {
        this.listenTo(domRoot, 'load', (event, domEvent)=>{
            const domElement = domEvent.target;
            if (this.checkShouldIgnoreEventFromTarget(domElement)) {
                return;
            }
            if (domElement.tagName == 'IMG') {
                this._fireEvents(domEvent);
            }
        // Use capture phase for better performance (#4504).
        }, {
            useCapture: true
        });
    }
    /**
	 * @inheritDoc
	 */ stopObserving(domRoot) {
        this.stopListening(domRoot);
    }
    /**
	 * Fires {@link module:engine/view/document~ViewDocument#event:layoutChanged} and
	 * {@link module:engine/view/document~ViewDocument#event:imageLoaded}
	 * if observer {@link #isEnabled is enabled}.
	 *
	 * @param domEvent The DOM event.
	 */ _fireEvents(domEvent) {
        if (this.isEnabled) {
            this.document.fire('layoutChanged');
            this.document.fire('imageLoaded', domEvent);
        }
    }
}

/**
 * Insert image command.
 *
 * The command is registered by the {@link module:image/image/imageediting~ImageEditing} plugin as `insertImage`
 * and it is also available via aliased `imageInsert` name.
 *
 * In order to insert an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionRange} algorithm),
 * execute the command and specify the image source:
 *
 * ```ts
 * editor.execute( 'insertImage', { source: 'http://url.to.the/image' } );
 * ```
 *
 * It is also possible to insert multiple images at once:
 *
 * ```ts
 * editor.execute( 'insertImage', {
 * 	source:  [
 * 		'path/to/image.jpg',
 * 		'path/to/other-image.jpg'
 * 	]
 * } );
 * ```
 *
 * If you want to take the full control over the process, you can specify individual model attributes:
 *
 * ```ts
 * editor.execute( 'insertImage', {
 * 	source:  [
 * 		{ src: 'path/to/image.jpg', alt: 'First alt text' },
 * 		{ src: 'path/to/other-image.jpg', alt: 'Second alt text', customAttribute: 'My attribute value' }
 * 	]
 * } );
 * ```
 */ class InsertImageCommand extends Command {
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        const configImageInsertType = editor.config.get('image.insert.type');
        if (!editor.plugins.has('ImageBlockEditing')) {
            if (configImageInsertType === 'block') {
                /**
				 * The {@link module:image/imageblock~ImageBlock} plugin must be enabled to allow inserting block images. See
				 * {@link module:image/imageconfig~ImageInsertConfig#type} to learn more.
				 *
				 * @error image-block-plugin-required
				 */ logWarning('image-block-plugin-required');
            }
        }
        if (!editor.plugins.has('ImageInlineEditing')) {
            if (configImageInsertType === 'inline') {
                /**
				 * The {@link module:image/imageinline~ImageInline} plugin must be enabled to allow inserting inline images. See
				 * {@link module:image/imageconfig~ImageInsertConfig#type} to learn more.
				 *
				 * @error image-inline-plugin-required
				 */ logWarning('image-inline-plugin-required');
            }
        }
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const imageUtils = this.editor.plugins.get('ImageUtils');
        this.isEnabled = imageUtils.isImageAllowed();
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Options for the executed command.
	 * @param options.imageType The type of the image to insert. If not specified, the type will be determined automatically.
	 * @param options.source The image source or an array of image sources to insert.
	 * @param options.breakBlock If set to `true`, the block at the selection start will be broken before inserting the image.
	 * See the documentation of the command to learn more about accepted formats.
	 */ execute(options) {
        const sourceDefinitions = toArray(options.source);
        const selection = this.editor.model.document.selection;
        const imageUtils = this.editor.plugins.get('ImageUtils');
        // In case of multiple images, each image (starting from the 2nd) will be inserted at a position that
        // follows the previous one. That will move the selection and, to stay on the safe side and make sure
        // all images inherit the same selection attributes, they are collected beforehand.
        //
        // Applying these attributes ensures, for instance, that inserting an (inline) image into a link does
        // not split that link but preserves its continuity.
        //
        // Note: Selection attributes that do not make sense for images will be filtered out by insertImage() anyway.
        const selectionAttributes = Object.fromEntries(selection.getAttributes());
        sourceDefinitions.forEach((sourceDefinition, index)=>{
            const selectedElement = selection.getSelectedElement();
            if (typeof sourceDefinition === 'string') {
                sourceDefinition = {
                    src: sourceDefinition
                };
            }
            // Inserting of an inline image replace the selected element and make a selection on the inserted image.
            // Therefore inserting multiple inline images requires creating position after each element.
            if (index && selectedElement && imageUtils.isImage(selectedElement)) {
                const position = this.editor.model.createPositionAfter(selectedElement);
                imageUtils.insertImage({
                    ...sourceDefinition,
                    ...selectionAttributes
                }, position, options.imageType);
            } else if (options.breakBlock) {
                imageUtils.insertImage({
                    ...sourceDefinition,
                    ...selectionAttributes
                }, selection.getFirstPosition(), options.imageType);
            } else {
                imageUtils.insertImage({
                    ...sourceDefinition,
                    ...selectionAttributes
                }, null, options.imageType);
            }
        });
    }
}

/**
 * @module image/image/replaceimagesourcecommand
 */ /**
 * Replace image source command.
 *
 * Changes image source to the one provided. Can be executed as follows:
 *
 * ```ts
 * editor.execute( 'replaceImageSource', { source: 'http://url.to.the/image' } );
 * ```
 */ class ReplaceImageSourceCommand extends Command {
    constructor(editor){
        super(editor);
        this.decorate('cleanupImage');
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const element = this.editor.model.document.selection.getSelectedElement();
        this.isEnabled = imageUtils.isImage(element);
        this.value = this.isEnabled ? element.getAttribute('src') : null;
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Options for the executed command.
	 * @param options.source The image source to replace.
	 */ execute(options) {
        const image = this.editor.model.document.selection.getSelectedElement();
        const imageUtils = this.editor.plugins.get('ImageUtils');
        this.editor.model.change((writer)=>{
            writer.setAttribute('src', options.source, image);
            this.cleanupImage(writer, image);
            imageUtils.setImageNaturalSizeAttributes(image);
        });
    }
    /**
	 * Cleanup image attributes that are not relevant to the new source.
	 *
	 * Removed attributes are: 'srcset', 'sizes', 'sources', 'width', 'height', 'alt'.
	 *
	 * This method is decorated, to allow custom cleanup logic.
	 * For example, to remove 'myImageId' attribute after 'src' has changed:
	 *
	 * ```ts
	 * replaceImageSourceCommand.on( 'cleanupImage', ( eventInfo, [ writer, image ] ) => {
	 * 	writer.removeAttribute( 'myImageId', image );
	 * } );
	 * ```
	 */ cleanupImage(writer, image) {
        writer.removeAttribute('srcset', image);
        writer.removeAttribute('sizes', image);
        /**
		 * In case responsive images some attributes should be cleaned up.
		 * Check: https://github.com/ckeditor/ckeditor5/issues/15093
		 */ writer.removeAttribute('sources', image);
        writer.removeAttribute('width', image);
        writer.removeAttribute('height', image);
        writer.removeAttribute('alt', image);
    }
}

/**
 * The image engine plugin. This module loads common code shared between
 * {@link module:image/image/imageinlineediting~ImageInlineEditing} and
 * {@link module:image/image/imageblockediting~ImageBlockEditing} plugins.
 *
 * This plugin registers the {@link module:image/image/insertimagecommand~InsertImageCommand 'insertImage'} command.
 */ class ImageEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const conversion = editor.conversion;
        // See https://github.com/ckeditor/ckeditor5-image/issues/142.
        editor.editing.view.addObserver(ImageLoadObserver);
        conversion.for('upcast').attributeToAttribute({
            view: {
                name: 'img',
                key: 'alt'
            },
            model: 'alt'
        }).attributeToAttribute({
            view: {
                name: 'img',
                key: 'srcset'
            },
            model: 'srcset'
        });
        const insertImageCommand = new InsertImageCommand(editor);
        const replaceImageSourceCommand = new ReplaceImageSourceCommand(editor);
        editor.commands.add('insertImage', insertImageCommand);
        editor.commands.add('replaceImageSource', replaceImageSourceCommand);
        // `imageInsert` is an alias for backward compatibility.
        editor.commands.add('imageInsert', insertImageCommand);
    }
}

/**
 * This plugin enables `width` and `height` attributes in inline and block image elements.
 */ class ImageSizeAttributes extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageSizeAttributes';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        this._registerSchema();
        this._registerConverters('imageBlock');
        this._registerConverters('imageInline');
    }
    /**
	 * Registers the `width` and `height` attributes for inline and block images.
	 */ _registerSchema() {
        const schema = this.editor.model.schema;
        if (this.editor.plugins.has('ImageBlockEditing')) {
            schema.extend('imageBlock', {
                allowAttributes: [
                    'width',
                    'height'
                ]
            });
        }
        if (this.editor.plugins.has('ImageInlineEditing')) {
            schema.extend('imageInline', {
                allowAttributes: [
                    'width',
                    'height'
                ]
            });
        }
    }
    /**
	 * Registers converters for `width` and `height` attributes.
	 */ _registerConverters(imageType) {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const viewElementName = imageType === 'imageBlock' ? 'figure' : 'img';
        editor.conversion.for('upcast').attributeToAttribute({
            view: {
                name: viewElementName,
                styles: {
                    width: /.+/
                }
            },
            model: {
                key: 'width',
                value: (viewElement)=>{
                    if (widthAndHeightStylesAreBothSet(viewElement)) {
                        return getSizeValueIfInPx(viewElement.getStyle('width'));
                    }
                    return null;
                }
            }
        }).attributeToAttribute({
            view: {
                name: viewElementName,
                key: 'width'
            },
            model: 'width'
        }).attributeToAttribute({
            view: {
                name: viewElementName,
                styles: {
                    height: /.+/
                }
            },
            model: {
                key: 'height',
                value: (viewElement)=>{
                    if (widthAndHeightStylesAreBothSet(viewElement)) {
                        return getSizeValueIfInPx(viewElement.getStyle('height'));
                    }
                    return null;
                }
            }
        }).attributeToAttribute({
            view: {
                name: viewElementName,
                key: 'height'
            },
            model: 'height'
        });
        // Dedicated converters to propagate attributes to the <img> element.
        editor.conversion.for('editingDowncast').add((dispatcher)=>{
            attachDowncastConverter(dispatcher, 'width', 'width', true, true);
            attachDowncastConverter(dispatcher, 'height', 'height', true, true);
        });
        editor.conversion.for('dataDowncast').add((dispatcher)=>{
            attachDowncastConverter(dispatcher, 'width', 'width', false);
            attachDowncastConverter(dispatcher, 'height', 'height', false);
        });
        // Consume `aspect-ratio` style if `width` and `height` attributes are set on the image.
        editor.conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on('element:img', (evt, data, conversionApi)=>{
                const width = data.viewItem.getAttribute('width');
                const height = data.viewItem.getAttribute('height');
                if (width && height) {
                    conversionApi.consumable.consume(data.viewItem, {
                        styles: [
                            'aspect-ratio'
                        ]
                    });
                }
            });
        });
        function attachDowncastConverter(dispatcher, modelAttributeName, viewAttributeName, setRatioForInlineImage, isEditingDowncast = false) {
            dispatcher.on(`attribute:${modelAttributeName}:${imageType}`, (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.consume(data.item, evt.name)) {
                    return;
                }
                const viewWriter = conversionApi.writer;
                const viewElement = conversionApi.mapper.toViewElement(data.item);
                const img = imageUtils.findViewImgElement(viewElement);
                if (data.attributeNewValue !== null) {
                    viewWriter.setAttribute(viewAttributeName, data.attributeNewValue, img);
                } else {
                    viewWriter.removeAttribute(viewAttributeName, img);
                }
                const width = data.item.getAttribute('width');
                const height = data.item.getAttribute('height');
                const hasSizes = width && height;
                if (hasSizes && isEditingDowncast) {
                    viewWriter.setAttribute('loading', 'lazy', img);
                }
                // Do not set aspect-ratio for pictures. See https://github.com/ckeditor/ckeditor5/issues/14579.
                if (data.item.hasAttribute('sources')) {
                    return;
                }
                const isResized = data.item.hasAttribute('resizedWidth');
                // Do not set aspect ratio for inline images which are not resized (data pipeline).
                if (imageType === 'imageInline' && !isResized && !setRatioForInlineImage) {
                    return;
                }
                if (hasSizes) {
                    viewWriter.setStyle('aspect-ratio', `${width}/${height}`, img);
                }
            });
        }
    }
}

/**
 * The image type command. It changes the type of a selected image, depending on the configuration.
 */ class ImageTypeCommand extends Command {
    /**
	 * Model element name the command converts to.
	 */ _modelElementName;
    /**
	 * @inheritDoc
	 *
	 * @param modelElementName Model element name the command converts to.
	 */ constructor(editor, modelElementName){
        super(editor);
        this._modelElementName = modelElementName;
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const element = imageUtils.getClosestSelectedImageElement(this.editor.model.document.selection);
        if (this._modelElementName === 'imageBlock') {
            this.isEnabled = imageUtils.isInlineImage(element);
        } else {
            this.isEnabled = imageUtils.isBlockImage(element);
        }
    }
    /**
	 * Executes the command and changes the type of a selected image.
	 *
	 * @fires execute
	 * @param options.setImageSizes Specifies whether the image `width` and `height` attributes should be set automatically.
	 * The default is `true`.
	 * @returns An object containing references to old and new model image elements
	 * (for before and after the change) so external integrations can hook into the decorated
	 * `execute` event and handle this change. `null` if the type change failed.
	 */ execute(options = {}) {
        const editor = this.editor;
        const model = this.editor.model;
        const imageUtils = editor.plugins.get('ImageUtils');
        const oldElement = imageUtils.getClosestSelectedImageElement(model.document.selection);
        const attributes = Object.fromEntries(oldElement.getAttributes());
        // Don't change image type if "src" is missing (a broken image), unless there's "uploadId" set.
        // This state may happen during image upload (before it finishes) and it should be possible to change type
        // of the image in the meantime.
        if (!attributes.src && !attributes.uploadId) {
            return null;
        }
        return model.change((writer)=>{
            const { setImageSizes = true } = options;
            // Get all markers that contain the old image element.
            const markers = Array.from(model.markers).filter((marker)=>marker.getRange().containsItem(oldElement));
            const newElement = imageUtils.insertImage(attributes, model.createSelection(oldElement, 'on'), this._modelElementName, {
                setImageSizes
            });
            if (!newElement) {
                return null;
            }
            const newElementRange = writer.createRangeOn(newElement);
            // Expand the previously intersecting markers' ranges to include the new image element.
            for (const marker of markers){
                const markerRange = marker.getRange();
                // Join the survived part of the old marker range with the new element range
                // (loosely because there could be some new paragraph or the existing one might got split).
                const range = markerRange.root.rootName != '$graveyard' ? markerRange.getJoined(newElementRange, true) : newElementRange;
                writer.updateMarker(marker, {
                    range
                });
            }
            return {
                oldElement,
                newElement
            };
        });
    }
}

/**
 * Adds support for image placeholder that is automatically removed when the image is loaded.
 */ class ImagePlaceholder extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImagePlaceholder';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        this._setupSchema();
        this._setupConversion();
        this._setupLoadListener();
    }
    /**
	 * Extends model schema.
	 */ _setupSchema() {
        const schema = this.editor.model.schema;
        // Wait for ImageBlockEditing or ImageInlineEditing to register their elements first,
        // that's why doing this in afterInit() instead of init().
        if (schema.isRegistered('imageBlock')) {
            schema.extend('imageBlock', {
                allowAttributes: [
                    'placeholder'
                ]
            });
        }
        if (schema.isRegistered('imageInline')) {
            schema.extend('imageInline', {
                allowAttributes: [
                    'placeholder'
                ]
            });
        }
    }
    /**
	 * Registers converters.
	 */ _setupConversion() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const imageUtils = editor.plugins.get('ImageUtils');
        conversion.for('editingDowncast').add((dispatcher)=>{
            dispatcher.on('attribute:placeholder', (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.test(data.item, evt.name)) {
                    return;
                }
                if (!data.item.is('element', 'imageBlock') && !data.item.is('element', 'imageInline')) {
                    return;
                }
                conversionApi.consumable.consume(data.item, evt.name);
                const viewWriter = conversionApi.writer;
                const element = conversionApi.mapper.toViewElement(data.item);
                const img = imageUtils.findViewImgElement(element);
                if (data.attributeNewValue) {
                    viewWriter.addClass('image_placeholder', img);
                    viewWriter.setStyle('background-image', `url(${data.attributeNewValue})`, img);
                    viewWriter.setCustomProperty('editingPipeline:doNotReuseOnce', true, img);
                } else {
                    viewWriter.removeClass('image_placeholder', img);
                    viewWriter.removeStyle('background-image', img);
                }
            });
        });
    }
    /**
	 * Prepares listener for image load.
	 */ _setupLoadListener() {
        const editor = this.editor;
        const model = editor.model;
        const editing = editor.editing;
        const editingView = editing.view;
        const imageUtils = editor.plugins.get('ImageUtils');
        editingView.addObserver(ImageLoadObserver);
        this.listenTo(editingView.document, 'imageLoaded', (evt, domEvent)=>{
            const imgViewElement = editingView.domConverter.mapDomToView(domEvent.target);
            if (!imgViewElement) {
                return;
            }
            const viewElement = imageUtils.getImageWidgetFromImageView(imgViewElement);
            if (!viewElement) {
                return;
            }
            const modelElement = editing.mapper.toModelElement(viewElement);
            if (!modelElement || !modelElement.hasAttribute('placeholder')) {
                return;
            }
            model.enqueueChange({
                isUndoable: false
            }, (writer)=>{
                writer.removeAttribute('placeholder', modelElement);
            });
        });
    }
}

/**
 * The image block plugin.
 *
 * It registers:
 *
 * * `<imageBlock>` as a block element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.,
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeBlock'`} command that converts inline images into
 * block images.
 */ class ImageBlockEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageEditing,
            ImageSizeAttributes,
            ImageUtils,
            ImagePlaceholder,
            ClipboardPipeline
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageBlockEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        // Converters 'alt' and 'srcset' are added in 'ImageEditing' plugin.
        schema.register('imageBlock', {
            inheritAllFrom: '$blockObject',
            allowAttributes: [
                'alt',
                'src',
                'srcset'
            ]
        });
        this._setupConversion();
        if (editor.plugins.has('ImageInlineEditing')) {
            editor.commands.add('imageTypeBlock', new ImageTypeCommand(this.editor, 'imageBlock'));
            this._setupClipboardIntegration();
        }
    }
    /**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * block images (block image widgets) and their attributes.
	 */ _setupConversion() {
        const editor = this.editor;
        const t = editor.t;
        const conversion = editor.conversion;
        const imageUtils = editor.plugins.get('ImageUtils');
        conversion.for('dataDowncast').elementToStructure({
            model: 'imageBlock',
            view: (modelElement, { writer })=>createBlockImageViewElement(writer)
        });
        conversion.for('editingDowncast').elementToStructure({
            model: 'imageBlock',
            view: (modelElement, { writer })=>imageUtils.toImageWidget(createBlockImageViewElement(writer), writer, t('image widget'))
        });
        conversion.for('downcast').add(downcastImageAttribute(imageUtils, 'imageBlock', 'src')).add(downcastImageAttribute(imageUtils, 'imageBlock', 'alt')).add(downcastSrcsetAttribute(imageUtils, 'imageBlock'));
        // More image related upcasts are in 'ImageEditing' plugin.
        conversion.for('upcast').elementToElement({
            view: getImgViewElementMatcher(editor, 'imageBlock'),
            model: (viewImage, { writer })=>writer.createElement('imageBlock', viewImage.hasAttribute('src') ? {
                    src: viewImage.getAttribute('src')
                } : undefined)
        }).add(upcastImageFigure(imageUtils));
    }
    /**
	 * Integrates the plugin with the clipboard pipeline.
	 *
	 * Idea is that the feature should recognize the user's intent when an **inline** image is
	 * pasted or dropped. If such an image is pasted/dropped:
	 *
	 * * into an empty block (e.g. an empty paragraph),
	 * * on another object (e.g. some block widget).
	 *
	 * it gets converted into a block image on the fly. We assume this is the user's intent
	 * if they decided to put their image there.
	 *
	 * See the `ImageInlineEditing` for the similar integration that works in the opposite direction.
	 *
	 * The feature also sets image `width` and `height` attributes on paste.
	 */ _setupClipboardIntegration() {
        const editor = this.editor;
        const model = editor.model;
        const editingView = editor.editing.view;
        const imageUtils = editor.plugins.get('ImageUtils');
        const clipboardPipeline = editor.plugins.get('ClipboardPipeline');
        this.listenTo(clipboardPipeline, 'inputTransformation', (evt, data)=>{
            const docFragmentChildren = Array.from(data.content.getChildren());
            let modelRange;
            // Make sure only <img> elements are dropped or pasted. Otherwise, if there some other HTML
            // mixed up, this should be handled as a regular paste.
            if (!docFragmentChildren.every(imageUtils.isInlineImageView)) {
                return;
            }
            // When drag and dropping, data.targetRanges specifies where to drop because
            // this is usually a different place than the current model selection (the user
            // uses a drop marker to specify the drop location).
            if (data.targetRanges) {
                modelRange = editor.editing.mapper.toModelRange(data.targetRanges[0]);
            } else {
                modelRange = model.document.selection.getFirstRange();
            }
            const selection = model.createSelection(modelRange);
            // Convert inline images into block images only when the currently selected block is empty
            // (e.g. an empty paragraph) or some object is selected (to replace it).
            if (determineImageTypeForInsertionAtSelection(model.schema, selection) === 'imageBlock') {
                const writer = new ViewUpcastWriter(editingView.document);
                // Wrap <img ... /> -> <figure class="image"><img .../></figure>
                const blockViewImages = docFragmentChildren.map((inlineViewImage)=>writer.createElement('figure', {
                        class: 'image'
                    }, inlineViewImage));
                data.content = writer.createDocumentFragment(blockViewImages);
            }
        });
        this.listenTo(clipboardPipeline, 'contentInsertion', (evt, data)=>{
            if (data.method !== 'paste') {
                return;
            }
            model.change((writer)=>{
                const range = writer.createRangeIn(data.content);
                for (const item of range.getItems()){
                    if (item.is('element', 'imageBlock')) {
                        imageUtils.setImageNaturalSizeAttributes(item);
                    }
                }
            });
        });
    }
}

/**
 * The view displayed in the insert image dropdown.
 *
 * See {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
 *
 * @internal
 */ class ImageInsertFormView extends View {
    /**
	 * Tracks information about DOM focus in the form.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * A collection of views that can be focused in the form.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * A collection of the defined integrations for inserting the images.
	 */ children;
    /**
	 * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
	 *
	 * @param locale The localization services instance.
	 * @param integrations An integrations object that contains components (or tokens for components) to be shown in the panel view.
	 */ constructor(locale, integrations = []){
        super(locale);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this._focusables = new ViewCollection();
        this.children = this.createCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        for (const view of integrations){
            this.children.add(view);
            this._focusables.add(view);
            if (view instanceof CollapsibleView) {
                this._focusables.addMany(view.children);
            }
        }
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-image-insert-form'
                ],
                tabindex: -1
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        submitHandler({
            view: this
        });
        for (const view of this._focusables){
            this.focusTracker.add(view.element);
        }
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
        const stopPropagation = (data)=>data.stopPropagation();
        // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
        // keystroke handler would take over the key management in the URL input. We need to prevent
        // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
        this.keystrokes.set('arrowright', stopPropagation);
        this.keystrokes.set('arrowleft', stopPropagation);
        this.keystrokes.set('arrowup', stopPropagation);
        this.keystrokes.set('arrowdown', stopPropagation);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Focuses the first {@link #_focusables focusable} in the form.
	 */ focus() {
        this._focusCycler.focusFirst();
    }
}

/**
 * The image insert dropdown plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/images-inserting Insert images via source URL} documentation.
 *
 * Adds the `'insertImage'` dropdown to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageInsert` dropdown as an alias for backward compatibility.
 *
 * Adds the `'menuBar:insertImage'` sub-menu to the {@link module:ui/componentfactory~ComponentFactory UI component factory}, which is
 * by default added to the `'Insert'` menu.
 */ class ImageInsertUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageInsertUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils
        ];
    }
    /**
	 * The dropdown view responsible for displaying the image insert UI.
	 */ dropdownView;
    /**
	 * Registered integrations map.
	 */ _integrations = new Map();
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('image.insert.integrations', [
            'upload',
            'assetManager',
            'url'
        ]);
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const imageUtils = editor.plugins.get('ImageUtils');
        this.set('isImageSelected', false);
        this.listenTo(editor.model.document, 'change', ()=>{
            this.isImageSelected = imageUtils.isImage(selection.getSelectedElement());
        });
        const componentCreator = (locale)=>this._createToolbarComponent(locale);
        const menuBarComponentCreator = (locale)=>this._createMenuBarComponent(locale);
        // Register `insertImage` dropdown and add `imageInsert` dropdown as an alias for backward compatibility.
        editor.ui.componentFactory.add('insertImage', componentCreator);
        editor.ui.componentFactory.add('imageInsert', componentCreator);
        editor.ui.componentFactory.add('menuBar:insertImage', menuBarComponentCreator);
    }
    /**
	 * Registers the insert image dropdown integration.
	 */ registerIntegration({ name, observable, buttonViewCreator, formViewCreator, menuBarButtonViewCreator, requiresForm = false, override = false }) {
        if (this._integrations.has(name) && !override) {
            /**
			 * There are two insert-image integrations registered with the same name.
			 *
			 * Make sure that you do not load multiple asset manager plugins.
			 *
			 * @error image-insert-integration-exists
			 */ logWarning('image-insert-integration-exists', {
                name
            });
        }
        this._integrations.set(name, {
            observable,
            buttonViewCreator,
            menuBarButtonViewCreator,
            formViewCreator,
            requiresForm
        });
    }
    /**
	 * Creates the toolbar component.
	 */ _createToolbarComponent(locale) {
        const editor = this.editor;
        const t = locale.t;
        const integrations = this._prepareIntegrations();
        if (!integrations.length) {
            return null;
        }
        let dropdownButton;
        const firstIntegration = integrations[0];
        if (integrations.length == 1) {
            // Do not use dropdown for a single integration button (integration that does not require form view).
            if (!firstIntegration.requiresForm) {
                return firstIntegration.buttonViewCreator(true);
            }
            dropdownButton = firstIntegration.buttonViewCreator(true);
        } else {
            const actionButton = firstIntegration.buttonViewCreator(false);
            dropdownButton = new SplitButtonView(locale, actionButton);
            dropdownButton.tooltip = true;
            dropdownButton.bind('label').to(this, 'isImageSelected', (isImageSelected)=>isImageSelected ? t('Replace image') : t('Insert image'));
        }
        const dropdownView = this.dropdownView = createDropdown(locale, dropdownButton);
        const observables = integrations.map(({ observable })=>typeof observable == 'function' ? observable() : observable);
        dropdownView.bind('isEnabled').toMany(observables, 'isEnabled', (...isEnabled)=>isEnabled.some((isEnabled)=>isEnabled));
        dropdownView.once('change:isOpen', ()=>{
            const integrationViews = integrations.flatMap(({ formViewCreator })=>formViewCreator(integrations.length == 1));
            const imageInsertFormView = new ImageInsertFormView(editor.locale, integrationViews);
            dropdownView.panelView.children.add(imageInsertFormView);
        });
        return dropdownView;
    }
    /**
	 * Creates the menu bar component.
	 */ _createMenuBarComponent(locale) {
        const t = locale.t;
        const integrations = this._prepareIntegrations();
        if (!integrations.length) {
            return null;
        }
        const integrationViews = integrations.flatMap(({ menuBarButtonViewCreator })=>menuBarButtonViewCreator(integrations.length == 1));
        const resultView = new MenuBarMenuView(locale);
        const listView = new MenuBarMenuListView(locale);
        resultView.panelView.children.add(listView);
        resultView.buttonView.set({
            icon: IconImage,
            label: t('Image')
        });
        for (const integrationView of integrationViews){
            const listItemView = new MenuBarMenuListItemView(locale, resultView);
            listItemView.children.add(integrationView);
            listView.items.add(listItemView);
            integrationView.delegate('execute').to(resultView);
        }
        return resultView;
    }
    /**
	 * Validates the integrations list.
	 */ _prepareIntegrations() {
        const editor = this.editor;
        const items = editor.config.get('image.insert.integrations');
        const result = [];
        if (!items.length) {
            /**
			 * The insert image feature requires a list of integrations to be provided in the editor configuration.
			 *
			 * The default list of integrations is `upload`, `assetManager`, `url`. Those integrations are included
			 * in the insert image dropdown if the given feature plugin is loaded. You should omit the `integrations`
			 * configuration key to use the default set or provide a selected list of integrations that should be used.
			 *
			 * @error image-insert-integrations-not-specified
			 */ logWarning('image-insert-integrations-not-specified');
            return result;
        }
        for (const item of items){
            if (!this._integrations.has(item)) {
                if (![
                    'upload',
                    'assetManager',
                    'url'
                ].includes(item)) {
                    /**
					 * The specified insert image integration name is unknown or the providing plugin is not loaded in the editor.
					 *
					 * @error image-insert-unknown-integration
					 */ logWarning('image-insert-unknown-integration', {
                        item
                    });
                }
                continue;
            }
            result.push(this._integrations.get(item));
        }
        if (!result.length) {
            /**
			 * The image insert feature requires integrations to be registered by separate features.
			 *
			 * The `insertImage` toolbar button requires integrations to be registered by other features.
			 * For example {@link module:image/imageupload~ImageUpload ImageUpload},
			 * {@link module:image/imageinsert~ImageInsert ImageInsert},
			 * {@link module:image/imageinsertviaurl~ImageInsertViaUrl ImageInsertViaUrl},
			 * {@link module:ckbox/ckbox~CKBox CKBox}
			 *
			 * @error image-insert-integrations-not-registered
			 */ logWarning('image-insert-integrations-not-registered');
        }
        return result;
    }
}

/**
 * The image block plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/image/imageblockediting~ImageBlockEditing},
 * * {@link module:image/imagetextalternative~ImageTextAlternative}.
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 */ class ImageBlock extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageBlockEditing,
            Widget,
            ImageTextAlternative,
            ImageInsertUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageBlock';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The image inline plugin.
 *
 * It registers:
 *
 * * `<imageInline>` as an inline element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeInline'`} command that converts block images into
 * inline images.
 */ class ImageInlineEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageEditing,
            ImageSizeAttributes,
            ImageUtils,
            ImagePlaceholder,
            ClipboardPipeline
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageInlineEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        // Converters 'alt' and 'srcset' are added in 'ImageEditing' plugin.
        schema.register('imageInline', {
            inheritAllFrom: '$inlineObject',
            allowAttributes: [
                'alt',
                'src',
                'srcset'
            ],
            // Disallow inline images in captions (at least for now).
            // This is the best spot to do that because independent packages can introduce captions (ImageCaption, TableCaption, etc.).
            disallowIn: [
                'caption'
            ]
        });
        this._setupConversion();
        if (editor.plugins.has('ImageBlockEditing')) {
            editor.commands.add('imageTypeInline', new ImageTypeCommand(this.editor, 'imageInline'));
            this._setupClipboardIntegration();
        }
    }
    /**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * inline images (inline image widgets) and their attributes.
	 */ _setupConversion() {
        const editor = this.editor;
        const t = editor.t;
        const conversion = editor.conversion;
        const imageUtils = editor.plugins.get('ImageUtils');
        conversion.for('dataDowncast').elementToElement({
            model: 'imageInline',
            view: (modelElement, { writer })=>writer.createEmptyElement('img')
        });
        conversion.for('editingDowncast').elementToStructure({
            model: 'imageInline',
            view: (modelElement, { writer })=>imageUtils.toImageWidget(createInlineImageViewElement(writer), writer, t('image widget'))
        });
        conversion.for('downcast').add(downcastImageAttribute(imageUtils, 'imageInline', 'src')).add(downcastImageAttribute(imageUtils, 'imageInline', 'alt')).add(downcastSrcsetAttribute(imageUtils, 'imageInline'));
        // More image related upcasts are in 'ImageEditing' plugin.
        conversion.for('upcast').elementToElement({
            view: getImgViewElementMatcher(editor, 'imageInline'),
            model: (viewImage, { writer })=>writer.createElement('imageInline', viewImage.hasAttribute('src') ? {
                    src: viewImage.getAttribute('src')
                } : undefined)
        });
    }
    /**
	 * Integrates the plugin with the clipboard pipeline.
	 *
	 * Idea is that the feature should recognize the user's intent when an **block** image is
	 * pasted or dropped. If such an image is pasted/dropped into a non-empty block
	 * (e.g. a paragraph with some text) it gets converted into an inline image on the fly.
	 *
	 * We assume this is the user's intent if they decided to put their image there.
	 *
	 * **Note**: If a block image has a caption, it will not be converted to an inline image
	 * to avoid the confusion. Captions are added on purpose and they should never be lost
	 * in the clipboard pipeline.
	 *
	 * See the `ImageBlockEditing` for the similar integration that works in the opposite direction.
	 *
	 * The feature also sets image `width` and `height` attributes when pasting.
	 */ _setupClipboardIntegration() {
        const editor = this.editor;
        const model = editor.model;
        const editingView = editor.editing.view;
        const imageUtils = editor.plugins.get('ImageUtils');
        const clipboardPipeline = editor.plugins.get('ClipboardPipeline');
        this.listenTo(clipboardPipeline, 'inputTransformation', (evt, data)=>{
            const docFragmentChildren = Array.from(data.content.getChildren());
            let modelRange;
            // Make sure only <figure class="image"></figure> elements are dropped or pasted. Otherwise, if there some other HTML
            // mixed up, this should be handled as a regular paste.
            if (!docFragmentChildren.every(imageUtils.isBlockImageView)) {
                return;
            }
            // When drag and dropping, data.targetRanges specifies where to drop because
            // this is usually a different place than the current model selection (the user
            // uses a drop marker to specify the drop location).
            if (data.targetRanges) {
                modelRange = editor.editing.mapper.toModelRange(data.targetRanges[0]);
            } else {
                modelRange = model.document.selection.getFirstRange();
            }
            const selection = model.createSelection(modelRange);
            // Convert block images into inline images only when pasting or dropping into non-empty blocks
            // and when the block is not an object (e.g. pasting to replace another widget).
            if (determineImageTypeForInsertionAtSelection(model.schema, selection) === 'imageInline') {
                const writer = new ViewUpcastWriter(editingView.document);
                // Unwrap <figure class="image"><img .../></figure> -> <img ... />
                // but <figure class="image"><img .../><figcaption>...</figcaption></figure> -> stays the same
                const inlineViewImages = docFragmentChildren.map((blockViewImage)=>{
                    // If there's just one child, it can be either <img /> or <a><img></a>.
                    // If there are other children than <img>, this means that the block image
                    // has a caption or some other features and this kind of image should be
                    // pasted/dropped without modifications.
                    if (blockViewImage.childCount === 1) {
                        // Pass the attributes which are present only in the <figure> to the <img>
                        // (e.g. the style="width:10%" attribute applied by the ImageResize plugin).
                        Array.from(blockViewImage.getAttributes()).forEach((attribute)=>writer.setAttribute(...attribute, imageUtils.findViewImgElement(blockViewImage)));
                        return blockViewImage.getChild(0);
                    } else {
                        return blockViewImage;
                    }
                });
                data.content = writer.createDocumentFragment(inlineViewImages);
            }
        });
        this.listenTo(clipboardPipeline, 'contentInsertion', (evt, data)=>{
            if (data.method !== 'paste') {
                return;
            }
            model.change((writer)=>{
                const range = writer.createRangeIn(data.content);
                for (const item of range.getItems()){
                    if (item.is('element', 'imageInline')) {
                        imageUtils.setImageNaturalSizeAttributes(item);
                    }
                }
            });
        });
    }
}

/**
 * The image inline plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/image/imageinlineediting~ImageInlineEditing},
 * * {@link module:image/imagetextalternative~ImageTextAlternative}.
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 */ class ImageInline extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageInlineEditing,
            Widget,
            ImageTextAlternative,
            ImageInsertUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageInline';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The image plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-overview image feature} documentation.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/imageblock~ImageBlock},
 * * {@link module:image/imageinline~ImageInline},
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 */ class Image extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageBlock,
            ImageInline
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'Image';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The image caption utilities plugin.
 */ class ImageCaptionUtils extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageCaptionUtils';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils
        ];
    }
    /**
	 * Returns the caption model element from a given image element. Returns `null` if no caption is found.
	 */ getCaptionFromImageModelElement(imageModelElement) {
        for (const node of imageModelElement.getChildren()){
            if (!!node && node.is('element', 'caption')) {
                return node;
            }
        }
        return null;
    }
    /**
	 * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
	 */ getCaptionFromModelSelection(selection) {
        const imageUtils = this.editor.plugins.get('ImageUtils');
        const captionElement = selection.getFirstPosition().findAncestor('caption');
        if (!captionElement) {
            return null;
        }
        if (imageUtils.isBlockImage(captionElement.parent)) {
            return captionElement;
        }
        return null;
    }
    /**
	 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figcaption>` element that is placed
	 * inside the image `<figure>` element.
	 * @returns Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
	 * cannot be matched.
	 */ matchImageCaptionViewElement(element) {
        const imageUtils = this.editor.plugins.get('ImageUtils');
        // Convert only captions for images.
        if (element.name == 'figcaption' && imageUtils.isBlockImageView(element.parent)) {
            return {
                name: true
            };
        }
        return null;
    }
}

/**
 * The toggle image caption command.
 *
 * This command is registered by {@link module:image/imagecaption/imagecaptionediting~ImageCaptionEditing} as the
 * `'toggleImageCaption'` editor command.
 *
 * Executing this command:
 *
 * * either adds or removes the image caption of a selected image (depending on whether the caption is present or not),
 * * removes the image caption if the selection is anchored in one.
 *
 * ```ts
 * // Toggle the presence of the caption.
 * editor.execute( 'toggleImageCaption' );
 * ```
 *
 * **Note**: Upon executing this command, the selection will be set on the image if previously anchored in the caption element.
 *
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using
 * the `focusCaptionOnShow` option:
 *
 * ```ts
 * editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );
 * ```
 */ class ToggleImageCaptionCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const imageCaptionUtils = editor.plugins.get('ImageCaptionUtils');
        const imageUtils = editor.plugins.get('ImageUtils');
        // Only block images can get captions.
        if (!editor.plugins.has(ImageBlockEditing)) {
            this.isEnabled = false;
            this.value = false;
            return;
        }
        const selection = editor.model.document.selection;
        const selectedElement = selection.getSelectedElement();
        if (!selectedElement) {
            const ancestorCaptionElement = imageCaptionUtils.getCaptionFromModelSelection(selection);
            this.isEnabled = !!ancestorCaptionElement;
            this.value = !!ancestorCaptionElement;
            return;
        }
        // Block images support captions by default but the command should also be enabled for inline
        // images because toggling the caption when one is selected should convert it into a block image.
        this.isEnabled = imageUtils.isImage(selectedElement);
        if (!this.isEnabled) {
            this.value = false;
        } else {
            this.value = !!imageCaptionUtils.getCaptionFromImageModelElement(selectedElement);
        }
    }
    /**
	 * Executes the command.
	 *
	 * ```ts
	 * editor.execute( 'toggleImageCaption' );
	 * ```
	 *
	 * @param options Options for the executed command.
	 * @param options.focusCaptionOnShow When true and the caption shows up, the selection will be moved into it straight away.
	 * @fires execute
	 */ execute(options = {}) {
        const { focusCaptionOnShow } = options;
        this.editor.model.change((writer)=>{
            if (this.value) {
                this._hideImageCaption(writer);
            } else {
                this._showImageCaption(writer, focusCaptionOnShow);
            }
        });
    }
    /**
	 * Shows the caption of the `<imageBlock>` or `<imageInline>`. Also:
	 *
	 * * it converts `<imageInline>` to `<imageBlock>` to show the caption,
	 * * it attempts to restore the caption content from the `ImageCaptionEditing` caption registry,
	 * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
	 */ _showImageCaption(writer, focusCaptionOnShow) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const imageCaptionEditing = this.editor.plugins.get('ImageCaptionEditing');
        const imageUtils = this.editor.plugins.get('ImageUtils');
        let selectedImage = selection.getSelectedElement();
        const savedCaption = imageCaptionEditing._getSavedCaption(selectedImage);
        // Convert imageInline -> image first.
        if (imageUtils.isInlineImage(selectedImage)) {
            this.editor.execute('imageTypeBlock');
            // Executing the command created a new model element. Let's pick it again.
            selectedImage = selection.getSelectedElement();
        }
        // Try restoring the caption from the ImageCaptionEditing plugin storage.
        const newCaptionElement = savedCaption || writer.createElement('caption');
        writer.append(newCaptionElement, selectedImage);
        if (focusCaptionOnShow) {
            writer.setSelection(newCaptionElement, 'in');
        }
    }
    /**
	 * Hides the caption of a selected image (or an image caption the selection is anchored to).
	 *
	 * The content of the caption is stored in the `ImageCaptionEditing` caption registry to make this
	 * a reversible action.
	 */ _hideImageCaption(writer) {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        const imageCaptionEditing = editor.plugins.get('ImageCaptionEditing');
        const imageCaptionUtils = editor.plugins.get('ImageCaptionUtils');
        let selectedImage = selection.getSelectedElement();
        let captionElement;
        if (selectedImage) {
            captionElement = imageCaptionUtils.getCaptionFromImageModelElement(selectedImage);
        } else {
            captionElement = imageCaptionUtils.getCaptionFromModelSelection(selection);
            selectedImage = captionElement.parent;
        }
        // Store the caption content so it can be restored quickly if the user changes their mind even if they toggle image<->imageInline.
        imageCaptionEditing._saveCaption(selectedImage, captionElement);
        writer.setSelection(selectedImage, 'on');
        writer.remove(captionElement);
    }
}

/**
 * The image caption engine plugin. It is responsible for:
 *
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand `toggleImageCaption`} command.
 */ class ImageCaptionEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils,
            ImageCaptionUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageCaptionEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * A map that keeps saved JSONified image captions and image model elements they are
	 * associated with.
	 *
	 * To learn more about this system, see {@link #_saveCaption}.
	 */ _savedCaptionsMap;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._savedCaptionsMap = new WeakMap();
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        // Schema configuration.
        if (!schema.isRegistered('caption')) {
            schema.register('caption', {
                allowIn: 'imageBlock',
                allowContentOf: '$block',
                isLimit: true
            });
        } else {
            schema.extend('caption', {
                allowIn: 'imageBlock'
            });
        }
        editor.commands.add('toggleImageCaption', new ToggleImageCaptionCommand(this.editor));
        this._setupConversion();
        this._setupImageTypeCommandsIntegration();
        this._registerCaptionReconversion();
    }
    /**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * image captions.
	 */ _setupConversion() {
        const editor = this.editor;
        const view = editor.editing.view;
        const imageUtils = editor.plugins.get('ImageUtils');
        const imageCaptionUtils = editor.plugins.get('ImageCaptionUtils');
        const t = editor.t;
        // View -> model converter for the data pipeline.
        editor.conversion.for('upcast').elementToElement({
            view: (element)=>imageCaptionUtils.matchImageCaptionViewElement(element),
            model: 'caption'
        });
        // Model -> view converter for the data pipeline.
        editor.conversion.for('dataDowncast').elementToElement({
            model: 'caption',
            view: (modelElement, { writer })=>{
                if (!imageUtils.isBlockImage(modelElement.parent)) {
                    return null;
                }
                return writer.createContainerElement('figcaption');
            }
        });
        // Model -> view converter for the editing pipeline.
        editor.conversion.for('editingDowncast').elementToElement({
            model: 'caption',
            view: (modelElement, { writer })=>{
                if (!imageUtils.isBlockImage(modelElement.parent)) {
                    return null;
                }
                const figcaptionElement = writer.createEditableElement('figcaption');
                writer.setCustomProperty('imageCaption', true, figcaptionElement);
                figcaptionElement.placeholder = t('Enter image caption');
                enableViewPlaceholder({
                    view,
                    element: figcaptionElement,
                    keepOnFocus: true
                });
                const imageAlt = modelElement.parent.getAttribute('alt');
                const label = imageAlt ? t('Caption for image: %0', [
                    imageAlt
                ]) : t('Caption for the image');
                return toWidgetEditable(figcaptionElement, writer, {
                    label
                });
            }
        });
    }
    /**
	 * Integrates with {@link module:image/image/imagetypecommand~ImageTypeCommand image type commands}
	 * to make sure the caption is preserved when the type of an image changes so it can be restored
	 * in the future if the user decides they want their caption back.
	 */ _setupImageTypeCommandsIntegration() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const imageCaptionUtils = editor.plugins.get('ImageCaptionUtils');
        const imageTypeInlineCommand = editor.commands.get('imageTypeInline');
        const imageTypeBlockCommand = editor.commands.get('imageTypeBlock');
        const handleImageTypeChange = (evt)=>{
            // The image type command execution can be unsuccessful.
            if (!evt.return) {
                return;
            }
            const { oldElement, newElement } = evt.return;
            /* istanbul ignore if: paranoid check -- @preserve */ if (!oldElement) {
                return;
            }
            if (imageUtils.isBlockImage(oldElement)) {
                const oldCaptionElement = imageCaptionUtils.getCaptionFromImageModelElement(oldElement);
                // If the old element was a captioned block image (the caption was visible),
                // simply save it so it can be restored.
                if (oldCaptionElement) {
                    this._saveCaption(newElement, oldCaptionElement);
                    return;
                }
            }
            const savedOldElementCaption = this._getSavedCaption(oldElement);
            // If either:
            //
            // * the block image didn't have a visible caption,
            // * the block image caption was hidden (and already saved),
            // * the inline image was passed
            //
            // just try to "pass" the saved caption from the old image to the new image
            // so it can be retrieved in the future if the user wants it back.
            if (savedOldElementCaption) {
                // Note: Since we're writing to a WeakMap, we don't bother with removing the
                // [ oldElement, savedOldElementCaption ] pair from it.
                this._saveCaption(newElement, savedOldElementCaption);
            }
        };
        // Presence of the commands depends on the Image(Inline|Block)Editing plugins loaded in the editor.
        if (imageTypeInlineCommand) {
            this.listenTo(imageTypeInlineCommand, 'execute', handleImageTypeChange, {
                priority: 'low'
            });
        }
        if (imageTypeBlockCommand) {
            this.listenTo(imageTypeBlockCommand, 'execute', handleImageTypeChange, {
                priority: 'low'
            });
        }
    }
    /**
	 * Returns the saved {@link module:engine/model/element~ModelElement#toJSON JSONified} caption
	 * of an image model element.
	 *
	 * See {@link #_saveCaption}.
	 *
	 * @internal
	 * @param imageModelElement The model element the caption should be returned for.
	 * @returns The model caption element or `null` if there is none.
	 */ _getSavedCaption(imageModelElement) {
        const jsonObject = this._savedCaptionsMap.get(imageModelElement);
        return jsonObject ? ModelElement.fromJSON(jsonObject) : null;
    }
    /**
	 * Saves a {@link module:engine/model/element~ModelElement#toJSON JSONified} caption for
	 * an image element to allow restoring it in the future.
	 *
	 * A caption is saved every time it gets hidden and/or the type of an image changes. The
	 * user should be able to restore it on demand.
	 *
	 * **Note**: The caption cannot be stored in the image model element attribute because,
	 * for instance, when the model state propagates to collaborators, the attribute would get
	 * lost (mainly because it does not convert to anything when the caption is hidden) and
	 * the states of collaborators' models would de-synchronize causing numerous issues.
	 *
	 * See {@link #_getSavedCaption}.
	 *
	 * @internal
	 * @param imageModelElement The model element the caption is saved for.
	 * @param caption The caption model element to be saved.
	 */ _saveCaption(imageModelElement, caption) {
        this._savedCaptionsMap.set(imageModelElement, caption.toJSON());
    }
    /**
	 * Reconverts image caption when image alt attribute changes.
	 * The change of alt attribute is reflected in caption's aria-label attribute.
	 */ _registerCaptionReconversion() {
        const editor = this.editor;
        const model = editor.model;
        const imageUtils = editor.plugins.get('ImageUtils');
        const imageCaptionUtils = editor.plugins.get('ImageCaptionUtils');
        model.document.on('change:data', ()=>{
            const changes = model.document.differ.getChanges();
            for (const change of changes){
                if (change.attributeKey !== 'alt') {
                    continue;
                }
                const image = change.range.start.nodeAfter;
                if (imageUtils.isBlockImage(image)) {
                    const caption = imageCaptionUtils.getCaptionFromImageModelElement(image);
                    if (!caption) {
                        return;
                    }
                    editor.editing.reconvertItem(caption);
                }
            }
        });
    }
}

/**
 * The image caption UI plugin. It introduces the `'toggleImageCaption'` UI button.
 */ class ImageCaptionUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageCaptionUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageCaptionUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const editingView = editor.editing.view;
        const imageCaptionUtils = editor.plugins.get('ImageCaptionUtils');
        const t = editor.t;
        editor.ui.componentFactory.add('toggleImageCaption', (locale)=>{
            const command = editor.commands.get('toggleImageCaption');
            const view = new ButtonView(locale);
            view.set({
                icon: IconCaption,
                tooltip: true,
                isToggleable: true
            });
            view.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');
            view.bind('label').to(command, 'value', (value)=>value ? t('Toggle caption off') : t('Toggle caption on'));
            this.listenTo(view, 'execute', ()=>{
                editor.execute('toggleImageCaption', {
                    focusCaptionOnShow: true
                });
                // Scroll to the selection and highlight the caption if the caption showed up.
                const modelCaptionElement = imageCaptionUtils.getCaptionFromModelSelection(editor.model.document.selection);
                if (modelCaptionElement) {
                    const figcaptionElement = editor.editing.mapper.toViewElement(modelCaptionElement);
                    editingView.scrollToTheSelection();
                    editingView.change((writer)=>{
                        writer.addClass('image__caption_highlighted', figcaptionElement);
                    });
                }
                editor.editing.view.focus();
            });
            return view;
        });
    }
}

/**
 * The image caption plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-captions image caption} documentation.
 */ class ImageCaption extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageCaptionEditing,
            ImageCaptionUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageCaption';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * Creates a regular expression used to test for image files.
 *
 * ```ts
 * const imageType = createImageTypeRegExp( [ 'png', 'jpeg', 'svg+xml', 'vnd.microsoft.icon' ] );
 *
 * console.log( 'is supported image', imageType.test( file.type ) );
 * ```
 */ function createImageTypeRegExp(types) {
    // Sanitize the MIME type name which may include: "+", "-" or ".".
    const regExpSafeNames = types.map((type)=>type.replace('+', '\\+'));
    return new RegExp(`^image\\/(${regExpSafeNames.join('|')})$`);
}
/**
 * Creates a promise that fetches the image local source (Base64 or blob) and resolves with a `File` object.
 *
 * @internal
 * @param image Image whose source to fetch.
 * @returns A promise which resolves when an image source is fetched and converted to a `File` instance.
 * It resolves with a `File` object. If there were any errors during file processing, the promise will be rejected.
 */ function fetchLocalImage(image) {
    return new Promise((resolve, reject)=>{
        const imageSrc = image.getAttribute('src');
        // Fetch works asynchronously and so does not block browser UI when processing data.
        fetch(imageSrc).then((resource)=>resource.blob()).then((blob)=>{
            const mimeType = getImageMimeType(blob, imageSrc);
            const ext = mimeType.replace('image/', '');
            const filename = `image.${ext}`;
            const file = new File([
                blob
            ], filename, {
                type: mimeType
            });
            resolve(file);
        }).catch((err)=>{
            // Fetch fails only, if it can't make a request due to a network failure or if anything prevented the request
            // from completing, i.e. the Content Security Policy rules. It is not possible to detect the exact cause of failure,
            // so we are just trying the fallback solution, if general TypeError is thrown.
            return err && err.name === 'TypeError' ? convertLocalImageOnCanvas(imageSrc).then(resolve).catch(reject) : reject(err);
        });
    });
}
/**
 * Checks whether a given node is an image element with a local source (Base64 or blob).
 *
 * @param node The node to check.
 * @internal
 */ function isLocalImage(imageUtils, node) {
    if (!imageUtils.isInlineImageView(node) || !node.getAttribute('src')) {
        return false;
    }
    return !!node.getAttribute('src').match(/^data:image\/\w+;base64,/g) || !!node.getAttribute('src').match(/^blob:/g);
}
/**
 * Extracts an image type based on its blob representation or its source.
 * @param blob Image blob representation.
 * @param src Image `src` attribute value.
 */ function getImageMimeType(blob, src) {
    if (blob.type) {
        return blob.type;
    } else if (src.match(/data:(image\/\w+);base64/)) {
        return src.match(/data:(image\/\w+);base64/)[1].toLowerCase();
    } else {
        // Fallback to 'jpeg' as common extension.
        return 'image/jpeg';
    }
}
/**
 * Creates a promise that converts the image local source (Base64 or blob) to a blob using canvas and resolves
 * with a `File` object.
 * @param imageSrc Image `src` attribute value.
 * @returns A promise which resolves when an image source is converted to a `File` instance.
 * It resolves with a `File` object. If there were any errors during file processing, the promise will be rejected.
 */ function convertLocalImageOnCanvas(imageSrc) {
    return getBlobFromCanvas(imageSrc).then((blob)=>{
        const mimeType = getImageMimeType(blob, imageSrc);
        const ext = mimeType.replace('image/', '');
        const filename = `image.${ext}`;
        return new File([
            blob
        ], filename, {
            type: mimeType
        });
    });
}
/**
 * Creates a promise that resolves with a `Blob` object converted from the image source (Base64 or blob).
 * @param imageSrc Image `src` attribute value.
 */ function getBlobFromCanvas(imageSrc) {
    return new Promise((resolve, reject)=>{
        const image = global.document.createElement('img');
        image.addEventListener('load', ()=>{
            const canvas = global.document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            canvas.toBlob((blob)=>blob ? resolve(blob) : reject());
        });
        image.addEventListener('error', ()=>reject());
        image.src = imageSrc;
    });
}

/**
 * The image upload button plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature} documentation.
 *
 * Adds the `'uploadImage'` button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageUpload` button as an alias for backward compatibility.
 *
 * Adds the `'menuBar:uploadImage'` menu button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component, which are the default components
 * through which image upload is available.
 */ class ImageUploadUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageUploadUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        // Setup `uploadImage` button and add `imageUpload` button as an alias for backward compatibility.
        editor.ui.componentFactory.add('uploadImage', ()=>this._createToolbarButton());
        editor.ui.componentFactory.add('imageUpload', ()=>this._createToolbarButton());
        editor.ui.componentFactory.add('menuBar:uploadImage', ()=>this._createMenuBarButton('standalone'));
        if (editor.plugins.has('ImageInsertUI')) {
            editor.plugins.get('ImageInsertUI').registerIntegration({
                name: 'upload',
                observable: ()=>editor.commands.get('uploadImage'),
                buttonViewCreator: ()=>this._createToolbarButton(),
                formViewCreator: ()=>this._createDropdownButton(),
                menuBarButtonViewCreator: (isOnly)=>this._createMenuBarButton(isOnly ? 'insertOnly' : 'insertNested')
            });
        }
    }
    /**
	 * Creates the base for various kinds of the button component provided by this feature.
	 */ _createButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const command = editor.commands.get('uploadImage');
        const imageTypes = editor.config.get('image.upload.types');
        const imageTypesRegExp = createImageTypeRegExp(imageTypes);
        const view = new ButtonClass(editor.locale);
        const t = locale.t;
        view.set({
            acceptedType: imageTypes.map((type)=>`image/${type}`).join(','),
            allowMultipleFiles: true,
            label: t('Upload from computer'),
            icon: IconImageUpload
        });
        view.bind('isEnabled').to(command);
        view.on('done', (evt, files)=>{
            const imagesToUpload = Array.from(files).filter((file)=>imageTypesRegExp.test(file.type));
            if (imagesToUpload.length) {
                editor.execute('uploadImage', {
                    file: imagesToUpload
                });
                editor.editing.view.focus();
            }
        });
        return view;
    }
    /**
	 * Creates a simple toolbar button, with an icon and a tooltip.
	 */ _createToolbarButton() {
        const t = this.editor.locale.t;
        const imageInsertUI = this.editor.plugins.get('ImageInsertUI');
        const uploadImageCommand = this.editor.commands.get('uploadImage');
        const button = this._createButton(FileDialogButtonView);
        button.tooltip = true;
        button.bind('label').to(imageInsertUI, 'isImageSelected', uploadImageCommand, 'isAccessAllowed', (isImageSelected, isAccessAllowed)=>{
            if (!isAccessAllowed) {
                return t('You have no image upload permissions.');
            }
            return isImageSelected ? t('Replace image from computer') : t('Upload image from computer');
        });
        return button;
    }
    /**
	 * Creates a button for the dropdown view, with an icon, text and no tooltip.
	 */ _createDropdownButton() {
        const t = this.editor.locale.t;
        const imageInsertUI = this.editor.plugins.get('ImageInsertUI');
        const button = this._createButton(FileDialogButtonView);
        button.withText = true;
        button.bind('label').to(imageInsertUI, 'isImageSelected', (isImageSelected)=>isImageSelected ? t('Replace from computer') : t('Upload from computer'));
        button.on('execute', ()=>{
            imageInsertUI.dropdownView.isOpen = false;
        });
        return button;
    }
    /**
	 * Creates a button for the menu bar.
	 */ _createMenuBarButton(type) {
        const t = this.editor.locale.t;
        const button = this._createButton(MenuBarMenuListItemFileDialogButtonView);
        button.withText = true;
        switch(type){
            case 'standalone':
                button.label = t('Image from computer');
                break;
            case 'insertOnly':
                button.label = t('Image');
                break;
            case 'insertNested':
                button.label = t('From computer');
                break;
        }
        return button;
    }
}

/**
 * The image upload progress plugin.
 * It shows a placeholder when the image is read from the disk and a progress bar while the image is uploading.
 */ class ImageUploadProgress extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageUploadProgress';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * The image placeholder that is displayed before real image data can be accessed.
	 *
	 * For the record, this image is a 1x1 px GIF with an aspect ratio set by CSS.
	 */ placeholder;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this.placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        // Upload status change - update image's view according to that status.
        if (editor.plugins.has('ImageBlockEditing')) {
            editor.editing.downcastDispatcher.on('attribute:uploadStatus:imageBlock', this.uploadStatusChange);
        }
        if (editor.plugins.has('ImageInlineEditing')) {
            editor.editing.downcastDispatcher.on('attribute:uploadStatus:imageInline', this.uploadStatusChange);
        }
    }
    /**
	 * This method is called each time the image `uploadStatus` attribute is changed.
	 *
	 * @param evt An object containing information about the fired event.
	 * @param data Additional information about the change.
	 */ uploadStatusChange = (evt, data, conversionApi)=>{
        const editor = this.editor;
        const modelImage = data.item;
        const uploadId = modelImage.getAttribute('uploadId');
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }
        const imageUtils = editor.plugins.get('ImageUtils');
        const fileRepository = editor.plugins.get(FileRepository);
        const status = uploadId ? data.attributeNewValue : null;
        const placeholder = this.placeholder;
        const viewFigure = editor.editing.mapper.toViewElement(modelImage);
        const viewWriter = conversionApi.writer;
        if (status == 'reading') {
            // Start "appearing" effect and show placeholder with infinite progress bar on the top
            // while image is read from disk.
            _startAppearEffect(viewFigure, viewWriter);
            _showPlaceholder(imageUtils, placeholder, viewFigure, viewWriter);
            return;
        }
        // Show progress bar on the top of the image when image is uploading.
        if (status == 'uploading') {
            const loader = fileRepository.loaders.get(uploadId);
            // Start appear effect if needed - see https://github.com/ckeditor/ckeditor5-image/issues/191.
            _startAppearEffect(viewFigure, viewWriter);
            if (!loader) {
                // There is no loader associated with uploadId - this means that image came from external changes.
                // In such cases we still want to show the placeholder until image is fully uploaded.
                // Show placeholder if needed - see https://github.com/ckeditor/ckeditor5-image/issues/191.
                _showPlaceholder(imageUtils, placeholder, viewFigure, viewWriter);
            } else {
                // Hide placeholder and initialize progress bar showing upload progress.
                _hidePlaceholder(viewFigure, viewWriter);
                _showProgressBar(viewFigure, viewWriter, loader, editor.editing.view);
                _displayLocalImage(imageUtils, viewFigure, viewWriter, loader);
            }
            return;
        }
        if (status == 'complete' && fileRepository.loaders.get(uploadId)) {
            _showCompleteIcon(viewFigure, viewWriter, editor.editing.view);
        }
        // Clean up.
        _hideProgressBar(viewFigure, viewWriter);
        _hidePlaceholder(viewFigure, viewWriter);
        _stopAppearEffect(viewFigure, viewWriter);
    };
}
/**
 * Adds ck-appear class to the image figure if one is not already applied.
 */ function _startAppearEffect(viewFigure, writer) {
    if (!viewFigure.hasClass('ck-appear')) {
        writer.addClass('ck-appear', viewFigure);
    }
}
/**
 * Removes ck-appear class to the image figure if one is not already removed.
 */ function _stopAppearEffect(viewFigure, writer) {
    writer.removeClass('ck-appear', viewFigure);
}
/**
 * Shows placeholder together with infinite progress bar on given image figure.
 */ function _showPlaceholder(imageUtils, placeholder, viewFigure, writer) {
    if (!viewFigure.hasClass('ck-image-upload-placeholder')) {
        writer.addClass('ck-image-upload-placeholder', viewFigure);
    }
    const viewImg = imageUtils.findViewImgElement(viewFigure);
    if (viewImg.getAttribute('src') !== placeholder) {
        writer.setAttribute('src', placeholder, viewImg);
    }
    if (!_getUIElement(viewFigure, 'placeholder')) {
        writer.insert(writer.createPositionAfter(viewImg), _createPlaceholder(writer));
    }
}
/**
 * Removes placeholder together with infinite progress bar on given image figure.
 */ function _hidePlaceholder(viewFigure, writer) {
    if (viewFigure.hasClass('ck-image-upload-placeholder')) {
        writer.removeClass('ck-image-upload-placeholder', viewFigure);
    }
    _removeUIElement(viewFigure, writer, 'placeholder');
}
/**
 * Shows progress bar displaying upload progress.
 * Attaches it to the file loader to update when upload percentace is changed.
 */ function _showProgressBar(viewFigure, writer, loader, view) {
    const progressBar = _createProgressBar(writer);
    writer.insert(writer.createPositionAt(viewFigure, 'end'), progressBar);
    // Update progress bar width when uploadedPercent is changed.
    loader.on('change:uploadedPercent', (evt, name, value)=>{
        view.change((writer)=>{
            writer.setStyle('width', value + '%', progressBar);
        });
    });
}
/**
 * Hides upload progress bar.
 */ function _hideProgressBar(viewFigure, writer) {
    _removeUIElement(viewFigure, writer, 'progressBar');
}
/**
 * Shows complete icon and hides after a certain amount of time.
 */ function _showCompleteIcon(viewFigure, writer, view) {
    const completeIcon = writer.createUIElement('div', {
        class: 'ck-image-upload-complete-icon'
    });
    writer.insert(writer.createPositionAt(viewFigure, 'end'), completeIcon);
    setTimeout(()=>{
        view.change((writer)=>writer.remove(writer.createRangeOn(completeIcon)));
    }, 3000);
}
/**
 * Create progress bar element using {@link module:engine/view/uielement~ViewUIElement}.
 */ function _createProgressBar(writer) {
    const progressBar = writer.createUIElement('div', {
        class: 'ck-progress-bar'
    });
    writer.setCustomProperty('progressBar', true, progressBar);
    return progressBar;
}
/**
 * Create placeholder element using {@link module:engine/view/uielement~ViewUIElement}.
 */ function _createPlaceholder(writer) {
    const placeholder = writer.createUIElement('div', {
        class: 'ck-upload-placeholder-loader'
    });
    writer.setCustomProperty('placeholder', true, placeholder);
    return placeholder;
}
/**
 * Returns {@link module:engine/view/uielement~ViewUIElement} of given unique property from image figure element.
 * Returns `undefined` if element is not found.
 */ function _getUIElement(imageFigure, uniqueProperty) {
    for (const child of imageFigure.getChildren()){
        if (child.getCustomProperty(uniqueProperty)) {
            return child;
        }
    }
}
/**
 * Removes {@link module:engine/view/uielement~ViewUIElement} of given unique property from image figure element.
 */ function _removeUIElement(viewFigure, writer, uniqueProperty) {
    const element = _getUIElement(viewFigure, uniqueProperty);
    if (element) {
        writer.remove(writer.createRangeOn(element));
    }
}
/**
 * Displays local data from file loader.
 */ function _displayLocalImage(imageUtils, viewFigure, writer, loader) {
    if (loader.data) {
        const viewImg = imageUtils.findViewImgElement(viewFigure);
        writer.setAttribute('src', loader.data, viewImg);
    }
}

/**
 * @module image/imageupload/uploadimagecommand
 */ /**
 * The upload image command.
 *
 * The command is registered by the {@link module:image/imageupload/imageuploadediting~ImageUploadEditing} plugin as `uploadImage`
 * and it is also available via aliased `imageUpload` name.
 *
 * In order to upload an image at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionRange} algorithm),
 * execute the command and pass the native image file instance:
 *
 * ```ts
 * this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
 * 	// Assuming that only images were pasted:
 * 	const images = Array.from( data.dataTransfer.files );
 *
 * 	// Upload the first image:
 * 	editor.execute( 'uploadImage', { file: images[ 0 ] } );
 * } );
 * ```
 *
 * It is also possible to insert multiple images at once:
 *
 * ```ts
 * editor.execute( 'uploadImage', {
 * 	file: [
 * 		file1,
 * 		file2
 * 	]
 * } );
 * ```
 */ class UploadImageCommand extends Command {
    /**
	 * Creates an instance of the `imageUlpoad` command. When executed, the command upload one of
	 * the currently selected image from computer.
	 *
	 * @param editor The editor instance.
	 */ constructor(editor){
        super(editor);
        this.set('isAccessAllowed', true);
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const selectedElement = editor.model.document.selection.getSelectedElement();
        // TODO: This needs refactoring.
        this.isEnabled = imageUtils.isImageAllowed() || imageUtils.isImage(selectedElement);
    }
    /**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Options for the executed command.
	 * @param options.file The image file or an array of image files to upload.
	 */ execute(options) {
        const files = toArray(options.file);
        const selection = this.editor.model.document.selection;
        const imageUtils = this.editor.plugins.get('ImageUtils');
        // In case of multiple files, each file (starting from the 2nd) will be inserted at a position that
        // follows the previous one. That will move the selection and, to stay on the safe side and make sure
        // all images inherit the same selection attributes, they are collected beforehand.
        //
        // Applying these attributes ensures, for instance, that inserting an (inline) image into a link does
        // not split that link but preserves its continuity.
        //
        // Note: Selection attributes that do not make sense for images will be filtered out by insertImage() anyway.
        const selectionAttributes = Object.fromEntries(selection.getAttributes());
        files.forEach((file, index)=>{
            const selectedElement = selection.getSelectedElement();
            // Inserting of an inline image replace the selected element and make a selection on the inserted image.
            // Therefore inserting multiple inline images requires creating position after each element.
            if (index && selectedElement && imageUtils.isImage(selectedElement)) {
                const position = this.editor.model.createPositionAfter(selectedElement);
                this._uploadImage(file, selectionAttributes, position);
            } else {
                this._uploadImage(file, selectionAttributes);
            }
        });
    }
    /**
	 * Handles uploading single file.
	 */ _uploadImage(file, attributes, position) {
        const editor = this.editor;
        const fileRepository = editor.plugins.get(FileRepository);
        const loader = fileRepository.createLoader(file);
        const imageUtils = editor.plugins.get('ImageUtils');
        // Do not throw when upload adapter is not set. FileRepository will log an error anyway.
        if (!loader) {
            return;
        }
        imageUtils.insertImage({
            ...attributes,
            uploadId: loader.id
        }, position);
    }
}

/**
 * The editing part of the image upload feature. It registers the `'uploadImage'` command
 * and the `imageUpload` command as an aliased name.
 *
 * When an image is uploaded, it fires the {@link ~ImageUploadEditing#event:uploadComplete `uploadComplete`} event
 * that allows adding custom attributes to the {@link module:engine/model/element~ModelElement image element}.
 */ class ImageUploadEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            FileRepository,
            Notification,
            ClipboardPipeline,
            ImageUtils
        ];
    }
    static get pluginName() {
        return 'ImageUploadEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * An internal mapping of {@link module:upload/filerepository~FileLoader#id file loader UIDs} and
	 * model elements during the upload.
	 *
	 * Model element of the uploaded image can change, for instance, when {@link module:image/image/imagetypecommand~ImageTypeCommand}
	 * is executed as a result of adding caption or changing image style. As a result, the upload logic must keep track of the model
	 * element (reference) and resolve the upload for the correct model element (instead of the one that landed in the `$graveyard`
	 * after image type changed).
	 */ _uploadImageElements;
    /**
	 * An internal mapping of {@link module:upload/filerepository~FileLoader#id file loader UIDs} and
	 * upload responses for handling images dragged during their upload process. When such images are later
	 * dropped, their original upload IDs no longer exist in the registry (as the original upload completed).
	 * This map preserves the upload responses to properly handle such cases.
	 */ _uploadedImages = new Map();
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('image', {
            upload: {
                types: [
                    'jpeg',
                    'png',
                    'gif',
                    'bmp',
                    'webp',
                    'tiff'
                ]
            }
        });
        this._uploadImageElements = new Map();
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const doc = editor.model.document;
        const conversion = editor.conversion;
        const fileRepository = editor.plugins.get(FileRepository);
        const imageUtils = editor.plugins.get('ImageUtils');
        const clipboardPipeline = editor.plugins.get('ClipboardPipeline');
        const imageTypes = createImageTypeRegExp(editor.config.get('image.upload.types'));
        const uploadImageCommand = new UploadImageCommand(editor);
        // Register `uploadImage` command and add `imageUpload` command as an alias for backward compatibility.
        editor.commands.add('uploadImage', uploadImageCommand);
        editor.commands.add('imageUpload', uploadImageCommand);
        // Register upcast converter for uploadId.
        conversion.for('upcast').attributeToAttribute({
            view: {
                name: 'img',
                key: 'uploadId'
            },
            model: 'uploadId'
        })// Handle the case when the image is not fully uploaded yet but it's being moved.
        // See more: https://github.com/ckeditor/ckeditor5/pull/17327
        .add((dispatcher)=>dispatcher.on('element:img', (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.test(data.viewItem, {
                    attributes: [
                        'data-ck-upload-id'
                    ]
                })) {
                    return;
                }
                const uploadId = data.viewItem.getAttribute('data-ck-upload-id');
                if (!uploadId) {
                    return;
                }
                const [modelElement] = Array.from(data.modelRange.getItems({
                    shallow: true
                }));
                const loader = fileRepository.loaders.get(uploadId);
                if (modelElement) {
                    // Handle case when `uploadId` is set on the image element but the loader is not present in the registry.
                    // It may happen when the image was successfully uploaded and the loader was removed from the registry.
                    // It's still present in the `_uploadedImages` map though. It's why we do not place this line in the condition below.
                    conversionApi.writer.setAttribute('uploadId', uploadId, modelElement);
                    conversionApi.consumable.consume(data.viewItem, {
                        attributes: [
                            'data-ck-upload-id'
                        ]
                    });
                    if (loader && loader.data) {
                        conversionApi.writer.setAttribute('uploadStatus', loader.status, modelElement);
                    }
                }
            }, {
                priority: 'low'
            }));
        // Handle pasted images.
        // For every image file, a new file loader is created and a placeholder image is
        // inserted into the content. Then, those images are uploaded once they appear in the model
        // (see Document#change listener below).
        this.listenTo(editor.editing.view.document, 'clipboardInput', (evt, data)=>{
            // Skip if non empty HTML data is included.
            // https://github.com/ckeditor/ckeditor5-upload/issues/68
            if (isHtmlInDataTransfer(data.dataTransfer)) {
                return;
            }
            const images = Array.from(data.dataTransfer.files).filter((file)=>{
                // See https://github.com/ckeditor/ckeditor5-image/pull/254.
                if (!file) {
                    return false;
                }
                return imageTypes.test(file.type);
            });
            if (!images.length) {
                return;
            }
            evt.stop();
            editor.model.change((writer)=>{
                // Set selection to paste target.
                if (data.targetRanges) {
                    writer.setSelection(data.targetRanges.map((viewRange)=>editor.editing.mapper.toModelRange(viewRange)));
                }
                editor.execute('uploadImage', {
                    file: images
                });
            });
            const uploadImageCommand = editor.commands.get('uploadImage');
            if (!uploadImageCommand.isAccessAllowed) {
                const notification = editor.plugins.get('Notification');
                const t = editor.locale.t;
                notification.showWarning(t('You have no image upload permissions.'), {
                    namespace: 'image'
                });
            }
        });
        // Handle HTML pasted with images with base64 or blob sources.
        // For every image file, a new file loader is created and a placeholder image is
        // inserted into the content. Then, those images are uploaded once they appear in the model
        // (see Document#change listener below).
        this.listenTo(clipboardPipeline, 'inputTransformation', (evt, data)=>{
            const fetchableImages = Array.from(editor.editing.view.createRangeIn(data.content)).map((value)=>value.item).filter((viewElement)=>isLocalImage(imageUtils, viewElement) && !viewElement.getAttribute('uploadProcessed')).map((viewElement)=>{
                return {
                    promise: fetchLocalImage(viewElement),
                    imageElement: viewElement
                };
            });
            if (!fetchableImages.length) {
                return;
            }
            const writer = new ViewUpcastWriter(editor.editing.view.document);
            for (const fetchableImage of fetchableImages){
                // Set attribute marking that the image was processed already.
                writer.setAttribute('uploadProcessed', true, fetchableImage.imageElement);
                const loader = fileRepository.createLoader(fetchableImage.promise);
                if (loader) {
                    writer.setAttribute('src', '', fetchableImage.imageElement);
                    writer.setAttribute('uploadId', loader.id, fetchableImage.imageElement);
                }
            }
        });
        // Prevents from the browser redirecting to the dropped image.
        editor.editing.view.document.on('dragover', (evt, data)=>{
            data.preventDefault();
        });
        // Upload placeholder images that appeared in the model.
        doc.on('change', ()=>{
            // Note: Reversing changes to start with insertions and only then handle removals. If it was the other way around,
            // loaders for **all** images that land in the $graveyard would abort while in fact only those that were **not** replaced
            // by other images should be aborted.
            const changes = doc.differ.getChanges({
                includeChangesInGraveyard: true
            }).reverse();
            const insertedImagesIds = new Set();
            for (const entry of changes){
                if (entry.type == 'insert' && entry.name != '$text') {
                    const item = entry.position.nodeAfter;
                    const isInsertedInGraveyard = entry.position.root.rootName == '$graveyard';
                    for (const imageElement of getImagesFromChangeItem(editor, item)){
                        // Check if the image element still has upload id.
                        const uploadId = imageElement.getAttribute('uploadId');
                        const uploadStatus = imageElement.getAttribute('uploadStatus');
                        // Check if status is complete to ensure that there were no additional reconversions
                        // in the same batch that set the status to 'complete'. It may happen when list item
                        // performed refresh of its children (including images) because `uploadStatus` attribute
                        // has been changed.
                        if (!uploadId || uploadStatus == 'complete') {
                            continue;
                        }
                        // Check if the image is loaded on this client.
                        const loader = fileRepository.loaders.get(uploadId);
                        if (!loader) {
                            // If the loader does not exist, it means that the image was already uploaded
                            // and the loader promise was removed from the registry. In that scenario we need
                            // to restore response object from the internal map.
                            if (!isInsertedInGraveyard && this._uploadedImages.has(uploadId)) {
                                // Fire `uploadComplete` to set proper attributes on the image element.
                                editor.model.enqueueChange({
                                    isUndoable: false
                                }, (writer)=>{
                                    writer.setAttribute('uploadStatus', 'complete', imageElement);
                                    this.fire('uploadComplete', {
                                        data: this._uploadedImages.get(uploadId),
                                        imageElement: imageElement
                                    });
                                });
                            // While it makes sense to remove the image from the `_uploadedImages` map here,
                            // it's counterintuitive for the user that pastes image in uploading several times.
                            // It'll work the first time, but the next time the image will be empty because the
                            // `_uploadedImages` no longer contain the response.
                            }
                            continue;
                        }
                        if (isInsertedInGraveyard) {
                            // If the image was inserted to the graveyard for good (**not** replaced by another image),
                            // only then abort the loading process.
                            if (!insertedImagesIds.has(uploadId)) {
                                // ... but abort it only if all remain images that share the same loader are in the graveyard too.
                                // This is to prevent situation when we have two images in uploading state and one of them is being
                                // placed in the graveyard (e.g. using undo). The other one should not be aborted.
                                const allImagesThatShareUploaderInGraveyard = Array.from(this._uploadImageElements.get(uploadId)).every((element)=>element.root.rootName == '$graveyard');
                                if (allImagesThatShareUploaderInGraveyard) {
                                    loader.abort();
                                }
                            }
                        } else {
                            // Remember the upload id of the inserted image. If it acted as a replacement for another
                            // image (which landed in the $graveyard), the related loader will not be aborted because
                            // this is still the same image upload.
                            insertedImagesIds.add(uploadId);
                            // Keep the mapping between the upload ID and the image model element so the upload
                            // can later resolve in the context of the correct model element. The model element could
                            // change for the same upload if one image was replaced by another (e.g. image type was changed),
                            // so this may also replace an existing mapping.
                            if (!this._uploadImageElements.has(uploadId)) {
                                this._uploadImageElements.set(uploadId, new Set([
                                    imageElement
                                ]));
                            } else {
                                this._uploadImageElements.get(uploadId).add(imageElement);
                            }
                            if (loader.status == 'idle') {
                                // If the image was inserted into content and has not been loaded yet, start loading it.
                                this._readAndUpload(loader);
                            }
                        }
                    }
                }
            }
        });
        // Set the default handler for feeding the image element with `src` and `srcset` attributes.
        // Also set the natural `width` and `height` attributes (if not already set).
        this.on('uploadComplete', (evt, { imageElement, data })=>{
            const urls = data.urls ? data.urls : data;
            this.editor.model.change((writer)=>{
                writer.setAttribute('src', urls.default, imageElement);
                this._parseAndSetSrcsetAttributeOnImage(urls, imageElement, writer);
                imageUtils.setImageNaturalSizeAttributes(imageElement);
            });
        }, {
            priority: 'low'
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const schema = this.editor.model.schema;
        // Setup schema to allow uploadId and uploadStatus for images.
        // Wait for ImageBlockEditing or ImageInlineEditing to register their elements first,
        // that's why doing this in afterInit() instead of init().
        if (this.editor.plugins.has('ImageBlockEditing')) {
            schema.extend('imageBlock', {
                allowAttributes: [
                    'uploadId',
                    'uploadStatus'
                ]
            });
            this._registerConverters('imageBlock');
        }
        if (this.editor.plugins.has('ImageInlineEditing')) {
            schema.extend('imageInline', {
                allowAttributes: [
                    'uploadId',
                    'uploadStatus'
                ]
            });
            this._registerConverters('imageInline');
        }
    }
    /**
	 * Reads and uploads an image.
	 *
	 * The image is read from the disk and as a Base64-encoded string it is set temporarily to
	 * `image[src]`. When the image is successfully uploaded, the temporary data is replaced with the target
	 * image's URL (the URL to the uploaded image on the server).
	 */ _readAndUpload(loader) {
        const editor = this.editor;
        const model = editor.model;
        const t = editor.locale.t;
        const fileRepository = editor.plugins.get(FileRepository);
        const notification = editor.plugins.get(Notification);
        const imageUtils = editor.plugins.get('ImageUtils');
        const imageUploadElements = this._uploadImageElements;
        model.enqueueChange({
            isUndoable: false
        }, (writer)=>{
            const elements = imageUploadElements.get(loader.id);
            for (const element of elements){
                writer.setAttribute('uploadStatus', 'reading', element);
            }
        });
        return loader.read().then(()=>{
            const promise = loader.upload();
            if (editor.ui) {
                editor.ui.ariaLiveAnnouncer.announce(t('Uploading image'));
            }
            for (const imageElement of imageUploadElements.get(loader.id)){
                // Force re–paint in Safari. Without it, the image will display with a wrong size.
                // https://github.com/ckeditor/ckeditor5/issues/1975
                /* istanbul ignore next -- @preserve */ if (env.isSafari) {
                    const viewFigure = editor.editing.mapper.toViewElement(imageElement);
                    const viewImg = imageUtils.findViewImgElement(viewFigure);
                    editor.editing.view.once('render', ()=>{
                        // Early returns just to be safe. There might be some code ran
                        // in between the outer scope and this callback.
                        if (!viewImg.parent) {
                            return;
                        }
                        const domFigure = editor.editing.view.domConverter.mapViewToDom(viewImg.parent);
                        if (!domFigure) {
                            return;
                        }
                        const originalDisplay = domFigure.style.display;
                        domFigure.style.display = 'none';
                        // Make sure this line will never be removed during minification for having "no effect".
                        domFigure._ckHack = domFigure.offsetHeight;
                        domFigure.style.display = originalDisplay;
                    });
                }
                model.enqueueChange({
                    isUndoable: false
                }, (writer)=>{
                    writer.setAttribute('uploadStatus', 'uploading', imageElement);
                });
            }
            return promise;
        }).then((data)=>{
            model.enqueueChange({
                isUndoable: false
            }, (writer)=>{
                for (const imageElement of imageUploadElements.get(loader.id)){
                    writer.setAttribute('uploadStatus', 'complete', imageElement);
                    this.fire('uploadComplete', {
                        data,
                        imageElement
                    });
                }
                if (editor.ui) {
                    editor.ui.ariaLiveAnnouncer.announce(t('Image upload complete'));
                }
                this._uploadedImages.set(loader.id, data);
            });
            clean();
        }).catch((error)=>{
            if (editor.ui) {
                editor.ui.ariaLiveAnnouncer.announce(t('Error during image upload'));
            }
            // If status is not 'error' nor 'aborted' - throw error because it means that something else went wrong,
            // it might be generic error and it would be real pain to find what is going on.
            if (loader.status !== 'error' && loader.status !== 'aborted') {
                throw error;
            }
            // Might be 'aborted'.
            if (loader.status == 'error' && error) {
                notification.showWarning(error, {
                    title: t('Upload failed'),
                    namespace: 'upload'
                });
            }
            // Permanently remove image from insertion batch.
            model.enqueueChange({
                isUndoable: false
            }, (writer)=>{
                for (const imageElement of imageUploadElements.get(loader.id)){
                    // Handle situation when the image has been removed and then `abort` exception was thrown.
                    // See: https://github.com/ckeditor/ckeditor5-commercial/issues/6817
                    if (imageElement.root.rootName !== '$graveyard') {
                        writer.remove(imageElement);
                    }
                }
            });
            clean();
        });
        function clean() {
            model.enqueueChange({
                isUndoable: false
            }, (writer)=>{
                for (const imageElement of imageUploadElements.get(loader.id)){
                    writer.removeAttribute('uploadId', imageElement);
                    writer.removeAttribute('uploadStatus', imageElement);
                }
                imageUploadElements.delete(loader.id);
            });
            fileRepository.destroyLoader(loader);
        }
    }
    /**
	 * Creates the `srcset` attribute based on a given file upload response and sets it as an attribute to a specific image element.
	 *
	 * @param data Data object from which `srcset` will be created.
	 * @param image The image element on which the `srcset` attribute will be set.
	 */ _parseAndSetSrcsetAttributeOnImage(data, image, writer) {
        // Srcset attribute for responsive images support.
        let maxWidth = 0;
        const srcsetAttribute = Object.keys(data)// Filter out keys that are not integers.
        .filter((key)=>{
            const width = parseInt(key, 10);
            if (!isNaN(width)) {
                maxWidth = Math.max(maxWidth, width);
                return true;
            }
        })// Convert each key to srcset entry.
        .map((key)=>`${data[key]} ${key}w`)// Join all entries.
        .join(', ');
        if (srcsetAttribute != '') {
            const attributes = {
                srcset: srcsetAttribute
            };
            if (!image.hasAttribute('width') && !image.hasAttribute('height')) {
                attributes.width = maxWidth;
            }
            writer.setAttributes(attributes, image);
        }
    }
    /**
	 * Registers image upload converters.
	 *
	 * @param imageType The type of the image.
	 */ _registerConverters(imageType) {
        const { conversion, plugins } = this.editor;
        const fileRepository = plugins.get(FileRepository);
        const imageUtils = plugins.get(ImageUtils);
        // It sets `data-ck-upload-id` attribute on the view image elements that are not fully uploaded.
        // It avoids the situation when image disappears when it's being moved and upload is not finished yet.
        // See more: https://github.com/ckeditor/ckeditor5/issues/16967
        conversion.for('dataDowncast').add((dispatcher)=>{
            dispatcher.on(`attribute:uploadId:${imageType}`, (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.test(data.item, evt.name)) {
                    return;
                }
                const loader = fileRepository.loaders.get(data.attributeNewValue);
                if (!loader || !loader.data) {
                    return null;
                }
                const viewElement = conversionApi.mapper.toViewElement(data.item);
                const img = imageUtils.findViewImgElement(viewElement);
                if (img) {
                    conversionApi.consumable.consume(data.item, evt.name);
                    conversionApi.writer.setAttribute('data-ck-upload-id', loader.id, img);
                }
            });
        });
    }
}
/**
 * TODO move this to the clipboard package.
 *
 * Returns `true` if non-empty `text/html` is included in the data transfer.
 */ function isHtmlInDataTransfer(dataTransfer) {
    return Array.from(dataTransfer.types).includes('text/html') && dataTransfer.getData('text/html') !== '';
}
function getImagesFromChangeItem(editor, item) {
    const imageUtils = editor.plugins.get('ImageUtils');
    return Array.from(editor.model.createRangeOn(item)).filter((value)=>imageUtils.isImage(value.item)).map((value)=>value.item);
}

/**
 * The image upload plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload image upload feature} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins to enable image uploading:
 *
 * * {@link module:image/imageupload/imageuploadediting~ImageUploadEditing},
 * * {@link module:image/imageupload/imageuploadui~ImageUploadUI},
 * * {@link module:image/imageupload/imageuploadprogress~ImageUploadProgress}.
 */ class ImageUpload extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageUpload';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUploadEditing,
            ImageUploadUI,
            ImageUploadProgress
        ];
    }
}

/**
 * The insert an image via URL view.
 *
 * See {@link module:image/imageinsert/imageinsertviaurlui~ImageInsertViaUrlUI}.
 *
 * @internal
 */ class ImageInsertUrlView extends View {
    /**
	 * The URL input field view.
	 */ urlInputView;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * Creates a view for the dropdown panel of {@link module:image/imageinsert/imageinsertui~ImageInsertUI}.
	 *
	 * @param locale The localization services instance.
	 */ constructor(locale){
        super(locale);
        this.set('imageURLInputValue', '');
        this.set('isImageSelected', false);
        this.set('isEnabled', true);
        this.keystrokes = new KeystrokeHandler();
        this.urlInputView = this._createUrlInputView();
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-image-insert-url'
                ],
                tabindex: '-1'
            },
            children: [
                this.urlInputView,
                {
                    tag: 'div',
                    attributes: {
                        class: [
                            'ck',
                            'ck-image-insert-url__action-row'
                        ]
                    }
                }
            ]
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        submitHandler({
            view: this
        });
        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Creates the {@link #urlInputView}.
	 */ _createUrlInputView() {
        const locale = this.locale;
        const t = locale.t;
        const urlInputView = new LabeledFieldView(locale, createLabeledInputText);
        urlInputView.bind('label').to(this, 'isImageSelected', (value)=>value ? t('Update image URL') : t('Insert image via URL'));
        urlInputView.bind('isEnabled').to(this);
        urlInputView.fieldView.inputMode = 'url';
        urlInputView.fieldView.placeholder = 'https://example.com/image.png';
        urlInputView.fieldView.bind('value').to(this, 'imageURLInputValue', (value)=>value || '');
        urlInputView.fieldView.on('input', ()=>{
            this.imageURLInputValue = urlInputView.fieldView.element.value.trim();
        });
        return urlInputView;
    }
    /**
	 * Focuses the view.
	 */ focus() {
        this.urlInputView.focus();
    }
}

/**
 * The image insert via URL plugin (UI part).
 *
 * The plugin introduces two UI components to the {@link module:ui/componentfactory~ComponentFactory UI component factory}:
 *
 * * the `'insertImageViaUrl'` toolbar button,
 * * the `'menuBar:insertImageViaUrl'` menu bar component.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component, which are default components
 * through which inserting image via URL is available.
 */ class ImageInsertViaUrlUI extends Plugin {
    _imageInsertUI;
    _formView;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageInsertViaUrlUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageInsertUI,
            Dialog
        ];
    }
    init() {
        this.editor.ui.componentFactory.add('insertImageViaUrl', ()=>this._createToolbarButton());
        this.editor.ui.componentFactory.add('menuBar:insertImageViaUrl', ()=>this._createMenuBarButton('standalone'));
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        this._imageInsertUI = this.editor.plugins.get('ImageInsertUI');
        this._imageInsertUI.registerIntegration({
            name: 'url',
            observable: ()=>this.editor.commands.get('insertImage'),
            buttonViewCreator: ()=>this._createToolbarButton(),
            formViewCreator: ()=>this._createDropdownButton(),
            menuBarButtonViewCreator: (isOnly)=>this._createMenuBarButton(isOnly ? 'insertOnly' : 'insertNested')
        });
    }
    /**
	 * Creates the base for various kinds of the button component provided by this feature.
	 */ _createInsertUrlButton(ButtonClass) {
        const button = new ButtonClass(this.editor.locale);
        button.icon = IconImageUrl;
        button.on('execute', ()=>{
            this._showModal();
        });
        return button;
    }
    /**
	 * Creates a simple toolbar button, with an icon and a tooltip.
	 */ _createToolbarButton() {
        const t = this.editor.locale.t;
        const button = this._createInsertUrlButton(ButtonView);
        button.tooltip = true;
        button.bind('label').to(this._imageInsertUI, 'isImageSelected', (isImageSelected)=>isImageSelected ? t('Update image URL') : t('Insert image via URL'));
        return button;
    }
    /**
	 * Creates a button for the dropdown view, with an icon, text and no tooltip.
	 */ _createDropdownButton() {
        const t = this.editor.locale.t;
        const button = this._createInsertUrlButton(ButtonView);
        button.withText = true;
        button.bind('label').to(this._imageInsertUI, 'isImageSelected', (isImageSelected)=>isImageSelected ? t('Update image URL') : t('Insert via URL'));
        return button;
    }
    /**
	 * Creates a button for the menu bar.
	 */ _createMenuBarButton(type) {
        const t = this.editor.locale.t;
        const button = this._createInsertUrlButton(MenuBarMenuListItemButtonView);
        button.withText = true;
        switch(type){
            case 'standalone':
                button.label = t('Image via URL');
                break;
            case 'insertOnly':
                button.label = t('Image');
                break;
            case 'insertNested':
                button.label = t('Via URL');
                break;
        }
        return button;
    }
    /**
	 * Creates the form view used to submit the image URL.
	 */ _createInsertUrlView() {
        const editor = this.editor;
        const locale = editor.locale;
        const replaceImageSourceCommand = editor.commands.get('replaceImageSource');
        const insertImageCommand = editor.commands.get('insertImage');
        const imageInsertUrlView = new ImageInsertUrlView(locale);
        imageInsertUrlView.bind('isImageSelected').to(this._imageInsertUI);
        imageInsertUrlView.bind('isEnabled').toMany([
            insertImageCommand,
            replaceImageSourceCommand
        ], 'isEnabled', (...isEnabled)=>isEnabled.some((isCommandEnabled)=>isCommandEnabled));
        return imageInsertUrlView;
    }
    /**
	 * Shows the insert image via URL form view in a modal.
	 */ _showModal() {
        const editor = this.editor;
        const locale = editor.locale;
        const t = locale.t;
        const dialog = editor.plugins.get('Dialog');
        if (!this._formView) {
            this._formView = this._createInsertUrlView();
            this._formView.on('submit', ()=>this._handleSave());
        }
        const replaceImageSourceCommand = editor.commands.get('replaceImageSource');
        this._formView.imageURLInputValue = replaceImageSourceCommand.value || '';
        dialog.show({
            id: 'insertImageViaUrl',
            title: t('Image via URL'),
            isModal: true,
            content: this._formView,
            actionButtons: [
                {
                    label: t('Cancel'),
                    withText: true,
                    onExecute: ()=>dialog.hide()
                },
                {
                    label: this._imageInsertUI.isImageSelected ? t('Save') : t('Insert'),
                    class: 'ck-button-action',
                    withText: true,
                    onExecute: ()=>this._handleSave()
                }
            ]
        });
    }
    /**
	 * Executes appropriate command depending on selection and form value.
	 */ _handleSave() {
        const replaceImageSourceCommand = this.editor.commands.get('replaceImageSource');
        // If an image element is currently selected, we want to replace its source attribute (instead of inserting a new image).
        // We detect if an image is selected by checking `replaceImageSource` command state.
        if (replaceImageSourceCommand.isEnabled) {
            this.editor.execute('replaceImageSource', {
                source: this._formView.imageURLInputValue
            });
        } else {
            this.editor.execute('insertImage', {
                source: this._formView.imageURLInputValue
            });
        }
        this.editor.plugins.get('Dialog').hide();
    }
}

/**
 * The image insert via URL plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-inserting
 * Insert images via source URL} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins
 * to enable image inserting via implemented integrations:
 *
 * * {@link module:image/imageinsert/imageinsertui~ImageInsertUI},
 */ class ImageInsertViaUrl extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageInsertViaUrl';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageInsertViaUrlUI,
            ImageInsertUI
        ];
    }
}

/**
 * The image insert plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/images-inserting Insert images via source URL} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins
 * to enable image uploading or inserting via implemented integrations:
 *
 * * {@link module:image/imageupload~ImageUpload}
 * * {@link module:image/imageinsert/imageinsertui~ImageInsertUI}
 */ class ImageInsert extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageInsert';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUpload,
            ImageInsertViaUrl,
            ImageInsertUI
        ];
    }
}

/**
 * The resize image command. Currently, it only supports the width attribute.
 */ class ResizeImageCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const element = imageUtils.getClosestSelectedImageElement(editor.model.document.selection);
        this.isEnabled = !!element;
        if (!element || !element.hasAttribute('resizedWidth')) {
            this.value = null;
        } else {
            this.value = {
                width: element.getAttribute('resizedWidth'),
                height: null
            };
        }
    }
    /**
	 * Executes the command.
	 *
	 * ```ts
	 * // Sets the width to 50%:
	 * editor.execute( 'resizeImage', { width: '50%' } );
	 *
	 * // Removes the width attribute:
	 * editor.execute( 'resizeImage', { width: null } );
	 * ```
	 *
	 * @param options
	 * @param options.width The new width of the image.
	 * @fires execute
	 */ execute(options) {
        const editor = this.editor;
        const model = editor.model;
        const imageUtils = editor.plugins.get('ImageUtils');
        const imageElement = imageUtils.getClosestSelectedImageElement(model.document.selection);
        this.value = {
            width: options.width,
            height: null
        };
        if (imageElement) {
            model.change((writer)=>{
                writer.setAttribute('resizedWidth', options.width, imageElement);
                writer.removeAttribute('resizedHeight', imageElement);
                imageUtils.setImageNaturalSizeAttributes(imageElement);
            });
        }
    }
}

/**
 * The image resize editing feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 */ class ImageResizeEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageResizeEditing';
    }
    /**
	 * @inheritDoc
	 * @internal
	 */ static get licenseFeatureCode() {
        return 'IR';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get isPremiumPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('image', {
            resizeUnit: '%',
            resizeOptions: [
                {
                    name: 'resizeImage:original',
                    value: null,
                    icon: 'original'
                },
                {
                    name: 'resizeImage:custom',
                    value: 'custom',
                    icon: 'custom'
                },
                {
                    name: 'resizeImage:25',
                    value: '25',
                    icon: 'small'
                },
                {
                    name: 'resizeImage:50',
                    value: '50',
                    icon: 'medium'
                },
                {
                    name: 'resizeImage:75',
                    value: '75',
                    icon: 'large'
                }
            ]
        });
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const resizeImageCommand = new ResizeImageCommand(editor);
        this._registerConverters('imageBlock');
        this._registerConverters('imageInline');
        // Register `resizeImage` command and add `imageResize` command as an alias for backward compatibility.
        editor.commands.add('resizeImage', resizeImageCommand);
        editor.commands.add('imageResize', resizeImageCommand);
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        this._registerSchema();
    }
    _registerSchema() {
        const schema = this.editor.model.schema;
        if (this.editor.plugins.has('ImageBlockEditing')) {
            schema.extend('imageBlock', {
                allowAttributes: [
                    'resizedWidth',
                    'resizedHeight'
                ]
            });
            schema.setAttributeProperties('resizedWidth', {
                isFormatting: true
            });
            schema.setAttributeProperties('resizedHeight', {
                isFormatting: true
            });
        }
        if (this.editor.plugins.has('ImageInlineEditing')) {
            schema.extend('imageInline', {
                allowAttributes: [
                    'resizedWidth',
                    'resizedHeight'
                ]
            });
            schema.setAttributeProperties('resizedWidth', {
                isFormatting: true
            });
            schema.setAttributeProperties('resizedHeight', {
                isFormatting: true
            });
        }
    }
    /**
	 * Registers image resize converters.
	 *
	 * @param imageType The type of the image.
	 */ _registerConverters(imageType) {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        // Dedicated converter to propagate image's attribute to the img tag.
        editor.conversion.for('downcast').add((dispatcher)=>dispatcher.on(`attribute:resizedWidth:${imageType}`, (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.consume(data.item, evt.name)) {
                    return;
                }
                const viewWriter = conversionApi.writer;
                const viewImg = conversionApi.mapper.toViewElement(data.item);
                if (data.attributeNewValue !== null) {
                    viewWriter.setStyle('width', data.attributeNewValue, viewImg);
                    viewWriter.addClass('image_resized', viewImg);
                } else {
                    viewWriter.removeStyle('width', viewImg);
                    viewWriter.removeClass('image_resized', viewImg);
                }
            }));
        editor.conversion.for('dataDowncast').attributeToAttribute({
            model: {
                name: imageType,
                key: 'resizedHeight'
            },
            view: (modelAttributeValue)=>({
                    key: 'style',
                    value: {
                        'height': modelAttributeValue
                    }
                })
        });
        editor.conversion.for('editingDowncast').add((dispatcher)=>dispatcher.on(`attribute:resizedHeight:${imageType}`, (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.consume(data.item, evt.name)) {
                    return;
                }
                const viewWriter = conversionApi.writer;
                const viewImg = conversionApi.mapper.toViewElement(data.item);
                const target = imageType === 'imageInline' ? imageUtils.findViewImgElement(viewImg) : viewImg;
                if (data.attributeNewValue !== null) {
                    viewWriter.setStyle('height', data.attributeNewValue, target);
                } else {
                    viewWriter.removeStyle('height', target);
                }
            }));
        editor.conversion.for('upcast').attributeToAttribute({
            view: {
                name: imageType === 'imageBlock' ? 'figure' : 'img',
                styles: {
                    width: /.+/
                }
            },
            model: {
                key: 'resizedWidth',
                value: (viewElement)=>{
                    if (widthAndHeightStylesAreBothSet(viewElement)) {
                        return null;
                    }
                    return viewElement.getStyle('width');
                }
            }
        });
        editor.conversion.for('upcast').attributeToAttribute({
            view: {
                name: imageType === 'imageBlock' ? 'figure' : 'img',
                styles: {
                    height: /.+/
                }
            },
            model: {
                key: 'resizedHeight',
                value: (viewElement)=>{
                    if (widthAndHeightStylesAreBothSet(viewElement)) {
                        return null;
                    }
                    return viewElement.getStyle('height');
                }
            }
        });
        editor.conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on(`element:${imageType === 'imageBlock' ? 'figure' : 'img'}`, (evt, data, conversionApi)=>{
                conversionApi.consumable.consume(data.viewItem, {
                    classes: [
                        'image_resized'
                    ]
                });
            });
        });
    }
}

const RESIZE_ICONS = /* #__PURE__ */ (()=>({
        small: IconObjectSizeSmall,
        medium: IconObjectSizeMedium,
        large: IconObjectSizeLarge,
        custom: IconObjectSizeCustom,
        original: IconObjectSizeFull
    }))();
/**
 * The image resize buttons plugin.
 *
 * It adds a possibility to resize images using the toolbar dropdown or individual buttons, depending on the plugin configuration.
 */ class ImageResizeButtons extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageResizeEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageResizeButtons';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * The resize unit.
	 * @default '%'
	 */ _resizeUnit;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._resizeUnit = editor.config.get('image.resizeUnit');
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const options = editor.config.get('image.resizeOptions');
        const command = editor.commands.get('resizeImage');
        this.bind('isEnabled').to(command);
        for (const option of options){
            this._registerImageResizeButton(option);
        }
        this._registerImageResizeDropdown(options);
    }
    /**
	 * A helper function that creates a standalone button component for the plugin.
	 *
	 * @param option A model of the resize option.
	 */ _registerImageResizeButton(option) {
        const editor = this.editor;
        const { name, value, icon } = option;
        editor.ui.componentFactory.add(name, (locale)=>{
            const button = new ButtonView(locale);
            const command = editor.commands.get('resizeImage');
            const labelText = this._getOptionLabelValue(option, true);
            if (!RESIZE_ICONS[icon]) {
                /**
				 * When configuring {@link module:image/imageconfig~ImageConfig#resizeOptions `config.image.resizeOptions`} for standalone
				 * buttons, a valid `icon` token must be set for each option.
				 *
				 * See all valid options described in the
				 * {@link module:image/imageconfig~ImageResizeOption plugin configuration}.
				 *
				 * @error imageresizebuttons-missing-icon
				 * @param {module:image/imageconfig~ImageResizeOption} option Invalid image resize option.
				*/ throw new CKEditorError('imageresizebuttons-missing-icon', editor, option);
            }
            button.set({
                // Use the `label` property for a verbose description (because of ARIA).
                label: labelText,
                icon: RESIZE_ICONS[icon],
                tooltip: labelText,
                isToggleable: true
            });
            // Bind button to the command.
            button.bind('isEnabled').to(this);
            if (editor.plugins.has('ImageCustomResizeUI') && isCustomImageResizeOption(option)) {
                const customResizeUI = editor.plugins.get('ImageCustomResizeUI');
                this.listenTo(button, 'execute', ()=>{
                    customResizeUI._showForm(this._resizeUnit);
                });
            } else {
                const optionValueWithUnit = value ? value + this._resizeUnit : null;
                button.bind('isOn').to(command, 'value', command, 'isEnabled', getIsOnButtonCallback(optionValueWithUnit));
                this.listenTo(button, 'execute', ()=>{
                    editor.execute('resizeImage', {
                        width: optionValueWithUnit
                    });
                });
            }
            return button;
        });
    }
    /**
	 * A helper function that creates a dropdown component for the plugin containing all the resize options defined in
	 * the editor configuration.
	 *
	 * @param options An array of configured options.
	 */ _registerImageResizeDropdown(options) {
        const editor = this.editor;
        const t = editor.t;
        const originalSizeOption = options.find((option)=>!option.value);
        const componentCreator = (locale)=>{
            const command = editor.commands.get('resizeImage');
            const dropdownView = createDropdown(locale, DropdownButtonView);
            const dropdownButton = dropdownView.buttonView;
            const accessibleLabel = t('Resize image');
            dropdownButton.set({
                tooltip: accessibleLabel,
                commandValue: originalSizeOption.value,
                icon: RESIZE_ICONS.medium,
                isToggleable: true,
                label: this._getOptionLabelValue(originalSizeOption),
                withText: true,
                class: 'ck-resize-image-button',
                ariaLabel: accessibleLabel,
                ariaLabelledBy: undefined
            });
            dropdownButton.bind('label').to(command, 'value', (commandValue)=>{
                if (commandValue && commandValue.width) {
                    return commandValue.width;
                } else {
                    return this._getOptionLabelValue(originalSizeOption);
                }
            });
            dropdownView.bind('isEnabled').to(this);
            addListToDropdown(dropdownView, ()=>this._getResizeDropdownListItemDefinitions(options, command), {
                ariaLabel: t('Image resize list'),
                role: 'menu'
            });
            // Execute command when an item from the dropdown is selected.
            this.listenTo(dropdownView, 'execute', (evt)=>{
                if ('onClick' in evt.source) {
                    evt.source.onClick();
                } else {
                    editor.execute(evt.source.commandName, {
                        width: evt.source.commandValue
                    });
                    editor.editing.view.focus();
                }
            });
            return dropdownView;
        };
        // Register `resizeImage` dropdown and add `imageResize` dropdown as an alias for backward compatibility.
        editor.ui.componentFactory.add('resizeImage', componentCreator);
        editor.ui.componentFactory.add('imageResize', componentCreator);
    }
    /**
	 * A helper function for creating an option label value string.
	 *
	 * @param option A resize option object.
	 * @param forTooltip An optional flag for creating a tooltip label.
	 * @returns A user-defined label combined from the numeric value and the resize unit or the default label
	 * for reset options (`Original`).
	 */ _getOptionLabelValue(option, forTooltip = false) {
        const t = this.editor.t;
        if (option.label) {
            return option.label;
        } else if (forTooltip) {
            if (isCustomImageResizeOption(option)) {
                return t('Custom image size');
            } else if (option.value) {
                return t('Resize image to %0', option.value + this._resizeUnit);
            } else {
                return t('Resize image to the original size');
            }
        } else {
            if (isCustomImageResizeOption(option)) {
                return t('Custom');
            } else if (option.value) {
                return option.value + this._resizeUnit;
            } else {
                return t('Original');
            }
        }
    }
    /**
	 * A helper function that parses the resize options and returns list item definitions ready for use in the dropdown.
	 *
	 * @param options The resize options.
	 * @param command The resize image command.
	 * @returns Dropdown item definitions.
	 */ _getResizeDropdownListItemDefinitions(options, command) {
        const { editor } = this;
        const itemDefinitions = new Collection();
        const optionsWithSerializedValues = options.map((option)=>{
            if (isCustomImageResizeOption(option)) {
                return {
                    ...option,
                    valueWithUnits: 'custom'
                };
            }
            if (!option.value) {
                return {
                    ...option,
                    valueWithUnits: null
                };
            }
            return {
                ...option,
                valueWithUnits: `${option.value}${this._resizeUnit}`
            };
        });
        for (const option of optionsWithSerializedValues){
            let definition = null;
            if (editor.plugins.has('ImageCustomResizeUI') && isCustomImageResizeOption(option)) {
                const customResizeUI = editor.plugins.get('ImageCustomResizeUI');
                definition = {
                    type: 'button',
                    model: new UIModel({
                        label: this._getOptionLabelValue(option),
                        role: 'menuitemradio',
                        withText: true,
                        icon: null,
                        onClick: ()=>{
                            customResizeUI._showForm(this._resizeUnit);
                        }
                    })
                };
                const allDropdownValues = Object.values(optionsWithSerializedValues).map((option)=>option.valueWithUnits);
                definition.model.bind('isOn').to(command, 'value', command, 'isEnabled', getIsOnCustomButtonCallback(allDropdownValues));
            } else {
                definition = {
                    type: 'button',
                    model: new UIModel({
                        commandName: 'resizeImage',
                        commandValue: option.valueWithUnits,
                        label: this._getOptionLabelValue(option),
                        role: 'menuitemradio',
                        withText: true,
                        icon: null
                    })
                };
                definition.model.bind('isOn').to(command, 'value', command, 'isEnabled', getIsOnButtonCallback(option.valueWithUnits));
            }
            definition.model.bind('isEnabled').to(command, 'isEnabled');
            itemDefinitions.add(definition);
        }
        return itemDefinitions;
    }
}
/**
 * A helper that checks if provided option triggers custom resize balloon.
 */ function isCustomImageResizeOption(option) {
    return option.value === 'custom';
}
/**
 * A helper function for setting the `isOn` state of buttons in value bindings.
 */ function getIsOnButtonCallback(value) {
    return (commandValue, isEnabled)=>{
        const objectCommandValue = commandValue;
        if (objectCommandValue === undefined || !isEnabled) {
            return false;
        }
        if (value === null && objectCommandValue === value) {
            return true;
        }
        return objectCommandValue !== null && objectCommandValue.width === value;
    };
}
/**
 * A helper function for setting the `isOn` state of custom size button in value bindings.
 */ function getIsOnCustomButtonCallback(allDropdownValues) {
    return (commandValue, isEnabled)=>!allDropdownValues.some((dropdownValue)=>getIsOnButtonCallback(dropdownValue)(commandValue, isEnabled));
}

const RESIZABLE_IMAGES_CSS_SELECTOR = 'figure.image.ck-widget > img,' + 'figure.image.ck-widget > picture > img,' + 'figure.image.ck-widget > a > img,' + 'figure.image.ck-widget > a > picture > img,' + 'span.image-inline.ck-widget > img,' + 'span.image-inline.ck-widget > picture > img';
const RESIZED_IMAGE_CLASS = 'image_resized';
/**
 * The image resize by handles feature.
 *
 * It adds the ability to resize each image using handles or manually by
 * {@link module:image/imageresize/imageresizebuttons~ImageResizeButtons} buttons.
 */ class ImageResizeHandles extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            WidgetResize,
            ImageUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageResizeHandles';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ init() {
        const command = this.editor.commands.get('resizeImage');
        this.bind('isEnabled').to(command);
        this._setupResizerCreator();
    }
    /**
	 * Attaches the listeners responsible for creating a resizer for each image, except for images inside the HTML embed preview.
	 */ _setupResizerCreator() {
        const editor = this.editor;
        const editingView = editor.editing.view;
        const imageUtils = editor.plugins.get('ImageUtils');
        editingView.addObserver(ImageLoadObserver);
        this.listenTo(editingView.document, 'imageLoaded', (evt, domEvent)=>{
            // The resizer must be attached only to images loaded by the `ImageInsert`, `ImageUpload` or `LinkImage` plugins.
            if (!domEvent.target.matches(RESIZABLE_IMAGES_CSS_SELECTOR)) {
                return;
            }
            const domConverter = editor.editing.view.domConverter;
            const imageView = domConverter.domToView(domEvent.target);
            const widgetView = imageUtils.getImageWidgetFromImageView(imageView);
            let resizer = this.editor.plugins.get(WidgetResize).getResizerByViewElement(widgetView);
            if (resizer) {
                // There are rare cases when the image will be triggered multiple times for the same widget, e.g. when
                // the image's source was changed after upload (https://github.com/ckeditor/ckeditor5/pull/8108#issuecomment-708302992).
                resizer.redraw();
                return;
            }
            const mapper = editor.editing.mapper;
            const imageModel = mapper.toModelElement(widgetView);
            resizer = editor.plugins.get(WidgetResize).attachTo({
                unit: editor.config.get('image.resizeUnit'),
                modelElement: imageModel,
                viewElement: widgetView,
                editor,
                getHandleHost (domWidgetElement) {
                    return domWidgetElement.querySelector('img');
                },
                getResizeHost () {
                    return domConverter.mapViewToDom(mapper.toViewElement(imageModel));
                },
                isCentered () {
                    const imageStyle = imageModel.getAttribute('imageStyle');
                    return imageStyle == 'alignCenter';
                },
                onCommit (newValue) {
                    // Get rid of the CSS class in case the command execution that follows is unsuccessful
                    // (e.g. Track Changes can override it and the new dimensions will not apply). Otherwise,
                    // the presence of the class and the absence of the width style will cause it to take 100%
                    // of the horizontal space.
                    editingView.change((writer)=>{
                        writer.removeClass(RESIZED_IMAGE_CLASS, widgetView);
                    });
                    editor.execute('resizeImage', {
                        width: newValue
                    });
                }
            });
            resizer.on('updateSize', ()=>{
                if (!widgetView.hasClass(RESIZED_IMAGE_CLASS)) {
                    editingView.change((writer)=>{
                        writer.addClass(RESIZED_IMAGE_CLASS, widgetView);
                    });
                }
                const target = imageModel.name === 'imageInline' ? imageView : widgetView;
                if (target.getStyle('height')) {
                    editingView.change((writer)=>{
                        writer.removeStyle('height', target);
                    });
                }
            });
            resizer.bind('isEnabled').to(this);
        });
    }
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module image/imageresize/utils/tryparsedimensionwithunit
 */ /**
 * Parses provided string with dimension value and returns extracted numeric value and unit.
 *
 * 	* If non-string dimension is passed then `null` value is returned.
 * 	* If unit is missing then `null` is returned.
 * 	* If numeric value part of string is not a number then `null` is returned.
 *
 * Example:
 * 	`"222px"` => `{ value: 222, unit: "px" }`
 *	`"99%"` => `{ value: 99, unit: "%" }`

 * @param dimension Unsafe string with dimension.
 * @returns Parsed dimension with extracted numeric value and units.
 * @internal
 */ function tryParseDimensionWithUnit(dimension) {
    if (!dimension) {
        return null;
    }
    const [, rawValue, unit] = dimension.trim().match(/([.,\d]+)(%|px)$/) || [];
    const parsedValue = Number.parseFloat(rawValue);
    if (Number.isNaN(parsedValue)) {
        return null;
    }
    return {
        value: parsedValue,
        unit
    };
}
/**
 * Converts dimension between `px` -> `%` and `%` -> `px`.
 *
 * @param parentDimensionPx	Dimension of parent element that contains measured element.
 * @param dimension Measured element dimension.
 * @returns Casted dimension.
 * @internal
 */ function tryCastDimensionsToUnit(parentDimensionPx, dimension, targetUnit) {
    // "%" -> "px" conversion
    if (targetUnit === 'px') {
        return {
            value: dimension.value,
            unit: 'px'
        };
    }
    // "px" -> "%" conversion
    return {
        value: dimension.value / parentDimensionPx * 100,
        unit: '%'
    };
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module image/imageresize/utils/getselectedimageeditornodes
 */ /**
 * Finds model, view and DOM element for selected image element. Returns `null` if there is no image selected.
 *
 * @param editor Editor instance.
 * @internal
 */ function getSelectedImageEditorNodes(editor) {
    const { editing } = editor;
    const imageUtils = editor.plugins.get('ImageUtils');
    const imageModelElement = imageUtils.getClosestSelectedImageElement(editor.model.document.selection);
    if (!imageModelElement) {
        return null;
    }
    const imageViewElement = editing.mapper.toViewElement(imageModelElement);
    const imageDOMElement = editing.view.domConverter.mapViewToDom(imageViewElement);
    return {
        model: imageModelElement,
        view: imageViewElement,
        dom: imageDOMElement
    };
}

/**
 * Returns image width in specified units. It is width of image after resize.
 *
 * 	* If image is not selected or command is disabled then `null` will be returned.
 * 	* If image is not fully loaded (and it is impossible to determine its natural size) then `null` will be returned.
 *	* If `targetUnit` percentage is passed then it will return width percentage of image related to its accessors.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Parsed image width after resize (with unit).
 * @internal
 */ function getSelectedImageWidthInUnits(editor, targetUnit) {
    const imageNodes = getSelectedImageEditorNodes(editor);
    if (!imageNodes) {
        return null;
    }
    const parsedResizedWidth = tryParseDimensionWithUnit(imageNodes.model.getAttribute('resizedWidth') || null);
    if (!parsedResizedWidth) {
        return null;
    }
    if (parsedResizedWidth.unit === targetUnit) {
        return parsedResizedWidth;
    }
    const imageParentWidthPx = calculateResizeHostAncestorWidth(imageNodes.dom);
    const imageHolderDimension = {
        value: new Rect(imageNodes.dom).width
    };
    return tryCastDimensionsToUnit(imageParentWidthPx, imageHolderDimension, targetUnit);
}

/**
 * The ImageCustomResizeFormView class.
 *
 * @internal
 */ class ImageCustomResizeFormView extends View {
    /**
	 * Tracks information about the DOM focus in the form.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * Resize unit shortcut.
	 */ unit;
    /**
	 * The Back button view displayed in the header.
	 */ backButtonView;
    /**
	 * A button used to submit the form.
	 */ saveButtonView;
    /**
	 * An input with a label.
	 */ labeledInput;
    /**
	 * A collection of child views.
	 */ children;
    /**
	 * A collection of views which can be focused in the form.
	 */ _focusables;
    /**
	 * Helps cycling over {@link #_focusables} in the form.
	 */ _focusCycler;
    /**
	 * An array of form validators used by {@link #isValid}.
	 */ _validators;
    /**
	 * @inheritDoc
	 */ constructor(locale, unit, validators){
        super(locale);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.unit = unit;
        // Create buttons.
        this.backButtonView = this._createBackButton();
        this.saveButtonView = this._createSaveButton();
        // Create input fields.
        this.labeledInput = this._createLabeledInputView();
        this.children = this.createCollection([
            this._createHeaderView()
        ]);
        this.children.add(new FormRowView(locale, {
            children: [
                this.labeledInput,
                this.saveButtonView
            ],
            class: [
                'ck-form__row_with-submit',
                'ck-form__row_large-top-padding'
            ]
        }));
        this._focusables = new ViewCollection();
        this._validators = validators;
        // Close the panel on esc key press when the **form has focus**.
        this.keystrokes.set('Esc', (data, cancel)=>{
            this.fire('cancel');
            cancel();
        });
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab'
            }
        });
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-form',
                    'ck-image-custom-resize-form',
                    'ck-responsive-form'
                ],
                // https://github.com/ckeditor/ckeditor5-image/issues/40
                tabindex: '-1'
            },
            children: this.children
        });
    }
    /**
	 * @inheritDoc
	 */ render() {
        super.render();
        submitHandler({
            view: this
        });
        const childViews = [
            this.backButtonView,
            this.labeledInput,
            this.saveButtonView
        ];
        childViews.forEach((v)=>{
            // Register the view as focusable.
            this._focusables.add(v);
            // Register the view in the focus tracker.
            this.focusTracker.add(v.element);
        });
        this.keystrokes.listenTo(this.element);
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }
    /**
	 * Creates a back button view that cancels the form.
	 */ _createBackButton() {
        const t = this.locale.t;
        const backButton = new ButtonView(this.locale);
        backButton.set({
            class: 'ck-button-back',
            label: t('Back'),
            icon: IconPreviousArrow,
            tooltip: true
        });
        backButton.delegate('execute').to(this, 'cancel');
        return backButton;
    }
    /**
	 * Creates a save button view that resize the image.
	 */ _createSaveButton() {
        const t = this.locale.t;
        const saveButton = new ButtonView(this.locale);
        saveButton.set({
            label: t('Save'),
            withText: true,
            type: 'submit',
            class: 'ck-button-action ck-button-bold'
        });
        return saveButton;
    }
    /**
	 * Creates a header view for the form.
	 */ _createHeaderView() {
        const t = this.locale.t;
        const header = new FormHeaderView(this.locale, {
            label: t('Image Resize')
        });
        header.children.add(this.backButtonView, 0);
        return header;
    }
    /**
	 * Creates an input with a label.
	 *
	 * @returns Labeled field view instance.
	 */ _createLabeledInputView() {
        const t = this.locale.t;
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputNumber);
        labeledInput.label = t('Resize image (in %0)', this.unit);
        labeledInput.class = 'ck-labeled-field-view_full-width';
        labeledInput.fieldView.set({
            step: 0.1
        });
        return labeledInput;
    }
    /**
	 * Validates the form and returns `false` when some fields are invalid.
	 */ isValid() {
        this.resetFormStatus();
        for (const validator of this._validators){
            const errorText = validator(this);
            // One error per field is enough.
            if (errorText) {
                // Apply updated error.
                this.labeledInput.errorText = errorText;
                return false;
            }
        }
        return true;
    }
    /**
	 * Cleans up the supplementary error and information text of the {@link #labeledInput}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */ resetFormStatus() {
        this.labeledInput.errorText = null;
    }
    /**
	 * The native DOM `value` of the input element of {@link #labeledInput}.
	 */ get rawSize() {
        const { element } = this.labeledInput.fieldView;
        if (!element) {
            return null;
        }
        return element.value;
    }
    /**
	 * Get numeric value of size. Returns `null` if value of size input element in {@link #labeledInput}.is not a number.
	 */ get parsedSize() {
        const { rawSize } = this;
        if (rawSize === null) {
            return null;
        }
        const parsed = Number.parseFloat(rawSize);
        if (Number.isNaN(parsed)) {
            return null;
        }
        return parsed;
    }
    /**
	 * Returns serialized image input size with unit.
	 * Returns `null` if value of size input element in {@link #labeledInput}.is not a number.
	 */ get sizeWithUnits() {
        const { parsedSize, unit } = this;
        if (parsedSize === null) {
            return null;
        }
        return `${parsedSize}${unit}`;
    }
}

/**
 * Returns min and max value of resize image in specified unit.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Possible resize range in numeric form.
 * @internal
 */ function getSelectedImagePossibleResizeRange(editor, targetUnit) {
    const imageNodes = getSelectedImageEditorNodes(editor);
    if (!imageNodes) {
        return null;
    }
    const imageParentWidthPx = calculateResizeHostAncestorWidth(imageNodes.dom);
    const minimumImageWidth = tryParseDimensionWithUnit(window.getComputedStyle(imageNodes.dom).minWidth) || {
        value: 1};
    const lower = Math.max(0.1, tryCastDimensionsToUnit(imageParentWidthPx, minimumImageWidth, targetUnit).value);
    const upper = targetUnit === 'px' ? imageParentWidthPx : 100;
    return {
        unit: targetUnit,
        lower,
        upper
    };
}

/**
 * The custom resize image UI plugin.
 *
 * The plugin uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 */ class ImageCustomResizeUI extends Plugin {
    /**
	 * The contextual balloon plugin instance.
	 */ _balloon;
    /**
	 * A form containing a textarea and buttons, used to change the `alt` text value.
	 */ _form;
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ContextualBalloon
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageCustomResizeUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        super.destroy();
        // Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
        if (this._form) {
            this._form.destroy();
        }
    }
    /**
	 * Creates the {@link module:image/imageresize/ui/imagecustomresizeformview~ImageCustomResizeFormView}
	 * form.
	 */ _createForm(unit) {
        const editor = this.editor;
        this._balloon = this.editor.plugins.get('ContextualBalloon');
        this._form = new (CssTransitionDisablerMixin(ImageCustomResizeFormView))(editor.locale, unit, getFormValidators(editor));
        // Render the form so its #element is available for clickOutsideHandler.
        this._form.render();
        this.listenTo(this._form, 'submit', ()=>{
            if (this._form.isValid()) {
                editor.execute('resizeImage', {
                    width: this._form.sizeWithUnits
                });
                this._hideForm(true);
            }
        });
        // Update balloon position when form error label is added .
        this.listenTo(this._form.labeledInput, 'change:errorText', ()=>{
            editor.ui.update();
        });
        this.listenTo(this._form, 'cancel', ()=>{
            this._hideForm(true);
        });
        // Close on click outside of balloon panel element.
        clickOutsideHandler({
            emitter: this._form,
            activator: ()=>this._isVisible,
            contextElements: ()=>[
                    this._balloon.view.element
                ],
            callback: ()=>this._hideForm()
        });
    }
    /**
	 * Shows the {@link #_form} in the {@link #_balloon}.
	 *
	 * @internal
	 */ _showForm(unit) {
        if (this._isVisible) {
            return;
        }
        if (!this._form) {
            this._createForm(unit);
        }
        const editor = this.editor;
        const labeledInput = this._form.labeledInput;
        this._form.disableCssTransitions();
        this._form.resetFormStatus();
        if (!this._isInBalloon) {
            this._balloon.add({
                view: this._form,
                position: getBalloonPositionData(editor)
            });
        }
        // Make sure that each time the panel shows up, the field remains in sync with the value of
        // the command. If the user typed in the input, then canceled the balloon (`labeledInput#value`
        // stays unaltered) and re-opened it without changing the value of the command, they would see the
        // old value instead of the actual value of the command.
        const currentParsedWidth = getSelectedImageWidthInUnits(editor, unit);
        const initialInputValue = currentParsedWidth ? currentParsedWidth.value.toFixed(1) : '';
        const possibleRange = getSelectedImagePossibleResizeRange(editor, unit);
        labeledInput.fieldView.value = labeledInput.fieldView.element.value = initialInputValue;
        if (possibleRange) {
            Object.assign(labeledInput.fieldView, {
                min: possibleRange.lower.toFixed(1),
                max: Math.ceil(possibleRange.upper).toFixed(1)
            });
        }
        this._form.labeledInput.fieldView.select();
        this._form.enableCssTransitions();
    }
    /**
	 * Removes the {@link #_form} from the {@link #_balloon}.
	 *
	 * @param focusEditable Controls whether the editing view is focused afterwards.
	 */ _hideForm(focusEditable = false) {
        if (!this._isInBalloon) {
            return;
        }
        // Blur the input element before removing it from DOM to prevent issues in some browsers.
        // See https://github.com/ckeditor/ckeditor5/issues/1501.
        if (this._form.focusTracker.isFocused) {
            this._form.saveButtonView.focus();
        }
        this._balloon.remove(this._form);
        if (focusEditable) {
            this.editor.editing.view.focus();
        }
    }
    /**
	 * Returns `true` when the {@link #_form} is the visible view in the {@link #_balloon}.
	 */ get _isVisible() {
        return !!this._balloon && this._balloon.visibleView === this._form;
    }
    /**
	 * Returns `true` when the {@link #_form} is in the {@link #_balloon}.
	 */ get _isInBalloon() {
        return !!this._balloon && this._balloon.hasView(this._form);
    }
}
/**
 * Returns image resize form validation callbacks.
 *
 * @param editor Editor instance.
 */ function getFormValidators(editor) {
    const t = editor.t;
    return [
        (form)=>{
            if (form.rawSize.trim() === '') {
                return t('The value must not be empty.');
            }
            if (form.parsedSize === null) {
                return t('The value should be a plain number.');
            }
        }
    ];
}

/**
 * The image resize plugin.
 *
 * It adds a possibility to resize each image using handles.
 */ class ImageResize extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageResizeEditing,
            ImageResizeHandles,
            ImageCustomResizeUI,
            ImageResizeButtons
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageResize';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The image style command. It is used to apply {@link module:image/imageconfig~ImageStyleConfig#options image style option}
 * to a selected image.
 *
 * **Note**: Executing this command may change the image model element if the desired style requires an image of a different
 * type. See {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute} to learn more.
 */ class ImageStyleCommand extends Command {
    /**
	 * An object containing names of default style options for the inline and block images.
	 * If there is no default style option for the given image type in the configuration,
	 * the name will be `false`.
	 */ _defaultStyles;
    /**
	 * The styles handled by this command.
	 */ _styles;
    /**
	 * Creates an instance of the image style command. When executed, the command applies one of
	 * {@link module:image/imageconfig~ImageStyleConfig#options style options} to the currently selected image.
	 *
	 * @param editor The editor instance.
	 * @param styles The style options that this command supports.
	 */ constructor(editor, styles){
        super(editor);
        this._defaultStyles = {
            imageBlock: false,
            imageInline: false
        };
        this._styles = new Map(styles.map((style)=>{
            if (style.isDefault) {
                for (const modelElementName of style.modelElements){
                    this._defaultStyles[modelElementName] = style.name;
                }
            }
            return [
                style.name,
                style
            ];
        }));
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        const imageUtils = editor.plugins.get('ImageUtils');
        const element = imageUtils.getClosestSelectedImageElement(this.editor.model.document.selection);
        this.isEnabled = !!element;
        if (!this.isEnabled) {
            this.value = false;
        } else if (element.hasAttribute('imageStyle')) {
            this.value = element.getAttribute('imageStyle');
        } else {
            this.value = this._defaultStyles[element.name];
        }
    }
    /**
	 * Executes the command and applies the style to the currently selected image:
	 *
	 * ```ts
	 * editor.execute( 'imageStyle', { value: 'side' } );
	 * ```
	 *
	 * **Note**: Executing this command may change the image model element if the desired style requires an image
	 * of a different type. Learn more about {@link module:image/imageconfig~ImageStyleOptionDefinition#modelElements model element}
	 * configuration for the style option.
	 *
	 * @param options.value The name of the style (as configured in {@link module:image/imageconfig~ImageStyleConfig#options}).
	 * @param options.setImageSizes Specifies whether the image `width` and `height` attributes should be set automatically.
	 * The default is `true`.
	 * @fires execute
	 */ execute(options = {}) {
        const editor = this.editor;
        const model = editor.model;
        const imageUtils = editor.plugins.get('ImageUtils');
        model.change((writer)=>{
            const requestedStyle = options.value;
            const { setImageSizes = true } = options;
            let imageElement = imageUtils.getClosestSelectedImageElement(model.document.selection);
            // Change the image type if a style requires it.
            if (requestedStyle && this.shouldConvertImageType(requestedStyle, imageElement)) {
                this.editor.execute(imageUtils.isBlockImage(imageElement) ? 'imageTypeInline' : 'imageTypeBlock', {
                    setImageSizes
                });
                // Update the imageElement to the newly created image.
                imageElement = imageUtils.getClosestSelectedImageElement(model.document.selection);
            }
            // Default style means that there is no `imageStyle` attribute in the model.
            // https://github.com/ckeditor/ckeditor5-image/issues/147
            if (!requestedStyle || this._styles.get(requestedStyle).isDefault) {
                writer.removeAttribute('imageStyle', imageElement);
            } else {
                writer.setAttribute('imageStyle', requestedStyle, imageElement);
            }
            if (setImageSizes) {
                imageUtils.setImageNaturalSizeAttributes(imageElement);
            }
        });
    }
    /**
	 * Returns `true` if requested style change would trigger the image type change.
	 *
	 * @param requestedStyle The name of the style (as configured in {@link module:image/imageconfig~ImageStyleConfig#options}).
	 * @param imageElement The image model element.
	 */ shouldConvertImageType(requestedStyle, imageElement) {
        const supportedTypes = this._styles.get(requestedStyle).modelElements;
        return !supportedTypes.includes(imageElement.name);
    }
}

/**
 * Default image style options provided by the plugin that can be referred in the {@link module:image/imageconfig~ImageConfig#styles}
 * configuration.
 *
 * There are available 5 styles focused on formatting:
 *
 * * **`'alignLeft'`** aligns the inline or block image to the left and wraps it with the text using the `image-style-align-left` class,
 * * **`'alignRight'`** aligns the inline or block image to the right and wraps it with the text using the `image-style-align-right` class,
 * * **`'alignCenter'`** centers the block image using the `image-style-align-center` class,
 * * **`'alignBlockLeft'`** aligns the block image to the left using the `image-style-block-align-left` class,
 * * **`'alignBlockRight'`** aligns the block image to the right using the `image-style-block-align-right` class,
 *
 * and 3 semantic styles:
 *
 * * **`'inline'`** is an inline image without any CSS class,
 * * **`'block'`** is a block image without any CSS class,
 * * **`'side'`** is a block image styled with the `image-style-side` CSS class.
 *
 * @internal
 */ const DEFAULT_OPTIONS = {
    // This style represents an image placed in the line of text.
    get inline () {
        return {
            name: 'inline',
            title: 'In line',
            icon: IconObjectInline,
            modelElements: [
                'imageInline'
            ],
            isDefault: true
        };
    },
    // This style represents an image aligned to the left and wrapped with text.
    get alignLeft () {
        return {
            name: 'alignLeft',
            title: 'Left aligned image',
            icon: IconObjectInlineLeft,
            modelElements: [
                'imageBlock',
                'imageInline'
            ],
            className: 'image-style-align-left'
        };
    },
    // This style represents an image aligned to the left.
    get alignBlockLeft () {
        return {
            name: 'alignBlockLeft',
            title: 'Left aligned image',
            icon: IconObjectLeft,
            modelElements: [
                'imageBlock'
            ],
            className: 'image-style-block-align-left'
        };
    },
    // This style represents a centered image.
    get alignCenter () {
        return {
            name: 'alignCenter',
            title: 'Centered image',
            icon: IconObjectCenter,
            modelElements: [
                'imageBlock'
            ],
            className: 'image-style-align-center'
        };
    },
    // This style represents an image aligned to the right and wrapped with text.
    get alignRight () {
        return {
            name: 'alignRight',
            title: 'Right aligned image',
            icon: IconObjectInlineRight,
            modelElements: [
                'imageBlock',
                'imageInline'
            ],
            className: 'image-style-align-right'
        };
    },
    // This style represents an image aligned to the right.
    get alignBlockRight () {
        return {
            name: 'alignBlockRight',
            title: 'Right aligned image',
            icon: IconObjectRight,
            modelElements: [
                'imageBlock'
            ],
            className: 'image-style-block-align-right'
        };
    },
    // This option is equal to the situation when no style is applied.
    get block () {
        return {
            name: 'block',
            title: 'Centered image',
            icon: IconObjectCenter,
            modelElements: [
                'imageBlock'
            ],
            isDefault: true
        };
    },
    // This represents a side image.
    get side () {
        return {
            name: 'side',
            title: 'Side image',
            icon: IconObjectInlineRight,
            modelElements: [
                'imageBlock'
            ],
            className: 'image-style-side'
        };
    }
};
/**
 * Default image style icons provided by the plugin that can be referred in the {@link module:image/imageconfig~ImageConfig#styles}
 * configuration.
 *
 * See {@link module:image/imageconfig~ImageStyleOptionDefinition#icon} to learn more.
 *
 * There are 7 default icons available: `'full'`, `'left'`, `'inlineLeft'`, `'center'`, `'right'`, `'inlineRight'`, and `'inline'`.
 *
 * @internal
 */ const DEFAULT_ICONS = /* #__PURE__ */ (()=>({
        full: IconObjectFullWidth,
        left: IconObjectLeft,
        right: IconObjectRight,
        center: IconObjectCenter,
        inlineLeft: IconObjectInlineLeft,
        inlineRight: IconObjectInlineRight,
        inline: IconObjectInline
    }))();
/**
 * Default drop-downs provided by the plugin that can be referred in the {@link module:image/imageconfig~ImageConfig#toolbar}
 * configuration. The drop-downs are containers for the {@link module:image/imageconfig~ImageStyleConfig#options image style options}.
 *
 * If both of the `ImageEditing` plugins are loaded, there are 2 predefined drop-downs available:
 *
 * * **`'imageStyle:wrapText'`**, which contains the `alignLeft` and `alignRight` options, that is,
 * those that wraps the text around the image,
 * * **`'imageStyle:breakText'`**, which contains the `alignBlockLeft`, `alignCenter` and `alignBlockRight` options, that is,
 * those that breaks the text around the image.
 *
 * @internal
 */ const DEFAULT_DROPDOWN_DEFINITIONS = [
    {
        name: 'imageStyle:wrapText',
        title: 'Wrap text',
        defaultItem: 'imageStyle:alignLeft',
        items: [
            'imageStyle:alignLeft',
            'imageStyle:alignRight'
        ]
    },
    {
        name: 'imageStyle:breakText',
        title: 'Break text',
        defaultItem: 'imageStyle:block',
        items: [
            'imageStyle:alignBlockLeft',
            'imageStyle:block',
            'imageStyle:alignBlockRight'
        ]
    }
];
/**
 * Returns a list of the normalized and validated image style options.
 *
 * @param config
 * @param config.isInlinePluginLoaded
 * Determines whether the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin has been loaded.
 * @param config.isBlockPluginLoaded
 * Determines whether the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin has been loaded.
 * @param config.configuredStyles
 * The image styles configuration provided in the image styles {@link module:image/imageconfig~ImageConfig#styles configuration}
 * as a default or custom value.
 * @returns
 * * Each of options contains a complete icon markup.
 * * The image style options not supported by any of the loaded plugins are filtered out.
 */ function normalizeStyles(config) {
    const configuredStyles = config.configuredStyles.options || [];
    const styles = configuredStyles.map((arrangement)=>normalizeDefinition(arrangement)).filter((arrangement)=>isValidOption(arrangement, config));
    return styles;
}
/**
 * Returns the default image styles configuration depending on the loaded image editing plugins.
 *
 * @param isInlinePluginLoaded
 * Determines whether the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin has been loaded.
 *
 * @param isBlockPluginLoaded
 * Determines whether the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin has been loaded.
 *
 * @returns
 * It returns an object with the lists of the image style options and groups defined as strings related to the
 * {@link module:image/imagestyle/utils#DEFAULT_OPTIONS default options}
 */ function getDefaultStylesConfiguration(isBlockPluginLoaded, isInlinePluginLoaded) {
    if (isBlockPluginLoaded && isInlinePluginLoaded) {
        return {
            options: [
                'inline',
                'alignLeft',
                'alignRight',
                'alignCenter',
                'alignBlockLeft',
                'alignBlockRight',
                'block',
                'side'
            ]
        };
    } else if (isBlockPluginLoaded) {
        return {
            options: [
                'block',
                'side'
            ]
        };
    } else if (isInlinePluginLoaded) {
        return {
            options: [
                'inline',
                'alignLeft',
                'alignRight'
            ]
        };
    }
    return {};
}
/**
 * Returns a list of the available predefined drop-downs' definitions depending on the loaded image editing plugins.
 */ function getDefaultDropdownDefinitions(pluginCollection) {
    if (pluginCollection.has('ImageBlockEditing') && pluginCollection.has('ImageInlineEditing')) {
        return [
            ...DEFAULT_DROPDOWN_DEFINITIONS
        ];
    } else {
        return [];
    }
}
/**
 * Normalizes an image style option or group provided in the {@link module:image/imageconfig~ImageConfig#styles}
 * and returns it in a {@link module:image/imageconfig~ImageStyleOptionDefinition}/
 */ function normalizeDefinition(definition) {
    if (typeof definition === 'string') {
        // Just the name of the style has been passed, but none of the defaults.
        if (!DEFAULT_OPTIONS[definition]) {
            // Normalize the style anyway to prevent errors.
            definition = {
                name: definition
            };
        } else {
            definition = {
                ...DEFAULT_OPTIONS[definition]
            };
        }
    } else {
        // If an object style has been passed and if the name matches one of the defaults,
        // extend it with defaults – the user wants to customize a default style.
        // Note: Don't override the user–defined style object, clone it instead.
        definition = extendStyle(DEFAULT_OPTIONS[definition.name], definition);
    }
    // If an icon is defined as a string and correspond with a name
    // in default icons, use the default icon provided by the plugin.
    if (typeof definition.icon === 'string') {
        definition.icon = DEFAULT_ICONS[definition.icon] || definition.icon;
    }
    return definition;
}
/**
 * Checks if the image style option is valid:
 * * if it has the modelElements fields defined and filled,
 * * if the defined modelElements are supported by any of the loaded image editing plugins.
 * It also displays a console warning these conditions are not met.
 *
 * @param option image style option
 */ function isValidOption(option, { isBlockPluginLoaded, isInlinePluginLoaded }) {
    const { modelElements, name } = option;
    if (!modelElements || !modelElements.length || !name) {
        warnInvalidStyle({
            style: option
        });
        return false;
    } else {
        const supportedElements = [
            isBlockPluginLoaded ? 'imageBlock' : null,
            isInlinePluginLoaded ? 'imageInline' : null
        ];
        // Check if the option is supported by any of the loaded plugins.
        if (!modelElements.some((elementName)=>supportedElements.includes(elementName))) {
            /**
			 * In order to work correctly, each image style {@link module:image/imageconfig~ImageStyleOptionDefinition option}
			 * requires specific model elements (also: types of images) to be supported by the editor.
			 *
			 * Model element names to which the image style option can be applied are defined in the
			 * {@link module:image/imageconfig~ImageStyleOptionDefinition#modelElements} property of the style option
			 * definition.
			 *
			 * Explore the warning in the console to find out precisely which option is not supported and which editor plugins
			 * are missing. Make sure these plugins are loaded in your editor to get this image style option working.
			 *
			 * @error image-style-missing-dependency
			 * @param {string} style The name of the unsupported option.
			 * @param {Array.<string>} missingPlugins The names of the plugins one of which has to be loaded for the particular option.
			 */ logWarning('image-style-missing-dependency', {
                style: option,
                missingPlugins: modelElements.map((name)=>name === 'imageBlock' ? 'ImageBlockEditing' : 'ImageInlineEditing')
            });
            return false;
        }
    }
    return true;
}
/**
 * Extends the default style with a style provided by the developer.
 * Note: Don't override the custom–defined style object, clone it instead.
 */ function extendStyle(source, style) {
    const extendedStyle = {
        ...style
    };
    for(const prop in source){
        if (!Object.prototype.hasOwnProperty.call(style, prop)) {
            extendedStyle[prop] = source[prop];
        }
    }
    return extendedStyle;
}
/**
 * Displays a console warning with the 'image-style-configuration-definition-invalid' error.
 */ function warnInvalidStyle(info) {
    /**
	 * The image style definition provided in the configuration is invalid.
	 *
	 * Please make sure the definition implements properly one of the following:
	 *
	 * * {@link module:image/imageconfig~ImageStyleOptionDefinition image style option definition},
	 * * {@link module:image/imageconfig~ImageStyleDropdownDefinition image style dropdown definition}
	 *
	 * @error image-style-configuration-definition-invalid
	 * @param {object} info The information about the invalid definition.
	 */ logWarning('image-style-configuration-definition-invalid', info);
}
/**
 * @internal
 */ const utils = {
    normalizeStyles,
    getDefaultStylesConfiguration,
    getDefaultDropdownDefinitions,
    warnInvalidStyle
};

/**
 * @module image/imagestyle/converters
 */ /**
 * Returns a converter for the `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param styles An array containing available image style options.
 * @returns A model-to-view attribute converter.
 * @internal
 */ function modelToViewStyleAttribute(styles) {
    return (evt, data, conversionApi)=>{
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }
        // Check if there is class name associated with given value.
        const newStyle = getStyleDefinitionByName(data.attributeNewValue, styles);
        const oldStyle = getStyleDefinitionByName(data.attributeOldValue, styles);
        const viewElement = conversionApi.mapper.toViewElement(data.item);
        const viewWriter = conversionApi.writer;
        if (oldStyle) {
            viewWriter.removeClass(oldStyle.className, viewElement);
        }
        if (newStyle) {
            viewWriter.addClass(newStyle.className, viewElement);
        }
    };
}
/**
 * Returns a view-to-model converter converting image CSS classes to a proper value in the model.
 *
 * @param styles Image style options for which the converter is created.
 * @returns A view-to-model converter.
 * @internal
 */ function viewToModelStyleAttribute(styles) {
    // Convert only non–default styles.
    const nonDefaultStyles = {
        imageInline: styles.filter((style)=>!style.isDefault && style.modelElements.includes('imageInline')),
        imageBlock: styles.filter((style)=>!style.isDefault && style.modelElements.includes('imageBlock'))
    };
    return (evt, data, conversionApi)=>{
        if (!data.modelRange) {
            return;
        }
        const viewElement = data.viewItem;
        const modelImageElement = first(data.modelRange.getItems());
        // Run this converter only if an image has been found in the model.
        // In some cases it may not be found (for example if we run this on a figure with different type than image).
        if (!modelImageElement) {
            return;
        }
        // ...and the `imageStyle` attribute is allowed for that element, otherwise stop conversion early.
        if (!conversionApi.schema.checkAttribute(modelImageElement, 'imageStyle')) {
            return;
        }
        // Convert styles one by one.
        for (const style of nonDefaultStyles[modelImageElement.name]){
            // Try to consume class corresponding with the style.
            if (conversionApi.consumable.consume(viewElement, {
                classes: style.className
            })) {
                // And convert this style to model attribute.
                conversionApi.writer.setAttribute('imageStyle', style.name, modelImageElement);
            }
        }
        // Normalize float styles (alignLeft, alignRight).
        normalizeFloatToDefinitionStyle(conversionApi, viewElement, modelImageElement, styles);
    };
}
/**
 * A helper function that attempts to convert the `float` CSS style into a corresponding `imageStyle` attribute.
 *
 * It maps `float: left` and `float: right` to standard alignment styles (e.g. `'alignLeft'`, `'alignRight'`),
 * but only if the target style definition matches one of the {@link module:image/image/utils~DEFAULT_OPTIONS default options}.
 */ function normalizeFloatToDefinitionStyle(conversionApi, viewElement, modelElement, styles) {
    if (!conversionApi.consumable.test(viewElement, {
        styles: [
            'float'
        ]
    })) {
        return;
    }
    let floatStyleName = null;
    switch(viewElement.getStyle('float')){
        case 'left':
            floatStyleName = 'alignLeft';
            break;
        case 'right':
            floatStyleName = 'alignRight';
            break;
    }
    if (!floatStyleName) {
        return;
    }
    const definition = getStyleDefinitionByName(floatStyleName, styles);
    if (!definition) {
        return;
    }
    const builtinDefinition = DEFAULT_OPTIONS[definition.name];
    if (!isEqual(definition, builtinDefinition)) {
        return;
    }
    conversionApi.writer.setAttribute('imageStyle', floatStyleName, modelElement);
    conversionApi.consumable.consume(viewElement, {
        styles: [
            'float'
        ]
    });
}
/**
 * Returns the style with a given `name` from an array of styles.
 */ function getStyleDefinitionByName(name, styles) {
    for (const style of styles){
        if (style.name === name) {
            return style;
        }
    }
}

/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 */ class ImageStyleEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageStyleEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageUtils
        ];
    }
    /**
	 * It contains a list of the normalized and validated style options.
	 *
	 * * Each option contains a complete icon markup.
	 * * The style options not supported by any of the loaded image editing plugins (
	 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} or
	 * {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`}) are filtered out.
	 *
	 * @internal
	 * @readonly
	 */ normalizedStyles;
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const isBlockPluginLoaded = editor.plugins.has('ImageBlockEditing');
        const isInlinePluginLoaded = editor.plugins.has('ImageInlineEditing');
        editor.config.define('image.styles', utils.getDefaultStylesConfiguration(isBlockPluginLoaded, isInlinePluginLoaded));
        this.normalizedStyles = utils.normalizeStyles({
            configuredStyles: editor.config.get('image.styles'),
            isBlockPluginLoaded,
            isInlinePluginLoaded
        });
        this._setupConversion(isBlockPluginLoaded, isInlinePluginLoaded);
        this._setupPostFixer();
        // Register imageStyle command.
        editor.commands.add('imageStyle', new ImageStyleCommand(editor, this.normalizedStyles));
    }
    /**
	 * Sets the editor conversion taking the presence of
	 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`}
	 * and {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugins into consideration.
	 */ _setupConversion(isBlockPluginLoaded, isInlinePluginLoaded) {
        const editor = this.editor;
        const schema = editor.model.schema;
        const modelToViewConverter = modelToViewStyleAttribute(this.normalizedStyles);
        const viewToModelConverter = viewToModelStyleAttribute(this.normalizedStyles);
        editor.editing.downcastDispatcher.on('attribute:imageStyle', modelToViewConverter);
        editor.data.downcastDispatcher.on('attribute:imageStyle', modelToViewConverter);
        // Allow imageStyle attribute in image and imageInline.
        // We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
        if (isBlockPluginLoaded) {
            schema.extend('imageBlock', {
                allowAttributes: 'imageStyle'
            });
            schema.setAttributeProperties('imageStyle', {
                isFormatting: true
            });
            // Converter for figure element from view to model.
            editor.data.upcastDispatcher.on('element:figure', viewToModelConverter, {
                priority: 'low'
            });
        }
        if (isInlinePluginLoaded) {
            schema.extend('imageInline', {
                allowAttributes: 'imageStyle'
            });
            schema.setAttributeProperties('imageStyle', {
                isFormatting: true
            });
            // Converter for the img element from view to model.
            editor.data.upcastDispatcher.on('element:img', viewToModelConverter, {
                priority: 'low'
            });
        }
    }
    /**
	 * Registers a post-fixer that will make sure that the style attribute value is correct for a specific image type (block vs inline).
	 */ _setupPostFixer() {
        const editor = this.editor;
        const document = editor.model.document;
        const imageUtils = editor.plugins.get(ImageUtils);
        const stylesMap = new Map(this.normalizedStyles.map((style)=>[
                style.name,
                style
            ]));
        // Make sure that style attribute is valid for the image type.
        document.registerPostFixer((writer)=>{
            let changed = false;
            for (const change of document.differ.getChanges()){
                if (change.type == 'insert' || change.type == 'attribute' && change.attributeKey == 'imageStyle') {
                    let element = change.type == 'insert' ? change.position.nodeAfter : change.range.start.nodeAfter;
                    if (element && element.is('element', 'paragraph') && element.childCount > 0) {
                        element = element.getChild(0);
                    }
                    if (!imageUtils.isImage(element)) {
                        continue;
                    }
                    const imageStyle = element.getAttribute('imageStyle');
                    if (!imageStyle) {
                        continue;
                    }
                    const imageStyleDefinition = stylesMap.get(imageStyle);
                    if (!imageStyleDefinition || !imageStyleDefinition.modelElements.includes(element.name)) {
                        writer.removeAttribute('imageStyle', element);
                        changed = true;
                    }
                }
            }
            return changed;
        });
    }
}

/**
 * The image style UI plugin.
 *
 * It registers buttons corresponding to the {@link module:image/imageconfig~ImageConfig#styles} configuration.
 * It also registers the {@link module:image/imagestyle/utils#DEFAULT_DROPDOWN_DEFINITIONS default drop-downs} and the
 * custom drop-downs defined by the developer in the {@link module:image/imageconfig~ImageConfig#toolbar} configuration.
 */ class ImageStyleUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageStyleEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageStyleUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * Returns the default localized style titles provided by the plugin.
	 *
	 * The following localized titles corresponding with
	 * {@link module:image/imagestyle/utils#DEFAULT_OPTIONS} are available:
	 *
	 * * `'Wrap text'`,
	 * * `'Break text'`,
	 * * `'In line'`,
	 * * `'Full size image'`,
	 * * `'Side image'`,
	 * * `'Left aligned image'`,
	 * * `'Centered image'`,
	 * * `'Right aligned image'`
	 */ get localizedDefaultStylesTitles() {
        const t = this.editor.t;
        return {
            'Wrap text': t('Wrap text'),
            'Break text': t('Break text'),
            'In line': t('In line'),
            'Full size image': t('Full size image'),
            'Side image': t('Side image'),
            'Left aligned image': t('Left aligned image'),
            'Centered image': t('Centered image'),
            'Right aligned image': t('Right aligned image')
        };
    }
    /**
	 * @inheritDoc
	 */ init() {
        const plugins = this.editor.plugins;
        const toolbarConfig = this.editor.config.get('image.toolbar') || [];
        const imageStyleEditing = plugins.get('ImageStyleEditing');
        const definedStyles = translateStyles(imageStyleEditing.normalizedStyles, this.localizedDefaultStylesTitles);
        for (const styleConfig of definedStyles){
            this._createButton(styleConfig);
        }
        const definedDropdowns = translateStyles([
            ...toolbarConfig.filter(isObject),
            ...utils.getDefaultDropdownDefinitions(plugins)
        ], this.localizedDefaultStylesTitles);
        for (const dropdownConfig of definedDropdowns){
            this._createDropdown(dropdownConfig, definedStyles);
        }
    }
    /**
	 * Creates a dropdown and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
	 */ _createDropdown(dropdownConfig, definedStyles) {
        const factory = this.editor.ui.componentFactory;
        factory.add(dropdownConfig.name, (locale)=>{
            let defaultButton;
            const { defaultItem, items, title } = dropdownConfig;
            const buttonViews = items.filter((itemName)=>definedStyles.find(({ name })=>getUIComponentName(name) === itemName)).map((buttonName)=>{
                const button = factory.create(buttonName);
                if (buttonName === defaultItem) {
                    defaultButton = button;
                }
                return button;
            });
            if (items.length !== buttonViews.length) {
                utils.warnInvalidStyle({
                    dropdown: dropdownConfig
                });
            }
            const dropdownView = createDropdown(locale, SplitButtonView);
            const splitButtonView = dropdownView.buttonView;
            const splitButtonViewArrow = splitButtonView.arrowView;
            addToolbarToDropdown(dropdownView, buttonViews, {
                enableActiveItemFocusOnDropdownOpen: true
            });
            splitButtonView.set({
                label: getDropdownButtonTitle(title, defaultButton.label),
                class: null,
                tooltip: true
            });
            splitButtonViewArrow.unbind('label');
            splitButtonViewArrow.set({
                label: title
            });
            splitButtonView.bind('icon').toMany(buttonViews, 'isOn', (...areOn)=>{
                const index = areOn.findIndex(identity);
                return index < 0 ? defaultButton.icon : buttonViews[index].icon;
            });
            splitButtonView.bind('label').toMany(buttonViews, 'isOn', (...areOn)=>{
                const index = areOn.findIndex(identity);
                return getDropdownButtonTitle(title, index < 0 ? defaultButton.label : buttonViews[index].label);
            });
            splitButtonView.bind('isOn').toMany(buttonViews, 'isOn', (...areOn)=>areOn.some(identity));
            splitButtonView.bind('class').toMany(buttonViews, 'isOn', (...areOn)=>areOn.some(identity) ? 'ck-splitbutton_flatten' : undefined);
            splitButtonView.on('execute', ()=>{
                if (!buttonViews.some(({ isOn })=>isOn)) {
                    defaultButton.fire('execute');
                } else {
                    dropdownView.isOpen = !dropdownView.isOpen;
                }
            });
            dropdownView.bind('isEnabled').toMany(buttonViews, 'isEnabled', (...areEnabled)=>areEnabled.some(identity));
            // Focus the editable after executing the command.
            // Overrides a default behaviour where the focus is moved to the dropdown button (#12125).
            this.listenTo(dropdownView, 'execute', ()=>{
                this.editor.editing.view.focus();
            });
            return dropdownView;
        });
    }
    /**
	 * Creates a button and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
	 */ _createButton(buttonConfig) {
        const buttonName = buttonConfig.name;
        this.editor.ui.componentFactory.add(getUIComponentName(buttonName), (locale)=>{
            const command = this.editor.commands.get('imageStyle');
            const view = new ButtonView(locale);
            view.set({
                label: buttonConfig.title,
                icon: buttonConfig.icon,
                tooltip: true,
                isToggleable: true
            });
            view.bind('isEnabled').to(command, 'isEnabled');
            view.bind('isOn').to(command, 'value', (value)=>value === buttonName);
            view.on('execute', this._executeCommand.bind(this, buttonName));
            return view;
        });
    }
    _executeCommand(name) {
        this.editor.execute('imageStyle', {
            value: name
        });
        this.editor.editing.view.focus();
    }
}
/**
 * Returns the translated `title` from the passed styles array.
 */ function translateStyles(styles, titles) {
    for (const style of styles){
        // Localize the titles of the styles, if a title corresponds with
        // a localized default provided by the plugin.
        if (titles[style.title]) {
            style.title = titles[style.title];
        }
    }
    return styles;
}
/**
 * Returns the image style component name with the "imageStyle:" prefix.
 */ function getUIComponentName(name) {
    return `imageStyle:${name}`;
}
/**
 * Returns title for the splitbutton containing the dropdown title and default action item title.
 */ function getDropdownButtonTitle(dropdownTitle, buttonTitle) {
    return (dropdownTitle ? dropdownTitle + ': ' : '') + buttonTitle;
}

/**
 * The image style plugin.
 *
 * For a detailed overview of the image styles feature, check the {@glink features/images/images-styles documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:image/imagestyle/imagestyleediting~ImageStyleEditing},
 * * {@link module:image/imagestyle/imagestyleui~ImageStyleUI}
 *
 * It provides a default configuration, which can be extended or overwritten.
 * Read more about the {@link module:image/imageconfig~ImageConfig#styles image styles configuration}.
 */ class ImageStyle extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageStyleEditing,
            ImageStyleUI
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageStyle';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The image toolbar plugin. It creates and manages the image toolbar (the toolbar displayed when an image is selected).
 *
 * For an overview, check the {@glink features/images/images-overview#image-contextual-toolbar image contextual toolbar} documentation.
 *
 * Instances of toolbar components (e.g. buttons) are created using the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}
 * based on the {@link module:image/imageconfig~ImageConfig#toolbar `image.toolbar` configuration option}.
 *
 * The toolbar uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 */ class ImageToolbar extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            WidgetToolbarRepository,
            ImageUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'ImageToolbar';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        const t = editor.t;
        const widgetToolbarRepository = editor.plugins.get(WidgetToolbarRepository);
        const imageUtils = editor.plugins.get('ImageUtils');
        widgetToolbarRepository.register('image', {
            ariaLabel: t('Image toolbar'),
            items: normalizeDeclarativeConfig(editor.config.get('image.toolbar') || []),
            getRelatedElement: (selection)=>imageUtils.getClosestSelectedImageWidget(selection)
        });
    }
}
/**
 * Convert the dropdown definitions to their keys registered in the ComponentFactory.
 * The registration precess should be handled by the plugin which handles the UI of a particular feature.
 */ function normalizeDeclarativeConfig(config) {
    return config.map((item)=>isObject(item) ? item.name : item);
}

/**
 * This plugin enables the [`<picture>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture) element support in the editor.
 *
 * * It enables the `sources` model attribute on `imageBlock` and `imageInline` model elements
 * (brought by {@link module:image/imageblock~ImageBlock} and {@link module:image/imageinline~ImageInline}, respectively).
 * * It translates the `sources` model element to the view (also: data) structure that may look as follows:
 *
 * ```html
 * <p>Inline image using picture:
 * 	<picture>
 * 		<source media="(min-width: 800px)" srcset="image-large.webp" type="image/webp">
 * 		<source media="(max-width: 800px)" srcset="image-small.webp" type="image/webp">
 * 		<!-- Other sources as specified in the "sources" model attribute... -->
 * 		<img src="image.png" alt="An image using picture" />
 * 	</picture>
 * </p>
 *
 * <p>Block image using picture:</p>
 * <figure class="image">
 * 	<picture>
 * 		<source media="(min-width: 800px)" srcset="image-large.webp" type="image/webp">
 * 		<source media="(max-width: 800px)" srcset="image-small.webp" type="image/webp">
 * 		<!-- Other sources as specified in the "sources" model attribute... -->
 * 		<img src="image.png" alt="An image using picture" />
 * 	</picture>
 * 	<figcaption>Caption of the image</figcaption>
 * </figure>
 * ```
 *
 * **Note:** The value of the `sources` {@glink framework/architecture/editing-engine#changing-the-model model attribute}
 * in both examples equals:
 *
 * ```css
 * [
 * 	{
 * 		media: '(min-width: 800px)',
 * 		srcset: 'image-large.webp',
 * 		type: 'image/webp'
 * 	},
 * 	{
 * 		media: '(max-width: 800px)',
 * 		srcset: 'image-small.webp',
 * 		type: 'image/webp'
 * 	}
 * ]
 * ```
 *
 * * It integrates with the {@link module:image/imageupload~ImageUpload} plugin so images uploaded in the editor
 * automatically render using `<picture>` if the {@glink features/images/image-upload/image-upload upload adapter}
 * supports image sources and provides neccessary data.
 *
 * @private
 */ class PictureEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            ImageEditing,
            ImageUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'PictureEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        if (editor.plugins.has('ImageBlockEditing')) {
            editor.model.schema.extend('imageBlock', {
                allowAttributes: [
                    'sources'
                ]
            });
        }
        if (editor.plugins.has('ImageInlineEditing')) {
            editor.model.schema.extend('imageInline', {
                allowAttributes: [
                    'sources'
                ]
            });
        }
        this._setupConversion();
        this._setupImageUploadEditingIntegration();
    }
    /**
	 * Configures conversion pipelines to support upcasting and downcasting images using the `<picture>` view element
	 * and the model `sources` attribute.
	 */ _setupConversion() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const imageUtils = editor.plugins.get('ImageUtils');
        conversion.for('upcast').add(upcastPicture(imageUtils));
        conversion.for('downcast').add(downcastSourcesAttribute(imageUtils));
    }
    /**
	 * Makes it possible for uploaded images to get the `sources` model attribute and the `<picture>...</picture>`
	 * view structure out-of-the-box if relevant data is provided along the
	 * {@link module:image/imageupload/imageuploadediting~ImageUploadEditing#event:uploadComplete} event.
	 */ _setupImageUploadEditingIntegration() {
        const editor = this.editor;
        if (!editor.plugins.has('ImageUploadEditing')) {
            return;
        }
        const imageUploadEditing = editor.plugins.get('ImageUploadEditing');
        this.listenTo(imageUploadEditing, 'uploadComplete', (evt, { imageElement, data })=>{
            const sources = data.sources;
            if (!sources) {
                return;
            }
            editor.model.change((writer)=>{
                writer.setAttributes({
                    sources
                }, imageElement);
            });
        });
    }
}

export { AutoImage, Image, ImageBlock, ImageBlockEditing, ImageCaption, ImageCaptionEditing, ImageCaptionUI, ImageCaptionUtils, ImageCustomResizeUI, ImageEditing, ImageInline, ImageInlineEditing, ImageInsert, ImageInsertUI, ImageInsertViaUrl, ImageInsertViaUrlUI, ImageLoadObserver, ImagePlaceholder, ImageResize, ImageResizeButtons, ImageResizeEditing, ImageResizeHandles, ImageSizeAttributes, ImageStyle, ImageStyleCommand, ImageStyleEditing, ImageStyleUI, ImageTextAlternative, ImageTextAlternativeCommand, ImageTextAlternativeEditing, ImageTextAlternativeUI, ImageToolbar, ImageTypeCommand, ImageUpload, ImageUploadEditing, ImageUploadProgress, ImageUploadUI, ImageUtils, InsertImageCommand, PictureEditing, ReplaceImageSourceCommand, ResizeImageCommand, ToggleImageCaptionCommand, UploadImageCommand, DEFAULT_DROPDOWN_DEFINITIONS as _IMAGE_DEFAULT_DROPDOWN_DEFINITIONS, DEFAULT_ICONS as _IMAGE_DEFAULT_ICONS, DEFAULT_OPTIONS as _IMAGE_DEFAULT_OPTIONS, ImageCustomResizeFormView as _ImageCustomResizeFormView, ImageInsertFormView as _ImageInsertFormView, ImageInsertUrlView as _ImageInsertUrlView, utils as _ImageStyleUtils, TextAlternativeFormView as _ImageTextAlternativeFormView, widthAndHeightStylesAreBothSet as _checkIfImageWidthAndHeightStylesAreBothSet, createBlockImageViewElement as _createBlockImageViewElement, createInlineImageViewElement as _createInlineImageViewElement, determineImageTypeForInsertionAtSelection as _determineImageTypeForInsertionAtSelection, downcastImageAttribute as _downcastImageAttribute, downcastSourcesAttribute as _downcastImageSourcesAttribute, downcastSrcsetAttribute as _downcastImageSrcsetAttribute, fetchLocalImage as _fetchLocalImage, getBalloonPositionData as _getImageBalloonPositionData, getSizeValueIfInPx as _getImageSizeValueIfInPx, getImgViewElementMatcher as _getImageViewElementMatcher, getSelectedImageEditorNodes as _getSelectedImageEditorNodes, getSelectedImagePossibleResizeRange as _getSelectedImagePossibleResizeRange, getSelectedImageWidthInUnits as _getSelectedImageWidthInUnits, isLocalImage as _isLocalImage, modelToViewStyleAttribute as _modelToViewImageStyleAttribute, repositionContextualBalloon as _repositionImageContextualBalloon, tryCastDimensionsToUnit as _tryCastImageDimensionsToUnit, tryParseDimensionWithUnit as _tryParseImageDimensionWithUnit, upcastImageFigure as _upcastImageFigure, upcastPicture as _upcastImagePicture, viewToModelStyleAttribute as _viewToModelImageStyleAttribute, createImageTypeRegExp, isHtmlInDataTransfer };
//# sourceMappingURL=index.js.map

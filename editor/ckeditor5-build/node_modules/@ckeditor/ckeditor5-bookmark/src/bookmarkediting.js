/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module bookmark/bookmarkediting
 */
import { Plugin } from 'ckeditor5/src/core.js';
import { toWidget } from 'ckeditor5/src/widget.js';
import { IconView } from 'ckeditor5/src/ui.js';
import { IconBookmarkInline } from 'ckeditor5/src/icons.js';
import { InsertBookmarkCommand } from './insertbookmarkcommand.js';
import { UpdateBookmarkCommand } from './updatebookmarkcommand.js';
import '../theme/bookmark.css';
/**
 * The bookmark editing plugin.
 */
export class BookmarkEditing extends Plugin {
    /**
     * A collection of bookmarks elements in the document.
     */
    _bookmarkElements = new Map();
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'BookmarkEditing';
    }
    /**
     * @inheritDoc
     * @internal
     */
    static get licenseFeatureCode() {
        return 'BKM';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get isPremiumPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor);
        editor.config.define('bookmark', {
            toolbar: ['bookmarkPreview', '|', 'editBookmark', 'removeBookmark']
        });
    }
    /**
     * @inheritDoc
     */
    init() {
        const { editor } = this;
        this._defineSchema();
        this._defineConverters();
        editor.commands.add('insertBookmark', new InsertBookmarkCommand(editor));
        editor.commands.add('updateBookmark', new UpdateBookmarkCommand(editor));
        this.listenTo(editor.model.document, 'change:data', () => {
            this._trackBookmarkElements();
        });
    }
    /**
     * Returns the model element for the given bookmark ID if it exists.
     */
    getElementForBookmarkId(bookmarkId) {
        for (const [element, id] of this._bookmarkElements) {
            if (id == bookmarkId) {
                return element;
            }
        }
        return null;
    }
    /**
     * Returns all unique bookmark names existing in the content.
     */
    getAllBookmarkNames() {
        return new Set(this._bookmarkElements.values());
    }
    /**
     * Defines the schema for the bookmark feature.
     */
    _defineSchema() {
        const schema = this.editor.model.schema;
        schema.register('bookmark', {
            inheritAllFrom: '$inlineObject',
            allowAttributes: 'bookmarkId',
            disallowAttributes: ['linkHref', 'htmlA']
        });
    }
    /**
     * Defines the converters for the bookmark feature.
     */
    _defineConverters() {
        const { editor } = this;
        const { conversion, t } = editor;
        editor.data.htmlProcessor.domConverter.registerInlineObjectMatcher(element => upcastMatcher(element));
        // Register an inline object matcher so that bookmarks <a>s are correctly recognized as inline elements in editing pipeline.
        // This prevents converting spaces around bookmarks to `&nbsp;`s.
        editor.editing.view.domConverter.registerInlineObjectMatcher(element => upcastMatcher(element, false));
        conversion.for('dataDowncast').elementToElement({
            model: {
                name: 'bookmark',
                attributes: ['bookmarkId']
            },
            view: (modelElement, { writer }) => {
                const emptyElement = writer.createEmptyElement('a', {
                    'id': modelElement.getAttribute('bookmarkId')
                });
                // `getFillerOffset` is not needed to set here, because `emptyElement` has already covered it.
                return emptyElement;
            }
        });
        conversion.for('editingDowncast').elementToElement({
            model: {
                name: 'bookmark',
                attributes: ['bookmarkId']
            },
            view: (modelElement, { writer }) => {
                const id = modelElement.getAttribute('bookmarkId');
                const containerElement = writer.createContainerElement('a', {
                    id,
                    class: 'ck-bookmark'
                }, [this._createBookmarkUIElement(writer)]);
                writer.setCustomProperty('bookmark', true, containerElement);
                this._bookmarkElements.set(modelElement, id);
                // `getFillerOffset` is not needed to set here, because `toWidget` has already covered it.
                const labelCreator = () => `${id} ${t('bookmark widget')}`;
                return toWidget(containerElement, writer, { label: labelCreator });
            }
        });
        conversion.for('upcast').add(dispatcher => dispatcher.on('element:a', dataViewModelAnchorInsertion(editor)));
    }
    /**
     * Creates a UI element for the `bookmark` representation in editing view.
     */
    _createBookmarkUIElement(writer) {
        return writer.createUIElement('span', { class: 'ck-bookmark__icon' }, function (domDocument) {
            const domElement = this.toDomElement(domDocument);
            const icon = new IconView();
            icon.set({
                content: IconBookmarkInline,
                isColorInherited: false
            });
            icon.render();
            domElement.appendChild(icon.element);
            return domElement;
        });
    }
    /**
     * Tracking the added or removed bookmark elements.
     */
    _trackBookmarkElements() {
        this._bookmarkElements.forEach((id, element) => {
            if (element.root.rootName === '$graveyard') {
                this._bookmarkElements.delete(element);
            }
        });
    }
}
/**
 * A helper function to match an `anchor` element which must contain `id` or `name` attribute but without `href` attribute,
 * also when `expectEmpty` is set to `true` but the element is not empty matcher should not match any element.
 *
 * @param element The element to be checked.
 * @param expectEmpty Default set to `true`, when set to `false` matcher expects that `anchor` is not empty;
 * in editing pipeline it's not empty because it contains the `UIElement`.
 */
function upcastMatcher(element, expectEmpty = true) {
    const isAnchorElement = element.name === 'a';
    if (!isAnchorElement) {
        return null;
    }
    if (expectEmpty && !element.isEmpty) {
        return null;
    }
    const hasIdAttribute = element.hasAttribute('id');
    const hasNameAttribute = element.hasAttribute('name');
    const hasHrefAttribute = element.hasAttribute('href');
    if (hasIdAttribute && !hasHrefAttribute) {
        return { name: true, attributes: ['id'] };
    }
    if (hasNameAttribute && !hasHrefAttribute) {
        return { name: true, attributes: ['name'] };
    }
    return null;
}
/**
 * A view-to-model converter that handles converting pointed or wrapped anchors with `id` and/or `name` attributes.
 *
 * @returns Returns a conversion callback.
 */
function dataViewModelAnchorInsertion(editor) {
    return (evt, data, conversionApi) => {
        const viewItem = data.viewItem;
        const match = upcastMatcher(viewItem, false);
        if (!match || !conversionApi.consumable.test(viewItem, match)) {
            return;
        }
        const enableNonEmptyAnchorConversion = isEnabledNonEmptyAnchorConversion(editor);
        if (!enableNonEmptyAnchorConversion && !viewItem.isEmpty) {
            return;
        }
        const modelWriter = conversionApi.writer;
        const anchorId = viewItem.getAttribute('id');
        const anchorName = viewItem.getAttribute('name');
        const bookmarkId = anchorId || anchorName;
        const bookmark = modelWriter.createElement('bookmark', { bookmarkId });
        if (!conversionApi.safeInsert(bookmark, data.modelCursor)) {
            return;
        }
        conversionApi.consumable.consume(viewItem, match);
        if (anchorId === anchorName) {
            conversionApi.consumable.consume(viewItem, { attributes: ['name'] });
        }
        conversionApi.updateConversionResult(bookmark, data);
        // Convert children uses the result of `bookmark` insertion to convert the `anchor` content
        // after the bookmark element (not inside it).
        const { modelCursor, modelRange } = conversionApi.convertChildren(viewItem, data.modelCursor);
        data.modelCursor = modelCursor;
        data.modelRange = modelWriter.createRange(data.modelRange.start, modelRange.end);
    };
}
/**
 * Normalize the bookmark configuration option `enableNonEmptyAnchorConversion`.
 */
function isEnabledNonEmptyAnchorConversion(editor) {
    const enableNonEmptyAnchorConversion = editor.config.get('bookmark.enableNonEmptyAnchorConversion');
    // When not defined, option `enableNonEmptyAnchorConversion` by default is set to `true`.
    return enableNonEmptyAnchorConversion !== undefined ? enableNonEmptyAnchorConversion : true;
}

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Command, Plugin } from '@ckeditor/ckeditor5-core/dist/index.js';
import { toWidget, isWidget, findOptimalInsertionRange, Widget, WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget/dist/index.js';
import { logWarning, toArray, first, global, FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { IconView, Template, View, submitHandler, LabeledFieldView, createLabeledInputText, Dialog, ButtonView, MenuBarMenuListItemButtonView, CssTransitionDisablerMixin } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconMediaPlaceholder, IconMedia } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { ModelLivePosition, ModelLiveRange } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard/dist/index.js';
import { Delete } from '@ckeditor/ckeditor5-typing/dist/index.js';
import { Undo } from '@ckeditor/ckeditor5-undo/dist/index.js';

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */ /**
 * @module media-embed/converters
 */ /**
 * Returns a function that converts the model "url" attribute to the view representation.
 *
 * Depending on the configuration, the view representation can be "semantic" (for the data pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<oembed url="foo"></oembed>
 * </figure>
 * ```
 *
 * or "non-semantic" (for the editing view pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 * </figure>
 * ```
 *
 * **Note:** Changing the model "url" attribute replaces the entire content of the
 * `<figure>` in the view.
 *
 * @param registry The registry providing
 * the media and their content.
 * @param options options object with following properties:
 * - elementName When set, overrides the default element name for semantic media embeds.
 * - renderMediaPreview When `true`, the converter will create the view in the non-semantic form.
 * - renderForEditingView When `true`, the converter will create a view specific for the
 * editing pipeline (e.g. including CSS classes, content placeholders).
 *
 * @internal
 */ function modelToViewUrlAttributeConverter(registry, options) {
    const converter = (evt, data, conversionApi)=>{
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }
        const url = data.attributeNewValue;
        const viewWriter = conversionApi.writer;
        const figure = conversionApi.mapper.toViewElement(data.item);
        const mediaContentElement = [
            ...figure.getChildren()
        ].find((child)=>child.getCustomProperty('media-content'));
        // TODO: removing the wrapper and creating it from scratch is a hack. We can do better than that.
        viewWriter.remove(mediaContentElement);
        const mediaViewElement = registry.getMediaViewElement(viewWriter, url, options);
        viewWriter.insert(viewWriter.createPositionAt(figure, 0), mediaViewElement);
    };
    return (dispatcher)=>{
        dispatcher.on('attribute:url:media', converter);
    };
}

/**
 * Converts a given {@link module:engine/view/element~ViewElement} to a media embed widget:
 * * Adds a {@link module:engine/view/element~ViewElement#_setCustomProperty custom property}
 * allowing to recognize the media widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param writer An instance of the view writer.
 * @param label The element's label.
 * @internal
 */ function toMediaWidget(viewElement, writer, label) {
    writer.setCustomProperty('media', true, viewElement);
    return toWidget(viewElement, writer, {
        label
    });
}
/**
 * Returns a media widget editing view element if one is selected.
 *
 * @internal
 */ function getSelectedMediaViewWidget(selection) {
    const viewElement = selection.getSelectedElement();
    if (viewElement && isMediaWidget(viewElement)) {
        return viewElement;
    }
    return null;
}
/**
 * Checks if a given view element is a media widget.
 *
 * @internal
 */ function isMediaWidget(viewElement) {
    return !!viewElement.getCustomProperty('media') && isWidget(viewElement);
}
/**
 * Creates a view element representing the media. Either a "semantic" one for the data pipeline:
 *
 * ```html
 * <figure class="media">
 * 	<oembed url="foo"></oembed>
 * </figure>
 * ```
 *
 * or a "non-semantic" (for the editing view pipeline):
 *
 * ```html
 * <figure class="media">
 * 	<div data-oembed-url="foo">[ non-semantic media preview for "foo" ]</div>
 * </figure>
 * ```
 *
 * @internal
 */ function createMediaFigureElement(writer, registry, url, options) {
    return writer.createContainerElement('figure', {
        class: 'media'
    }, [
        registry.getMediaViewElement(writer, url, options),
        writer.createSlot()
    ]);
}
/**
 * Returns a selected media element in the model, if any.
 *
 * @internal
 */ function getSelectedMediaModelWidget(selection) {
    const selectedElement = selection.getSelectedElement();
    if (selectedElement && selectedElement.is('element', 'media')) {
        return selectedElement;
    }
    return null;
}
/**
 * Creates a media element and inserts it into the model.
 *
 * **Note**: This method will use {@link module:engine/model/model~Model#insertContent `model.insertContent()`} logic of inserting content
 * if no `insertPosition` is passed.
 *
 * @param url An URL of an embeddable media.
 * @param findOptimalPosition If true it will try to find optimal position to insert media without breaking content
 * in which a selection is.
 * @internal
 */ function insertMedia(model, url, selectable, findOptimalPosition) {
    model.change((writer)=>{
        const mediaElement = writer.createElement('media', {
            url
        });
        model.insertObject(mediaElement, selectable, null, {
            setSelection: 'on',
            findOptimalPosition: findOptimalPosition ? 'auto' : undefined
        });
    });
}

/**
 * The insert media command.
 *
 * The command is registered by the {@link module:media-embed/mediaembedediting~MediaEmbedEditing} as `'mediaEmbed'`.
 *
 * To insert media at the current selection, execute the command and specify the URL:
 *
 * ```ts
 * editor.execute( 'mediaEmbed', 'http://url.to.the/media' );
 * ```
 */ class MediaEmbedCommand extends Command {
    /**
	 * @inheritDoc
	 */ refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedMedia = getSelectedMediaModelWidget(selection);
        this.value = selectedMedia ? selectedMedia.getAttribute('url') : undefined;
        this.isEnabled = isMediaSelected(selection) || isAllowedInParent(selection, model);
    }
    /**
	 * Executes the command, which either:
	 *
	 * * updates the URL of the selected media,
	 * * inserts the new media into the editor and puts the selection around it.
	 *
	 * @fires execute
	 * @param url The URL of the media.
	 */ execute(url) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedMedia = getSelectedMediaModelWidget(selection);
        if (selectedMedia) {
            model.change((writer)=>{
                writer.setAttribute('url', url, selectedMedia);
            });
        } else {
            insertMedia(model, url, selection, true);
        }
    }
}
/**
 * Checks if the media embed is allowed in the parent.
 */ function isAllowedInParent(selection, model) {
    const insertionRange = findOptimalInsertionRange(selection, model);
    let parent = insertionRange.start.parent;
    // The model.insertContent() will remove empty parent (unless it is a $root or a limit).
    if (parent.isEmpty && !model.schema.isLimit(parent)) {
        parent = parent.parent;
    }
    return model.schema.checkChild(parent, 'media');
}
/**
 * Checks if the media object is selected.
 */ function isMediaSelected(selection) {
    const element = selection.getSelectedElement();
    return !!element && element.name === 'media';
}

const mediaPlaceholderIconViewBox = '0 0 64 42';
/**
 * A bridge between the raw media content provider definitions and the editor view content.
 *
 * It helps translating media URLs to corresponding {@link module:engine/view/element~ViewElement view elements}.
 *
 * Mostly used by the {@link module:media-embed/mediaembedediting~MediaEmbedEditing} plugin.
 */ class MediaRegistry {
    /**
	 * The {@link module:utils/locale~Locale} instance.
	 */ locale;
    /**
	 * The media provider definitions available for the registry. Usually corresponding with the
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig media configuration}.
	 */ providerDefinitions;
    /**
	 * Creates an instance of the {@link module:media-embed/mediaregistry~MediaRegistry} class.
	 *
	 * @param locale The localization services instance.
	 * @param config The configuration of the media embed feature.
	 */ constructor(locale, config){
        const providers = config.providers;
        const extraProviders = config.extraProviders || [];
        const removedProviders = new Set(config.removeProviders);
        const providerDefinitions = providers.concat(extraProviders).filter((provider)=>{
            const name = provider.name;
            if (!name) {
                /**
					 * One of the providers (or extra providers) specified in the media embed configuration
					 * has no name and will not be used by the editor. In order to get this media
					 * provider working, double check your editor configuration.
					 *
					 * @error media-embed-no-provider-name
					 */ logWarning('media-embed-no-provider-name', {
                    provider
                });
                return false;
            }
            return !removedProviders.has(name);
        });
        this.locale = locale;
        this.providerDefinitions = providerDefinitions;
    }
    /**
	 * Checks whether the passed URL is representing a certain media type allowed in the editor.
	 *
	 * @param url The URL to be checked
	 */ hasMedia(url) {
        return !!this._getMedia(url);
    }
    /**
	 * For the given media URL string and options, it returns the {@link module:engine/view/element~ViewElement view element}
	 * representing that media.
	 *
	 * **Note:** If no URL is specified, an empty view element is returned.
	 *
	 * @param writer The view writer used to produce a view element.
	 * @param url The URL to be translated into a view element.
	 */ getMediaViewElement(writer, url, options) {
        return this._getMedia(url).getViewElement(writer, options);
    }
    /**
	 * Returns a `Media` instance for the given URL.
	 *
	 * @param url The URL of the media.
	 * @returns The `Media` instance or `null` when there is none.
	 */ _getMedia(url) {
        if (!url) {
            return new Media(this.locale);
        }
        url = url.trim();
        for (const definition of this.providerDefinitions){
            const previewRenderer = definition.html;
            const pattern = toArray(definition.url);
            for (const subPattern of pattern){
                const match = this._getUrlMatches(url, subPattern);
                if (match) {
                    return new Media(this.locale, url, match, previewRenderer);
                }
            }
        }
        return null;
    }
    /**
	 * Tries to match `url` to `pattern`.
	 *
	 * @param url The URL of the media.
	 * @param pattern The pattern that should accept the media URL.
	 */ _getUrlMatches(url, pattern) {
        // 1. Try to match without stripping the protocol and "www" subdomain.
        let match = url.match(pattern);
        if (match) {
            return match;
        }
        // 2. Try to match after stripping the protocol.
        let rawUrl = url.replace(/^https?:\/\//, '');
        match = rawUrl.match(pattern);
        if (match) {
            return match;
        }
        // 3. Try to match after stripping the "www" subdomain.
        rawUrl = rawUrl.replace(/^www\./, '');
        match = rawUrl.match(pattern);
        if (match) {
            return match;
        }
        return null;
    }
}
/**
 * Represents media defined by the provider configuration.
 *
 * It can be rendered to the {@link module:engine/view/element~ViewElement view element} and used in the editing or data pipeline.
 */ class Media {
    /**
	 * The URL this Media instance represents.
	 */ url;
    /**
	 * Shorthand for {@link module:utils/locale~Locale#t}.
	 *
	 * @see module:utils/locale~Locale#t
	 */ _locale;
    /**
	 * The output of the `RegExp.match` which validated the {@link #url} of this media.
	 */ _match;
    /**
	 * The function returning the HTML string preview of this media.
	 */ _previewRenderer;
    constructor(locale, url, match, previewRenderer){
        this.url = this._getValidUrl(url);
        this._locale = locale;
        this._match = match;
        this._previewRenderer = previewRenderer;
    }
    /**
	 * Returns the view element representation of the media.
	 *
	 * @param writer The view writer used to produce a view element.
	 */ getViewElement(writer, options) {
        const attributes = {};
        let viewElement;
        if (options.renderForEditingView || options.renderMediaPreview && this.url && this._previewRenderer) {
            if (this.url) {
                attributes['data-oembed-url'] = this.url;
            }
            if (options.renderForEditingView) {
                attributes.class = 'ck-media__wrapper';
            }
            const mediaHtml = this._getPreviewHtml(options);
            viewElement = writer.createRawElement('div', attributes, (domElement, domConverter)=>{
                domConverter.setContentOf(domElement, mediaHtml);
            });
        } else {
            if (this.url) {
                attributes.url = this.url;
            }
            viewElement = writer.createEmptyElement(options.elementName, attributes);
        }
        writer.setCustomProperty('media-content', true, viewElement);
        return viewElement;
    }
    /**
	 * Returns the HTML string of the media content preview.
	 */ _getPreviewHtml(options) {
        if (this._previewRenderer) {
            return this._previewRenderer(this._match);
        } else {
            // The placeholder only makes sense for editing view and media which have URLs.
            // Placeholder is never displayed in data and URL-less media have no content.
            if (this.url && options.renderForEditingView) {
                return this._getPlaceholderHtml();
            }
            return '';
        }
    }
    /**
	 * Returns the placeholder HTML when the media has no content preview.
	 */ _getPlaceholderHtml() {
        const icon = new IconView();
        const t = this._locale.t;
        icon.content = IconMediaPlaceholder;
        icon.viewBox = mediaPlaceholderIconViewBox;
        const placeholder = new Template({
            tag: 'div',
            attributes: {
                class: 'ck ck-reset_all ck-media__placeholder'
            },
            children: [
                {
                    tag: 'div',
                    attributes: {
                        class: 'ck-media__placeholder__icon'
                    },
                    children: [
                        icon
                    ]
                },
                {
                    tag: 'a',
                    attributes: {
                        class: 'ck-media__placeholder__url',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        href: this.url,
                        'data-cke-tooltip-text': t('Open media in new tab')
                    },
                    children: [
                        {
                            tag: 'span',
                            attributes: {
                                class: 'ck-media__placeholder__url__text'
                            },
                            children: [
                                this.url
                            ]
                        }
                    ]
                }
            ]
        }).render();
        return placeholder.outerHTML;
    }
    /**
	 * Returns the full URL to the specified media.
	 *
	 * @param url The URL of the media.
	 */ _getValidUrl(url) {
        if (!url) {
            return null;
        }
        if (url.match(/^https?/)) {
            return url;
        }
        return 'https://' + url;
    }
}

/**
 * The media embed editing feature.
 */ class MediaEmbedEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'MediaEmbedEditing';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * The media registry managing the media providers in the editor.
	 */ registry;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        editor.config.define('mediaEmbed', {
            elementName: 'oembed',
            providers: [
                {
                    name: 'dailymotion',
                    url: [
                        /^dailymotion\.com\/video\/(\w+)/,
                        /^dai.ly\/(\w+)/
                    ],
                    html: (match)=>{
                        const id = match[1];
                        return '<div style="position: relative; padding-bottom: 100%; height: 0; ">' + `<iframe src="https://www.dailymotion.com/embed/video/${id}" ` + 'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' + 'frameborder="0" width="480" height="270" allowfullscreen allow="autoplay">' + '</iframe>' + '</div>';
                    }
                },
                {
                    name: 'spotify',
                    url: [
                        /^open\.spotify\.com\/(artist\/\w+)/,
                        /^open\.spotify\.com\/(album\/\w+)/,
                        /^open\.spotify\.com\/(track\/\w+)/
                    ],
                    html: (match)=>{
                        const id = match[1];
                        return '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 126%;">' + `<iframe src="https://open.spotify.com/embed/${id}" ` + 'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' + 'frameborder="0" allowtransparency="true" allow="encrypted-media">' + '</iframe>' + '</div>';
                    }
                },
                {
                    name: 'youtube',
                    url: [
                        /^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)(?:&t=(\d+))?/,
                        /^(?:m\.)?youtube\.com\/shorts\/([\w-]+)(?:\?t=(\d+))?/,
                        /^(?:m\.)?youtube\.com\/v\/([\w-]+)(?:\?t=(\d+))?/,
                        /^youtube\.com\/embed\/([\w-]+)(?:\?start=(\d+))?/,
                        /^youtu\.be\/([\w-]+)(?:\?t=(\d+))?/
                    ],
                    html: (match)=>{
                        const id = match[1];
                        const time = match[2];
                        return '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' + `<iframe src="https://www.youtube.com/embed/${id}${time ? `?start=${time}` : ''}" ` + 'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' + 'frameborder="0" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" ' + 'allowfullscreen>' + '</iframe>' + '</div>';
                    }
                },
                {
                    name: 'vimeo',
                    url: [
                        /^vimeo\.com\/(\d+)/,
                        /^vimeo\.com\/[^/]+\/[^/]+\/video\/(\d+)/,
                        /^vimeo\.com\/album\/[^/]+\/video\/(\d+)/,
                        /^vimeo\.com\/channels\/[^/]+\/(\d+)/,
                        /^vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/,
                        /^vimeo\.com\/ondemand\/[^/]+\/(\d+)/,
                        /^player\.vimeo\.com\/video\/(\d+)/
                    ],
                    html: (match)=>{
                        const id = match[1];
                        return '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' + `<iframe src="https://player.vimeo.com/video/${id}" ` + 'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' + 'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>' + '</iframe>' + '</div>';
                    }
                },
                {
                    name: 'instagram',
                    url: [
                        /^instagram\.com\/p\/(\w+)/,
                        /^instagram\.com\/reel\/(\w+)/
                    ]
                },
                {
                    name: 'twitter',
                    url: [
                        /^twitter\.com/,
                        /^x\.com/
                    ]
                },
                {
                    name: 'googleMaps',
                    url: [
                        /^google\.com\/maps/,
                        /^goo\.gl\/maps/,
                        /^maps\.google\.com/,
                        /^maps\.app\.goo\.gl/
                    ]
                },
                {
                    name: 'flickr',
                    url: /^flickr\.com/
                },
                {
                    name: 'facebook',
                    url: /^facebook\.com/
                }
            ]
        });
        this.registry = new MediaRegistry(editor.locale, editor.config.get('mediaEmbed'));
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const t = editor.t;
        const conversion = editor.conversion;
        const renderMediaPreview = editor.config.get('mediaEmbed.previewsInData');
        const elementName = editor.config.get('mediaEmbed.elementName');
        const registry = this.registry;
        editor.commands.add('mediaEmbed', new MediaEmbedCommand(editor));
        // Configure the schema.
        schema.register('media', {
            inheritAllFrom: '$blockObject',
            allowAttributes: [
                'url'
            ]
        });
        // Model -> Data
        conversion.for('dataDowncast').elementToStructure({
            model: 'media',
            view: (modelElement, { writer })=>{
                const url = modelElement.getAttribute('url');
                return createMediaFigureElement(writer, registry, url, {
                    elementName,
                    renderMediaPreview: !!url && renderMediaPreview
                });
            }
        });
        // Model -> Data (url -> data-oembed-url)
        conversion.for('dataDowncast').add(modelToViewUrlAttributeConverter(registry, {
            elementName,
            renderMediaPreview
        }));
        // Model -> View (element)
        conversion.for('editingDowncast').elementToStructure({
            model: 'media',
            view: (modelElement, { writer })=>{
                const url = modelElement.getAttribute('url');
                const figure = createMediaFigureElement(writer, registry, url, {
                    elementName,
                    renderForEditingView: true
                });
                return toMediaWidget(figure, writer, t('media widget'));
            }
        });
        // Model -> View (url -> data-oembed-url)
        conversion.for('editingDowncast').add(modelToViewUrlAttributeConverter(registry, {
            elementName,
            renderForEditingView: true
        }));
        // View -> Model (data-oembed-url -> url)
        conversion.for('upcast')// Upcast semantic media.
        .elementToElement({
            view: (element)=>[
                    'oembed',
                    elementName
                ].includes(element.name) && element.getAttribute('url') ? {
                    name: true
                } : null,
            model: (viewMedia, { writer })=>{
                const url = viewMedia.getAttribute('url');
                if (registry.hasMedia(url)) {
                    return writer.createElement('media', {
                        url
                    });
                }
                return null;
            }
        })// Upcast non-semantic media.
        .elementToElement({
            view: {
                name: 'div',
                attributes: {
                    'data-oembed-url': true
                }
            },
            model: (viewMedia, { writer })=>{
                const url = viewMedia.getAttribute('data-oembed-url');
                if (registry.hasMedia(url)) {
                    return writer.createElement('media', {
                        url
                    });
                }
                return null;
            }
        })// Consume `<figure class="media">` elements, that were left after upcast.
        .add((dispatcher)=>{
            const converter = (evt, data, conversionApi)=>{
                if (!conversionApi.consumable.consume(data.viewItem, {
                    name: true,
                    classes: 'media'
                })) {
                    return;
                }
                const { modelRange, modelCursor } = conversionApi.convertChildren(data.viewItem, data.modelCursor);
                data.modelRange = modelRange;
                data.modelCursor = modelCursor;
                const modelElement = first(modelRange.getItems());
                if (!modelElement) {
                    // Revert consumed figure so other features can convert it.
                    conversionApi.consumable.revert(data.viewItem, {
                        name: true,
                        classes: 'media'
                    });
                }
            };
            dispatcher.on('element:figure', converter);
        });
    }
}

const URL_REGEXP = /^(?:http(s)?:\/\/)?[\w-]+\.[\w-.~:/?#[\]@!$&'()*+,;=%]+$/;
/**
 * The auto-media embed plugin. It recognizes media links in the pasted content and embeds
 * them shortly after they are injected into the document.
 */ class AutoMediaEmbed extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            Clipboard,
            Delete,
            Undo
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'AutoMediaEmbed';
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
	 * The position where the `<media>` element will be inserted after the timeout,
	 * determined each time the new content is pasted into the document.
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
        // We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
        // After pasting, the content between those positions will be checked for a URL that could be transformed
        // into media.
        const clipboardPipeline = editor.plugins.get('ClipboardPipeline');
        this.listenTo(clipboardPipeline, 'inputTransformation', ()=>{
            const firstRange = modelDocument.selection.getFirstRange();
            const leftLivePosition = ModelLivePosition.fromPosition(firstRange.start);
            leftLivePosition.stickiness = 'toPrevious';
            const rightLivePosition = ModelLivePosition.fromPosition(firstRange.end);
            rightLivePosition.stickiness = 'toNext';
            modelDocument.once('change:data', ()=>{
                this._embedMediaBetweenPositions(leftLivePosition, rightLivePosition);
                leftLivePosition.detach();
                rightLivePosition.detach();
            }, {
                priority: 'high'
            });
        });
        const undoCommand = editor.commands.get('undo');
        undoCommand.on('execute', ()=>{
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
	 * Analyzes the part of the document between provided positions in search for a URL representing media.
	 * When the URL is found, it is automatically converted into media.
	 *
	 * @param leftPosition Left position of the selection.
	 * @param rightPosition Right position of the selection.
	 */ _embedMediaBetweenPositions(leftPosition, rightPosition) {
        const editor = this.editor;
        const mediaRegistry = editor.plugins.get(MediaEmbedEditing).registry;
        // TODO: Use marker instead of ModelLiveRange & LivePositions.
        const urlRange = new ModelLiveRange(leftPosition, rightPosition);
        const walker = urlRange.getWalker({
            ignoreElementEnd: true
        });
        let url = '';
        for (const node of walker){
            if (node.item.is('$textProxy')) {
                url += node.item.data;
            }
        }
        url = url.trim();
        // If the URL does not match to universal URL regexp, let's skip that.
        if (!url.match(URL_REGEXP)) {
            urlRange.detach();
            return;
        }
        // If the URL represents a media, let's use it.
        if (!mediaRegistry.hasMedia(url)) {
            urlRange.detach();
            return;
        }
        const mediaEmbedCommand = editor.commands.get('mediaEmbed');
        // Do not anything if media element cannot be inserted at the current position (#47).
        if (!mediaEmbedCommand.isEnabled) {
            urlRange.detach();
            return;
        }
        // Position won't be available in the `setTimeout` function so let's clone it.
        this._positionToInsert = ModelLivePosition.fromPosition(leftPosition);
        // This action mustn't be executed if undo was called between pasting and auto-embedding.
        this._timeoutId = global.window.setTimeout(()=>{
            editor.model.change((writer)=>{
                this._timeoutId = null;
                writer.remove(urlRange);
                urlRange.detach();
                let insertionPosition = null;
                // Check if position where the media element should be inserted is still valid.
                // Otherwise leave it as undefined to use document.selection - default behavior of model.insertContent().
                if (this._positionToInsert.root.rootName !== '$graveyard') {
                    insertionPosition = this._positionToInsert;
                }
                insertMedia(editor.model, url, insertionPosition, false);
                this._positionToInsert.detach();
                this._positionToInsert = null;
            });
            editor.plugins.get(Delete).requestUndoOnBackspace();
        }, 100);
    }
}

/**
 * The media form view controller class.
 *
 * See {@link module:media-embed/ui/mediaformview~MediaFormView}.
 */ class MediaFormView extends View {
    /**
	 * Tracks information about the DOM focus in the form.
	 */ focusTracker;
    /**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */ keystrokes;
    /**
	 * The URL input view.
	 */ urlInputView;
    /**
	 * An array of form validators used by {@link #isValid}.
	 */ _validators;
    /**
	 * The default info text for the {@link #urlInputView}.
	 */ _urlInputViewInfoDefault;
    /**
	 * The info text with an additional tip for the {@link #urlInputView},
	 * displayed when the input has some value.
	 */ _urlInputViewInfoTip;
    /**
	 * @param validators Form validators used by {@link #isValid}.
	 * @param locale The localization services instance.
	 */ constructor(validators, locale){
        super(locale);
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.set('mediaURLInputValue', '');
        this.urlInputView = this._createUrlInput();
        this._validators = validators;
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: [
                    'ck',
                    'ck-media-form',
                    'ck-responsive-form'
                ],
                tabindex: '-1'
            },
            children: [
                this.urlInputView
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
        // Register the view in the focus tracker.
        this.focusTracker.add(this.urlInputView.element);
        // Start listening for the keystrokes coming from #element.
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
	 * Focuses the {@link #urlInputView}.
	 */ focus() {
        this.urlInputView.focus();
    }
    /**
	 * The native DOM `value` of the {@link #urlInputView} element.
	 *
	 * **Note**: Do not confuse it with the {@link module:ui/inputtext/inputtextview~InputTextView#value}
	 * which works one way only and may not represent the actual state of the component in the DOM.
	 */ get url() {
        return this.urlInputView.fieldView.element.value.trim();
    }
    set url(url) {
        this.urlInputView.fieldView.value = url.trim();
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
                this.urlInputView.errorText = errorText;
                return false;
            }
        }
        return true;
    }
    /**
	 * Cleans up the supplementary error and information text of the {@link #urlInputView}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */ resetFormStatus() {
        this.urlInputView.errorText = null;
        this.urlInputView.infoText = this._urlInputViewInfoDefault;
    }
    /**
	 * Creates a labeled input view.
	 *
	 * @returns Labeled input view instance.
	 */ _createUrlInput() {
        const t = this.locale.t;
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
        const inputField = labeledInput.fieldView;
        this._urlInputViewInfoDefault = t('Paste the media URL in the input.');
        this._urlInputViewInfoTip = t('Tip: Paste the URL into the content to embed faster.');
        labeledInput.label = t('Media URL');
        labeledInput.infoText = this._urlInputViewInfoDefault;
        inputField.inputMode = 'url';
        inputField.on('input', ()=>{
            // Display the tip text only when there is some value. Otherwise fall back to the default info text.
            labeledInput.infoText = inputField.element.value ? this._urlInputViewInfoTip : this._urlInputViewInfoDefault;
            this.mediaURLInputValue = inputField.element.value.trim();
        });
        return labeledInput;
    }
}

/**
 * The media embed UI plugin.
 */ class MediaEmbedUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            MediaEmbedEditing,
            Dialog
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'MediaEmbedUI';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    _formView;
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        editor.ui.componentFactory.add('mediaEmbed', ()=>{
            const t = this.editor.locale.t;
            const button = this._createDialogButton(ButtonView);
            button.tooltip = true;
            button.label = t('Insert media');
            return button;
        });
        editor.ui.componentFactory.add('menuBar:mediaEmbed', ()=>{
            const t = this.editor.locale.t;
            const button = this._createDialogButton(MenuBarMenuListItemButtonView);
            button.label = t('Media');
            return button;
        });
    }
    /**
	 * Creates a button for menu bar that will show media embed dialog.
	 */ _createDialogButton(ButtonClass) {
        const editor = this.editor;
        const buttonView = new ButtonClass(editor.locale);
        const command = editor.commands.get('mediaEmbed');
        const dialogPlugin = this.editor.plugins.get('Dialog');
        buttonView.icon = IconMedia;
        buttonView.bind('isEnabled').to(command, 'isEnabled');
        buttonView.on('execute', ()=>{
            if (dialogPlugin.id === 'mediaEmbed') {
                dialogPlugin.hide();
            } else {
                this._showDialog();
            }
        });
        return buttonView;
    }
    _showDialog() {
        const editor = this.editor;
        const dialog = editor.plugins.get('Dialog');
        const command = editor.commands.get('mediaEmbed');
        const t = editor.locale.t;
        const isMediaSelected = command.value !== undefined;
        if (!this._formView) {
            const registry = editor.plugins.get(MediaEmbedEditing).registry;
            this._formView = new (CssTransitionDisablerMixin(MediaFormView))(getFormValidators(editor.t, registry), editor.locale);
            this._formView.on('submit', ()=>this._handleSubmitForm());
        }
        dialog.show({
            id: 'mediaEmbed',
            title: t('Media embed'),
            content: this._formView,
            isModal: true,
            onShow: ()=>{
                this._formView.url = command.value || '';
                this._formView.resetFormStatus();
                this._formView.urlInputView.fieldView.select();
            },
            actionButtons: [
                {
                    label: t('Cancel'),
                    withText: true,
                    onExecute: ()=>dialog.hide()
                },
                {
                    label: isMediaSelected ? t('Save') : t('Insert'),
                    class: 'ck-button-action',
                    withText: true,
                    onExecute: ()=>this._handleSubmitForm()
                }
            ]
        });
    }
    _handleSubmitForm() {
        const editor = this.editor;
        const dialog = editor.plugins.get('Dialog');
        if (this._formView.isValid()) {
            editor.execute('mediaEmbed', this._formView.url);
            dialog.hide();
            editor.editing.view.focus();
        }
    }
}
function getFormValidators(t, registry) {
    return [
        (form)=>{
            if (!form.url.length) {
                return t('The URL must not be empty.');
            }
        },
        (form)=>{
            if (!registry.hasMedia(form.url)) {
                return t('This media URL is not supported.');
            }
        }
    ];
}

/**
 * The media embed plugin.
 *
 * For a detailed overview, check the {@glink features/media-embed Media Embed feature documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:media-embed/mediaembedediting~MediaEmbedEditing media embed editing feature},
 * * The {@link module:media-embed/mediaembedui~MediaEmbedUI media embed UI feature} and
 * * The {@link module:media-embed/automediaembed~AutoMediaEmbed auto-media embed feature}.
 */ class MediaEmbed extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            MediaEmbedEditing,
            MediaEmbedUI,
            AutoMediaEmbed,
            Widget
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'MediaEmbed';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
}

/**
 * The media embed toolbar plugin. It creates a toolbar for media embed that shows up when the media element is selected.
 *
 * Instances of toolbar components (e.g. buttons) are created based on the
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `media.toolbar` configuration option}.
 */ class MediaEmbedToolbar extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            WidgetToolbarRepository
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'MediaEmbedToolbar';
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
        widgetToolbarRepository.register('mediaEmbed', {
            ariaLabel: t('Media toolbar'),
            items: editor.config.get('mediaEmbed.toolbar') || [],
            getRelatedElement: getSelectedMediaViewWidget
        });
    }
}

export { AutoMediaEmbed, MediaEmbed, MediaEmbedCommand, MediaEmbedEditing, MediaEmbedToolbar, MediaEmbedUI, MediaRegistry, MediaFormView as _MediaFormView, createMediaFigureElement as _createMediaFigureElement, getSelectedMediaModelWidget as _getSelectedMediaModelWidget, getSelectedMediaViewWidget as _getSelectedMediaViewWidget, insertMedia as _insertMedia, isMediaWidget as _isMediaWidget, modelToViewUrlAttributeConverter as _modelToViewUrlAttributeMediaConverter, toMediaWidget as _toMediaWidget };
//# sourceMappingURL=index.js.map

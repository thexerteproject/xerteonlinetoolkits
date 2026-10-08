/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { Plugin, Command, PendingActions } from '@ckeditor/ckeditor5-core/dist/index.js';
import { ButtonView, MenuBarMenuListItemButtonView, Notification } from '@ckeditor/ckeditor5-ui/dist/index.js';
import { IconBrowseFiles, IconImageAssetManager, IconCkboxImageEdit } from '@ckeditor/ckeditor5-icons/dist/index.js';
import { ModelRange } from '@ckeditor/ckeditor5-engine/dist/index.js';
import { createElement, toMap, CKEditorError, logError, global, delay, abortableDebounce, retry } from '@ckeditor/ckeditor5-utils/dist/index.js';
import { decode } from 'blurhash';
import { FileRepository } from '@ckeditor/ckeditor5-upload/dist/index.js';
import { isEqual } from 'es-toolkit/compat';

/**
 * Introduces UI components for the `CKBox` plugin.
 *
 * The plugin introduces two UI components to the {@link module:ui/componentfactory~ComponentFactory UI component factory}:
 *
 * * the `'ckbox'` toolbar button,
 * * the `'menuBar:ckbox'` menu bar component, which is by default added to the `'Insert'` menu.
 *
 * It also integrates with the `insertImage` toolbar component and `menuBar:insertImage` menu component.
 */ class CKBoxUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKBoxUI';
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
        // Do not register the `ckbox` button if the command does not exist.
        // This might happen when CKBox library is not loaded on the page.
        if (!editor.commands.get('ckbox')) {
            return;
        }
        editor.ui.componentFactory.add('ckbox', ()=>this._createFileToolbarButton());
        editor.ui.componentFactory.add('menuBar:ckbox', ()=>this._createFileMenuBarButton());
        if (editor.plugins.has('ImageInsertUI')) {
            editor.plugins.get('ImageInsertUI').registerIntegration({
                name: 'assetManager',
                observable: ()=>editor.commands.get('ckbox'),
                buttonViewCreator: ()=>this._createImageToolbarButton(),
                formViewCreator: ()=>this._createImageDropdownButton(),
                menuBarButtonViewCreator: (isOnly)=>this._createImageMenuBarButton(isOnly ? 'insertOnly' : 'insertNested')
            });
        }
    }
    /**
	 * Creates the base for various kinds of the button component provided by this feature.
	 */ _createButton(ButtonClass) {
        const editor = this.editor;
        const locale = editor.locale;
        const view = new ButtonClass(locale);
        const command = editor.commands.get('ckbox');
        view.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');
        view.on('execute', ()=>{
            editor.execute('ckbox');
        });
        return view;
    }
    /**
	 * Creates a simple toolbar button for files management, with an icon and a tooltip.
	 */ _createFileToolbarButton() {
        const t = this.editor.locale.t;
        const button = this._createButton(ButtonView);
        button.icon = IconBrowseFiles;
        button.label = t('Open file manager');
        button.tooltip = true;
        return button;
    }
    /**
	 * Creates a simple toolbar button for images management, with an icon and a tooltip.
	 */ _createImageToolbarButton() {
        const t = this.editor.locale.t;
        const imageInsertUI = this.editor.plugins.get('ImageInsertUI');
        const button = this._createButton(ButtonView);
        button.icon = IconImageAssetManager;
        button.bind('label').to(imageInsertUI, 'isImageSelected', (isImageSelected)=>isImageSelected ? t('Replace image with file manager') : t('Insert image with file manager'));
        button.tooltip = true;
        return button;
    }
    /**
	 * Creates a button for images management for the dropdown view, with an icon, text and no tooltip.
	 */ _createImageDropdownButton() {
        const t = this.editor.locale.t;
        const imageInsertUI = this.editor.plugins.get('ImageInsertUI');
        const button = this._createButton(ButtonView);
        button.icon = IconImageAssetManager;
        button.withText = true;
        button.bind('label').to(imageInsertUI, 'isImageSelected', (isImageSelected)=>isImageSelected ? t('Replace with file manager') : t('Insert with file manager'));
        button.on('execute', ()=>{
            imageInsertUI.dropdownView.isOpen = false;
        });
        return button;
    }
    /**
	 * Creates a button for files management for the menu bar.
	 */ _createFileMenuBarButton() {
        const t = this.editor.locale.t;
        const button = this._createButton(MenuBarMenuListItemButtonView);
        button.icon = IconBrowseFiles;
        button.withText = true;
        button.label = t('File');
        return button;
    }
    /**
	 * Creates a button for images management for the menu bar.
	 */ _createImageMenuBarButton(type) {
        // Use t() stored in a variable with a different name to reuse existing translations from another package.
        const translateVariableKey = this.editor.locale.t;
        const t = this.editor.locale.t;
        const button = this._createButton(MenuBarMenuListItemButtonView);
        button.icon = IconImageAssetManager;
        button.withText = true;
        switch(type){
            case 'insertOnly':
                button.label = translateVariableKey('Image');
                break;
            case 'insertNested':
                button.label = t('With file manager');
                break;
        }
        return button;
    }
}

/**
 * Converts image source set provided by the CKBox into an object containing:
 * - responsive URLs for the "webp" image format,
 * - one fallback URL for browsers that do not support the "webp" format.
 *
 * @internal
 */ function getImageUrls(imageUrls) {
    const responsiveUrls = [];
    let maxWidth = 0;
    for(const key in imageUrls){
        const width = parseInt(key, 10);
        if (!isNaN(width)) {
            if (width > maxWidth) {
                maxWidth = width;
            }
            responsiveUrls.push(`${imageUrls[key]} ${key}w`);
        }
    }
    const imageSources = [
        {
            srcset: responsiveUrls.join(','),
            sizes: `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`,
            type: 'image/webp'
        }
    ];
    return {
        imageFallbackUrl: imageUrls.default,
        imageSources
    };
}
/**
 * Returns a workspace id to use for communication with the CKBox service.
 *
 * @param defaultWorkspaceId The default workspace to use taken from editor config.
 * @internal
 */ function getWorkspaceId(token, defaultWorkspaceId) {
    const [, binaryTokenPayload] = token.value.split('.');
    const payload = JSON.parse(atob(binaryTokenPayload));
    const workspaces = payload.auth?.ckbox?.workspaces || [
        payload.aud
    ];
    if (!defaultWorkspaceId) {
        return workspaces[0];
    }
    if (payload.auth?.ckbox?.role == 'superadmin' || workspaces.includes(defaultWorkspaceId)) {
        return defaultWorkspaceId;
    }
    return null;
}
/**
 * Default resolution for decoding blurhash values.
 * Relatively small values must be used in order to ensure acceptable performance.
 */ const BLUR_RESOLUTION = 32;
/**
 * Generates an image data URL from its `blurhash` representation.
 *
 * @internal
 */ function blurHashToDataUrl(hash) {
    if (!hash) {
        return;
    }
    try {
        const resolutionInPx = `${BLUR_RESOLUTION}px`;
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', resolutionInPx);
        canvas.setAttribute('height', resolutionInPx);
        const ctx = canvas.getContext('2d');
        /* istanbul ignore next -- @preserve */ if (!ctx) {
            return;
        }
        const imageData = ctx.createImageData(BLUR_RESOLUTION, BLUR_RESOLUTION);
        const decoded = decode(hash, BLUR_RESOLUTION, BLUR_RESOLUTION);
        imageData.data.set(decoded);
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
    } catch  {
        return undefined;
    }
}
/**
 * Sends the HTTP request.
 *
 * @internal
 * @param options Configuration options
 * @param options.url The URL where the request will be sent.
 * @param options.signal The AbortSignal to abort the request when needed.
 * @param options.authorization The authorization token for the request.
 * @param options.method The HTTP method (default: 'GET').
 * @param options.data Additional data to send.
 * @param options.onUploadProgress A callback informing about the upload progress.
 */ function sendHttpRequest({ url, method = 'GET', data, onUploadProgress, signal, authorization }) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url.toString());
    xhr.setRequestHeader('Authorization', authorization);
    xhr.setRequestHeader('CKBox-Version', 'CKEditor 5');
    xhr.responseType = 'json';
    // The callback is attached to the `signal#abort` event.
    const abortCallback = ()=>{
        xhr.abort();
    };
    return new Promise((resolve, reject)=>{
        signal.throwIfAborted();
        signal.addEventListener('abort', abortCallback);
        xhr.addEventListener('loadstart', ()=>{
            signal.addEventListener('abort', abortCallback);
        });
        xhr.addEventListener('loadend', ()=>{
            signal.removeEventListener('abort', abortCallback);
        });
        xhr.addEventListener('error', ()=>{
            reject();
        });
        xhr.addEventListener('abort', ()=>{
            reject();
        });
        xhr.addEventListener('load', ()=>{
            const response = xhr.response;
            if (!response || response.statusCode >= 400) {
                return reject(response && response.message);
            }
            resolve(response);
        });
        /* istanbul ignore else -- @preserve */ if (onUploadProgress) {
            xhr.upload.addEventListener('progress', (evt)=>{
                onUploadProgress(evt);
            });
        }
        // Send the request.
        xhr.send(data);
    });
}
const MIME_TO_EXTENSION = {
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff'
};
/**
 * Returns an extension a typical file in the specified `mimeType` format would have.
 *
 * @internal
 */ function convertMimeTypeToExtension(mimeType) {
    return MIME_TO_EXTENSION[mimeType];
}
/**
 * Tries to fetch the given `url` and returns 'content-type' of the response.
 *
 * @internal
 */ async function getContentTypeOfUrl(url, options) {
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            cache: 'force-cache',
            ...options
        });
        if (!response.ok) {
            return '';
        }
        return response.headers.get('content-type') || '';
    } catch  {
        return '';
    }
}
/**
 * Returns an extension from the given value.
 *
 * @internal
 */ function getFileExtension(file) {
    const fileName = file.name;
    const extensionRegExp = /\.(?<ext>[^.]+)$/;
    const match = fileName.match(extensionRegExp);
    return match.groups.ext.toLowerCase();
}

// Defines the waiting time (in milliseconds) for inserting the chosen asset into the model. The chosen asset is temporarily stored in the
// `CKBoxCommand#_chosenAssets` and it is removed from there automatically after this time. See `CKBoxCommand#_chosenAssets` for more
// details.
const ASSET_INSERTION_WAIT_TIMEOUT = 1000;
/**
 * The CKBox command. It is used by the {@link module:ckbox/ckboxediting~CKBoxEditing CKBox editing feature} to open the CKBox file manager.
 * The file manager allows inserting an image or a link to a file into the editor content.
 *
 * ```ts
 * editor.execute( 'ckbox' );
 * ```
 *
 * **Note:** This command uses other features to perform the following tasks:
 * - To insert images it uses the {@link module:image/image/insertimagecommand~InsertImageCommand 'insertImage'} command from the
 * {@link module:image/image~Image Image feature}.
 * - To insert links to other files it uses the {@link module:link/linkcommand~LinkCommand 'link'} command from the
 * {@link module:link/link~Link Link feature}.
 */ class CKBoxCommand extends Command {
    /**
	 * A set of all chosen assets. They are stored temporarily and they are automatically removed 1 second after being chosen.
	 * Chosen assets have to be "remembered" for a while to be able to map the given asset with the element inserted into the model.
	 * This association map is then used to set the ID on the model element.
	 *
	 * All chosen assets are automatically removed after the timeout, because (theoretically) it may happen that they will never be
	 * inserted into the model, even if the {@link module:link/linkcommand~LinkCommand `'link'`} command or the
	 * {@link module:image/image/insertimagecommand~InsertImageCommand `'insertImage'`} command is enabled. Such a case may arise when
	 * another plugin blocks the command execution. Then, in order not to keep the chosen (but not inserted) assets forever, we delete
	 * them automatically to prevent memory leakage. The 1 second timeout is enough to insert the asset into the model and extract the
	 * ID from the chosen asset.
	 *
	 * The assets are stored only if
	 * the {@link module:ckbox/ckboxconfig~CKBoxConfig#ignoreDataId `config.ckbox.ignoreDataId`} option is set to `false` (by default).
	 *
	 * @internal
	 */ _chosenAssets = new Set();
    /**
	 * The DOM element that acts as a mounting point for the CKBox dialog.
	 */ _wrapper = null;
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this._initListeners();
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        this.value = this._getValue();
        this.isEnabled = this._checkEnabled();
    }
    /**
	 * @inheritDoc
	 */ execute() {
        this.fire('ckbox:open');
    }
    /**
	 * Indicates if the CKBox dialog is already opened.
	 *
	 * @protected
	 * @returns {Boolean}
	 */ _getValue() {
        return this._wrapper !== null;
    }
    /**
	 * Checks whether the command can be enabled in the current context.
	 */ _checkEnabled() {
        const imageCommand = this.editor.commands.get('insertImage');
        const linkCommand = this.editor.commands.get('link');
        if (!imageCommand.isEnabled && !linkCommand.isEnabled) {
            return false;
        }
        return true;
    }
    /**
	 * Creates the options object for the CKBox dialog.
	 *
	 * @returns The object with properties:
	 * - theme The theme for CKBox dialog.
	 * - language The language for CKBox dialog.
	 * - tokenUrl The token endpoint URL.
	 * - serviceOrigin The base URL of the API service.
	 * - forceDemoLabel Whether to force "Powered by CKBox" link.
	 * - assets.onChoose The callback function invoked after choosing the assets.
	 * - dialog.onClose The callback function invoked after closing the CKBox dialog.
	 * - dialog.width The dialog width in pixels.
	 * - dialog.height The dialog height in pixels.
	 * - categories.icons Allows setting custom icons for categories.
	 * - view.openLastView Sets if the last view visited by the user will be reopened
	 * on the next startup.
	 * - view.startupFolderId Sets the ID of the folder that will be opened on startup.
	 * - view.startupCategoryId Sets the ID of the category that will be opened on startup.
	 * - view.hideMaximizeButton Sets whether to hide the ‘Maximize’ button.
	 * - view.componentsHideTimeout Sets timeout after which upload components are hidden
	 * after completed upload.
	 * - view.dialogMinimizeTimeout Sets timeout after which upload dialog is minimized
	 * after completed upload.
	 */ _prepareOptions() {
        const editor = this.editor;
        const ckboxConfig = editor.config.get('ckbox');
        const dialog = ckboxConfig.dialog;
        const categories = ckboxConfig.categories;
        const view = ckboxConfig.view;
        const upload = ckboxConfig.upload;
        return {
            theme: ckboxConfig.theme,
            language: ckboxConfig.language,
            tokenUrl: ckboxConfig.tokenUrl,
            serviceOrigin: ckboxConfig.serviceOrigin,
            forceDemoLabel: ckboxConfig.forceDemoLabel,
            choosableFileExtensions: ckboxConfig.choosableFileExtensions,
            assets: {
                onChoose: (assets)=>this.fire('ckbox:choose', assets)
            },
            dialog: {
                onClose: ()=>this.fire('ckbox:close'),
                width: dialog && dialog.width,
                height: dialog && dialog.height
            },
            categories: categories && {
                icons: categories.icons
            },
            view: view && {
                openLastView: view.openLastView,
                startupFolderId: view.startupFolderId,
                startupCategoryId: view.startupCategoryId,
                hideMaximizeButton: view.hideMaximizeButton
            },
            upload: upload && {
                componentsHideTimeout: upload.componentsHideTimeout,
                dialogMinimizeTimeout: upload.dialogMinimizeTimeout
            }
        };
    }
    /**
	 * Initializes various event listeners for the `ckbox:*` events, because all functionality of the `ckbox` command is event-based.
	 */ _initListeners() {
        const editor = this.editor;
        const model = editor.model;
        const shouldInsertDataId = !editor.config.get('ckbox.ignoreDataId');
        const downloadableFilesConfig = editor.config.get('ckbox.downloadableFiles');
        // Refresh the command after firing the `ckbox:*` event.
        this.on('ckbox', ()=>{
            this.refresh();
        }, {
            priority: 'low'
        });
        // Handle opening of the CKBox dialog.
        this.on('ckbox:open', ()=>{
            if (!this.isEnabled || this.value) {
                return;
            }
            this._wrapper = createElement(document, 'div', {
                class: 'ck ckbox-wrapper'
            });
            document.body.appendChild(this._wrapper);
            window.CKBox.mount(this._wrapper, this._prepareOptions());
        });
        // Handle closing of the CKBox dialog.
        this.on('ckbox:close', ()=>{
            if (!this.value) {
                return;
            }
            this._wrapper.remove();
            this._wrapper = null;
            editor.editing.view.focus();
        });
        // Handle choosing the assets.
        this.on('ckbox:choose', (evt, assets)=>{
            if (!this.isEnabled) {
                return;
            }
            const imageCommand = editor.commands.get('insertImage');
            const linkCommand = editor.commands.get('link');
            const assetsToProcess = prepareAssets({
                assets,
                downloadableFilesConfig,
                isImageAllowed: imageCommand.isEnabled,
                isLinkAllowed: linkCommand.isEnabled
            });
            const assetsCount = assetsToProcess.length;
            if (assetsCount === 0) {
                return;
            }
            // All assets are inserted in one undo step.
            model.change((writer)=>{
                for (const asset of assetsToProcess){
                    const isLastAsset = asset === assetsToProcess[assetsCount - 1];
                    const isSingleAsset = assetsCount === 1;
                    this._insertAsset(asset, isLastAsset, writer, isSingleAsset);
                    // If asset ID must be set for the inserted model element, store the asset temporarily and remove it automatically
                    // after the timeout.
                    if (shouldInsertDataId) {
                        setTimeout(()=>this._chosenAssets.delete(asset), ASSET_INSERTION_WAIT_TIMEOUT);
                        this._chosenAssets.add(asset);
                    }
                }
            });
            editor.editing.view.focus();
        });
        // Clean up after the editor is destroyed.
        this.listenTo(editor, 'destroy', ()=>{
            this.fire('ckbox:close');
            this._chosenAssets.clear();
        });
    }
    /**
	 * Inserts the asset into the model.
	 *
	 * @param asset The asset to be inserted.
	 * @param isLastAsset Indicates if the current asset is the last one from the chosen set.
	 * @param writer An instance of the model writer.
	 * @param isSingleAsset It's true when only one asset is processed.
	 */ _insertAsset(asset, isLastAsset, writer, isSingleAsset) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        // Remove the `linkHref` attribute to not affect the asset to be inserted.
        writer.removeSelectionAttribute('linkHref');
        if (asset.type === 'image') {
            this._insertImage(asset);
        } else {
            this._insertLink(asset, writer, isSingleAsset);
        }
        // Except for the last chosen asset, move the selection to the end of the current range to avoid overwriting other, already
        // inserted assets.
        if (!isLastAsset) {
            writer.setSelection(selection.getLastPosition());
        }
    }
    /**
	 * Inserts the image by calling the `insertImage` command.
	 *
	 * @param asset The asset to be inserted.
	 */ _insertImage(asset) {
        const editor = this.editor;
        const { imageFallbackUrl, imageSources, imageTextAlternative, imageWidth, imageHeight, imagePlaceholder } = asset.attributes;
        editor.execute('insertImage', {
            source: {
                src: imageFallbackUrl,
                sources: imageSources,
                alt: imageTextAlternative,
                width: imageWidth,
                height: imageHeight,
                ...imagePlaceholder ? {
                    placeholder: imagePlaceholder
                } : null
            }
        });
    }
    /**
	 * Inserts the link to the asset by calling the `link` command.
	 *
	 * @param asset The asset to be inserted.
	 * @param writer An instance of the model writer.
	 * @param isSingleAsset It's true when only one asset is processed.
	 */ _insertLink(asset, writer, isSingleAsset) {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        const { linkName, linkHref } = asset.attributes;
        // If the selection is collapsed, insert the asset name as the link label and select it.
        if (selection.isCollapsed) {
            const selectionAttributes = toMap(selection.getAttributes());
            const textNode = writer.createText(linkName, selectionAttributes);
            if (!isSingleAsset) {
                const selectionLastPosition = selection.getLastPosition();
                const parentElement = selectionLastPosition.parent;
                // Insert new `paragraph` when selection is not in an empty `paragraph`.
                if (!(parentElement.name === 'paragraph' && parentElement.isEmpty)) {
                    editor.execute('insertParagraph', {
                        position: selectionLastPosition
                    });
                }
                const range = model.insertContent(textNode);
                writer.setSelection(range);
                editor.execute('link', linkHref);
                return;
            }
            const range = model.insertContent(textNode);
            writer.setSelection(range);
        }
        editor.execute('link', linkHref);
    }
}
/**
 * Parses the chosen assets into the internal data format. Filters out chosen assets that are not allowed.
 */ function prepareAssets({ downloadableFilesConfig, assets, isImageAllowed, isLinkAllowed }) {
    return assets.map((asset)=>isImage(asset) ? {
            id: asset.data.id,
            type: 'image',
            attributes: prepareImageAssetAttributes(asset)
        } : {
            id: asset.data.id,
            type: 'link',
            attributes: prepareLinkAssetAttributes(asset, downloadableFilesConfig)
        }).filter((asset)=>asset.type === 'image' ? isImageAllowed : isLinkAllowed);
}
/**
 * Parses the assets attributes into the internal data format.
 *
 * @internal
 */ function prepareImageAssetAttributes(asset) {
    const { imageFallbackUrl, imageSources } = getImageUrls(asset.data.imageUrls);
    const { description, width, height, blurHash } = asset.data.metadata;
    const imagePlaceholder = blurHashToDataUrl(blurHash);
    return {
        imageFallbackUrl,
        imageSources,
        imageTextAlternative: description || '',
        imageWidth: width,
        imageHeight: height,
        ...imagePlaceholder ? {
            imagePlaceholder
        } : null
    };
}
/**
 * Parses the assets attributes into the internal data format.
 *
 * @param asset The asset to prepare the attributes for.
 * @param config The CKBox download asset configuration.
 */ function prepareLinkAssetAttributes(asset, config) {
    return {
        linkName: asset.data.name,
        linkHref: getAssetUrl(asset, config)
    };
}
/**
 * Checks whether the asset is an image.
 */ function isImage(asset) {
    const metadata = asset.data.metadata;
    if (!metadata) {
        return false;
    }
    return metadata.width && metadata.height;
}
/**
 * Creates the URL for the asset.
 *
 * @param asset The asset to create the URL for.
 * @param config The CKBox download asset configuration.
 */ function getAssetUrl(asset, config) {
    const url = new URL(asset.data.url);
    if (isDownloadableAsset(asset, config)) {
        url.searchParams.set('download', 'true');
    }
    return url.toString();
}
/**
 * Determines if download should be enabled for given asset based on configuration.
 *
 * @param asset The asset to check.
 * @param config The CKBox download asset configuration.
 */ function isDownloadableAsset(asset, config) {
    if (typeof config === 'function') {
        return config(asset);
    }
    return true;
}

const DEFAULT_CKBOX_THEME_NAME = 'lark';
/**
 * The CKBox utilities plugin.
 */ class CKBoxUtils extends Plugin {
    /**
	 * CKEditor Cloud Services access token.
	 */ _token;
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKBoxUtils';
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
            'CloudServices'
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        const hasConfiguration = !!editor.config.get('ckbox');
        const isLibraryLoaded = !!window.CKBox;
        // Proceed with plugin initialization only when the integrator intentionally wants to use it, i.e. when the `config.ckbox` exists or
        // the CKBox JavaScript library is loaded.
        if (!hasConfiguration && !isLibraryLoaded) {
            return;
        }
        editor.config.define('ckbox', {
            serviceOrigin: 'https://api.ckbox.io',
            defaultUploadCategories: null,
            ignoreDataId: false,
            language: editor.locale.uiLanguage,
            theme: DEFAULT_CKBOX_THEME_NAME,
            tokenUrl: editor.config.get('cloudServices.tokenUrl')
        });
        const cloudServices = editor.plugins.get('CloudServices');
        const cloudServicesTokenUrl = editor.config.get('cloudServices.tokenUrl');
        const ckboxTokenUrl = editor.config.get('ckbox.tokenUrl');
        if (!ckboxTokenUrl) {
            /**
			 * The {@link module:ckbox/ckboxconfig~CKBoxConfig#tokenUrl `config.ckbox.tokenUrl`} or the
			 * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`}
			 * configuration is required for the CKBox plugin.
			 *
			 * ```ts
			 * ClassicEditor.create( document.createElement( 'div' ), {
			 * 	ckbox: {
			 * 		tokenUrl: "YOUR_TOKEN_URL"
			 * 		// ...
			 * 	}
			 * 	// ...
			 * } );
			 * ```
			 *
			 * @error ckbox-plugin-missing-token-url
			 */ throw new CKEditorError('ckbox-plugin-missing-token-url', this);
        }
        if (ckboxTokenUrl == cloudServicesTokenUrl) {
            this._token = Promise.resolve(cloudServices.token);
        } else {
            this._token = cloudServices.registerTokenUrl(ckboxTokenUrl);
        }
        // Grant access to private categories after token is fetched. This is done within the same promise chain
        // to ensure all services using the token have access to private categories.
        // This step is critical as previewing images from private categories requires proper cookies.
        this._token = this._token.then(async (token)=>{
            await this._authorizePrivateCategoriesAccess(token.value);
            return token;
        });
    }
    /**
	 * Returns a token used by the CKBox plugin for communication with the CKBox service.
	 */ getToken() {
        return this._token;
    }
    /**
	 * The ID of workspace to use when uploading an image.
	 */ async getWorkspaceId() {
        const t = this.editor.t;
        const cannotAccessDefaultWorkspaceError = t('Cannot access default workspace.');
        const defaultWorkspaceId = this.editor.config.get('ckbox.defaultUploadWorkspaceId');
        const workspaceId = getWorkspaceId(await this._token, defaultWorkspaceId);
        if (workspaceId == null) {
            /**
			 * The user is not authorized to access the workspace defined in  the`ckbox.defaultUploadWorkspaceId` configuration.
			 *
			 * @error ckbox-access-default-workspace-error
			 */ logError('ckbox-access-default-workspace-error');
            throw cannotAccessDefaultWorkspaceError;
        }
        return workspaceId;
    }
    /**
	 * Resolves a promise with an object containing a category with which the uploaded file is associated or an error code.
	 */ async getCategoryIdForFile(fileOrUrl, options) {
        const t = this.editor.t;
        const cannotFindCategoryError = t('Cannot determine a category for the uploaded file.');
        const defaultCategories = this.editor.config.get('ckbox.defaultUploadCategories');
        const allCategoriesPromise = this._getAvailableCategories(options);
        const extension = typeof fileOrUrl == 'string' ? convertMimeTypeToExtension(await getContentTypeOfUrl(fileOrUrl, options)) : getFileExtension(fileOrUrl);
        const allCategories = await allCategoriesPromise;
        // Couldn't fetch all categories. Perhaps the authorization token is invalid.
        if (!allCategories) {
            throw cannotFindCategoryError;
        }
        // If a user specifies the plugin configuration, find the first category that accepts the uploaded file.
        if (defaultCategories) {
            const userCategory = Object.keys(defaultCategories).find((category)=>{
                return defaultCategories[category].find((e)=>e.toLowerCase() == extension);
            });
            // If found, return its ID if the category exists on the server side.
            if (userCategory) {
                const serverCategory = allCategories.find((category)=>category.id === userCategory || category.name === userCategory);
                if (!serverCategory) {
                    throw cannotFindCategoryError;
                }
                return serverCategory.id;
            }
        }
        // Otherwise, find the first category that accepts the uploaded file and returns its ID.
        const category = allCategories.find((category)=>category.extensions.find((e)=>e.toLowerCase() == extension));
        if (!category) {
            throw cannotFindCategoryError;
        }
        return category.id;
    }
    /**
	 * Resolves a promise with an array containing available categories with which the uploaded file can be associated.
	 *
	 * If the API returns limited results, the method will collect all items.
	 */ async _getAvailableCategories(options) {
        const ITEMS_PER_REQUEST = 50;
        const editor = this.editor;
        const token = this._token;
        const { signal } = options;
        const serviceOrigin = editor.config.get('ckbox.serviceOrigin');
        const workspaceId = await this.getWorkspaceId();
        try {
            const result = [];
            let offset = 0;
            let remainingItems;
            do {
                const data = await fetchCategories(offset);
                result.push(...data.items);
                remainingItems = data.totalCount - (offset + ITEMS_PER_REQUEST);
                offset += ITEMS_PER_REQUEST;
            }while (remainingItems > 0)
            return result;
        } catch  {
            signal.throwIfAborted();
            /**
			 * Fetching a list of available categories with which an uploaded file can be associated failed.
			 *
			 * @error ckbox-fetch-category-http-error
			 */ logError('ckbox-fetch-category-http-error');
            return undefined;
        }
        async function fetchCategories(offset) {
            const categoryUrl = new URL('categories', serviceOrigin);
            categoryUrl.searchParams.set('limit', String(ITEMS_PER_REQUEST));
            categoryUrl.searchParams.set('offset', String(offset));
            categoryUrl.searchParams.set('workspaceId', workspaceId);
            return sendHttpRequest({
                url: categoryUrl,
                signal,
                authorization: (await token).value
            });
        }
    }
    /**
	 * Authorize private categories access to the CKBox service. Request sets cookie for the current domain,
	 * that allows user to preview images from private categories.
	 */ async _authorizePrivateCategoriesAccess(token) {
        const serviceUrl = this.editor.config.get('ckbox.serviceOrigin');
        const formData = new FormData();
        formData.set('token', token);
        await fetch(`${serviceUrl}/categories/authorizePrivateAccess`, {
            method: 'POST',
            credentials: 'include',
            mode: 'no-cors',
            body: formData
        });
    }
}

/**
 * A plugin that enables file uploads in CKEditor 5 using the CKBox server–side connector.
 * See the {@glink features/file-management/ckbox CKBox file manager integration} guide to learn how to configure
 * and use this feature as well as find out more about the full integration with the file manager
 * provided by the {@link module:ckbox/ckbox~CKBox} plugin.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload overview} guide to learn about
 * other ways to upload images into CKEditor 5.
 */ class CKBoxUploadAdapter extends Plugin {
    /**
	 * @inheritDoc
	 */ static get requires() {
        return [
            'ImageUploadEditing',
            'ImageUploadProgress',
            FileRepository,
            CKBoxEditing
        ];
    }
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKBoxUploadAdapter';
    }
    /**
	 * @inheritDoc
	 */ static get isOfficialPlugin() {
        return true;
    }
    /**
	 * @inheritDoc
	 */ async afterInit() {
        const editor = this.editor;
        const hasConfiguration = !!editor.config.get('ckbox');
        const isLibraryLoaded = !!window.CKBox;
        // Editor supports only one upload adapter. Register the CKBox upload adapter (and potentially overwrite other one) only when the
        // integrator intentionally wants to use the CKBox plugin, i.e. when the `config.ckbox` exists or the CKBox JavaScript library is
        // loaded.
        if (!hasConfiguration && !isLibraryLoaded) {
            return;
        }
        const fileRepository = editor.plugins.get(FileRepository);
        const ckboxUtils = editor.plugins.get(CKBoxUtils);
        fileRepository.createUploadAdapter = (loader)=>new Adapter(loader, editor, ckboxUtils);
        const shouldInsertDataId = !editor.config.get('ckbox.ignoreDataId');
        const imageUploadEditing = editor.plugins.get('ImageUploadEditing');
        // Mark uploaded assets with the `ckboxImageId` attribute. Its value represents an ID in CKBox.
        if (shouldInsertDataId) {
            imageUploadEditing.on('uploadComplete', (evt, { imageElement, data })=>{
                editor.model.change((writer)=>{
                    writer.setAttribute('ckboxImageId', data.ckboxImageId, imageElement);
                });
            });
        }
    }
}
/**
 * Upload adapter for CKBox.
 */ class Adapter {
    /**
	 * FileLoader instance to use during the upload.
	 */ loader;
    /**
	 * CKEditor Cloud Services access token.
	 */ token;
    /**
	 * The editor instance.
	 */ editor;
    /**
	 * The abort controller for aborting asynchronous processes.
	 */ controller;
    /**
	 * The base URL where all requests should be sent.
	 */ serviceOrigin;
    /**
	 * The reference to CKBoxUtils plugin.
	 */ ckboxUtils;
    /**
	 * Creates a new adapter instance.
	 */ constructor(loader, editor, ckboxUtils){
        this.loader = loader;
        this.token = ckboxUtils.getToken();
        this.ckboxUtils = ckboxUtils;
        this.editor = editor;
        this.controller = new AbortController();
        this.serviceOrigin = editor.config.get('ckbox.serviceOrigin');
    }
    /**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */ async upload() {
        const ckboxUtils = this.ckboxUtils;
        const t = this.editor.t;
        const file = await this.loader.file;
        const category = await ckboxUtils.getCategoryIdForFile(file, {
            signal: this.controller.signal
        });
        const uploadUrl = new URL('assets', this.serviceOrigin);
        const formData = new FormData();
        uploadUrl.searchParams.set('workspaceId', await ckboxUtils.getWorkspaceId());
        formData.append('categoryId', category);
        formData.append('file', file);
        const requestConfig = {
            method: 'POST',
            url: uploadUrl,
            data: formData,
            onUploadProgress: (evt)=>{
                /* istanbul ignore else -- @preserve */ if (evt.lengthComputable) {
                    this.loader.uploadTotal = evt.total;
                    this.loader.uploaded = evt.loaded;
                }
            },
            signal: this.controller.signal,
            authorization: (await this.token).value
        };
        return sendHttpRequest(requestConfig).then(async (data)=>{
            const imageUrls = getImageUrls(data.imageUrls);
            return {
                ckboxImageId: data.id,
                default: imageUrls.imageFallbackUrl,
                sources: imageUrls.imageSources
            };
        }).catch(()=>{
            const genericError = t('Cannot upload file:') + ` ${file.name}.`;
            return Promise.reject(genericError);
        });
    }
    /**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 */ abort() {
        this.controller.abort();
    }
}

const COMMAND_FORCE_DISABLE_ID = 'NoPermission';
/**
 * The CKBox editing feature. It introduces the {@link module:ckbox/ckboxcommand~CKBoxCommand CKBox command} and
 * {@link module:ckbox/ckboxuploadadapter~CKBoxUploadAdapter CKBox upload adapter}.
 */ class CKBoxEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKBoxEditing';
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
            'LinkEditing',
            'PictureEditing',
            CKBoxUploadAdapter,
            CKBoxUtils
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const editor = this.editor;
        if (!this._shouldBeInitialised()) {
            return;
        }
        this._checkImagePlugins();
        // Registering the `ckbox` command makes sense only if the CKBox library is loaded, as the `ckbox` command opens the CKBox dialog.
        if (isLibraryLoaded()) {
            editor.commands.add('ckbox', new CKBoxCommand(editor));
        }
        // Promise is not handled intentionally. Errors should be displayed in console if there are so.
        isUploadPermissionGranted(editor).then((isCreateAssetAllowed)=>{
            if (!isCreateAssetAllowed) {
                this._blockImageCommands();
            }
        });
    }
    /**
	 * @inheritDoc
	 */ afterInit() {
        const editor = this.editor;
        if (!this._shouldBeInitialised()) {
            return;
        }
        // Extending the schema, registering converters and applying fixers only make sense if the configuration option to assign
        // the assets ID with the model elements is enabled.
        if (!editor.config.get('ckbox.ignoreDataId')) {
            this._initSchema();
            this._initConversion();
            this._initFixers();
        }
    }
    /**
	 * Returns true only when the integrator intentionally wants to use the plugin, i.e. when the `config.ckbox` exists or
	 * the CKBox JavaScript library is loaded.
	 */ _shouldBeInitialised() {
        const editor = this.editor;
        const hasConfiguration = !!editor.config.get('ckbox');
        return hasConfiguration || isLibraryLoaded();
    }
    /**
	 * Blocks `uploadImage` and `ckboxImageEdit` commands.
	 */ _blockImageCommands() {
        const editor = this.editor;
        const uploadImageCommand = editor.commands.get('uploadImage');
        const imageEditingCommand = editor.commands.get('ckboxImageEdit');
        if (uploadImageCommand) {
            uploadImageCommand.isAccessAllowed = false;
            uploadImageCommand.forceDisabled(COMMAND_FORCE_DISABLE_ID);
        }
        if (imageEditingCommand) {
            imageEditingCommand.forceDisabled(COMMAND_FORCE_DISABLE_ID);
        }
    }
    /**
	 * Checks if at least one image plugin is loaded.
	 */ _checkImagePlugins() {
        const editor = this.editor;
        if (!editor.plugins.has('ImageBlockEditing') && !editor.plugins.has('ImageInlineEditing')) {
            /**
			 * The CKBox feature requires one of the following plugins to be loaded to work correctly:
			 *
			 * * {@link module:image/imageblock~ImageBlock},
			 * * {@link module:image/imageinline~ImageInline},
			 * * {@link module:image/image~Image} (loads both `ImageBlock` and `ImageInline`)
			 *
			 * Please make sure your editor configuration is correct.
			 *
			 * @error ckbox-plugin-image-feature-missing
			 * @param {module:core/editor/editor~Editor} editor The editor instance.
			 */ logError('ckbox-plugin-image-feature-missing', editor);
        }
    }
    /**
	 * Extends the schema to allow the `ckboxImageId` and `ckboxLinkId` attributes for links and images.
	 */ _initSchema() {
        const editor = this.editor;
        const schema = editor.model.schema;
        schema.extend('$text', {
            allowAttributes: 'ckboxLinkId'
        });
        if (schema.isRegistered('imageBlock')) {
            schema.extend('imageBlock', {
                allowAttributes: [
                    'ckboxImageId',
                    'ckboxLinkId'
                ]
            });
        }
        if (schema.isRegistered('imageInline')) {
            schema.extend('imageInline', {
                allowAttributes: [
                    'ckboxImageId',
                    'ckboxLinkId'
                ]
            });
        }
        schema.addAttributeCheck((context)=>{
            // Don't allow `ckboxLinkId` on elements which do not have `linkHref` attribute.
            if (!context.last.getAttribute('linkHref')) {
                return false;
            }
        }, 'ckboxLinkId');
    }
    /**
	 * Configures the upcast and downcast conversions for the `ckboxImageId` and `ckboxLinkId` attributes.
	 */ _initConversion() {
        const editor = this.editor;
        // Convert `ckboxLinkId` => `data-ckbox-resource-id`.
        editor.conversion.for('downcast').add((dispatcher)=>{
            // Due to custom converters for linked block images, handle the `ckboxLinkId` attribute manually.
            dispatcher.on('attribute:ckboxLinkId:imageBlock', (evt, data, conversionApi)=>{
                const { writer, mapper, consumable } = conversionApi;
                if (!consumable.consume(data.item, evt.name)) {
                    return;
                }
                const viewFigure = mapper.toViewElement(data.item);
                const linkInImage = [
                    ...viewFigure.getChildren()
                ].find((child)=>child.name === 'a');
                // No link inside an image - no conversion needed.
                if (!linkInImage) {
                    return;
                }
                if (data.item.hasAttribute('ckboxLinkId')) {
                    writer.setAttribute('data-ckbox-resource-id', data.item.getAttribute('ckboxLinkId'), linkInImage);
                } else {
                    writer.removeAttribute('data-ckbox-resource-id', linkInImage);
                }
            }, {
                priority: 'low'
            });
            dispatcher.on('attribute:ckboxLinkId', (evt, data, conversionApi)=>{
                const { writer, mapper, consumable } = conversionApi;
                if (!consumable.consume(data.item, evt.name)) {
                    return;
                }
                // Remove the previous attribute value if it was applied.
                if (data.attributeOldValue) {
                    const viewElement = createLinkElement(writer, data.attributeOldValue);
                    writer.unwrap(mapper.toViewRange(data.range), viewElement);
                }
                // Add the new attribute value if specified in a model element.
                if (data.attributeNewValue) {
                    const viewElement = createLinkElement(writer, data.attributeNewValue);
                    if (data.item.is('selection')) {
                        const viewSelection = writer.document.selection;
                        writer.wrap(viewSelection.getFirstRange(), viewElement);
                    } else {
                        writer.wrap(mapper.toViewRange(data.range), viewElement);
                    }
                }
            }, {
                priority: 'low'
            });
        });
        // Convert `data-ckbox-resource-id` => `ckboxLinkId`.
        //
        // The helper conversion does not handle all cases, so take care of the `data-ckbox-resource-id` attribute manually for images
        // and links.
        editor.conversion.for('upcast').add((dispatcher)=>{
            dispatcher.on('element:a', (evt, data, conversionApi)=>{
                const { writer, consumable } = conversionApi;
                // Upcast the `data-ckbox-resource-id` attribute only for valid link elements.
                if (!data.viewItem.getAttribute('href')) {
                    return;
                }
                const consumableAttributes = {
                    attributes: [
                        'data-ckbox-resource-id'
                    ]
                };
                if (!consumable.consume(data.viewItem, consumableAttributes)) {
                    return;
                }
                const attributeValue = data.viewItem.getAttribute('data-ckbox-resource-id');
                // Missing the `data-ckbox-resource-id` attribute.
                if (!attributeValue) {
                    return;
                }
                if (data.modelRange) {
                    // If the `<a>` element contains more than single children (e.g. a linked image), set the `ckboxLinkId` for each
                    // allowed child.
                    for (let item of data.modelRange.getItems()){
                        if (item.is('$textProxy')) {
                            item = item.textNode;
                        }
                        // Do not copy the `ckboxLinkId` attribute when wrapping an element in a block element, e.g. when
                        // auto-paragraphing.
                        if (shouldUpcastAttributeForNode(item)) {
                            writer.setAttribute('ckboxLinkId', attributeValue, item);
                        }
                    }
                } else {
                    // Otherwise, just set the `ckboxLinkId` for the model element.
                    const modelElement = data.modelCursor.nodeBefore || data.modelCursor.parent;
                    writer.setAttribute('ckboxLinkId', attributeValue, modelElement);
                }
            }, {
                priority: 'low'
            });
        });
        // Convert `ckboxImageId` => `data-ckbox-resource-id`.
        editor.conversion.for('downcast').attributeToAttribute({
            model: 'ckboxImageId',
            view: 'data-ckbox-resource-id'
        });
        // Convert `data-ckbox-resource-id` => `ckboxImageId`.
        editor.conversion.for('upcast').elementToAttribute({
            model: {
                key: 'ckboxImageId',
                value: (viewElement)=>viewElement.getAttribute('data-ckbox-resource-id')
            },
            view: {
                attributes: {
                    'data-ckbox-resource-id': /[\s\S]+/
                }
            }
        });
        const replaceImageSourceCommand = editor.commands.get('replaceImageSource');
        if (replaceImageSourceCommand) {
            this.listenTo(replaceImageSourceCommand, 'cleanupImage', (_, [writer, image])=>{
                writer.removeAttribute('ckboxImageId', image);
            });
        }
    }
    /**
	 * Registers post-fixers that add or remove the `ckboxLinkId` and `ckboxImageId` attributes.
	 */ _initFixers() {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;
        // Registers the post-fixer to sync the asset ID with the model elements.
        model.document.registerPostFixer(syncDataIdPostFixer(editor));
        // Registers the post-fixer to remove the `ckboxLinkId` attribute from the model selection.
        model.document.registerPostFixer(injectSelectionPostFixer(selection));
    }
}
/**
 * A post-fixer that synchronizes the asset ID with the model element.
 */ function syncDataIdPostFixer(editor) {
    return (writer)=>{
        let changed = false;
        const model = editor.model;
        const ckboxCommand = editor.commands.get('ckbox');
        // The ID from chosen assets are stored in the `CKBoxCommand#_chosenAssets`. If there is no command, it makes no sense to check
        // for changes in the model.
        if (!ckboxCommand) {
            return changed;
        }
        for (const entry of model.document.differ.getChanges()){
            if (entry.type !== 'insert' && entry.type !== 'attribute') {
                continue;
            }
            const range = entry.type === 'insert' ? new ModelRange(entry.position, entry.position.getShiftedBy(entry.length)) : entry.range;
            const isLinkHrefAttributeRemoval = entry.type === 'attribute' && entry.attributeKey === 'linkHref' && entry.attributeNewValue === null;
            for (const item of range.getItems()){
                // If the `linkHref` attribute has been removed, sync the change with the `ckboxLinkId` attribute.
                if (isLinkHrefAttributeRemoval && item.hasAttribute('ckboxLinkId')) {
                    writer.removeAttribute('ckboxLinkId', item);
                    changed = true;
                    continue;
                }
                // Otherwise, the change concerns either a new model element or an attribute change. Try to find the assets for the modified
                // model element.
                const assets = findAssetsForItem(item, ckboxCommand._chosenAssets);
                for (const asset of assets){
                    const attributeName = asset.type === 'image' ? 'ckboxImageId' : 'ckboxLinkId';
                    if (asset.id === item.getAttribute(attributeName)) {
                        continue;
                    }
                    writer.setAttribute(attributeName, asset.id, item);
                    changed = true;
                }
            }
        }
        return changed;
    };
}
/**
 * A post-fixer that removes the `ckboxLinkId` from the selection if it does not represent a link anymore.
 */ function injectSelectionPostFixer(selection) {
    return (writer)=>{
        const shouldRemoveLinkIdAttribute = !selection.hasAttribute('linkHref') && selection.hasAttribute('ckboxLinkId');
        if (shouldRemoveLinkIdAttribute) {
            writer.removeSelectionAttribute('ckboxLinkId');
            return true;
        }
        return false;
    };
}
/**
 * Tries to find the asset that is associated with the model element by comparing the attributes:
 * - the image fallback URL with the `src` attribute for images,
 * - the link URL with the `href` attribute for links.
 *
 * For any model element, zero, one or more than one asset can be found (e.g. a linked image may be associated with the link asset and the
 * image asset).
 */ function findAssetsForItem(item, assets) {
    const isImageElement = item.is('element', 'imageInline') || item.is('element', 'imageBlock');
    const isLinkElement = item.hasAttribute('linkHref');
    return [
        ...assets
    ].filter((asset)=>{
        if (asset.type === 'image' && isImageElement) {
            return asset.attributes.imageFallbackUrl === item.getAttribute('src');
        }
        if (asset.type === 'link' && isLinkElement) {
            return asset.attributes.linkHref === item.getAttribute('linkHref');
        }
    });
}
/**
 * Creates view link element with the requested ID.
 */ function createLinkElement(writer, id) {
    // Priority equal 5 is needed to merge adjacent `<a>` elements together.
    const viewElement = writer.createAttributeElement('a', {
        'data-ckbox-resource-id': id
    }, {
        priority: 5
    });
    writer.setCustomProperty('link', true, viewElement);
    return viewElement;
}
/**
 * Checks if the model element may have the `ckboxLinkId` attribute.
 */ function shouldUpcastAttributeForNode(node) {
    if (node.is('$text')) {
        return true;
    }
    if (node.is('element', 'imageInline') || node.is('element', 'imageBlock')) {
        return true;
    }
    return false;
}
/**
 * Returns true if the CKBox library is loaded, false otherwise.
 */ function isLibraryLoaded() {
    return !!window.CKBox;
}
/**
 * Checks is access allowed to upload assets.
 */ async function isUploadPermissionGranted(editor) {
    const ckboxUtils = editor.plugins.get(CKBoxUtils);
    const origin = editor.config.get('ckbox.serviceOrigin');
    const url = new URL('permissions', origin);
    const { value } = await ckboxUtils.getToken();
    const response = await sendHttpRequest({
        url,
        authorization: value,
        signal: new AbortController().signal // Aborting is unnecessary.
    });
    return Object.values(response).some((category)=>category['asset:create']);
}

/**
 * The CKBox feature, a bridge between the CKEditor 5 WYSIWYG editor and the CKBox file manager and uploader.
 *
 * This is a "glue" plugin which enables:
 *
 * * {@link module:ckbox/ckboxediting~CKBoxEditing},
 * * {@link module:ckbox/ckboxui~CKBoxUI},
 *
 * See the {@glink features/file-management/ckbox CKBox integration} guide to learn how to configure and use this feature.
 *
 * Check out the {@glink features/images/image-upload/image-upload Image upload} guide to learn about other ways to upload
 * images into CKEditor 5.
 */ class CKBox extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKBox';
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
            CKBoxEditing,
            CKBoxUI
        ];
    }
}

/**
 * @internal
 */ function createEditabilityChecker(allowExternalImagesEditing) {
    const checkUrl = createUrlChecker(allowExternalImagesEditing);
    return (element)=>{
        const isImageElement = element.is('element', 'imageInline') || element.is('element', 'imageBlock');
        if (!isImageElement) {
            return false;
        }
        if (element.hasAttribute('ckboxImageId')) {
            return true;
        }
        if (element.hasAttribute('src')) {
            return checkUrl(element.getAttribute('src'));
        }
        return false;
    };
}
function createUrlChecker(allowExternalImagesEditing) {
    if (Array.isArray(allowExternalImagesEditing)) {
        const urlMatchers = allowExternalImagesEditing.map(createUrlChecker);
        return (src)=>urlMatchers.some((matcher)=>matcher(src));
    }
    if (allowExternalImagesEditing == 'origin') {
        const origin = global.window.location.origin;
        return (src)=>new URL(src, global.document.baseURI).origin == origin;
    }
    if (typeof allowExternalImagesEditing == 'function') {
        return allowExternalImagesEditing;
    }
    if (allowExternalImagesEditing instanceof RegExp) {
        return (src)=>!!(src.match(allowExternalImagesEditing) || src.replace(/^https?:\/\//, '').match(allowExternalImagesEditing));
    }
    return ()=>false;
}

/**
 * The CKBox edit image command.
 *
 * Opens the CKBox dialog for editing the image.
 */ class CKBoxImageEditCommand extends Command {
    /**
	 * The DOM element that acts as a mounting point for the CKBox Edit Image dialog.
	 */ _wrapper = null;
    /**
	 * The states of image processing in progress.
	 */ _processInProgress = new Set();
    /**
	 * Determines if the element can be edited.
	 */ _canEdit;
    /**
	 * A wrapper function to prepare mount options. Ensures that at most one preparation is in-flight.
	 */ _prepareOptions;
    /**
	* CKBox's onClose function runs before the final cleanup, potentially causing
	* page layout changes after it finishes. To address this, we use a setTimeout hack
	* to ensure that floating elements on the page maintain their correct position.
	*
	* See: https://github.com/ckeditor/ckeditor5/issues/16153.
	*/ _updateUiDelayed = delay(()=>this.editor.ui.update(), 0);
    /**
	 * @inheritDoc
	 */ constructor(editor){
        super(editor);
        this.value = false;
        this._canEdit = createEditabilityChecker(editor.config.get('ckbox.allowExternalImagesEditing'));
        this._prepareOptions = abortableDebounce((signal, state)=>this._prepareOptionsAbortable(signal, state));
        this._prepareListeners();
    }
    /**
	 * @inheritDoc
	 */ refresh() {
        const editor = this.editor;
        this.value = this._getValue();
        const selectedElement = editor.model.document.selection.getSelectedElement();
        this.isEnabled = !!selectedElement && this._canEdit(selectedElement) && !this._checkIfElementIsBeingProcessed(selectedElement);
    }
    /**
	 * Opens the CKBox Image Editor dialog for editing the image.
	 */ execute() {
        if (this._getValue()) {
            return;
        }
        const wrapper = createElement(document, 'div', {
            class: 'ck ckbox-wrapper'
        });
        this._wrapper = wrapper;
        this.value = true;
        document.body.appendChild(this._wrapper);
        const imageElement = this.editor.model.document.selection.getSelectedElement();
        const processingState = {
            element: imageElement,
            controller: new AbortController()
        };
        this._prepareOptions(processingState).then((options)=>window.CKBox.mountImageEditor(wrapper, options), (error)=>{
            const editor = this.editor;
            const t = editor.t;
            const notification = editor.plugins.get(Notification);
            notification.showWarning(t('Failed to determine category of edited image.'), {
                namespace: 'ckbox'
            });
            console.error(error);
            this._handleImageEditorClose();
        });
    }
    /**
	 * @inheritDoc
	 */ destroy() {
        this._handleImageEditorClose();
        this._prepareOptions.abort();
        this._updateUiDelayed.cancel();
        for (const state of this._processInProgress.values()){
            state.controller.abort();
        }
        super.destroy();
    }
    /**
	 * Indicates if the CKBox Image Editor dialog is already opened.
	 */ _getValue() {
        return this._wrapper !== null;
    }
    /**
	 * Creates the options object for the CKBox Image Editor dialog.
	 */ async _prepareOptionsAbortable(signal, state) {
        const editor = this.editor;
        const ckboxConfig = editor.config.get('ckbox');
        const ckboxUtils = editor.plugins.get(CKBoxUtils);
        const { element } = state;
        let imageMountOptions;
        const ckboxImageId = element.getAttribute('ckboxImageId');
        if (ckboxImageId) {
            imageMountOptions = {
                assetId: ckboxImageId
            };
        } else {
            const imageUrl = new URL(element.getAttribute('src'), document.baseURI).href;
            const uploadCategoryId = await ckboxUtils.getCategoryIdForFile(imageUrl, {
                signal
            });
            imageMountOptions = {
                imageUrl,
                uploadCategoryId
            };
        }
        return {
            ...imageMountOptions,
            imageEditing: {
                allowOverwrite: false
            },
            tokenUrl: ckboxConfig.tokenUrl,
            language: ckboxConfig.language,
            ...ckboxConfig.serviceOrigin && {
                serviceOrigin: ckboxConfig.serviceOrigin
            },
            onClose: ()=>this._handleImageEditorClose(),
            onSave: (asset)=>this._handleImageEditorSave(state, asset)
        };
    }
    /**
	 * Initializes event lister for an event of removing an image.
	 */ _prepareListeners() {
        // Abort editing processing when the image has been removed.
        this.listenTo(this.editor.model.document, 'change:data', ()=>{
            const processingStates = this._getProcessingStatesOfDeletedImages();
            processingStates.forEach((processingState)=>{
                processingState.controller.abort();
            });
        });
    }
    /**
	 * Gets processing states of images that have been deleted in the mean time.
	 */ _getProcessingStatesOfDeletedImages() {
        const states = [];
        for (const state of this._processInProgress.values()){
            if (state.element.root.rootName == '$graveyard') {
                states.push(state);
            }
        }
        return states;
    }
    _checkIfElementIsBeingProcessed(selectedElement) {
        for (const { element } of this._processInProgress){
            if (isEqual(element, selectedElement)) {
                return true;
            }
        }
        return false;
    }
    /**
	 * Closes the CKBox Image Editor dialog.
	 */ _handleImageEditorClose() {
        if (!this._wrapper) {
            return;
        }
        this._wrapper.remove();
        this._wrapper = null;
        this.editor.editing.view.focus();
        this._updateUiDelayed();
        this.refresh();
    }
    /**
	 * Save edited image. In case server respond with "success" replace with edited image,
	 * otherwise show notification error.
	 */ _handleImageEditorSave(state, asset) {
        const t = this.editor.locale.t;
        const notification = this.editor.plugins.get(Notification);
        const pendingActions = this.editor.plugins.get(PendingActions);
        const action = pendingActions.add(t('Processing the edited image.'));
        this._processInProgress.add(state);
        this._showImageProcessingIndicator(state.element, asset);
        this.refresh();
        this._waitForAssetProcessed(asset.data.id, state.controller.signal).then((asset)=>{
            this._replaceImage(state.element, asset);
        }, (error)=>{
            // Remove processing indicator. It was added only to ViewElement.
            this.editor.editing.reconvertItem(state.element);
            if (state.controller.signal.aborted) {
                return;
            }
            if (!error || error instanceof CKEditorError) {
                notification.showWarning(t('Server failed to process the image.'), {
                    namespace: 'ckbox'
                });
            } else {
                console.error(error);
            }
        }).finally(()=>{
            this._processInProgress.delete(state);
            pendingActions.remove(action);
            this.refresh();
        });
    }
    /**
	 * Get asset's status on server. If server responds with "success" status then
	 * image is already proceeded and ready for saving.
	 */ async _getAssetStatusFromServer(id, signal) {
        const ckboxUtils = this.editor.plugins.get(CKBoxUtils);
        const url = new URL('assets/' + id, this.editor.config.get('ckbox.serviceOrigin'));
        const response = await sendHttpRequest({
            url,
            signal,
            authorization: (await ckboxUtils.getToken()).value
        });
        const status = response.metadata.metadataProcessingStatus;
        if (!status || status == 'queued') {
            /**
			 * Image has not been processed yet.
			 *
			 * @error ckbox-image-not-processed
			 */ throw new CKEditorError('ckbox-image-not-processed');
        }
        return {
            data: {
                ...response
            }
        };
    }
    /**
	 * Waits for an asset to be processed.
	 * It retries retrieving asset status from the server in case of failure.
	 */ async _waitForAssetProcessed(id, signal) {
        const result = await retry(()=>this._getAssetStatusFromServer(id, signal), {
            signal,
            maxAttempts: 5
        });
        if (result.data.metadata.metadataProcessingStatus != 'success') {
            /**
			 * The image processing failed.
			 *
			 * @error ckbox-image-processing-failed
			 */ throw new CKEditorError('ckbox-image-processing-failed');
        }
        return result;
    }
    /**
	 * Shows processing indicator while image is processing.
	 *
	 * @param asset Data about certain asset.
	 */ _showImageProcessingIndicator(element, asset) {
        const editor = this.editor;
        editor.editing.view.change((writer)=>{
            const imageElementView = editor.editing.mapper.toViewElement(element);
            const imageUtils = this.editor.plugins.get('ImageUtils');
            const img = imageUtils.findViewImgElement(imageElementView);
            writer.removeStyle('aspect-ratio', img);
            writer.setAttribute('width', asset.data.metadata.width, img);
            writer.setAttribute('height', asset.data.metadata.height, img);
            writer.setStyle('width', `${asset.data.metadata.width}px`, img);
            writer.setStyle('height', `${asset.data.metadata.height}px`, img);
            writer.addClass('image-processing', imageElementView);
        });
    }
    /**
	 * Replace the edited image with the new one.
	 */ _replaceImage(element, asset) {
        const editor = this.editor;
        const { imageFallbackUrl, imageSources, imageWidth, imageHeight, imagePlaceholder } = prepareImageAssetAttributes(asset);
        const previousSelectionRanges = Array.from(editor.model.document.selection.getRanges());
        editor.model.change((writer)=>{
            writer.setSelection(element, 'on');
            editor.execute('insertImage', {
                imageType: element.is('element', 'imageInline') ? 'imageInline' : null,
                source: {
                    src: imageFallbackUrl,
                    sources: imageSources,
                    width: imageWidth,
                    height: imageHeight,
                    ...imagePlaceholder ? {
                        placeholder: imagePlaceholder
                    } : null,
                    ...element.hasAttribute('alt') ? {
                        alt: element.getAttribute('alt')
                    } : null
                }
            });
            const previousChildren = element.getChildren();
            element = editor.model.document.selection.getSelectedElement();
            for (const child of previousChildren){
                writer.append(writer.cloneElement(child), element);
            }
            writer.setAttribute('ckboxImageId', asset.data.id, element);
            writer.setSelection(previousSelectionRanges);
        });
    }
}

/**
 * The CKBox image edit editing plugin.
 */ class CKBoxImageEditEditing extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKBoxImageEditEditing';
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
            CKBoxEditing,
            CKBoxUtils,
            PendingActions,
            Notification,
            'ImageUtils',
            'ImageEditing'
        ];
    }
    /**
	 * @inheritDoc
	 */ init() {
        const { editor } = this;
        editor.commands.add('ckboxImageEdit', new CKBoxImageEditCommand(editor));
    }
}

/**
 * The UI plugin of the CKBox image edit feature.
 *
 * It registers the `'ckboxImageEdit'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that allows you to open the CKBox dialog and edit the image.
 */ class CKBoxImageEditUI extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKBoxImageEditUI';
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
        editor.ui.componentFactory.add('ckboxImageEdit', (locale)=>{
            const command = editor.commands.get('ckboxImageEdit');
            const uploadImageCommand = editor.commands.get('uploadImage');
            const view = new ButtonView(locale);
            const t = locale.t;
            view.set({
                icon: IconCkboxImageEdit,
                tooltip: true
            });
            view.bind('label').to(uploadImageCommand, 'isAccessAllowed', (isAccessAllowed)=>isAccessAllowed ? t('Edit image') : t('You have no image editing permissions.'));
            view.bind('isOn').to(command, 'value', command, 'isEnabled', (value, isEnabled)=>value && isEnabled);
            view.bind('isEnabled').to(command);
            // Execute the command.
            this.listenTo(view, 'execute', ()=>{
                editor.execute('ckboxImageEdit');
                editor.editing.view.focus();
            });
            return view;
        });
    }
}

/**
 * The CKBox image edit feature.
 */ class CKBoxImageEdit extends Plugin {
    /**
	 * @inheritDoc
	 */ static get pluginName() {
        return 'CKBoxImageEdit';
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
            CKBoxImageEditEditing,
            CKBoxImageEditUI
        ];
    }
}

export { CKBox, CKBoxCommand, CKBoxEditing, CKBoxImageEdit, CKBoxImageEditCommand, CKBoxImageEditEditing, CKBoxImageEditUI, CKBoxUI, CKBoxUploadAdapter, CKBoxUtils, convertMimeTypeToExtension as _ckBoxConvertMimeTypeToExtension, blurHashToDataUrl as _ckboxBlurHashToDataUrl, createEditabilityChecker as _createCKBoxEditabilityChecker, getContentTypeOfUrl as _getCKBoxContentTypeOfUrl, getFileExtension as _getCKBoxFileExtension, getImageUrls as _getCKBoxImageUrls, getWorkspaceId as _getCKBoxWorkspaceId, prepareImageAssetAttributes as _prepareCKBoxImageAssetAttributes, sendHttpRequest as _sendCKBoxHttpRequest };
//# sourceMappingURL=index.js.map

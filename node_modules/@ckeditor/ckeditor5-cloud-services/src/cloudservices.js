/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module cloud-services/cloudservices
 */
import { ContextPlugin } from 'ckeditor5/src/core.js';
import { CKEditorError } from 'ckeditor5/src/utils.js';
import { CloudServicesCore } from './cloudservicescore.js';
/**
 * Plugin introducing the integration between CKEditor 5 and CKEditor Cloud Services .
 *
 * It initializes the token provider based on
 * the {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig `config.cloudService`}.
 */
export class CloudServices extends ContextPlugin {
    /**
     * The authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
     * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} for more details.
     */
    tokenUrl;
    /**
     * The URL to which the files should be uploaded.
     */
    uploadUrl;
    /**
     * The URL for web socket communication, used by the `RealTimeCollaborativeEditing` plugin. Every customer (organization in the CKEditor
     * Ecosystem dashboard) has their own, unique URLs to communicate with CKEditor Cloud Services. The URL can be found in the
     * CKEditor Ecosystem customer dashboard.
     *
     * Note: Unlike most plugins, `RealTimeCollaborativeEditing` is not included in any CKEditor 5 build and needs to be installed manually.
     * Check [Collaboration overview](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/overview.html) for more details.
     */
    webSocketUrl;
    /**
     * An optional parameter used for integration with CKEditor Cloud Services when uploading the editor build to cloud services.
     *
     * Whenever the editor build or the configuration changes, this parameter should be set to a new, unique value to differentiate
     * the new bundle (build + configuration) from the old ones.
     */
    bundleVersion;
    /**
     * Specifies whether the token should be automatically refreshed when it expires.
     */
    autoRefresh = true;
    /**
     * Other plugins use this token for the authorization process. It handles token requesting and refreshing.
     * Its value is `null` when {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} is not provided.
     *
     * @readonly
     */
    token = null;
    /**
     * A map of token object instances keyed by the token URLs.
     */
    _tokens = new Map();
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CloudServices';
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
    static get requires() {
        return [CloudServicesCore];
    }
    /**
     * @inheritDoc
     */
    async init() {
        const config = this.context.config;
        const options = config.get('cloudServices') || {};
        for (const [key, value] of Object.entries(options)) {
            this[key] = value;
        }
        if (!this.tokenUrl) {
            this.token = null;
            return;
        }
        // Initialization of the token may fail. By default, the token is being refreshed on the failure.
        // The problem is that if this happens here, then the token refresh interval will be executed even
        // after destroying the editor (as the exception was thrown from `init` method). To prevent that
        // behavior we need to catch the exception and destroy the uninitialized token instance.
        // See: https://github.com/ckeditor/ckeditor5/issues/17531
        const cloudServicesCore = this.context.plugins.get('CloudServicesCore');
        const uninitializedToken = cloudServicesCore.createToken(this.tokenUrl, { autoRefresh: this.autoRefresh });
        try {
            this.token = await uninitializedToken.init();
            this._tokens.set(this.tokenUrl, this.token);
        }
        catch (error) {
            uninitializedToken.destroy();
            throw error;
        }
    }
    /**
     * Registers an additional authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
     * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} for more details.
     *
     * @param tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
     */
    async registerTokenUrl(tokenUrl) {
        // Reuse the token instance in case of multiple features using the same token URL.
        if (this._tokens.has(tokenUrl)) {
            return this.getTokenFor(tokenUrl);
        }
        const cloudServicesCore = this.context.plugins.get('CloudServicesCore');
        const token = await cloudServicesCore.createToken(tokenUrl, { autoRefresh: this.autoRefresh }).init();
        this._tokens.set(tokenUrl, token);
        return token;
    }
    /**
     * Returns an authentication token provider previously registered by {@link #registerTokenUrl}.
     *
     * @param tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
     */
    getTokenFor(tokenUrl) {
        const token = this._tokens.get(tokenUrl);
        if (!token) {
            /**
             * The provided `tokenUrl` was not registered by {@link module:cloud-services/cloudservices~CloudServices#registerTokenUrl}.
             *
             * @error cloudservices-token-not-registered
             */
            throw new CKEditorError('cloudservices-token-not-registered', this);
        }
        return token;
    }
    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        for (const token of this._tokens.values()) {
            token.destroy();
        }
    }
}

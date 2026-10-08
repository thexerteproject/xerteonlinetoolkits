/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module cloud-services/cloudservices
 */
import { ContextPlugin } from 'ckeditor5/src/core.js';
import { CloudServicesCore } from './cloudservicescore.js';
import type { CloudServicesConfig, TokenUrl } from './cloudservicesconfig.js';
import type { InitializedToken } from './token/token.js';
/**
 * Plugin introducing the integration between CKEditor 5 and CKEditor Cloud Services .
 *
 * It initializes the token provider based on
 * the {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig `config.cloudService`}.
 */
export declare class CloudServices extends ContextPlugin implements CloudServicesConfig {
    /**
     * The authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
     * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} for more details.
     */
    readonly tokenUrl?: TokenUrl;
    /**
     * The URL to which the files should be uploaded.
     */
    readonly uploadUrl?: string;
    /**
     * The URL for web socket communication, used by the `RealTimeCollaborativeEditing` plugin. Every customer (organization in the CKEditor
     * Ecosystem dashboard) has their own, unique URLs to communicate with CKEditor Cloud Services. The URL can be found in the
     * CKEditor Ecosystem customer dashboard.
     *
     * Note: Unlike most plugins, `RealTimeCollaborativeEditing` is not included in any CKEditor 5 build and needs to be installed manually.
     * Check [Collaboration overview](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/overview.html) for more details.
     */
    readonly webSocketUrl?: string;
    /**
     * An optional parameter used for integration with CKEditor Cloud Services when uploading the editor build to cloud services.
     *
     * Whenever the editor build or the configuration changes, this parameter should be set to a new, unique value to differentiate
     * the new bundle (build + configuration) from the old ones.
     */
    readonly bundleVersion?: string;
    /**
     * Specifies whether the token should be automatically refreshed when it expires.
     */
    readonly autoRefresh: boolean;
    /**
     * Other plugins use this token for the authorization process. It handles token requesting and refreshing.
     * Its value is `null` when {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} is not provided.
     *
     * @readonly
     */
    token: InitializedToken | null;
    /**
     * A map of token object instances keyed by the token URLs.
     */
    private readonly _tokens;
    /**
     * @inheritDoc
     */
    static get pluginName(): "CloudServices";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof CloudServicesCore];
    /**
     * @inheritDoc
     */
    init(): Promise<void>;
    /**
     * Registers an additional authentication token URL for CKEditor Cloud Services or a callback to the token value promise. See the
     * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl} for more details.
     *
     * @param tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
     */
    registerTokenUrl(tokenUrl: TokenUrl): Promise<InitializedToken>;
    /**
     * Returns an authentication token provider previously registered by {@link #registerTokenUrl}.
     *
     * @param tokenUrl The authentication token URL for CKEditor Cloud Services or a callback to the token value promise.
     */
    getTokenFor(tokenUrl: TokenUrl): InitializedToken;
    /**
     * @inheritDoc
     */
    destroy(): void;
}

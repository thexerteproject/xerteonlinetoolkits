/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { type Editor } from '../editor.js';
/**
 * This part of the code is not executed in open-source implementations using a GPL key.
 * It only runs when a specific license key is provided. If you are uncertain whether
 * this applies to your installation, please contact our support team.
 *
 * @internal
 */
export declare function getEditorUsageData(editor: Editor): EditorUsageData;
declare global {
    interface Window {
        CKEDITOR_PAGE_SESSION_ID?: string;
    }
}
/**
 * @internal
 */
export type EditorUsageData = {
    sessionId: string;
    pageSessionId: string;
    hostname: string;
    version: string;
    type: `${string}Editor`;
    plugins: Array<PluginUsageData>;
    toolbar: {
        main?: ToolbarUsageData;
        block?: ToolbarUsageData;
        balloon?: ToolbarUsageData;
    };
    menuBar: {
        isVisible: boolean;
    };
    language: {
        ui: string;
        content: string;
    };
    distribution: {
        channel: string;
    };
    env: EnvUsageData;
    integration: {
        [integrationName: string]: IntegrationUsageData;
    };
};
type IntegrationUsageData = {
    version: string;
    frameworkVersion?: string;
};
type EnvUsageData = {
    os: 'mac' | 'windows' | 'ios' | 'android' | 'unknown';
    browser: 'safari' | 'gecko' | 'blink' | 'unknown';
};
type ToolbarUsageData = {
    items: Array<string>;
    isMultiline: boolean;
    shouldNotGroupWhenFull: boolean;
};
type PluginUsageData = {
    name: string;
    isPremium: boolean;
    isOfficial: boolean;
    isContext: boolean;
};
export {};

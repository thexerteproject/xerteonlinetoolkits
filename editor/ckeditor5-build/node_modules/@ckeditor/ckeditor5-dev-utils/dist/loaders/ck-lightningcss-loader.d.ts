/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import { Buffer } from 'node:buffer';
type LightningCssOptions = {
    minify?: boolean;
    sourceMap?: boolean;
    include?: number;
};
interface MinimalLoaderContext {
    resourcePath: string;
    query?: {
        lightningCssOptions?: LightningCssOptions;
    };
    getOptions?: () => {
        lightningCssOptions?: LightningCssOptions;
    };
    callback(err: Error | null, content?: string | Buffer, sourceMap?: unknown): void;
}
/**
 * Transforms editor styles using Lightning CSS.
 */
export default function ckLightningCssLoader(this: MinimalLoaderContext, source: string, map: unknown): void;
export {};

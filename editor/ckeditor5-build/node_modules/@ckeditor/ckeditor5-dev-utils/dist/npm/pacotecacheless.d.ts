/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import pacote from 'pacote';
export declare const manifest: (spec: string, opts?: pacote.Options | undefined) => Promise<pacote.AbbreviatedManifest & pacote.ManifestResult>;
export declare const packument: (spec: string, opts?: pacote.Options | undefined) => Promise<{
    versions: Record<string, pacote.AbbreviatedManifest>;
} & Pick<pacote.Packument, "name" | "dist-tags"> & pacote.PackumentResult>;

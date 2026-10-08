/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import { type Transform } from 'node:stream';
export default function noop(callback?: ((chunk: unknown) => unknown | Promise<unknown>)): Transform;

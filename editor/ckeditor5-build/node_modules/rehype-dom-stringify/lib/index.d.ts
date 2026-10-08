/**
 * Add support for serializing as HTML with DOM APIs.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function stringify(options?: Readonly<Options> | null | undefined): undefined;
export default class stringify {
    /**
     * Add support for serializing as HTML with DOM APIs.
     *
     * @param {Readonly<Options> | null | undefined} [options]
     *   Configuration (optional).
     * @returns {undefined}
     *   Nothing.
     */
    constructor(options?: Readonly<Options> | null | undefined);
    compiler: (tree: Root, file: import("vfile").VFile) => string;
}
import type { Options } from 'rehype-dom-stringify';
import type { Root } from 'hast';
//# sourceMappingURL=index.d.ts.map
import type {Root} from 'hast'
import type {Plugin} from 'unified'

/**
 * Configuration.
 */
// Note: has to be an interface so that `Settings extends` can accept multiple.
export interface Options {
  /**
   * Specify whether to parse a fragment (default: `true`).
   */
  fragment?: boolean | null | undefined
}

/**
 * Add support for parsing from HTML with DOM APIs.
 *
 * @this
 *   Unified processor.
 * @param
 *   Configuration (optional).
 * @returns
 *   Nothing.
 */
declare const rehypeDomParse: Plugin<
  [(Readonly<Options> | null | undefined)?],
  string,
  Root
>

export default rehypeDomParse

// Add custom settings supported when `rehype-dom-parse` is added.
declare module 'unified' {
  interface Settings extends Options {}
}

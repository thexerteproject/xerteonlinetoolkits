import type {Root} from 'hast'
import type {Plugin} from 'unified'

/**
 * Configuration.
 */
// Note: has to be an interface so that `Settings extends` can accept multiple.
export interface Options {
  /**
   * Specify whether to serialize a fragment (default: `true`).
   */
  fragment?: boolean | null | undefined
  /**
   * Namespace to start with (optional).
   */
  namespace?: string | null | undefined
}

/**
 * Add support for serializing as HTML with DOM APIs.
 *
 * @this
 *   Unified processor.
 * @param
 *   Configuration (optional).
 * @returns
 *   Nothing.
 */
declare const rehypeDomStringify: Plugin<
  [(Readonly<Options> | null | undefined)?],
  Root,
  string
>
export default rehypeDomStringify

// Add custom settings supported when `rehype-dom-stringify` is added.
declare module 'unified' {
  interface Settings extends Options {}
}

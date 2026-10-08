/**
 * @import {Root} from 'hast'
 * @import {Options} from 'rehype-dom-parse'
 * @import {Processor} from 'unified'
 */

import {fromDom} from 'hast-util-from-dom'

/**
 * Add support for parsing from HTML with DOM APIs.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function parse(options) {
  /** @type {Processor<Root>} */
  // @ts-expect-error: TS in JSDoc generates wrong types if `this` is typed regularly.
  const self = this
  const settings = {...self.data('settings'), ...options}

  self.parser = parser

  /**
   * @param {string} value
   *   Value to parse.
   * @returns {Root}
   *   Tree.
   */
  function parser(value) {
    const create = settings.fragment === false ? parseDocument : parseFragment
    // Assume document/fragment in -> root out.
    return /** @type {Root} */ (fromDom(create(value)))
  }
}

/**
 * Create a document.
 *
 * @param {string} value
 *   Value to parse.
 * @returns {Document}
 *   Document.
 */
function parseDocument(value) {
  return new DOMParser().parseFromString(value, 'text/html')
}

/**
 * Parse as a fragment.
 *
 * @param {string} value
 *   Value to parse.
 * @returns {DocumentFragment}
 *   Document fragment.
 */
function parseFragment(value) {
  const template = document.createElement('template')
  template.innerHTML = value
  return template.content
}

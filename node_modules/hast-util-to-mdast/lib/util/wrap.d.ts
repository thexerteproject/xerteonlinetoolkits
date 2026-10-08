/**
 * Check if there are phrasing mdast nodes.
 *
 * This is needed if a fragment is given, which could just be a sentence, and
 * doesn’t need a wrapper paragraph.
 *
 * @param {Array<Nodes>} nodes
 * @returns {boolean}
 */
export function wrapNeeded(nodes: Array<Nodes>): boolean;
/**
 * Wrap runs of phrasing content into paragraphs, leaving the non-phrasing
 * content as-is.
 *
 * @param {Array<RootContent>} nodes
 *   Content.
 * @returns {Array<BlockContent>}
 *   Content where phrasing is wrapped in paragraphs.
 */
export function wrap(nodes: Array<RootContent>): Array<BlockContent>;
import type { Nodes } from 'mdast';
import type { RootContent } from 'mdast';
import type { BlockContent } from 'mdast';
//# sourceMappingURL=wrap.d.ts.map
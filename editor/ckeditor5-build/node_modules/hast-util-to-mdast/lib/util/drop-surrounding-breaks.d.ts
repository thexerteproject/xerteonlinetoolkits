/**
 * @import {Nodes} from 'mdast'
 */
/**
 * Drop trailing initial and final `br`s.
 *
 * @template {Nodes} Node
 *   Node type.
 * @param {Array<Node>} nodes
 *   List of nodes.
 * @returns {Array<Node>}
 *   List of nodes w/o `break`s.
 */
export function dropSurroundingBreaks<Node extends Nodes>(nodes: Array<Node>): Array<Node>;
import type { Nodes } from 'mdast';
//# sourceMappingURL=drop-surrounding-breaks.d.ts.map
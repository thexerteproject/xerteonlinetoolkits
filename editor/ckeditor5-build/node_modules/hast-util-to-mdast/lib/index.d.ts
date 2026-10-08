/**
 * Transform hast to mdast.
 *
 * @param {Readonly<Nodes>} tree
 *   hast tree to transform.
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {MdastNodes}
 *   mdast tree.
 */
export function toMdast(tree: Readonly<Nodes>, options?: Readonly<Options> | null | undefined): MdastNodes;
import type { Nodes } from 'hast';
import type { Options } from 'hast-util-to-mdast';
import type { Nodes as MdastNodes } from 'mdast';
//# sourceMappingURL=index.d.ts.map
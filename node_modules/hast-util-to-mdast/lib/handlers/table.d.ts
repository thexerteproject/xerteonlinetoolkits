/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {Table | Text}
 *   mdast node.
 */
export function table(state: State, node: Readonly<Element>): Table | Text;
/**
 * Inferred info on a table.
 */
export type Info = {
    /**
     *   Alignment.
     */
    align: Array<AlignType>;
    /**
     *   Whether a `thead` is missing.
     */
    headless: boolean;
};
import type { State } from 'hast-util-to-mdast';
import type { Element } from 'hast';
import type { Table } from 'mdast';
import type { Text } from 'mdast';
import type { AlignType } from 'mdast';
//# sourceMappingURL=table.d.ts.map
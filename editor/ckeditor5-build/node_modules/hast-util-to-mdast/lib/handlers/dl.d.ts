/**
 * @param {State} state
 *   State.
 * @param {Readonly<Element>} node
 *   hast element to transform.
 * @returns {List | undefined}
 *   mdast node.
 */
export function dl(state: State, node: Readonly<Element>): List | undefined;
/**
 * Title/definition group.
 */
export type Group = {
    /**
     *   One or more titles.
     */
    titles: Array<Element>;
    /**
     *   One or more definitions.
     */
    definitions: Array<ElementContent>;
};
import type { State } from 'hast-util-to-mdast';
import type { Element } from 'hast';
import type { List } from 'mdast';
import type { ElementContent } from 'hast';
//# sourceMappingURL=dl.d.ts.map
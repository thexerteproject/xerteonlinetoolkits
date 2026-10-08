/**
 * Create a state.
 *
 * @param {Readonly<Options>} options
 *   User configuration.
 * @returns {State}
 *   State.
 */
export function createState(options: Readonly<Options>): State;
export type MdastFlowContent = MdastBlockContent | MdastDefinitionContent;
/**
 * Transform the children of a hast parent to mdast.
 */
export type All = (parent: Parents) => Array<MdastRootContent>;
/**
 * Handle a particular element.
 */
export type Handle = (state: State, element: Element, parent: Parents | undefined) => Array<MdastNodes> | MdastNodes | undefined | void;
/**
 * Handle a particular node.
 */
export type NodeHandle = (state: State, node: any, parent: Parents | undefined) => Array<MdastNodes> | MdastNodes | undefined | void;
/**
 * Transform a hast node to mdast.
 */
export type One = (node: Nodes, parent: Parents | undefined) => Array<MdastNodes> | MdastNodes | undefined;
/**
 * Configuration.
 */
export type Options = {
    /**
     * Value to use for a checked checkbox or radio input (default: `'[x]'`)
     */
    checked?: string | null | undefined;
    /**
     * Whether the given tree represents a complete document (optional).
     *
     * Applies when the `tree` is a `root` node.
     * When the tree represents a complete document, then things are wrapped in
     * paragraphs when needed, and otherwise they’re left as-is.
     * The default checks for whether there’s mixed content: some phrasing nodes
     * *and* some non-phrasing nodes.
     */
    document?: boolean | null | undefined;
    /**
     * Object mapping tag names to functions handling the corresponding elements
     * (optional).
     *
     * Merged into the defaults.
     */
    handlers?: Record<string, Handle | null | undefined> | null | undefined;
    /**
     * Keep line endings when collapsing whitespace (default: `false`).
     *
     * The default collapses to a single space.
     */
    newlines?: boolean | null | undefined;
    /**
     * Object mapping node types to functions handling the corresponding nodes
     * (optional).
     *
     * Merged into the defaults.
     */
    nodeHandlers?: Record<string, NodeHandle | null | undefined> | null | undefined;
    /**
     * List of quotes to use (default: `['"']`).
     *
     * Each value can be one or two characters.
     * When two, the first character determines the opening quote and the second
     * the closing quote at that level.
     * When one, both the opening and closing quote are that character.
     *
     * The order in which the preferred quotes appear determines which quotes to
     * use at which level of nesting.
     * So, to prefer `‘’` at the first level of nesting, and `“”` at the second,
     * pass `['‘’', '“”']`.
     * If `<q>`s are nested deeper than the given amount of quotes, the markers
     * wrap around: a third level of nesting when using `['«»', '‹›']` should
     * have double guillemets, a fourth single, a fifth double again, etc.
     */
    quotes?: Array<string> | null | undefined;
    /**
     * Value to use for an unchecked checkbox or radio input (default: `'[ ]'`).
     */
    unchecked?: string | null | undefined;
};
/**
 * Copy a node’s positional info.
 */
export type Patch = (from: Nodes, to: MdastNodes) => undefined;
/**
 * Resolve a URL relative to a base.
 */
export type Resolve = (url: string | null | undefined) => string;
/**
 * Info passed around about the current state.
 */
export type State = {
    /**
     *   Transform the children of a hast parent to mdast.
     */
    all: All;
    /**
     *   Whether a `<base>` element was seen.
     */
    baseFound: boolean;
    /**
     *   Elements by their `id`.
     */
    elementById: Map<string, Element>;
    /**
     *   `href` of `<base>`, if any.
     */
    frozenBaseUrl: string | undefined;
    /**
     *   Applied element handlers.
     */
    handlers: Record<string, Handle>;
    /**
     *   Whether we’re in a table.
     */
    inTable: boolean;
    /**
     *   Applied node handlers.
     */
    nodeHandlers: Record<string, NodeHandle>;
    /**
     *   Transform a hast node to mdast.
     */
    one: One;
    /**
     *   User configuration.
     */
    options: Options;
    /**
     *   Copy a node’s positional info.
     */
    patch: Patch;
    /**
     *   Non-negative finite integer representing how deep we’re in `<q>`s.
     */
    qNesting: number;
    /**
     *   Resolve a URL relative to a base.
     */
    resolve: Resolve;
    /**
     *   Transform a list of mdast nodes to flow.
     */
    toFlow: ToFlow;
    /**
     *   Turn arbitrary content into a list of a particular node type.
     *
     *   This is useful for example for lists, which must have list items as
     *   content.
     *   in this example, when non-items are found, they will be queued, and
     *   inserted into an adjacent item.
     *   When no actual items exist, one will be made with `build`.
     */
    toSpecificContent: <ChildType extends MdastNodes, ParentType extends MdastParents & {
        "children": Array<ChildType>;
    }>(nodes: Array<MdastRootContent>, build: (() => ParentType)) => Array<ParentType>;
};
/**
 * Transform a list of mdast nodes to flow.
 */
export type ToFlow = (nodes: Array<MdastRootContent>) => Array<MdastFlowContent>;
import type { BlockContent as MdastBlockContent } from 'mdast';
import type { DefinitionContent as MdastDefinitionContent } from 'mdast';
import type { Parents } from 'hast';
import type { RootContent as MdastRootContent } from 'mdast';
import type { Element } from 'hast';
import type { Nodes as MdastNodes } from 'mdast';
import type { Nodes } from 'hast';
import type { Parents as MdastParents } from 'mdast';
//# sourceMappingURL=state.d.ts.map
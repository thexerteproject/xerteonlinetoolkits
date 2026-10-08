export namespace nodeHandlers {
    export { comment };
    export { ignore as doctype };
    export { root };
    export { text };
}
export namespace handlers {
    export { ignore as applet };
    export { ignore as area };
    export { ignore as basefont };
    export { ignore as bgsound };
    export { ignore as caption };
    export { ignore as col };
    export { ignore as colgroup };
    export { ignore as command };
    export { ignore as content };
    export { ignore as datalist };
    export { ignore as dialog };
    export { ignore as element };
    export { ignore as embed };
    export { ignore as frame };
    export { ignore as frameset };
    export { ignore as isindex };
    export { ignore as keygen };
    export { ignore as link };
    export { ignore as math };
    export { ignore as menu };
    export { ignore as menuitem };
    export { ignore as meta };
    export { ignore as nextid };
    export { ignore as noembed };
    export { ignore as noframes };
    export { ignore as optgroup };
    export { ignore as option };
    export { ignore as param };
    export { ignore as script };
    export { ignore as shadow };
    export { ignore as source };
    export { ignore as spacer };
    export { ignore as style };
    export { ignore as svg };
    export { ignore as template };
    export { ignore as title };
    export { ignore as track };
    export { all as abbr };
    export { all as acronym };
    export { all as bdi };
    export { all as bdo };
    export { all as big };
    export { all as blink };
    export { all as button };
    export { all as canvas };
    export { all as cite };
    export { all as data };
    export { all as details };
    export { all as dfn };
    export { all as font };
    export { all as ins };
    export { all as label };
    export { all as map };
    export { all as marquee };
    export { all as meter };
    export { all as nobr };
    export { all as noscript };
    export { all as object };
    export { all as output };
    export { all as progress };
    export { all as rb };
    export { all as rbc };
    export { all as rp };
    export { all as rt };
    export { all as rtc };
    export { all as ruby };
    export { all as slot };
    export { all as small };
    export { all as span };
    export { all as sup };
    export { all as sub };
    export { all as tbody };
    export { all as tfoot };
    export { all as thead };
    export { all as time };
    export { flow as address };
    export { flow as article };
    export { flow as aside };
    export { flow as body };
    export { flow as center };
    export { flow as div };
    export { flow as fieldset };
    export { flow as figcaption };
    export { flow as figure };
    export { flow as form };
    export { flow as footer };
    export { flow as header };
    export { flow as hgroup };
    export { flow as html };
    export { flow as legend };
    export { flow as main };
    export { flow as multicol };
    export { flow as nav };
    export { flow as picture };
    export { flow as section };
    export { a };
    export { media as audio };
    export { strong as b };
    export { base };
    export { blockquote };
    export { br };
    export { inlineCode as code };
    export { list as dir };
    export { dl };
    export { li as dt };
    export { li as dd };
    export { del };
    export { em };
    export { heading as h1 };
    export { heading as h2 };
    export { heading as h3 };
    export { heading as h4 };
    export { heading as h5 };
    export { heading as h6 };
    export { hr };
    export { em as i };
    export { iframe };
    export { img };
    export { img as image };
    export { input };
    export { inlineCode as kbd };
    export { li };
    export { code as listing };
    export { em as mark };
    export { list as ol };
    export { p };
    export { code as plaintext };
    export { code as pre };
    export { q };
    export { del as s };
    export { inlineCode as samp };
    export { select };
    export { del as strike };
    export { strong };
    export { p as summary };
    export { table };
    export { tableCell as td };
    export { textarea };
    export { tableCell as th };
    export { tableRow as tr };
    export { inlineCode as tt };
    export { em as u };
    export { list as ul };
    export { inlineCode as var };
    export { media as video };
    export { wbr };
    export { code as xmp };
}
import { comment } from './comment.js';
/**
 * @returns {undefined}
 */
declare function ignore(): undefined;
import { root } from './root.js';
import { text } from './text.js';
/**
 * @param {State} state
 *   State.
 * @param {Parents} node
 *   Parent to transform.
 */
declare function all(state: State, node: Parents): import("mdast").RootContent[];
/**
 * @param {State} state
 *   State.
 * @param {Parents} node
 *   Parent to transform.
 */
declare function flow(state: State, node: Parents): import("../state.js").MdastFlowContent[];
import { a } from './a.js';
import { media } from './media.js';
import { strong } from './strong.js';
import { base } from './base.js';
import { blockquote } from './blockquote.js';
import { br } from './br.js';
import { inlineCode } from './inline-code.js';
import { list } from './list.js';
import { dl } from './dl.js';
import { li } from './li.js';
import { del } from './del.js';
import { em } from './em.js';
import { heading } from './heading.js';
import { hr } from './hr.js';
import { iframe } from './iframe.js';
import { img } from './img.js';
import { input } from './input.js';
import { code } from './code.js';
import { p } from './p.js';
import { q } from './q.js';
import { select } from './select.js';
import { table } from './table.js';
import { tableCell } from './table-cell.js';
import { textarea } from './textarea.js';
import { tableRow } from './table-row.js';
import { wbr } from './wbr.js';
import type { State } from 'hast-util-to-mdast';
import type { Parents } from 'hast';
export {};
//# sourceMappingURL=index.d.ts.map
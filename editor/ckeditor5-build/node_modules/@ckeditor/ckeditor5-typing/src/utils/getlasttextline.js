/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * Returns the last text line from the given range.
 *
 * "The last text line" is understood as text (from one or more text nodes) which is limited either by a parent block
 * or by inline elements (e.g. `<softBreak>`).
 *
 * ```ts
 * const rangeToCheck = model.createRange(
 * 	model.createPositionAt( paragraph, 0 ),
 * 	model.createPositionAt( paragraph, 'end' )
 * );
 *
 * const { text, range } = getLastTextLine( rangeToCheck, model );
 * ```
 *
 * For model below, the returned `text` will be "Foo bar baz" and `range` will be set on whole `<paragraph>` content:
 *
 * ```xml
 * <paragraph>Foo bar baz<paragraph>
 * ```
 *
 * However, in below case, `text` will be set to "baz" and `range` will be set only on "baz".
 *
 * ```xml
 * <paragraph>Foo<softBreak></softBreak>bar<softBreak></softBreak>baz<paragraph>
 * ```
 */
export function getLastTextLine(range, model) {
    let start = range.start;
    const text = Array.from(range.getWalker({ ignoreElementEnd: false })).reduce((rangeText, { item }) => {
        // Trim text to a last occurrence of an inline element and update range start.
        if (!(item.is('$text') || item.is('$textProxy'))) {
            start = model.createPositionAfter(item);
            return '';
        }
        return rangeText + item.data;
    }, '');
    return { text, range: model.createRange(start, range.end) };
}

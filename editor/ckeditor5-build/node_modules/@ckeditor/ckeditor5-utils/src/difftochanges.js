/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module utils/difftochanges
 */
/**
 * Creates a set of changes which need to be applied to the input in order to transform
 * it into the output. This function can be used with strings or arrays.
 *
 * ```ts
 * const input = Array.from( 'abc' );
 * const output = Array.from( 'xaby' );
 * const changes = diffToChanges( diff( input, output ), output );
 *
 * changes.forEach( change => {
 * 	if ( change.type == 'insert' ) {
 * 		input.splice( change.index, 0, ...change.values );
 * 	} else if ( change.type == 'delete' ) {
 * 		input.splice( change.index, change.howMany );
 * 	}
 * } );
 *
 * input.join( '' ) == output.join( '' ); // -> true
 * ```
 *
 * @typeParam T The type of output array element.
 * @param diff Result of {@link module:utils/diff~diff}.
 * @param output The string or array which was passed as diff's output.
 * @returns Set of changes (insert or delete) which need to be applied to the input
 * in order to transform it into the output.
 */
export function diffToChanges(diff, output) {
    const changes = [];
    let index = 0;
    let lastOperation = null;
    diff.forEach(change => {
        if (change == 'equal') {
            pushLast();
            index++;
        }
        else if (change == 'insert') {
            if (lastOperation && lastOperation.type == 'insert') {
                lastOperation.values.push(output[index]);
            }
            else {
                pushLast();
                lastOperation = {
                    type: 'insert',
                    index,
                    values: [output[index]]
                };
            }
            index++;
        }
        else /* if ( change == 'delete' ) */ {
            if (lastOperation && lastOperation.type == 'delete') {
                lastOperation.howMany++;
            }
            else {
                pushLast();
                lastOperation = {
                    type: 'delete',
                    index,
                    howMany: 1
                };
            }
        }
    });
    pushLast();
    return changes;
    function pushLast() {
        if (lastOperation) {
            changes.push(lastOperation);
            lastOperation = null;
        }
    }
}

/**
 * This method is like `_.pullAll` except that it accepts `comparator` which is
 * invoked to compare elements of array to values. The comparator is invoked with
 * two arguments: (arrVal, othVal).
 *
 * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
 *
 * @template T
 * @param {T[]} array - The array to modify.
 * @param {ArrayLike<T>} [values] - The values to remove.
 * @param {(a: T, b: T) => boolean} [comparator] - The comparator invoked per element.
 * @returns {T[]} Returns `array`.
 *
 * @example
 * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
 *
 * pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
 * console.log(array);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
 */
declare function pullAllWith<T>(array: T[], values?: ArrayLike<T>, comparator?: (a: T, b: T) => boolean): T[];
/**
 * This method is like `_.pullAll` except that it accepts `comparator` which is
 * invoked to compare elements of array to values. The comparator is invoked with
 * two arguments: (arrVal, othVal).
 *
 * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
 *
 * @template L
 * @param {L} array - The array to modify.
 * @param {ArrayLike<L[0]>} [values] - The values to remove.
 * @param {(a: L[0], b: L[0]) => boolean} [comparator] - The comparator invoked per element.
 * @returns {L} Returns `array`.
 *
 * @example
 * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
 *
 * pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
 * console.log(array);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
 */
declare function pullAllWith<L extends ArrayLike<any>>(array: L extends readonly any[] ? never : L, values?: ArrayLike<L[0]>, comparator?: (a: L[0], b: L[0]) => boolean): L;
/**
 * This method is like `_.pullAll` except that it accepts `comparator` which is
 * invoked to compare elements of array to values. The comparator is invoked with
 * two arguments: (arrVal, othVal).
 *
 * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
 *
 * @template T, U
 * @param {T[]} array - The array to modify.
 * @param {ArrayLike<U>} values - The values to remove.
 * @param {(a: T, b: U) => boolean} comparator - The comparator invoked per element.
 * @returns {T[]} Returns `array`.
 *
 * @example
 * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
 *
 * pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
 * console.log(array);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
 */
declare function pullAllWith<T, U>(array: T[], values: ArrayLike<U>, comparator: (a: T, b: U) => boolean): T[];
/**
 * This method is like `_.pullAll` except that it accepts `comparator` which is
 * invoked to compare elements of array to values. The comparator is invoked with
 * two arguments: (arrVal, othVal).
 *
 * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
 *
 * @template L, U
 * @param {L} array - The array to modify.
 * @param {ArrayLike<U>} values - The values to remove.
 * @param {(a: L[0], b: U) => boolean} comparator - The comparator invoked per element.
 * @returns {L} Returns `array`.
 *
 * @example
 * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
 *
 * pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
 * console.log(array);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
 */
declare function pullAllWith<L extends ArrayLike<any>, U>(array: L extends readonly any[] ? never : L, values: ArrayLike<U>, comparator: (a: L[0], b: U) => boolean): L;

export { pullAllWith };

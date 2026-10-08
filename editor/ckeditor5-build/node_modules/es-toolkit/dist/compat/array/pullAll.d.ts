/**
 * This method is like `_.pull` except that it accepts an array of values to remove.
 *
 * **Note:** Unlike `_.difference`, this method mutates `array`.
 *
 * @template T
 * @param {T[]} array - The array to modify.
 * @param {ArrayLike<T>} [values] - The values to remove.
 * @returns {T[]} Returns `array`.
 *
 * @example
 * var array = [1, 2, 3, 1, 2, 3];
 *
 * pullAll(array, [2, 3]);
 * console.log(array);
 * // => [1, 1]
 */
declare function pullAll<T>(array: T[], values?: ArrayLike<T>): T[];
/**
 * This method is like `_.pull` except that it accepts an array of values to remove.
 *
 * **Note:** Unlike `_.difference`, this method mutates `array`.
 *
 * @template L
 * @param {L} array - The array to modify.
 * @param {ArrayLike<L[0]>} [values] - The values to remove.
 * @returns {L} Returns `array`.
 *
 * @example
 * var array = [1, 2, 3, 1, 2, 3];
 *
 * pullAll(array, [2, 3]);
 * console.log(array);
 * // => [1, 1]
 */
declare function pullAll<L extends ArrayLike<any>>(array: L extends readonly any[] ? never : L, values?: ArrayLike<L[0]>): L;

export { pullAll };

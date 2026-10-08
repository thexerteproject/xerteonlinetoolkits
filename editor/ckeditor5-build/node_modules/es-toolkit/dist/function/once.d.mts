/**
 * Creates a function that is restricted to invoking func once. Repeat calls to the function return the value of the first invocation.
 *
 * @template T - The type of the function.
 * @param {T} func - The function to restrict.
 * @returns {T} Returns the new restricted function.
 *
 * @example
 * var initialize = once(createApplication);
 * initialize();
 * initialize();
 * // => `createApplication` is invoked once
 */
declare function once<T extends (...args: any) => any>(func: T): T;

export { once };

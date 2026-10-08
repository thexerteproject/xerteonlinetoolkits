'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const unzip = require('../../array/unzip.js');
const isArray = require('../predicate/isArray.js');
const isArrayLikeObject = require('../predicate/isArrayLikeObject.js');

function unzipWith(array, iteratee) {
    if (!isArrayLikeObject.isArrayLikeObject(array) || !array.length) {
        return [];
    }
    const unziped = isArray.isArray(array) ? unzip.unzip(array) : unzip.unzip(Array.from(array, value => Array.from(value)));
    if (!iteratee) {
        return unziped;
    }
    const result = new Array(unziped.length);
    for (let i = 0; i < unziped.length; i++) {
        const value = unziped[i];
        result[i] = iteratee(...value);
    }
    return result;
}

exports.unzipWith = unzipWith;

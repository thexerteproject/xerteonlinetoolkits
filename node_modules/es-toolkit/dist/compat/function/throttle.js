'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const debounce = require('./debounce.js');

function throttle(func, throttleMs = 0, options = {}) {
    if (typeof options !== 'object') {
        options = {};
    }
    const { leading = true, trailing = true } = options;
    return debounce.debounce(func, throttleMs, {
        leading,
        trailing,
        maxWait: throttleMs,
    });
}

exports.throttle = throttle;

import { debounce } from './debounce.mjs';

function throttle(func, throttleMs = 0, options = {}) {
    if (typeof options !== 'object') {
        options = {};
    }
    const { leading = true, trailing = true } = options;
    return debounce(func, throttleMs, {
        leading,
        trailing,
        maxWait: throttleMs,
    });
}

export { throttle };

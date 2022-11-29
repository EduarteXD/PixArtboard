const throttle = (fn: Function, delay: number) => {
    let prev = Date.now();
    let timeout: null | string | number | NodeJS.Timeout = null;
    return (...args: any[]) => {
        let now = Date.now();
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        if (now - prev >= delay) {
            fn(...args);
            prev = now;
        } else {
            timeout = setTimeout(() => {
                fn(...args)
            }, delay);
        }
    }
}

export default throttle;
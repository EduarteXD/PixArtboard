const throttle = (fn: Function) => {
    let lock = false;
    return (...args: any[]) => {
        if (lock) return;
        lock = true;
        window.requestAnimationFrame(() => {
            fn(...args);
            lock = false;
        });
    }
};

export default throttle;
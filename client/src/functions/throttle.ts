const throttle = (fn: Function, latency: number = -1) => {
    if (latency === -1) {
        let lock = false;
        return (...args: any[]) => {
            if (lock) return;
            lock = true;
            window.requestAnimationFrame(() => {
                fn(...args);
                lock = false;
            });
        }
    } else {
        let lock = false;
        return (...args: any[]) => {
            if (lock) return;
            lock = true;
            setTimeout(() => {
                fn(...args);
                lock = false;
            }, latency)
        }
    }
};

export default throttle;
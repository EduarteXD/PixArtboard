import React from "react";

const useThrottle = (fn: Function, deps: any[] = [], latency: number = -1) => {
    const lock = React.useRef(false);
    return React.useCallback((...args: any[]) => {
        if (latency === -1) {
            if (lock.current) return;
            lock.current = true;
            window.requestAnimationFrame(() => {
                fn(...args);
                lock.current = false;
            });
        } else {
            if (lock.current) return;
            lock.current = true;
            setTimeout(() => {
                fn(...args);
                lock.current = false;
            }, latency)
        }
        // eslint-disable-next-line
    }, deps);
};

export default useThrottle;
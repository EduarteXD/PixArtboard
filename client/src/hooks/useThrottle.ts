import React from "react";

const useThrottle = (fn: Function, latency: number = -1) => {
    const lock = React.useRef(false);
    if (latency === -1) {
        return (...args: any[]) => {
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
    }
};

export default useThrottle;
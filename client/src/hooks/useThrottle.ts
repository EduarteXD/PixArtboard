import React from "react";

const useThrottle = (fn: Function, latency: number = -1, deps: any[] = []) => {
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
            }, latency);
        }
    }, deps)
    /*
    if (latency === -1) {
        return (...args: any[]) => {
            if (lock.current) return;
            lock.current = true;
            window.requestAnimationFrame(() => {
                fn(...args);
                lock.current = false;
            });
        }
    } else {
        return (...args: any[]) => {
            if (lock.current) return;
            lock.current = true;
            setTimeout(() => {
                fn(...args);
                lock.current = false;
            }, latency)
        }
    }
    */
};

export default useThrottle;
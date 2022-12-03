import React from "react";

const useDebounce = (fn: Function, latency: number, deps: any[] = []) => {
	const timeout = React.useRef<null | NodeJS.Timeout>(null);
	return React.useCallback((...args: any[]) => {
		if (timeout.current !== null) {
			clearTimeout(timeout.current);
			timeout.current = setTimeout(() => {
				timeout.current = null;
			}, latency);
			return;
		}
		timeout.current = setTimeout(() => {
			timeout.current = null;
		}, latency);
		fn(...args);
		// eslint-disable-next-line
	}, deps);
};

export default useDebounce;

import React from "react";

const useDebounce = (fn: Function, latency: number) => {
	const timeout = React.useRef<null | NodeJS.Timeout>(null);
	return (...args: any[]) => {
		if (timeout.current !== null) {
			clearTimeout(timeout.current);
			timeout.current = setTimeout(() => {
				timeout.current = null;
			}, latency);
			return;
		};
		timeout.current = setTimeout(() => {
			timeout.current = null;
		}, latency);
		fn(...args);
	};
};

export default useDebounce;

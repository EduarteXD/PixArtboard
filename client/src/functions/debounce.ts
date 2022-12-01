const debounce = (fn: Function, latency: number) => {
	let timeout: null | NodeJS.Timeout = null;
	return (...args: any[]) => {
		if (timeout !== null) {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				timeout = null;
			}, latency);
			return;
		};
		timeout = setTimeout(() => {
			timeout = null;
		}, latency);
		fn(...args);
	};
};

export default debounce;

import Promise from 'bluebird';

/**
 * Adds a stub that will call the given method instead of the original one.
 * @param {object} obj
 * @param {string} funcName
 * @param {function} replacementFunc
 * @returns {function}
 */
export function hijack (obj, funcName, replacementFunc) {
	const hyjackedMethod = obj[funcName];
	let hijacker = function () {
		return replacementFunc.apply(obj, arguments);
	};
	hijacker.method = hyjackedMethod;
	hijacker.reset = function () {
		// return to original method
		obj[funcName] = hyjackedMethod;
	};
	// overwrite function
	obj[funcName] = hijacker;
}

/**
 * Resolves a bluebird promise after a set amount of time
 * @param data
 * @param delay
 * @returns {Promise}
 */
export function delayedPromise (data, delay) {
	return new Promise(resolve => {
		setTimeout(resolve.bind(null, data), delay);
	});
}

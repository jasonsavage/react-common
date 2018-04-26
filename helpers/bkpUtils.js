import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'underscore';
import moment from 'moment';
import Promise from 'bluebird';

export function initializeWindow () {
	disableBackspaceHistoryNavigation();
}

function isEditableInput (node) {
	return (
		node.tagName.toUpperCase() === 'TEXTAREA' || (node.tagName.toUpperCase() === 'INPUT' && _.contains(['TEXT', 'PASSWORD', 'FILE', 'SEARCH', 'EMAIL', 'NUMBER', 'DATE'], node.type.toUpperCase()))
	);
}

function disableBackspaceHistoryNavigation () {
	$(document).on('keydown', function (e) {
		if (e.keyCode === 8 && !isEditableInput(e.srcElement || e.target)) {
			e.preventDefault();
		}
	});
}

export function capitalizeFirstLetter (str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function humanizeCamelCase (str) {
	if (!str) {
		return str;
	}

	let match = str.match(/[A-Z][a-z]+/g);
	if (!match) {
		return str;
	}
	return match.join(' ');
}

export function cssifyString (str) {
	if (!str) {
		return '';
	}
	return str.toLowerCase().replace(/\s+/, '-');
}

export function clamp (value, min, max) {
	return Math.max(Math.min(value, max), min);
}

export function clampWrap (value, min, max) {
	return value < min ? max : value > max ? min : value;
}

export function circumference (radius) {
	return Math.PI * (radius * 2);
}

export function secondsToMs (seconds) {
	return seconds * 1000;
}


/**
 * Checks equality of 2 arrays by comparing length and the each object at each index using the id property.
 * @param {Array} arrayA
 * @param {Array} arrayB
 * @returns {boolean}
 */
export function areArraysEqualByObjectId (arrayA, arrayB) {
	if (arrayA.length !== arrayB.length) {
		return false;
	}

	for (let i = 0, len = arrayA.length; i < len; i++) {
		if (!arrayB[i] || arrayA[i].id !== arrayB[i].id) {
			return false;
		}
	}

	return true;
}

/**
 * Add all the values in an array together
 * @param {Array} [array=undefined]
 * @returns {number}
 */
export function arraySum (array) {
	if (array && array.length) {
		return _.reduce(
			array,
			(memo, num) => {
				// verify that num is not undefined, NaN, etc... as that will return an invalid result
				return num ? memo + num : memo;
			},
			0
		);
	}

	return 0;
}


/**
 * Concats 2 arrays together by adding all items in srcArray to the end of dstArray and returns dstArray.
 * NOTE: this method differes from Array.concat in that it does not create a new array.
 * @param {Array} dstArray
 * @param {Array} srcArray
 * @returns {Array}
 */
export function extendArray (dstArray, srcArray) {
	dstArray.push.apply(dstArray, srcArray);
	return dstArray;
}


/**
 * limits [value] and the specified [length] and adds "..." (new length is length + 3)
 * @param {string} value
 * @param {number} length
 */
export function truncate (value, length) {
	length = length || 0;
	value = '' + value; //to string

	return value.length <= length ? value : value.substring(0, length - 3) + '...';
}

/**
 * Fixes some formatting issue to make the supplied string more readable
 * @param {string} value
 * @returns {string}
 */
export function prettyPrint (value) {
	if (value === '-' || value === '_') {
		return value;
	}

	return value
		.replace(/[-_]/g, ' ')
		.trim()
		// match lowercase letter next to uppercase
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		// match uppercase letter next to uppercase and then lowercase letter
		.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
		// match letter next to number
		.replace(/([a-zA-Z])(\d)/g, '$1 $2')
		// match number next to a letter
		.replace(/(\d)([a-zA-Z])/g, '$1 $2');
}

export function prettyCountdown (time, timeToSubtract) {
	let minutes = Math.floor(time / 60);
	let seconds = time % 60;

	if (timeToSubtract && timeToSubtract > 0) {
		seconds = Math.max(seconds - timeToSubtract, 0);
	}

	return `${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;
}

/**
 * Convenience method for adding an inline style for a background image
 * @param {string} path
 * @param {object} [style={}]
 * @returns {object}
 */
export function backgroundImage (path = '', style = {}) {
	style.backgroundImage = `url('${path}')`;
	return style;
}

/**
 * adds [n] zeros to the beginning of a string/number
 * @param {number/string} value
 * @param {number} places
 */
export function zeroPrepend (value, places) {
	places = parseInt(places, 10) || 0;
	value = '' + value; //to string
	while (value.length < places) {
		value = '0' + value;
	}
	return value;
}

/**
 * Splits an array into array chunks based on size
 * @param {Array} array
 * @param {number} size
 * @returns {Array} - multi-dimensional array of chunks
 */
export function arrayChunks (array, size) {
	var res = [];
	for (var i = 0; i < array.length; i += size) {
		res.push(array.slice(i, i + size));
	}
	return res;
}

/**
 * Fills an array with objects until it reaches the specified size
 * @param {Array} array
 * @param {Number} length
 * @param {function} [createMethod=undefined]
 * @returns {Array}
 */
export function arrayFill (array, length, createMethod=()=>{}) {
	if (array && array.length < length) {
		for (var i = array.length; i < length; i++) {
			array.push(createMethod(i));
		}
	}
	return array;
}

export function gridFill (array, minRows, minCols, createMethod=()=>{}) {
	// fill rows up to minRows value
	while (array.length < minRows) {
		array.push([]);
	}
	// loop through each row, and fill columns to minCols value
	return array.map((row, i) => arrayFill(row, minCols, (j) => createMethod(i, j)));
}

/**
 * Returns a duration object from the specified timestamp in seconds
 * @param {number} timestamp
 * @returns {{days: number, hours: number, minutes: number, seconds}}
 */
export function parseDuration (timestamp) {
	let days, hours, minutes, seconds;
	seconds = Math.floor(timestamp / 1000);
	minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;
	hours = Math.floor(minutes / 60);
	minutes = minutes % 60;
	days = Math.floor(hours / 24);
	hours = hours % 24;

	return { days, hours, minutes, seconds };
}

/**
 * Builds a string of days(d) hours{h} minutes{m} seconds(s) from a timestamp
 * @param {number} timestamp
 * @returns {string}
 */
export function formatDuration (timestamp, intl) {
	if (!intl) {
		const store = require('stores/ReduxStore').default;
		intl = store.getState().locale.currentProvider;
	}

	let times = parseDuration(timestamp),
		result = [
			times.days > 0 ? `${times.days}${durationAbbr(intl, 'day', 'd')}` : '',
			times.hours > 0 ? `${times.hours}${durationAbbr(intl, 'hour', 'h')}` : '',
			times.minutes > 0 ? `${times.minutes}${durationAbbr(intl, 'minute', 'm')}` : '',
			times.seconds > 0 ? `${times.seconds}${durationAbbr(intl, 'second', 's')}` : ''
		]
			.join(' ')
			.trim();
	return result !== '' ? result : `0${durationAbbr(intl, 'second', 's')}`;
}

function durationAbbr (intl, key, defaultVal) {
	return intl ? intl.formatMessage({ id: `GenericDuration_${key}`, defaultMessage: defaultVal }) : defaultVal;
}

export function isInt (i) {
	return i % 1 === 0;
}

/**
 * Empty method stub
 * @param {*} [value=undefined]
 * @returns {*}
 */
export function noop (value = undefined) {
	return value;
}

export function isoDateStringToLocal (dateStr) {
	const utc = moment.utc(dateStr || new Date().toISOString());
	return utc ? utc.toDate() : null;
}

export function toFixed (val) {
	val = val || 0;
	return isInt(val) ? val : parseFloat(val.toFixed(2));
}

/**
 * Limit the delay between calls to the specified callback function
 * @param {function} callback
 * @param {number} limit
 * @returns {Function}
 */
export function throttle (callback, limit) {
	let wait = false;
	return () => {
		if (!wait) {
			wait = true;
			callback.call();
			setTimeout(() => {
				wait = false;
			}, limit);
		}
	};
}

export function calculateAverage (total, quantity) {
	if (!quantity) {
		// prevent divide by 0 errors
		quantity = 1;
	}
	let avg = Math.ceil(total / quantity);
	return isNaN(avg) ? 0 : avg;
}

/**
 * Css helper to style inventoryItem tier correctly
 * @param {InventoryItem} item
 * @param {object} [obj={}]
 */
export function getTierClass (item, obj = {}) {
	return _.extend(obj, {
		'tier-1': item && item.tier === 1,
		'tier-2': item && item.tier === 2,
		'tier-3': item && item.tier === 3,
		'tier-4': item && item.tier === 4,
		'tier-5': item && item.tier === 5
	});
}

/**
 * Tiny function that will add a jquery reference to an html element when it's rendered
 * @param {object} context
 * @param {string} name
 * @param {number} [row=-1]
 * @param {number} [col=-1]
 * @returns {function(*=): (jquery|HTMLElement)}
 */
export function r (context, name, row = -1, col = -1) {
	if (row !== -1) {
		//build array
		if (!_.isArray(context[name])) {
			context[name] = [];
		}

		if (col !== -1) {
			//build grid
			gridFill(context[name], row, col);
			return ele => (context[name][row][col] = $wrapElement(ele));
		}

		return ele => (context[name][row] = $wrapElement(ele));
	}

	return ele => (context[name] = $wrapElement(ele));
}

export function $wrapElement (ele) {
	return _.isObject(ele) && ele.context ? $(ReactDOM.findDOMNode(ele)) : $(ele);
}

/**
 * Tool for finding bugs
 * @param className
 */
export function logFunc (className) {
	let stub = () => {};
	stub.warn = noop;
	stub.info = noop;
	stub.off = () => stub;

	// internal only
	if (process.env.REACT_APP_IS_INTERNAL_BUILD !== 'true') {
		return stub;
	}

	const getMessage = (methodName, msg, data) => {
		let result = className + '.' + methodName;
		if(_.isObject(msg)) {
			// treat like the data argument
			result = result + ' ' + JSON.stringify(msg);
		} else {
			result = msg && msg.length ? result + ': ' + msg : result;
		}
		result = data ? result + ' ' + JSON.stringify(data) : result;
		return result;
	};

	let logger = (methodName, msg='', data=null) => {
		console.log( getMessage(methodName, msg, data) );
	};

	// add static methods
	logger.warn = (methodName, msg, data) => { console.warn(getMessage(methodName, msg, data)); };
	logger.info = (methodName, msg, data) => { console.info(getMessage(methodName, msg, data)); };
	logger.off = () => stub;

	return logger;
}


/**
 * Calls the iterator function on each item in the items array. For each item, this method waits for the promise that is
 * ... returned from the iterator to be resolved before stepping to the next item in the array. The item in the
 * ... items array is replaced with the result from the resolved promise.
 * NOTE: this function is missing from our version of bluebird
 * @param items
 * @param iterator
 */
export function promiseMapSeries (items, iterator) {
	return new Promise(resolve => {
		function done (i, queue) {
			if (i < queue.length) {
				iterator(items[i]).then(result => {
					// replace item in the queue array at this index
					queue[i] = result;
					// continue stepping through items in queue
					done(++i, queue);
				}, (error) => {
					// save error
					queue[i] = error;
					// continue
					done(++i, queue);
				});
			} else {
				// all item replaced, resolve queue
				resolve(queue);
			}
		}
		// make a copy
		done(0, items.slice());
	});
}

/**
 * Returns an onClick function that will only trigger {method} if {condition} is true
 * @param {boolean} condition
 * @param {function} method
 * @returns {function}
 */
export function clickIf (condition, method) {
	return () => { if(condition) { method(); } };
}

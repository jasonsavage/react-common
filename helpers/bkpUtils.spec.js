/* globals describe, it */
/* eslint-disable max-nested-callbacks */
import * as bkpUtils from 'helpers/bkpUtils';
import _ from 'underscore';
import $ from 'jquery';
import moment from 'moment';
import Promise from 'bluebird';
import ReactDOM from 'react-dom';


describe('bkpUtils.js', function () {

	describe('initializeWindow', function () {
		// TODO: finish test
	});

	describe('capitalizeFirstLetter', function () {
		it('should set the first letter in a word to upper case', () => {
			//given
			//when
			let result = bkpUtils.capitalizeFirstLetter('foo');
			//then
			expect(result).toEqual('Foo');
		});
	});

	describe('humanizeCamelCase', function () {
		it('should add spaces to a camelcase string', () => {
			//given
			//when
			let result = bkpUtils.humanizeCamelCase('MyDogsNameIsFoo');
			//then
			expect(result).toEqual('My Dogs Name Is Foo');
		});
	});

	describe('cssifyString', function () { });

	describe('clamp', function () {
		it('should return the same number if the value is between the min and max value', function ()  {
			expect(bkpUtils.clamp(42, 0, 45)).toEqual(42);
		});
		it('should return the max value if the number is greater than the value for max', function ()   {
			expect(bkpUtils.clamp(50, 0, 45)).toEqual(45);
		});
		it('should return the min value if the number is less than the value for min', function ()   {
			expect(bkpUtils.clamp(-5, 0, 45)).toEqual(0);
		});
	});

	describe('clampWrap', function () {
		it('should return the same number if the value is between the min and max value', function ()  {
			expect(bkpUtils.clampWrap(42, 0, 45)).toEqual(42);
		});
		it('should return the min value if the number is greater than the value for max', function ()   {
			expect(bkpUtils.clampWrap(50, 0, 45)).toEqual(0);
		});
		it('should return the max value if the number is less than the value for min', function ()   {
			expect(bkpUtils.clampWrap(-5, 0, 45)).toEqual(45);
		});
	});

	describe('circumference', function () {
		it('should return the circumference of a circle based on the radius', function ()  {
			//known: when radius is 0.8 the circumference should be 5.026... (https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=radius+circle+calculator)
			let result = bkpUtils.circumference(0.8);
			expect(Math.floor(result)).toEqual(5);
		});
	});

	describe('secondsToMs', function () {
		it('should convert seconds to milliseconds', () => {
			//given
			//when
			let result = bkpUtils.secondsToMs(5.5);
			//then
			expect(result).toEqual(5500);
		});
	});

	describe('areArraysEqualByObjectId', function () {
		it('should return true if the objects are matching in memory', () => {
			//given
			const obj1 = {id: 1};
			const obj2 = {id: 2};
			const arr1 = [obj1, obj2];
			const arr2 = [obj1, obj2];
			//when
			const result = bkpUtils.areArraysEqualByObjectId(arr1, arr2);
			//then
			expect(result).toBeTruthy();
		});
		it('should return true if the objects in the arrays have matching id properties, but are not the same objects in memory', () => {
			//given
			const arr1 = [{id: 1}, {id: 2}];
			const arr2 = [{id: 1}, {id: 2}];
			//when
			const result = bkpUtils.areArraysEqualByObjectId(arr1, arr2);
			//then
			expect(result).toBeTruthy();
		});
		it('should return false if arrays are not the same length', () => {
			//given
			const arr1 = [{}, {}];
			const arr2 = [{}];
			//when
			const result = bkpUtils.areArraysEqualByObjectId(arr1, arr2);
			//then
			expect(result).toBeFalsy();
		});
		it('should return false if the objects in the arrays do not have matching id properties', () => {
			//given
			const arr1 = [{id: 1}, {id: 2}];
			const arr2 = [{id: 3}, {id: 4}];
			//when
			const result = bkpUtils.areArraysEqualByObjectId(arr1, arr2);
			//then
			expect(result).toBeFalsy();
		});
		it('should return false if the objects in the arrays have matching id properties, but are in the wrong order', () => {
			//given
			const arr1 = [{id: 1}, {id: 2}];
			const arr2 = [{id: 2}, {id: 1}];
			//when
			const result = bkpUtils.areArraysEqualByObjectId(arr1, arr2);
			//then
			expect(result).toBeFalsy();
		});
	});

	describe('arraySum', function () {
		it('should used underscore.js reduce method', () => {
			//given
			// eslint-disable-next-line
			spyOn(_, 'reduce');
			//when
			bkpUtils.arraySum([1, 2, 3, 4]);
			//then
			expect(_.reduce).toHaveBeenCalled();
		});
	});

	describe('extendArray', function () {
		it('should add items from src array to dest array and return dest array', () => {
			//given
			const arr1 = ['dog', 'cat'];
			const arr2 = ['foo', 'bar'];
			//when
			const result = bkpUtils.extendArray(arr1, arr2);
			//then
			expect(result).toEqual(arr1);
			expect(result.indexOf('foo')).not.toEqual(-1);
			expect(result.indexOf('bar')).not.toEqual(-1);
		});
	});

	describe('truncate', function () {
		it('should trim a string to a length and add ... tot he end', () => {
			//given
			const str = 'The quick brown fox';
			//when
			const result = bkpUtils.truncate(str, 10);
			//then
			expect(result).toEqual('The qui...');
		});
		it('should not trim a string if string length is less than or equal to length', () => {
			//given
			const str = 'The quick brown fox';
			//when
			const result1 = bkpUtils.truncate(str, 19);
			const result2 = bkpUtils.truncate(str, 20);
			//then
			expect(result1).toEqual('The quick brown fox');
			expect(result2).toEqual('The quick brown fox');
		});
	});

	describe('prettyPrint', function () {
		it('should remove -_, put spaces between words, and put spaces between number and words', () => {
			//given
			const str = ' 1_TheIQuick45Brown-Fox! ';
			//when
			const result = bkpUtils.prettyPrint(str);
			//then
			expect(result).toEqual('1 The I Quick 45 Brown Fox!');
		});
		it('should ignore strings that are only - or _', () => {
			//given
			//when
			const result1 = bkpUtils.prettyPrint('-');
			const result2 = bkpUtils.prettyPrint('_');
			//then
			expect(result1).toEqual('-');
			expect(result2).toEqual('_');
		});
	});

	describe('prettyCountdown', function () {
		it('should format a time as mm:ss', () =>{
			//given
			//when
			const result = bkpUtils.prettyCountdown(357, 10);
			//then
			expect(result).toEqual('05:47');
		});
		it('should return 00:00 ', () =>{
			//given
			//when
			const result = bkpUtils.prettyCountdown(357, 10);
			//then
			expect(result).toEqual('05:47');
		});
	});

	describe('backgroundImage', function () {
		it('should return an object with the css property backgroundImage', () => {
			//given
			const str = '../img/foobar.jpg';
			//when
			const result = bkpUtils.backgroundImage(str);
			//then
			expect(result.backgroundImage).toEqual('url(\'../img/foobar.jpg\')');
		});
		it('should backgroundImage property to a style object if supplied', () => {
			//given
			const str = '../img/foobar.jpg';
			const obj = {width: 300};
			//when
			const result = bkpUtils.backgroundImage(str, obj);
			//then
			expect(result.backgroundImage).toEqual('url(\'../img/foobar.jpg\')');
			expect(result.width).toEqual(300);
		});
	});

	describe('zeroPrepend', function () {
		it('should add 0s to the beginning of a number based on the value of places', () => {
			//given
			//when
			const result = bkpUtils.zeroPrepend(34, 5);
			//then
			expect(result).toEqual('00034');
		});
		it('should NOT add 0s to the beginning of a number if the length is less than or equal to places', () => {
			//given
			//when
			const result = bkpUtils.zeroPrepend(345, 3);
			//then
			expect(result).toEqual('345');
		});
	});

	describe('arrayChunks', function () {
		it('should split an array in an array of arrays, based on size', () => {
			//given
			const arr = ['foo', 'bar', 'hello', 'world'];
			//when
			const result = bkpUtils.arrayChunks(arr, 2);
			//then
			expect(result.length).toEqual(2);
			expect(result[0].length).toEqual(2);
			expect(result[0][0]).toEqual('foo');
			expect(result[1][0]).toEqual('hello');
		});
	});

	describe('arrayFill', function () {
		it('should add items to an array until length is reached', () => {
			//given
			const arr = [];
			//when
			const result = bkpUtils.arrayFill(arr, 5);
			//then
			expect(result.length).toEqual(5);
		});
		it('should use the create method to add items to an array and should be passed the current index', () => {
			//given
			const arr = [];
			//when
			const result = bkpUtils.arrayFill(arr, 3, (i) => 'foo'+i);
			//then
			expect(result[0]).toEqual('foo0');
			expect(result[1]).toEqual('foo1');
			expect(result[2]).toEqual('foo2');
		});
	});

	describe('gridFill', function () {
		it('should fill a multidimensional array with items until length is reached', () => {
			//given
			const arr = [];
			//when
			const result = bkpUtils.gridFill(arr, 2, 2);
			//then
			expect(result.length).toEqual(2);
			expect(result[0].length).toEqual(2);
		});
		it('should use the create method to add items to an array and should be passed the current row and col index', () => {
			//given
			const arr = [];
			//when
			const result = bkpUtils.gridFill(arr, 2, 2, (i, j) => 'foo' + i + ':' + j);
			//then
			expect(result[0][0]).toEqual('foo0:0');
			expect(result[0][1]).toEqual('foo0:1');
			expect(result[1][0]).toEqual('foo1:0');
			expect(result[1][1]).toEqual('foo1:1');
		});
	});

	describe('parseDuration', function () {
		it('should parse milliseconds into an object with days, hours, minutes, seconds', () => {
			//given
			//when
			const result = bkpUtils.parseDuration(678932156);
			//then
			expect(result.days).toEqual(7);
			expect(result.hours).toEqual(20);
			expect(result.minutes).toEqual(35);
			expect(result.seconds).toEqual(32);
		});
	});

	describe('formatDuration', function () {
		// TODO: finish test
	});

	describe('isInt', function () {
		it('should be true if number is 22', () => {
			expect(bkpUtils.isInt(2)).toBeTruthy();
		});
		it('should be false if number is 2.5', () => {
			expect(bkpUtils.isInt(2.5)).toBeFalsy();
		});
	});

	// NOTE: no test needed
	//describe('noop', function () {});

	describe('isoDateStringToLocal', function () {
		it('should call moment.utc to convert to utc date', () => {
			//given
			spyOn(moment, 'utc');
			//when
			bkpUtils.isoDateStringToLocal();
			//then
			expect(moment.utc).toHaveBeenCalled();
		});
	});

	describe('toFixed', function () {
		it('should round a decimal number to 2 decimal places', () => {
			//given
			//when
			const result = bkpUtils.toFixed(234.56256);
			//then
			expect(result).toEqual(234.56);
		});
		it('should round up based on 3rd number after decimal', () => {
			//given
			//when
			const result = bkpUtils.toFixed(234.567);
			//then
			expect(result).toEqual(234.57);
		});
		it('should return number if not a decimal', () => {
			//given
			//when
			const result = bkpUtils.toFixed(234);
			//then
			expect(result).toEqual(234);
		});
	});

	describe('throttle', function () {
		it('should return wrapper function that limits the calls to the supplied function', () => {
			//given
			const spy = jasmine.createSpy('spy');
			let count = 0;
			//when
			const result = bkpUtils.throttle(spy, 50);
			const promise = new Promise((accept) => {
				let intId = setInterval(() => {
					result();
					if(count++ > 10) {
						clearInterval(intId);
						//then
						accept(spy.calls.count());
					}
				}, 10);
			});

			return expect(promise).resolves.toEqual(3);
		});
	});

	describe('calculateAverage', function () {
		it('should return the average of total / quantity', () => {
			//given
			//when
			const result = bkpUtils.calculateAverage(100, 50);
			//then
			expect(result).toEqual(2);
		});
		it('should not devide by zero', () => {
			//given
			//when
			const result = bkpUtils.calculateAverage(100, 0);
			//then
			expect(result).toEqual(100);
		});
	});

	describe('getTierClass', function () {
		it('should add a tier class to an object based on item.tier', () => {
			//given
			const item = {tier: 2};
			//when
			const result = bkpUtils.getTierClass(item);
			//then
			expect(result['tier-1']).toBeFalsy();
			expect(result['tier-2']).toBeTruthy();
		});
	});

	describe('r', function () {
		it('should return a function that when called will add a prop to the context object with a ref to a jquery object', () => {
			//given
			const context = {};
			const name = 'bar';
			//when
			const result = bkpUtils.r(context, name);
			result();
			//then
			expect(context.bar).toBeDefined();
			expect(context.bar instanceof $).toBeTruthy();
		});
	});

	describe('$wrapElement', function () {
		it('should wrapped an ReactDOM object in jquery', () => {
			//given
			spyOn(ReactDOM, 'findDOMNode');
			const ele = {context: 'foo'};
			//when
			const result = bkpUtils.$wrapElement(ele);
			//then
			expect(ReactDOM.findDOMNode).toHaveBeenCalled();
			expect(result instanceof $).toBeTruthy();
		});
		it('should wrapped an object in jquery', () => {
			//given
			const ele = {};
			//when
			const result = bkpUtils.$wrapElement(ele);
			//then
			expect(result instanceof $).toBeTruthy();
		});
	});

	describe('logFunc', function () {
		it('should return a logger object', () => {
			//given
			spyOn(console, 'log');
			spyOn(console, 'warn');
			spyOn(console, 'info');
			//when
			const result = bkpUtils.logFunc('foobar');
			result('test1');
			result.warn('test2');
			result.info('test3');
			//then
			expect(result instanceof Function).toBeTruthy();
			expect(result.warn instanceof Function).toBeTruthy();
			expect(result.info instanceof Function).toBeTruthy();
			expect(result.off instanceof Function).toBeTruthy();

			if (process.env.REACT_APP_IS_INTERNAL_BUILD === 'true') {
				expect(console.log).toHaveBeenCalledWith('foobar.test1');
				expect(console.warn).toHaveBeenCalledWith('foobar.test2');
				expect(console.info).toHaveBeenCalledWith('foobar.test3');
			}
		});
		it('should be able to turn off a logger', () => {
			//given
			spyOn(console, 'log');
			spyOn(console, 'warn');
			spyOn(console, 'info');
			//when
			const result = bkpUtils.logFunc('foobar').off();
			result('test1');
			result.warn('test2');
			result.info('test3');
			//then
			expect(console.log).not.toHaveBeenCalled();
			expect(console.warn).not.toHaveBeenCalled();
			expect(console.info).not.toHaveBeenCalled();
		});
	});

	describe('promiseMapSeries', function () {
		it('should resolve a series of promises and collect the results of each promise in an array', () => {
			//given
			const items = ['foo', 'bar', 'cat', 'dog'];
			const iterator = (str) => Promise.resolve(str + '1');
			//when
			const promise = bkpUtils.promiseMapSeries(items, iterator);
			//then
			return expect(promise).resolves.toEqual(['foo1', 'bar1', 'cat1', 'dog1']);
		});
	});

	describe('clickIf', function () {
		it('if condition is true, should return a function that when called will called the supplied function', () => {
			//given
			const spy = jasmine.createSpy('spy');
			//when
			const result = bkpUtils.clickIf(true, spy);
			result();
			//then
			expect(spy).toHaveBeenCalled();
		});
		it('if condition is false, should return a function that when called will NOT call the supplied function', () => {
			//given
			const spy = jasmine.createSpy('spy');
			//when
			const result = bkpUtils.clickIf(false, spy);
			result();
			//then
			expect(spy).not.toHaveBeenCalled();
		});
	});

});

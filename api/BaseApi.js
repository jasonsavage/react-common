import $ from 'jquery';
import Promise from 'bluebird';
import {logFunc} from 'helpers/bkpUtils';

export const TYPE_GET = 'GET';
export const TYPE_POST = 'POST';

const logger = logFunc('BaseApi');

/**
 * Sets the auth token in the header of the out going request
 * @param {object} xhr
 */
function setAuthorizationHeader (xhr) {
	if (BaseApi.authToken) {
		xhr.setRequestHeader('Authorization', `BKPAuth auth_token=${BaseApi.authToken}`);
	}
}

/**
 * Checks the response from the server to see if it was response.success is true
 * @param {string} url
 * @param {object} response
 * @param {number} requestDuration
 * @returns {object|string}
 */
function checkResponse (url, response, requestDuration) {
	checkRequestDuration(url, requestDuration);
	if (!response.success) {
		logger.warn('checkResponse', 'Server returned a non-successful response', {url, error: response.error_code ? response.error_code : 'FeErrorUnknown' });
		return Promise.reject(new Error(response.error_code ? response.error_code.replace(/\s/g, '_') : 'FAILED_REQUEST'));
	}
	return Promise.resolve(response.response);
}

/**
 * Logs the error that was received from the server
 * @param {string} url
 * @param {string} error
 * @param {number} requestDuration
 * @returns {string}
 */
function warnError (url, error, requestDuration) {
	checkRequestDuration(url, requestDuration);
	if(error) {
		logger.warn('warnError', 'Server returned an error', { url, error });
	}
	return error || new Error('UNKNOWN_ERROR');
}

function checkRequestDuration (url, requestDuration) {
	if(requestDuration > 1000) {
		logger.warn('checkRequestDuration', 'Server took too long to respond', { url, actual: `${requestDuration/1000}s`});
	}
}

class BaseApi {
	static authToken;

	static fetchGet (url, data, onBeforeSend) {
		return BaseApi.fetch(TYPE_GET, url, data, onBeforeSend);
	}

	static fetchPost (url, data, onBeforeSend) {
		return BaseApi.fetch(TYPE_POST, url, data, onBeforeSend);
	}

	static fetch (type, url, data={}, onBeforeSend=setAuthorizationHeader) {
		const startTime = Date.now();
		const requestOptions = {
			url, type, data,
			dataType: 'json',
			beforeSend: onBeforeSend
		};

		if(type === TYPE_POST) {
			requestOptions.contentType = 'application/json';
			requestOptions.data = JSON.stringify(data);
		}

		return Promise.resolve($.ajax(url, requestOptions)).then(
			response => checkResponse(url, response, Date.now() - startTime),
			error => warnError(url, error, Date.now() - startTime)
		);
	}
}

export default BaseApi;

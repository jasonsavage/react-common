import BaseApi, {TYPE_GET, TYPE_POST} from 'api/BaseApi';
import Promise from 'bluebird';
import $ from 'jquery';

describe('BaseApi', () => {

	const endpoint = 'http://www.test.com/fake_endpoint';

	it('calling fetchGet should call BaseApi.fetch with method type GET', () => {
		// given
		// eslint-disable-next-line
		spyOn(BaseApi, 'fetch');
		// when
		BaseApi.fetchGet(endpoint);
		// then
		expect(BaseApi.fetch).toHaveBeenCalledWith(TYPE_GET, endpoint, undefined, undefined);
	});

	it('calling fetchPost should call BaseApi.fetch with method type POST', () => {
		// given
		// eslint-disable-next-line
		spyOn(BaseApi, 'fetch');
		// when
		BaseApi.fetchPost(endpoint);
		// then
		expect(BaseApi.fetch).toHaveBeenCalledWith(TYPE_POST, endpoint, undefined, undefined);
	});

	it('should resolve a backend success response correctly', async () => {
		// given
		// eslint-disable-next-line
		spyOn($, 'ajax').and.returnValue(Promise.resolve({'success': true, 'response': 'foo'}));
		// when
		const response = await BaseApi.fetch(TYPE_GET, endpoint);
		// then
		expect(response).toEqual('foo');
	});

	it('should resolve a backend error response correctly', async () => {
		// given
		// eslint-disable-next-line
		spyOn($, 'ajax').and.returnValue(Promise.resolve({'success': false, 'error_code': 'foo'}));
		// when
		try {
			await BaseApi.fetch(TYPE_GET, endpoint);
		} catch (e) {
			// then
			expect(e.message).toEqual('foo');
		}
	});

	it('should resolve a backend error response correctly even without an error code', async () => {
		// given
		// eslint-disable-next-line
		spyOn($, 'ajax').and.returnValue(Promise.resolve({'success': false}));
		// when
		try {
			await BaseApi.fetch(TYPE_GET, endpoint);
		} catch (e) {
			// then
			expect(e.message).toEqual('FAILED_REQUEST');
		}
	});

	it('should resolve http error response correctly', async () => {
		// given
		// eslint-disable-next-line
		spyOn($, 'ajax').and.returnValue(Promise.reject(new Error('foo')));
		// when
		try {
			await BaseApi.fetch(TYPE_GET, endpoint);
		} catch (e) {
			// then
			expect(e).toEqual('foo');
		}
	});

});

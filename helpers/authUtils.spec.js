/* eslint-disable no-unused-vars, max-len */
import ueFunctions from 'ueFunctions';
import {
	encodedToken,
	decodeToken,
	parseAuthToken,
	parseUserData,
	isNewUserError,
	isAccountTypeError,
	isBanError,
	isNewTokenRequestClientType,
	validateEmail
} from 'helpers/authUtils';


describe('authUtils.js', () => {
	/**
	 * Should run a test on all function exported from authUtils.js
	 */
	//NOTE: For encodedToken and decodeToken function tests, I'm not totally sure the best way to test these
	// ... so I'm just using 2 data snapshot taken on 2/22/2018 against the dev backend
	describe('encodedToken', () => {
		it('should properly decode a token from the server', () => {
			// given
			// when
			const result = encodedToken(encodeTokenSnapshot);
			//then
			expect(result).toEqual(encodeTokenResultSnapshot);
		});
	});

	describe('decodeToken', () => {
		it('should properly decode a token from the server', () => {
			// given
			// when
			const result = decodeToken(decodeTokenSnapshot);
			//then
			expect(result).toEqual(decodeTokenResultSnapshot);
		});
	});

	describe('parseAuthToken', () => {
		it('should create a auth object out of the supplied response', () => {
			// given
			// when
			const result = parseAuthToken(parseAuthTokenSnapshot);
			//then
			expect(result.userId).toEqual('5a0f0a7934533800177a96e3');
			expect(result.username).toEqual('Jason');
			expect(result.authToken.data.public.player_name).toEqual('Jason');
			expect(result.public.player_name).toEqual('Jason');
			expect(result.granted_twitch_items).toBeFalsy();
		});
	});

	describe('parseUserData', () => {
		it('should get userdata object from the supplied authInfo', () => {
			//given
			const authInfo = { public: { userdata: { name: 'foobar' } } };
			//when
			const result = parseUserData(authInfo);
			//then
			expect(result.name).toEqual('foobar');
		});

		it('should parse userdata as a JSON object if it is a string', () => {
			//given
			const authInfo = { public: { userdata: '{ "name": "foobar" }' } };
			//when
			const result = parseUserData(authInfo);
			//then
			expect(result.name).toEqual('foobar');
		});

		it('should return an empty object if authInfo is not formatted correctly', () => {
			//given
			const authInfo = { public_foo: { userdata: '{ "name": "foobar" }' } };
			//when
			const result = parseUserData(authInfo);
			//then
			expect(result.name).toBeUndefined();
		});
	});

	describe('isNewUserError', () => {
		it('should return true if error code is related to a new user', () => {
			//given
			//when
			const result1 = isNewUserError(new Error('UNREGISTERED'));
			const result2 = isNewUserError(new Error('user-not-found'));
			const result3 = isNewUserError(new Error('foo-bar'));
			//then
			expect(result1).toBeTruthy();
			expect(result2).toBeTruthy();
			expect(result3).toBeFalsy();
		});
	});

	describe('isAccountTypeError', () => {
		it('should return true if running in coherent and error is account-type-failure', () => {
			//given
			spyOn(ueFunctions, 'getIsGameRunningInCoherent').and.returnValue(true);
			//when
			const result = isAccountTypeError(new Error('account-type-failure'));
			//then
			expect(ueFunctions.getIsGameRunningInCoherent).toHaveBeenCalled();
			expect(result).toBeTruthy();
		});

		it('should return false if NOT running in coherent no matter what the error is', () => {
			//given
			spyOn(ueFunctions, 'getIsGameRunningInCoherent').and.returnValue(false);
			//when
			const result = isAccountTypeError(new Error('account-type-failure'));
			//then
			expect(ueFunctions.getIsGameRunningInCoherent).toHaveBeenCalled();
			expect(result).toBeFalsy();
		});
	});

	describe('isBanError', () => {
		it('should return true if error code contains the word ban', () => {
			//given
			//when
			const result = isBanError(new Error('foo-ban-error'));
			//then
			expect(result).toBeTruthy();
		});

		it('should return false if error code does NOT contains the word ban', () => {
			//given
			//when
			const result = isBanError(new Error('foo-error'));
			//then
			expect(result).toBeFalsy();
		});
	});

	describe('isNewTokenRequestClientType', () => {
		it('should call ueFunctions.getMatchmakingClientType and if ps4, return true', () => {
			//given
			spyOn(ueFunctions, 'getMatchmakingClientType').and.returnValue('ps4');
			//when
			const result = isNewTokenRequestClientType();
			//then
			expect(ueFunctions.getMatchmakingClientType).toHaveBeenCalled();
			expect(result).toBeTruthy();
		});
	});

	describe('validateEmail', () => {
		it('should return true if email is valid', () => {
			//given
			//when
			const result = validateEmail('foo@bar.com');
			//then
			expect(result.isEmailValid).toBeTruthy();
		});
		it('should return false with related error code, if email is invalid', () => {
			//given
			//when
			const result1 = validateEmail('');
			const result2 = validateEmail('foobar');
			//then
			expect(result1.isEmailValid).toBeFalsy();
			expect(result1.emailError).toEqual('Email_Required');
			expect(result2.isEmailValid).toBeFalsy();
			expect(result2.emailError).toEqual('Please_enter_a_valid_email_address');
		});
	});
});

/* eslint-disable */
const decodeTokenSnapshot = {"data":{"public":{"local_id":"5a0f0a7934533800177a96e3","player_name":"Jason","ttl":172800,"grant_time":"2018-02-22 16:31:56","userdata":{"language":"en"}},"internal":{"a":"hDFXMbScP4HwzEvpVBKkBhL8LNvL/8UFCFCMz2X/IVa00v/2k0/mle58CaxFjMUOBmnQK/LeCXe71XNZnaV4jgKtcjJF/+HlHfzt9jHqNr+xcA==","b":"sn+SpeClbFn/PFfVYWyCWTe8+deHZTqU2d0XJKOLJM/aIXKv2iedhFFu03Aa7gb4QTLbAYku++7c21hDnH/7rFDXYQPdLQ3xO87VabYpnOCE2hP5+ghyXRfcWOFXgKHCRbaOV7m7xNvSz2myVP1yvYl2pFiK7qEV3ntvbjv43NMqOUGgtgPq3WZLExFrYtepu/hI6V0B8nvcMPzLc1wj"}},"hash":"d1dqXG9qIwl5v6klM8vYBfdhJC1jvZPtSAhrUWyTFj3XF+VGoS8vCmu8PKjaMoEn/vQazJPhbx0NiLIaCQmmj11miPC29E6G8HlC11zTujJyFJ5EDtAjqhodGzb2sntJ0eBfb104fW4+jXEnDokeqLVhWIUIMxP+Sh4UnsLCBIw1S+fj0Px0lENdGkFMew32vDzHt4LcgQHBGMTpm8CRRZSxApzDuRQoOSV2J+1+PR+BALij16fjkfaCTnPYT51r0raeRbXYpU+k1/ur6Xn10MO2tNNNKx/q/LlYvBQSP9LVOMZ7oYrmoXwHzk8vRfpbZr9Wl0W1QGY5UOOACPM9+A=="};
const decodeTokenResultSnapshot = '{"data":{"public":{"local_id":"5a0f0a7934533800177a96e3","player_name":"Jason","ttl":172800,"grant_time":"2018-02-22 16:31:56","userdata":{"language":"en"}},"internal":{"a":"hDFXMbScP4HwzEvpVBKkBhL8LNvL/8UFCFCMz2X/IVa00v/2k0/mle58CaxFjMUOBmnQK/LeCXe71XNZnaV4jgKtcjJF/+HlHfzt9jHqNr+xcA==","b":"sn+SpeClbFn/PFfVYWyCWTe8+deHZTqU2d0XJKOLJM/aIXKv2iedhFFu03Aa7gb4QTLbAYku++7c21hDnH/7rFDXYQPdLQ3xO87VabYpnOCE2hP5+ghyXRfcWOFXgKHCRbaOV7m7xNvSz2myVP1yvYl2pFiK7qEV3ntvbjv43NMqOUGgtgPq3WZLExFrYtepu/hI6V0B8nvcMPzLc1wj"}},"hash":"d1dqXG9qIwl5v6klM8vYBfdhJC1jvZPtSAhrUWyTFj3XF+VGoS8vCmu8PKjaMoEn/vQazJPhbx0NiLIaCQmmj11miPC29E6G8HlC11zTujJyFJ5EDtAjqhodGzb2sntJ0eBfb104fW4+jXEnDokeqLVhWIUIMxP+Sh4UnsLCBIw1S+fj0Px0lENdGkFMew32vDzHt4LcgQHBGMTpm8CRRZSxApzDuRQoOSV2J+1+PR+BALij16fjkfaCTnPYT51r0raeRbXYpU+k1/ur6Xn10MO2tNNNKx/q/LlYvBQSP9LVOMZ7oYrmoXwHzk8vRfpbZr9Wl0W1QGY5UOOACPM9+A=="}';

const encodeTokenSnapshot = {"data":{"public":{"local_id":"5a0f0a7934533800177a96e3","player_name":"Jason","ttl":172800,"grant_time":"2018-02-22 16:19:59","userdata":{"language":"en"}},"internal":{"a":"72IBCKQNoY8zCM2SSCMUMZwM8/9tgzD5r83/GitL4FFumauHeeMhrY/jefyAh/dWGNKrVx4zV2Xy1O1WtjvJL17sZM06oEE7lRR0IbeFlWHP5Q==","b":"uhEMMnQI9iwbUtyCEv/YEtlise2KZFA7dixG40umP3M9yDrdARp2ox0ieI0fwHqx7jb31MJWe3apzRuITPmz43mK0JpbKo4xveOTi9+NfzHjnzE9x/wjXiuMntq6+1Jc7qOWJX0bPlIIFOQ/46pntLXE86ERyJO4ALggjbzYZKBU/krfExzZ8GuqdceKw5pWE8FdshK3WiDxVS48cusY"}},"hash":"lnU70N+M8dhTPFcJUWbAmLf39gYj5qq+CDr7/eKkAsgnCMyWPTyVob9EJtV6q8OzuOw/opcrj2tFuW3flgdUC1wkBJsEr/kaI0FVpBNRzaMNvSspme7TG+7zf97iDbwwRGt7ulyUtHgeDJGt9n5GJvEI+ilxpQiwByoloRmgJsRhAaWLTmEAqKbBe0xFpXStCp7YolVpHECmrwRX8ZLt1zV0Gy+1dMX1sikq1et8E16sCi9uhPWr0A5aofIs5iqJLOwt76AaFnPpN2G6mQMlnUlQNeH1C0Xm/nqbhfOwTOUbHRj/lVPLETPf6WqdPT+zJL3a5cNIM2aWeUHpDg/CPA=="};
const encodeTokenResultSnapshot = '{\"data\":{\"public\":{\"local_id\":\"5a0f0a7934533800177a96e3\",\"player_name\":\"Jason\",\"ttl\":172800,\"grant_time\":\"2018-02-22 16:19:59\",\"userdata\":{\"language\":\"en\"}},\"internal\":{\"a\":\"72IBCKQNoY8zCM2SSCMUMZwM8/9tgzD5r83/GitL4FFumauHeeMhrY/jefyAh/dWGNKrVx4zV2Xy1O1WtjvJL17sZM06oEE7lRR0IbeFlWHP5Q==\",\"b\":\"uhEMMnQI9iwbUtyCEv/YEtlise2KZFA7dixG40umP3M9yDrdARp2ox0ieI0fwHqx7jb31MJWe3apzRuITPmz43mK0JpbKo4xveOTi9+NfzHjnzE9x/wjXiuMntq6+1Jc7qOWJX0bPlIIFOQ/46pntLXE86ERyJO4ALggjbzYZKBU/krfExzZ8GuqdceKw5pWE8FdshK3WiDxVS48cusY\"}},\"hash\":\"lnU70N+M8dhTPFcJUWbAmLf39gYj5qq+CDr7/eKkAsgnCMyWPTyVob9EJtV6q8OzuOw/opcrj2tFuW3flgdUC1wkBJsEr/kaI0FVpBNRzaMNvSspme7TG+7zf97iDbwwRGt7ulyUtHgeDJGt9n5GJvEI+ilxpQiwByoloRmgJsRhAaWLTmEAqKbBe0xFpXStCp7YolVpHECmrwRX8ZLt1zV0Gy+1dMX1sikq1et8E16sCi9uhPWr0A5aofIs5iqJLOwt76AaFnPpN2G6mQMlnUlQNeH1C0Xm/nqbhfOwTOUbHRj/lVPLETPf6WqdPT+zJL3a5cNIM2aWeUHpDg/CPA==\"}';

const parseAuthTokenSnapshot = '{"data": {"public": {"local_id": "5a0f0a7934533800177a96e3", "player_name": "Jason", "ttl": 172800, "grant_time": "2018-02-22 16:37:18", "userdata": {"language": "en"}}, "internal": {"a": "NmrdAhlg0jLHtO6rKiAxMdrS6T1kXucZOZei7hUqdRxj/nulVbQvmhHudxM+WFbX04x7yg9byXVBVopGW98jbieXQZYBvjCvx71oWknzKPE4bg==", "b": "PLc14PoUM1L2kQlMEm/Pjnvn1wCjRQX3holgd9YZH/kiHpiW2626SwaZgYrp10cwVTIWPOzTkLnqVhaJ+w0M88yZROBqRr7e4oGcJKeIiKubkcBEV37CO47+5Rw80XwhxSePzlzNDfUaeFMsL6VjM9+NEgs23PEwuD6THlRS6H2polVwEFALEfI7VOfaKEAddN95sFb809UM5FmsuVJ+"}}, "hash": "BGN9MxJ7J5FHjIBiffI6LLeIefgDmpy3PciMPel4FuE0HhMolJiVBeRrdRj7/SXklioWEsab8WWhay4ORMc7Dj2e4K/EmMPy8pv1RYqYV/mS40CP4EgUzdj/WTElPT5WnHz9mZOI2ViXs+gGtVLlSsWzu0CA1I3zZ9ciSfoIyPH7ylySwPbE1cBSHTRI0LMySmRkP/p2lEmS+5gpot1bfI01BNwUNUxrikSSqFEFp390l7XNs0I41HdBNsqJuUc8mtJABpLSBY+4TPWfI70+PmCFAO41fEwdUqCgsK0l9IrAdVxckjR8aaj3ahC5X7CZTOoSc8L5z4f2l3lrecIi1A=="}';


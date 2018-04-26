import _ from 'underscore';
import ueFunctions from 'ueFunctions';
import {FOUNDERS_APP_ID} from 'constants/Configuration';
import {locId} from 'helpers/localeUtils';


export function encodedToken (token) {
	let result = null;
	if (token) {
		result = JSON.stringify(token).replace(/[\u007F-\uFFFF]/g, function (chr) {
			return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
		});
	}
	return result;
}

export function decodeToken (token) {
	if (token) {
		return JSON.stringify(token).replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4));
	}
	return null;
}

export function parseAuthToken (responseToken, isGrantedTwitchItems = false) {
	let authToken = JSON.parse(responseToken);

	return {
		authToken: authToken,
		userId: authToken.data.public.local_id,
		username: authToken.data.public.player_name,
		public: authToken.data.public,
		granted_twitch_items: isGrantedTwitchItems
	};
}

export function parseUserData (authInfo) {
	let userdata = ((authInfo || {}).public || {}).userdata || {};
	if (_.isString(userdata)) {
		userdata = JSON.parse(userdata);
	}
	return userdata;
}

export function isNewUserError (error) {
	return error.message === 'UNREGISTERED' || error.message === 'user-not-found';
}

export function isAccountTypeError (error) {
	return ueFunctions.getIsGameRunningInCoherent() && error.message === 'account-type-failure';
}

export function isBanError (error) {
	return _.isString(error.message) && error.message.match(/ban/i);
}

export function isNewTokenRequestClientType () {
	return ueFunctions.getMatchmakingClientType() === 'ps4';
}

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export function validateEmail (email) {
	email = (email || '').replace(/\s/g, '');

	if (!email || email === '') {
		return { isEmailValid: false, emailError: locId('Email Required') };

	} else if (!emailRegex.test(email)) {
		return { isEmailValid: false, emailError: locId('Please enter a valid email address.') };
	}

	return { isEmailValid: true, emailError: null };
}

export function hasFoundersPack (userData) {
	if(userData && userData.app_ids && userData.app_ids.length) {
		// find founders pack id
		return (userData.app_ids.indexOf(FOUNDERS_APP_ID) !== -1);
	}
	return false;
}

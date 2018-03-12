import moment from 'moment';
import { Set } from 'immutable';
import _ from 'underscore';
import { EventEmitter } from 'events';
import ueFunctions from 'ueFunctions';
import BaseApi from 'api/BaseApi';

export function getClientId () {
	let result = process.env.REACT_APP_TWITCH_CLIENT_ID;
	if (process.env.REACT_APP_IS_INTERNAL_BUILD === 'true') {
		if (ueFunctions.getAuthHost().match('.staging.')) {
			result = '7emthjb2kjoyqn5v68fwq12ul8yr2r';
		} else if (ueFunctions.getAuthHost().match('.dev.')) {
			result = 'xnn2lzn1y0cw47v1vp8cqqhd29ty71';
		}
	}
	return result;
}
function addHeadersToRequest (xhr) {
	xhr.setRequestHeader('Client-ID', getClientId());
	xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
}

export const TWITCH_STREAM_STATUS_UPDATE_EVENT = 'TWITCH_STREAM_STATUS_UPDATE_EVENT';

let lastRequestedUsers = new Set();
let lastRequestSentAt = null;

const TwitchApi = _.extend({}, EventEmitter.prototype, {
	/**
	 * Get the live streaming status of users. Emit a list of users that are streaming, and those
	 * that are currently offline.
	 * @param users, A map of {twitch_channel_id: bosskey_id}
	 **/
	checkTwitchStreamStatus: users => {
		let url = 'https://api.twitch.tv/kraken/streams/';
		let userIds = _.keys(users).join(',');
		let userSet = new Set(userIds);
		let now = moment();
		let args = { channel: userIds };

		// last ditch safeguard against accidentally spamming requests
		if (userSet.hashCode() === lastRequestedUsers.hashCode() && lastRequestSentAt && lastRequestSentAt.clone().add(45, 'seconds') > now) {
			return;
		}

		lastRequestSentAt = now;
		lastRequestedUsers = userSet;

		console.log(`${new Date()} TwitchApi.checkTwitchStreamStatus ${userIds}`);
		BaseApi.fetchGet(url, args, addHeadersToRequest).then(
			response => {
				let usersLive = [];
				response.streams.forEach(stream => {
					if (stream.stream_type === 'live') {
						usersLive.push(users[stream.channel._id]);
					}
				});
				let usersOffline = _.difference(_.values(users), usersLive);
				console.log(`TwitchApi.checkTwitchStreamStatus live ${usersLive}, offline ${usersOffline}`);
				TwitchApi.emit(TWITCH_STREAM_STATUS_UPDATE_EVENT, { usersLive, usersOffline });
			},
			error => {
				console.error(`TwitchApi.checkTwitchStreamStatus error checking twitch status ${JSON.stringify(error)}`);
			}
		);
	}
});

export default TwitchApi;

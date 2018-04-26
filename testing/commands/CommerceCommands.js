import Promise from 'bluebird';
import {hijack} from '../utils';

// test data


// utils


/*
// hijack BaseApi.bossApiGet, and wait for next call
	hijack(BaseApi, 'bossApiGet', () => {
		// set reference back to the original function
		BaseApi.bossApiGet.reset();
		// make a copy
		const seasonData = deepClone(CurrentCompSeasonResponse);

		// resolve with the temp data as the response from the server
		return Promise.resolve(seasonData);
	});
 */

/**
 *
 * commands
 *
 */

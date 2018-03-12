import _ from 'underscore';
import bkHistory from 'bkHistory';
import RouteApi from 'api/RouteApi';
import RouteConstants from 'constants/RouteConstants';
import {ROUTE_STATE_CHANGE} from 'constants/RouteActionConstants';


export default (store) => next => action => {

	if(action.actionType === ROUTE_STATE_CHANGE) {
		const state = store.getState();
		const route = action.route;

		if (RouteApi.ignoreAllRoutesExcept && route !== RouteApi.ignoreAllRoutesExcept) {
			console.log(`pushRoute ignoring route ${route}, only accepting ${RouteApi.ignoreAllRoutesExcept}`);
			return next(action);
		}

		if (!state.login.currentUserId && !_.contains(RouteConstants.openRoutesWhenNotLoggedIn, route)) {
			console.log(`Attempting to access a disabled route when not logged in ${route}`);
			return next(action);
		}

		console.info(`RouteApi.pushRoute ${route}`);
		bkHistory.push(route);
	}

	return next(action);
};

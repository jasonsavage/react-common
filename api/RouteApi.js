// import modules
import bkHistory from 'bkHistory';
import {ROUTE_STATE_CHANGE} from 'constants/RouteActionConstants';

// TODO: need to add this here to break a circular dependency issue but in the future, we should be able to remove this whole file along with boundRouteUtils.js
export function routeChangeAction (route) {
	return (dispatch, getState) => {
		if (getState().route.current === route) {
			console.log(`RouteActions.routeChangeAction ignoring route ${route}, since nothing changed`);
			return;
		}
		dispatch({ actionType: ROUTE_STATE_CHANGE, route });
	};
}

/**
 * RouteApi
 * @desc
 */
class RouteApi {

	initialize (store) {
		this.store = store;
		/**
		 * This hook is used to notify the game that the route has changed
		 */
		//bkHistory.listen(location => this.store.dispatch( routeChangeAction(location.pathname) ));
	}

	ignoreAllPushRoutesExcept (route) {
		this.ignoreAllRoutesExcept = route;
	}

	endIgnoreAllPushRoutesExcept (route) {
		if (this.ignoreAllRoutesExcept === route) {
			this.ignoreAllRoutesExcept = null;
		}
	}

	/**
	 * Used to manually trigger a route change with in the app
	 * @param {string} route
	 */
	pushRoute (route) {
		//TODO: this is supporting legacy code in RouteUtils.js, when that is refactored this can also be removed
		this.store.dispatch( routeChangeAction(route) );
	}

	goBack () {
		bkHistory.goBack();
	}
}

//export module
export default new RouteApi();

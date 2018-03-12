import { ROUTE_STATE_CHANGE } from 'constants/RouteActionConstants';
import RouteConstants from 'constants/RouteConstants';
import {getCustomizationItemSlotsAction, getRoleDefList} from 'actions/CustomizationActions';
import {getCurrencyStoreItemsAction} from 'actions/prizeRoomActions';


const routeAutoLoader = store => next => action => {
	const result = next(action);

	if(action.actionType === ROUTE_STATE_CHANGE) {
		switch (action.route) {
			case RouteConstants.ROUTE_PRIZE_ROOM:
				store.dispatch( getCustomizationItemSlotsAction({isPrizeRoom: true}) );
				store.dispatch( getCurrencyStoreItemsAction() );
				break;

			case RouteConstants.ROUTE_CHARACTER_CREATION:
			case RouteConstants.ROUTE_CHARACTER_CREATION_UPDATE:
				store.dispatch( getRoleDefList() );
				store.dispatch( getCustomizationItemSlotsAction({ isCreation: true }) );
				break;

			case RouteConstants.ROUTE_CUSTOMIZATION_CHARACTER:
				store.dispatch( getCustomizationItemSlotsAction() );
				break;

			case RouteConstants.ROUTE_CUSTOMIZATION_KILL_CARD:
				store.dispatch( getCustomizationItemSlotsAction({ isKillCard: true }) );
				break;

			default:
		}
	}

	return result;
};


export default routeAutoLoader;

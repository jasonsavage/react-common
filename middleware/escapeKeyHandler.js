import SoundEffectsApi from 'api/SoundEffectsApi';
import GameApi from 'api/GameApi';
import { openLeaveLobbyModalAction } from 'actions/modalDialogActions';
import { afterIntroVideosAction } from 'actions/GameActions';
import { KEYBOARD_KEY_UP } from 'constants/KeyboardActionConstants';
import KeyboardKeyCodes from 'constants/KeyboardKeyCodes';
import RouteConstants from 'constants/RouteConstants';
import { isDoneLoading } from 'helpers/lobbyUtils';
import * as lobbyActions from 'actions/Lobby/lobbyActions';

/**
 * If the escape key is pressed, run extra code based on the apps current state
 * @param store
 */
const escapeKeyHandler = store => next => action => {

	if(action.actionType === KEYBOARD_KEY_UP) {
		const state = store.getState();

		if( state.route.current === RouteConstants.ROUTE_DEFAULT ) {
			store.dispatch( afterIntroVideosAction() );

		} else if(action.keyCode === KeyboardKeyCodes.KEYCODE_ESC) {

			store.dispatch( processEscapePress(state) );
		}
	}

	return next(action);
};

function processEscapePress (state) {
	return (dispatch) => {
		SoundEffectsApi.playCancel();

		//All dialogs are closed, checking routes
		switch (state.route.current) {
			case RouteConstants.ROUTE_HOME_NAV:
				// spectators need a way to get back into the game, since they aren't on GameLobby
				if (isDoneLoading(state.lobbyFlow.loadingState)) {
					GameApi.hideShell();
					return null;
				}

				if (state.lobbyFlow.isInLobbyFlow && state.lobbyFlow.lobby.isFindingLobby()) {
					// if searching for a match, stop
					dispatch( lobbyActions.lobbyLeaveQueue({isSentByServer: false}) );
				}

				if (state.lobbyFlow.isInLobbyFlow && state.lobbyFlow.lobby.isCustomGame) {
					dispatch( openLeaveLobbyModalAction() );
				}
				break;

			default:
				break;
		}
	};
}


export default escapeKeyHandler;

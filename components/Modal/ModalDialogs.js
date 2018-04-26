import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import immutable from 'immutable';
import {
	MODAL_ID_USER_PROFILE,
	MODAL_ID_NOTIFICATIONS,
	MODAL_ID_ADD_FRIEND,
	MODAL_ID_TUTORIAL_ITEM,
	MODAL_ID_PARTY_INVITE_RESPONSE,
	MODAL_ID_RESPOND_TO_LOBBY_INVITE,
	MODAL_ID_PARTY_ITEM_ACTION_MENU,
	MODAL_ID_CUSTOM_GAME_SETTINGS,
	MODAL_ID_CREDITS_VIDEO,
	MODAL_ID_PLAYER_LIST_OPTIONS_MODAL,
	MODAL_ID_WAITING_ON_KEYPRESS_MODAL,
	MODAL_ID_CONFIRM_MODAL,
	MODAL_ID_HOSTED_MATCH,
	MODAL_ID_REGION_SELECT,
	MODAL_ID_NEWS_ITEM,
	MODAL_ID_ACTIVATE_BOOSTS_MENU,
	MODAL_ID_FRIENDS_MENU,
	MODAL_ID_HOW_TO_PLAY} from 'constants/ModalConstants';

//modals
import ModalConfirm from 'components/Modal/ModalConfirm';
import ProfileModal from 'components/Profile/ProfileModal';
import NotificationsModal from 'components/Home/NotificationsModal';
import TutorialItemModal from 'components/Tutorials/TutorialItemModal';
import RespondToPartyInvite from 'containers/RespondToPartyInvite';
import RespondToLobbyInviteModal from 'components/Lobby/RespondToLobbyInviteModal';
import PartyItemActionsMenuModal from 'components/Party/PartyItemActionsMenuModal';
import UpdateCustomGameSettings from 'components/Lobby/UpdateCustomGameSettings';
import CreditsVideoModal from 'components/Home/CreditsVideoModal';
import PlayerListOptionsModal from 'components/Party/PlayerListOptionsModal';
import WaitingForKeyPressModal from 'components/Profile/Settings/WaitingForKeyPressModal';
import HostedMatchModal from 'components/Lobby/HostedMatchModal';
import NewsItemModal from 'components/News/NewsItemModal';
import RegionSelectModal from 'components/Lobby/RegionSelectModal';
import FriendsMenuModel from 'components/Social/FriendsMenuModel';
import FriendRequestFormModal from 'components/Social/FriendRequestFormModal';
import ActivateBoostsMenuModal from 'components/Home/ActivateBoostsMenuModal';
import HowToPlayGuideModal from 'components/HowToPlayGuideModal';


let MODAL_COMPONENTS = {
	[MODAL_ID_CONFIRM_MODAL]: ModalConfirm,
	[MODAL_ID_USER_PROFILE]: ProfileModal,
	[MODAL_ID_NOTIFICATIONS]: NotificationsModal,
	[MODAL_ID_ADD_FRIEND]: FriendRequestFormModal,
	[MODAL_ID_TUTORIAL_ITEM]: TutorialItemModal,
	[MODAL_ID_PARTY_INVITE_RESPONSE]: RespondToPartyInvite,
	[MODAL_ID_RESPOND_TO_LOBBY_INVITE]: RespondToLobbyInviteModal,
	[MODAL_ID_PARTY_ITEM_ACTION_MENU]: PartyItemActionsMenuModal,
	[MODAL_ID_CUSTOM_GAME_SETTINGS]: UpdateCustomGameSettings,
	[MODAL_ID_CREDITS_VIDEO]: CreditsVideoModal,
	[MODAL_ID_PLAYER_LIST_OPTIONS_MODAL]: PlayerListOptionsModal,
	[MODAL_ID_WAITING_ON_KEYPRESS_MODAL]: WaitingForKeyPressModal,
	[MODAL_ID_HOSTED_MATCH]: HostedMatchModal,
	[MODAL_ID_NEWS_ITEM]: NewsItemModal,
	[MODAL_ID_REGION_SELECT]: RegionSelectModal,
	[MODAL_ID_FRIENDS_MENU]: FriendsMenuModel,
	[MODAL_ID_ACTIVATE_BOOSTS_MENU]: ActivateBoostsMenuModal,
	[MODAL_ID_HOW_TO_PLAY]: HowToPlayGuideModal
};

/**
 * ModalDialogs
 * @desc This component handles hiding and showing application modal dialogs
 */
class ModalDialogs extends React.PureComponent {

	render () {
		const {activeModals, closeModalAction} = this.props;

		if (!activeModals || activeModals.size === 0) {
			return null;
		}

		return (
			<div>
				{activeModals.map((data, i) => {
					const component = MODAL_COMPONENTS[data.id];
					const modalProps = _.clone(data.props) || {};

					modalProps.key = i;
					modalProps.show = data.isOpen;
					modalProps.animation = true;
					modalProps.keyboard = false;
					modalProps.onHide = () => closeModalAction(data.id);
					// allow child components to also close modal
					modalProps.closeModalAction = () => closeModalAction(data.id);

					return React.createElement(component, modalProps);
				})}
			</div>
		);
	}
}

ModalDialogs.propTypes = {
	activeModals: PropTypes.instanceOf(immutable.List),
	closeModalAction: PropTypes.func
};

//export module
export default ModalDialogs;

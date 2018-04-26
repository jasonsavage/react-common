import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {Modal} from 'react-bootstrap';
import CommonButton from 'components/Common/CommonButton';
import GamepadSwappable from 'components/Common/GamepadSwappable';
import GamepadStore from 'stores/Utility/GamepadStore';
import {A, B} from 'constants/GamepadConstants';
import {noop} from 'helpers/bkpUtils';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Text from 'components/Common/Text';

import {
	MODAL_ID_SELECT_FRIEND,
	MODAL_ID_REPORT_PLAYER,
	MODAL_ID_LEAVE_LOBBY,
	MODAL_ID_REMATCH_WARNING,
	MODAL_ID_FIRST_LOGIN,
	MODAL_ID_CONFIRM_MODAL,
	MODAL_ID_CURRENCY_SELECT_MODAL} from 'constants/ModalConstants';

//custom confirm modals
import SelectFriendModal from 'components/Party/SelectFriendModal';
import LeaveLobbyModal from 'components/Lobby/LeaveLobbyModal';
import RematchWarningModal from 'components/Lobby/RematchWarningModal';
import FirstLoginModal from 'components/Profile/FirstLoginModal';
import ReportPlayerModal from 'components/Lobby/ReportPlayerModal';
import CurrencySelectModal from 'components/PrizeRoom/CurrencySelectModal';
import KeyboardBinder from 'components/Common/KeyboardBinder';

const MODAL_COMPONENTS = {
	[MODAL_ID_SELECT_FRIEND]: SelectFriendModal,
	[MODAL_ID_LEAVE_LOBBY]: LeaveLobbyModal,
	[MODAL_ID_REMATCH_WARNING]: RematchWarningModal,
	[MODAL_ID_FIRST_LOGIN]: FirstLoginModal,
	[MODAL_ID_REPORT_PLAYER]: ReportPlayerModal,
	[MODAL_ID_CURRENCY_SELECT_MODAL]: CurrencySelectModal
};

/**
 * ModalConfirm
 * @desc Generic Alert/Confirm style modal dialog.
 */
class ModalConfirm extends React.Component {

	constructor (props) {
		super(props);

		this.state = {};

		//fix bindings
		_.bindAll(this,
			'handleCancelClick',
			'handleConfirmClick',
			'handleEntered',
			'handleExited'
		);
	}

	componentDidUpdate () {
		// check auto close timer
		this.validateTimer();

		if (! this.isChildComponentOverridingGamepad() ) {
			this.setupGamepadMapping();
		}
	}

	componentWillUnmount () {
		this.tearDownGamepadMapping();
		this.cancelTimer();
	}

	validateTimer () {
		if (this.props.show) {
			if (this.props.countdown && !this.countdownTimer) {
				this.startTimer(this.props.countdown);
			}

		} else {
			if (this.state.currentCountdown) {
				this.setState({currentCountdown: null});
			}
			this.cancelTimer();
		}
	}

	isChildComponentOverridingGamepad () {
		//let childComponent = this.getChildComponent();
		//return (childComponent && childComponent.overrideControllerSettings && childComponent.overrideControllerSettings());
		return false;
	}

	setupGamepadMapping () {
		let gamepad = GamepadStore.getConfirmGamepadMapping(),
			self = this,
			acceptText = '',
			cancelText = '';

		if (this.props.acceptText) {
			acceptText = this.props.intl.formatMessage({ id: this.props.acceptText });
			gamepad.addButton(A, acceptText, () => self.handleConfirmClick(), 'accept');
		}

		if(this.props.cancelText) {
			cancelText = this.props.intl.formatMessage({ id: this.props.cancelText });
			gamepad.addButton(B, cancelText, () => self.handleCancelClick(), 'cancel');
		}
	}

	tearDownGamepadMapping () {
		let gamepad = GamepadStore.getConfirmGamepadMapping();
		gamepad
			.removeButton(A)
			.removeButton(B);
	}

	startTimer (currentCountdown) {
		this.countdownTimer = setInterval(() => {
			if (currentCountdown > 0) {
				currentCountdown -= 1;
				this.setState({currentCountdown});
			} else {
				this.cancelTimer();
			}
		}, 1000);
		this.setState({currentCountdown});
	}

	cancelTimer () {
		clearInterval(this.countdownTimer);
		this.countdownTimer = null;
	}

	handleEntered () {
		console.info('ModalConfirm.entered ' + this.props.customId);

		// setup gamepad unless component has override
		if ( ! this.isChildComponentOverridingGamepad() ) {
			this.setupGamepadMapping();
		}
	}

	handleExited () {
		console.info('ModalConfirm.exited ' + this.props.customId);
	}

	handleConfirmClick (data) {
		// if data is just an event object
		if(data && data.preventDefault) {
			data.preventDefault();
		}

		const {onConfirm, closeModalAction} = this.props;
		onConfirm(data);
		closeModalAction(MODAL_ID_CONFIRM_MODAL);
	}

	handleCancelClick (data) {
		// if data is just an event object
		if(data && data.preventDefault) {
			data.preventDefault();
		}

		const {onCancel, closeModalAction} = this.props;
		closeModalAction(MODAL_ID_CONFIRM_MODAL);
		onCancel(new Error('Modal canceled'), data);
	}

	renderCountdown () {
		if (!this.state.currentCountdown) {
			return null;
		}
		return (<h3>{this.state.currentCountdown} <FormattedMessage id={this.state.currentCountdown === 1 ? 'seconds_singular' : 'seconds_plural'}/></h3>);
	}

	renderCustomModalContent () {
		const {customId, show, extraProps} = this.props;
		const component = MODAL_COMPONENTS[customId];
		const props = _.extend({}, extraProps);

		// pass a reference to the confirm and cancel methods into the child component
		props.show = show;
		props.onConfirm = this.handleConfirmClick;
		props.onCancel = this.handleCancelClick;

		return React.createElement(component, props);
	}

	renderConfirm () {
		const {acceptText} = this.props;

		return acceptText ? (
			<GamepadSwappable intlId={acceptText} button={A}>
				<CommonButton
					className="w-min-150"
					sfx="accept"
					onClick={this.handleConfirmClick}>
					<Text id={acceptText} />
				</CommonButton>
			</GamepadSwappable>
		) : null;
	}

	renderCancel () {
		const {cancelText} = this.props;

		return cancelText ? (
			<GamepadSwappable intlId={cancelText} button={B}>
				<CommonButton
					className="w-min-150"
					sfx="cancel"
					onClick={this.handleCancelClick}>
					<Text id={cancelText} />
				</CommonButton>
			</GamepadSwappable>
		) : null;
	}

	canUseCustomModalContent () {
		const {customId} = this.props;
		return (customId && _.has(MODAL_COMPONENTS, customId));
	}

	render () {
		const {title, show, onCancel, content, replacements } = this.props;
		const handleBackButton = this.handleCancelClick.bind(this, {wasBackButton: true});

		if (this.canUseCustomModalContent()) {
			return this.renderCustomModalContent();
		}

		return (
			<Modal
				show={ show }
				animation={true}
				onHide={ onCancel }
				onEntered={ this.handleEntered }
				onExited={ this.handleExited }>

				<KeyboardBinder modal={true} onEscPress={ handleBackButton } />

				<Modal.Header>
					<Modal.Title>{ title ? ( <FormattedMessage id={title} /> ) : (<Text msg="Confirm Action" />) }</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{ content ? (<p className="txt-c"><FormattedMessage id={content} values={replacements || {}} /></p>) : null }
					{ this.renderCountdown() }
				</Modal.Body>

				<Modal.Footer>
					{ this.renderConfirm() }
					{ this.renderCancel() }
				</Modal.Footer>
			</Modal>
		);
	}
}

// prop type validation
ModalConfirm.propTypes = {
	acceptText: PropTypes.string,
	cancelText: PropTypes.string,
	closeModalAction: PropTypes.func,
	content: PropTypes.string,
	countdown: PropTypes.number,
	customId: PropTypes.string,
	extraProps: PropTypes.object,
	intl: intlShape,
	onCancel: PropTypes.func,
	onConfirm: PropTypes.func,
	replacements: PropTypes.object,
	show: PropTypes.bool,
	title: PropTypes.string
};

ModalConfirm.defaultProps = {
	onConfirm: noop,
	onCancel: noop,
	closeModalAction: noop
};

export default injectIntl(ModalConfirm);


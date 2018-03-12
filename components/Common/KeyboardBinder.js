// import modules
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {closeModalAction} from 'actions/modalDialogActions';
import KeyboardApi, {EVENT_KEY_DOWN, EVENT_KEY_UP} from 'api/KeyboardApi';
import {noop} from 'helpers/bkpUtils';
import KeyboardKeyCodes from 'constants/KeyboardKeyCodes';
import {connect} from 'reduxConnect';
import { isModalOpen } from 'helpers/modalUtils';


/**
 * KeyboardBinder
 * @desc
 */
class KeyboardBinder extends React.PureComponent {

	constructor (props) {
		super(props);

		_.bindAll(this, 'handleKeyDown', 'handleKeyUp');
	}

	componentDidMount () {
		KeyboardApi.on(EVENT_KEY_DOWN, this.handleKeyDown);
		KeyboardApi.on(EVENT_KEY_UP, this.handleKeyUp);
	}

	componentWillUnmount () {
		KeyboardApi.removeListener(EVENT_KEY_DOWN, this.handleKeyDown);
		KeyboardApi.removeListener(EVENT_KEY_UP, this.handleKeyUp);
	}

	handleKeyDown (evt) {
		if(this.props.$isModalOpen && !this.props.modal) {
			return; //ignore events when a modal is open
		}

		const {shiftKey, ctrlKey, altKey} = evt;
		this.props.onKeyDown(evt.keyCode, {shiftKey, ctrlKey, altKey});
	}

	handleKeyUp (evt) {
		if(this.props.$isModalOpen && !this.props.modal) {
			return; //ignore events when a modal is open
		}

		const {shiftKey, ctrlKey, altKey} = evt;
		this.props.onKeyUp(evt.keyCode, {shiftKey, ctrlKey, altKey});

		if(evt.keyCode === KeyboardKeyCodes.KEYCODE_ESC) {
			this.props.onEscPress(evt.keyCode, {shiftKey, ctrlKey, altKey});
		}
	}

	render () {
		return null;
	}
}


KeyboardBinder.propTypes = {
	$isModalOpen: PropTypes.bool, // consider private

	modal: PropTypes.bool,
	onEscPress: PropTypes.func,
	onKeyDown: PropTypes.func,
	onKeyUp: PropTypes.func
};

KeyboardBinder.defaultProps = {
	onEscPress: noop,
	onKeyDown: noop,
	onKeyUp: noop
};

// NOTE: need to do a minor connect to the redux store so we can tell if a modal dialog is open or not
function mapStateToProps (state) {
	return { $isModalOpen: isModalOpen(state) };
}

function mapDispatchToProps (dispatch) {
	return { onCloseModal: () => dispatch( closeModalAction() ) };
}

export default connect(mapStateToProps, mapDispatchToProps)(KeyboardBinder);

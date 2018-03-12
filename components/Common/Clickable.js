// import modules
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import SoundEffectsApi from 'api/SoundEffectsApi';

/**
 * Clickable
 * @desc
 */
class Clickable extends PureComponent {

	handleHover (evt) {
		if (this.props.disabled) {
			return;
		}

		SoundEffectsApi.playHover();
	}

	playClickSound () {
		if (this.props.disabled) {
			SoundEffectsApi.playError();
			return;
		}

		// play correct sound based on sfx
		// NOTE: to disable click sounds used sfx='none'
		if (this.props.sfx === 'accept') {
			//play generic click
			SoundEffectsApi.playAccept();
		} else if (this.props.sfx === 'cancel') {
			//play generic click
			SoundEffectsApi.playCancel();
		} else if (this.props.sfx !== 'none') {
			//play generic click
			SoundEffectsApi.playClick();
		}
	}

	handleClick (evt) {
		evt.preventDefault();

		this.playClickSound();

		if(this.props.onClick) {
			this.props.onClick(evt);
		}
	}

	render () {
		const otherProps = _.omit(this.props, 'children', 'sfx', 'onClick', 'onMouseEnter', 'disabled');
		return (
			<div
				{...otherProps}
				onClick={ this.handleClick.bind(this) }
				onMouseEnter={ this.handleHover(this) }>
				{ this.props.children }
			</div>
		);
	}
}

// prop type validation
Clickable.propTypes = {
	children: PropTypes.node,
	disabled: PropTypes.bool,
	onClick: PropTypes.func,
	sfx: PropTypes.string
};

//export module
export default Clickable;

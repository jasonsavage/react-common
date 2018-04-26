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

	constructor (props) {
		super(props);
		this.clickCount = 0;
	}

	componentWillUnmount () {
		clearTimeout(this.timer);
	}

	handleHover (evt) {
		if (this.props.disabled) {
			return;
		}

		SoundEffectsApi.playHover();
		if(this.props.onMouseEnter) {
			this.props.onMouseEnter(evt);
		}
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
		} else if (this.props.sfx === 'equip') {
			//play generic click
			SoundEffectsApi.playMenuEquipItem();
		} else if (this.props.sfx === 'buy') {
			//play generic click
			SoundEffectsApi.playMenuBuyItem();
		} else if (this.props.sfx === 'null') {
			//play generic click
			SoundEffectsApi.playMenuNullItem();
		} else if (this.props.sfx === 'select') {
			//play generic click
			SoundEffectsApi.playMenuSelectItem();
		} else if (this.props.sfx !== 'none') {
			//play generic click
			SoundEffectsApi.playClick();
		}
	}

	handleClick (evt) {
		evt.preventDefault();
		this.clickCount++;

		if (this.props.onClick) {
			this.playClickSound();
			this.props.onClick(evt);
		}

		// listen for double click
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			if(this.clickCount > 1 && this.props.onDoubleClick) {
				this.playClickSound();
				this.props.onDoubleClick(evt);
			}
			this.clickCount = 0;
		}, 200);
	}

	render () {
		const otherProps = _.omit(this.props, 'children', 'sfx', 'onClick', 'onDoubleClick', 'onMouseEnter', 'disabled');
		return (
			<div
				{...otherProps}
				onClick={ this.handleClick.bind(this) }
				onMouseEnter={ this.handleHover.bind(this) }>
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
	onDoubleClick: PropTypes.func,
	onMouseEnter: PropTypes.func,
	sfx: PropTypes.string
};

//export module
export default Clickable;

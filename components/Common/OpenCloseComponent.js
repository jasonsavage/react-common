// import modules
import PropTypes from 'prop-types';

import React from 'react';
import Promise from 'bluebird';

/**
 * OpenCloseComponent
 * @desc Base class for components that open and close using an animation.
 */
class OpenCloseComponent extends React.PureComponent {
	constructor (props) {
		super(props);

		this.state = {
			isClosing: false
		};
	}

	componentDidMount () {
		//animate in
		if (this.props.isOpen) {
			this.animateOpen();
		}
	}

	componentWillReceiveProps (nextProps) {
		// this will temporarily show the menu while the exit animation is played
		if (this.props.isOpen && nextProps && !nextProps.isOpen) {
			this.setState({ isClosing: true });
		}
	}

	componentDidUpdate (prevProps) {
		// check
		this.validateAnimation(prevProps);
	}

	/**
	 * Compares the value of 'isOpen' to the last props to determine if an animation should be played.
	 * @param {Object} prevProps
	 * @returns {Promise}
	 */
	validateAnimation (prevProps) {
		if (this.props.isOpen) {
			// play show animation
			if (!prevProps.isOpen) {
				return this.animateOpen();
			}
		}

		// play hide animation
		if (this.state.isClosing) {
			return this.animateClose().then(() => {
				this.setState({ isClosing: false });
			});
		}
	}

	/**
	 * Override to play an opening animation for this component.
	 * @returns {Promise}
	 */
	animateOpen () {
		return Promise.resolve();
	}

	/**
	 * Override to play a closing animation for this component.
	 * @returns {Promise}
	 */
	animateClose () {
		return Promise.resolve();
	}

	/**
	 * Override to render this component when it is in a opening, open, or closing state.
	 * @returns {XML}
	 */
	renderComponent () {
		return <div />;
	}

	render () {
		return this.props.isOpen || this.state.isClosing ? this.renderComponent() : null;
	}
}

// prop type validation
OpenCloseComponent.propTypes = {
	isOpen: PropTypes.bool
};

// prop defaults
OpenCloseComponent.defaultProps = {
	isOpen: false
};

//export module
export default OpenCloseComponent;

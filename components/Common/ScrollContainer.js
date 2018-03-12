// import modules
import PropTypes from 'prop-types';

import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import SoundEffectsApi from 'api/SoundEffectsApi';
import { throttle } from 'helpers/bkpUtils';

/**
 * ScrollContainer
 * @desc
 */
class ScrollContainer extends React.Component {
	componentDidMount () {
		// Need to add the event listener this way since ReactJS handles this event differently than what we want
		ReactDOM.findDOMNode(this).onscroll = throttle(SoundEffectsApi.playScroll, 100);
	}

	componentWillUnmount () {
		ReactDOM.findDOMNode(this).onscroll = null;
	}

	render () {
		let scrollClass = classnames('scrollable', this.props.className);
		return (
			<div ref="component" className={scrollClass}>
				{this.props.children}
			</div>
		);
	}
}

// prop type validation
ScrollContainer.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string
};

// prop defaults
ScrollContainer.defaultProps = {};

//export module
export default ScrollContainer;

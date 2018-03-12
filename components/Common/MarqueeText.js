// import modules
import PropTypes from 'prop-types';

import React from 'react';
import $ from 'jquery';

/**
 * MarqueeText
 * @desc
 */
class MarqueeText extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			isScrolling: false
		};

		this.outterWidth = 0;
		this.innerWidth = 0;
	}

	componentDidMount () {
		this.measureComponents();
	}

	componentDidUpdate (prevProps, prevState) {
		if (this.props.children !== prevProps.children) {
			this.measureComponents();
		}

		if (this.state.isScrolling && !prevState.isScrolling) {
			this.startScrolling();
		} else if (!this.state.isScrolling && prevState.isScrolling) {
			this.stopScrolling();
		}
	}

	measureComponents () {
		this.outterWidth = this.getOutter().width();
		this.innerWidth = this.calculateInnerWidth();

		let isScrolling = this.outterWidth < this.innerWidth && this.innerWidth - this.outterWidth > 5;

		if (this.state.isScrolling !== isScrolling) {
			this.setState({ isScrolling });
		}
	}

	startScrolling () {
		let offset = this.outterWidth - this.innerWidth, // negative
			speed = Math.abs(offset) / this.outterWidth * 15000,
			self = this;

		this.getInner()
			.animate({ left: offset }, speed, 'linear')
			.animate({ left: 0 }, speed, 'linear', () => {
				// loop
				self.startScrolling();
			});
	}

	stopScrolling () {
		this.getInner()
			.stop()
			.css({ left: 0 });
	}

	calculateInnerWidth () {
		// since children are only as wide as their parents unless they
		// are absolute, make absolute, take a measurement, and set back
		let pos = this.getInner().css('position'),
			measurement = this.getInner()
				.css({ position: 'absolute' })
				.width();
		//reset
		this.getInner().css({ position: pos });
		return measurement;
	}

	getOutter () {
		return $(this.refs.outter);
	}
	getInner () {
		return $(this.refs.inner);
	}

	render () {
		let style = this.state.isScrolling ? { position: 'absolute', left: 0, top: 0 } : { position: 'static' };

		return (
			<div ref="outter" className="marquee-text">
				<div ref="inner" style={style}>
					{this.props.children}
				</div>
			</div>
		);
	}
}

// prop type validation
MarqueeText.propTypes = {
	children: PropTypes.node
};

// prop defaults
MarqueeText.defaultProps = {};

//export module
export default MarqueeText;

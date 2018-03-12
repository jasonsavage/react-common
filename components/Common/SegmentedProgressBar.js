// import modules
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import classnames from 'classnames';
import _ from 'underscore';

import { r, noop } from 'helpers/bkpUtils';

/**
 * SegmentedProgressBar
 * @desc
 */
class SegmentedProgressBar extends Component {
	constructor (props) {
		super(props);

		this.state = {
			isAnimating: false,
			progress: 0,
			progressSegments: parseProgress(props.valueFrom, props.total, props.segments)
		};
	}

	componentDidMount () {
		if (this.props.valueFrom !== this.props.valueTo) {
			this.animate();
		} else {
			this.props.onAnimationComplete();
		}
	}

	componentWillReceiveProps (nextProps) {
		if (this.props.valueTo !== nextProps.valueTo || this.props.valueFrom !== nextProps.valueFrom) {
			this.setState({ progressSegments: parseProgress(nextProps.valueFrom, nextProps.total, nextProps.segments) });
		} else {
			nextProps.onAnimationComplete();
		}
	}

	componentDidUpdate (prevProps, prevState) {
		if (!this.state.isAnimating && this.state.progressSegments !== prevState.progressSegments) {
			//start animating
			this.animate();
		}
	}

	componentWillUnmount () {
		this.$component.stop(true, true);
	}

	animate () {
		const { valueFrom, valueTo, duration, total, segments, onAnimationComplete } = this.props;

		//set state to animating
		this.setState({ isAnimating: true }, () => {
			// animate score from prev score to current score
			this.$component
				.animateValue(valueFrom, valueTo, {
					duration,
					easing: 'linear',
					step: (n, value) => {
						const progress = getProgressPercent(value, total, segments);
						if (this.state.progress !== progress) {
							this.setState({
								progress,
								progressSegments: parseProgress(value, total, segments)
							});
						}
					}
				})
				.promise()
				.then(() => {
					this.setState({ isAnimating: false }, onAnimationComplete);
				});
		});
	}

	renderSegments () {
		const { progressSegments } = this.state;
		return progressSegments.map((opacity, i) => {
			return <div key={i} className="bar-seg" style={{ opacity }} />;
		});
	}

	render () {
		const { isLocked } = this.props;
		return (
			<div className={classnames('segmented-progress-bar', { locked: isLocked })} ref={r(this, '$component')}>
				<div className="bar">{!isLocked ? this.renderSegments() : null}</div>
			</div>
		);
	}
}

function getProgressPercent (value, total, segments) {
	return value / total * segments;
}

function parseProgress (value, total, segments) {
	const progress = getProgressPercent(value, total, segments);
	return _.times(segments, n => {
		return progress > n ? (parseInt(progress, 10) === n ? progress % 1 : 1) : 0;
	});
}

// prop type validation
SegmentedProgressBar.propTypes = {
	duration: PropTypes.number,
	isLocked: PropTypes.bool,
	onAnimationComplete: PropTypes.func,
	segments: PropTypes.number,
	total: PropTypes.number,
	valueFrom: PropTypes.number,
	valueTo: PropTypes.number
};

// prop defaults
SegmentedProgressBar.defaultProps = {
	duration: 3000,
	onAnimationComplete: noop,
	segments: 10,
	total: 10,
	valueFrom: 0,
	valueTo: 5
};

//export module
export default SegmentedProgressBar;

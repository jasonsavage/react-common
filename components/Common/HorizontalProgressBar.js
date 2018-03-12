// import modules
import PropTypes from 'prop-types';

import React from 'react';
import classnames from 'classnames';
import $ from 'jquery-easing';
import OpenCloseComponent from 'components/Common/OpenCloseComponent';
import SoundEffectsApi from 'api/SoundEffectsApi';
import { clamp, noop } from 'helpers/bkpUtils';
import Promise from 'bluebird';

/**
 * HorizontalProgressBar
 * @desc
 */
class HorizontalProgressBar extends OpenCloseComponent {
	componentDidMount () {
		if (this.props.total) {
			this.animateOpen();
		}
	}

	componentDidUpdate (prevProps) {
		super.componentDidUpdate(prevProps);

		if (this.props.total !== prevProps.total || this.props.value !== prevProps.value) {
			this.animateOpen();
		}
	}

	componentWillUnmount () {
		//clear animations
		this.fill().stop(true, true);
		this.value().stop(true, true);
	}

	// Override
	animateOpen () {
		let barValueStart = parseInt(this.props.start, 10),
			barValue = parseInt(this.props.value, 10),
			barWidthStart = this.getProgress(barValueStart),
			barWidth = this.getProgress(barValue),
			speed = parseInt(this.props.speed, 10), //500 + (((barWidth-barWidthStart)/100) * 1000),
			easing = barWidth === 100 ? 'linear' : 'swing';

		if (this.props.disableAnimation) {
			this.fill().css({ width: barWidth + '%' });
			this.value().text(this.formatChildren(barValue));
			this.props.onBarAnimationStep(barValue);
			return;
		}

		/**
		 * Animations
		 */
		this.fill()
			.css({ width: barWidthStart + '%' })
			.delay(300)
			.animate(
				{ width: barWidth + '%' },
				{
					duration: speed,
					easing: easing,
					complete: this.props.onBarAnimationEnd
				}
			);

		this.value()
			.delay(300)
			.animateValue(barValueStart, barValue, {
				duration: speed,
				easing: easing,
				step: n => {
					if (this.props.sfx) {
						this.props.sfxTallySound();
					}
					if (this.props.className === 'progress-earned bonus') {
						console.log(`HorizontalProgressBar step ${n}`);
					}
					this.value().text(this.formatChildren(Math.floor(n)));
					this.props.onBarAnimationStep(n);
				},
				complete: () => {
					this.value().text(this.formatChildren(barValue));
				}
			});
	}

	// Override
	animateClose () {
		return Promise.resolve();
	}

	getProgress (value) {
		let perc = value / this.props.total * 100;
		return isNaN(perc) ? 0 : clamp(parseInt(perc, 10), 0, 100); // keep progress between 1 and 100
	}

	formatChildren (value) {
		return this.props.children.replace('{percent}', this.getProgress(value) + '%').replace('{value}', parseInt(value, 10));
	}

	// accessors
	component () {
		return $(this.refs.component);
	}
	fill () {
		return $(this.refs.fill);
	}
	value () {
		return $(this.refs.value);
	}

	// Override
	renderComponent () {
		let componentClass = classnames('progress', this.props.className);
		return (
			<div ref="component" className={componentClass}>
				<div className="bar">
					<div ref="fill" className="fill" style={{ width: '0%' }} />
				</div>
				<div ref="value" className="value">
					{this.formatChildren(this.props.start)}
				</div>
			</div>
		);
	}
}

// prop type validation
HorizontalProgressBar.propTypes = {
	children: PropTypes.string,
	className: PropTypes.string,
	disableAnimation: PropTypes.bool,
	onBarAnimationEnd: PropTypes.func,
	onBarAnimationStep: PropTypes.func,
	sfx: PropTypes.bool,
	sfxTallySound: PropTypes.func,
	speed: PropTypes.number,
	start: PropTypes.number,
	total: PropTypes.number,
	value: PropTypes.number
};

// prop defaults
HorizontalProgressBar.defaultProps = {
	children: '',
	disableAnimation: false,
	start: 0,
	speed: 1000,
	onBarAnimationEnd: noop,
	onBarAnimationStep: noop,
	sfx: true,
	sfxTallySound: SoundEffectsApi.playGameModeEXPScroll
};

//export module
export default HorizontalProgressBar;

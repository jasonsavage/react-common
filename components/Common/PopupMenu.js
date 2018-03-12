// import modules
import PropTypes from 'prop-types';

import React from 'react';
import $ from 'jquery-easing';
import _ from 'underscore';
import classnames from 'classnames';
import { noop } from 'helpers/bkpUtils';
import OpenCloseComponent from 'components/Common/OpenCloseComponent';
//import SoundEffectsApi from 'api/SoundEffectsApi';

const MENU_HIDE_DELAY = 800;
const MENU_INACTIVITY_HIDE_DELAY = 3000;

// custom easing
$.easing.easeOutBackFast = function (x, t, b, c, d) {
	return $.easing.easeOutBack(x, t, b, c, d, 1);
};

/**
 * PopupMenu
 * @desc
 */
class PopupMenu extends OpenCloseComponent {
	constructor (props) {
		super(props);

		this.timerAutoHide = null;
		this.isAnimating = false;

		_.bindAll(this, 'handleMouseEnter', 'handleMouseLeave');
	}

	componentDidUpdate (prevProps) {
		super.componentDidUpdate(prevProps);

		if (!this.isAnimating && this.props.isOpen && this.props.popupDirection === 'bottom') {
			// make sure the wrapper is the correct size if the child size changes
			this.getMenuWrap().css({
				height: this.getMenu().outerHeight()
			});
		}
	}

	componentWillUnmount () {
		clearTimeout(this.timerAutoHide);
		this.getMenu().stop(true, true);
	}

	/** @override */
	animateOpen () {
		//TODO: play show sound

		//start timer to track if the user is actually using the menu
		this.startAutoHideDelay(MENU_INACTIVITY_HIDE_DELAY);

		let isBottom = this.props.popupDirection === 'bottom';
		let hideDistance = isBottom ? this.getMenu().outerHeight() : this.getMenu().outerWidth();

		// set wrapper to the height of the menu + 20 for animation bounce
		if (isBottom) {
			this.getMenuWrap().css({
				overflow: 'hidden',
				height: hideDistance
			});
		}

		//animate
		this.isAnimating = true;
		return this.getMenu()
			.stop()
			.css({ opacity: 0, [this.props.popupDirection]: isBottom ? -hideDistance : 0 })
			.animate(
				{ opacity: 1, [this.props.popupDirection]: isBottom ? 0 : -hideDistance },
				{
					duration: 300,
					easing: 'easeOutBackFast',
					complete: () => {
						this.getMenuWrap().css({ overflow: 'visible' });
						this.isAnimating = false;
						if (this.props.onOpenAnimationComplete) {
							this.props.onOpenAnimationComplete();
						}
					}
				}
			)
			.promise();
	}

	/** @override */
	animateClose () {
		//TODO: play hide sound

		this.getMenuWrap().css({ overflow: 'hidden' });

		//animate
		this.isAnimating = true;
		return this.getMenu()
			.stop()
			.animate(
				{ [this.props.popupDirection]: -50, opacity: 0 },
				{
					duration: 200,
					complete: () => {
						this.isAnimating = false;
					}
				}
			)
			.promise();
	}

	handleMouseEnter () {
		clearTimeout(this.timerAutoHide);
	}

	handleMouseLeave () {
		this.startAutoHideDelay(MENU_HIDE_DELAY);
	}

	startAutoHideDelay (delay) {
		clearTimeout(this.timerAutoHide);

		this.timerAutoHide = setTimeout(() => {
			if (this.props.isOpen && this.props.onAutoClose) {
				this.props.onAutoClose();
			}
		}, delay);
	}

	getMenuWrap () {
		return $(this.refs.wrapper);
	}

	getMenu () {
		return $(this.refs.menu);
	}

	/** @override */
	renderComponent () {
		return (
			<div ref="wrapper" className={classnames('popup-menu-wrapper', this.props.className)} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
				<div ref="menu" className="popup-menu">
					{this.props.children}
				</div>
			</div>
		);
	}
}

// prop type validation
PopupMenu.propTypes = {
	children: PropTypes.node,
	isOpen: PropTypes.bool,
	onAutoClose: PropTypes.func,
	onOpenAnimationComplete: PropTypes.func,
	popupDirection: PropTypes.string
};

PopupMenu.defaultProps = {
	onOpenAnimationComplete: noop,
	popupDirection: 'bottom'
};

//export module
export default PopupMenu;

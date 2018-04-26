import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Button } from 'react-bootstrap';
import _ from 'underscore';
import RouteApi from 'api/RouteApi';
import Clickable from 'components/Common/Clickable';
import {noop} from 'helpers/bkpUtils';


// bootstrap styles
export const STYLE_PRIMARY = 'primary';
export const STYLE_SECONDARY = 'secondary';
export const STYLE_SUCCESS = 'success';
export const STYLE_DANGER = 'danger';
export const STYLE_LINK = 'link';

// bootstrap sizes
export const SIZE_LARGE = 'large';
export const SIZE_SMALL = 'small';
export const SIZE_XSMALL = 'xsmall';

/**
 * CommonButton
 * @desc Base button class for all buttons in application
 */

//module definition
class CommonButton extends Clickable {

	// @override
	handleClick (e) {
		e.preventDefault();

		this.playClickSound();

		if (this.props.disabled) {
			return;
		}

		if (this.props.link) {
			RouteApi.pushRoute(this.props.link);

		} else {
			this.props.onClick(e);
		}
	}

	render () {
		const {children, className, iconClass, iconAfter, disabled} = this.props;
		const otherProps = _.omit(this.props, 'children', 'onClick', 'onMouseEnter', 'className', 'intlId', 'link', 'sfx', 'iconClass', 'iconAfter');
		const icon = iconClass ? (
			<span className={ classnames('icon', iconClass, {
				'm-l10': children && iconAfter,
				'm-r10': children && !iconAfter}) } />
		) : null;
		const extraClasses = classnames(className, {
			'btn-icon': (!!iconClass),
			'btn-disabled': disabled
		});

		return (
			<Button
				className={ extraClasses }
				onClick={ this.handleClick.bind(this) }
				onMouseEnter={ this.handleHover.bind(this) }
				{...otherProps}>
				{ icon && !iconAfter ? icon : null }
				{ children }
				{ icon && iconAfter ? icon : null }
			</Button>
		);
	}
}
// prop type validation
CommonButton.propTypes = {
	bsSize: PropTypes.string,
	bsStyle: PropTypes.string,
	children: PropTypes.node,
	className: PropTypes.string,
	disabled: PropTypes.bool,
	iconAfter: PropTypes.bool,
	iconClass: PropTypes.string,
	link: PropTypes.string,
	onClick: PropTypes.func,
	onMouseEnter: PropTypes.func,
	type: PropTypes.string
};

//defaults
CommonButton.defaultProps = {
	type: 'button',
	onMouseEnter: noop,
	onClick: noop,
};

//export module
export default CommonButton;

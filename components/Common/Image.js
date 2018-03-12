// import modules
import PropTypes from 'prop-types';

import React from 'react';
import classnames from 'classnames';

export const CONSTRAIN_HEIGHT = 'height';

/**
 * Image
 * @desc
 */
class Image extends React.PureComponent {
	render () {
		let style = { backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : 'transparent' },
			imgStyle = { width: '100%', height: 'auto' };

		if (this.props.width) {
			style.width = this.props.width + 'px';
		}
		if (this.props.height) {
			style.height = this.props.height + 'px';
		}

		if (this.props.constrain === CONSTRAIN_HEIGHT) {
			imgStyle = { height: '100%', width: 'auto' };
		}

		return (
			<div className={classnames('image', this.props.className)} style={style}>
				<img alt="" src={this.props.src} style={imgStyle} />
				{this.props.children}
			</div>
		);
	}
}

// prop type validation
Image.propTypes = {
	backdrop: PropTypes.bool,
	backgroundColor: PropTypes.string,
	children: PropTypes.node,
	className: PropTypes.string,
	constrain: PropTypes.string,
	height: PropTypes.number,
	src: PropTypes.string.isRequired,
	width: PropTypes.number
};

// prop defaults
Image.defaultProps = {
	constrain: 'width'
};

//export module
export default Image;

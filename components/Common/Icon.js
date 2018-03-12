// import modules
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


/**
 * Icon
 * @desc
 */
class Icon extends PureComponent {

	render () {
		return (
			<span className={ classnames('icon', this.props.className)} />
		);
	}
}

// prop type validation
Icon.propTypes = {
	className: PropTypes.string
};

//export module
export default Icon;

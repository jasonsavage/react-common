/* eslint-disable react/no-multi-comp, react/prop-types */
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import classnames from 'classnames';


/**
 * Panel
 * @desc
 */
class Panel extends PureComponent {

	render () {
		let {className, children} = this.props,
			otherProps = _.omit(this.props, 'children', 'className'),
			klass = classnames('panel', className);

		return (
			<div className={klass} {...otherProps}>
				{ children }
			</div>
		);
	}
}

// prop type validation
Panel.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string
};

Panel.Header = ({children}) => (
	<div className="panel-header">
		{ children }
	</div>
);

Panel.Body = ({children}) => (
	<div className="panel-body">
		{ children }
	</div>
);

Panel.Footer = ({children}) => (
	<div className="panel-footer">
		{ children }
	</div>
);

//export module
export default Panel;

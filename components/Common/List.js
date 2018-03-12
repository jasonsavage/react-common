// import modules
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import React, {Component} from 'react';
import _ from 'underscore';
import classnames from 'classnames';
import { noop } from 'helpers/bkpUtils';


/**
 * List
 * @desc
 */
class List extends Component {

	hasNoData () {
		const {dataProvider} = this.props;
		return (!dataProvider) ||
			(_.isArray(dataProvider) && !dataProvider.length) ||
			(Immutable.List.isList(dataProvider) && !dataProvider.size);
	}

	renderListItems () {
		let { dataProvider, itemRenderer, itemClassName, activeItem, onItemClick, onItemMouseEnter } = this.props;

		if (this.hasNoData()) {
			return (
				<li className={ classnames('listitem empty', itemClassName) }>
					{ itemRenderer(null) }
				</li>
			);
		}

		return dataProvider.map((item, index) => {
			let itemClass = classnames('listitem', itemClassName, { active: activeItem && activeItem === item });
			let otherProps = {};
			if (onItemClick) {
				otherProps.onClick = () => {
					onItemClick(item);
				};
			}
			if (onItemMouseEnter) {
				otherProps.onMouseEnter = () => {
					onItemMouseEnter(item);
				};
			}

			return (
				<li key={index} className={itemClass} {...otherProps}>
					{itemRenderer(item, index)}
				</li>
			);
		});
	}

	render () {
		let { className, horizontal } = this.props;
		return <ul className={classnames('list', className, { horizontal })}>{this.renderListItems()}</ul>;
	}
}

// prop type validation
List.propTypes = {
	activeItem: PropTypes.object,
	className: PropTypes.string,
	dataProvider: PropTypes.oneOfType([PropTypes.array, PropTypes.instanceOf(Immutable.List)]),
	horizontal: PropTypes.bool,
	itemClassName: PropTypes.string,
	itemRenderer: PropTypes.func,
	onItemClick: PropTypes.func,
	onItemMouseEnter: PropTypes.func
};

// prop defaults
List.defaultProps = {
	dataProvider: [],
	itemRenderer: noop
};

//export module
export default List;

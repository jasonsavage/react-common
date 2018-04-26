// import modules
import PropTypes from 'prop-types';
import immutable from 'immutable';
import React, {Component} from 'react';
import _ from 'underscore';
import classnames from 'classnames';


/**
 * List
 * @desc
 */
class List extends Component {

	hasNoData () {
		const {dataProvider} = this.props;
		return (!dataProvider) ||
			(_.isArray(dataProvider) && !dataProvider.length) ||
			(immutable.List.isList(dataProvider) && !dataProvider.size);
	}

	limitItems () {
		const {limit, dataProvider} = this.props;
		const listItems = dataProvider.size ? dataProvider : new immutable.List(dataProvider);
		return (limit > 0) ? listItems.take(limit) : listItems;
	}

	renderListItems () {
		let { itemRenderer, itemClassName, activeItem, onItemClick, onItemMouseEnter } = this.props;
		const listItems = this.limitItems();

		if (!listItems.size) {
			return (
				<li className={ classnames('listitem empty', itemClassName) }>
					{ itemRenderer(null) }
				</li>
			);
		}

		return listItems.map((item, index) => {
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
		let { className, horizontal, striped } = this.props;
		return <ul className={classnames('list', className, { horizontal, striped })}>{this.renderListItems()}</ul>;
	}
}

// prop type validation
List.propTypes = {
	activeItem: PropTypes.object,
	className: PropTypes.string,
	dataProvider: PropTypes.oneOfType([PropTypes.array, PropTypes.instanceOf(immutable.List)]),
	horizontal: PropTypes.bool,
	itemClassName: PropTypes.string,
	itemRenderer: PropTypes.func,
	limit: PropTypes.number,
	onItemClick: PropTypes.func,
	onItemMouseEnter: PropTypes.func,
	striped: PropTypes.bool
};

// prop defaults
List.defaultProps = {
	dataProvider: [],
	itemRenderer: (item) => item
};

//export module
export default List;

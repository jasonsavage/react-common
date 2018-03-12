/* eslint-disable react/no-multi-comp */
// import modules
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import classnames from 'classnames';
import _ from 'underscore';
import { FormattedMessage } from 'react-intl';

/**
 * FlexTable
 * @desc
 */
class FlexTable extends Component {
	render () {
		const componentClass = classnames('flex-table', this.props.className, {
			striped: this.props.striped,
			'striped-columns': this.props.stripedColumns,
			'row-hover': this.props.rowHover,
			'row-select': this.props.rowSelect
		});

		return <div className={componentClass}>{this.props.children}</div>;
	}
}

/**
 * <tr />
 */
class Row extends Component {
	render () {
		const otherProps = _.omit(this.props, 'children', 'className', 'header', 'intl');
		return (
			<div className={classnames('flex-table-row', this.props.className, { header: this.props.header })} {...otherProps}>
				{this.props.children}
			</div>
		);
	}
}
Row.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	header: PropTypes.bool
};

/**
 * <td />
 */
class Column extends Component {
	render () {
		const otherProps = _.omit(this.props, 'children', 'className', 'content', 'icon', 'intl', 'intlId', 'intlValues');
		let content = this.props.content || this.props.content === 0 ? this.props.content : this.props.children,
			icon = null;

		if (this.props.intlId) {
			content = <FormattedMessage id={this.props.intlId} values={this.props.intlValues} />;
		}
		if (this.props.icon) {
			icon = <span className={this.props.icon + ' m-r5'} />;
		}

		return (
			<div className={classnames('flex-table-column', this.props.className)} {...otherProps}>
				{icon}
				{content}
			</div>
		);
	}
}
Column.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	icon: PropTypes.string,
	intlId: PropTypes.string,
	intlValues: PropTypes.object
};

FlexTable.Row = Row;
FlexTable.Column = Column;

// prop type validation
FlexTable.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	rowHover: PropTypes.bool,
	rowSelect: PropTypes.bool,
	striped: PropTypes.bool,
	stripedColumns: PropTypes.bool
};

//export module
export default FlexTable;

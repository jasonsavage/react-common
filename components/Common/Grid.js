// import modules
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import classnames from 'classnames';
import immutable from 'immutable';


/**
 * Grid
 * @desc
 */
class Grid extends PureComponent {

	renderEmpty () {
		const { rowClassName, itemClassName, itemRenderer } = this.props;

		return (
			<ul className={ classnames('grid-row empty', rowClassName) }>
				<li className={ classnames('grid-item empty', itemClassName) }>{ itemRenderer(null, 0, 0) }</li>
			</ul>
		);
	}

	renderColumns (rowData, rowIndex) {
		const { itemRenderer, itemClassName } = this.props;

		if( !rowData || !rowData.size) {
			return null;
		}

		return rowData.map((item, colIndex) => {

			const itemClass = classnames('grid-item', itemClassName);

			return (
				<li key={`${rowIndex}:${colIndex}`} className={itemClass}>
					{ itemRenderer(item, rowIndex, colIndex) }
				</li>
			);
		});
	}

	renderRows () {
		const { dataProvider, rowClassName } = this.props;

		if (!dataProvider || !dataProvider.size) {
			return this.renderEmpty();
		}

		return dataProvider.map((item, index) => {

			const rowClass = classnames('grid-row', rowClassName);

			return (
				<ul key={ index } className={ rowClass }>
					{ this.renderColumns(item, index) }
				</ul>
			);
		});
	}

	render () {
		const { className } = this.props;
		return (
			<div className={ classnames('grid', className) }>
				{ this.renderRows() }
			</div>
		);
	}
}

// prop type validation
Grid.propTypes = {
	className: PropTypes.string,
	dataProvider: PropTypes.instanceOf(immutable.List),
	itemClassName: PropTypes.string,
	itemRenderer: PropTypes.func,
	rowClassName: PropTypes.string
};

// prop defaults
Grid.defaultProps = {
	dataProvider: new immutable.List(),
	itemRenderer: (item) => item
};

//export module
export default Grid;
